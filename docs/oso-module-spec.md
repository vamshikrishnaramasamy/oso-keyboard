# OSO Module Developer Spec (Rev A)

How to build a module for the OSO75's hot-swap bay — and how to make
*any* ESP32-compatible peripheral work in it.

## The big picture

The bay is a **3.3 V I2C + GPIO dock** wired straight to the keyboard's
ESP32-S3. There is no connector on the keyboard side: the board exposes
ten ENIG gold contact pads plus two retention holes, and the **module
carries the spring contacts** (pogo pins). Anything that talks I2C — which
is most of the ESP32 peripheral ecosystem: OLEDs, sensors, IO expanders,
LED drivers, touch controllers — can be a module. Rotary encoders and
other 2-wire devices use the dedicated GPIO pair instead.

Rev A is **power-off swap only**. Unplug the keyboard before inserting or
removing a module.

## Electrical interface (J3, verified against routed copper)

| Pin | Net | ESP32-S3 side | Use |
|---:|---|---|---|
| 1 | GND | — | Ground |
| 2 | +3V3 | LDO rail | Main module power |
| 3 | VBUS_FUSED | fused 5 V | Optional, for LEDs (about 300-350 mA continuous bus-powered budget) |
| 4 | I2C_SDA | GPIO41 | I2C data |
| 5 | I2C_SCL | GPIO42 | I2C clock |
| 6 | MOD_A | GPIO39 | Encoder A / free GPIO |
| 7 | MOD_B | GPIO40 | Encoder B / free GPIO |
| 8 | MOD_INT | GPIO47 | Interrupt / module-present detect |
| 9 | ESP_EN | EN | Module-side reset (use with care) |
| 10 | GND | — | Ground |

Rules:

- **3.3 V logic only.** The ESP32-S3 is not 5 V tolerant. VBUS_FUSED may
  only feed loads (LEDs, displays' backlight boost), never logic levels.
- I2C pull-ups live on the keyboard PCB; do not add strong pull-ups on
  the module (weak 10 k extras are tolerable).
- **MOD_INT doubles as presence detect**: tie it to GND through 10 k on
  the module if you don't need an interrupt, or drive it open-drain if
  you do. Firmware reads "low at boot = module present."
- Total continuous 3V3 draw ≤ 80 mA on rev A; total continuous VBUS_FUSED draw ≤ 300-350 mA on bus power. F1 has a 500 mA hold current, but the keyboard electronics share the USB current budget.

## Mechanical interface (from the routed board, J3 at canvas 38.0, 30.5)

- Bay opening through the plate: **54.6 × 25.6 mm**; module PCB max
  **54.0 × 25.0 mm**, 1.6 mm thick, corners R ≤ 2 mm.
- Contact pads on the keyboard: ten **2.2 × 5.0 mm** pads on a **3.8 mm
  pitch**, in one row, centers at y = +5.2 mm from bay center, pad 1 at
  x = +17.1 mm running to pad 10 at x = −17.1 mm (J3 is placed rotated
  180°, so pad 1 is toward the board's left edge — copy the footprint
  `OSO75.pretty` J3 rather than re-deriving).
- Retention: two **Ø3.6 mm NPTH** at x = ±21.0 mm, y = 0 — use snap
  posts or M3 shoulder screws from the module side.
- **Polarization (required)**: chamfer the module PCB's back-left corner
  5 mm at 45°. The plate opening carries a 2.2 mm corner key there, so an
  unchamfered or wrongly-oriented module will not seat — protecting the
  I2C pins from the 5 V/EN contacts.
- Contacts: **Mill-Max 0965** SMT spring pins (2.79 mm extended, ~2.5 mm
  at rated mid-stroke, 2 A each) soldered to the module's bottom pads.
- Use **spring-loaded (pogo) contacts ≥ 1 mm travel** on the module
  underside, mirrored to the pad row. Recommended: Mill-Max 855/0965
  series or a 10-pin pogo block on 3.8 mm pitch.
- Height budget above the plate: keep the module ≤ 9 mm proud (keycap
  top is ~9.5 mm above the plate) so it doesn't dominate the board.
- When no module is fitted, the printed **bay blank**
  (`hardware/cad/build123d/oso75_bay_cover.stl`) snaps into the opening.

## Making "everything ESP32-compatible" work: the adapter module

You don't need a custom PCB per peripheral. Build (or buy the design of)
one **Qwiic/STEMMA-QT adapter module**: a 54 × 25 bay PCB with pogo
contacts on the bottom and one or two **JST-SH 4-pin Qwiic connectors**
on top, wiring 3V3/GND/SDA/SCL straight through.

**This board exists**: `hardware/kicad/oso-module-carrier/` — DRC-clean,
routed, gerbers in `fab/`. It also carries an optional XIAO ESP32-S3
socket, turning it into a self-contained smart module (own firmware, own
USB-C through the bay) with the bay I2C as the keyboard link; solder
jumpers select the mode. See its README.

That one adapter makes the entire Qwiic/STEMMA-QT catalog — hundreds of
SparkFun/Adafruit boards: OLED and e-ink displays, IMUs, environmental
sensors, GPS, NFC, keypads, haptics — plug into the keyboard with zero
soldering, because they're all 3.3 V I2C with on-board addresses, exactly
what the bay speaks. Encoder/analog peripherals use a second adapter
variant that breaks MOD_A/MOD_B out to a header.

## Firmware contract

- Bus: I2C0 on GPIO41/42 at 400 kHz, 3.3 V.
- At boot (and on MOD_INT edge), firmware scans the bus and matches known
  addresses (e.g. 0x3C SSD1306 OLED, 0x76/0x77 BME280, ...) to enable the
  right driver; unknown modules still get raw I2C via host commands.
- Encoders on MOD_A/MOD_B use the QMK encoder driver; MOD_INT is the
  shared interrupt line.
- Modules must tolerate an undriven bus (keyboard in deep sleep for BLE).

## Checklist for a new module

1. Start from the J3 footprint in `hardware/kicad/oso75/OSO75.pretty`.
2. 54 × 25 × 1.6 PCB, pogo pins mirrored to the pad row, posts at ±21.
3. 3.3 V logic, I2C device(s) with non-conflicting addresses.
4. MOD_INT strap for presence detect.
5. Stay under 80 mA continuous on 3V3 / 300-350 mA continuous on VBUS_FUSED for rev A bus power.
6. Power off to swap (Rev A).
