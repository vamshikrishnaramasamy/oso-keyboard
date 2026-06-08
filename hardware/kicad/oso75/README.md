# OSO75 KiCad Project

Generated from `hardware/layout/oso75.layout.json` and the PCB circuit netlists.

Open `oso75.kicad_pro` in KiCad 10. The board currently contains:

- 84 MX switch footprints
- 84 SOD-123 diode footprints
- 6 x 16 COL2ROW matrix nets
- RP2040 QFN-56 footprint with real package pin/net assignment
- USB-C, CC pulldowns, USB series resistors, LDO, flash, boot/reset, crystal/load caps
- Board outline with a controller/USB tail below the key field
- First-pass local switch-to-diode routing

This is an electrical/layout starting point, not a fab-ready release yet. Next pass:
route the remaining row/column/controller nets, add mounting/stabilizer holes,
tune USB diff-pair routing, run interactive KiCad DRC, and export Gerbers after review.
