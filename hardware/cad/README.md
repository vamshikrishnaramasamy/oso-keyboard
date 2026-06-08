# CAD

The first CAD target is a parametric OpenSCAD tray case and switch plate.

Generate it with:

```sh
npm run generate
openscad -o hardware/cad/generated/oso75_case_plate.stl hardware/cad/generated/oso75_case_plate.scad
```

The CAD is intentionally simple for the first pass:

- 1.6 mm switch plate
- tray-style lower case
- MX switch cutouts
- USB-C opening
- transparent switch preview blocks

The next CAD pass should add screw bosses, PCB mounting holes, plate reliefs, and
stabilizer clearance cuts.

