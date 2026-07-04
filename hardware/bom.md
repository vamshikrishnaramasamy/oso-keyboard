# OSO75 Initial BOM

This BOM is split between parts we want assembled on the PCB and parts the builder
installs manually.

## PCB Factory Assembly

| Qty | Part | Notes |
|---:|---|---|
| 1 | ESP32-S3-WROOM-1U-N16 | Main MCU module with native USB, Wi-Fi, BLE, 16 MB flash, and external IPEX antenna connector |
| 1 | 2.4 GHz IPEX/u.FL antenna | Required only for BLE/Wi-Fi range; wired USB works without it |
| 82 | 1N4148W SOD-123 diodes | One per physical switch; pad 1/cathode band faces ROW net |
| 1 | USB-C receptacle | USB 2.0 device wiring |
| 1 | Exposed OSO module bay pads | PCB copper only; no factory connector fitted, no paste |
| 1 | Littelfuse 0603L050SLYR PPTC fuse | Protects optional 5 V accessory modules |
| 2 | 5.1k 0603 resistors | USB-C device mode CC pulldowns |
| 2 | 27R 0603 resistors | USB D+/D- series resistors |
| 3 | 10k 0603 resistors | EN, BOOT, and module interrupt/present pullups |
| 2 | 10uF 10V 0603 capacitors | LDO input/output bulk caps |
| 2 | 100nF 0603 capacitors | ESP32 local decoupling |
| 1 | 1uF 0603 capacitor | ESP_EN reset delay |
| 1 | Reset tactile switch | Pulls EN low |
| 1 | Boot tactile switch | Pulls GPIO0 low for ROM download mode |

## Builder Assembly

| Qty | Part | Current pick |
|---:|---|---|
| 82 required, 90 suggested | MX switches | Gateron Milky Yellow Pro V3 or MMD Princess V4 |
| 82 | Kailh MX hotswap sockets | Only if not factory assembled |
| 1 set | PCB screw-in stabilizers | 6.25u + 2u set |
| 1 | Plate | Production file: `hardware/cad/build123d/oso75_plate.step` / `.stl`; use 1.5 mm metal/FR4/POM for the final |
| 1 | Case | Production files: `hardware/cad/build123d/oso75_case_bottom.step` + `oso75_case_bezel.step`; OpenSCAD files are deprecated concept previews only |
| 1 | USB-C cable | Data-capable cable |

## Optional OSO Bay Modules

| Module idea | Main parts |
|---|---|
| Volume knob | Rotary encoder, knob, small module PCB |
| OLED status screen | 0.91-1.3 inch I2C OLED, module PCB |
| Slider/macropanel | Potentiometer or linear Hall sensor, module PCB |
| LED widget | Addressable LEDs with current limiting |

