# PCB

OSO75 is targeting a custom onboard-ESP32-S3 PCB.

KiCad PCB source files live in `hardware/kicad/oso75/`:

- `oso75.kicad_pro` is the KiCad project.
- `oso75.kicad_sch` is the KiCad schematic.
- `oso75.kicad_pcb` is the routed PCB.
- `fab/oso75_order_ready_v2_gerbers.zip` is the order-ready Gerber package.
- `fab/oso75_order_ready_v2_pos.csv` is the order-ready CPL/position file.
- `fab/oso75_order_ready_bom_no_hotswap.csv` and
  `fab/oso75_order_ready_bom_with_hotswap.csv` are the assembly BOM options.

Generated planning/source files in this folder:

- `esp32s3-pin-plan.md` defines the matrix pins and reserved pins.
- `oso75_placement.csv` is generated placement data for switches and diodes.
- `oso75_matrix_netlist.csv` defines every switch, diode, row net, and column net.
- `oso75_esp32s3_netlist.csv` defines USB-C, power, reset, boot, debug,
  status LED, OSO module bay, and matrix pins.
- `oso75_components.csv` lists footprints, part choices, and factory/builder
  assembly intent.
- `oso75_circuit.md` explains the circuit blocks and routing rules.

The current routed PCB includes:

- ESP32-S3-WROOM-1U module support
- USB-C, ESD, boot, reset, regulator, and external antenna circuitry
- 6 x 16 matrix routing
- 82 MX hotswap sockets
- 82 SOD-123 diodes
- flush top-left OSO module bay for encoder/OLED/slider-style accessories
- PCB-mount stabilizer holes
- ESP-IDF/TinyUSB firmware metadata

Design note: the diodes are still part of the PCB, but the plan is to make them
SMD/factory-assembled so builders do not have to solder 82 tiny parts by hand.
