# OSO75 Order-Ready Fab Files (v2)

**Order this package only:**

- `oso75_order_ready_v2_gerbers.zip` (exported 2026-06-10 after the y-flip fix)

**Do NOT order anything prefixed `STALE-MIRRORED-DO-NOT-ORDER-`.** Every
package exported before 2026-06-10 19:00 describes a mirror-image keyboard
(`~` on the right, Enter on the left). The board was y-flipped, re-routed,
and re-verified; only the v2 package is buildable.

Recommended PCB options:

- Board type: single PCB, not panelized
- Size: 337.088 mm x 150.063 mm
- Layers: 2
- Thickness: 1.6 mm
- Copper: 1 oz
- Minimum track/spacing: 6/6 mil or better
- Minimum hole: 0.3 mm or better
- Surface finish: ENIG recommended. Hard gold is better if the OSO module bay
  will be swapped often.
- Solder mask/silkscreen: any color is OK.
- Castellated holes / edge connector: no
- Assembly: optional, see below

Assembly notes:

- `J3` is exposed module-bay copper only. It must not be placed as a component
  and must not receive paste.
- Rev A module bay is power-off swap only. Do not insert/remove modules while
  the keyboard is powered.
- `U1` must be exactly `ESP32-S3-WROOM-1U-N16`. Do not substitute
  N16R8/R16V/Octal-PSRAM variants.
- `oso75_order_ready_bom_no_hotswap.csv` excludes Kailh hotswap sockets for
  hand soldering (BOM is unchanged by the flip and still valid).
- `oso75_order_ready_bom_with_hotswap.csv` includes Kailh hotswap sockets for
  factory assembly.
- `oso75_order_ready_v2_pos.csv` is the position/CPL export for the flipped
  board. The older `oso75_order_ready_pos.csv` is stale; do not use it.
- Review rotations in the fab's preview before paying.

Verification (v2, after the y-flip):

- KiCad 10.0.3 DRC: 0 errors, 0 unconnected items
  (`drc-yflip-12.json`); remaining warnings are library lookup notices for
  project-local footprints only.
- Drill files reconcile with the board exactly: 265 PTH (180 pads + 85 vias),
  266 NPTH (164 switch fixation, 82 switch centers, 16 stabilizer, 4 other).
- Orientation verified against the annovax75 reference convention and the CAD
  model: top render shows USB/ESP32 band and module bay at the back-left,
  F-row beneath it, space row at the front; `~` left, Enter right.
