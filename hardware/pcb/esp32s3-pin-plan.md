# OSO75 ESP32-S3 Pin Plan

The custom PCB target uses an onboard ESP32-S3-WROOM-1U-N16 module and a 6 x 16
keyboard matrix. GPIO19/GPIO20 stay reserved for native USB so the computer plugs
directly into the ESP32-S3. Use an external 2.4 GHz IPEX/u.FL antenna for BLE/Wi-Fi.

## Matrix

| Signal | Pins |
|---|---|
| Rows | GPIO1, GPIO2, GPIO4, GPIO5, GPIO6, GPIO7 |
| Columns | GPIO8, GPIO9, GPIO10, GPIO11, GPIO12, GPIO13, GPIO14, GPIO15, GPIO16, GPIO17, GPIO18, GPIO21, GPIO35, GPIO36, GPIO37, GPIO38 |
| Diode direction | COL2ROW |
| Per-key wiring | COLn -> switch -> diode anode -> diode cathode -> ROWm |
| Diode footprint | Pad 1 is cathode/ROW side; pad 2 is anode/switch side |
| Module bay replaced positions | Esc, F1 |

GPIO35/GPIO36/GPIO37 are not available on Octal-PSRAM ESP32-S3-WROOM-1U variants,
so do not substitute an N16R8/R16V module without rerouting COL12-COL14.

## Reserved Pins

| Purpose | Pin |
|---|---|
| USB D- / D+ | GPIO19 / GPIO20 |
| Boot/download | GPIO0, pulled up; BOOT switch pulls low |
| Reset/enable | EN, pulled up; RESET switch pulls low |
| OSO module interrupt/present | GPIO47 |
| OSO module encoder/GPIO | GPIO39 / GPIO40 |
| OSO module I2C | GPIO41 / GPIO42 |
| Avoid for matrix | GPIO0, GPIO3, GPIO19, GPIO20, GPIO45, GPIO46 |

## OSO Module Bay

| Pin | Net | Use |
|---:|---|---|
| 1 | GND | Ground |
| 2 | +3V3 | Main module power |
| 3 | VBUS_FUSED | Optional 5 V input for LEDs, through fuse/current limit |
| 4 | I2C_SDA / GPIO41 | OLED/sensor data |
| 5 | I2C_SCL / GPIO42 | OLED/sensor clock |
| 6 | MOD_A / GPIO39 | Encoder A / GPIO / SPI option |
| 7 | MOD_B / GPIO40 | Encoder B / GPIO / SPI option |
| 8 | MOD_INT / GPIO47 | Interrupt, button, or module-present detect |
| 9 | ESP_EN | Optional module reset/programming signal |
| 10 | GND | Ground / shield |

Keep modules 3.3 V logic by default. Any 5 V LED module should include its own
current limiting and should not pull more than the 500 mA hold budget set by F1.
Rev A is power-off swap only. Do not insert or remove modules while powered.

## Assembly Intent

JLCPCB/PCBWay should assemble the ESP32-S3-WROOM-1U-N16 module, USB-C connector, reset/boot buttons, SMD diodes, regulator, fuse,
and passives. Do not allow N16R8/R16V/Octal-PSRAM ESP32-S3 substitutes. J3 is PCB copper only and should be excluded from factory assembly.
Kailh hotswap sockets may be factory assembled or hand-soldered, but the BOM/CPL must match that choice. The builder should only need to install switches,
stabilizers, and case hardware when sockets are factory assembled.

See `oso75_circuit.md`, `oso75_matrix_netlist.csv`, and
`oso75_esp32s3_netlist.csv` for the actual circuit nets.
