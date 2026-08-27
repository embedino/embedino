import type { CircuitWiringDiagram } from "@embedino/contracts";

export const sampleEsp32WeatherStation: CircuitWiringDiagram = {
  id: "esp32-weather-station",
  title: "ESP32 Environmental Station with OLED & Status LED",
  description: "3.3V I2C multi-sensor node with SSD1306 display and ambient light detector",
  boards: [
    {
      id: "esp32",
      name: "ESP32-WROOM-32 DevKit",
      mcu: "ESP32",
      operatingVoltage: "3.3V",
      pins: [
        { pin: "3V3", label: "3.3V Power Out", type: "power" },
        { pin: "GND", label: "Ground", type: "ground" },
        { pin: "GPIO21", label: "I2C SDA", type: "i2c" },
        { pin: "GPIO22", label: "I2C SCL", type: "i2c" },
        { pin: "GPIO2", label: "Status LED", type: "pwm" },
        { pin: "GPIO34", label: "ADC1_CH6 LDR", type: "analog" },
      ],
    },
  ],
  components: [
    {
      id: "bme280",
      name: "BME280 Temperature, Humidity & Pressure Sensor",
      type: "sensor",
      partNumber: "BME280",
      operatingVoltage: "3.3V",
      notes: "Default I2C Address 0x76",
    },
    {
      id: "oled",
      name: "0.96 inch SSD1306 I2C OLED Display",
      type: "display",
      partNumber: "SSD1306",
      operatingVoltage: "3.3V",
      notes: "Default I2C Address 0x3C",
    },
    {
      id: "led",
      name: "Status Blue LED",
      type: "passive",
      operatingVoltage: "3.3V",
      value: "220Ω series resistor",
    },
  ],
  connections: [
    {
      from: { componentId: "esp32", pin: "3V3" },
      to: { componentId: "bme280", pin: "VCC" },
      signalType: "power",
      signal: "3.3V",
      wireColor: "red",
      voltage: "3.3V",
    },
    {
      from: { componentId: "esp32", pin: "GND" },
      to: { componentId: "bme280", pin: "GND" },
      signalType: "ground",
      signal: "GND",
      wireColor: "black",
    },
    {
      from: { componentId: "esp32", pin: "GPIO21" },
      to: { componentId: "bme280", pin: "SDA" },
      signalType: "i2c",
      signal: "I2C SDA",
      wireColor: "blue",
    },
    {
      from: { componentId: "esp32", pin: "GPIO22" },
      to: { componentId: "bme280", pin: "SCL" },
      signalType: "i2c",
      signal: "I2C SCL",
      wireColor: "yellow",
    },
    {
      from: { componentId: "esp32", pin: "3V3" },
      to: { componentId: "oled", pin: "VCC" },
      signalType: "power",
      signal: "3.3V",
      wireColor: "red",
      voltage: "3.3V",
    },
    {
      from: { componentId: "esp32", pin: "GND" },
      to: { componentId: "oled", pin: "GND" },
      signalType: "ground",
      signal: "GND",
      wireColor: "black",
    },
    {
      from: { componentId: "esp32", pin: "GPIO21" },
      to: { componentId: "oled", pin: "SDA" },
      signalType: "i2c",
      signal: "I2C SDA",
      wireColor: "blue",
    },
    {
      from: { componentId: "esp32", pin: "GPIO22" },
      to: { componentId: "oled", pin: "SCL" },
      signalType: "i2c",
      signal: "I2C SCL",
      wireColor: "yellow",
    },
    {
      from: { componentId: "esp32", pin: "GPIO2" },
      to: { componentId: "led", pin: "ANODE" },
      signalType: "pwm",
      signal: "Status PWM",
      wireColor: "green",
      notes: "Requires 220 Ohm current-limiting resistor",
    },
    {
      from: { componentId: "esp32", pin: "GND" },
      to: { componentId: "led", pin: "CATHODE" },
      signalType: "ground",
      signal: "GND",
      wireColor: "black",
    },
  ],
  warnings: [
    {
      level: "warning",
      message: "ESP32 GPIO pins are 3.3V tolerant only. Do not supply 5V to any GPIO.",
      affectedComponents: ["esp32", "bme280"],
    },
  ],
};

export const sampleArduinoMotorDriver: CircuitWiringDiagram = {
  id: "arduino-l298n-robot",
  title: "Arduino Uno R3 with L298N Dual Motor Driver",
  description: "5V robotics platform with ultrasonic distance sensing",
  boards: [
    {
      id: "uno",
      name: "Arduino Uno R3",
      mcu: "ATmega328P",
      operatingVoltage: "5V",
    },
  ],
  components: [
    {
      id: "l298n",
      name: "L298N Dual H-Bridge Motor Driver",
      type: "actuator",
      operatingVoltage: "5V-12V",
    },
    {
      id: "hcsr04",
      name: "HC-SR04 Ultrasonic Distance Sensor",
      type: "sensor",
      operatingVoltage: "5V",
    },
  ],
  connections: [
    {
      from: { componentId: "uno", pin: "5V" },
      to: { componentId: "hcsr04", pin: "VCC" },
      signalType: "power",
      wireColor: "red",
    },
    {
      from: { componentId: "uno", pin: "GND" },
      to: { componentId: "hcsr04", pin: "GND" },
      signalType: "ground",
      wireColor: "black",
    },
    {
      from: { componentId: "uno", pin: "D9" },
      to: { componentId: "hcsr04", pin: "TRIG" },
      signalType: "gpio",
      wireColor: "yellow",
    },
    {
      from: { componentId: "uno", pin: "D10" },
      to: { componentId: "hcsr04", pin: "ECHO" },
      signalType: "gpio",
      wireColor: "blue",
    },
  ],
};

export const samplePicoSpiDisplay: CircuitWiringDiagram = {
  id: "pico-st7789-display",
  title: "Raspberry Pi Pico with ST7789 SPI Display",
  description: "3.3V high speed SPI LCD UI with rotary encoder input",
  boards: [
    {
      id: "pico",
      name: "Raspberry Pi Pico",
      mcu: "RP2040",
      operatingVoltage: "3.3V",
    },
  ],
  components: [
    {
      id: "st7789",
      name: "ST7789 240x240 IPS Color Display",
      type: "display",
      operatingVoltage: "3.3V",
    },
  ],
  connections: [
    {
      from: { componentId: "pico", pin: "GP18" },
      to: { componentId: "st7789", pin: "SCL" },
      signalType: "spi",
      signal: "SPI0 SCK",
      wireColor: "yellow",
    },
    {
      from: { componentId: "pico", pin: "GP19" },
      to: { componentId: "st7789", pin: "SDA" },
      signalType: "spi",
      signal: "SPI0 MOSI",
      wireColor: "blue",
    },
  ],
};

export const sampleInvalidCircuitJson = `{
  "title": "Invalid Circuit",
  "missing_required_fields": true
}`;
