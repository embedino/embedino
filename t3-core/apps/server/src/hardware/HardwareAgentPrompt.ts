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
      hardwareState = "No devices detected.";
    } else if (devices.length === 1) {
      const d = devices[0]!;
      hardwareState = `Port: ${sanitize(d.portDisplayName)} | FQBN: ${sanitize(d.fqbn)} | Chip: ${sanitize(d.driverChip)}`;
    } else {
      hardwareState = devices
        .map((d) => `- ${sanitize(d.portDisplayName)} | FQBN: ${sanitize(d.fqbn)}`)
        .join("\n");
    }

    // ── Toolchain Resolution ──────────────────────────────────────────
    const hasToolchain = activeToolchain !== undefined;
    const isPio = activeToolchain === "platformio";
    const arduinoBin = binaryPaths.arduinoCliPath
      ? `"${binaryPaths.arduinoCliPath}"`
      : "arduino-cli";
    const pioBin = binaryPaths.platformioPath ? `"${binaryPaths.platformioPath}"` : "pio";

    const toolchainInstructions = !hasToolchain
      ? `If no toolchain is selected, default to PlatformIO or Arduino CLI based on the workspace files. If empty, default to Arduino CLI.`
      : !isPio
        ? `Use Arduino CLI. Create a .ino file matching the directory name. Commands: compile (\`${arduinoBin} compile --fqbn <fqbn> <dir>\`), upload (\`${arduinoBin} upload -p <port> --fqbn <fqbn> <dir>\`), monitor (\`${arduinoBin} monitor -p <port> -c baudrate=115200\`).`
        : `Use PlatformIO. Create platformio.ini ([env:<board>], framework=arduino, monitor_speed=115200) and src/main.cpp. Commands: \`${pioBin} run\`, \`${pioBin} run -t upload\`, \`${pioBin} device monitor -b 115200\`.`;

    return [
      "[EMBEDINO HARDWARE CONTEXT]",
      `Toolchain: ${hasToolchain ? activeToolchain : "None"}`,
      `Devices:\n${hardwareState}`,
      "",
      "Rules:",
      "1. Make reasonable assumptions for board variants and GPIO pins via web search if unknown. Do NOT block the user by asking questions unless absolutely necessary.",
      "2. Write production-ready, non-blocking code (e.g. millis() over delay()). Use constants for GPIO pins.",
      "3. Default serial baud rate is 115200.",
      `4. ${toolchainInstructions}`,
      "5. Automatically scaffold full projects if the workspace is empty.",
      "6. Be direct and professional. Output code and configuration over explanations.",
    ].join("\n");
  });
}
