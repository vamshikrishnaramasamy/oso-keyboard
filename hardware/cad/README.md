# CAD

The production case is the build123d model in `hardware/cad/build123d/`.

Generate it with:

```sh
cd hardware/cad/build123d
python3 oso75_case.py
```

Production outputs:

- `oso75_case_bottom.step/.stl`
- `oso75_case_bezel.step/.stl`
- `oso75_plate.step/.stl`
- `oso75_bay_cover.step/.stl`
- `oso75_assembly.step/.glb`

The older OpenSCAD file in `hardware/cad/generated/oso75_case_plate.scad` is
concept-only. Do not use it for final printing, CNC, or ordering.
