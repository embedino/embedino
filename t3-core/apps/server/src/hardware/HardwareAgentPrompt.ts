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

    const circuitWiringRules = [
      "<circuit_wiring_rules>",
      "When the user asks for wiring diagrams, pinouts, circuit connections, or component hookups:",
      "1. You MUST generate a ```wiring code block containing a valid JSON object matching the Embedino Circuit Wiring Schema.",
      "2. Do NOT output markdown pinout tables alone — always include the ```wiring JSON block so Embedino can render the Interactive Wiring Viewer and dynamic diagrams.",
      "3. Schema Format:",
      "   {",
      '     "title": "Circuit Title (string, required)",',
      '     "description": "Short explanation (string, optional)",',
      '     "components": [',
      '       { "id": "unique_id", "name": "Human Readable Name", "type": "microcontroller"|"sensor"|"display"|"actuator"|"module"|"passive"|"ic"|"power"|"communication"|"other", "pins": ["PIN1", "PIN2"], "operatingVoltage": "3.3V", "notes": "e.g. I2C 0x76" }',
      "     ],",
      '     "connections": [',
      '       { "from": { "componentId": "mcu_id", "pin": "PIN1" }, "to": { "componentId": "sensor_id", "pin": "PIN2" }, "signalType": "power"|"ground"|"i2c"|"spi"|"uart"|"gpio"|"digital"|"analog"|"pwm"|"other", "signal": "I2C SDA", "wireColor": "red"|"black"|"yellow"|"blue"|"green"|"white"|"orange"|"purple", "notes": "optional notes" }',
      "     ],",
      '     "powerRails": ["3.3V", "5V", "GND"],',
      '     "warnings": ["Array of critical safety warnings, logic level mismatch notices, or pull-up resistor requirements"]',
      "   }",
      "4. Example Wiring JSON Block:",
      "```wiring",
      "{",
      '  "title": "ESP32 Environmental Station with BME280 & SSD1306 OLED",',
      '  "description": "I2C sensor and display node with 3.3V logic",',
      '  "components": [',
      '    { "id": "esp32", "name": "ESP32 DevKit V1", "type": "microcontroller", "operatingVoltage": "3.3V" },',
      '    { "id": "bme280", "name": "BME280 Sensor", "type": "sensor", "operatingVoltage": "3.3V", "pins": ["VCC", "GND", "SCL", "SDA"], "notes": "I2C 0x76" },',
      '    { "id": "oled", "name": "SSD1306 OLED", "type": "display", "operatingVoltage": "3.3V", "pins": ["VCC", "GND", "SCL", "SDA"], "notes": "I2C 0x3C" }',
      "  ],",
      '  "connections": [',
      '    { "from": { "componentId": "esp32", "pin": "3V3" }, "to": { "componentId": "bme280", "pin": "VCC" }, "signalType": "power", "wireColor": "red" },',
      '    { "from": { "componentId": "esp32", "pin": "GND" }, "to": { "componentId": "bme280", "pin": "GND" }, "signalType": "ground", "wireColor": "black" },',
      '    { "from": { "componentId": "esp32", "pin": "GPIO22" }, "to": { "componentId": "bme280", "pin": "SCL" }, "signalType": "i2c", "signal": "I2C SCL", "wireColor": "yellow" },',
      '    { "from": { "componentId": "esp32", "pin": "GPIO21" }, "to": { "componentId": "bme280", "pin": "SDA" }, "signalType": "i2c", "signal": "I2C SDA", "wireColor": "blue" },',
      '    { "from": { "componentId": "esp32", "pin": "3V3" }, "to": { "componentId": "oled", "pin": "VCC" }, "signalType": "power", "wireColor": "red" },',
      '    { "from": { "componentId": "esp32", "pin": "GND" }, "to": { "componentId": "oled", "pin": "GND" }, "signalType": "ground", "wireColor": "black" },',
      '    { "from": { "componentId": "esp32", "pin": "GPIO22" }, "to": { "componentId": "oled", "pin": "SCL" }, "signalType": "i2c", "signal": "I2C SCL", "wireColor": "yellow" },',
      '    { "from": { "componentId": "esp32", "pin": "GPIO21" }, "to": { "componentId": "oled", "pin": "SDA" }, "signalType": "i2c", "signal": "I2C SDA", "wireColor": "blue" }',
      "  ],",
      '  "powerRails": ["3.3V", "GND"],',
      '  "warnings": [',
      '    "ESP32 GPIO pins operate at 3.3V and are NOT 5V tolerant. Ensure all peripherals use 3.3V logic."',
      "  ]",
      "}",
      "```",
      "</circuit_wiring_rules>",
    ].join("\n");

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
      circuitWiringRules,
    ].join("\n");
  });
}
