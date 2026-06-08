import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const layout = JSON.parse(fs.readFileSync(path.join(root, "hardware/layout/oso75.layout.json"), "utf8"));

const seenLabels = new Map();
const seenMatrix = new Set();

for (const key of layout.keys) {
  const labelCount = seenLabels.get(key.label) ?? 0;
  seenLabels.set(key.label, labelCount + 1);
  const matrix = `${key.row},${key.col}`;
  if (seenMatrix.has(matrix)) {
    throw new Error(`Duplicate matrix position ${matrix}`);
  }
  seenMatrix.add(matrix);
  if (key.row < 0 || key.row > 5) {
    throw new Error(`Row out of range for ${key.label}: ${key.row}`);
  }
  if (key.col < 0 || key.col > 15) {
    throw new Error(`Column out of range for ${key.label}: ${key.col}`);
  }
}

if (layout.keys.length !== 84) {
  throw new Error(`Expected 84 keys, found ${layout.keys.length}`);
}

for (const file of [
  "hardware/cad/generated/oso75_case_plate.scad",
  "qmk/keyboards/oso/oso75/keyboard.json",
  "qmk/keyboards/oso/oso75/keymaps/default/keymap.c",
  "hardware/pcb/oso75_placement.csv",
  "hardware/pcb/oso75_matrix_netlist.csv",
  "hardware/pcb/oso75_components.csv",
  "hardware/pcb/oso75_rp2040_netlist.csv",
  "hardware/pcb/oso75_circuit.md",
  "hardware/pcb/rp2040-pin-plan.md",
  "hardware/bom.md",
  "hardware/kicad/oso75/oso75.kicad_pro",
  "hardware/kicad/oso75/oso75.kicad_sch",
  "hardware/kicad/oso75/oso75.kicad_pcb",
  "hardware/kicad/oso75/fp-lib-table",
  "hardware/kicad/oso75/README.md"
]) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing generated file: ${file}`);
  }
}

const matrixNetlist = fs.readFileSync(path.join(root, "hardware/pcb/oso75_matrix_netlist.csv"), "utf8").trim().split("\n");
if (matrixNetlist.length !== layout.keys.length + 1) {
  throw new Error(`Expected ${layout.keys.length} matrix netlist rows, found ${matrixNetlist.length - 1}`);
}

const matrixText = matrixNetlist.slice(1).join("\n");
for (const row of [0, 1, 2, 3, 4, 5]) {
  if (!matrixText.includes(`ROW${row}`)) {
    throw new Error(`Missing ROW${row} in matrix netlist`);
  }
}
for (const col of Array.from({ length: 16 }, (_, index) => index)) {
  if (!matrixText.includes(`COL${col}`)) {
    throw new Error(`Missing COL${col} in matrix netlist`);
  }
}

const rp2040Netlist = fs.readFileSync(path.join(root, "hardware/pcb/oso75_rp2040_netlist.csv"), "utf8");
for (const requiredNet of ["USB_DP", "USB_DM", "+3V3", "FLASH_CS_N", "RESET_N", "ROW0", "ROW5", "COL0", "COL15"]) {
  if (!rp2040Netlist.includes(requiredNet)) {
    throw new Error(`Missing ${requiredNet} in RP2040 netlist`);
  }
}

const kicadPcb = fs.readFileSync(path.join(root, "hardware/kicad/oso75/oso75.kicad_pcb"), "utf8");
for (const required of ["(footprint \"Package_DFN_QFN:QFN-56", "(footprint \"Connector_USB:USB_C", "(net ", "\"+1V1\"", "\"COL15\"", "\"ROW5\""]) {
  if (!kicadPcb.includes(required)) {
    throw new Error(`Missing ${required} in KiCad PCB`);
  }
}

console.log("OSO75 validation passed.");
