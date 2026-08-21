import * as Schema from "effect/Schema";

// ---------------------------------------------------------------------------
// Component & Signal Classifications
// ---------------------------------------------------------------------------

export const CircuitComponentTypeSchema = Schema.Literals([
  "microcontroller",
  "sensor",
  "display",
  "actuator",
  "module",
  "passive",
  "ic",
  "power",
  "communication",
  "other",
]);
export type CircuitComponentType = Schema.Schema.Type<typeof CircuitComponentTypeSchema>;

export const CircuitSignalTypeSchema = Schema.Literals([
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
]);
export type CircuitSignalType = Schema.Schema.Type<typeof CircuitSignalTypeSchema>;

export const WireColorSchema = Schema.Literals([
  "red",
  "black",
  "yellow",
  "blue",
  "green",
  "white",
  "orange",
  "purple",
  "brown",
  "gray",
  "custom",
]);
export type WireColor = Schema.Schema.Type<typeof WireColorSchema>;

// ---------------------------------------------------------------------------
// Pin & Endpoint Definitions
// ---------------------------------------------------------------------------

export const CircuitPinDefinition = Schema.Struct({
  /** Pin identifier on the board or component (e.g. "GPIO21", "3V3", "VCC", "SDA", "D5") */
  pin: Schema.String,
  /** Optional human-readable function label (e.g. "I2C SDA", "ADC1_CH0", "Builtin LED") */
  label: Schema.optional(Schema.String),
  /** Pin signal category */
  type: Schema.optional(CircuitSignalTypeSchema),
  /** Operating voltage on this pin (e.g. "3.3V", "5V") */
  voltage: Schema.optional(Schema.String),
  /** Description or special capabilities */
  description: Schema.optional(Schema.String),
});
export type CircuitPinDefinition = Schema.Schema.Type<typeof CircuitPinDefinition>;

export const CircuitPinItem = Schema.Union([Schema.String, CircuitPinDefinition]);
export type CircuitPinItem = Schema.Schema.Type<typeof CircuitPinItem>;

export const CircuitConnectionEndpoint = Schema.Struct({
  /** ID of the microcontroller board or peripheral component */
  componentId: Schema.String,
  /** Specific pin on that component (e.g. "GPIO21", "VCC", "D4") */
  pin: Schema.String,
});
export type CircuitConnectionEndpoint = Schema.Schema.Type<typeof CircuitConnectionEndpoint>;

// ---------------------------------------------------------------------------
// Connection / Net / Wire Definition
// ---------------------------------------------------------------------------

export const CircuitConnection = Schema.Struct({
  /** Source connection endpoint */
  from: CircuitConnectionEndpoint,
  /** Target connection endpoint */
  to: CircuitConnectionEndpoint,
  /** Type of signal or bus protocol */
  signalType: Schema.optional(CircuitSignalTypeSchema),
  /** Signal name (e.g. "3.3V", "GND", "I2C SDA", "SPI SCK", "PWM D5") */
  signal: Schema.optional(Schema.String),
  /** Recommended jumper wire color */
  wireColor: Schema.optional(Schema.String),
  /** Nominal voltage level (e.g. "3.3V", "5V") */
  voltage: Schema.optional(Schema.String),
  /** Specific wiring instructions, passive values, or notes (e.g. "10k pull-up resistor") */
  notes: Schema.optional(Schema.String),
});
export type CircuitConnection = Schema.Schema.Type<typeof CircuitConnection>;

// ---------------------------------------------------------------------------
// Board & Component Definitions
// ---------------------------------------------------------------------------

export const CircuitBoard = Schema.Struct({
  /** Unique identifier within this circuit (e.g. "esp32", "uno_r3") */
  id: Schema.String,
  /** Human-readable board name (e.g. "ESP32-WROOM-32 DevKit", "Arduino Uno") */
  name: Schema.String,
  /** Microcontroller chip family (e.g. "ESP32", "ATmega328P", "RP2040") */
  mcu: Schema.optional(Schema.String),
  /** Board operating/logic voltage (e.g. "3.3V", "5V") */
  operatingVoltage: Schema.optional(Schema.String),
  /** Declared pins used or available */
  pins: Schema.optional(Schema.Array(CircuitPinItem)),
  /** Additional board details */
  description: Schema.optional(Schema.String),
});
export type CircuitBoard = Schema.Schema.Type<typeof CircuitBoard>;

export const CircuitComponent = Schema.Struct({
  /** Unique component ID within this circuit (e.g. "bme280", "oled", "led1") */
  id: Schema.String,
  /** Display name (e.g. "BME280 Temperature & Humidity Sensor", "SSD1306 OLED") */
  name: Schema.String,
  /** Category classification */
  type: CircuitComponentTypeSchema,
  /** Manufacturer part number or model (e.g. "BME280", "SSD1306", "SG90") */
  partNumber: Schema.optional(Schema.String),
  /** Component supply voltage range (e.g. "3.3V", "3.3V-5V", "5V") */
  operatingVoltage: Schema.optional(Schema.String),
  /** Declared pins on this component */
  pins: Schema.optional(Schema.Array(CircuitPinItem)),
  /** Configuration notes, default I2C addresses, jumper settings */
  notes: Schema.optional(Schema.String),
  /** Value for passive components (e.g. "220Ω", "10kΩ", "100nF") */
  value: Schema.optional(Schema.String),
});
export type CircuitComponent = Schema.Schema.Type<typeof CircuitComponent>;

export const CircuitWarningStruct = Schema.Struct({
  /** Severity level */
  level: Schema.optional(Schema.Literals(["warning", "error", "info"])),
  /** Warning description (e.g. "ESP32 GPIO is 3.3V only; 5V sensor requires level shifter") */
  message: Schema.String,
  /** Affected component or board IDs */
  affectedComponents: Schema.optional(Schema.Array(Schema.String)),
});
export type CircuitWarningStruct = Schema.Schema.Type<typeof CircuitWarningStruct>;

export const CircuitWarning = Schema.Union([CircuitWarningStruct, Schema.String]);
export type CircuitWarning = Schema.Schema.Type<typeof CircuitWarning>;

// ---------------------------------------------------------------------------
// Root Diagram Document & Envelopes
// ---------------------------------------------------------------------------

export const CircuitWiringDiagram = Schema.Struct({
  /** Optional diagram ID */
  id: Schema.optional(Schema.String),
  /** Circuit title */
  title: Schema.String,
  /** Project or circuit summary */
  description: Schema.optional(Schema.String),
  /** Microcontroller board(s) in the circuit (optional, can also be declared in components) */
  boards: Schema.optional(Schema.Array(CircuitBoard)),
  /** Peripheral components, sensors, actuators, and modules */
  components: Schema.Array(CircuitComponent),
  /** Netlist / pin-to-pin connections */
  connections: Schema.Array(CircuitConnection),
  /** Optional safety advisories or warnings */
  warnings: Schema.optional(Schema.Array(CircuitWarning)),
  /** Declared power supply rails */
  powerRails: Schema.optional(Schema.Array(Schema.String)),
  /** Declared power sources */
  powerSources: Schema.optional(Schema.Array(Schema.String)),
});
export type CircuitWiringDiagram = Schema.Schema.Type<typeof CircuitWiringDiagram>;

export const CircuitWiringPayload = Schema.Union([
  CircuitWiringDiagram,
  Schema.Struct({
    circuit: CircuitWiringDiagram,
  }),
  Schema.Struct({
    wiring: CircuitWiringDiagram,
  }),
]);
export type CircuitWiringPayload = Schema.Schema.Type<typeof CircuitWiringPayload>;

// ---------------------------------------------------------------------------
// Tagged Errors & Codecs
// ---------------------------------------------------------------------------

export class WiringParseError extends Schema.TaggedErrorClass<WiringParseError>()(
  "WiringParseError",
  {
    message: Schema.String,
    rawText: Schema.optional(Schema.String),
  },
) {}

export class WiringValidationError extends Schema.TaggedErrorClass<WiringValidationError>()(
  "WiringValidationError",
  {
    message: Schema.String,
    details: Schema.optional(Schema.String),
  },
) {}

export const decodeCircuitWiring = Schema.decodeUnknownSync(CircuitWiringPayload);

export function parseCircuitWiring(input: unknown): CircuitWiringDiagram {
  const decoded = decodeCircuitWiring(input);
  if ("circuit" in decoded) {
    return decoded.circuit;
  }
  if ("wiring" in decoded) {
    return decoded.wiring;
  }
  return decoded;
}

export function parseCircuitWiringJson(jsonString: string): CircuitWiringDiagram {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err: any) {
    throw new WiringParseError({
      message: `Failed to parse circuit wiring JSON: ${err?.message ?? String(err)}`,
      rawText: jsonString,
    });
  }
  try {
    return parseCircuitWiring(parsed);
  } catch (err: any) {
    throw new WiringValidationError({
      message: `Circuit wiring validation failed: ${err?.message ?? String(err)}`,
      details: String(err),
    });
  }
}

// ---------------------------------------------------------------------------
// Normalization & Helpers
// ---------------------------------------------------------------------------

export function normalizeCircuitPin(pin: CircuitPinItem): CircuitPinDefinition {
  if (typeof pin === "string") {
    return { pin };
  }
  return pin;
}

export function formatCircuitWarning(warning: CircuitWarning): {
  level: "warning" | "error" | "info";
  message: string;
  affectedComponents?: readonly string[] | undefined;
} {
  if (typeof warning === "string") {
    return { level: "warning", message: warning };
  }
  return {
    level: warning.level ?? "warning",
    message: warning.message,
    ...(warning.affectedComponents !== undefined
      ? { affectedComponents: warning.affectedComponents }
      : {}),
  };
}

export function getCircuitBoards(circuit: CircuitWiringDiagram): CircuitBoard[] {
  const boards: CircuitBoard[] = [...(circuit.boards ?? [])];
  for (const comp of circuit.components) {
    if (comp.type === "microcontroller" && !boards.some((b) => b.id === comp.id)) {
      boards.push({
        id: comp.id,
        name: comp.name,
        ...(comp.operatingVoltage !== undefined ? { operatingVoltage: comp.operatingVoltage } : {}),
        ...(comp.pins !== undefined ? { pins: comp.pins } : {}),
        ...(comp.notes !== undefined ? { description: comp.notes } : {}),
      });
    }
  }
  return boards;
}

export function getCircuitPeripherals(circuit: CircuitWiringDiagram): CircuitComponent[] {
  return circuit.components.filter((c) => c.type !== "microcontroller");
}
