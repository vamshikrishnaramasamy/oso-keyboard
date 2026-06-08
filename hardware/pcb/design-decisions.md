# PCB Design Decisions

## Decision: Custom Programmable PCB

OSO75 will use a custom PCB instead of relying on an existing YMD75-style PCB.

Reasons:

- Better open-source hardware story for Stardance.
- We control the layout, pinout, silkscreen, and future variants.
- Onboard RP2040 gives more firmware space than ATmega32U4 Pro Micro boards.
- SMD diodes and RP2040 support components can be factory assembled.
- Builders should only need to install switches, stabilizers, and case hardware.

## Reference Backup

The YMD75v3 / 75V3 QMK hotswap PCB remains a good backup reference because it is
already programmable and has sockets/diodes populated. It is not the primary OSO75
hardware target.

## First PCB Scope

The first KiCad pass should include:

- RP2040, 16MB flash, crystal, regulator, USB-C, ESD, boot, reset.
- 6 x 16 COL2ROW keyboard matrix.
- 84 MX hotswap sockets.
- 84 SOD-123 diodes.
- PCB-mount stabilizer holes.
- Mounting holes aligned to the generated case.
- Clear silkscreen labels for rows, columns, and switch positions.

## Manufacturing Target

Use JLCPCB or PCBWay for the first custom PCB run. AliExpress is fine for switches,
stabilizers, screws, and other builder-installed parts, but custom PCBs are better
ordered from an actual PCB fab.

