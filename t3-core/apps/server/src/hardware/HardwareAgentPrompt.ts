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
      "<hardware_context>",
      `Toolchain: ${toolchainName}`,
      `Device State: ${hardwareState.replace(/\n/g, " | ")}`,
      "</hardware_context>",
      "<embedded_rules>",
      `- Ask user for exact board model if "Generic/Unknown".`,
      `- Use \`constexpr int\` or \`#define\` for pins. Use non-blocking delays (e.g. \`millis()\`).`,
      `- Default baud: 115200.`,
      hasToolchain
        ? `- Toolchain: ${toolchainInstructions.replace(/\n\s*-\s*/g, " ").replace(/\n/g, " ")}`
        : `- Ask user to pick a toolchain (Arduino CLI or PlatformIO) before scaffolding.`,
      `- Auto-scaffold project files if missing.`,
      `- Auto-search online for datasheets/pinouts.`,
      `- Persona: Expert embedded engineer. Be concise.`,
      "</embedded_rules>",
    ].join("\n");
  });
}
