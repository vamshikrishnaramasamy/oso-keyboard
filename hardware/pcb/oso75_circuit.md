# OSO75 Circuit Design

This circuit pass makes the ESP32-S3 the main keyboard brain. The computer plugs
into the keyboard's USB-C port, and the ESP32-S3 enumerates as the USB HID
keyboard while also owning BLE, Wi-Fi, and the hot-swappable OSO module bay.

## Electrical Target

- MCU: onboard ESP32-S3-WROOM-1U-N16 module with external IPEX/u.FL antenna connector. Do not substitute N16R8/R16V/Octal-PSRAM variants.
- Firmware: ESP-IDF + TinyUSB first; BLE/Wi-Fi config after wired USB is stable.
- Matrix: 6 rows x 16 columns, 82 populated switch positions.
- Module bay replaces: Esc, F1.
- Diode direction: `COL2ROW`.
- Builder soldering target: switches/stabilizers only. SMD diodes and controller
  support parts should be factory assembled.

## Switch Matrix

Each key uses this net order:

```text
COLn -> switch -> diode anode -> diode cathode -> ROWm
```

The SOD-123 diode footprint intentionally uses pad 1 as the cathode/ROW-side pad.
The cathode band and `K` mark face the ROW net on the assembly drawing.

### Rows

| Net | ESP32-S3 pin | Populated keys |
|---|---|---:|
| ROW0 | U1 GPIO1 | 12 switches |
| ROW1 | U1 GPIO2 | 16 switches |
| ROW2 | U1 GPIO4 | 16 switches |
| ROW3 | U1 GPIO5 | 15 switches |
| ROW4 | U1 GPIO6 | 13 switches |
| ROW5 | U1 GPIO7 | 10 switches |

### Columns

| Net | ESP32-S3 pin | Populated keys |
|---|---|---:|
| COL0 | U1 GPIO8 | 5 switches |
| COL1 | U1 GPIO9 | 5 switches |
| COL2 | U1 GPIO10 | 6 switches |
| COL3 | U1 GPIO11 | 5 switches |
| COL4 | U1 GPIO12 | 5 switches |
| COL5 | U1 GPIO13 | 5 switches |
| COL6 | U1 GPIO14 | 6 switches |
| COL7 | U1 GPIO15 | 5 switches |
| COL8 | U1 GPIO16 | 5 switches |
| COL9 | U1 GPIO17 | 6 switches |
| COL10 | U1 GPIO18 | 6 switches |
| COL11 | U1 GPIO21 | 6 switches |
| COL12 | U1 GPIO35 | 4 switches |
| COL13 | U1 GPIO36 | 4 switches |
| COL14 | U1 GPIO37 | 5 switches |
| COL15 | U1 GPIO38 | 4 switches |

GPIO35/GPIO36/GPIO37 are only valid because the target module is ESP32-S3-WROOM-1U-N16,
not an Octal-PSRAM N16R8/R16V module.

## USB-C And Power

- J1 is a USB-C receptacle wired as a USB 2.0 device.
- CC1 and CC2 each get a 5.1k pulldown to GND.
- D+ and D- route from J1 through 27R series resistors to ESP32-S3 GPIO20/GPIO19 native USB.
- USB ESD protection is not fitted in this routed rev; add a USBLC6-class part during the next USB reroute instead of dropping it into the current crowded fanout.
- VBUS feeds U3, a 3.3 V LDO such as AP2112K-3.3.
- AP2112K pinout: pin 1 VIN=VBUS, pin 2 GND, pin 3 EN=VBUS, pin 4 NC, pin 5 VOUT=+3V3.
- F1 is a Littelfuse 0603L050SLYR 0603 PPTC fuse. It creates a current-limited
  VBUS_FUSED rail for optional 5 V module loads.
- C1 and C2 are 10uF 10V 0603 bulk capacitors at LDO input/output.

## ESP32-S3 Support

- U1 is an ESP32-S3-WROOM-1U module, so flash, crystal, RF matching, and the IPEX antenna connector are inside the module.
- Fit a compatible 2.4 GHz IPEX/u.FL antenna if BLE/Wi-Fi will be used. Wired USB keyboard mode works without the antenna.
- SW_RESET pulls EN low.
- C_EN is 1uF from ESP_EN to GND for the ESP32-S3 EN reset delay.
- SW_BOOT pulls GPIO0 low for ROM download mode.
- GPIO47 routes to the OSO bay as module-present or interrupt.
- GPIO39/GPIO40 route to the OSO bay for encoder/GPIO use.
- GPIO41/GPIO42 route to the OSO bay for I2C OLED/sensor modules.
- GPIO19/GPIO20 are reserved for USB D-/D+ and are not used by the switch matrix.
- Avoid GPIO0, GPIO3, GPIO45, and GPIO46 for ordinary matrix wiring because they affect boot/strapping.

## OSO Module Bay

The keyboard PCB side is exposed ENIG copper pads plus two retention holes, not a
factory-assembled pogo or mezzanine connector. Put the spring contacts on the
removable module side. Rev A is **power-off swap only**: unplug the keyboard
before inserting or removing modules.

| Pin | Net | Use |
|---:|---|---|
| 1 | GND | Ground |
| 2 | +3V3 | Main module power |
| 3 | VBUS_FUSED | Optional 5 V for LEDs/modules |
| 4 | I2C_SDA | OLED/sensor data |
| 5 | I2C_SCL | OLED/sensor clock |
| 6 | MOD_A | Encoder A / GPIO |
| 7 | MOD_B | Encoder B / GPIO |
| 8 | MOD_INT | Interrupt or module-present detect |
| 9 | ESP_EN | Optional module reset/programming signal |
| 10 | GND | Ground |

Keep modules 3.3 V logic by default. Any 5 V LED module should include its own
current limiting and should not pull more than the 500 mA hold budget set by F1.
Do not live-swap rev A modules. A later live-swap revision needs ground-first
contact, keyboard-side signal resistors, GPIO ESD protection, and 3.3 V current
limiting/load switching.

Fab note: J3 is intentional exposed contact copper. Do not place a component, do
not paste/stencil the pads, and use ENIG at minimum; choose hard gold if modules
will be swapped often.

## Layout Rules

- Put J1, R3, and R4 close together at the rear USB port.
- Keep D+/D- short, parallel, and away from the switch matrix where possible.
- Keep the WROOM-1U module body clear of switch/stabilizer mechanical courtyards; wireless RF depends on the external antenna and cable placement, not a PCB antenna area.
- Place 10uF bulk and 100nF local decoupling near the module 3V3 pins.
- Route rows horizontally and columns vertically where possible.
- Put the SOD-123 diode near each hotswap socket; cathode stripe/pad 1 goes to the row net.
- Keep the top-left bay clear for J3, retention holes, and module mechanical fit.
- Use a solid ground fill on both layers, stitched around USB and MCU.

## Generated Files

- `oso75_matrix_netlist.csv`: one switch/diode row per key.
- `oso75_esp32s3_netlist.csv`: MCU module, USB, power, buttons, module bay, and headers.
- `oso75_components.csv`: component list with footprints and assembly intent.
- `oso75_placement.csv`: switch and diode coordinates from the keyboard layout.

