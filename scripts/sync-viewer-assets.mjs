import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const assets = [
  // [source, required]
  ["hardware/cad/generated/oso75_case_plate.stl", true],
  ["hardware/cad/build123d/oso75_case_bottom.stl", false],
  ["hardware/cad/build123d/oso75_case_bezel.stl", false],
  ["hardware/cad/build123d/oso75_plate.stl", false],
  ["hardware/cad/build123d/oso75_bay_cover.stl", false],
  ["hardware/cad/build123d/oso75_module_carrier.stl", false],
  ["hardware/kicad/oso-module-carrier/oso_module_carrier_top.png", false],
  ["hardware/kicad/oso-module-carrier/oso_module_carrier_bottom.png", false]
];

for (const [relSource, required] of assets) {
  const source = path.join(root, relSource);
  const target = path.join(root, "web/public/models", path.basename(relSource));
  if (!fs.existsSync(source)) {
    if (required) {
      throw new Error(`Missing ${source}. Run openscad export or npm run generate first.`);
    }
    console.log(`Skipped ${relSource} (not built; run hardware/cad/build123d/oso75_case.py)`);
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`Copied ${relSource} -> ${path.relative(root, target)}`);
}
