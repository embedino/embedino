import * as Schema from "effect/Schema";

// ---------------------------------------------------------------------------
// Hardware Device — represents a single connected USB/serial device
// ---------------------------------------------------------------------------

export const HardwareDeviceStatus = Schema.Literals(["identified", "generic", "enriching"]);
export type HardwareDeviceStatus = Schema.Schema.Type<typeof HardwareDeviceStatus>;

export const HardwareDevice = Schema.Struct({
  /** Unique identifier for this device instance (port path or synthetic id). */
  id: Schema.String,
  /** Raw OS port path (e.g. COM3, /dev/ttyUSB0, /dev/cu.usbserial-1420). */
  port: Schema.String,
  /** Normalized short display name for compact UI (e.g. COM3, ttyUSB0, usbserial-1420). */
  portDisplayName: Schema.String,
  /** USB Vendor ID if available (e.g. "0x2341"). */
  vid: Schema.NullOr(Schema.String),
  /** USB Product ID if available (e.g. "0x0043"). */
  pid: Schema.NullOr(Schema.String),
  /** USB manufacturer string reported by OS. */
  manufacturer: Schema.NullOr(Schema.String),
  /** Resolved board name (null if unrecognized generic bridge). */
  boardName: Schema.NullOr(Schema.String),
  /** Arduino Fully Qualified Board Name from toolchain enrichment. */
  fqbn: Schema.NullOr(Schema.String),
  /** PlatformIO board identifier from toolchain enrichment. */
  pioBoard: Schema.NullOr(Schema.String),
  /** Bridge chip name if detected (CH340, CP2102, FT232R, etc.). */
  driverChip: Schema.NullOr(Schema.String),
  /** Current identification status. */
  status: HardwareDeviceStatus,
});
export type HardwareDevice = Schema.Schema.Type<typeof HardwareDevice>;

// ---------------------------------------------------------------------------
// Hardware Events — streamed to the frontend via WebSocket
// ---------------------------------------------------------------------------

export const HardwareSnapshotEvent = Schema.Struct({
  type: Schema.Literal("snapshot"),
  devices: Schema.Array(HardwareDevice),
});

export const HardwareConnectedEvent = Schema.Struct({
  type: Schema.Literal("connected"),
  device: HardwareDevice,
});

export const HardwareDisconnectedEvent = Schema.Struct({
  type: Schema.Literal("disconnected"),
  deviceId: Schema.String,
});

export const HardwareEnrichedEvent = Schema.Struct({
  type: Schema.Literal("enriched"),
  deviceId: Schema.String,
  boardName: Schema.NullOr(Schema.String),
  fqbn: Schema.NullOr(Schema.String),
  pioBoard: Schema.NullOr(Schema.String),
});

export const HardwareEvent = Schema.Union([
  HardwareSnapshotEvent,
  HardwareConnectedEvent,
  HardwareDisconnectedEvent,
  HardwareEnrichedEvent,
]);
export type HardwareEvent = Schema.Schema.Type<typeof HardwareEvent>;

// ---------------------------------------------------------------------------
// Device Association — user-defined mapping for unrecognized devices
// ---------------------------------------------------------------------------

export const DeviceAssociationInput = Schema.Struct({
  /** Device id to associate. */
  deviceId: Schema.String,
  /** User-selected board name. */
  boardName: Schema.String,
  /** Arduino FQBN if known. */
  fqbn: Schema.optional(Schema.String),
  /** PlatformIO board ID if known. */
  pioBoard: Schema.optional(Schema.String),
});
export type DeviceAssociationInput = Schema.Schema.Type<typeof DeviceAssociationInput>;

export const DeviceAssociationResult = Schema.Struct({
  success: Schema.Boolean,
});
export type DeviceAssociationResult = Schema.Schema.Type<typeof DeviceAssociationResult>;

// ---------------------------------------------------------------------------
// Board Definition — static entry in the board database
// ---------------------------------------------------------------------------

export const BoardDefinition = Schema.Struct({
  /** Human-readable board name (e.g. "ESP32-WROOM-32"). */
  name: Schema.String,
  /** MCU/chip family (e.g. "ESP32", "ATmega328P", "RP2040"). */
  mcu: Schema.optional(Schema.String),
  /** Arduino FQBN. */
  fqbn: Schema.optional(Schema.String),
  /** PlatformIO board ID. */
  pioBoard: Schema.optional(Schema.String),
  /** Default baud rate for serial communication. */
  defaultBaudRate: Schema.optional(Schema.Number),
  /** Board vendor (e.g. "Espressif", "Arduino", "Raspberry Pi Foundation"). */
  vendor: Schema.optional(Schema.String),
});
export type BoardDefinition = Schema.Schema.Type<typeof BoardDefinition>;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class HardwareDetectionError extends Schema.TaggedErrorClass<HardwareDetectionError>()(
  "HardwareDetectionError",
  {
    message: Schema.String,
    details: Schema.optional(Schema.String),
  },
) {}
