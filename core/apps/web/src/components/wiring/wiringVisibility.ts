import type { CircuitWiringDiagram } from "@embedino/contracts";
import { getCircuitPeripherals } from "@embedino/contracts";

const INTERNAL_COMPONENT_PATTERN =
  /\b(?:onboard|on-board|built-in|built in|integrated|internally connected)\b/i;

/**
 * Older assistant messages can contain wiring documents for peripherals that
 * are already connected by PCB traces. Suppress only diagrams whose overall
 * description and every peripheral explicitly identify that internal status.
 */
export function isInternalOnlyWiring(circuit: CircuitWiringDiagram): boolean {
  const circuitText = `${circuit.title}\n${circuit.description ?? ""}`;
  if (!INTERNAL_COMPONENT_PATTERN.test(circuitText)) return false;

  const peripherals = getCircuitPeripherals(circuit);
  return (
    peripherals.length > 0 &&
    peripherals.every((component) =>
      INTERNAL_COMPONENT_PATTERN.test(`${component.name}\n${component.notes ?? ""}`),
    )
  );
}
