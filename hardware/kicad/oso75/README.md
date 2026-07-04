# OSO75 KiCad Project

Generated from `hardware/layout/oso75.layout.json` and the PCB circuit netlists,
then hand-finished for fabrication. **Do not re-run `scripts/generate-kicad.mjs`
over this board** - it would clobber the routing and the real footprints below.

Open `oso75.kicad_pro` in KiCad 10. The board contains:

- 82 Kailh MX hotswap switch footprints (cloned from the proven annovax75
  reference board: 3.05 mm plated contact holes, 4.0 mm center / 1.75 mm
  fixation NPTH, F.Cu SMD socket pads); Esc and F1 are replaced by the module bay
- 82 SOD-123 diode footprints, 6 x 16 COL2ROW matrix
- ESP32-S3-WROOM-1U-N16 module with native USB and an external IPEX/u.FL
  antenna connector. Do not substitute N16R8/R16V/Octal-PSRAM variants;
  GPIO35/GPIO36/GPIO37 are used by the key matrix.
- USB-C receptacle `Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12` (J1)
  from the official KiCad library, shield pads solid-connected to GND
- Cherry PCB-mount stabilizer holes (3.048 / 3.988 mm NPTH) for Backspace,
  Enter, LShift (2u wires) and Space (6.25u)
- Flush top-left J3 OSO module bay with 10 contacts and two retention holes.
  Rev A is power-off swappable only; do not live-swap powered modules.
- F1 fused 5 V module rail, R10 module-present pullup, LDO, CC pulldowns,
  USB series resistors, boot/reset, strapping support
- Board outline 337.088 mm x 150.063 mm; GND pours on both copper layers
  with stitching vias

## Status: y-flipped, re-routed, DRC error-clean, ready for prototype fab review

2026-06-10 (evening): **the board was physically mirrored** - all previous
passes (including the Oracle audit) had the rows y-inverted relative to the
proven annovax75 convention, so a built board would have had `~` on the right
and Enter on the left. Fixed by mirroring every footprint placement about the
horizontal centerline (y -> 150.063 - y, each part rotated 180 deg so
y-asymmetric features land correctly; parts are physical and cannot be
mirrored), repositioning each diode at the x-mirrored offset about its own
switch (restores the proven pad clearances), and re-routing from scratch.
The KiCad canvas now reads like a normal keyboard: USB/ESP32 band and the
J3 bay at the top-left, F-row beneath, space row at the bottom.
Current package: `fab/oso75_order_ready_v2_gerbers.zip`; everything prefixed
`STALE-MIRRORED-DO-NOT-ORDER-` is the mirrored board and must not be ordered.

- Oracle review found blocking electrical issues in the previous pass; those
  are fixed in the checked-in board.
- U1 is locked to ESP32-S3-WROOM-1U-N16. Do not substitute N16R8/R16V or other
  Octal-PSRAM ESP32-S3 variants because GPIO35/GPIO36/GPIO37 are matrix columns.
- U3 is wired as:
  pin 1 VIN=VBUS, pin 2 GND, pin 3 EN=VBUS, pin 4 NC, pin 5 VOUT=+3V3.
- Added GND stitching vias to clear isolated F.Cu pour islands created by the
  regulator-area reroute.
- KiCad 10.0.3 DRC after the y-flip and re-route: 0 errors, 0 unconnected
  items, 187 library-lookup warnings only (`drc-yflip-12.json`).
- Current fab package: `fab/oso75_order_ready_v2_gerbers.zip` with
  `oso75_order_ready_v2_pos.csv`. Upload after a final Gerber-viewer check.
- All prior fab packages are the mirrored board and must not be ordered.
- Drill sanity-checked: 164x 3.05 PTH switch contacts, 164x 1.75 NPTH
  fixation, 82x 4.0 NPTH centers, 8x 3.048 + 8x 3.988 NPTH stab holes
- 2-layer, 1.6 mm FR-4, 1 oz; min track/clearance 0.2 mm, vias 0.6/0.3 mm
- Copper-to-edge clearance is set to 0.35 mm (JLCPCB/PCBWay accept >= 0.3)
  because the USB corridor cannot satisfy 0.5 mm
- J3 is exposed ENIG contact copper only: no paste, no BOM line, and no pick
  and place entry. Removable modules must provide the spring/contact side.

## How it was routed

Full-board autoroute with freerouting v2.2.4 (`tools/freerouting/freerouting.jar`):
strip all tracks, `ExportSpecctraDSN` -> `oso75_clean.dsn`, route, import
`oso75.ses`, refill zones (`post_route.py`), widen power nets where clearance
allows (`widen_power.py`), then DRC to zero. Two stubborn matrix links and the
post-layout-fix stitches were routed by the local grid-A* scripts
(`route_two.py`, `route_col9_astar.py`, `route_missing.py`); GND pour islands
got stitching vias (`stitch_islands.py`).

Gotchas discovered (kept for the next pass):

- freerouting v2.2.4 hangs at "Opening..." if the DSN contains existing
  wiring - always strip tracks and route from scratch. It can also hang
  *after* "session completed" without writing the .ses; kill and re-run.
- `pcbnew.LoadBoard` returns None unless the path ends in `.kicad_pcb`.
- The original generator switch footprints were placeholders with no real
  MX contact pads - they were replaced wholesale (see `move_sw72.py`,
  git history) and PrtSc was moved to the nav column (layout bug, 0.75u
  keycap overlap with F12).

2026-06-10: the rear electronics band was shrunk from 45 mm to 22 mm deep
(board 173.063 -> 150.063 mm tall, `rearElectronicsHeight` 36 -> 13 in the
generator/validator). U1 is now the external-antenna WROOM-1U-N16 module, so
there is no PCB antenna area on the keyboard PCB. USB/LDO/passives were
repacked, stabilizer footprints were added, and the board was fully re-routed.

Pre-route and pre-move backups: `oso75.kicad_pcb.bak`,
`oso75.kicad_pcb.pre-sw72`, `oso75.kicad_pcb.pre-shrink` (173 mm board).
