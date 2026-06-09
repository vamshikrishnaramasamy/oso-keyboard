import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "hardware/kicad/oso75");
const layout = JSON.parse(fs.readFileSync(path.join(root, "hardware/layout/oso75.layout.json"), "utf8"));
const unit = layout.unit_mm;
const boardWidth = (Math.max(...layout.keys.map(k => k.x + (k.w ?? 1))) * unit) + 18;
const boardHeight = (Math.max(...layout.keys.map(k => k.y + (k.h ?? 1))) * unit) + 18;
const pcbHeight = boardHeight;
const controllerY = boardHeight - 10;
const moduleBay = layout.module_bay;

function keyCenter(key) {
  const w = key.w ?? 1;
  const h = key.h ?? 1;
  return {
    x: ((key.x + w / 2) * unit) + 9,
    y: ((key.y + h / 2) * unit) + 9
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
  "GND", "VBUS", "+3V3", "+1V1", "USB_CC1", "USB_CC2", "USB_DP_CONN",
  "USB_DM_CONN", "USB_DP", "USB_DM", "RESET_N", "FLASH_CS_N", "XTAL_IN",
  "XTAL_OUT", "QSPI_SCLK", "QSPI_SD0", "QSPI_SD1", "QSPI_SD2", "QSPI_SD3",
  "VBUS_SENSE", "VBUS_FUSED", "LED_STATUS", "D85_A", "SWDIO", "SWCLK",
  "MOD_A", "MOD_B", "MOD_INT", "I2C_SDA", "I2C_SCL",
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

const rp2040Pins = {
  1: "+3V3", 2: "ROW0", 3: "ROW1", 4: "ROW2", 5: "ROW3", 6: "ROW4", 7: "ROW5",
  8: "COL0", 9: "COL1", 10: "+3V3", 11: "COL2", 12: "COL3", 13: "COL4",
  14: "COL5", 15: "COL6", 16: "COL7", 17: "COL8", 18: "COL9", 19: "GND",
  20: "XTAL_IN", 21: "XTAL_OUT", 22: "+3V3", 23: "+1V1", 24: "SWCLK",
  25: "SWDIO", 26: "RESET_N", 27: "COL10", 28: "COL11", 29: "COL12",
  30: "COL13", 31: "COL14", 32: "COL15", 33: "+3V3", 34: "LED_STATUS",
  35: "GND", 36: "VBUS_SENSE", 37: "MOD_INT", 38: "MOD_A", 39: "MOD_B",
  40: "I2C_SDA", 41: "I2C_SCL", 42: "+3V3", 43: "+3V3", 44: "+3V3",
  45: "+1V1", 46: "USB_DM", 47: "USB_DP", 48: "+3V3", 49: "+3V3",
  50: "+1V1", 51: "QSPI_SD3", 52: "QSPI_SCLK", 53: "QSPI_SD0",
  54: "QSPI_SD2", 55: "QSPI_SD1", 56: "FLASH_CS_N", 57: "GND"
};

function qfnPadPosition(pin) {
  const pitch = 0.4;
  const start = -2.6;
  if (pin <= 14) return [-3.65, start + (pin - 1) * pitch, 90, 0.18, 0.82];
  if (pin <= 28) return [start + (pin - 15) * pitch, 3.65, 0, 0.18, 0.82];
  if (pin <= 42) return [3.65, 2.6 - (pin - 29) * pitch, 90, 0.18, 0.82];
  return [2.6 - (pin - 43) * pitch, -3.65, 0, 0.18, 0.82];
}

function rp2040Footprint() {
  const pads = [];
  for (let pin = 1; pin <= 56; pin += 1) {
    const [x, y, rot, sx, sy] = qfnPadPosition(pin);
    pads.push(`    (pad "${pin}" smd roundrect (at ${x.toFixed(3)} ${y.toFixed(3)} ${rot}) (size ${sx} ${sy}) (layers "F.Cu" "F.Paste" "F.Mask") ${padNet(rp2040Pins[pin])} (roundrect_rratio 0.2) (uuid "${uuid(`rp2040:${pin}`)}"))`);
  }
  pads.push(pad("U1", "57", "smd", "rect", 0, 0, 4.2, 4.2, '"F.Cu" "F.Paste" "F.Mask"', "GND"));
  const body = [
    fpLine(-3.7, -3.7, 3.7, -3.7),
    fpLine(3.7, -3.7, 3.7, 3.7),
    fpLine(3.7, 3.7, -3.7, 3.7),
    fpLine(-3.7, 3.7, -3.7, -3.7),
    fpLine(-4.25, -4.25, -3.35, -4.25, "F.Fab", 0.16),
    fpLine(-4.25, -4.25, -4.25, -3.35, "F.Fab", 0.16),
    ...pads
  ].join("\n");
  return footprint("U1", "RP2040", boardWidth / 2, controllerY, body, "Package_DFN_QFN:QFN-56-1EP_7x7mm_P0.4mm_EP4x4mm");
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
      '"F.Cu" "F.Paste" "F.Mask"',
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
    ...contactPads,
    pad("J3", "MH1", "np_thru_hole", "circle", -moduleBay.w_mm / 2 + 6, 0, 3.6, 3.6, '"*.Cu" "*.Mask"', "", " (drill 1.8)"),
    pad("J3", "MH2", "np_thru_hole", "circle", moduleBay.w_mm / 2 - 6, 0, 3.6, 3.6, '"*.Cu" "*.Mask"', "", " (drill 1.8)")
  ].join("\n");
  return footprint("J3", "OSO_Module_Bay_10", x, y, body, "OSO75:OSO_Module_Bay_10");
}

function usbFootprint() {
  const x = boardWidth / 2;
  const y = pcbHeight - 2.8;
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

function flashFootprint() {
  const nets = {
    1: "FLASH_CS_N", 2: "QSPI_SD1", 3: "QSPI_SD2", 4: "GND",
    5: "QSPI_SD0", 6: "QSPI_SCLK", 7: "QSPI_SD3", 8: "+3V3"
  };
  const pads = [];
  for (let i = 1; i <= 4; i += 1) pads.push(pad("U2", String(i), "smd", "roundrect", -2.7, -1.905 + (i - 1) * 1.27, 1.1, 0.55, '"F.Cu" "F.Paste" "F.Mask"', nets[i], " (roundrect_rratio 0.2)"));
  for (let i = 5; i <= 8; i += 1) pads.push(pad("U2", String(i), "smd", "roundrect", 2.7, 1.905 - (i - 5) * 1.27, 1.1, 0.55, '"F.Cu" "F.Paste" "F.Mask"', nets[i], " (roundrect_rratio 0.2)"));
  const body = [
    fpLine(-2.1, -2.8, 2.1, -2.8),
    fpLine(2.1, -2.8, 2.1, 2.8),
    fpLine(2.1, 2.8, -2.1, 2.8),
    fpLine(-2.1, 2.8, -2.1, -2.8),
    ...pads
  ].join("\n");
  return footprint("U2", "W25Q128", boardWidth / 2 + 13, controllerY, body, "Package_SO:SOIC-8_3.9x4.9mm_P1.27mm");
}

function ldoFootprint() {
  const nets = { 1: "VBUS", 2: "GND", 3: "+3V3", 4: "+3V3", 5: "VBUS" };
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
  return footprint("U3", "AP2112K-3.3", boardWidth / 2 - 18, controllerY, body, "OSO75:SOT-23-5_LDO");
}

function edgeLine(x1, y1, x2, y2) {
  return `  (gr_line (start ${x1} ${y1}) (end ${x2} ${y2}) (stroke (width 0.1) (type solid)) (layer "Edge.Cuts") (uuid "${uuid(`edge:${x1}:${y1}:${x2}:${y2}`)}"))`;
}

function route(x1, y1, x2, y2, netName, layer = "F.Cu", width = 0.25) {
  return `  (segment (start ${x1.toFixed(3)} ${y1.toFixed(3)}) (end ${x2.toFixed(3)} ${y2.toFixed(3)}) (width ${width}) (layer "${layer}") (net ${netIds.get(netName)}) (uuid "${uuid(`route:${x1}:${y1}:${x2}:${y2}:${netName}:${layer}`)}"))`;
}

function via(x, y, netName) {
  return `  (via (at ${x.toFixed(3)} ${y.toFixed(3)}) (size 0.8) (drill 0.4) (layers "F.Cu" "B.Cu") (net ${netIds.get(netName)}) (uuid "${uuid(`via:${x}:${y}:${netName}`)}"))`;
}

function matrixRoutes() {
  const routes = [];
  for (const k of keys) {
    const sw2 = [k.x + 5.08, k.y];
    const d1 = [k.x + 6.5 - 1.65, k.y + 6.5];
    const d2 = [k.x + 6.5 + 1.65, k.y + 6.5];
    routes.push(route(sw2[0], sw2[1], d1[0], d1[1], k.da, "F.Cu", 0.25));
  }
  return routes.join("\n");
}

function boardFile() {
  const footprints = [
    ...keys.flatMap(k => [switchFootprint(k), diodeFootprint(k)]),
    moduleBayFootprint(),
    usbFootprint(),
    rp2040Footprint(),
    flashFootprint(),
    ldoFootprint(),
    twoPad("R1", "5.1k", boardWidth / 2 - 8, pcbHeight - 8, "USB_CC1", "GND"),
    twoPad("R2", "5.1k", boardWidth / 2 + 8, pcbHeight - 8, "USB_CC2", "GND"),
    twoPad("R3", "27R", boardWidth / 2 - 5, pcbHeight - 13, "USB_DP_CONN", "USB_DP"),
    twoPad("R4", "27R", boardWidth / 2 + 5, pcbHeight - 13, "USB_DM_CONN", "USB_DM"),
    twoPad("R5", "100k", boardWidth / 2 - 25, controllerY - 6, "RESET_N", "+3V3"),
    twoPad("R6", "100k", boardWidth / 2 + 25, controllerY - 6, "FLASH_CS_N", "+3V3"),
    twoPad("F1", "500mA", boardWidth / 2 - 44, controllerY + 7, "VBUS", "VBUS_FUSED", "OSO75:Polyfuse_1206"),
    twoPad("R10", "10k", boardWidth / 2 - 33, controllerY + 7, "MOD_INT", "+3V3"),
    twoPad("C1", "10uF", boardWidth / 2 - 24, pcbHeight - 12, "VBUS", "GND", "OSO75:C_0603"),
    twoPad("C2", "10uF", boardWidth / 2 - 24, pcbHeight - 15, "+3V3", "GND", "OSO75:C_0603"),
    twoPad("C3", "1uF", boardWidth / 2 - 9, controllerY - 5, "+1V1", "GND", "OSO75:C_0603"),
    twoPad("C4", "100nF", boardWidth / 2 + 9, controllerY - 5, "+3V3", "GND", "OSO75:C_0603"),
    twoPad("C5", "18pF", boardWidth / 2 - 6, controllerY - 11, "XTAL_IN", "GND", "OSO75:C_0603"),
    twoPad("C6", "18pF", boardWidth / 2 + 6, controllerY - 11, "XTAL_OUT", "GND", "OSO75:C_0603"),
    button("SW_RESET", "RESET", boardWidth / 2 - 34, controllerY, "RESET_N", "GND"),
    button("SW_BOOT", "BOOT", boardWidth / 2 + 34, controllerY, "FLASH_CS_N", "GND")
  ];
  const edges = [
    edgeLine(0, 0, boardWidth.toFixed(3), 0),
    edgeLine(boardWidth.toFixed(3), 0, boardWidth.toFixed(3), pcbHeight.toFixed(3)),
    edgeLine(boardWidth.toFixed(3), pcbHeight.toFixed(3), 0, pcbHeight.toFixed(3)),
    edgeLine(0, pcbHeight.toFixed(3), 0, 0)
  ].join("\n");
  const nets = [`  (net 0 "")`, ...netNames.map(name => `  ${net(name)}`)].join("\n");
  return `(kicad_pcb\n  (version 20240108)\n  (generator "oso75-generate-kicad")\n  (generator_version "0.1")\n  (general (thickness 1.6))\n  (paper "A3")\n  (layers\n    (0 "F.Cu" signal)\n    (31 "B.Cu" signal)\n    (32 "B.Adhes" user "B.Adhesive")\n    (33 "F.Adhes" user "F.Adhesive")\n    (34 "B.Paste" user)\n    (35 "F.Paste" user)\n    (36 "B.SilkS" user "B.Silkscreen")\n    (37 "F.SilkS" user "F.Silkscreen")\n    (38 "B.Mask" user)\n    (39 "F.Mask" user)\n    (44 "Edge.Cuts" user)\n    (45 "Margin" user)\n    (47 "F.CrtYd" user "F.Courtyard")\n    (48 "B.Fab" user)\n    (49 "F.Fab" user)\n  )\n  (setup\n    (pad_to_mask_clearance 0.05)\n    (allow_soldermask_bridges_in_footprints no)\n    (grid_origin 0 0)\n    (pcbplotparams (layerselection 0x00010fc_ffffffff) (plot_on_all_layers_selection 0x0000000_00000000) (disableapertmacros no) (usegerberextensions no) (usegerberattributes yes) (usegerberadvancedattributes yes) (creategerberjobfile yes) (dashed_line_dash_ratio 12.0) (dashed_line_gap_ratio 3.0) (svgprecision 4) (plotframeref no) (mode 1) (useauxorigin no) (hpglpennumber 1) (hpglpenspeed 20) (hpglpendiameter 15.0) (pdf_front_fp_property_popups yes) (pdf_back_fp_property_popups yes) (dxfpolygonmode yes) (dxfimperialunits yes) (dxfusepcbnewfont yes) (psnegative no) (psa4output no) (plot_black_and_white yes) (plotinvisibletext no) (sketchpadsonfab no) (plotreference yes) (plotvalue yes) (plotpadnumbers no) (hidednponfab no) (sketchdnponfab yes) (crossoutdnponfab yes) (subtractmaskfromsilk no) (outputformat 1) (mirror no) (drillshape 1) (scaleselection 1) (outputdirectory ""))\n  )\n${nets}\n${footprints.join("\n")}\n${edges}\n${matrixRoutes()}\n)\n`;
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

Open \`oso75.kicad_pro\` in KiCad 10. The board currently contains:

- ${keys.length} MX switch footprints; ${omittedKeys.map(k => k.label).join(" and ")} are replaced by the module bay
- ${keys.length} SOD-123 diode footprints
- 6 x 16 COL2ROW matrix nets
- RP2040 QFN-56 footprint with real package pin/net assignment
- Flush top-left J3 OSO module bay footprint with 10 exposed contacts and two retention holes
- F1 fused 5 V module rail and R10 module-present/interrupt pullup
- USB-C, CC pulldowns, USB series resistors, LDO, flash, boot/reset, crystal/load caps
- Board outline sized to the generated case: ${boardWidth.toFixed(3)} mm x ${boardHeight.toFixed(3)} mm
- First-pass local switch-to-diode routing

This is an electrical/layout starting point, not a fab-ready release yet. Next pass:
route the remaining row/column/controller/module nets, add stabilizer holes,
tune USB diff-pair routing, run interactive KiCad DRC, and export Gerbers after review.
`;
}

write(path.join(outDir, "oso75.kicad_pro"), projectFile());
write(path.join(outDir, "oso75.kicad_sch"), schematicFile());
write(path.join(outDir, "oso75.kicad_pcb"), boardFile());
write(path.join(outDir, "fp-lib-table"), `(fp_lib_table\n  (lib (name "OSO75")(type "KiCad")(uri "\${KIPRJMOD}/OSO75.pretty")(options "")(descr "OSO75 local footprints"))\n)\n`);
write(path.join(outDir, "README.md"), readme());
ensureDir(path.join(outDir, "OSO75.pretty"));

console.log(`Generated KiCad project at ${path.relative(root, outDir)}`);
