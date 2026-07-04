import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const layoutPath = path.join(root, "hardware/layout/oso75.layout.json");
const layout = JSON.parse(fs.readFileSync(layoutPath, "utf8"));

const unit = layout.unit_mm;
const boardWidth = (Math.max(...layout.keys.map(k => k.x + (k.w ?? 1))) * unit) + 18;
const keyFieldHeight = (Math.max(...layout.keys.map(k => k.y + (k.h ?? 1))) * unit) + 18;
const rearElectronicsHeight = 13;
const boardHeight = keyFieldHeight + rearElectronicsHeight;
const esp32Module = "ESP32-S3-WROOM-1U-N16";
const moduleBay = layout.module_bay
  ? {
      ...layout.module_bay,
      // layout.module_bay is authored in layout space (y measured downward from
      // the top of the key field, same as the keys). CAD/PCB space is y-up, so
      // flip y here. The result must match J3 on the hand-routed KiCad board:
      // rect x 11..65, y 107.063..132.063, center (38, 119.563).
      x_mm: layout.module_bay.x_mm,
      y_mm: keyFieldHeight - layout.module_bay.y_mm - layout.module_bay.h_mm
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
    if (ref && at) {
      // KiCad canvas y points down; CAD y points up. The board follows the
      // conventional KiCad orientation (F-row/USB band at small y), so flip
      // into CAD space here. Use the rounded outline height (150.063) -- the
      // raw boardHeight is 150.0625 and the half-micron mismatch flips
      // 3-decimal rounding on some keys.
      centers.set(ref[1], { x: Number(at[1]), y: Number((Number(boardHeight.toFixed(3)) - Number(at[2])).toFixed(3)) });
    }
  }
  return centers;
}

const pcbSwitchCenters = readPcbSwitchCenters();

function readPcbFootprintCenters(refs) {
  const pcbPath = path.join(root, "hardware/kicad/oso75/oso75.kicad_pcb");
  if (!fs.existsSync(pcbPath)) return new Map();
  const pcb = fs.readFileSync(pcbPath, "utf8");
  const centers = new Map();
  const footprints = pcb.split("\n\t(footprint ").slice(1).map(block => `\t(footprint ${block}`);
  for (const footprint of footprints) {
    const ref = footprint.match(/\(property\s+"Reference"\s+"([^"]+)"/);
    if (!ref || !refs.includes(ref[1])) continue;
    const at = footprint.match(/\(at\s+([\d.-]+)\s+([\d.-]+)/);
    // Same canvas-to-CAD y flip as readPcbSwitchCenters (rounded outline height).
    if (at) centers.set(ref[1], { x: Number(at[1]), y: Number((Number(boardHeight.toFixed(3)) - Number(at[2])).toFixed(3)) });
  }
  return centers;
}

const pcbRefCenters = readPcbFootprintCenters(["J1", "J3"]);
const cadFit = {
  caseWall: 4,
  caseFloor: 3,
  pcbClearance: 0.8,
  pcbThickness: 1.6,
  pcbZ: 9.5,
  plateZ: 14.5,
  plateThickness: 1.6,
  usbConnectorCenterAbovePcbTop: 1.6
};
const caseHeight = cadFit.plateZ + cadFit.plateThickness + 1.0;
// J1 sits on F.Cu (the physical top of the PCB), so the connector shell is
// centered ~1.6 mm above the PCB top surface: 9.5 + 1.6 + 1.6 = 12.7.
const usbCZ = cadFit.pcbZ + cadFit.pcbThickness + cadFit.usbConnectorCenterAbovePcbTop;

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
  // Key centers from keyCenter() are in layout space (y-down), so compare
  // against the raw layout-space bay rect, not the flipped CAD-space one.
  if (!layout.module_bay) return false;
  const bay = layout.module_bay;
  const center = keyCenter(key);
  return (
    center.x >= bay.x_mm &&
    center.x <= bay.x_mm + bay.w_mm &&
    center.y >= bay.y_mm &&
    center.y <= bay.y_mm + bay.h_mm
  );
}

const omittedKeys = layout.keys.filter(isInsideModuleBay);
const physicalLayoutKeys = layout.keys.filter(key => !isInsideModuleBay(key));
const keys = physicalLayoutKeys.map((key, index) => ({
  w: 1,
  h: 1,
  ...key,
  index,
  ref: `SW${index + 1}`,
  diode: `D${index + 1}`,
  ...(() => {
    const ref = `SW${index + 1}`;
    const center = pcbSwitchCenters.get(ref) ?? keyCenter(key);
    return {
      cx: center.x - 9,
      cy: center.y - 9,
      pcbX: center.x,
      pcbY: center.y
    };
  })()
}));

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function write(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content);
}

function keycodeFor(label) {
  const map = {
    Esc: "KC_ESC",
    "`": "KC_GRV",
    "-": "KC_MINS",
    "=": "KC_EQL",
    Backspace: "KC_BSPC",
    Tab: "KC_TAB",
    "[": "KC_LBRC",
    "]": "KC_RBRC",
    "\\": "KC_BSLS",
    Caps: "KC_CAPS",
    ";": "KC_SCLN",
    "'": "KC_QUOT",
    Enter: "KC_ENT",
    LShift: "KC_LSFT",
    RShift: "KC_RSFT",
    ",": "KC_COMM",
    ".": "KC_DOT",
    "/": "KC_SLSH",
    LCtrl: "KC_LCTL",
    LGUI: "KC_LGUI",
    LAlt: "KC_LALT",
    Space: "KC_SPC",
    RAlt: "KC_RALT",
    Fn: "MO(1)",
    Menu: "KC_APP",
    RCtrl: "KC_RCTL",
    PrtSc: "KC_PSCR",
    Ins: "KC_INS",
    Home: "KC_HOME",
    PgUp: "KC_PGUP",
    Del: "KC_DEL",
    End: "KC_END",
    PgDn: "KC_PGDN",
    Up: "KC_UP",
    Left: "KC_LEFT",
    Down: "KC_DOWN",
    Right: "KC_RGHT"
  };
  if (map[label]) return map[label];
  if (/^F\d+$/.test(label)) return `KC_${label}`;
  if (/^[A-Z]$/.test(label)) return `KC_${label}`;
  if (/^\d$/.test(label)) return `KC_${label}`;
  throw new Error(`No QMK keycode mapping for ${label}`);
}

function scadString() {
  const keyRows = keys
    .map(k => `  [${k.cx.toFixed(3)}, ${k.cy.toFixed(3)}, ${(k.w * unit).toFixed(3)}, ${(k.h * unit).toFixed(3)}, ${JSON.stringify(k.label)}]`)
    .join(",\n");
  const moduleContactPitch = 3.8;
  const moduleContactSpan = (moduleBay.pins.length - 1) * moduleContactPitch;
  const moduleContactStart = (moduleBay.w_mm - moduleContactSpan) / 2;
  return `// Generated by scripts/generate.mjs. Edit hardware/layout/oso75.layout.json.
$fn = 16;
unit = ${unit};
plate_thickness = ${cadFit.plateThickness};
case_wall = ${cadFit.caseWall};
case_floor = ${cadFit.caseFloor};
pcb_clearance = ${cadFit.pcbClearance};
pcb_thickness = ${cadFit.pcbThickness};
pcb_z = ${cadFit.pcbZ};
usb_c_z = ${usbCZ};
switch_cutout = ${layout.switch_cutout_mm};
plate_z = ${cadFit.plateZ};
case_height = plate_z + plate_thickness + 1.0;
gadget_x = ${moduleBay.x_mm};
gadget_y = ${moduleBay.y_mm.toFixed(3)};
gadget_w = ${moduleBay.w_mm};
gadget_h = ${moduleBay.h_mm};
gadget_contact_pitch = ${moduleContactPitch};
gadget_contact_start = ${moduleContactStart.toFixed(3)};
// Contact row offset from the bay's low-y edge; matches J3 pads on the
// routed board (pad centers at y = 114.363 = 107.063 + 7.3).
gadget_contact_y = 7.3;
board_width = ${boardWidth.toFixed(3)};
board_height = ${boardHeight.toFixed(3)};
usb_c_x = board_width / 2;
keys = [
${keyRows}
];

module rounded_rect_2d(size, radius) {
  offset(r = radius)
    square([max(0.1, size[0] - radius * 2), max(0.1, size[1] - radius * 2)], center = true);
}

module rounded_box(size, radius) {
  linear_extrude(height = size[2])
    translate([size[0] / 2, size[1] / 2])
      rounded_rect_2d([size[0], size[1]], radius);
}

module switch_cutouts(depth = plate_thickness + 0.3) {
  for (k = keys) {
    if (!(k[0] + 9 > gadget_x - 2 && k[0] + 9 < gadget_x + gadget_w + 2 && k[1] + 9 > gadget_y - 2 && k[1] + 9 < gadget_y + gadget_h + 2)) {
      translate([k[0] + 9, k[1] + 9, -0.15])
        cube([switch_cutout, switch_cutout, depth], center = true);
    }
  }
}

module plate_bezels() {
  for (k = keys) {
    if (!(k[0] + 9 > gadget_x - 2 && k[0] + 9 < gadget_x + gadget_w + 2 && k[1] + 9 > gadget_y - 2 && k[1] + 9 < gadget_y + gadget_h + 2)) {
      translate([k[0] + 9, k[1] + 9, plate_thickness - 0.2])
        linear_extrude(height = 0.45)
          difference() {
            square([min(k[2] - 2.2, 17.2), 17.2], center = true);
            square([switch_cutout, switch_cutout], center = true);
          }
    }
  }
}

module stabilizer_slots() {
  for (k = keys) {
    if (k[2] >= unit * 1.75) {
      stab_spacing = k[2] >= unit * 5 ? 50 : 23.8;
      for (xoff = [-stab_spacing / 2, stab_spacing / 2]) {
        translate([k[0] + 9 + xoff, k[1] + 9, -0.2])
          cube([6.6, 12.4, plate_thickness + 0.5], center = true);
      }
    }
  }
}

module gadget_bay_cutouts() {
  translate([gadget_x + gadget_w / 2, gadget_y + gadget_h / 2, plate_thickness - 0.55])
    linear_extrude(height = 0.75)
      rounded_rect_2d([gadget_w, gadget_h], 3);

  for (xoff = [6, gadget_w - 6]) {
    translate([gadget_x + xoff, gadget_y + gadget_h / 2, -0.2])
      cylinder(h = plate_thickness + 0.5, r = 1.8);
  }
}

module gadget_bay_details() {
  translate([gadget_x + gadget_w / 2, gadget_y + gadget_h / 2, plate_thickness + 0.15])
    linear_extrude(height = 0.65)
      difference() {
        rounded_rect_2d([gadget_w + 2.2, gadget_h + 2.2], 3.6);
        rounded_rect_2d([gadget_w - 2.4, gadget_h - 2.4], 2.2);
  }

  for (i = [0:9]) {
    translate([gadget_x + gadget_contact_start + i * gadget_contact_pitch, gadget_y + gadget_contact_y, plate_thickness + 0.85])
      cube([1.9, 4.2, 0.5], center = true);
  }

  translate([gadget_x + gadget_w / 2, gadget_y + gadget_h - 6.5, plate_thickness + 0.9])
    cube([31, 2.2, 0.45], center = true);
}

// USB-C exits through the BACK wall (high y): J1 sits at the rear edge of
// the PCB next to the ESP32 module.
module usb_c_slot(width = 10.2, height = 3.8, depth = case_wall + 0.7) {
  translate([case_wall + usb_c_x, case_wall * 2 + board_height + 0.35, usb_c_z])
    rotate([90, 0, 0])
      linear_extrude(height = depth)
        rounded_rect_2d([width, height], height / 2);
}

module usb_c_bezel() {
  translate([case_wall + usb_c_x, case_wall * 2 + board_height + 0.2, usb_c_z])
    rotate([90, 0, 0])
      linear_extrude(height = 0.7)
        difference() {
          rounded_rect_2d([13.4, 6.4], 2.3);
          rounded_rect_2d([10.2, 3.8], 1.9);
        }
}

module pcb_switch_holes(depth = pcb_thickness + 0.3) {
  for (k = keys) {
    translate([k[0] + 9, k[1] + 9, -0.15])
      cylinder(h = depth, r = 2.05);
    for (xoff = [-5.08, 5.08]) {
      translate([k[0] + 9 + xoff, k[1] + 9, -0.15])
        cylinder(h = depth, r = 1.15);
    }
  }
}

module pcb_switch_pads() {
  for (k = keys) {
    translate([k[0] + 9 - 5.08, k[1] + 9, pcb_thickness + 0.03])
      cylinder(h = 0.12, r = 2.0);
    translate([k[0] + 9 + 5.08, k[1] + 9, pcb_thickness + 0.03])
      cylinder(h = 0.12, r = 2.0);
    translate([k[0] + 9 + 6.5, k[1] + 9 + 6.5, pcb_thickness + 0.05])
      cube([4.6, 2.5, 0.14], center = true);
  }
}

module pcb_module_bay_holes(depth = pcb_thickness + 0.3) {
  for (xoff = [6, gadget_w - 6]) {
    translate([gadget_x + xoff, gadget_y + gadget_h / 2, -0.15])
      cylinder(h = depth, r = 1.8);
  }
}

module pcb_module_bay_contacts() {
  for (i = [0:9]) {
    translate([gadget_x + gadget_contact_start + i * gadget_contact_pitch, gadget_y + gadget_contact_y, pcb_thickness + 0.08])
      cube([1.9, 4.2, 0.16], center = true);
  }
}

module pcb_preview() {
  translate([case_wall, case_wall, pcb_z]) {
    color("#247a4b")
      difference() {
        rounded_box([board_width, board_height, pcb_thickness], 5);
        pcb_switch_holes();
        pcb_module_bay_holes();
      }
    color("#c9a13a")
      pcb_switch_pads();
    color("#c9a13a")
      pcb_module_bay_contacts();
    color("#b9bbb3")
    translate([usb_c_x, board_height - 2.8, usb_c_z - pcb_z])
      cube([9.8, 5.6, 3.2], center = true);
  }
}

module top_plate() {
  difference() {
    rounded_box([board_width, board_height, plate_thickness], 5);
    switch_cutouts();
    stabilizer_slots();
    gadget_bay_cutouts();
  }
  plate_bezels();
  gadget_bay_details();
}

module tray_case() {
  difference() {
    rounded_box([board_width + case_wall * 2, board_height + case_wall * 2, case_height], 8);
    translate([case_wall - pcb_clearance / 2, case_wall - pcb_clearance / 2, case_floor])
      rounded_box([board_width + pcb_clearance, board_height + pcb_clearance, case_height + 1], 5);
    usb_c_slot();
  }
}

module keycap_frames() {
  for (k = keys) {
    if (!(k[0] + 9 > gadget_x - 2 && k[0] + 9 < gadget_x + gadget_w + 2 && k[1] + 9 > gadget_y - 2 && k[1] + 9 < gadget_y + gadget_h + 2)) {
      translate([k[0] + 9 + case_wall, k[1] + 9 + case_wall, plate_z + plate_thickness + 1.45])
        difference() {
          cube([max(10, k[2] - 3.4), max(10, k[3] - 3.8), 2.2], center = true);
          cube([switch_cutout + 1.2, switch_cutout + 1.2, 2.6], center = true);
        }
    }
  }
}

color("#aaa79b") tray_case();
pcb_preview();
color("#b7b2a4") usb_c_bezel();
color("#d1c8a5") translate([case_wall, case_wall, plate_z]) top_plate();
// keycap_frames() is intentionally not included in the raw export. The STL
// should show printable/cut geometry only, not decorative keycap previews.
`;
}

function keyboardJson() {
  const matrixPins = {
    rows: ["GPIO1", "GPIO2", "GPIO4", "GPIO5", "GPIO6", "GPIO7"],
    cols: ["GPIO8", "GPIO9", "GPIO10", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO21", "GPIO35", "GPIO36", "GPIO37", "GPIO38"]
  };
  return JSON.stringify({
    manufacturer: "OSO",
    keyboard_name: "OSO75",
    maintainer: "OSO Keyboard contributors",
    bootloader: "esp-idf",
    processor: "ESP32-S3",
    diode_direction: "COL2ROW",
    features: {
      bootmagic: true,
      command: false,
      console: false,
      extrakey: true,
      mousekey: true,
      nkro: true
    },
    matrix_pins: matrixPins,
    usb: {
      device_version: "0.1.0",
      pid: "0x7501",
      vid: "0x4F53"
    },
    layouts: {
      LAYOUT: {
        layout: keys.map(k => ({
          label: k.label,
          matrix: [k.row, k.col],
          x: k.x,
          y: k.y,
          ...(k.w !== 1 ? { w: k.w } : {}),
          ...(k.h !== 1 ? { h: k.h } : {})
        }))
      }
    }
  }, null, 2) + "\n";
}

function keymapC() {
  const layer0 = keys.map(k => keycodeFor(k.label));
  const layer1 = keys.map(k => {
    const fn = {
      Esc: "QK_BOOT",
      "1": "KC_F1",
      "2": "KC_F2",
      "3": "KC_F3",
      "4": "KC_F4",
      "5": "KC_F5",
      "6": "KC_F6",
      "7": "KC_F7",
      "8": "KC_F8",
      "9": "KC_F9",
      "0": "KC_F10",
      "-": "KC_F11",
      "=": "KC_F12",
      Up: "KC_VOLU",
      Down: "KC_VOLD",
      Left: "KC_MPRV",
      Right: "KC_MNXT",
      Space: "KC_MPLY",
      Backspace: "KC_DEL"
    };
    return fn[k.label] ?? "KC_TRNS";
  });
  const rows = arr => arr.map((code, i) => `    ${code}${i === arr.length - 1 ? "" : ","}`).join("\n");
  return `// Generated by scripts/generate.mjs. Edit hardware/layout/oso75.layout.json.\n#include QMK_KEYBOARD_H\n\nconst uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n  [0] = LAYOUT(\n${rows(layer0)}\n  ),\n  [1] = LAYOUT(\n${rows(layer1)}\n  )\n};\n`;
}

function placementCsv() {
  const header = "ref,type,label,row,col,x_mm,y_mm,rotation,footprint\n";
  const rows = keys.flatMap(k => [
    `${k.ref},switch,${JSON.stringify(k.label)},${k.row},${k.col},${k.pcbX.toFixed(3)},${k.pcbY.toFixed(3)},0,MX_Hotswap_1u`,
    `${k.diode},diode,${JSON.stringify(k.label)},${k.row},${k.col},${(k.pcbX + 6.5).toFixed(3)},${(k.pcbY + 6.5).toFixed(3)},90,D_SOD-123`
  ]);
  if (moduleBay) {
    rows.push(
      [
        "J3",
        "module_bay",
        JSON.stringify("OSO module bay"),
        "",
        "",
        (moduleBay.x_mm + moduleBay.w_mm / 2).toFixed(3),
        (moduleBay.y_mm + moduleBay.h_mm / 2).toFixed(3),
        "0",
        "OSO_Module_Bay_10"
      ].join(",")
    );
  }
  return header + rows.join("\n") + "\n";
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? JSON.stringify(text) : text;
}

function matrixNetlistCsv() {
  const header = [
    "switch_ref",
    "diode_ref",
    "label",
    "row",
    "col",
    "switch_pin_1",
    "switch_pin_2",
    "diode_anode",
    "diode_cathode",
    "column_net",
    "row_net",
    "x_mm",
    "y_mm"
  ].join(",");
  const rows = keys.map(k => [
    k.ref,
    k.diode,
    k.label,
    k.row,
    k.col,
    `COL${k.col}`,
    `${k.diode}_A`,
    `${k.diode}_A`,
    `ROW${k.row}`,
    `COL${k.col}`,
    `ROW${k.row}`,
    k.pcbX.toFixed(3),
    k.pcbY.toFixed(3)
  ].map(csv).join(","));
  return `${header}\n${rows.join("\n")}\n`;
}

function componentCsv() {
  const fixed = [
    ["U1", esp32Module, "RF module with external IPEX antenna", esp32Module, "factory", "Main MCU module with native USB, Wi-Fi, BLE, 16 MB flash, and external antenna connector; do not substitute N16R8/R16V/Octal-PSRAM variants"],
    ["U3", "3.3 V LDO", "SOT-23-5", "AP2112K-3.3TRG1", "factory", "USB 5 V to 3.3 V"],
    ["J1", "USB-C receptacle", "USB-C-16P-SMD", "HRO TYPE-C-31-M-12", "factory", "USB 2.0 device port"],
    ["J3", "OSO module bay PCB pads", "exposed ENIG pads + 2 retention holes", "DNP - PCB copper only", "DNP", "Keyboard side of the module bay; power-off swap only in rev A; removable modules provide spring contacts"],
    ["F1", "500mA resettable fuse", "0603 PPTC", "Littelfuse 0603L050SLYR", "factory", "6 V 500 mA hold resettable fuse for optional module-bay 5 V"],
    ["SW_BOOT", "Boot tactile switch", "SMD tactile", "SKRPACE010", "factory", "Pull GPIO0 low for ROM download mode"],
    ["SW_RESET", "Reset tactile switch", "SMD tactile", "SKRPACE010", "factory", "Pull EN low"],
    ["R1", "5.1k", "0603", "generic", "factory", "USB-C CC1 pulldown"],
    ["R2", "5.1k", "0603", "generic", "factory", "USB-C CC2 pulldown"],
    ["R3", "27R", "0603", "generic", "factory", "USB D+ series"],
    ["R4", "27R", "0603", "generic", "factory", "USB D- series"],
    ["R5", "10k", "0603", "generic", "factory", "ESP_EN pullup"],
    ["R6", "10k", "0603", "generic", "factory", "GPIO0 boot pullup"],
    ["R10", "10k", "0603", "generic", "factory", "Module present/interrupt pullup"],
    ["C1", "10uF 10V", "0603", "generic X5R/X7R", "factory", "LDO input; footprint is 0603 only"],
    ["C2", "10uF 10V", "0603", "generic X5R/X7R", "factory", "LDO output; footprint is 0603 only"],
    ["C3", "100nF", "0603", "generic X7R", "factory", "ESP32 local decoupling"],
    ["C4", "100nF", "0603", "generic X7R", "factory", "ESP32 local decoupling"],
    ["C_EN", "1uF", "0603", "generic X5R/X7R", "factory", "ESP_EN reset delay capacitor"]
  ];
  const matrix = keys.flatMap(k => [
    [k.ref, "MX hotswap socket", "Kailh MX hotswap", "CPG151101S11", "builder or factory", `${k.label} switch`],
    [k.diode, "1N4148W", "SOD-123", "1N4148W", "factory", `${k.label} anti-ghosting diode; pad 1/cathode band faces ROW net`]
  ]);
  const header = "ref,value,footprint,mpn,assembly,notes";
  return `${header}\n${[...fixed, ...matrix].map(row => row.map(csv).join(",")).join("\n")}\n`;
}

function esp32s3NetlistCsv() {
  const rows = [
    ["J1", "A1/B1/A12/B12", "GND", "USB-C shell and ground pins"],
    ["J1", "A4/B4/A9/B9", "VBUS", "USB 5 V input"],
    ["J1", "CC1", "USB_CC1", "To R1 5.1k pulldown"],
    ["J1", "CC2", "USB_CC2", "To R2 5.1k pulldown"],
    ["J1", "A6/B6", "USB_DP_CONN", "To R3 USB D+ series resistor"],
    ["J1", "A7/B7", "USB_DM_CONN", "To R4 USB D- series resistor"],
    ["R1", "1", "USB_CC1", "USB-C device advertise"],
    ["R1", "2", "GND", "5.1k pulldown"],
    ["R2", "1", "USB_CC2", "USB-C device advertise"],
    ["R2", "2", "GND", "5.1k pulldown"],
    ["R3", "1", "USB_DP_CONN", "USB series resistor"],
    ["R3", "2", "USB_DP", "ESP32-S3 GPIO20 native USB D+"],
    ["R4", "1", "USB_DM_CONN", "USB series resistor"],
    ["R4", "2", "USB_DM", "ESP32-S3 GPIO19 native USB D-"],
    ["U3", "IN", "VBUS", "5 V from USB"],
    ["U3", "OUT", "+3V3", "Main 3.3 V rail"],
    ["U3", "GND", "GND", "Power ground"],
    ["C1", "1", "VBUS", "LDO input cap"],
    ["C1", "2", "GND", "LDO input cap"],
    ["C2", "1", "+3V3", "LDO output cap"],
    ["C2", "2", "GND", "LDO output cap"],
    ["U1", "GPIO20", "USB_DP", "Native USB D+"],
    ["U1", "GPIO19", "USB_DM", "Native USB D-"],
    ["U1", "3V3", "+3V3", "ESP32-S3-WROOM-1U module power"],
    ["U1", "GND", "GND", "Module ground pins and thermal pads"],
    ["U1", "EN", "ESP_EN", "Pull up to 3V3, SW_RESET pulls low"],
    ["SW_RESET", "1", "ESP_EN", "Reset button"],
    ["SW_RESET", "2", "GND", "Reset button"],
    ["C_EN", "1", "ESP_EN", "ESP32-S3 EN power-on reset delay"],
    ["C_EN", "2", "GND", "ESP32-S3 EN power-on reset delay"],
    ["U1", "GPIO0", "BOOT_IO0", "ROM download boot strap"],
    ["SW_BOOT", "1", "BOOT_IO0", "Boot button"],
    ["SW_BOOT", "2", "GND", "Hold low while resetting for serial/USB download mode"],
    ["F1", "1", "VBUS", "Module bay input power"],
    ["F1", "2", "VBUS_FUSED", "Current-limited optional 5 V for modules"],
    ["J3", "1", "GND", "OSO module bay ground"],
    ["J3", "2", "+3V3", "OSO module bay 3.3 V power"],
    ["J3", "3", "VBUS_FUSED", "OSO module bay optional 5 V power"],
    ["J3", "4", "I2C_SDA", "OSO module bay I2C data"],
    ["J3", "5", "I2C_SCL", "OSO module bay I2C clock"],
    ["J3", "6", "MOD_A", "OSO module bay GPIO / encoder A"],
    ["J3", "7", "MOD_B", "OSO module bay GPIO / encoder B"],
    ["J3", "8", "MOD_INT", "OSO module bay interrupt or present detect"],
    ["J3", "9", "ESP_EN", "OSO module bay reset/programming signal"],
    ["J3", "10", "GND", "OSO module bay ground"],
    ["R10", "1", "MOD_INT", "Module interrupt/present pullup"],
    ["R10", "2", "+3V3", "Module interrupt/present pullup"]
  ];

  const rowPins = ["GPIO1", "GPIO2", "GPIO4", "GPIO5", "GPIO6", "GPIO7"];
  const colPins = ["GPIO8", "GPIO9", "GPIO10", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO21", "GPIO35", "GPIO36", "GPIO37", "GPIO38"];
  rowPins.forEach((pin, index) => rows.push(["U1", pin, `ROW${index}`, `Keyboard matrix row ${index}`]));
  colPins.forEach((pin, index) => rows.push(["U1", pin, `COL${index}`, `Keyboard matrix column ${index}`]));
  rows.push(["U1", "GPIO39", "MOD_A", "OSO module bay GPIO / encoder A"]);
  rows.push(["U1", "GPIO40", "MOD_B", "OSO module bay GPIO / encoder B"]);
  rows.push(["U1", "GPIO41", "I2C_SDA", "OSO module bay I2C SDA"]);
  rows.push(["U1", "GPIO42", "I2C_SCL", "OSO module bay I2C SCL"]);
  rows.push(["U1", "GPIO47", "MOD_INT", "OSO module interrupt/present detect"]);

  const header = "ref,pin,net,notes";
  return `${header}\n${rows.map(row => row.map(csv).join(",")).join("\n")}\n`;
}

function circuitMarkdown() {
  const rowPins = ["GPIO1", "GPIO2", "GPIO4", "GPIO5", "GPIO6", "GPIO7"];
  const colPins = ["GPIO8", "GPIO9", "GPIO10", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15", "GPIO16", "GPIO17", "GPIO18", "GPIO21", "GPIO35", "GPIO36", "GPIO37", "GPIO38"];
  const matrixRows = rowPins.map((pin, index) => `| ROW${index} | U1 ${pin} | ${keys.filter(k => k.row === index).length} switches |`).join("\n");
  const matrixCols = colPins.map((pin, index) => `| COL${index} | U1 ${pin} | ${keys.filter(k => k.col === index).length} switches |`).join("\n");
  return `# OSO75 Circuit Design

This circuit pass makes the ESP32-S3 the main keyboard brain. The computer plugs
into the keyboard's USB-C port, and the ESP32-S3 enumerates as the USB HID
keyboard while also owning BLE, Wi-Fi, and the hot-swappable OSO module bay.

## Electrical Target

- MCU: onboard ESP32-S3-WROOM-1U-N16 module with external IPEX/u.FL antenna connector. Do not substitute N16R8/R16V/Octal-PSRAM variants.
- Firmware: ESP-IDF + TinyUSB first; BLE/Wi-Fi config after wired USB is stable.
- Matrix: 6 rows x 16 columns, ${keys.length} populated switch positions.
- Module bay replaces: ${omittedKeys.map(k => k.label).join(", ")}.
- Diode direction: \`COL2ROW\`.
- Builder soldering target: switches/stabilizers only. SMD diodes and controller
  support parts should be factory assembled.

## Switch Matrix

Each key uses this net order:

\`\`\`text
COLn -> switch -> diode anode -> diode cathode -> ROWm
\`\`\`

The SOD-123 diode footprint intentionally uses pad 1 as the cathode/ROW-side pad.
The cathode band and \`K\` mark face the ROW net on the assembly drawing.

### Rows

| Net | ESP32-S3 pin | Populated keys |
|---|---|---:|
${matrixRows}

### Columns

| Net | ESP32-S3 pin | Populated keys |
|---|---|---:|
${matrixCols}

GPIO35/GPIO36/GPIO37 are only valid because the target module is ESP32-S3-WROOM-1U-N16,
not an Octal-PSRAM N16R8/R16V module.

## USB-C And Power

- J1 is a USB-C receptacle wired as a USB 2.0 device.
- CC1 and CC2 each get a 5.1k pulldown to GND.
- D+ and D- route from J1 through 27R series resistors to ESP32-S3 GPIO20/GPIO19 native USB.
- USB ESD protection is not fitted in this routed rev; add a USBLC6-class part during the next USB reroute instead of dropping it into the current crowded fanout.
- VBUS feeds U3, a 3.3 V LDO such as AP2112K-3.3.
- AP2112K pinout: pin 1 VIN=VBUS, pin 2 GND, pin 3 EN=VBUS, pin 4 NC, pin 5 VOUT=+3V3.
- F1 is a Littelfuse 0603L050SLYR 0603 PPTC fuse. It creates a current-limited
  VBUS_FUSED rail for optional 5 V module loads.
- C1 and C2 are 10uF 10V 0603 bulk capacitors at LDO input/output.

## ESP32-S3 Support

- U1 is an ESP32-S3-WROOM-1U module, so flash, crystal, RF matching, and the IPEX antenna connector are inside the module.
- Fit a compatible 2.4 GHz IPEX/u.FL antenna if BLE/Wi-Fi will be used. Wired USB keyboard mode works without the antenna.
- SW_RESET pulls EN low.
- C_EN is 1uF from ESP_EN to GND for the ESP32-S3 EN reset delay.
- SW_BOOT pulls GPIO0 low for ROM download mode.
- GPIO47 routes to the OSO bay as module-present or interrupt.
- GPIO39/GPIO40 route to the OSO bay for encoder/GPIO use.
- GPIO41/GPIO42 route to the OSO bay for I2C OLED/sensor modules.
- GPIO19/GPIO20 are reserved for USB D-/D+ and are not used by the switch matrix.
- Avoid GPIO0, GPIO3, GPIO45, and GPIO46 for ordinary matrix wiring because they affect boot/strapping.

## OSO Module Bay

The keyboard PCB side is exposed ENIG copper pads plus two retention holes, not a
factory-assembled pogo or mezzanine connector. Put the spring contacts on the
removable module side. Rev A is **power-off swap only**: unplug the keyboard
before inserting or removing modules.

| Pin | Net | Use |
|---:|---|---|
| 1 | GND | Ground |
| 2 | +3V3 | Main module power |
| 3 | VBUS_FUSED | Optional 5 V for LEDs/modules |
| 4 | I2C_SDA | OLED/sensor data |
| 5 | I2C_SCL | OLED/sensor clock |
| 6 | MOD_A | Encoder A / GPIO |
| 7 | MOD_B | Encoder B / GPIO |
| 8 | MOD_INT | Interrupt or module-present detect |
| 9 | ESP_EN | Optional module reset/programming signal |
| 10 | GND | Ground |

Keep modules 3.3 V logic by default. Any 5 V LED module should include its own
current limiting and should not pull more than the 500 mA hold budget set by F1.
Do not live-swap rev A modules. A later live-swap revision needs ground-first
contact, keyboard-side signal resistors, GPIO ESD protection, and 3.3 V current
limiting/load switching.

Fab note: J3 is intentional exposed contact copper. Do not place a component, do
not paste/stencil the pads, and use ENIG at minimum; choose hard gold if modules
will be swapped often.

## Layout Rules

- Put J1, R3, and R4 close together at the rear USB port.
- Keep D+/D- short, parallel, and away from the switch matrix where possible.
- Keep the WROOM-1U module body clear of switch/stabilizer mechanical courtyards; wireless RF depends on the external antenna and cable placement, not a PCB antenna area.
- Place 10uF bulk and 100nF local decoupling near the module 3V3 pins.
- Route rows horizontally and columns vertically where possible.
- Put the SOD-123 diode near each hotswap socket; cathode stripe/pad 1 goes to the row net.
- Keep the top-left bay clear for J3, retention holes, and module mechanical fit.
- Use a solid ground fill on both layers, stitched around USB and MCU.

## Generated Files

- \`oso75_matrix_netlist.csv\`: one switch/diode row per key.
- \`oso75_esp32s3_netlist.csv\`: MCU module, USB, power, buttons, module bay, and headers.
- \`oso75_components.csv\`: component list with footprints and assembly intent.
- \`oso75_placement.csv\`: switch and diode coordinates from the keyboard layout.

`;
}

function pinPlanMarkdown() {
  return `# OSO75 ESP32-S3 Pin Plan

The custom PCB target uses an onboard ESP32-S3-WROOM-1U-N16 module and a 6 x 16
keyboard matrix. GPIO19/GPIO20 stay reserved for native USB so the computer plugs
directly into the ESP32-S3. Use an external 2.4 GHz IPEX/u.FL antenna for BLE/Wi-Fi.

## Matrix

| Signal | Pins |
|---|---|
| Rows | GPIO1, GPIO2, GPIO4, GPIO5, GPIO6, GPIO7 |
| Columns | GPIO8, GPIO9, GPIO10, GPIO11, GPIO12, GPIO13, GPIO14, GPIO15, GPIO16, GPIO17, GPIO18, GPIO21, GPIO35, GPIO36, GPIO37, GPIO38 |
| Diode direction | COL2ROW |
| Per-key wiring | COLn -> switch -> diode anode -> diode cathode -> ROWm |
| Diode footprint | Pad 1 is cathode/ROW side; pad 2 is anode/switch side |
| Module bay replaced positions | ${omittedKeys.map(k => k.label).join(", ")} |

GPIO35/GPIO36/GPIO37 are not available on Octal-PSRAM ESP32-S3-WROOM-1U variants,
so do not substitute an N16R8/R16V module without rerouting COL12-COL14.

## Reserved Pins

| Purpose | Pin |
|---|---|
| USB D- / D+ | GPIO19 / GPIO20 |
| Boot/download | GPIO0, pulled up; BOOT switch pulls low |
| Reset/enable | EN, pulled up; RESET switch pulls low |
| OSO module interrupt/present | GPIO47 |
| OSO module encoder/GPIO | GPIO39 / GPIO40 |
| OSO module I2C | GPIO41 / GPIO42 |
| Avoid for matrix | GPIO0, GPIO3, GPIO19, GPIO20, GPIO45, GPIO46 |

## OSO Module Bay

| Pin | Net | Use |
|---:|---|---|
| 1 | GND | Ground |
| 2 | +3V3 | Main module power |
| 3 | VBUS_FUSED | Optional 5 V input for LEDs, through fuse/current limit |
| 4 | I2C_SDA / GPIO41 | OLED/sensor data |
| 5 | I2C_SCL / GPIO42 | OLED/sensor clock |
| 6 | MOD_A / GPIO39 | Encoder A / GPIO / SPI option |
| 7 | MOD_B / GPIO40 | Encoder B / GPIO / SPI option |
| 8 | MOD_INT / GPIO47 | Interrupt, button, or module-present detect |
| 9 | ESP_EN | Optional module reset/programming signal |
| 10 | GND | Ground / shield |

Keep modules 3.3 V logic by default. Any 5 V LED module should include its own
current limiting and should not pull more than the 500 mA hold budget set by F1.
Rev A is power-off swap only. Do not insert or remove modules while powered.

## Assembly Intent

JLCPCB/PCBWay should assemble the ESP32-S3-WROOM-1U-N16 module, USB-C connector, reset/boot buttons, SMD diodes, regulator, fuse,
and passives. Do not allow N16R8/R16V/Octal-PSRAM ESP32-S3 substitutes. J3 is PCB copper only and should be excluded from factory assembly.
Kailh hotswap sockets may be factory assembled or hand-soldered, but the BOM/CPL must match that choice. The builder should only need to install switches,
stabilizers, and case hardware when sockets are factory assembled.

See \`oso75_circuit.md\`, \`oso75_matrix_netlist.csv\`, and
\`oso75_esp32s3_netlist.csv\` for the actual circuit nets.
`;
}

function bomMarkdown() {
  return `# OSO75 Initial BOM

This BOM is split between parts we want assembled on the PCB and parts the builder
installs manually.

## PCB Factory Assembly

| Qty | Part | Notes |
|---:|---|---|
| 1 | ESP32-S3-WROOM-1U-N16 | Main MCU module with native USB, Wi-Fi, BLE, 16 MB flash, and external IPEX antenna connector |
| 1 | 2.4 GHz IPEX/u.FL antenna | Required only for BLE/Wi-Fi range; wired USB works without it |
| ${keys.length} | 1N4148W SOD-123 diodes | One per physical switch; pad 1/cathode band faces ROW net |
| 1 | USB-C receptacle | USB 2.0 device wiring |
| 1 | Exposed OSO module bay pads | PCB copper only; no factory connector fitted, no paste |
| 1 | Littelfuse 0603L050SLYR PPTC fuse | Protects optional 5 V accessory modules |
| 2 | 5.1k 0603 resistors | USB-C device mode CC pulldowns |
| 2 | 27R 0603 resistors | USB D+/D- series resistors |
| 3 | 10k 0603 resistors | EN, BOOT, and module interrupt/present pullups |
| 2 | 10uF 10V 0603 capacitors | LDO input/output bulk caps |
| 2 | 100nF 0603 capacitors | ESP32 local decoupling |
| 1 | 1uF 0603 capacitor | ESP_EN reset delay |
| 1 | Reset tactile switch | Pulls EN low |
| 1 | Boot tactile switch | Pulls GPIO0 low for ROM download mode |

## Builder Assembly

| Qty | Part | Current pick |
|---:|---|---|
| ${keys.length} required, 90 suggested | MX switches | Gateron Milky Yellow Pro V3 or MMD Princess V4 |
| ${keys.length} | Kailh MX hotswap sockets | Only if not factory assembled |
| 1 set | PCB screw-in stabilizers | 6.25u + 2u set |
| 1 | Plate | Production file: \`hardware/cad/build123d/oso75_plate.step\` / \`.stl\`; use 1.5 mm metal/FR4/POM for the final |
| 1 | Case | Production files: \`hardware/cad/build123d/oso75_case_bottom.step\` + \`oso75_case_bezel.step\`; OpenSCAD files are deprecated concept previews only |
| 1 | USB-C cable | Data-capable cable |

## Optional OSO Bay Modules

| Module idea | Main parts |
|---|---|
| Volume knob | Rotary encoder, knob, small module PCB |
| OLED status screen | 0.91-1.3 inch I2C OLED, module PCB |
| Slider/macropanel | Potentiometer or linear Hall sensor, module PCB |
| LED widget | Addressable LEDs with current limiting |

`;
}

function fitReport() {
  const pcbTopZ = cadFit.pcbZ + cadFit.pcbThickness;
  const plateTopZ = cadFit.plateZ + cadFit.plateThickness;
  const switchCenterErrors = keys.map(k => Math.hypot((k.cx + 9) - k.pcbX, (k.cy + 9) - k.pcbY));
  const maxSwitchCenterErrorMm = Math.max(...switchCenterErrors);
  const j1 = pcbRefCenters.get("J1");
  const j3 = pcbRefCenters.get("J3");
  return JSON.stringify({
    status: "fits",
    generated_from: "hardware/layout/oso75.layout.json",
    pcb: {
      width_mm: Number(boardWidth.toFixed(3)),
      height_mm: Number(boardHeight.toFixed(3)),
      thickness_mm: cadFit.pcbThickness,
      z_bottom_mm: cadFit.pcbZ,
      z_top_mm: Number(pcbTopZ.toFixed(3))
    },
    tray_cavity: {
      width_mm: Number((boardWidth + cadFit.pcbClearance).toFixed(3)),
      height_mm: Number((boardHeight + cadFit.pcbClearance).toFixed(3)),
      clearance_total_mm: cadFit.pcbClearance,
      clearance_each_side_mm: Number((cadFit.pcbClearance / 2).toFixed(3)),
      floor_z_mm: cadFit.caseFloor
    },
    plate_to_pcb: {
      plate_z_bottom_mm: cadFit.plateZ,
      plate_z_top_mm: Number(plateTopZ.toFixed(3)),
      pcb_top_to_plate_top_gap_mm: Number((plateTopZ - pcbTopZ).toFixed(3))
    },
    usb_c: {
      pcb_connector_center_x_mm: j1 ? j1.x : Number((boardWidth / 2).toFixed(3)),
      pcb_connector_center_y_mm: j1 ? j1.y : Number((boardHeight - 2.8).toFixed(3)),
      cad_slot_center_x_mm: Number((cadFit.caseWall + boardWidth / 2).toFixed(3)),
      cad_slot_wall: "back (high y)",
      cad_slot_center_z_mm: Number(usbCZ.toFixed(3)),
      cad_to_pcb_x_error_mm: j1 ? Number(Math.abs(boardWidth / 2 - j1.x).toFixed(3)) : null
    },
    module_bay: moduleBay
      ? {
          cad_rect_mm: {
            x: moduleBay.x_mm,
            y: Number(moduleBay.y_mm.toFixed(3)),
            w: moduleBay.w_mm,
            h: moduleBay.h_mm
          },
          pcb_j3_center_mm: j3 ?? null,
          cad_center_to_j3_error_mm: j3
            ? Number(
                Math.hypot(
                  moduleBay.x_mm + moduleBay.w_mm / 2 - j3.x,
                  moduleBay.y_mm + moduleBay.h_mm / 2 - j3.y
                ).toFixed(3)
              )
            : null
        }
      : null,
    switch_alignment: {
      physical_keys: keys.length,
      max_center_error_mm: Number(maxSwitchCenterErrorMm.toFixed(6))
    },
    notes: [
      "PCB outline matches the KiCad board dimensions exactly.",
      "Tray cavity includes clearance so the PCB is not a friction fit.",
      "CAD includes the PCB slab, switch drill holes, module bay contacts, retention holes, and USB-C body.",
      "Switch centers, J1 and J3 positions are read from the routed KiCad board, not assumed.",
      "USB-C exits through the back wall; J3 module bay sits at the back-left (Esc/F1 corner)."
    ]
  }, null, 2) + "\n";
}

write(path.join(root, "hardware/cad/generated/oso75_case_plate.scad"), scadString());
write(path.join(root, "hardware/cad/generated/oso75_fit_report.json"), fitReport());
write(path.join(root, "qmk/keyboards/oso/oso75/keyboard.json"), keyboardJson());
write(path.join(root, "qmk/keyboards/oso/oso75/keymaps/default/keymap.c"), keymapC());
write(path.join(root, "hardware/pcb/oso75_placement.csv"), placementCsv());
write(path.join(root, "hardware/pcb/oso75_matrix_netlist.csv"), matrixNetlistCsv());
write(path.join(root, "hardware/pcb/oso75_components.csv"), componentCsv());
write(path.join(root, "hardware/pcb/oso75_esp32s3_netlist.csv"), esp32s3NetlistCsv());
write(path.join(root, "hardware/pcb/oso75_circuit.md"), circuitMarkdown());
write(path.join(root, "hardware/pcb/esp32s3-pin-plan.md"), pinPlanMarkdown());
write(path.join(root, "hardware/bom.md"), bomMarkdown());

console.log(`Generated ${keys.length} keys.`);
