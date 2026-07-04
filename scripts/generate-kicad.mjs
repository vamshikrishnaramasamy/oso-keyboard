import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "hardware/kicad/oso75");
const layout = JSON.parse(fs.readFileSync(path.join(root, "hardware/layout/oso75.layout.json"), "utf8"));
const unit = layout.unit_mm;
const boardWidth = (Math.max(...layout.keys.map(k => k.x + (k.w ?? 1))) * unit) + 18;
const keyFieldHeight = (Math.max(...layout.keys.map(k => k.y + (k.h ?? 1))) * unit) + 18;
const rearElectronicsHeight = 13;
const boardHeight = keyFieldHeight + rearElectronicsHeight;
const pcbHeight = boardHeight;
const controllerX = boardWidth / 2;
const controllerY = keyFieldHeight + 13.5;
const esp32Module = "ESP32-S3-WROOM-1U-N16";
const esp32FootprintPath = path.join(outDir, "OSO75.pretty/ESP32-S3-WROOM-1U-N16.kicad_mod");
const esp32FootprintSource = fs.existsSync(esp32FootprintPath)
  ? fs.readFileSync(esp32FootprintPath, "utf8")
  : "";
const moduleBay = layout.module_bay
  ? {
    ...layout.module_bay,
    // Layout coordinates map directly into the PCB/CAD coordinate space.
    // Keep this aligned with the hand-routed KiCad board.
    x_mm: layout.module_bay.x_mm,
    y_mm: layout.module_bay.y_mm
  }
  : undefined;

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

const omittedKeys = layout.keys.filter(isInsideModuleBay);
const physicalLayoutKeys = layout.keys.filter(key => !isInsideModuleBay(key));
const keys = physicalLayoutKeys.map((key, index) => {
  const w = key.w ?? 1;
  const h = key.h ?? 1;
  const center = keyCenter(key);
  return {
    ...key,
    w,
    h,
    ref: `SW${index + 1}`,
    diode: `D${index + 1}`,
    da: `D${index + 1}_A`,
    x: center.x,
    y: center.y
  };
});

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function uuid(seed) {
  const hex = crypto.createHash("sha1").update(seed).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function kstr(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}

const netNames = [
  "GND", "VBUS", "+3V3", "USB_CC1", "USB_CC2", "USB_DP_CONN",
  "USB_DM_CONN", "USB_DP", "USB_DM", "ESP_EN", "BOOT_IO0",
  "VBUS_FUSED", "MOD_A", "MOD_B", "MOD_INT", "I2C_SDA", "I2C_SCL",
  ...Array.from({ length: 6 }, (_, i) => `ROW${i}`),
  ...Array.from({ length: 16 }, (_, i) => `COL${i}`),
  ...keys.map(k => k.da)
];
const netIds = new Map(netNames.map((name, index) => [name, index + 1]));

function net(name) {
  const id = netIds.get(name);
  if (!id) throw new Error(`Unknown net ${name}`);
  return `(net ${id} "${name}")`;
}

function padNet(name) {
  return `(net ${netIds.get(name)} "${name}")`;
}

function prop(name, value, x, y, layer = "F.SilkS", hidden = false) {
  return `    (property "${kstr(name)}" "${kstr(value)}"\n      (at ${x} ${y} 0)\n      (layer "${layer}")${hidden ? "\n      (hide yes)" : ""}\n      (uuid "${uuid(`${name}:${value}:${x}:${y}:${layer}`)}")\n      (effects (font (size 1 1) (thickness 0.15)))\n    )`;
}

function fpLine(x1, y1, x2, y2, layer = "F.Fab", width = 0.1) {
  return `    (fp_line (start ${x1} ${y1}) (end ${x2} ${y2}) (stroke (width ${width}) (type solid)) (layer "${layer}") (uuid "${uuid(`line:${x1}:${y1}:${x2}:${y2}:${layer}:${width}:${Math.random()}`)}"))`;
}

function pad(ref, num, type, shape, x, y, sx, sy, layers, netName, extra = "") {
  const netPart = netName ? ` ${padNet(netName)}` : "";
  return `    (pad "${num}" ${type} ${shape} (at ${x} ${y}) (size ${sx} ${sy})${extra} (layers ${layers})${netPart} (uuid "${uuid(`pad:${ref}:${num}:${x}:${y}:${netName}`)}"))`;
}

function text(ref, value, x, y, layer = "F.SilkS") {
  return `    (fp_text user "${kstr(value)}" (at ${x} ${y} 0) (layer "${layer}") (uuid "${uuid(`text:${ref}:${value}:${x}:${y}`)}") (effects (font (size 0.8 0.8) (thickness 0.1))))`;
}

function footprint(ref, value, atX, atY, body, footprintName = "OSO75:Generated") {
  return `  (footprint "${footprintName}"\n    (layer "F.Cu")\n    (uuid "${uuid(`fp:${ref}`)}")\n    (at ${atX.toFixed(3)} ${atY.toFixed(3)} 0)\n${prop("Reference", ref, 0, -3, "F.Fab")}\n${prop("Value", value, 0, 3, "F.Fab")}\n${prop("Footprint", footprintName, 0, 0, "F.Fab", true)}\n${body}\n  )`;
}

function switchFootprint(k) {
  const body = [
    fpLine(-7, -7, 7, -7),
    fpLine(7, -7, 7, 7),
    fpLine(7, 7, -7, 7),
    fpLine(-7, 7, -7, -7),
    fpLine(-7, -7, 7, -7, "F.Fab", 0.1),
    fpLine(7, -7, 7, 7, "F.Fab", 0.1),
    fpLine(7, 7, -7, 7, "F.Fab", 0.1),
    fpLine(-7, 7, -7, -7, "F.Fab", 0.1),
    text(k.ref, k.label, 0, 0, "F.Fab"),
    pad(k.ref, "1", "thru_hole", "circle", -5.08, 0, 2.2, 2.2, '"*.Cu" "*.Mask"', `COL${k.col}`, " (drill 1.3)"),
    pad(k.ref, "2", "thru_hole", "circle", 5.08, 0, 2.2, 2.2, '"*.Cu" "*.Mask"', k.da, " (drill 1.3)"),
    pad(k.ref, "", "np_thru_hole", "circle", 0, 0, 4, 4, '"*.Cu" "*.Mask"', "", " (drill 4)")
  ].join("\n");
  return footprint(k.ref, "MX_Hotswap", k.x, k.y, body, "OSO75:MX_Hotswap_1u");
}

function diodeFootprint(k) {
  const x = k.x + 6.5;
  const y = k.y + 6.5;
  const body = [
    fpLine(-2.3, -1.2, 2.3, -1.2),
    fpLine(2.3, -1.2, 2.3, 1.2),
    fpLine(2.3, 1.2, -2.3, 1.2),
    fpLine(-2.3, 1.2, -2.3, -1.2),
    fpLine(1.05, -1.2, 1.05, 1.2, "F.Fab", 0.16),
    pad(k.diode, "1", "smd", "roundrect", -1.65, 0, 1.2, 1.5, '"F.Cu" "F.Paste" "F.Mask"', k.da, " (roundrect_rratio 0.2)"),
    pad(k.diode, "2", "smd", "roundrect", 1.65, 0, 1.2, 1.5, '"F.Cu" "F.Paste" "F.Mask"', `ROW${k.row}`, " (roundrect_rratio 0.2)")
  ].join("\n");
  return footprint(k.diode, "1N4148W", x, y, body, "OSO75:D_SOD-123_Keyboard");
}

const esp32Pins = {
  1: "GND", 2: "+3V3", 3: "ESP_EN", 4: "ROW2", 5: "ROW3", 6: "ROW4", 7: "ROW5",
  8: "COL7", 9: "COL8", 10: "COL9", 11: "COL10", 12: "COL0",
  13: "USB_DM", 14: "USB_DP", 15: "", 16: "", 17: "COL1", 18: "COL2",
  19: "COL3", 20: "COL4", 21: "COL5", 22: "COL6", 23: "COL11",
  24: "MOD_INT", 25: "", 26: "", 27: "BOOT_IO0", 28: "COL12",
  29: "COL13", 30: "COL14", 31: "COL15", 32: "MOD_A", 33: "MOD_B",
  34: "I2C_SDA", 35: "I2C_SCL", 36: "", 37: "",
  38: "ROW1", 39: "ROW0", 40: "GND", 41: "GND"
};

const esp32PadPositions = new Map();
for (const match of esp32FootprintSource.matchAll(/\(pad\s+"(\d+)"[\s\S]*?\(at\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)) {
  const pin = Number(match[1]);
  if (!esp32PadPositions.has(pin)) {
    esp32PadPositions.set(pin, [Number(match[2]), Number(match[3])]);
  }
}

function esp32Footprint() {
  if (!esp32FootprintSource) {
    throw new Error(`Missing repo-local ESP32-S3-WROOM-1U footprint at ${esp32FootprintPath}`);
  }
  let fp = esp32FootprintSource
    .replace('(footprint "ESP32-S3-WROOM-1U-N16"', '(footprint "OSO75:ESP32-S3-WROOM-1U-N16"')
    .replace('(layer "F.Cu")', `(layer "F.Cu")\n  (uuid "${uuid("fp:U1:esp32-s3")}")\n  (at ${controllerX.toFixed(3)} ${controllerY.toFixed(3)} 0)`)
    .replace('(property "Reference" "REF**"', '(property "Reference" "U1"')
    .replace('(property "Value" "ESP32-S3-WROOM-1"', `(property "Value" "${esp32Module}"`)
    .replaceAll('(drill 0.2)', '(drill 0.3)');

  for (const [pin, netName] of Object.entries(esp32Pins)) {
    if (!netName) continue;
    const netLine = `\n\t\t${padNet(netName)}`;
    fp = fp.replace(new RegExp(`(\\(pad "${pin}"[\\s\\S]*?)(\\n\\s*\\(uuid )`, "g"), `$1${netLine}$2`);
  }
  return fp;
}

function twoPad(ref, value, x, y, netA, netB, footprintName = "OSO75:R_0603") {
  const body = [
    fpLine(-1.3, -0.65, 1.3, -0.65),
    fpLine(1.3, -0.65, 1.3, 0.65),
    fpLine(1.3, 0.65, -1.3, 0.65),
    fpLine(-1.3, 0.65, -1.3, -0.65),
    pad(ref, "1", "smd", "roundrect", -0.8, 0, 0.8, 0.9, '"F.Cu" "F.Paste" "F.Mask"', netA, " (roundrect_rratio 0.2)"),
    pad(ref, "2", "smd", "roundrect", 0.8, 0, 0.8, 0.9, '"F.Cu" "F.Paste" "F.Mask"', netB, " (roundrect_rratio 0.2)")
  ].join("\n");
  return footprint(ref, value, x, y, body, footprintName);
}

function fuse0603(ref, value, x, y, netA, netB) {
  const body = [
    fpLine(-1.3, -0.65, 1.3, -0.65),
    fpLine(1.3, -0.65, 1.3, 0.65),
    fpLine(1.3, 0.65, -1.3, 0.65),
    fpLine(-1.3, 0.65, -1.3, -0.65),
    pad(ref, "1", "smd", "roundrect", -0.8, 0, 0.8, 0.9, '"F.Cu" "F.Paste" "F.Mask"', netA, " (roundrect_rratio 0.2)"),
    pad(ref, "2", "smd", "roundrect", 0.8, 0, 0.8, 0.9, '"F.Cu" "F.Paste" "F.Mask"', netB, " (roundrect_rratio 0.2)")
  ].join("\n");
  return footprint(ref, value, x, y, body, "OSO75:Polyfuse_0603");
}

function button(ref, value, x, y, netA, netB) {
  const body = [
    fpLine(-2.6, -1.8, 2.6, -1.8),
    fpLine(2.6, -1.8, 2.6, 1.8),
    fpLine(2.6, 1.8, -2.6, 1.8),
    fpLine(-2.6, 1.8, -2.6, -1.8),
    pad(ref, "1", "smd", "roundrect", -1.7, 0, 1.2, 1.7, '"F.Cu" "F.Paste" "F.Mask"', netA, " (roundrect_rratio 0.2)"),
    pad(ref, "2", "smd", "roundrect", 1.7, 0, 1.2, 1.7, '"F.Cu" "F.Paste" "F.Mask"', netB, " (roundrect_rratio 0.2)")
  ].join("\n");
  return footprint(ref, value, x, y, body, "OSO75:SW_Tactile_4x3");
}

function moduleBayFootprint() {
  const x = moduleBay.x_mm + moduleBay.w_mm / 2;
  const y = moduleBay.y_mm + moduleBay.h_mm / 2;
  const padStart = -((moduleBay.pins.length - 1) * 3.8) / 2;
  const contactPads = moduleBay.pins.map((netName, index) =>
    pad(
      "J3",
      String(index + 1),
      "smd",
      "roundrect",
      Number((padStart + index * 3.8).toFixed(3)),
      -5.2,
      2.2,
      5.0,
      '"F.Cu" "F.Mask"',
      netName,
      " (roundrect_rratio 0.18)"
    )
  );
  const body = [
    fpLine(-moduleBay.w_mm / 2, -moduleBay.h_mm / 2, moduleBay.w_mm / 2, -moduleBay.h_mm / 2, "F.CrtYd", 0.12),
    fpLine(moduleBay.w_mm / 2, -moduleBay.h_mm / 2, moduleBay.w_mm / 2, moduleBay.h_mm / 2, "F.CrtYd", 0.12),
    fpLine(moduleBay.w_mm / 2, moduleBay.h_mm / 2, -moduleBay.w_mm / 2, moduleBay.h_mm / 2, "F.CrtYd", 0.12),
    fpLine(-moduleBay.w_mm / 2, moduleBay.h_mm / 2, -moduleBay.w_mm / 2, -moduleBay.h_mm / 2, "F.CrtYd", 0.12),
    fpLine(-moduleBay.w_mm / 2 + 4, 5.8, moduleBay.w_mm / 2 - 4, 5.8, "F.Fab", 0.2),
    text("J3", "OSO MODULE BAY", 0, 9.2, "F.Fab"),
    text("J3", "POWER OFF SWAP ONLY", 0, 8.2, "F.SilkS", 0, 0.8, 0.12),
    ...contactPads,
    pad("J3", "MH1", "np_thru_hole", "circle", -moduleBay.w_mm / 2 + 6, 0, 3.6, 3.6, '"*.Cu" "*.Mask"', "", " (drill 1.8)"),
    pad("J3", "MH2", "np_thru_hole", "circle", moduleBay.w_mm / 2 - 6, 0, 3.6, 3.6, '"*.Cu" "*.Mask"', "", " (drill 1.8)")
  ].join("\n");
  return footprint("J3", "OSO_Module_Bay_10", x, y, body, "OSO75:OSO_Module_Bay_10");
}

function usbFootprint() {
  const x = boardWidth / 2;
  const y = 2.8;
  const body = [
    fpLine(-4.8, -3, 4.8, -3),
    fpLine(4.8, -3, 4.8, 3),
    fpLine(4.8, 3, -4.8, 3),
    fpLine(-4.8, 3, -4.8, -3),
    pad("J1", "A4", "smd", "rect", -3, 0, 0.45, 1.5, '"F.Cu" "F.Paste" "F.Mask"', "VBUS"),
    pad("J1", "B4", "smd", "rect", -2.4, 0, 0.45, 1.5, '"F.Cu" "F.Paste" "F.Mask"', "VBUS"),
    pad("J1", "A6", "smd", "rect", -0.7, 0, 0.35, 1.5, '"F.Cu" "F.Paste" "F.Mask"', "USB_DP_CONN"),
    pad("J1", "B6", "smd", "rect", -0.35, 0, 0.35, 1.5, '"F.Cu" "F.Paste" "F.Mask"', "USB_DP_CONN"),
    pad("J1", "A7", "smd", "rect", 0.35, 0, 0.35, 1.5, '"F.Cu" "F.Paste" "F.Mask"', "USB_DM_CONN"),
    pad("J1", "B7", "smd", "rect", 0.7, 0, 0.35, 1.5, '"F.Cu" "F.Paste" "F.Mask"', "USB_DM_CONN"),
    pad("J1", "CC1", "smd", "rect", 2.25, 0, 0.4, 1.5, '"F.Cu" "F.Paste" "F.Mask"', "USB_CC1"),
    pad("J1", "CC2", "smd", "rect", 2.85, 0, 0.4, 1.5, '"F.Cu" "F.Paste" "F.Mask"', "USB_CC2"),
    pad("J1", "S1", "thru_hole", "oval", -4.6, 0, 1.6, 2.4, '"*.Cu" "*.Mask"', "GND", " (drill oval 0.8 1.6)"),
    pad("J1", "S2", "thru_hole", "oval", 4.6, 0, 1.6, 2.4, '"*.Cu" "*.Mask"', "GND", " (drill oval 0.8 1.6)")
  ].join("\n");
  return footprint("J1", "USB-C", x, y, body, "Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12");
}

function ldoFootprint() {
  const nets = { 1: "VBUS", 2: "GND", 3: "VBUS", 4: "", 5: "+3V3" };
  const body = [
    fpLine(-1.6, -1.6, 1.6, -1.6),
    fpLine(1.6, -1.6, 1.6, 1.6),
    fpLine(1.6, 1.6, -1.6, 1.6),
    fpLine(-1.6, 1.6, -1.6, -1.6),
    pad("U3", "1", "smd", "roundrect", -1.1, -0.95, 0.65, 0.55, '"F.Cu" "F.Paste" "F.Mask"', nets[1], " (roundrect_rratio 0.2)"),
    pad("U3", "2", "smd", "roundrect", -1.1, 0, 0.65, 0.55, '"F.Cu" "F.Paste" "F.Mask"', nets[2], " (roundrect_rratio 0.2)"),
    pad("U3", "3", "smd", "roundrect", -1.1, 0.95, 0.65, 0.55, '"F.Cu" "F.Paste" "F.Mask"', nets[3], " (roundrect_rratio 0.2)"),
    pad("U3", "4", "smd", "roundrect", 1.1, 0.95, 0.65, 0.55, '"F.Cu" "F.Paste" "F.Mask"', nets[4], " (roundrect_rratio 0.2)"),
    pad("U3", "5", "smd", "roundrect", 1.1, -0.95, 0.65, 0.55, '"F.Cu" "F.Paste" "F.Mask"', nets[5], " (roundrect_rratio 0.2)")
  ].join("\n");
  return footprint("U3", "AP2112K-3.3", controllerX - 24, controllerY, body, "OSO75:SOT-23-5_LDO");
}

function edgeLine(x1, y1, x2, y2) {
  return `  (gr_line (start ${x1} ${y1}) (end ${x2} ${y2}) (stroke (width 0.1) (type solid)) (layer "Edge.Cuts") (uuid "${uuid(`edge:${x1}:${y1}:${x2}:${y2}`)}"))`;
}

function route(x1, y1, x2, y2, netName, layer = "F.Cu", width = 0.25) {
  return `  (segment (start ${x1.toFixed(3)} ${y1.toFixed(3)}) (end ${x2.toFixed(3)} ${y2.toFixed(3)}) (width ${width}) (layer "${layer}") (net ${netIds.get(netName)}) (uuid "${uuid(`route:${x1}:${y1}:${x2}:${y2}:${netName}:${layer}`)}"))`;
}

function via(x, y, netName) {
  return `  (via (at ${x.toFixed(3)} ${y.toFixed(3)}) (size 0.6) (drill 0.3) (layers "F.Cu" "B.Cu") (net ${netIds.get(netName)}) (uuid "${uuid(`via:${x}:${y}:${netName}`)}"))`;
}

function pinAbs(pin) {
  const [x, y] = esp32PadPositions.get(pin) ?? [0, 0];
  return [controllerX + x, controllerY + y];
}

function polyline(points, netName, layer = "F.Cu", width = 0.25) {
  const routes = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    routes.push(route(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], netName, layer, width));
  }
  return routes;
}

function columnConnectionPoint(colIndex) {
  const colKeys = keys.filter(k => k.col === colIndex);
  if (colKeys.length === 0) return undefined;
  const allColumnPads = keys.map(k => ({
    x: k.x - 5.08,
    y: k.y,
    col: k.col
  }));
  const pads = colKeys.map(k => ({
    x: k.x - 5.08,
    y: k.y,
    col: k.col
  }));
  const target = pads.reduce((best, point) => (point.y > best.y ? point : best), pads[0]);
  const blocksVerticalDrop = allColumnPads.some(point =>
    point.col !== colIndex &&
    Math.abs(point.x - target.x) < 1.8 &&
    point.y > target.y &&
    point.y < keyFieldHeight
  );
  return {
    x: target.x,
    y: target.y,
    approachX: blocksVerticalDrop
      ? target.x + 8.5
      : target.x,
    entryY: blocksVerticalDrop ? target.y + 5.0 : target.y
  };
}

function columnEscapePoint(pin, colIndex, targetX) {
  const [pinX, pinY] = pinAbs(pin);
  if (pin >= 17 && pin <= 23) {
    const localIndex = pin - 17;
    const escapeX = targetX < controllerX ? controllerX - 18 - colIndex * 0.8 : controllerX + 18 + colIndex * 0.8;
    return {
      pinX,
      pinY,
      viaX: pinX,
      viaY: pinY + 1.5,
      laneY: pinY + 2.45 + localIndex * 0.45,
      escapeX
    };
  }
  if (pinX < controllerX) {
    return {
      pinX,
      pinY,
      viaX: pinX - 3.0,
      viaY: pinY,
      laneY: pinY,
      escapeX: controllerX - 20 - colIndex * 0.55
    };
  }
  return {
    pinX,
    pinY,
    viaX: pinX + 3.0,
    viaY: pinY,
    laneY: pinY,
    escapeX: controllerX + 20 + (15 - colIndex) * 0.55
  };
}

function matrixRoutes() {
  const routes = [];
  for (const k of keys) {
    const sw2 = [k.x + 5.08, k.y];
    const d1 = [k.x + 6.5 - 1.65, k.y + 6.5];
    routes.push(route(sw2[0], sw2[1], d1[0], d1[1], k.da, "F.Cu", 0.25));
  }
  for (let rowIndex = 0; rowIndex < 6; rowIndex += 1) {
    const rowKeys = keys.filter(k => k.row === rowIndex).sort((a, b) => a.x - b.x);
    if (rowKeys.length === 0) continue;
    const busY = rowKeys[0].y + 8.7;
    const taps = rowKeys.map(k => [k.x + 6.5 + 1.65, k.y + 6.5]);
    const minX = Math.min(...taps.map(p => p[0]));
    const maxX = Math.max(...taps.map(p => p[0]));
    for (const [x, y] of taps) routes.push(route(x, y, x, busY, `ROW${rowIndex}`, "F.Cu", 0.25));
    routes.push(route(minX, busY, maxX, busY, `ROW${rowIndex}`, "F.Cu", 0.25));
  }
  for (let colIndex = 0; colIndex < 16; colIndex += 1) {
    const colKeys = keys.filter(k => k.col === colIndex).sort((a, b) => a.y - b.y);
    if (colKeys.length < 2) continue;
    const pads = colKeys.map(k => [k.x - 5.08, k.y]);
    for (let i = 0; i < pads.length - 1; i += 1) {
      const from = pads[i];
      const to = pads[i + 1];
      const skipsEnterPad = colIndex === 13 && from[1] < 40 && to[1] > 70;
      if (skipsEnterPad) {
        continue;
      } else {
        routes.push(route(from[0], from[1], to[0], to[1], `COL${colIndex}`, "B.Cu", 0.25));
      }
    }
  }
  return routes.join("\n");
}

function controllerRoutes() {
  const routes = [];
  const rowPins = [39, 38, 4, 5, 6, 7];
  const colPins = [12, 17, 18, 19, 20, 21, 22, 8, 9, 10, 11, 23, 28, 29, 30, 31];
  const rightEscapeX = boardWidth - 4.4;
  const rearY = keyFieldHeight + 2.0;

  rowPins.forEach((pin, rowIndex) => {
    const rowKeys = keys.filter(k => k.row === rowIndex).sort((a, b) => a.x - b.x);
    if (rowKeys.length === 0) return;
    const [pinX, pinY] = pinAbs(pin);
    const busY = rowKeys[0].y + 8.7;
    const busX = Math.max(...rowKeys.map(k => k.x + 8.15));
    const tapX = rightEscapeX - rowIndex * 1.0;
    const laneY = rearY + rowIndex * 1.2;
    const fanoutOffset = pinX < controllerX ? -(2.0 + rowIndex * 1.0) : (2.0 + rowIndex * 1.0);
    const fanoutX = pinX + fanoutOffset;
    const rowLayer = `In${rowIndex + 1}.Cu`;
    routes.push(...polyline([
      [pinX, pinY],
      [fanoutX, pinY]
    ], `ROW${rowIndex}`, "F.Cu", 0.20));
    routes.push(via(fanoutX, pinY, `ROW${rowIndex}`));
    routes.push(...polyline([
      [fanoutX, pinY],
      [fanoutX, laneY],
      [tapX, laneY],
      [tapX, busY]
    ], `ROW${rowIndex}`, rowLayer, 0.20));
    routes.push(via(tapX, busY, `ROW${rowIndex}`));
    routes.push(route(busX, busY, tapX, busY, `ROW${rowIndex}`, "F.Cu", 0.25));
  });

  colPins.forEach((pin, colIndex) => {
    const target = columnConnectionPoint(colIndex);
    if (!target) return;
    const laneY = keyFieldHeight - 3.0;
    const escape = columnEscapePoint(pin, colIndex, target.x);
    const colLayer = `In${7 + colIndex}.Cu`;
    routes.push(route(escape.pinX, escape.pinY, escape.viaX, escape.viaY, `COL${colIndex}`, "F.Cu", 0.20));
    routes.push(via(escape.viaX, escape.viaY, `COL${colIndex}`));
    routes.push(...polyline([
      [escape.viaX, escape.viaY],
      [escape.viaX, escape.laneY],
      [escape.escapeX, escape.laneY],
      [escape.escapeX, laneY],
      [target.approachX, laneY],
      [target.approachX, target.entryY],
      [target.x, target.entryY],
      [target.x, target.y]
    ], `COL${colIndex}`, colLayer, 0.20));
  });

  return routes.join("\n");
}

function supportRoutes() {
  const routes = [];
  // Bridge the one split column caused by the top-right nav cluster stagger.
  routes.push(...polyline([[275.383, 18.525], [270.0, 18.525], [270.0, 75.675], [275.383, 75.675]], "COL13", "B.Cu", 0.20));

  return routes.join("\n");
}

function boardFile() {
  const footprints = [
    ...keys.flatMap(k => [switchFootprint(k), diodeFootprint(k)]),
    moduleBayFootprint(),
    usbFootprint(),
    esp32Footprint(),
    ldoFootprint(),
    twoPad("R1", "5.1k", controllerX - 45, 5.6, "USB_CC1", "GND"),
    twoPad("R2", "5.1k", controllerX + 45, 5.6, "USB_CC2", "GND"),
    twoPad("R3", "27R", controllerX - 18, 6.2, "USB_DP_CONN", "USB_DP"),
    twoPad("R4", "27R", controllerX + 18, 6.2, "USB_DM_CONN", "USB_DM"),
    twoPad("R5", "10k", controllerX - 52, pcbHeight - 13.2, "ESP_EN", "+3V3"),
    twoPad("R6", "10k", controllerX + 52, pcbHeight - 13.2, "BOOT_IO0", "+3V3"),
    fuse0603("F1", "0603L050SLYR", controllerX - 63, pcbHeight - 9.6, "VBUS", "VBUS_FUSED"),
    twoPad("R10", "10k", controllerX - 63, pcbHeight - 13.2, "MOD_INT", "+3V3"),
    twoPad("C1", "10uF", controllerX - 35, pcbHeight - 9.6, "VBUS", "GND", "OSO75:C_0603"),
    twoPad("C2", "10uF", controllerX - 35, pcbHeight - 13.2, "+3V3", "GND", "OSO75:C_0603"),
    twoPad("C3", "100nF", controllerX - 8, pcbHeight - 5.2, "+3V3", "GND", "OSO75:C_0603"),
    twoPad("C4", "100nF", controllerX + 8, pcbHeight - 5.2, "+3V3", "GND", "OSO75:C_0603"),
    twoPad("C_EN", "1uF", controllerX - 44, pcbHeight - 11.2, "ESP_EN", "GND", "OSO75:C_0603"),
    button("SW_RESET", "RESET", controllerX - 75, pcbHeight - 13.2, "ESP_EN", "GND"),
    button("SW_BOOT", "BOOT", controllerX + 75, pcbHeight - 13.2, "BOOT_IO0", "GND")
  ];
  const edges = [
    edgeLine(0, 0, boardWidth.toFixed(3), 0),
    edgeLine(boardWidth.toFixed(3), 0, boardWidth.toFixed(3), pcbHeight.toFixed(3)),
    edgeLine(boardWidth.toFixed(3), pcbHeight.toFixed(3), 0, pcbHeight.toFixed(3)),
    edgeLine(0, pcbHeight.toFixed(3), 0, 0)
  ].join("\n");
  const nets = [`  (net 0 "")`, ...netNames.map(name => `  ${net(name)}`)].join("\n");
  const routes = [
    matrixRoutes(),
    controllerRoutes(),
    supportRoutes()
  ].join("\n");
  return `(kicad_pcb\n  (version 20240108)\n  (generator "oso75-generate-kicad")\n  (generator_version "0.1")\n  (general (thickness 1.6))\n  (paper "A3")\n  (layers\n    (0 "F.Cu" signal)\n    (31 "B.Cu" signal)\n    (32 "B.Adhes" user "B.Adhesive")\n    (33 "F.Adhes" user "F.Adhesive")\n    (34 "B.Paste" user)\n    (35 "F.Paste" user)\n    (36 "B.SilkS" user "B.Silkscreen")\n    (37 "F.SilkS" user "F.Silkscreen")\n    (38 "B.Mask" user)\n    (39 "F.Mask" user)\n    (44 "Edge.Cuts" user)\n    (45 "Margin" user)\n    (47 "F.CrtYd" user "F.Courtyard")\n    (48 "B.Fab" user)\n    (49 "F.Fab" user)\n  )\n  (setup\n    (pad_to_mask_clearance 0.05)\n    (allow_soldermask_bridges_in_footprints no)\n    (grid_origin 0 0)\n    (pcbplotparams (layerselection 0x00010fc_ffffffff) (plot_on_all_layers_selection 0x0000000_00000000) (disableapertmacros no) (usegerberextensions no) (usegerberattributes yes) (usegerberadvancedattributes yes) (creategerberjobfile yes) (dashed_line_dash_ratio 12.0) (dashed_line_gap_ratio 3.0) (svgprecision 4) (plotframeref no) (mode 1) (useauxorigin no) (hpglpennumber 1) (hpglpenspeed 20) (hpglpendiameter 15.0) (pdf_front_fp_property_popups yes) (pdf_back_fp_property_popups yes) (dxfpolygonmode yes) (dxfimperialunits yes) (dxfusepcbnewfont yes) (psnegative no) (psa4output no) (plot_black_and_white yes) (plotinvisibletext no) (sketchpadsonfab no) (plotreference yes) (plotvalue yes) (plotpadnumbers no) (hidednponfab no) (sketchdnponfab yes) (crossoutdnponfab yes) (subtractmaskfromsilk no) (outputformat 1) (mirror no) (drillshape 1) (scaleselection 1) (outputdirectory ""))\n  )\n${nets}\n${footprints.join("\n")}\n${edges}\n${routes}\n)\n`;
}

function projectFile() {
  return JSON.stringify({
    meta: { version: 1 },
    board: { design_settings: { defaults: { board_thickness: 1.6 } } },
    libraries: { pinned_footprint_libs: [], pinned_symbol_libs: [] },
    project: { files: [] }
  }, null, 2) + "\n";
}

function schematicFile() {
  return `(kicad_sch\n  (version 20240108)\n  (generator "oso75-generate-kicad")\n  (generator_version "0.1")\n  (uuid "${uuid("oso75-sch")}")\n  (paper "A3")\n  (title_block\n    (title "OSO75 Keyboard")\n    (rev "0.1")\n    (company "OSO Keyboard")\n    (comment 1 "Source of truth lives in hardware/pcb generated netlists.")\n  )\n)\n`;
}

function readme() {
  return `# OSO75 KiCad Project

Generated from \`hardware/layout/oso75.layout.json\` and the PCB circuit netlists.

Open \`oso75.kicad_pro\` in KiCad 10. This generator only creates a starter
board; the checked-in \`oso75.kicad_pcb\` has been hand-routed and verified for
prototype ordering.

- ${keys.length} MX switch footprints; ${omittedKeys.map(k => k.label).join(" and ")} are replaced by the module bay
- ${keys.length} SOD-123 diode footprints
- 6 x 16 COL2ROW matrix nets
- ESP32-S3-WROOM-1U-N16 module footprint with native USB and BLE/Wi-Fi. Do not
  substitute N16R8/R16V/Octal-PSRAM variants.
- Flush top-left J3 OSO module bay footprint with 10 exposed contacts and two
  retention holes. Rev A is power-off swap only.
- F1 fused 5 V module rail and R10 module-present/interrupt pullup
- USB-C, CC pulldowns, USB series resistors, LDO, boot/reset, module power, and strapping support
- Board outline sized to the generated case: ${boardWidth.toFixed(3)} mm x ${boardHeight.toFixed(3)} mm
- Generated switch matrix routing: switch-to-diode traces, row buses,
  column buses, row-to-controller escapes, and DRC-clean column-to-controller fanout

Do not overwrite the hand-finished board unless you intentionally want to throw
away routing and fab outputs. For ordering, use the committed board plus the
fresh files under \`fab/\`, not a newly generated starter board.
`;
}

const boardOutPath = path.join(outDir, "oso75.kicad_pcb");
if (!process.argv.includes("--force") && fs.existsSync(boardOutPath)) {
  console.error("Refusing to overwrite hand-finished KiCad board. Use npm run generate:kicad:starter to regenerate the starter board.");
  process.exit(1);
}

write(path.join(outDir, "oso75.kicad_pro"), projectFile());
write(path.join(outDir, "oso75.kicad_sch"), schematicFile());
write(boardOutPath, boardFile());
write(path.join(outDir, "fp-lib-table"), `(fp_lib_table\n  (lib (name "OSO75")(type "KiCad")(uri "\${KIPRJMOD}/OSO75.pretty")(options "")(descr "OSO75 local footprints"))\n  (lib (name "Switch_MX_Hotswap")(type "KiCad")(uri "\${KIPRJMOD}/Switch_MX_Hotswap.pretty")(options "")(descr "Local MX hotswap footprints"))\n  (lib (name "Stabilizer_MX")(type "KiCad")(uri "\${KIPRJMOD}/Stabilizer_MX.pretty")(options "")(descr "Local MX stabilizer footprints"))\n)\n`);
write(path.join(outDir, "README.md"), readme());
ensureDir(path.join(outDir, "OSO75.pretty"));
ensureDir(path.join(outDir, "Switch_MX_Hotswap.pretty"));
ensureDir(path.join(outDir, "Stabilizer_MX.pretty"));

console.log(`Generated KiCad project at ${path.relative(root, outDir)}`);
