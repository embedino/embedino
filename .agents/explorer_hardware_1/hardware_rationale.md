# Embedino Hardware Detection & Board Management Subsystem — Architectural Rationale & Technical Deep Dive

**Explorer Investigation Report**  
**Agent**: `explorer_hardware_1`  
**Date**: 2026-08-19  
**Scope**: Hardware Contracts, Server Services, Board Catalog, Device Association, Web State, UI Components, and AI Hardware Grounding.

---

## 1. Executive Summary

The **Hardware Detection & Board Management Subsystem** in Embedino delivers **MVP Killer Feature #2: Automatic Board & Device Detection**. In standard embedded development environments (such as raw VS Code, CLion, or Eclipse), microcontrollers are treated merely as unmanaged, anonymous serial COM ports requiring tedious and error-prone manual user configuration. Developers frequently lose time finding COM port numbers in Device Manager / `dmesg`, looking up obscure board FQBNs, configuring board baud rates, and fighting driver incompatibilities. Furthermore, general-purpose AI coding assistants lack physical hardware grounding and regularly hallucinate wrong pin numbers (e.g. suggesting pin 34 for output on ESP32, which is input-only), obsolete microcontroller boards, or invalid compiler flags.

Embedino solves this fundamentally by making hardware detection **continuous, driverless, bidirectional, and grounding for AI** across the entire lifecycle:
1. **Zero-Configuration Physical Hardware Detection**: Instantly detects and recognizes connected microcontrollers and USB-to-UART bridge transceivers (CH340, CP2102, FT232R, PL2303, native USB CDC) across Windows, macOS, and Linux without native C++ compilation addons.
2. **Deterministic Context Injection for AI Assistants (Killer Feature #1 Synergy)**: Injects live hardware parameters (exact board model, microcontroller architecture, FQBN, resolved binary toolchain paths) directly into AI system prompts across all provider adapters (Claude, Codex, Cursor, Grok, OpenCode), completely eliminating AI pinout hallucinations.
3. **One-Click Build, Flash & Serial Monitor Integration (Killer Feature #3 Synergy)**: Powers seamless board selection, toolchain mismatch prevention, and one-click firmware compilation and flashing directly from the toolbar.

---

## 2. Architectural Topology & The 95/5 Modular Isolation Model

Following Embedino's **95/5 Modular Isolation Principle** (defined in `AGENTS.md`), 95% of the hardware subsystem resides in dedicated, indestructible directories that never collide during upstream `pingdotgg/t3code` pulls via Regraft.

```
embedino workspace/
├── packages/
│   ├── contracts/src/
│   │   ├── hardware/
│   │   │   └── devices.ts                 # [95%] Pure Effect Schemas & Error definitions
│   │   ├── index.ts                       # [5% Docking Port] Re-exports hardware contracts
│   │   └── rpc.ts                         # [5% Docking Port] Hardware RPC contracts & group
│   └── client-runtime/src/
│       └── rpc/client.ts                  # [5% Docking Port] hardwareSubscribeDevices stream tag
├── apps/
│   ├── server/src/
│   │   ├── hardware/
│   │   │   ├── BoardDatabase.ts           # [95%] Static catalog of 28+ boards, VID/PID maps, bridge ICs
│   │   │   ├── DeviceAssociationStore.ts  # [95%] Local disk persistence (~/.embedino/device-associations.json)
│   │   │   ├── DeviceService.ts           # [95%] Cross-platform OS port scanner & Effect stream engine
│   │   │   └── HardwareAgentPrompt.ts     # [95%] AI hardware context generator & prompt grounder
│   │   ├── auth/RpcAuthorization.ts       # [5% Docking Port] Read/Operate auth scope mappings
│   │   ├── provider/Layers/*.ts           # [5% Docking Port] Hardware prompt injection into LLM turns
│   │   └── ws.ts                          # [5% Docking Port] WebSocket RPC dispatch handlers
│   └── web/src/
│       ├── state/
│       │   └── hardware.ts                # [95%] Effect reactive atoms & subscription lifecycle hooks
│       ├── components/hardware/
│       │   ├── BoardSelectorPill.tsx      # [95%] Interactive status pill in ChatHeader
│       │   ├── BoardSelectorPopover.tsx   # [95%] Device selection dropdown & action trigger
│       │   └── BoardNamingDialog.tsx      # [95%] Custom board model identification dialog
│       ├── components/chat/ChatHeader.tsx # [5% Docking Port] Mounts <BoardSelectorPill />
│       └── components/ChatView.tsx        # [5% Docking Port] Action dispatcher & turn context injector
```

---

## 3. Subsystem Module Breakdown & Implementation Details

### 3.1 Contracts Layer (`packages/contracts/src/hardware/devices.ts`)
Defines the shared domain model using `effect/Schema`. Pure, serialization-safe schemas validate data crossing the WebSocket RPC boundary.

```typescript
export const HardwareDeviceStatus = Schema.Literals(["identified", "generic", "enriching"]);

export const HardwareDevice = Schema.Struct({
  id: Schema.String,               // Synthetic ID: "${vid}:${pid}:${port}"
  port: Schema.String,             // Raw OS path: "COM3", "/dev/ttyUSB0", "/dev/cu.usbserial-1420"
  portDisplayName: Schema.String,  // Clean UI label: "COM3", "ttyUSB0", "usbserial-1420"
  vid: Schema.NullOr(Schema.String),
  pid: Schema.NullOr(Schema.String),
  manufacturer: Schema.NullOr(Schema.String),
  boardName: Schema.NullOr(Schema.String),
  fqbn: Schema.NullOr(Schema.String),
  pioBoard: Schema.NullOr(Schema.String),
  driverChip: Schema.NullOr(Schema.String),
  status: HardwareDeviceStatus,
});
```

Key Event Schemas for WebSocket streaming:
- `HardwareSnapshotEvent`: Emits the complete list of active devices upon initial connection or topology change.
- `HardwareConnectedEvent` / `HardwareDisconnectedEvent` / `HardwareEnrichedEvent`: Granular lifecycle events.
- `DeviceAssociationInput`: User override schema storing explicit board identities for clone hardware.
- `BoardDefinition`: Static board schema used for catalog definitions.
- `HardwareDetectionError`: `Schema.TaggedErrorClass` for typed error reporting.

### 3.2 Board Database & Catalog (`apps/server/src/hardware/BoardDatabase.ts`)
Maintains an exhaustive built-in registry of microcontrollers, development boards, and USB bridge controllers:

1. **`BOARD_CATALOG`**: 28+ pre-indexed boards across major embedded ecosystems:
   - **Arduino**: Uno (ATmega328P), Mega 2560, Nano, Leonardo (ATmega32U4), Due (SAM3X8E), MKR WiFi 1010 (SAMD21), Nano Every (ATmega4809), Nano 33 IoT, Nano 33 BLE (nRF52840), Uno R4 Minima (RA4M1), Uno R4 WiFi (RA4M1).
   - **Espressif**: ESP32 Dev Module, ESP32-S2, ESP32-S3 DevKitC-1, ESP32-C3 DevKitM-1, ESP32-C6 DevKitC-1, ESP32-H2 DevKitC-1.
   - **Raspberry Pi**: Pico (RP2040), Pico W (RP2040).
   - **STMicroelectronics**: STM32 Nucleo-64 (F401RE), STM32 Discovery (F407VG), BluePill (F103C8), BlackPill (F401CC).
   - **PJRC / Teensy**: Teensy 4.0 (i.MX RT1062), Teensy 4.1, Teensy 3.2.
   - **Adafruit**: Feather M0 (SAMD21), QT Py, ItsyBitsy M4 (SAMD51), Circuit Playground Express.
   - **SparkFun**: Pro Micro (ATmega32U4), Thing Plus (ESP32).
   - **Seeed Studio**: XIAO SAMD21, Wio Terminal (SAMD51).
   - **Nordic Semiconductor**: nRF52840 DK.

2. **`VID_PID_DATABASE`**: Fast constant-time lookup `Map<string, BoardEntry>` keyed by `vid:pid`:
   - `2341:0043` -> Arduino Uno
   - `303a:1001` -> ESP32-S3 DevKit
   - `2e8a:0005` -> Raspberry Pi Pico
   - `0483:374b` -> STM32 Nucleo ST-Link
   - `16c0:0483` -> Teensy 4.0/4.1

3. **`BRIDGE_CHIP_DATABASE`**: Detection map for generic USB-to-UART transceiver chips:
   - `1a86:7523` -> WCH CH340 / CH341
   - `10c4:ea60` -> Silicon Labs CP2102
   - `10c4:ea70` -> Silicon Labs CP2104
   - `0403:6001` -> FTDI FT232R
   - `0403:6010` / `6014` -> FTDI FT232H
   - `067b:2303` -> Prolific PL2303

### 3.3 Persistent Device Association (`apps/server/src/hardware/DeviceAssociationStore.ts`)
Many low-cost microcontroller boards (e.g. NodeMCU ESP8266, generic ESP32 DevKit clones) use commodity CH340 or CP2102 bridge chips whose USB VID/PID belongs to the bridge chip manufacturer rather than Espressif. To prevent users from having to re-select their board every session:
- Embedino persists mappings in `~/.embedino/device-associations.json`.
- Mappings match on `vid:pid` and optional `usbSerialNumber`.
- When a device is scanned, `findAssociation` checks user overrides *first*, promoting generic chips to fully recognized boards immediately.

### 3.4 Cross-Platform Device Service (`apps/server/src/hardware/DeviceService.ts`)
Provides robust, driverless OS interrogation without native C++ addons (`node-serialport` or native bindings) which frequently fail during cross-platform compilation or Electron packaging:

| Platform | Discovery Strategy | Command / Sysfs Query | Extraction Technique |
|---|---|---|---|
| **Windows (`win32`)** | Non-blocking PowerShell CIM Query | `Get-CimInstance Win32_PnPEntity \| Where-Object -Property Name -Match 'COM\d+' \| Where-Object -Property Present -eq $true \| Select-Object Name, DeviceID, Manufacturer \| ConvertTo-Json` | Regex `/(COM\d+)/` + `/VID_([0-9A-Fa-f]{4})&PID_([0-9A-Fa-f]{4})/` |
| **macOS (`darwin`)** | Native System Profiler | `system_profiler SPUSBDataType -json` | Recursive tree walk matching `vendor_id`, `product_id`, `bsd_name` (`/dev/cu.*`) |
| **Linux (`linux`)** | Direct Sysfs File Inspection | `/sys/class/tty/` inspection | Reads `/sys/class/tty/<tty>/device/../idVendor` and `idProduct` |

#### Three-Tier Device Resolution Pipeline

```
[Raw Port Discovered: Port + VID + PID]
                 │
                 ▼
      [DeviceAssociationStore]
     Has user-saved override? ────(YES)───► [Status: "identified", Board: User Board]
                 │ (NO)
                 ▼
       [VID_PID_DATABASE]
     Exact Vendor Board Match? ───(YES)───► [Status: "identified", Board: Catalog Board]
                 │ (NO)
                 ▼
     [BRIDGE_CHIP_DATABASE]
    Known USB-UART Transceiver? ──(YES)───► [Status: "generic", DriverChip: "CH340/CP2102"]
                 │ (NO)
                 ▼
       [Generic Fallback] ───────────────► [Status: "generic", DriverChip: null]
```

#### Real-Time Reactive Event Stream (`subscribeDevices`)
- Encapsulated in an Effect `Stream.callback` with `Effect.acquireRelease` teardown.
- **Windows**: Efficient 2000ms polling loop via unreferenced timer (`timeout.unref()`), preventing task hangs.
- **macOS / Linux**: Hybrid reactive model using `NodeFS.watch("/dev/")` listening for `ttyUSB*`, `ttyACM*`, and `cu.usb*` with a 300ms debounce.

---

## 4. Synergy with Bring-Your-Own-Provider AI (Killer Feature #1)

A core innovation in Embedino is `HardwareAgentPrompt.ts`. In standard AI coding setups, the LLM has zero awareness of physical hardware, causing frequent bugs:
- Generating code that uses non-existent GPIO pins (e.g. claiming Pin 40 on an ESP32-WROOM).
- Writing blocking `delay()` calls inside real-time RTOS tasks.
- Specifying incorrect FQBNs or missing build flags.
- Guessing invalid serial monitor baud rates.

Embedino solves this at the root by injecting a dynamic `[EMBEDINO HARDWARE CONTEXT]` block into **every AI adapter turn** (`ClaudeAdapter`, `CodexAdapter`, `CursorAdapter`, `GrokAdapter`, `OpenCodeAdapter`).

### Injected Context Structure:
```
[EMBEDINO HARDWARE CONTEXT]
Active Toolchain: PlatformIO
Hardware State:
Selected Device:
  Port: COM3
  Board: ESP32-S3 Dev Module (FQBN: esp32:esp32:esp32s3)
  Chip: CP2102

Embedded Engineering Rules:
1. Hardware Disambiguation: If the detected board is "Generic/Unknown Board" or multiple devices are connected without a clear selection, you MUST stop and ask the user to provide the exact, full board model (e.g. "ESP32-S3-WROOM-1-N16R8").
2. Coding Standards: NEVER hardcode GPIO pin numbers — always declare them with `constexpr int` or `#define`. Prefer non-blocking patterns (millis() in Arduino, vTaskDelay() in ESP-IDF).
3. Serial Communication: Default baud rate is 115200 for both Serial.begin() and monitor config.
4. Toolchain Instructions: [Exact platformio.ini / sketch directory configuration and compiler commands using resolved binary paths].
5. Proactive Scaffolding: Automatically create full project structures for action instructions.
6. Autonomous Research: Autonomously research datasheets, pinouts, and hardware capabilities online.
7. Persona: Professional embedded engineer outputting production-ready code.
```

---

## 5. Web Frontend State & User Experience

### 5.1 Reactive State Management (`apps/web/src/state/hardware.ts`)
State is held in an Effect Reactivity Atom `hardwareStateAtom`:
- `connectedDevices`: Readonly array of active `HardwareDevice` objects.
- `activeDeviceId`: Synthetic ID of currently selected device.
- `targetBoardName`: Persisted board name (retained even when device is unplugged).
- `targetPortDisplay`: Short port display name (`COM3`, `ttyUSB0`).
- `isOnline`: Boolean tracking whether target is currently plugged in.
- `initialized`: Initial scan completion flag.

The custom React hook `useHardwareSubscription(effectiveEnvironmentId)` starts streaming immediately upon application boot via `primaryEnvironmentId`, ensuring zero lag when the user navigates into threads.

### 5.2 UI Controls (`BoardSelectorPill.tsx` & `BoardSelectorPopover.tsx`)

#### Header Integration (`BoardSelectorPill`)
- Positioned in `ChatHeader.tsx` next to project scripts, editor pickers, and Git controls.
- Displays responsive status:
  - Connected identified board: `ESP32-S3 Dev Module (COM3)`
  - Connected generic board: `USB Serial (COM3)`
  - Disconnected target: `No Board`
- Multi-device indicator chevron appears when 2 or more devices are detected.

#### Popover & Actions (`BoardSelectorPopover`)
- **Connected Boards List**: Shows all detected devices with active selection badges, spinning loader for enriching devices, and "Set Board →" for generic bridges.
- **Inline Renaming & Pencil Icon**: Direct editing of board names with keyboard shortcuts (`Enter` to save, `Escape` to cancel).
- **Direct Hardware Actions**:
  - **Flash to Board**: Triggers one-click build and upload.
  - **Serial Monitor**: Opens interactive serial communication session.
- **Toolchains Dialog Link**: Fast navigation to toolchain configuration.

#### Custom Naming Dialog (`BoardNamingDialog`)
- When a generic bridge device (e.g. generic CH340) is clicked, a dedicated dialog appears explaining why the exact board model is needed and saves the association permanently.

---

## 6. One-Click Flash & Monitor Execution Pipeline

When the developer clicks **Flash to Board** or **Serial Monitor** in `BoardSelectorPopover`, `runHardwareAction` in `ChatView.tsx` executes the following deterministic workflow:

```
[User clicks Flash / Monitor]
              │
              ▼
[Project Type Verification]
- Checks platformio.ini vs *.ino files
- Detects toolchain mismatch (e.g. PlatformIO selected on Arduino project)
- Alerts user via toast notification if mismatch detected
              │
              ▼
[Terminal Session Allocation]
- Allocates new terminal ID
- Sets terminal UI context (cwd, worktreePath)
- Spawns terminal drawer in web client
              │
              ▼
[Dynamic Command Synthesis]
PlatformIO:
- Flash:   "<pioBin>" run --target upload --upload-port "COM3"
- Monitor: "<pioBin>" device monitor --port "COM3"
Arduino CLI:
- Flash:   "<arduinoBin>" compile --upload -b "esp32:esp32:esp32s3" -p "COM3" ".\Blink"
- Monitor: "<arduinoBin>" monitor -p "COM3"
              │
              ▼
[Terminal RPC Execution]
- Sends command string via writeTerminal RPC directly into the active shell
```

**Zero PATH Dependency**: Embedino uses exact binary paths discovered by `ToolchainService` (e.g. `~/.platformio/penv/Scripts/pio.exe` or `C:\Users\...\AppData\Local\Arduino15\bin\arduino-cli.exe`), guaranteeing that flashing and monitoring work even if toolchains were never added to the operating system's global environment `PATH`.

---

## 7. Verification & Upstream Resilience Matrix

| Verification Vector | Implementation Guarantee | Upstream Pull Safety (`pingdotgg/t3code`) |
|---|---|---|
| **Contract Separation** | `packages/contracts/src/hardware/devices.ts` | 100% isolated file; registered via 1-line export in `index.ts` |
| **RPC Endpoints** | `hardwareListDevices`, `hardwareSubscribeDevices`, `hardwareSetDeviceAssociation` | Registered in `rpc.ts` and `ws.ts` in isolated blocks |
| **Cross-Platform OS Compatibility** | PowerShell (Windows), system_profiler (macOS), sysfs (Linux) | No native C++ binary addons (`node-gyp`), 100% pure TypeScript |
| **Persistence Isolation** | `~/.embedino/device-associations.json` | Stores in user home directory; decoupled from project repos |
| **State Reactivity** | Effect Atom (`Atom.make`) | Follows core T3 Code reactivity patterns seamlessly |
| **AI Prompt Injection** | `HardwareAgentPrompt.ts` injected in all provider adapters | Single helper invocation inside each adapter's turn builder |

---

## 8. Conclusion

The **Hardware Detection & Board Management Subsystem** is an exceptionally well-engineered, robust foundation for Embedino. By unifying cross-platform device discovery, persistent board matching, reactive Effect atom streaming, AI system prompt grounding, and one-click toolchain execution, it transforms Embedino from a generic AI chat assistant into an indispensable, professional embedded systems IDE.
