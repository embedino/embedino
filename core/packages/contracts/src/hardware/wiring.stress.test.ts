import { describe, expect, it } from "vite-plus/test";
import {
  type CircuitWiringDiagram,
  parseCircuitWiring,
  parseCircuitWiringJson,
  formatCircuitWarning,
  getCircuitBoards,
  getCircuitPeripherals,
  WiringParseError,
  WiringValidationError,
} from "./wiring.ts";

describe("Adversarial & Stress Tests for Circuit Wiring Contracts", () => {
  // -------------------------------------------------------------------------
  // 1. Extreme JSON Syntax & Parsing Stress Tests
  // -------------------------------------------------------------------------
  describe("JSON Syntax Parsing Extremes", () => {
    it("handles deeply nested wrappers gracefully by throwing proper errors", () => {
      const deeplyNested = JSON.stringify({
        level1: {
          level2: {
            level3: {
              title: "Nested",
              components: [],
              connections: [],
            },
          },
        },
      });
      expect(() => parseCircuitWiringJson(deeplyNested)).toThrowError(WiringValidationError);
    });

    it("throws WiringParseError for truncated, malformed, or hostile JSON strings", () => {
      const brokenInputs = [
        "",
        "   ",
        "{",
        '{"title": "Unclosed',
        '{"title": "Trailing comma", "components": [], "connections": [],}',
        "null",
        "undefined",
        "true",
        "12345",
        '["array", "root"]',
        "/* comment */ { title: 'No quotes' }",
        '{"title": "\\u0000 null byte inside"}',
      ];

      for (const input of brokenInputs) {
        if (input === '{"title": "\\u0000 null byte inside"}') {
          // Valid JSON syntax, but missing required components/connections
          expect(() => parseCircuitWiringJson(input)).toThrowError(WiringValidationError);
        } else if (
          input === "null" ||
          input === "true" ||
          input === "12345" ||
          input === '["array", "root"]'
        ) {
          // Valid JSON primitives, but invalid schema payload
          expect(() => parseCircuitWiringJson(input)).toThrowError(WiringValidationError);
        } else {
          expect(() => parseCircuitWiringJson(input)).toThrowError(WiringParseError);
        }
      }
    });

    it("handles huge circuits with 500 components and 2000 connections without crashing or stack overflow", () => {
      const components: any[] = [];
      const connections: any[] = [];

      for (let i = 0; i < 500; i++) {
        components.push({
          id: `sensor_${i}`,
          name: `Sensor Module #${i}`,
          type: "sensor",
          operatingVoltage: "3.3V",
          pins: [`PIN_IN_${i}`, `PIN_OUT_${i}`, "VCC", "GND"],
          notes: `I2C bus address: 0x${(i % 120).toString(16)}`,
        });
      }

      for (let i = 0; i < 2000; i++) {
        connections.push({
          from: { componentId: `sensor_${i % 500}`, pin: `PIN_OUT_${i % 500}` },
          to: { componentId: `sensor_${(i + 1) % 500}`, pin: `PIN_IN_${(i + 1) % 500}` },
          signalType: i % 2 === 0 ? "i2c" : "gpio",
          signal: `BUS_NET_${i}`,
          wireColor: "blue",
          voltage: "3.3V",
          notes: `Automated route ${i}`,
        });
      }

      const hugeCircuit = {
        title: "Massive Multi-Sensor Industrial Array",
        description: "Stress test payload with 500 components and 2000 wires",
        components,
        connections,
      };

      const start = performance.now();
      const parsed = parseCircuitWiring(hugeCircuit);
      const duration = performance.now() - start;

      expect(parsed.components.length).toBe(500);
      expect(parsed.connections.length).toBe(2000);
      expect(duration).toBeLessThan(1000); // Must parse within 1 second
    });
  });

  // -------------------------------------------------------------------------
  // 2. Unusual Pin Names, Signal Types, & Character Encodings
  // -------------------------------------------------------------------------
  describe("Unusual Pin Names & Unicode/Special Characters", () => {
    it("handles complex, special-character, and Unicode pin names", () => {
      const unusualPinsCircuit = {
        title: "Special Character Pinout Test",
        boards: [
          {
            id: "stm32-nucleo_64/v2.1",
            name: "NUCLEO-F446RE (Rev C.1)",
            mcu: "STM32F446RET6",
            operatingVoltage: "3.3V / 5.0V",
            pins: [
              "PA0/WKUP/ADC123_IN0",
              "PB6 (I2C1_SCL/TIM4_CH1/USART1_TX)",
              "3V3_STLINK",
              "NRST#",
              "BOOT0 (pull-down 10kΩ)",
              "~RESET_N",
              "GPIO4/ADC2_CH0/TOUCH0/RTC_GPIO10",
              "Pin @ Port C [Pin 13]",
              "VCC (+5V ± 5%)",
              "GND / ⏚",
            ],
          },
        ],
        components: [
          {
            id: "i2c-oled_0.96″_128x64",
            name: "0.96″ I²C OLED Display",
            type: "display" as const,
            pins: [
              {
                pin: "VCC (3.3~5.5V)",
                label: "DC Power Supply (3.3V-5V)",
                type: "power" as const,
                voltage: "3.3V-5V",
              },
              { pin: "GND (⏚)", label: "Ground", type: "ground" as const },
              { pin: "SCL/SCK (Clock Line)", label: "I²C Clock", type: "i2c" as const },
              { pin: "SDA/MOSI (Data Line)", label: "I²C Data", type: "i2c" as const },
            ],
          },
        ],
        connections: [
          {
            from: { componentId: "stm32-nucleo_64/v2.1", pin: "PB6 (I2C1_SCL/TIM4_CH1/USART1_TX)" },
            to: { componentId: "i2c-oled_0.96″_128x64", pin: "SCL/SCK (Clock Line)" },
            signalType: "i2c" as const,
            signal: "I²C1 Clock (400 kHz Fast-Mode)",
            wireColor: "yellow/green-stripe",
            voltage: "3.3V",
            notes: "Internal pull-up enabled on STM32 PB6; 4.7kΩ external pull-up recommended",
          },
        ],
      };

      const result = parseCircuitWiring(unusualPinsCircuit);
      expect(result.boards?.[0]?.pins?.length).toBe(10);
      expect(result.components[0]?.pins?.length).toBe(4);
      expect(result.connections[0]?.from.pin).toBe("PB6 (I2C1_SCL/TIM4_CH1/USART1_TX)");
      expect(result.connections[0]?.to.pin).toBe("SCL/SCK (Clock Line)");
    });

    it("handles all 16 defined signal types correctly", () => {
      const signals = [
        "power",
        "ground",
        "i2c",
        "spi",
        "uart",
        "gpio",
        "digital",
        "analog",
        "pwm",
        "dac",
        "touch",
        "can",
        "1wire",
        "swd",
        "jtag",
        "other",
      ] as const;

      for (const sig of signals) {
        const payload = {
          title: `Signal test ${sig}`,
          components: [{ id: "c1", name: "Comp", type: "module" as const }],
          connections: [
            {
              from: { componentId: "c1", pin: "P1" },
              to: { componentId: "c1", pin: "P2" },
              signalType: sig,
            },
          ],
        };
        const parsed = parseCircuitWiring(payload);
        expect(parsed.connections[0]?.signalType).toBe(sig);
      }
    });

    it("rejects unrecognized signal types strictly", () => {
      const invalidSignals = ["usb", "pcie", "rs485", "ethernet", "I2C", "SPI", "POWER", "gnd"];
      for (const sig of invalidSignals) {
        const payload = {
          title: `Signal test ${sig}`,
          components: [{ id: "c1", name: "Comp", type: "module" as const }],
          connections: [
            {
              from: { componentId: "c1", pin: "P1" },
              to: { componentId: "c1", pin: "P2" },
              signalType: sig,
            },
          ],
        };
        expect(() => parseCircuitWiring(payload)).toThrow();
      }
    });
  });

  // -------------------------------------------------------------------------
  // 3. Envelope Unwrapping & Variations
  // -------------------------------------------------------------------------
  describe("Envelope Unwrapping Variations", () => {
    const base = {
      title: "Base Circuit",
      components: [{ id: "mcu", name: "ESP32", type: "microcontroller" as const }],
      connections: [],
    };

    it("unwraps top-level diagram directly", () => {
      expect(parseCircuitWiring(base).title).toBe("Base Circuit");
    });

    it("unwraps { circuit: { ... } } wrapper", () => {
      expect(parseCircuitWiring({ circuit: base }).title).toBe("Base Circuit");
    });

    it("unwraps { wiring: { ... } } wrapper", () => {
      expect(parseCircuitWiring({ wiring: base }).title).toBe("Base Circuit");
    });

    it("throws for unknown wrappers like { data: { ... } } or { diagram: { ... } }", () => {
      expect(() => parseCircuitWiring({ data: base })).toThrow();
      expect(() => parseCircuitWiring({ diagram: base })).toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 4. Missing Fields & Strict Schema Boundary Validation
  // -------------------------------------------------------------------------
  describe("Missing Fields and Schema Boundary Violations", () => {
    it("fails when title is missing or not a string", () => {
      expect(() => parseCircuitWiring({ components: [], connections: [] })).toThrow();
      expect(() => parseCircuitWiring({ title: 123, components: [], connections: [] })).toThrow();
      expect(() => parseCircuitWiring({ title: null, components: [], connections: [] })).toThrow();
    });

    it("fails when components is missing or not an array", () => {
      expect(() => parseCircuitWiring({ title: "Test", connections: [] })).toThrow();
      expect(() =>
        parseCircuitWiring({ title: "Test", components: "not an array", connections: [] }),
      ).toThrow();
    });

    it("fails when connections is missing or not an array", () => {
      expect(() => parseCircuitWiring({ title: "Test", components: [] })).toThrow();
      expect(() =>
        parseCircuitWiring({ title: "Test", components: [], connections: "not array" }),
      ).toThrow();
    });

    it("fails when component is missing required fields (id, name, type)", () => {
      expect(() =>
        parseCircuitWiring({
          title: "Missing comp id",
          components: [{ name: "OLED", type: "display" }],
          connections: [],
        }),
      ).toThrow();

      expect(() =>
        parseCircuitWiring({
          title: "Missing comp name",
          components: [{ id: "oled", type: "display" }],
          connections: [],
        }),
      ).toThrow();

      expect(() =>
        parseCircuitWiring({
          title: "Missing comp type",
          components: [{ id: "oled", name: "OLED" }],
          connections: [],
        }),
      ).toThrow();

      expect(() =>
        parseCircuitWiring({
          title: "Invalid comp type",
          components: [{ id: "oled", name: "OLED", type: "invalid_sensor_type" }],
          connections: [],
        }),
      ).toThrow();
    });

    it("fails when connection endpoint is missing componentId or pin", () => {
      expect(() =>
        parseCircuitWiring({
          title: "Missing from.pin",
          components: [{ id: "c1", name: "C1", type: "passive" }],
          connections: [
            {
              from: { componentId: "c1" },
              to: { componentId: "c1", pin: "P1" },
            },
          ],
        }),
      ).toThrow();

      expect(() =>
        parseCircuitWiring({
          title: "Missing to.componentId",
          components: [{ id: "c1", name: "C1", type: "passive" }],
          connections: [
            {
              from: { componentId: "c1", pin: "P1" },
              to: { pin: "P2" },
            },
          ],
        }),
      ).toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 5. Warning Normalization & Edge Cases
  // -------------------------------------------------------------------------
  describe("Warning Normalization & Helper Functions", () => {
    it("handles mixed string and struct warnings", () => {
      const circuit = {
        title: "Warnings Test",
        components: [{ id: "mcu", name: "ESP32", type: "microcontroller" as const }],
        connections: [],
        warnings: [
          "Plain string warning 1",
          { level: "info" as const, message: "Informational notice" },
          {
            level: "error" as const,
            message: "Critical voltage mismatch",
            affectedComponents: ["mcu"],
          },
          { message: "Default level warning" },
        ],
      };

      const parsed = parseCircuitWiring(circuit);
      expect(parsed.warnings?.length).toBe(4);

      const formatted = parsed.warnings!.map(formatCircuitWarning);
      expect(formatted[0]).toEqual({ level: "warning", message: "Plain string warning 1" });
      expect(formatted[1]).toEqual({ level: "info", message: "Informational notice" });
      expect(formatted[2]).toEqual({
        level: "error",
        message: "Critical voltage mismatch",
        affectedComponents: ["mcu"],
      });
      expect(formatted[3]).toEqual({
        level: "warning",
        message: "Default level warning",
        affectedComponents: undefined,
      });
    });

    it("getCircuitBoards and getCircuitPeripherals handle edge cases (empty components, duplicates)", () => {
      const emptyCircuit: CircuitWiringDiagram = {
        title: "Empty",
        components: [],
        connections: [],
      };
      expect(getCircuitBoards(emptyCircuit)).toEqual([]);
      expect(getCircuitPeripherals(emptyCircuit)).toEqual([]);

      const multiMcuCircuit: CircuitWiringDiagram = {
        title: "Multi-MCU",
        boards: [{ id: "board1", name: "Declared Board" }],
        components: [
          { id: "board1", name: "Duplicate Board ID", type: "microcontroller" },
          {
            id: "board2",
            name: "Inferred Board 2",
            type: "microcontroller",
            operatingVoltage: "5V",
          },
          { id: "sensor1", name: "Temp Sensor", type: "sensor" },
        ],
        connections: [],
      };

      const boards = getCircuitBoards(multiMcuCircuit);
      expect(boards.length).toBe(2);
      expect(boards[0]?.id).toBe("board1");
      expect(boards[0]?.name).toBe("Declared Board"); // Keeps original declared board
      expect(boards[1]?.id).toBe("board2");
      expect(boards[1]?.operatingVoltage).toBe("5V");

      const peripherals = getCircuitPeripherals(multiMcuCircuit);
      expect(peripherals.length).toBe(1);
      expect(peripherals[0]?.id).toBe("sensor1");
    });
  });
});
