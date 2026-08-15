export interface BoardEntry {
  name: string;
  mcu?: string;
  fqbn?: string;
  pioBoard?: string;
  defaultBaudRate?: number;
  vendor: string;
}

export const BOARD_CATALOG: readonly BoardEntry[] = [
  // Arduino
  {
    name: "Arduino Uno",
    vendor: "Arduino",
    mcu: "ATmega328P",
    fqbn: "arduino:avr:uno",
    pioBoard: "uno",
  },
  {
    name: "Arduino Mega 2560",
    vendor: "Arduino",
    mcu: "ATmega2560",
    fqbn: "arduino:avr:mega",
    pioBoard: "megaatmega2560",
  },
  {
    name: "Arduino Nano",
    vendor: "Arduino",
    mcu: "ATmega328P",
    fqbn: "arduino:avr:nano",
    pioBoard: "nanoatmega328",
  },
  {
    name: "Arduino Leonardo",
    vendor: "Arduino",
    mcu: "ATmega32U4",
    fqbn: "arduino:avr:leonardo",
    pioBoard: "leonardo",
  },
  {
    name: "Arduino Due",
    vendor: "Arduino",
    mcu: "AT91SAM3X8E",
    fqbn: "arduino:sam:arduino_due_x",
    pioBoard: "due",
  },
  {
    name: "Arduino MKR WiFi 1010",
    vendor: "Arduino",
    mcu: "SAMD21G18A",
    fqbn: "arduino:samd:mkrwifi1010",
    pioBoard: "mkrwifi1010",
  },
  {
    name: "Arduino Nano Every",
    vendor: "Arduino",
    mcu: "ATMega4809",
    fqbn: "arduino:megaavr:nona4809",
    pioBoard: "nano_every",
  },
  {
    name: "Arduino Nano 33 IoT",
    vendor: "Arduino",
    mcu: "SAMD21G18A",
    fqbn: "arduino:samd:nano_33_iot",
    pioBoard: "nano_33_iot",
  },
  {
    name: "Arduino Nano 33 BLE",
    vendor: "Arduino",
    mcu: "nRF52840",
    fqbn: "arduino:mbed_nano:nano33ble",
    pioBoard: "nano33ble",
  },
  {
    name: "Arduino Uno R4 Minima",
    vendor: "Arduino",
    mcu: "RA4M1",
    fqbn: "arduino:renesas_uno:minima",
    pioBoard: "uno_r4_minima",
  },
  {
    name: "Arduino Uno R4 WiFi",
    vendor: "Arduino",
    mcu: "RA4M1",
    fqbn: "arduino:renesas_uno:unor4wifi",
    pioBoard: "uno_r4_wifi",
  },
  // Espressif
  {
    name: "ESP32 Dev Module",
    vendor: "Espressif",
    mcu: "ESP32",
    fqbn: "esp32:esp32:esp32",
    pioBoard: "esp32dev",
  },
  {
    name: "ESP32-S2 Dev Module",
    vendor: "Espressif",
    mcu: "ESP32-S2",
    fqbn: "esp32:esp32:esp32s2",
    pioBoard: "esp32-s2-saola-1",
  },
  {
    name: "ESP32-S3 Dev Module",
    vendor: "Espressif",
    mcu: "ESP32-S3",
    fqbn: "esp32:esp32:esp32s3",
    pioBoard: "esp32-s3-devkitc-1",
  },
  {
    name: "ESP32-C3 Dev Module",
    vendor: "Espressif",
    mcu: "ESP32-C3",
    fqbn: "esp32:esp32:esp32c3",
    pioBoard: "esp32-c3-devkitm-1",
  },
  {
    name: "ESP32-C6 Dev Module",
    vendor: "Espressif",
    mcu: "ESP32-C6",
    fqbn: "esp32:esp32:esp32c6",
    pioBoard: "esp32-c6-devkitc-1",
  },
  {
    name: "ESP32-H2 Dev Module",
    vendor: "Espressif",
    mcu: "ESP32-H2",
    fqbn: "esp32:esp32:esp32h2",
    pioBoard: "esp32-h2-devkitc-1",
  },
  // Raspberry Pi
  {
    name: "Raspberry Pi Pico",
    vendor: "Raspberry Pi",
    mcu: "RP2040",
    fqbn: "rp2040:rp2040:rpipico",
    pioBoard: "pico",
  },
  {
    name: "Raspberry Pi Pico W",
    vendor: "Raspberry Pi",
    mcu: "RP2040",
    fqbn: "rp2040:rp2040:rpipicow",
    pioBoard: "picow",
  },
  // STMicroelectronics
  {
    name: "STM32 Nucleo-64",
    vendor: "STMicroelectronics",
    mcu: "STM32",
    fqbn: "STMicroelectronics:stm32:Nucleo_64",
    pioBoard: "nucleo_f401re",
  },
  {
    name: "STM32 Discovery",
    vendor: "STMicroelectronics",
    mcu: "STM32",
    fqbn: "STMicroelectronics:stm32:Discovery",
    pioBoard: "disco_f407vg",
  },
  {
    name: "BluePill F103C8",
    vendor: "STMicroelectronics",
    mcu: "STM32F103C8T6",
    fqbn: "STMicroelectronics:stm32:GenF1",
    pioBoard: "bluepill_f103c8",
  },
  {
    name: "BlackPill F401CC",
    vendor: "STMicroelectronics",
    mcu: "STM32F401CCU6",
    fqbn: "STMicroelectronics:stm32:GenF4",
    pioBoard: "blackpill_f401cc",
  },
  // PJRC/Teensy
  {
    name: "Teensy 4.0",
    vendor: "PJRC",
    mcu: "i.MX RT1062",
    fqbn: "teensy:avr:teensy40",
    pioBoard: "teensy40",
  },
  {
    name: "Teensy 4.1",
    vendor: "PJRC",
    mcu: "i.MX RT1062",
    fqbn: "teensy:avr:teensy41",
    pioBoard: "teensy41",
  },
  {
    name: "Teensy 3.2",
    vendor: "PJRC",
    mcu: "MK20DX256",
    fqbn: "teensy:avr:teensy31",
    pioBoard: "teensy31",
  },
  // Adafruit
  {
    name: "Adafruit Feather M0",
    vendor: "Adafruit",
    mcu: "SAMD21G18A",
    fqbn: "adafruit:samd:adafruit_feather_m0",
    pioBoard: "adafruit_feather_m0",
  },
  {
    name: "Adafruit QT Py",
    vendor: "Adafruit",
    mcu: "SAMD21E18A",
    fqbn: "adafruit:samd:adafruit_qtpy_m0",
    pioBoard: "adafruit_qtpy_m0",
  },
  {
    name: "Adafruit ItsyBitsy M4",
    vendor: "Adafruit",
    mcu: "SAMD51G19A",
    fqbn: "adafruit:samd:adafruit_itsybitsy_m4",
    pioBoard: "adafruit_itsybitsy_m4",
  },
  {
    name: "Adafruit Circuit Playground Express",
    vendor: "Adafruit",
    mcu: "SAMD21G18A",
    fqbn: "adafruit:samd:adafruit_circuitplayground_m0",
    pioBoard: "adafruit_circuitplayground_m0",
  },
  // SparkFun
  {
    name: "SparkFun Pro Micro",
    vendor: "SparkFun",
    mcu: "ATmega32U4",
    fqbn: "SparkFun:avr:promicro",
    pioBoard: "sparkfun_promicro16",
  },
  {
    name: "SparkFun Thing Plus",
    vendor: "SparkFun",
    mcu: "ESP32",
    fqbn: "esp32:esp32:sparkfun_thing_plus_esp32",
    pioBoard: "sparkfun_thing_plus",
  },
  // Seeed Studio
  {
    name: "Seeed XIAO SAMD21",
    vendor: "Seeed Studio",
    mcu: "SAMD21G18A",
    fqbn: "Seeeduino:samd:seeed_XIAO_m0",
    pioBoard: "seeed_xiao",
  },
  {
    name: "Seeed Wio Terminal",
    vendor: "Seeed Studio",
    mcu: "SAMD51P19A",
    fqbn: "Seeeduino:samd:seeed_wio_terminal",
    pioBoard: "seeed_wio_terminal",
  },
  // Nordic
  {
    name: "Nordic nRF52840 DK",
    vendor: "Nordic",
    mcu: "nRF52840",
    fqbn: "sandeepmistry:nRF5:nRF52840_DK",
    pioBoard: "nrf52840_dk",
  },
];

export const VID_PID_DATABASE: ReadonlyMap<string, BoardEntry> = new Map([
  [
    "2341:0043",
    {
      name: "Arduino Uno",
      vendor: "Arduino",
      mcu: "ATmega328P",
      fqbn: "arduino:avr:uno",
      pioBoard: "uno",
    },
  ],
  [
    "2341:0042",
    {
      name: "Arduino Mega 2560",
      vendor: "Arduino",
      mcu: "ATmega2560",
      fqbn: "arduino:avr:mega",
      pioBoard: "megaatmega2560",
    },
  ],
  [
    "2341:8036",
    {
      name: "Arduino Leonardo",
      vendor: "Arduino",
      mcu: "ATmega32U4",
      fqbn: "arduino:avr:leonardo",
      pioBoard: "leonardo",
    },
  ],
  [
    "2341:003d",
    {
      name: "Arduino Due",
      vendor: "Arduino",
      mcu: "AT91SAM3X8E",
      fqbn: "arduino:sam:arduino_due_x",
      pioBoard: "due",
    },
  ],
  [
    "2341:8054",
    {
      name: "Arduino MKR WiFi 1010",
      vendor: "Arduino",
      mcu: "SAMD21G18A",
      fqbn: "arduino:samd:mkrwifi1010",
      pioBoard: "mkrwifi1010",
    },
  ],
  [
    "2341:0058",
    {
      name: "Arduino Nano Every",
      vendor: "Arduino",
      mcu: "ATMega4809",
      fqbn: "arduino:megaavr:nona4809",
      pioBoard: "nano_every",
    },
  ],
  [
    "2341:8057",
    {
      name: "Arduino Nano 33 IoT",
      vendor: "Arduino",
      mcu: "SAMD21G18A",
      fqbn: "arduino:samd:nano_33_iot",
      pioBoard: "nano_33_iot",
    },
  ],
  [
    "2341:805a",
    {
      name: "Arduino Nano 33 BLE",
      vendor: "Arduino",
      mcu: "nRF52840",
      fqbn: "arduino:mbed_nano:nano33ble",
      pioBoard: "nano33ble",
    },
  ],
  [
    "2341:0069",
    {
      name: "Arduino Uno R4 Minima",
      vendor: "Arduino",
      mcu: "RA4M1",
      fqbn: "arduino:renesas_uno:minima",
      pioBoard: "uno_r4_minima",
    },
  ],
  [
    "2341:1002",
    {
      name: "Arduino Uno R4 WiFi",
      vendor: "Arduino",
      mcu: "RA4M1",
      fqbn: "arduino:renesas_uno:unor4wifi",
      pioBoard: "uno_r4_wifi",
    },
  ],
  [
    "303a:0002",
    {
      name: "ESP32-S2",
      vendor: "Espressif",
      mcu: "ESP32-S2",
      fqbn: "esp32:esp32:esp32s2",
      pioBoard: "esp32-s2-saola-1",
    },
  ],
  [
    "303a:1001",
    {
      name: "ESP32-S3",
      vendor: "Espressif",
      mcu: "ESP32-S3",
      fqbn: "esp32:esp32:esp32s3",
      pioBoard: "esp32-s3-devkitc-1",
    },
  ],
  [
    "2e8a:0005",
    {
      name: "Raspberry Pi Pico",
      vendor: "Raspberry Pi",
      mcu: "RP2040",
      fqbn: "rp2040:rp2040:rpipico",
      pioBoard: "pico",
    },
  ],
  [
    "2e8a:000a",
    {
      name: "Raspberry Pi Pico W",
      vendor: "Raspberry Pi",
      mcu: "RP2040",
      fqbn: "rp2040:rp2040:rpipicow",
      pioBoard: "picow",
    },
  ],
  [
    "0483:374b",
    {
      name: "STM32 Nucleo",
      vendor: "STMicroelectronics",
      mcu: "STM32",
      fqbn: "STMicroelectronics:stm32:Nucleo_64",
      pioBoard: "nucleo_f401re",
    },
  ],
  [
    "0483:3748",
    {
      name: "STM32 Discovery",
      vendor: "STMicroelectronics",
      mcu: "STM32",
      fqbn: "STMicroelectronics:stm32:Discovery",
      pioBoard: "disco_f407vg",
    },
  ],
  [
    "0483:5740",
    {
      name: "BluePill F103C8",
      vendor: "STMicroelectronics",
      mcu: "STM32F103C8T6",
      fqbn: "STMicroelectronics:stm32:GenF1",
      pioBoard: "bluepill_f103c8",
    },
  ],
  [
    "16c0:0483",
    {
      name: "Teensy 4.0/4.1",
      vendor: "PJRC",
      mcu: "i.MX RT1062",
      fqbn: "teensy:avr:teensy40",
      pioBoard: "teensy40",
    },
  ],
  [
    "239a:800b",
    {
      name: "Adafruit Feather M0",
      vendor: "Adafruit",
      mcu: "SAMD21G18A",
      fqbn: "adafruit:samd:adafruit_feather_m0",
      pioBoard: "adafruit_feather_m0",
    },
  ],
  [
    "239a:80cb",
    {
      name: "Adafruit QT Py",
      vendor: "Adafruit",
      mcu: "SAMD21E18A",
      fqbn: "adafruit:samd:adafruit_qtpy_m0",
      pioBoard: "adafruit_qtpy_m0",
    },
  ],
  [
    "239a:8031",
    {
      name: "Adafruit ItsyBitsy M4",
      vendor: "Adafruit",
      mcu: "SAMD51G19A",
      fqbn: "adafruit:samd:adafruit_itsybitsy_m4",
      pioBoard: "adafruit_itsybitsy_m4",
    },
  ],
  [
    "239a:8018",
    {
      name: "Adafruit Circuit Playground",
      vendor: "Adafruit",
      mcu: "SAMD21G18A",
      fqbn: "adafruit:samd:adafruit_circuitplayground_m0",
      pioBoard: "adafruit_circuitplayground_m0",
    },
  ],
  [
    "1b4f:9206",
    {
      name: "SparkFun Pro Micro",
      vendor: "SparkFun",
      mcu: "ATmega32U4",
      fqbn: "SparkFun:avr:promicro",
      pioBoard: "sparkfun_promicro16",
    },
  ],
  [
    "1b4f:0026",
    {
      name: "SparkFun Thing Plus",
      vendor: "SparkFun",
      mcu: "ESP32",
      fqbn: "esp32:esp32:sparkfun_thing_plus_esp32",
      pioBoard: "sparkfun_thing_plus",
    },
  ],
  [
    "2886:802f",
    {
      name: "Seeed Studio XIAO",
      vendor: "Seeed Studio",
      mcu: "SAMD21G18A",
      fqbn: "Seeeduino:samd:seeed_XIAO_m0",
      pioBoard: "seeed_xiao",
    },
  ],
  [
    "2886:802d",
    {
      name: "Seeed Studio Wio Terminal",
      vendor: "Seeed Studio",
      mcu: "SAMD51P19A",
      fqbn: "Seeeduino:samd:seeed_wio_terminal",
      pioBoard: "seeed_wio_terminal",
    },
  ],
  [
    "1915:521f",
    {
      name: "Nordic nRF52840 DK",
      vendor: "Nordic",
      mcu: "nRF52840",
      fqbn: "sandeepmistry:nRF5:nRF52840_DK",
      pioBoard: "nrf52840_dk",
    },
  ],
]);

export const BRIDGE_CHIP_DATABASE: ReadonlyMap<string, string> = new Map([
  ["1a86:7523", "CH340"],
  ["10c4:ea60", "CP2102"],
  ["10c4:ea70", "CP2104"],
  ["0403:6001", "FT232R"],
  ["0403:6010", "FT232H"],
  ["0403:6014", "FT232H"],
  ["067b:2303", "PL2303"],
]);

export function lookupByVidPid(vid: string, pid: string): BoardEntry | null {
  const key = `${vid.toLowerCase()}:${pid.toLowerCase()}`;
  return VID_PID_DATABASE.get(key) || null;
}

export function lookupBridgeChip(vid: string, pid: string): string | null {
  const key = `${vid.toLowerCase()}:${pid.toLowerCase()}`;
  return BRIDGE_CHIP_DATABASE.get(key) || null;
}

export function searchBoards(query: string): readonly BoardEntry[] {
  const lowerQuery = query.toLowerCase();
  return BOARD_CATALOG.filter(
    (board) =>
      board.name.toLowerCase().includes(lowerQuery) ||
      (board.mcu && board.mcu.toLowerCase().includes(lowerQuery)) ||
      board.vendor.toLowerCase().includes(lowerQuery),
  );
}
