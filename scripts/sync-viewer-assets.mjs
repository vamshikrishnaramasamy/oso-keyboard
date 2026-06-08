import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "hardware/cad/generated/oso75_case_plate.stl");
const target = path.join(root, "web/public/models/oso75_case_plate.stl");

if (!fs.existsSync(source)) {
  throw new Error(`Missing ${source}. Run openscad export or npm run generate first.`);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
console.log(`Copied ${path.relative(root, source)} -> ${path.relative(root, target)}`);

