import type {
  CircuitConnection,
  CircuitSignalType,
  CircuitWiringDiagram,
} from "@embedino/contracts";
import { normalizeCircuitPin } from "@embedino/contracts";

/**
 * Visual treatment for pin names and net labels in the wiring table.
 *
 * Color semantics follow real-world conventions engineers already know:
 * red = power, black/gray = ground, and one distinct hue per bus/signal
 * class — the same way net classes are colored in KiCad/Altium and jumper
 * wires are assigned on breadboards.
 */
export type NetColorMode = "signal" | "vivid" | "mono" | "neutral";

export interface SignalVisual {
  /** Text color for net labels and pin badges */
  readonly text: string;
  /** Tinted badge background */
  readonly bg: string;
  /** Tinted badge border */
  readonly border: string;
}

const NEUTRAL_VISUAL: SignalVisual = {
  text: "text-foreground",
  bg: "bg-muted/60",
  border: "border-border/40",
};

const MONO_VISUAL: SignalVisual = {
  text: "text-sky-600 dark:text-sky-300",
  bg: "bg-sky-500/10",
  border: "border-sky-500/25",
};

/** Classic palette — mirrors physical jumper-wire conventions. */
const CLASSIC: Record<CircuitSignalType, SignalVisual> = {
  power: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
  },
  ground: {
    text: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/25",
  },
  i2c: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
  },
  spi: {
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
  },
  uart: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
  },
  gpio: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
  },
  digital: {
    text: "text-zinc-600 dark:text-zinc-300",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/25",
  },
  analog: {
    text: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/25",
  },
  pwm: {
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/25",
  },
  dac: {
    text: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/25",
  },
  touch: {
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
  },
  can: {
    text: "text-lime-600 dark:text-lime-400",
    bg: "bg-lime-500/10",
    border: "border-lime-500/25",
  },
  "1wire": {
    text: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
  },
  swd: {
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/25",
  },
  jtag: {
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/25",
  },
  other: {
    text: "text-zinc-600 dark:text-zinc-300",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/25",
  },
};

/** Vivid palette — high-saturation hues that pop on dark workspaces. */
const VIVID: Record<CircuitSignalType, SignalVisual> = {
  power: {
    text: "text-red-500 dark:text-red-300",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
  },
  ground: {
    text: "text-slate-500 dark:text-slate-200",
    bg: "bg-slate-500/15",
    border: "border-slate-500/30",
  },
  i2c: {
    text: "text-blue-500 dark:text-blue-300",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
  },
  spi: {
    text: "text-violet-500 dark:text-violet-300",
    bg: "bg-violet-500/15",
    border: "border-violet-500/30",
  },
  uart: {
    text: "text-amber-500 dark:text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
  },
  gpio: {
    text: "text-emerald-500 dark:text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
  },
  digital: {
    text: "text-zinc-500 dark:text-zinc-200",
    bg: "bg-zinc-500/15",
    border: "border-zinc-500/30",
  },
  analog: {
    text: "text-teal-500 dark:text-teal-300",
    bg: "bg-teal-500/15",
    border: "border-teal-500/30",
  },
  pwm: {
    text: "text-fuchsia-500 dark:text-fuchsia-300",
    bg: "bg-fuchsia-500/15",
    border: "border-fuchsia-500/30",
  },
  dac: {
    text: "text-teal-500 dark:text-teal-300",
    bg: "bg-teal-500/15",
    border: "border-teal-500/30",
  },
  touch: {
    text: "text-sky-500 dark:text-sky-300",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
  },
  can: {
    text: "text-lime-500 dark:text-lime-300",
    bg: "bg-lime-500/15",
    border: "border-lime-500/30",
  },
  "1wire": {
    text: "text-cyan-500 dark:text-cyan-300",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
  },
  swd: {
    text: "text-indigo-500 dark:text-indigo-300",
    bg: "bg-indigo-500/15",
    border: "border-indigo-500/30",
  },
  jtag: {
    text: "text-indigo-500 dark:text-indigo-300",
    bg: "bg-indigo-500/15",
    border: "border-indigo-500/30",
  },
  other: {
    text: "text-zinc-500 dark:text-zinc-200",
    bg: "bg-zinc-500/15",
    border: "border-zinc-500/30",
  },
};

export function getSignalVisual(type: CircuitSignalType, mode: NetColorMode): SignalVisual {
  if (mode === "neutral") return NEUTRAL_VISUAL;
  if (mode === "mono") return MONO_VISUAL;
  if (mode === "vivid") return VIVID[type];
  return CLASSIC[type];
}

// ---------------------------------------------------------------------------
// Signal type resolution
// ---------------------------------------------------------------------------

function lookupDeclaredPinType(
  circuit: CircuitWiringDiagram,
  componentId: string,
  pin: string,
): CircuitSignalType | null {
  const pool = [...(circuit.boards ?? []), ...circuit.components];
  const component = pool.find((c) => c.id === componentId);
  if (!component?.pins) return null;
  for (const item of component.pins) {
    const def = normalizeCircuitPin(item);
    if (def.pin.toLowerCase() === pin.toLowerCase() && def.type) {
      return def.type;
    }
  }
  return null;
}

const GROUND_PATTERN = /\b(gnd|ground|vss|agnd|dgnd|v-)\b/;
const POWER_PATTERN = /\b(vcc|vdd|vin|vbus|vbat|vsys|v\+|3v3|3\.3v|5v|12v|9v|24v|power)\b/;
const I2C_PATTERN = /\b(sda|scl|i2c|twi)\b/;
const SPI_PATTERN = /\b(mosi|miso|sck|sclk|spi|cs|ss)\b/;
const UART_PATTERN = /\b(txd?|rxd?|uart|serial)\b/;
const CAN_PATTERN = /\b(can|h|l)\b/;
const SWD_PATTERN = /\b(swdio|swclk|swd)\b/;
const JTAG_PATTERN = /\b(tck|tms|tdi|tdo|trst|jtag)\b/;
const PWM_PATTERN = /\b(pwm|servo)\b/;
const TOUCH_PATTERN = /\b(touch|cap)\b/;
const DAC_PATTERN = /\b(dac|aout)\b/;
const ONE_WIRE_PATTERN = /\b(1wire|onewire|dq)\b/;
const ANALOG_PIN_PATTERN = /\b(a\d+|adc)\b/;
const GPIO_PIN_PATTERN = /\b(gpio|gp)\d*\b/;
const DIGITAL_PIN_PATTERN = /\bd\d+\b/;

function inferSignalTypeFromNames(conn: CircuitConnection): CircuitSignalType {
  const hay = `${conn.signal ?? ""} ${conn.from.pin} ${conn.to.pin}`.toLowerCase();
  if (GROUND_PATTERN.test(hay)) return "ground";
  if (POWER_PATTERN.test(hay)) return "power";
  if (I2C_PATTERN.test(hay)) return "i2c";
  if (SPI_PATTERN.test(hay)) return "spi";
  if (UART_PATTERN.test(hay)) return "uart";
  if (SWD_PATTERN.test(hay)) return "swd";
  if (JTAG_PATTERN.test(hay)) return "jtag";
  if (PWM_PATTERN.test(hay)) return "pwm";
  if (DAC_PATTERN.test(hay)) return "dac";
  if (TOUCH_PATTERN.test(hay)) return "touch";
  if (ONE_WIRE_PATTERN.test(hay)) return "1wire";
  if (CAN_PATTERN.test(hay)) return "can";
  if (ANALOG_PIN_PATTERN.test(hay)) return "analog";
  if (GPIO_PIN_PATTERN.test(hay)) return "gpio";
  if (DIGITAL_PIN_PATTERN.test(hay)) return "digital";
  return "other";
}

/**
 * Resolve the signal class of a connection: explicit `signalType` first, then
 * a declared pin definition type, then well-known pin/net naming conventions
 * (GND, VCC, SDA, MOSI, TX...). Falls back to "other".
 */
export function resolveConnectionSignal(
  conn: CircuitConnection,
  circuit: CircuitWiringDiagram,
): CircuitSignalType {
  if (conn.signalType) return conn.signalType;
  const declared =
    lookupDeclaredPinType(circuit, conn.from.componentId, conn.from.pin) ??
    lookupDeclaredPinType(circuit, conn.to.componentId, conn.to.pin);
  if (declared) return declared;
  return inferSignalTypeFromNames(conn);
}

// ---------------------------------------------------------------------------
// Recommended jumper wire colors
// ---------------------------------------------------------------------------

const SIGNAL_WIRE_COLORS: Record<CircuitSignalType, string> = {
  power: "red",
  ground: "black",
  i2c: "blue",
  spi: "purple",
  uart: "yellow",
  gpio: "green",
  digital: "green",
  analog: "white",
  pwm: "orange",
  dac: "white",
  touch: "white",
  can: "gray",
  "1wire": "white",
  swd: "blue",
  jtag: "brown",
  other: "gray",
};

/**
 * Recommend a physical jumper color for a connection, refined per pin the way
 * engineers color breadboard busses (SCL yellow / SDA blue, TX orange /
 * RX yellow, ...). Used when the circuit does not declare a wire color.
 */
export function deriveWireColorName(
  conn: CircuitConnection,
  signalType: CircuitSignalType,
): string {
  const hay = `${conn.signal ?? ""} ${conn.from.pin} ${conn.to.pin}`.toLowerCase();
  const match = (pattern: RegExp, color: string): string | null =>
    pattern.test(hay) ? color : null;
  switch (signalType) {
    case "i2c":
      return match(/\b(scl|sclk|clk)\b/, "yellow") ?? match(/\b(sda|data)\b/, "blue") ?? "blue";
    case "spi":
      return (
        match(/\b(sck|sclk|clk)\b/, "yellow") ??
        match(/\bmosi\b/, "green") ??
        match(/\bmiso\b/, "blue") ??
        match(/\b(cs|ss)\b/, "orange") ??
        "purple"
      );
    case "uart":
      return match(/\btxd?\b/, "orange") ?? match(/\brxd?\b/, "yellow") ?? "yellow";
    case "swd":
      return match(/\b(swclk|clk)\b/, "yellow") ?? match(/\b(swdio|dio)\b/, "blue") ?? "blue";
    default:
      return SIGNAL_WIRE_COLORS[signalType] ?? "gray";
  }
}
