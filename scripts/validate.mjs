import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const layout = JSON.parse(fs.readFileSync(path.join(root, "hardware/layout/oso75.layout.json"), "utf8"));
const unit = layout.unit_mm;
const boardWidth = (Math.max(...layout.keys.map(k => k.x + (k.w ?? 1))) * unit) + 18;
const keyFieldHeight = (Math.max(...layout.keys.map(k => k.y + (k.h ?? 1))) * unit) + 18;
const rearElectronicsHeight = 13;
const boardHeight = keyFieldHeight + rearElectronicsHeight;
const moduleBay = layout.module_bay
  ? {
      ...layout.module_bay,
      x_mm: layout.module_bay.x_mm,
      y_mm: layout.module_bay.y_mm
    }
  : undefined;

function readPcbSwitchCenters() {
  const pcbPath = path.join(root, "hardware/kicad/oso75/oso75.kicad_pcb");
  if (!fs.existsSync(pcbPath)) return new Map();
  const pcb = fs.readFileSync(pcbPath, "utf8");
  const centers = new Map();
  const footprints = pcb.split("\n\t(footprint ").slice(1).map(block => `\t(footprint ${block}`);
  for (const footprint of footprints) {
    if (!footprint.includes("SW_Hotswap")) continue;
    const ref = footprint.match(/\(property\s+"Reference"\s+"([^"]+)"/);
    const at = footprint.match(/\(at\s+([\d.-]+)\s+([\d.-]+)/);
    if (ref && at) centers.set(ref[1], { x: Number(at[1]), y: Number(at[2]) });
  }
  return centers;
}

const pcbSwitchCenters = readPcbSwitchCenters();

function keyCenter(key) {
  const w = key.w ?? 1;
  const h = key.h ?? 1;
  const layoutX = ((key.x + w / 2) * unit) + 9;
  const layoutY = ((key.y + h / 2) * unit) + 9;
  return {
    x: layoutX,
    y: layoutY
  };
}

function isInsideModuleBay(key) {
  if (!moduleBay) return false;
  const center = keyCenter(key);
  return (
    center.x >= moduleBay.x_mm &&
    center.x <= moduleBay.x_mm + moduleBay.w_mm &&
    center.y >= moduleBay.y_mm &&
    center.y <= moduleBay.y_mm + moduleBay.h_mm
  );
}

const physicalKeys = layout.keys.filter(key => !isInsideModuleBay(key));
const physicalKeyCenters = physicalKeys.map((key, index) => {
  const ref = `SW${index + 1}`;
  return {
    ref,
    label: key.label,
    ...(pcbSwitchCenters.get(ref) ?? keyCenter(key))
  };
});

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

if (physicalKeys.length !== 82) {
  throw new Error(`Expected 82 physical keys after module bay keepout, found ${physicalKeys.length}`);
}

for (let i = 0; i < physicalKeyCenters.length; i += 1) {
  for (let j = i + 1; j < physicalKeyCenters.length; j += 1) {
    const a = physicalKeyCenters[i];
    const b = physicalKeyCenters[j];
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    if (dx < layout.switch_cutout_mm && dy < layout.switch_cutout_mm) {
      throw new Error(`Switch cutouts overlap: ${a.label} and ${b.label} (${dx.toFixed(2)} x ${dy.toFixed(2)} mm apart)`);
    }
  }
}

for (const file of [
  "hardware/cad/generated/oso75_case_plate.scad",
  "hardware/cad/generated/oso75_fit_report.json",
  "qmk/keyboards/oso/oso75/keyboard.json",
  "qmk/keyboards/oso/oso75/keymaps/default/keymap.c",
  "hardware/pcb/oso75_placement.csv",
  "hardware/pcb/oso75_matrix_netlist.csv",
  "hardware/pcb/oso75_components.csv",
  "hardware/pcb/oso75_esp32s3_netlist.csv",
  "hardware/pcb/oso75_circuit.md",
  "hardware/pcb/esp32s3-pin-plan.md",
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
if (matrixNetlist.length !== physicalKeys.length + 1) {
  throw new Error(`Expected ${physicalKeys.length} matrix netlist rows, found ${matrixNetlist.length - 1}`);
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

const keyboardJson = JSON.parse(fs.readFileSync(path.join(root, "qmk/keyboards/oso/oso75/keyboard.json"), "utf8"));
const esp32Module = "ESP32-S3-WROOM-1U-N16";
const expectedRows = ["GPIO1", "GPIO2", "GPIO4", "GPIO5", "GPIO6", "GPIO7"];
const expectedCols = ["GPIO8", "GPIO9", "GPIO10", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO21", "GPIO35", "GPIO36", "GPIO37", "GPIO38"];
if (keyboardJson.processor !== "ESP32-S3" || keyboardJson.bootloader !== "esp-idf") {
  throw new Error("Keyboard metadata must target ESP32-S3 with esp-idf bootloader");
}
if (JSON.stringify(keyboardJson.matrix_pins.rows) !== JSON.stringify(expectedRows)) {
  throw new Error("Keyboard row pins drifted from the ESP32-S3-WROOM-1U pin plan");
}
if (JSON.stringify(keyboardJson.matrix_pins.cols) !== JSON.stringify(expectedCols)) {
  throw new Error("Keyboard column pins drifted from the ESP32-S3-WROOM-1U pin plan");
}
const forbiddenMatrixPins = new Set(["GPIO0", "GPIO3", "GPIO19", "GPIO20", "GPIO45", "GPIO46"]);
for (const pin of [...keyboardJson.matrix_pins.rows, ...keyboardJson.matrix_pins.cols]) {
  if (forbiddenMatrixPins.has(pin)) {
    throw new Error(`Matrix uses ESP32-S3 reserved/strapping/native-USB pin ${pin}`);
  }
}

const esp32s3Netlist = fs.readFileSync(path.join(root, "hardware/pcb/oso75_esp32s3_netlist.csv"), "utf8");
const componentsCsv = fs.readFileSync(path.join(root, "hardware/pcb/oso75_components.csv"), "utf8");
if (!componentsCsv.includes(`U1,${esp32Module},`) || componentsCsv.includes("ESP32-S3-WROOM-1U-N16R8")) {
  throw new Error("Use ESP32-S3-WROOM-1U-N16, not N16R8/R16V; GPIO35/GPIO36/GPIO37 are matrix columns");
}
for (const requiredNet of ["USB_DP", "USB_DM", "+3V3", "BOOT_IO0", "ESP_EN", "ROW0", "ROW5", "COL0", "COL15", "MOD_A", "MOD_B", "MOD_INT", "VBUS_FUSED"]) {
  if (!esp32s3Netlist.includes(requiredNet)) {
    throw new Error(`Missing ${requiredNet} in ESP32-S3 netlist`);
  }
}
for (const requiredPinMap of [
  ["U1,GPIO19,USB_DM", "ESP32-S3 native USB D- must stay on GPIO19"],
  ["U1,GPIO20,USB_DP", "ESP32-S3 native USB D+ must stay on GPIO20"],
  ["U1,GPIO0,BOOT_IO0", "ESP32-S3 boot strap must stay on GPIO0"],
  ["U1,EN,ESP_EN", "ESP32-S3 enable/reset must stay on EN"],
  ["U1,GPIO47,MOD_INT", "Module interrupt must stay on GPIO47"],
  ["U1,GPIO41,I2C_SDA", "Module I2C SDA must stay on GPIO41"],
  ["U1,GPIO42,I2C_SCL", "Module I2C SCL must stay on GPIO42"]
]) {
  if (!esp32s3Netlist.includes(requiredPinMap[0])) {
    throw new Error(requiredPinMap[1]);
  }
}
for (const stale of ["VBUS_SENSE", "LED_STATUS", "UART_TXD0", "UART_RXD0", "U4,", "J2,", "R7,", "R8,", "R9,", "D85,", "C5,", "C6,", "C7,", "C8,", "C9,", "C10,"]) {
  if (esp32s3Netlist.includes(stale)) {
    throw new Error(`ESP32-S3 netlist still contains stale unplaced first-rev item ${stale}`);
  }
}
for (const requiredComponent of ["F1,500mA resettable fuse,0603 PPTC,Littelfuse 0603L050SLYR", "C_EN,1uF,0603", "J3,OSO module bay PCB pads,exposed ENIG pads + 2 retention holes,DNP - PCB copper only,DNP"]) {
  if (!componentsCsv.includes(requiredComponent)) {
    throw new Error(`Missing updated BOM component row: ${requiredComponent}`);
  }
}

const kicadPcb = fs.readFileSync(path.join(root, "hardware/kicad/oso75/oso75.kicad_pcb"), "utf8");
const esp32LocalFootprint = fs.readFileSync(path.join(root, "hardware/kicad/oso75/OSO75.pretty/ESP32-S3-WROOM-1U-N16.kicad_mod"), "utf8");
if (!kicadPcb.includes(`(property "Value" "${esp32Module}"`) || kicadPcb.includes("ESP32-S3-WROOM-1U-N16R8")) {
  throw new Error("KiCad PCB still targets the ESP32-S3-WROOM-1U-N16R8 PSRAM module");
}
for (const forbidden of ["ESP32-S3-WROOM-1.step", "KEEP-OUT ZONE", "esp32s3_antenna_keepout"]) {
  if (kicadPcb.includes(forbidden)) {
    throw new Error(`KiCad PCB still contains stale WROOM-1U release blocker: ${forbidden}`);
  }
  if (esp32LocalFootprint.includes(forbidden)) {
    throw new Error(`Local ESP32 footprint still contains stale WROOM-1U release blocker: ${forbidden}`);
  }
}
for (const required of ["(footprint \"OSO75:ESP32-S3-WROOM-1U-N16", "(footprint \"OSO75:USB_C", "(footprint \"OSO75:OSO_Module_Bay_10", "POWER OFF SWAP ONLY", "(footprint \"OSO75:Polyfuse_0603", "(property \"Reference\" \"C_EN\"", "(net ", "\"BOOT_IO0\"", "\"ESP_EN\"", "\"COL15\"", "\"ROW5\"", "\"MOD_A\"", "\"MOD_B\"", "\"MOD_INT\"", "\"VBUS_FUSED\""]) {
  if (!kicadPcb.includes(required)) {
    throw new Error(`Missing ${required} in KiCad PCB`);
  }
}
if (kicadPcb.includes('(property "Reference" "J3"') && !kicadPcb.includes("(attr smd exclude_from_pos_files exclude_from_bom)")) {
  throw new Error("J3 module bay must be marked DNP/excluded from factory placement");
}
if (kicadPcb.includes("\"ENC_A\"") || kicadPcb.includes("\"ENC_B\"")) {
  throw new Error("KiCad PCB still contains old ENC_A/ENC_B nets");
}
for (const oldNet of ["\"+1V1\"", "\"FLASH_CS_N\"", "\"QSPI_SCLK\"", "\"XTAL_IN\"", "\"XTAL_OUT\""]) {
  if (kicadPcb.includes(oldNet)) {
    throw new Error(`KiCad PCB still contains old RP2040-era net ${oldNet}`);
  }
}
if (!kicadPcb.includes(`(end ${boardWidth.toFixed(3)} ${boardHeight.toFixed(3)})`)) {
  throw new Error(`KiCad PCB outline does not match ${boardWidth.toFixed(3)} x ${boardHeight.toFixed(3)} mm`);
}

const cadScad = fs.readFileSync(path.join(root, "hardware/cad/generated/oso75_case_plate.scad"), "utf8");
for (const required of ["module pcb_preview()", "pcb_clearance = 0.8", "pcb_thickness = 1.6", "usb_c_z = 12.7", "gadget_y = 107.063"]) {
  if (!cadScad.includes(required)) {
    throw new Error(`Missing ${required} in CAD assembly`);
  }
}

const fitReport = JSON.parse(fs.readFileSync(path.join(root, "hardware/cad/generated/oso75_fit_report.json"), "utf8"));
if (fitReport.status !== "fits") {
  throw new Error(`Unexpected PCB fit status: ${fitReport.status}`);
}
if (fitReport.pcb.width_mm !== Number(boardWidth.toFixed(3)) || fitReport.pcb.height_mm !== Number(boardHeight.toFixed(3))) {
  throw new Error("PCB fit report dimensions do not match generated board size");
}
if (fitReport.tray_cavity.clearance_each_side_mm <= 0) {
  throw new Error("PCB fit report does not include positive tray clearance");
}
if (fitReport.switch_alignment.max_center_error_mm > 0.001) {
  throw new Error(`Switch centers do not align between CAD and PCB: ${fitReport.switch_alignment.max_center_error_mm} mm`);
}
if (fitReport.module_bay && fitReport.module_bay.cad_center_to_j3_error_mm !== null && fitReport.module_bay.cad_center_to_j3_error_mm > 0.05) {
  throw new Error(`Module bay does not align between CAD and PCB J3: ${fitReport.module_bay.cad_center_to_j3_error_mm} mm`);
}
if (fitReport.usb_c.cad_to_pcb_x_error_mm !== null && fitReport.usb_c.cad_to_pcb_x_error_mm > 0.1) {
  throw new Error(`USB-C slot x does not align with J1: ${fitReport.usb_c.cad_to_pcb_x_error_mm} mm`);
}

console.log("OSO75 validation passed.");
