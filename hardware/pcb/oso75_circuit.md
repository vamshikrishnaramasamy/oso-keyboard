# OSO75 Circuit Design

This is the first real circuit pass for the OSO75 custom PCB. It defines the MCU
support circuit, USB-C input, matrix wiring, diode direction, and assembly intent.
Use the generated CSV files next to this document as the source of truth for
schematic capture.

## Electrical Target

- MCU: onboard RP2040, QFN-56.
- Firmware: QMK/VIA-compatible matrix using native USB.
- Matrix: 6 rows x 16 columns, 84 populated switch positions.
- Diode direction: `COL2ROW`.
- Builder soldering target: switches/stabilizers only. SMD diodes and controller
  support parts should be factory assembled.

## Switch Matrix

Each key uses this net order:

```text
COLn -> switch -> diode anode -> diode cathode -> ROWm
```

That matches QMK `COL2ROW`: conventional current flows from the selected column
through the switch and diode into the sensed row.

### Rows

| Net | RP2040 pin | Populated keys |
|---|---|---:|
| ROW0 | U1 GP0 | 14 switches |
| ROW1 | U1 GP1 | 16 switches |
| ROW2 | U1 GP2 | 16 switches |
| ROW3 | U1 GP3 | 15 switches |
| ROW4 | U1 GP4 | 13 switches |
| ROW5 | U1 GP5 | 10 switches |

### Columns

| Net | RP2040 pin | Populated keys |
|---|---|---:|
| COL0 | U1 GP6 | 6 switches |
| COL1 | U1 GP7 | 6 switches |
| COL2 | U1 GP8 | 6 switches |
| COL3 | U1 GP9 | 6 switches |
| COL4 | U1 GP10 | 6 switches |
| COL5 | U1 GP11 | 6 switches |
| COL6 | U1 GP12 | 6 switches |
| COL7 | U1 GP13 | 6 switches |
| COL8 | U1 GP14 | 6 switches |
| COL9 | U1 GP15 | 6 switches |
| COL10 | U1 GP16 | 5 switches |
| COL11 | U1 GP17 | 5 switches |
| COL12 | U1 GP18 | 5 switches |
| COL13 | U1 GP19 | 4 switches |
| COL14 | U1 GP20 | 3 switches |
| COL15 | U1 GP21 | 2 switches |

## USB-C And Power

- J1 is a USB-C receptacle wired as a USB 2.0 device.
- CC1 and CC2 each get a 5.1k pulldown to GND.
- D+ and D- route from J1 through U4 ESD protection, then through 27R series
  resistors to RP2040 USB_DP/USB_DM.
- VBUS feeds U3, a 3.3 V LDO such as AP2112K-3.3.
- C1 and C2 are 10uF bulk capacitors at LDO input/output.
- R7/R8 create a 100k/100k VBUS sense divider into GP24.

## RP2040 Support

- U2 is a 16 MB QSPI flash such as W25Q128JVSIQ.
- Y1 is a 12 MHz crystal with load capacitors sized to the chosen crystal.
- SW_RESET pulls RUN low.
- SW_BOOT pulls FLASH_CS_N/QSPI_SS low for UF2 bootloader entry.
- J2 exposes 3V3, SWDIO, SWCLK, and GND for rescue/debug.
- GP22 drives a status LED through R9.
- GP26/GP27 are reserved for an optional encoder.
- GP28/GP29 are reserved for optional I2C expansion.

## Layout Rules

- Put J1, U4, R3, and R4 close together at the front USB port.
- Keep D+/D- short, parallel, and away from the switch matrix where possible.
- Put U1, U2, Y1, and their decoupling caps in one controller cluster.
- Place one 100nF cap near each RP2040 supply pin group and one near U2.
- Route rows horizontally and columns vertically where possible.
- Put the SOD-123 diode near each hotswap socket; cathode stripe goes to the row net.
- Use a solid ground fill on both layers, stitched around USB and MCU.

## Generated Files

- `oso75_matrix_netlist.csv`: one switch/diode row per key.
- `oso75_rp2040_netlist.csv`: MCU, USB, power, flash, crystal, buttons, and headers.
- `oso75_components.csv`: component list with footprints and assembly intent.
- `oso75_placement.csv`: switch and diode coordinates from the keyboard layout.

