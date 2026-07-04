# OSO75 LCSC Parts List

Pricing checked June 23, 2026. This list replaces the earlier Amazon-heavy
parts evidence with LCSC/JLCPCB-friendly parts for the PCB assembly pass.

| Item | Qty | LCSC part | MPN / match | Unit price used | Extended |
|---|---:|---|---|---:|---:|
| ESP32-S3-WROOM-1U-N16 module | 1 | C2980298 | ESP32-S3-WROOM-1U-N16 | $4.1237 | $4.12 |
| Kailh MX hotswap socket | 82 | C5156480 | CPG151101S11-16 | $0.0664 | $5.44 |
| USB-C receptacle | 1 | C165948 | TYPE-C-31-M-12 | $0.0960 | $0.10 |
| 3.3 V LDO | 1 | C51118 | AP2112K-3.3TRG1 | $0.0834 | $0.08 |
| 500 mA resettable fuse | 1 | C207014 | 0603L050SLYR | $0.2666 | $0.27 |
| Boot/reset tactile switches | 2 | C139797 | SKRPACE010 | $0.0623 | $0.12 |
| Matrix diodes | 82 | C81598 | 1N4148W SOD-123 | $0.0113 | $0.93 |
| 0603 resistors, capacitors, pullups | 13 | LCSC generic 0603 passives | 5.1k, 27R, 10k, 10uF, 100nF, 1uF | $0.0100 | $0.13 |

Estimated LCSC electronic component subtotal: **$11.19**.

Notes:

- `J3` OSO module bay is PCB copper only, so it is not bought as a component.
- The exact ESP32 variant matters: use `ESP32-S3-WROOM-1U-N16`, not N16R8/R16V.
- PCB fabrication, case fabrication, keycaps, switches, stabilizers, screws, feet,
  antenna pigtail, and shipping are separate mechanical/build costs.
- Current repo file map for reviewers:
  - PCB: `hardware/kicad/oso75/oso75.kicad_pcb`
  - Schematic: `hardware/kicad/oso75/oso75.kicad_sch`
  - CAD source: `hardware/cad/build123d/oso75_case.py`
  - Split case STEP/STL: `hardware/cad/build123d/oso75_case_bottom.*` and
    `hardware/cad/build123d/oso75_case_bezel.*`
