# OSO75 RP2040 Pin Plan

The first custom PCB target uses an onboard RP2040 and a 6 x 16 keyboard matrix.
This gives 96 matrix positions for the 84 physical keys, leaving spare positions for
future encoder, macro, or alternate layout variants.

## Matrix

| Signal | Pins |
|---|---|
| Rows | GP0, GP1, GP2, GP3, GP4, GP5 |
| Columns | GP6, GP7, GP8, GP9, GP10, GP11, GP12, GP13, GP14, GP15, GP16, GP17, GP18, GP19, GP20, GP21 |
| Diode direction | COL2ROW |
| Per-key wiring | COLn -> switch -> diode anode -> diode cathode -> ROWm |

## Reserved Pins

| Purpose | Pin |
|---|---|
| USB D+ / D- | RP2040 native USB_DP / USB_DM pins |
| USB VBUS sense | GP24 through 100k/100k divider |
| Status LED | GP22 |
| OSO module interrupt/present | GP25 |
| OSO module encoder/GPIO | GP26 / GP27 |
| OSO module I2C | GP28 / GP29 |
| Reset | RUN pulled high, reset switch pulls low |
| Boot | QSPI_SS/FLASH_CS_N pulled high, boot switch pulls low |
| Debug | SWDIO / SWCLK on optional header |

## OSO Module Bay

The top-left bay is a hot-swappable accessory dock for small user-programmable
modules: rotary encoder/volume knob, OLED status screen, slider, macro display,
touch strip, sensor board, or debugging widget.

Proposed connector: 10 spring contacts or a low-profile board-to-board mezzanine
connector, keyed mechanically by the case recess.

| Pin | Net | Use |
|---:|---|---|
| 1 | GND | Ground |
| 2 | +3V3 | Main module power |
| 3 | VBUS_FUSED | Optional 5 V input for LEDs, through fuse/current limit |
| 4 | I2C_SDA / GP28 | OLED/sensor data |
| 5 | I2C_SCL / GP29 | OLED/sensor clock |
| 6 | MOD_A / GP26 | Encoder A / GPIO / SPI option |
| 7 | MOD_B / GP27 | Encoder B / GPIO / SPI option |
| 8 | MOD_INT / GP25 | Interrupt, button, or module-present detect |
| 9 | RESET_N | Optional module reset/programming signal |
| 10 | GND | Ground / shield |

Keep modules 3.3 V logic by default. Any 5 V LED module should include its own
current limiting and should not pull more than the budget set by the PCB fuse.

## Assembly Intent

JLCPCB/PCBWay should assemble the RP2040, crystal, flash, USB-C connector,
ESD protection, reset/boot buttons, SMD diodes, the OSO bay dock, and passives.
The builder should only need to install switches, stabilizers, and case hardware.

See `oso75_circuit.md`, `oso75_matrix_netlist.csv`, and
`oso75_rp2040_netlist.csv` for the actual circuit nets.
