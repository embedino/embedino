import * as Effect from "effect/Effect";
import { scanDevices } from "./DeviceService.ts";
import { getToolchainBinaryPaths } from "../toolchain/ToolchainService.ts";
import type { HardwareDevice } from "@t3tools/contracts";

/**
 * Builds a hardware-aware system prompt block that is injected into every
 * provider adapter (Claude, Codex, Cursor, Grok, OpenCode).
 *
 * The prompt is constructed from live device state, the user's active
 * toolchain selection, and the resolved binary paths — ensuring the AI
 * never hallucinates pin assignments, board configurations, toolchain
 * files, or relies on the system PATH.
 */
export function buildHardwareSystemPrompt(
  activeToolchain?: "platformio" | "arduino",
  activeDeviceId?: string,
): Effect.Effect<string> {
  return Effect.gen(function* () {
    const allDevices: HardwareDevice[] = yield* scanDevices();
    const binaryPaths = yield* getToolchainBinaryPaths();
    let devices = allDevices;

    const sanitize = (str: string | undefined | null): string => {
      if (!str) return "Unknown";
      return str.replace(/[^\w\s.,:;()\-/\\]/g, "");
    };

    if (activeDeviceId) {
      devices = allDevices.filter((d) => d.id === activeDeviceId);
    }

    // ── Hardware State ────────────────────────────────────────────────
    let hardwareState: string;
    if (devices.length === 0) {
      hardwareState = activeDeviceId
        ? "The previously selected hardware device is no longer connected."
        : "No hardware devices currently detected.";
    } else if (devices.length === 1) {
      const d = devices[0]!;
      const boardStr = d.boardName
        ? `${sanitize(d.boardName)} (FQBN: ${sanitize(d.fqbn)})`
        : "Generic/Unknown Board";
      hardwareState = [
        "Selected Device:",
        `  Port: ${sanitize(d.portDisplayName)}`,
        `  Board: ${boardStr}`,
        `  Chip: ${sanitize(d.driverChip)}`,
      ].join("\n");
    } else {
      hardwareState =
        "Multiple Devices Connected:\n" +
        devices
          .map((d) => {
            const boardStr = d.boardName
              ? `${sanitize(d.boardName)} (FQBN: ${sanitize(d.fqbn)})`
              : "Generic/Unknown Board";
            return `  - ${sanitize(d.portDisplayName)} | ${boardStr}`;
          })
          .join("\n");
    }

    // ── Toolchain Resolution ──────────────────────────────────────────
    const hasToolchain = activeToolchain !== undefined;
    const toolchainName = !hasToolchain
      ? "Not Selected"
      : activeToolchain === "arduino"
        ? "Arduino CLI"
        : "PlatformIO";

    // Resolve the full binary path so the agent uses it directly
    const arduinoBin = binaryPaths.arduinoCliPath
      ? `"${binaryPaths.arduinoCliPath}"`
      : "arduino-cli";
    const pioBin = binaryPaths.platformioPath ? `"${binaryPaths.platformioPath}"` : "pio";

    const toolchainInstructions = !hasToolchain
      ? `The user has not selected an active build toolchain. Before generating any project files, you MUST ask the user: "Which toolchain would you like to use — Arduino CLI or PlatformIO?" Do NOT assume either toolchain.`
      : activeToolchain === "arduino"
        ? [
            "Project Structure (Arduino CLI):",
            "  - Generate a `.ino` sketch file named identically to its parent folder (e.g. `BlinkLED/BlinkLED.ino`).",
            "  - Do NOT manually add `#include <Arduino.h>` in `.ino` files — the Arduino build system injects it automatically.",
            "  - Do NOT generate `platformio.ini` or `src/main.cpp`.",
            "  - For external libraries, instruct the user to run `" +
              arduinoBin +
              " lib install <library>` or include a comment listing required libraries.",
            "  - For compilation: `" +
              arduinoBin +
              " compile --fqbn <board_fqbn> <sketch_directory>` (You MUST specify the sketch directory if it is not the workspace root!)",
            "  - For uploading: `" +
              arduinoBin +
              " upload -p <port> --fqbn <board_fqbn> <sketch_directory>`",
            "  - For serial monitor: `" +
              arduinoBin +
              " monitor -p <port> --config baudrate=115200`",
          ].join("\n")
        : [
            "Project Structure (PlatformIO):",
            "  - `platformio.ini` at the project root with an `[env:<board>]` section matching the detected board FQBN, `framework = arduino` (unless explicitly requested otherwise), and `monitor_speed = 115200`.",
            "  - `src/main.cpp` containing the requested code, or a minimal boilerplate (`#include <Arduino.h>`, `void setup()`, `void loop()`) if no specific code was requested.",
            "  - Declare library dependencies via `lib_deps` in `platformio.ini` (e.g. `lib_deps = adafruit/Adafruit MPU6050`).",
            "  - Do NOT generate `.ino` sketch files.",
            "  - For compilation: `" + pioBin + " run`",
            "  - For uploading: `" + pioBin + " run --target upload`",
            "  - For serial monitor: `" + pioBin + " device monitor --baud 115200`",
          ].join("\n");

    const nonBlockingAdvice =
      "Prefer non-blocking patterns. Under the `arduino` framework use `millis()` instead of `delay()`. Under `espidf` use `vTaskDelay()`. Under `zephyr` use `k_sleep()`. Default to the `arduino` framework unless the user explicitly requests another.";

    return [
      "[EMBEDINO HARDWARE CONTEXT]",
      `Active Toolchain: ${toolchainName}`,
      `Hardware State:\n${hardwareState}`,
      "",
      "Embedded Engineering Rules:",
      `1. Unknown Boards: If the board is "Generic/Unknown Board" or multiple devices are connected without a clear selection, you MUST stop and ask the user to clarify the exact board model before writing any configuration files or hardcoding pins.`,
      `2. Coding Standards: NEVER hardcode GPIO pin numbers — always declare them with \`constexpr int\` or \`#define\`. ${nonBlockingAdvice} Only include libraries verified as compatible with the connected board architecture.`,
      `3. Serial Communication: Default baud rate is 115200 for both \`Serial.begin()\` and the toolchain monitor configuration. Only use a different rate if the user explicitly requests it.`,
      `4. ${toolchainInstructions}`,
      `5. Proactive Scaffolding: When the user says "build this", "make a project", "blink an LED", or gives any action-oriented instruction, and the workspace has no existing project files, you MUST automatically scaffold the full project structure using the Active Toolchain above. Use your file-creation tools to write all necessary files without asking for permission.`,
      `6. Module Variant Confirmation: Before writing any board-specific configuration (partition tables, PSRAM flags, flash size settings), confirm the exact module variant with the user (e.g. "ESP32-S3-WROOM-1-N16R8" or "ESP32-C3-MINI-1-H4"). USB detection identifies the chip family but cannot distinguish module variants sharing the same VID:PID. One brief confirmation per session is sufficient.`,
      `7. Persona: You are assisting a professional embedded engineer. Be precise and direct. Output production-ready code and configuration. Do not explain basic C++ or hardware concepts unless explicitly asked.`,
    ].join("\n");
  });
}
