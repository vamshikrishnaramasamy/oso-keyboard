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
| Optional encoder A/B | GP26 / GP27 |
| Optional OLED I2C | GP28 / GP29 |
| Reset | RUN pulled high, reset switch pulls low |
| Boot | QSPI_SS/FLASH_CS_N pulled high, boot switch pulls low |
| Debug | SWDIO / SWCLK on optional header |

## Assembly Intent

JLCPCB/PCBWay should assemble the RP2040, crystal, flash, USB-C connector,
ESD protection, reset/boot buttons, SMD diodes, and passives. The builder should
only need to install switches, stabilizers, and case hardware.

See `oso75_circuit.md`, `oso75_matrix_netlist.csv`, and
`oso75_rp2040_netlist.csv` for the actual circuit nets.
