# OSO75 Initial BOM

This BOM is split between parts we want assembled on the PCB and parts the builder
installs manually.

## PCB Factory Assembly

| Qty | Part | Notes |
|---:|---|---|
| 1 | RP2040 | Onboard MCU |
| 1 | 16MB QSPI flash | Prefer W25Q128-compatible footprint |
| 1 | 12 MHz crystal | RP2040 reference design |
| 82 | 1N4148W SOD-123 diodes | One per physical switch, factory assembled |
| 1 | USB-C receptacle | USB 2.0 device wiring |
| 1 | 10-contact module dock | Pogo pads or low-profile board-to-board connector for OSO bay |
| 1 | Module bay current limit/fuse | Protect optional 5 V accessory modules |
| 1 | USB ESD protection | Near USB-C port |
| 2 | 5.1k CC resistors | USB-C device mode |
| 1 | Reset tactile switch | SMD or through-hole |
| 1 | Boot tactile switch | For UF2 flashing |
| many | 0402/0603 passives | Per RP2040 reference schematic |

## Builder Assembly

| Qty | Part | Current pick |
|---:|---|---|
| 82-90 | MX switches | Gateron Milky Yellow Pro V3 or MMD Princess V4 |
| 82 | Kailh MX hotswap sockets | Only if not factory assembled |
| 1 set | PCB screw-in stabilizers | 6.25u + 2u set |
| 1 | Plate | Generated from OpenSCAD or laser-cut DXF later |
| 1 | Case | Generated from OpenSCAD tray model |
| 1 | USB-C cable | Data-capable cable |

## Optional OSO Bay Modules

| Module idea | Main parts |
|---|---|
| Volume knob | Rotary encoder, knob, small module PCB |
| OLED status screen | 0.91-1.3 inch I2C OLED, module PCB |
| Slider/macropanel | Potentiometer or linear Hall sensor, module PCB |
| LED widget | Addressable LEDs with current limiting |

