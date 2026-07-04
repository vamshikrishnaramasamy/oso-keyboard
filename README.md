# OSO Keyboard

Demo: https://vamshikrishnaramasamy.github.io/oso-keyboard/

Repository/README: https://github.com/vamshikrishnaramasamy/oso-keyboard

OSO Keyboard is an open-source 75% mechanical keyboard project with a custom
ESP32-S3 programmable PCB target, USB/BLE/Wi-Fi firmware plans, and parametric CAD.

Current design target:

- 82-key 75% ANSI layout with a flush hot-swappable OSO module bay
- Onboard ESP32-S3-WROOM-1U module as the main brain
- USB-C
- 10-contact programmable module dock replacing the Esc/F1 corner
- ESP-IDF/TinyUSB wired firmware target, with BLE/Wi-Fi config planned
- MX hotswap switch footprints
- PCB-mounted stabilizers
- Factory-assembled SMD diodes and ESP32-S3 support parts

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

## Reviewer File Map

PCB source files:

- KiCad project: `hardware/kicad/oso75/oso75.kicad_pro`
- KiCad schematic: `hardware/kicad/oso75/oso75.kicad_sch`
- KiCad PCB: `hardware/kicad/oso75/oso75.kicad_pcb`
- Order-ready Gerbers/BOM/CPL: `hardware/kicad/oso75/fab/`

CAD source and exports:

- Parametric CAD source: `hardware/cad/build123d/oso75_case.py`
- Full assembly render: `hardware/cad/build123d/oso75_preview_exploded.png`
- Full assembly STEP/GLB: `hardware/cad/build123d/oso75_assembly.step` and
  `hardware/cad/build123d/oso75_assembly.glb`
- Split case top: `hardware/cad/build123d/oso75_case_bezel.step/.stl`
- Split case bottom: `hardware/cad/build123d/oso75_case_bottom.step/.stl`
- Switch plate: `hardware/cad/build123d/oso75_plate.step/.stl`
- Module bay cover: `hardware/cad/build123d/oso75_bay_cover.step/.stl`

## Status

This is the first hardware bring-up pass. The layout, firmware skeleton, CAD
plate/case model, ESP32-S3 pin plan, PCB circuit netlists, and KiCad board
starting point are in place.

2026-06-10: a full orientation audit against the proven annovax75 reference
found the PCB was **physically mirrored** (rows y-inverted: a built board would
have had `~` on the right and Enter on the left). The board was y-flipped
(placements mirrored, every footprint rotated 180°, diodes re-seated at the
x-mirrored offset about their switch) and re-routed from scratch. KiCad 10.0.3
reports 0 DRC errors and 0 unconnected items; drill files reconcile exactly.
The CAD model was already correct and is byte-identical across the fix.

**Order only `hardware/kicad/oso75/fab/oso75_order_ready_v2_gerbers.zip`** (plus
`oso75_order_ready_v2_pos.csv` and the BOM CSVs). Anything prefixed
`STALE-MIRRORED-DO-NOT-ORDER-` is the mirrored board and must not be ordered.
See `hardware/kicad/oso75/fab/README_ORDER_READY.md`.
