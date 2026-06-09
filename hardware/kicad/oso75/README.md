# OSO75 KiCad Project

Generated from `hardware/layout/oso75.layout.json` and the PCB circuit netlists.

Open `oso75.kicad_pro` in KiCad 10. The board currently contains:

- 82 MX switch footprints; Esc and F1 are replaced by the module bay
- 82 SOD-123 diode footprints
- 6 x 16 COL2ROW matrix nets
- RP2040 QFN-56 footprint with real package pin/net assignment
- Flush top-left J3 OSO module bay footprint with 10 exposed contacts and two retention holes
- F1 fused 5 V module rail and R10 module-present/interrupt pullup
- USB-C, CC pulldowns, USB series resistors, LDO, flash, boot/reset, crystal/load caps
- Board outline sized to the generated case: 346.613 mm x 137.063 mm
- First-pass local switch-to-diode routing

This is an electrical/layout starting point, not a fab-ready release yet. Next pass:
route the remaining row/column/controller/module nets, add stabilizer holes,
tune USB diff-pair routing, run interactive KiCad DRC, and export Gerbers after review.
