import { describe, expect, it } from "vite-plus/test";
import type { CircuitWiringDiagram } from "@embedino/contracts";

import { isInternalOnlyWiring } from "./wiringVisibility";

function circuit(overrides: Partial<CircuitWiringDiagram>): CircuitWiringDiagram {
  return {
    title: "ESP32 project",
    components: [
      { id: "esp32", name: "ESP32-S3", type: "microcontroller" },
      { id: "led", name: "WS2812 NeoPixel", type: "actuator" },
    ],
    connections: [],
    ...overrides,
  };
}

describe("isInternalOnlyWiring", () => {
  it("suppresses a diagram made entirely from onboard PCB connections", () => {
    expect(
      isInternalOnlyWiring(
        circuit({
          title: "ESP32-S3 onboard police light",
          description: "Built-in WS2812 RGB LED driven directly by the ESP32-S3.",
          components: [
            { id: "esp32", name: "ESP32-S3", type: "microcontroller" },
            { id: "led", name: "Onboard WS2812 NeoPixel", type: "actuator" },
          ],
        }),
      ),
    ).toBe(true);
  });

  it("keeps real external-component wiring visible", () => {
    expect(
      isInternalOnlyWiring(
        circuit({
          title: "ESP32 with external NeoPixel strip",
          description: "Connect a separate LED strip to the board.",
        }),
      ),
    ).toBe(false);
  });

  it("keeps mixed diagrams visible when any peripheral is external", () => {
    expect(
      isInternalOnlyWiring(
        circuit({
          title: "ESP32 onboard LED and BME280",
          components: [
            { id: "esp32", name: "ESP32-S3", type: "microcontroller" },
            { id: "led", name: "Built-in RGB LED", type: "actuator" },
            { id: "sensor", name: "BME280", type: "sensor" },
          ],
        }),
      ),
    ).toBe(false);
  });
});
