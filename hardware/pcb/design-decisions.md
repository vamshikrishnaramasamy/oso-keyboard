# PCB Design Decisions

## Decision: Custom Programmable PCB

OSO75 will use a custom PCB instead of relying on an existing YMD75-style PCB.

Reasons:

- Better open-source hardware story for Stardance.
- We control the layout, pinout, silkscreen, and future variants.
- Onboard ESP32-S3 gives native USB plus BLE/Wi-Fi for the module ecosystem.
- SMD diodes and ESP32-S3 support components can be factory assembled.
- Builders should only need to install switches, stabilizers, and case hardware.

## Decision: Top-Left Hot-Swappable Module Bay

OSO75 includes a flush top-left accessory bay as the signature customizable feature.
The bay is meant for small user-created modules that can be swapped without
redesigning the whole keyboard: a volume knob, OLED display, slider, macro
display, sensor board, or other programmable widget.

The base keyboard exposes power plus a small general-purpose interface through a
keyed 10-contact dock. The default pinout reserves I2C for displays/sensors,
two GPIOs for a rotary encoder, one interrupt/module-present pin, reset, 3.3 V,
optional fused 5 V, and ground.

Mechanical intent:

- A visible top-left recessed pocket inside the normal keyboard outline, not a
  protruding tab or full-width empty strip.
- Two small retention/mounting holes for module plates or screws.
- A 10-contact pad strip for pogo pins or a low-profile board-to-board connector.
- Modules should be independently open-source and printable/fabbable.

## Reference Backup

The YMD75v3 / 75V3 QMK hotswap PCB remains a good backup reference because it is
already programmable and has sockets/diodes populated. It is not the primary OSO75
hardware target.

## First PCB Scope

The first KiCad pass should include:

- ESP32-S3-WROOM-1U module, regulator, USB-C, ESD, boot, reset, and external antenna.
- 6 x 16 COL2ROW keyboard matrix.
- 82 MX hotswap sockets.
- 82 SOD-123 diodes.
- Top-left OSO module bay connector, 10 exposed contacts, retention holes, and mechanical keepout.
- PCB-mount stabilizer holes.
- Mounting holes aligned to the generated case.
- Clear silkscreen labels for rows, columns, and switch positions.

## Manufacturing Target

Use JLCPCB or PCBWay for the first custom PCB run. AliExpress is fine for switches,
stabilizers, screws, and other builder-installed parts, but custom PCBs are better
ordered from an actual PCB fab.
