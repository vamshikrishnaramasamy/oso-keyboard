# OSO Keyboard

Demo: https://vamshikrishnaramasamy.github.io/oso-keyboard/

Repository/README: https://github.com/vamshikrishnaramasamy/oso-keyboard

OSO Keyboard is an open-source 75% mechanical keyboard project with a custom
programmable PCB target, QMK firmware, and parametric CAD.

Current design target:

- 84-key 75% ANSI layout
- Onboard RP2040 microcontroller
- USB-C
- QMK/VIA-ready firmware
- MX hotswap switch footprints
- PCB-mounted stabilizers
- Factory-assembled SMD diodes and RP2040 support parts

The project is intentionally source-driven: edit `hardware/layout/oso75.layout.json`,
then run the generator to refresh firmware layout metadata, CAD key positions,
PCB circuit netlists, and the KiCad starting project.

## Quick Start

```sh
npm run generate
npm run validate
```

Generated CAD lives in `hardware/cad/generated/`. The KiCad project lives in
`hardware/kicad/oso75/`.

## Status

This is the first hardware bring-up pass. The layout, firmware skeleton, CAD
plate/case model, RP2040 pin plan, PCB circuit netlists, and KiCad board
starting point are in place.

The KiCad board currently loads in KiCad 10 and has an error-only DRC report with
0 violations, but it is not fab-ready yet. The remaining work is routing the
unconnected matrix/controller nets, adding mounting and stabilizer holes, tuning
the USB routing, and exporting final Gerbers.
