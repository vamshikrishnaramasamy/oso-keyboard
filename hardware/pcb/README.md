# PCB

OSO75 is targeting a custom onboard-RP2040 PCB.

Current files:

- `rp2040-pin-plan.md` defines the matrix pins and reserved pins.
- `oso75_placement.csv` is generated placement data for switches and diodes.
- `oso75_matrix_netlist.csv` defines every switch, diode, row net, and column net.
- `oso75_rp2040_netlist.csv` defines USB-C, power, flash, crystal, reset, boot,
  debug, status LED, and matrix pins.
- `oso75_components.csv` lists footprints, part choices, and factory/builder
  assembly intent.
- `oso75_circuit.md` explains the circuit blocks and routing rules.

The next PCB pass is converting these generated circuit files into a KiCad
schematic/PCB project with:

- RP2040 reference schematic
- USB-C, ESD, boot, reset, flash, crystal, and regulator circuitry
- 6 x 16 matrix routing
- MX hotswap sockets
- SOD-123 diodes
- PCB-mount stabilizer holes
- VIA/QMK-compatible metadata

Design note: the diodes are still part of the PCB, but the plan is to make them
SMD/factory-assembled so builders do not have to solder 84 tiny parts by hand.
