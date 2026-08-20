import { describe, expect, it } from "@effect/vitest";
import { parseCircuitWiringJson } from "@t3tools/contracts";
import { HostProcessPlatform } from "@t3tools/shared/hostProcess";
import * as Effect from "effect/Effect";

import { buildHardwareSystemPrompt } from "./HardwareAgentPrompt.ts";

describe("HardwareAgentPrompt Assembly", () => {
  const runPrompt = (toolchain?: "platformio" | "arduino", deviceId?: string) =>
    buildHardwareSystemPrompt(toolchain, deviceId).pipe(
      Effect.provideService(HostProcessPlatform, "win32"),
    );

  it.effect(
    "assembles prompt containing hardware context, embedded rules, and circuit wiring rules",
    () =>
      Effect.gen(function* () {
        const prompt = yield* runPrompt("arduino");

        expect(prompt).toContain("<hardware_context>");
        expect(prompt).toContain("</hardware_context>");
        expect(prompt).toContain("<embedded_rules>");
        expect(prompt).toContain("</embedded_rules>");
        expect(prompt).toContain("<circuit_wiring_rules>");
        expect(prompt).toContain("</circuit_wiring_rules>");
      }),
  );

  it.effect("includes toolchain-specific instructions for Arduino CLI", () =>
    Effect.gen(function* () {
      const prompt = yield* runPrompt("arduino");
      expect(prompt).toContain("Toolchain: Arduino CLI");
      expect(prompt).toContain("Project Structure (Arduino CLI):");
    }),
  );

  it.effect("includes toolchain-specific instructions for PlatformIO", () =>
    Effect.gen(function* () {
      const prompt = yield* runPrompt("platformio");
      expect(prompt).toContain("Toolchain: PlatformIO");
      expect(prompt).toContain("Project Structure (PlatformIO):");
    }),
  );

  it.effect("prompts user to pick a toolchain when none is selected", () =>
    Effect.gen(function* () {
      const prompt = yield* runPrompt(undefined);
      expect(prompt).toContain("Toolchain: Not Selected");
      expect(prompt).toContain("Ask user to pick a toolchain");
    }),
  );

  it.effect("contains ```wiring directive and schema definition", () =>
    Effect.gen(function* () {
      const prompt = yield* runPrompt("arduino");
      expect(prompt).toContain("```wiring");
      expect(prompt).toContain('"title": "Circuit Title (string, required)"');
      expect(prompt).toContain('"components": [');
      expect(prompt).toContain('"connections": [');
    }),
  );

  it.effect(
    "contains a valid few-shot JSON example that conforms to the CircuitWiring schema",
    () =>
      Effect.gen(function* () {
        const prompt = yield* runPrompt("arduino");
        const wiringMatch = prompt.match(/```wiring\n([\s\S]*?)\n```/);
        expect(wiringMatch).not.toBeNull();
        const rawJson = wiringMatch![1]!;

        const parsed = parseCircuitWiringJson(rawJson);
        expect(parsed.title).toBe("ESP32 Environmental Station with BME280 & SSD1306 OLED");
        expect(parsed.components.length).toBe(3);
        expect(parsed.connections.length).toBe(8);
        expect(parsed.warnings?.length).toBe(1);
        expect(parsed.powerRails).toEqual(["3.3V", "GND"]);
      }),
  );
});
