import { describe, expect, it } from "vite-plus/test";

import {
  CircuitComponentTypeSchema,
  CircuitSignalTypeSchema,
  WireColorSchema,
  CircuitPinItem,
  CircuitWiringDiagram,
  parseCircuitWiring,
  parseCircuitWiringJson,
  normalizeCircuitPin,
  formatCircuitWarning,
  getCircuitBoards,
  getCircuitPeripherals,
  WiringParseError,
  WiringValidationError,
} from "./wiring.ts";
import * as Schema from "effect/Schema";

const decodeCircuitComponentType = Schema.decodeUnknownSync(CircuitComponentTypeSchema);
const decodeCircuitSignalType = Schema.decodeUnknownSync(CircuitSignalTypeSchema);
const decodeWireColor = Schema.decodeUnknownSync(WireColorSchema);
const decodeCircuitPinItem = Schema.decodeUnknownSync(CircuitPinItem);
const decodeCircuitWiringDiagram = Schema.decodeUnknownSync(CircuitWiringDiagram);

describe("Circuit Wiring Contracts & Schemas", () => {
  const sampleCircuit = {
    title: "ESP32 Weather Station",
    description: "ESP32 DevKit connected to BME280 sensor and SSD1306 OLED display",
    boards: [
      {
        id: "esp32",
        name: "ESP32 DevKit V1",
        mcu: "ESP32",
        operatingVoltage: "3.3V",
        pins: ["3V3", "GND", "GPIO21", "GPIO22"],
      },
    ],
    components: [
      {
        id: "bme280",
        name: "BME280 Sensor",
        type: "sensor",
        operatingVoltage: "3.3V",
        pins: ["VCC", "GND", "SCL", "SDA"],
        notes: "I2C Address: 0x76",
      },
      {
        id: "oled",
        name: "SSD1306 OLED",
        type: "display",
        operatingVoltage: "3.3V",
        pins: [
          { pin: "VCC", label: "Power 3.3V", type: "power" },
          { pin: "GND", label: "Ground", type: "ground" },
          { pin: "SCL", label: "I2C Clock", type: "i2c" },
          { pin: "SDA", label: "I2C Data", type: "i2c" },
        ],
        notes: "I2C Address: 0x3C",
      },
    ],
    connections: [
      {
        from: { componentId: "esp32", pin: "3V3" },
        to: { componentId: "bme280", pin: "VCC" },
        signalType: "power",
        wireColor: "red",
      },
      {
        from: { componentId: "esp32", pin: "GND" },
        to: { componentId: "bme280", pin: "GND" },
        signalType: "ground",
        wireColor: "black",
      },
      {
        from: { componentId: "esp32", pin: "GPIO22" },
        to: { componentId: "bme280", pin: "SCL" },
        signalType: "i2c",
        signal: "I2C SCL",
        wireColor: "yellow",
      },
      {
        from: { componentId: "esp32", pin: "GPIO21" },
        to: { componentId: "bme280", pin: "SDA" },
        signalType: "i2c",
        signal: "I2C SDA",
        wireColor: "blue",
      },
    ],
    warnings: [
      "Ensure BME280 is powered from 3.3V rail only.",
      {
        level: "warning",
        message: "ESP32 GPIO pins are not 5V tolerant.",
        affectedComponents: ["esp32"],
      },
    ],
    powerRails: ["3.3V", "GND"],
    powerSources: ["USB 5V to 3.3V LDO"],
  };

  describe("Enums and Primitive Schemas", () => {
    it("validates allowed component types", () => {
      expect(decodeCircuitComponentType("sensor")).toBe("sensor");
      expect(decodeCircuitComponentType("display")).toBe("display");
      expect(decodeCircuitComponentType("microcontroller")).toBe("microcontroller");
      expect(decodeCircuitComponentType("actuator")).toBe("actuator");
      expect(decodeCircuitComponentType("module")).toBe("module");
      expect(decodeCircuitComponentType("passive")).toBe("passive");
      expect(decodeCircuitComponentType("ic")).toBe("ic");
      expect(decodeCircuitComponentType("power")).toBe("power");
      expect(decodeCircuitComponentType("communication")).toBe("communication");
      expect(decodeCircuitComponentType("other")).toBe("other");
      expect(() => decodeCircuitComponentType("invalid_type")).toThrow();
    });

    it("validates allowed signal types", () => {
      expect(decodeCircuitSignalType("i2c")).toBe("i2c");
      expect(decodeCircuitSignalType("spi")).toBe("spi");
      expect(decodeCircuitSignalType("power")).toBe("power");
      expect(decodeCircuitSignalType("ground")).toBe("ground");
      expect(decodeCircuitSignalType("uart")).toBe("uart");
      expect(decodeCircuitSignalType("gpio")).toBe("gpio");
      expect(decodeCircuitSignalType("pwm")).toBe("pwm");
      expect(decodeCircuitSignalType("swd")).toBe("swd");
      expect(() => decodeCircuitSignalType("invalid_signal")).toThrow();
    });

    it("validates allowed wire colors", () => {
      expect(decodeWireColor("red")).toBe("red");
      expect(decodeWireColor("black")).toBe("black");
      expect(decodeWireColor("yellow")).toBe("yellow");
      expect(decodeWireColor("blue")).toBe("blue");
      expect(decodeWireColor("custom")).toBe("custom");
      expect(() => decodeWireColor("neon-pink")).toThrow();
    });
  });

  describe("CircuitPinDefinition and CircuitPinItem", () => {
    it("decodes string and object pin definitions", () => {
      expect(decodeCircuitPinItem("D13")).toBe("D13");

      const objPin = decodeCircuitPinItem({
        pin: "GPIO21",
        label: "I2C SDA",
        type: "i2c",
        voltage: "3.3V",
        description: "Default SDA pin on ESP32",
      });
      expect(objPin).toEqual({
        pin: "GPIO21",
        label: "I2C SDA",
        type: "i2c",
        voltage: "3.3V",
        description: "Default SDA pin on ESP32",
      });
    });
  });

  describe("CircuitWiringDiagram Schema", () => {
    it("decodes a full valid circuit wiring structure", () => {
      const decoded = decodeCircuitWiringDiagram(sampleCircuit);
      expect(decoded.title).toBe("ESP32 Weather Station");
      expect(decoded.boards?.length).toBe(1);
      expect(decoded.components.length).toBe(2);
      expect(decoded.connections.length).toBe(4);
      expect(decoded.warnings?.length).toBe(2);
      expect(decoded.powerRails).toEqual(["3.3V", "GND"]);
      expect(decoded.powerSources).toEqual(["USB 5V to 3.3V LDO"]);
    });

    it("decodes minimal circuit with only required fields", () => {
      const minimal = {
        title: "Minimal Circuit",
        components: [
          { id: "mcu", name: "Nano", type: "microcontroller" },
          { id: "led", name: "LED", type: "passive" },
        ],
        connections: [
          {
            from: { componentId: "mcu", pin: "D13" },
            to: { componentId: "led", pin: "ANODE" },
          },
        ],
      };
      const decoded = decodeCircuitWiringDiagram(minimal);
      expect(decoded.title).toBe("Minimal Circuit");
      expect(decoded.components.length).toBe(2);
      expect(decoded.connections.length).toBe(1);
      expect(decoded.boards).toBeUndefined();
      expect(decoded.warnings).toBeUndefined();
    });

    it("fails validation when required fields are missing", () => {
      const invalid = {
        title: "Missing Connections",
        components: [],
      };
      expect(() => decodeCircuitWiringDiagram(invalid)).toThrow();
    });
  });

  describe("Envelope Handling and parseCircuitWiring", () => {
    it("unwraps direct payload", () => {
      const result = parseCircuitWiring(sampleCircuit);
      expect(result.title).toBe("ESP32 Weather Station");
      expect(result.components.length).toBe(2);
    });

    it("unwraps { circuit: ... } payload wrapper", () => {
      const wrapped = { circuit: sampleCircuit };
      const result = parseCircuitWiring(wrapped);
      expect(result.title).toBe("ESP32 Weather Station");
      expect(result.components.length).toBe(2);
    });

    it("unwraps { wiring: ... } payload wrapper", () => {
      const wrapped = { wiring: sampleCircuit };
      const result = parseCircuitWiring(wrapped);
      expect(result.title).toBe("ESP32 Weather Station");
      expect(result.components.length).toBe(2);
    });

    it("throws error for invalid payload structure", () => {
      expect(() => parseCircuitWiring({ invalid: true })).toThrow();
    });
  });

  describe("parseCircuitWiringJson", () => {
    it("parses valid JSON string", () => {
      const jsonStr = JSON.stringify(sampleCircuit);
      const result = parseCircuitWiringJson(jsonStr);
      expect(result.title).toBe("ESP32 Weather Station");
    });

    it("throws WiringParseError on malformed JSON syntax", () => {
      expect(() => parseCircuitWiringJson("{ not json")).toThrowError(WiringParseError);
    });

    it("repairs raw control characters inside string literals", () => {
      const withRawNewline =
        '{"title":"ESP32 Weather","description":"line one\nline two","components":[],"connections":[]}';
      const result = parseCircuitWiringJson(withRawNewline);
      expect(result.title).toBe("ESP32 Weather");
      expect(result.description).toBe("line one\nline two");
    });

    it("repairs raw tabs and carriage returns inside string literals", () => {
      const withRawTabs =
        '{"title":"Tabbed\tTitle","description":"win\r\nline","components":[],"connections":[]}';
      const result = parseCircuitWiringJson(withRawTabs);
      expect(result.title).toBe("Tabbed\tTitle");
      expect(result.description).toBe("win\r\nline");
    });

    it("does not touch escaped sequences or control characters outside strings", () => {
      const legit =
        '{\n  "title": "Escaped \\"quoted\\" \\u00e9",\n  "components": [],\n  "connections": []\n}';
      const result = parseCircuitWiringJson(legit);
      expect(result.title).toBe('Escaped "quoted" \u00e9');
    });

    it("still throws WiringParseError when repair cannot fix the JSON", () => {
      expect(() => parseCircuitWiringJson('{"title":"broken\nline","components":')).toThrowError(
        WiringParseError,
      );
    });

    it("throws WiringValidationError on schema mismatch", () => {
      expect(() => parseCircuitWiringJson(JSON.stringify({ title: 123 }))).toThrowError(
        WiringValidationError,
      );
    });
  });

  describe("Normalization & Helpers", () => {
    it("normalizeCircuitPin converts string and object pins", () => {
      expect(normalizeCircuitPin("GPIO4")).toEqual({ pin: "GPIO4" });
      expect(normalizeCircuitPin({ pin: "GPIO4", label: "Pin 4", type: "gpio" })).toEqual({
        pin: "GPIO4",
        label: "Pin 4",
        type: "gpio",
      });
    });

    it("formatCircuitWarning normalizes string and object warnings", () => {
      expect(formatCircuitWarning("Check 3.3V voltage")).toEqual({
        level: "warning",
        message: "Check 3.3V voltage",
      });
      expect(
        formatCircuitWarning({
          level: "error",
          message: "Short circuit risk",
          affectedComponents: ["esp32"],
        }),
      ).toEqual({
        level: "error",
        message: "Short circuit risk",
        affectedComponents: ["esp32"],
      });
      expect(
        formatCircuitWarning({
          message: "Informational notice",
        }),
      ).toEqual({
        level: "warning",
        message: "Informational notice",
        affectedComponents: undefined,
      });
    });

    it("getCircuitBoards extracts boards declared explicitly and as microcontroller component", () => {
      const circuitWithoutBoards = {
        title: "Test",
        components: [
          {
            id: "esp32",
            name: "ESP32 Node",
            type: "microcontroller" as const,
            operatingVoltage: "3.3V",
            pins: ["3V3", "GND"],
            notes: "Dev board",
          },
          { id: "dht", name: "DHT22", type: "sensor" as const },
        ],
        connections: [],
      };
      const boards = getCircuitBoards(circuitWithoutBoards);
      expect(boards.length).toBe(1);
      expect(boards[0]?.id).toBe("esp32");
      expect(boards[0]?.operatingVoltage).toBe("3.3V");
      expect(boards[0]?.description).toBe("Dev board");

      const peripherals = getCircuitPeripherals(circuitWithoutBoards);
      expect(peripherals.length).toBe(1);
      expect(peripherals[0]?.id).toBe("dht");
    });

    it("getCircuitBoards does not duplicate boards that are already in boards array", () => {
      const circuitWithBoth = {
        title: "Test with both",
        boards: [{ id: "esp32", name: "ESP32 DevKit", mcu: "ESP32", operatingVoltage: "3.3V" }],
        components: [
          { id: "esp32", name: "ESP32 Node", type: "microcontroller" as const },
          { id: "oled", name: "SSD1306", type: "display" as const },
        ],
        connections: [],
      };
      const boards = getCircuitBoards(circuitWithBoth);
      expect(boards.length).toBe(1);
      expect(boards[0]?.id).toBe("esp32");
      expect(boards[0]?.name).toBe("ESP32 DevKit");
    });
  });
});
