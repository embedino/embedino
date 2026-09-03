// @effect-diagnostics nodeBuiltinImport:off globalConsole:off
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeOS from "node:os";

export interface StoredAssociation {
  vid: string;
  pid: string;
  usbSerialNumber?: string;
  boardName: string;
  fqbn?: string;
  pioBoard?: string;
}

export interface AssociationStoreData {
  associations: StoredAssociation[];
}

const STORE_DIR = NodePath.join(NodeOS.homedir(), ".embedino");
const STORE_FILE = NodePath.join(STORE_DIR, "device-associations.json");

export function loadAssociations(): StoredAssociation[] {
  try {
    if (NodeFS.existsSync(STORE_FILE)) {
      const data = NodeFS.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(data) as AssociationStoreData;
      return parsed.associations || [];
    }
  } catch (error) {
    console.error("Failed to load device associations:", error);
  }
  return [];
}

export function saveAssociation(association: StoredAssociation): void {
  try {
    if (!NodeFS.existsSync(STORE_DIR)) {
      NodeFS.mkdirSync(STORE_DIR, { recursive: true });
    }
    const associations = loadAssociations();
    const existingIndex = associations.findIndex(
      (a) =>
        a.vid === association.vid &&
        a.pid === association.pid &&
        a.usbSerialNumber === association.usbSerialNumber,
    );

    if (existingIndex >= 0) {
      associations[existingIndex] = association;
    } else {
      associations.push(association);
    }

    const data: AssociationStoreData = { associations };
    NodeFS.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save device association:", error);
  }
}

export function findAssociation(
  vid: string,
  pid: string,
  serialNumber?: string,
): StoredAssociation | null {
  return findAssociationIn(loadAssociations(), vid, pid, serialNumber);
}

export function findAssociationIn(
  associations: readonly StoredAssociation[],
  vid: string,
  pid: string,
  serialNumber?: string,
): StoredAssociation | null {
  return (
    associations.find(
      (a) =>
        a.vid.toLowerCase() === vid.toLowerCase() &&
        a.pid.toLowerCase() === pid.toLowerCase() &&
        (serialNumber ? a.usbSerialNumber === serialNumber : a.usbSerialNumber === undefined),
    ) || null
  );
}
