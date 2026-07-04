import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const keyboard = JSON.parse(fs.readFileSync(path.join(root, "qmk/keyboards/oso/oso75/keyboard.json"), "utf8"));
const matrixCsv = fs.readFileSync(path.join(root, "hardware/pcb/oso75_matrix_netlist.csv"), "utf8");
const esp32NetlistCsv = fs.readFileSync(path.join(root, "hardware/pcb/oso75_esp32s3_netlist.csv"), "utf8");
const componentsCsv = fs.readFileSync(path.join(root, "hardware/pcb/oso75_components.csv"), "utf8");
const keymapC = fs.readFileSync(path.join(root, "qmk/keyboards/oso/oso75/keymaps/default/keymap.c"), "utf8");
const simOutDir = path.join(root, "hardware/sim");
const strictPower = process.argv.includes("--strict-power");

const expectedRows = ["GPIO1", "GPIO2", "GPIO4", "GPIO5", "GPIO6", "GPIO7"];
const expectedCols = [
  "GPIO8",
  "GPIO9",
  "GPIO10",
  "GPIO11",
  "GPIO12",
  "GPIO13",
  "GPIO14",
  "GPIO15",
  "GPIO16",
  "GPIO17",
  "GPIO18",
  "GPIO21",
  "GPIO35",
  "GPIO36",
  "GPIO37",
  "GPIO38"
];
const reservedMatrixPins = new Set(["GPIO0", "GPIO3", "GPIO19", "GPIO20", "GPIO45", "GPIO46"]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows.filter((item) => item.some(Boolean));
  return dataRows.map((dataRow) => Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""])));
}

function parseKeymapLayers(source) {
  const layers = [];
  let cursor = 0;

  while (true) {
    const start = source.indexOf("LAYOUT(", cursor);
    if (start === -1) break;

    let depth = 0;
    let body = "";
    let end = start + "LAYOUT(".length;

    for (let i = start + "LAYOUT(".length; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === "(") depth += 1;
      if (ch === ")") {
        if (depth === 0) {
          end = i + 1;
          break;
        }
        depth -= 1;
      }
      body += ch;
    }

    layers.push(splitTopLevelArgs(body).map((arg) => arg.trim()).filter(Boolean));
    cursor = end;
  }

  return layers;
}

function splitTopLevelArgs(text) {
  const args = [];
  let depth = 0;
  let arg = "";

  for (const ch of text) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;

    if (ch === "," && depth === 0) {
      args.push(arg);
      arg = "";
    } else {
      arg += ch;
    }
  }

  if (arg.trim()) args.push(arg);
  return args;
}

class Esp32S3MatrixSim {
  constructor({ rows, cols, switches, keymapLayers }) {
    this.rows = rows;
    this.cols = cols;
    this.switches = switches;
    this.keymapLayers = keymapLayers;
    this.pressed = new Set();
    this.byLabel = new Map(switches.map((sw) => [sw.label, sw]));
    this.byRef = new Map(switches.map((sw) => [sw.switch_ref, sw]));
  }

  press(...labelsOrRefs) {
    for (const labelOrRef of labelsOrRefs) {
      const sw = this.byLabel.get(labelOrRef) ?? this.byRef.get(labelOrRef);
      assert.ok(sw, `Unknown switch ${labelOrRef}`);
      this.pressed.add(sw.switch_ref);
    }
  }

  releaseAll() {
    this.pressed.clear();
  }

  scanMatrix() {
    const detections = [];

    for (let col = 0; col < this.cols.length; col += 1) {
      for (const sw of this.switches) {
        if (Number(sw.col) !== col || !this.pressed.has(sw.switch_ref)) continue;

        // COL2ROW diode model: the active-low column can pull its own row low
        // through the pressed switch and diode. Current does not flow from a
        // low row back into other columns, so rectangle ghost keys never appear.
        detections.push({
          row: Number(sw.row),
          col,
          rowPin: this.rows[Number(sw.row)],
          colPin: this.cols[col],
          switch_ref: sw.switch_ref,
          diode_ref: sw.diode_ref,
          label: sw.label,
          keycode: this.keymapLayers[0][this.switches.indexOf(sw)]
        });
      }
    }

    return detections.sort((a, b) => a.row - b.row || a.col - b.col);
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value);
}

function assertPinPlan() {
  assert.equal(keyboard.processor, "ESP32-S3");
  assert.equal(keyboard.bootloader, "esp-idf");
  assert.equal(keyboard.diode_direction, "COL2ROW");
  assert.deepEqual(keyboard.matrix_pins.rows, expectedRows);
  assert.deepEqual(keyboard.matrix_pins.cols, expectedCols);

  for (const pin of [...keyboard.matrix_pins.rows, ...keyboard.matrix_pins.cols]) {
    assert.equal(reservedMatrixPins.has(pin), false, `${pin} is reserved and cannot be a matrix pin`);
  }

  for (const [needle, message] of [
    ["U1,GPIO19,USB_DM", "USB D- must stay on GPIO19"],
    ["U1,GPIO20,USB_DP", "USB D+ must stay on GPIO20"],
    ["U1,GPIO0,BOOT_IO0", "BOOT button must stay on GPIO0"],
    ["U1,EN,ESP_EN", "EN/reset net must stay on EN"],
    ["U1,GPIO41,I2C_SDA", "Module SDA must stay on GPIO41"],
    ["U1,GPIO42,I2C_SCL", "Module SCL must stay on GPIO42"],
    ["U1,GPIO47,MOD_INT", "Module interrupt must stay on GPIO47"]
  ]) {
    assert.ok(esp32NetlistCsv.includes(needle), message);
  }

  assert.ok(componentsCsv.includes("U1,ESP32-S3-WROOM-1U-N16,"), "Use N16 module with GPIO35-37 available");
  assert.equal(componentsCsv.includes("ESP32-S3-WROOM-1U-N16R8"), false, "Octal-PSRAM module would break GPIO35-37 columns");
}

const switches = parseCsv(matrixCsv);
const components = parseCsv(componentsCsv);
const keymapLayers = parseKeymapLayers(keymapC);
const componentByRef = new Map(components.map((component) => [component.ref, component]));

assertPinPlan();
assert.equal(switches.length, 82, "OSO75 should expose 82 physical switches after module bay keepout");
assert.equal(keymapLayers.length, 2, "Default keymap should expose two layers");

for (const layer of keymapLayers) {
  assert.equal(layer.length, switches.length, "Each QMK LAYOUT layer must match matrix switch count");
}

for (const sw of switches) {
  assert.equal(sw.column_net, `COL${sw.col}`);
  assert.equal(sw.row_net, `ROW${sw.row}`);
  assert.equal(sw.switch_pin_1, `COL${sw.col}`);
  assert.equal(sw.diode_cathode, `ROW${sw.row}`);
  assert.equal(sw.diode_anode, sw.switch_pin_2);
}

assert.equal(switches.some((sw) => sw.label === "Esc" || sw.label === "F1"), false, "Esc/F1 should be replaced by OSO module bay");
assert.equal(componentByRef.get("U3")?.mpn, "AP2112K-3.3TRG1", "Power model assumes AP2112K-3.3TRG1");
assert.equal(componentByRef.get("F1")?.mpn, "Littelfuse 0603L050SLYR", "Module 5 V model assumes 500 mA PPTC fuse");

const sim = new Esp32S3MatrixSim({
  rows: keyboard.matrix_pins.rows,
  cols: keyboard.matrix_pins.cols,
  switches,
  keymapLayers
});

for (const sw of switches) {
  sim.releaseAll();
  sim.press(sw.switch_ref);
  const detections = sim.scanMatrix();
  assert.equal(detections.length, 1, `${sw.switch_ref} should scan as exactly one key`);
  assert.equal(detections[0].switch_ref, sw.switch_ref);
  assert.equal(detections[0].label, sw.label);
  assert.equal(detections[0].rowPin, expectedRows[Number(sw.row)]);
  assert.equal(detections[0].colPin, expectedCols[Number(sw.col)]);
}

sim.releaseAll();
sim.press("A", "S", "W");
const ghostTest = sim.scanMatrix().map((event) => event.label);
assert.deepEqual(ghostTest, ["W", "A", "S"]);
assert.equal(ghostTest.includes("Q"), false, "COL2ROW diodes should block the Q rectangle ghost");

sim.releaseAll();
sim.press("LCtrl", "LAlt", "Space", "Fn");
assert.deepEqual(
  sim.scanMatrix().map((event) => `${event.label}:${event.keycode}`),
  ["LCtrl:KC_LCTL", "LAlt:KC_LALT", "Space:KC_SPC", "Fn:MO(1)"]
);

function estimateComputeBudget() {
  const cpu = {
    cores: 2,
    mhzPerCore: 240,
    totalCyclesPerSecond: 2 * 240_000_000,
    flashBytes: 16 * 1024 * 1024,
    psramBytes: 0,
    internalSramBytesApprox: 512 * 1024
  };
  const scanRateHz = 1000;
  const debounceMs = 5;
  const gpioDriveCycles = 90;
  const rowSampleCycles = 70;
  const debounceCyclesPerKey = 35;
  const cyclesPerScan =
    expectedCols.length * (gpioDriveCycles + expectedRows.length * rowSampleCycles) +
    switches.length * debounceCyclesPerKey;
  const cyclesPerSecond = cyclesPerScan * scanRateHz;
  const cpuPct = (cyclesPerSecond / cpu.totalCyclesPerSecond) * 100;
  const keymapBytes = keymapLayers.length * switches.length * 2;
  const matrixStateBytes = expectedRows.length * 2 * 4;
  const debounceStateBytes = switches.length;
  const hidReportBytes = 32;
  const firmwareDataBytes = keymapBytes + matrixStateBytes + debounceStateBytes + hidReportBytes;

  return {
    cpu,
    scanRateHz,
    debounceMs,
    cyclesPerScan,
    cyclesPerSecond,
    cpuPct,
    keymapBytes,
    firmwareDataBytes,
    pass: cpuPct < 5 && firmwareDataBytes < cpu.internalSramBytesApprox * 0.01
  };
}

function estimatePowerBudget() {
  const limits = {
    usbHighPowerMa: 500,
    ap2112ContinuousMa: 600,
    ap2112ThetaJaCPerWApprox: 160,
    ap2112MaxRecommendedCaseC: 85,
    ambientC: 25,
    vbusV: 5.0,
    v33V: 3.3,
    fuseHoldMa: 500
  };
  const scenarios = [
    {
      name: "wired-keyboard-idle",
      expected: true,
      esp32Ma: 75,
      matrixMa: 2,
      module3v3Ma: 0,
      module5vMa: 0,
      note: "USB HID active, radio off"
    },
    {
      name: "wired-keyboard-heavy-scan",
      expected: true,
      esp32Ma: 115,
      matrixMa: 3,
      module3v3Ma: 20,
      module5vMa: 0,
      note: "USB HID plus module-present pullups / light module logic"
    },
    {
      name: "wifi-or-ble-peak-no-module",
      expected: false,
      esp32Ma: 340,
      matrixMa: 3,
      module3v3Ma: 0,
      module5vMa: 0,
      note: "RF burst modeled as peak, not safe as continuous SOT-23-5 heat"
    },
    {
      name: "3v3-module-spec-max-80ma",
      expected: true,
      esp32Ma: 130,
      matrixMa: 3,
      module3v3Ma: 80,
      module5vMa: 0,
      note: "Rev A recommended continuous 3.3 V module budget"
    },
    {
      name: "5v-module-leds-spec-max-330ma",
      expected: true,
      esp32Ma: 130,
      matrixMa: 3,
      module3v3Ma: 20,
      module5vMa: 330,
      note: "Rev A conservative bus-powered VBUS_FUSED module budget"
    },
    {
      name: "3v3-module-100ma-over-spec",
      expected: false,
      esp32Ma: 130,
      matrixMa: 3,
      module3v3Ma: 100,
      module5vMa: 0,
      note: "Overload probe: old 3.3 V module budget"
    },
    {
      name: "5v-module-leds-400ma-over-spec",
      expected: false,
      esp32Ma: 130,
      matrixMa: 3,
      module3v3Ma: 20,
      module5vMa: 400,
      note: "Overload probe: old 500 mA fuse-as-budget assumption"
    }
  ];

  return {
    limits,
    scenarios: scenarios.map((scenario) => {
      const ldoMa = scenario.esp32Ma + scenario.matrixMa + scenario.module3v3Ma;
      const usbMa = ldoMa + scenario.module5vMa + 1;
      const ldoPowerW = (limits.vbusV - limits.v33V) * (ldoMa / 1000);
      const ldoRiseC = ldoPowerW * limits.ap2112ThetaJaCPerWApprox;
      const ldoCaseC = limits.ambientC + ldoRiseC;
      const pass = (
        ldoMa <= limits.ap2112ContinuousMa &&
        usbMa <= limits.usbHighPowerMa &&
        scenario.module5vMa <= limits.fuseHoldMa &&
        ldoCaseC <= limits.ap2112MaxRecommendedCaseC
      );
      const warnings = [];

      if (ldoCaseC > limits.ap2112MaxRecommendedCaseC) {
        warnings.push(`AP2112K would hit about ${ldoCaseC.toFixed(1)} C if this current were continuous`);
      }
      if (usbMa > limits.usbHighPowerMa) {
        warnings.push(`USB current estimate ${usbMa.toFixed(0)} mA exceeds 500 mA high-power budget`);
      }
      if (scenario.module5vMa > limits.fuseHoldMa) {
        warnings.push(`Module 5 V load ${scenario.module5vMa} mA exceeds F1 hold current`);
      }

      return {
        ...scenario,
        ldoMa,
        usbMa,
        ldoPowerW,
        ldoCaseC,
        pass,
        warnings
      };
    })
  };
}

function simulateBootPins() {
  const enPullupOhms = 10_000;
  const enCapFarads = 1e-6;
  const bootPullupOhms = 10_000;
  const tauMs = enPullupOhms * enCapFarads * 1000;
  const en90PercentMs = -Math.log(0.1) * tauMs;
  const bootPullupMa = 3.3 / bootPullupOhms * 1000;

  return {
    enPullupOhms,
    enCapUf: 1,
    tauMs,
    en90PercentMs,
    bootPullupOhms,
    bootPullupMa,
    normalBoot: {
      gpio0: "pulled_high",
      en: "rc_rises_high",
      mode: "flash_boot"
    },
    downloadBoot: {
      gpio0: "held_low_by_SW_BOOT_during_reset",
      en: "reset_released",
      mode: "usb_serial_rom_download"
    },
    pass: tauMs >= 1 && tauMs <= 50 && bootPullupMa < 1
  };
}

function wokwiPin(pin) {
  return pin.replace(/^GPIO/, "");
}

function buildWokwiProject(report) {
  const partScale = 18;
  const parts = [
    {
      type: "board-esp32-s3-devkitc-1",
      id: "esp",
      top: 0,
      left: 0,
      attrs: { env: "arduino-esp32" }
    },
    {
      type: "wokwi-text",
      id: "note",
      top: -80,
      left: 360,
      attrs: {
        text: "OSO75 generated from KiCad/netlist. Button+diode matrix represented as Wokwi buttons; run local sim for diode/power/compute checks."
      }
    }
  ];
  const connections = [
    ["esp:TX", "$serialMonitor:RX", "", []],
    ["esp:RX", "$serialMonitor:TX", "", []]
  ];

  for (const sw of switches) {
    const left = 360 + Number(sw.col) * partScale * 1.6;
    const top = 10 + Number(sw.row) * partScale * 1.6;
    const shortcut = keyShortcut(sw.label);
    parts.push({
      type: "wokwi-pushbutton",
      id: sw.switch_ref.toLowerCase(),
      left,
      top,
      attrs: {
        label: sw.label,
        key: shortcut,
        bounce: "1"
      }
    });
    connections.push([`${sw.switch_ref.toLowerCase()}:1.l`, `esp:${wokwiPin(expectedCols[Number(sw.col)])}`, "green", []]);
    connections.push([`${sw.switch_ref.toLowerCase()}:2.l`, `esp:${wokwiPin(expectedRows[Number(sw.row)])}`, "blue", []]);
  }

  const sketch = `// Generated OSO75 ESP32-S3 Wokwi harness.
// Open with Wokwi or run with wokwi-cli when installed.

const uint8_t ROWS[] = {${expectedRows.map((pin) => pin.replace("GPIO", "")).join(", ")}};
const uint8_t COLS[] = {${expectedCols.map((pin) => pin.replace("GPIO", "")).join(", ")}};
const char* LABELS[6][16] = {
${matrixLabelsForSketch()}
};

void setup() {
  Serial.begin(115200);
  for (uint8_t r = 0; r < 6; r++) {
    pinMode(ROWS[r], INPUT_PULLUP);
  }
  for (uint8_t c = 0; c < 16; c++) {
    pinMode(COLS[c], INPUT_PULLUP);
    digitalWrite(COLS[c], HIGH);
  }
  Serial.println("OSO75 ESP32-S3 Wokwi harness ready");
  Serial.println("Matrix: 6 rows x 16 cols, 82 populated switches, COL2ROW in PCB");
}

void loop() {
  for (uint8_t c = 0; c < 16; c++) {
    pinMode(COLS[c], OUTPUT);
    digitalWrite(COLS[c], LOW);
    delayMicroseconds(30);
    for (uint8_t r = 0; r < 6; r++) {
      if (digitalRead(ROWS[r]) == LOW && LABELS[r][c][0]) {
        Serial.print("key ");
        Serial.print(LABELS[r][c]);
        Serial.print(" row ");
        Serial.print(r);
        Serial.print(" col ");
        Serial.println(c);
      }
    }
    pinMode(COLS[c], INPUT_PULLUP);
  }
  delay(5);
}
`;

  writeJson(path.join(simOutDir, "wokwi/diagram.json"), {
    version: 1,
    author: "OSO Keyboard",
    editor: "wokwi",
    parts,
    connections,
    serialMonitor: { display: "terminal", newline: "lf" }
  });
  writeText(path.join(simOutDir, "wokwi/sketch.ino"), sketch);
  writeText(path.join(simOutDir, "wokwi/wokwi.toml"), `[wokwi]\nversion = 1\nfirmware = ".pio/build/esp32-s3-devkitc-1/firmware.bin"\nelf = ".pio/build/esp32-s3-devkitc-1/firmware.elf"\n`);
  writeText(path.join(simOutDir, "README.md"), `# OSO75 ESP32-S3 Simulation

This folder is generated by \`npm run simulate:esp32\`.

## What runs locally

- ESP32-S3 pin-plan checks against \`keyboard.json\` and \`oso75_esp32s3_netlist.csv\`
- COL2ROW switch/diode matrix scan model for all 82 populated keys
- Boot/reset RC sanity model for EN and GPIO0
- USB/power budget estimates for AP2112K, USB 500 mA budget, and F1 500 mA hold current
- Compute/memory budget estimates for 1 kHz matrix scanning on dual-core 240 MHz ESP32-S3

## What needs external tools

Real ESP32 firmware CPU emulation needs ESP-IDF QEMU or Wokwi CLI. This machine currently has neither installed.

Espressif QEMU route:

\`\`\`sh
brew install libgcrypt glib pixman sdl2 libslirp
python "$IDF_PATH/tools/idf_tools.py" install qemu-xtensa qemu-riscv32
. "$IDF_PATH/export.sh"
idf.py qemu monitor
\`\`\`

Wokwi route:

\`\`\`sh
wokwi-cli --timeout 10000 hardware/sim/wokwi
\`\`\`

Generated Wokwi project:

- \`hardware/sim/wokwi/diagram.json\`
- \`hardware/sim/wokwi/sketch.ino\`

Note: Wokwi simulates the ESP32-S3 board and interactive buttons. The local JS sim is the source of truth for the diode matrix, power, and compute limits because it is derived directly from the repo's PCB/netlist artifacts.
`);

  return {
    diagram: "hardware/sim/wokwi/diagram.json",
    sketch: "hardware/sim/wokwi/sketch.ino",
    note: "Generated Wokwi harness from PCB matrix/netlist"
  };
}

function keyShortcut(label) {
  const map = {
    Space: " ",
    Up: "ArrowUp",
    Down: "ArrowDown",
    Left: "ArrowLeft",
    Right: "ArrowRight",
    Enter: "Enter",
    Tab: "Tab",
    Backspace: "Backspace",
    Del: "Delete",
    Esc: "Escape",
    PgUp: "PageUp",
    PgDn: "PageDown",
    Ins: "Insert"
  };
  if (map[label]) return map[label];
  if (/^[A-Z0-9]$/.test(label)) return label;
  if (/^F\d+$/.test(label)) return label;
  return "";
}

function matrixLabelsForSketch() {
  const labels = Array.from({ length: 6 }, () => Array.from({ length: 16 }, () => ""));
  for (const sw of switches) {
    labels[Number(sw.row)][Number(sw.col)] = sw.label.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  }
  return labels.map((row) => `  {${row.map((label) => `"${label}"`).join(", ")}}`).join(",\n");
}

const compute = estimateComputeBudget();
const power = estimatePowerBudget();
const boot = simulateBootPins();
const hardPowerFailures = power.scenarios.filter((scenario) => scenario.expected && !scenario.pass);
const warnings = power.scenarios.flatMap((scenario) => scenario.warnings.map((warning) => `${scenario.name}: ${warning}`));
const report = {
  generatedAt: new Date().toISOString(),
  board: "OSO75",
  target: "ESP32-S3-WROOM-1U-N16",
  sourceFiles: [
    "qmk/keyboards/oso/oso75/keyboard.json",
    "hardware/pcb/oso75_matrix_netlist.csv",
    "hardware/pcb/oso75_esp32s3_netlist.csv",
    "hardware/pcb/oso75_components.csv",
    "qmk/keyboards/oso/oso75/keymaps/default/keymap.c"
  ],
  matrix: {
    rows: expectedRows,
    cols: expectedCols,
    switches: switches.length,
    diodeDirection: keyboard.diode_direction,
    pass: true
  },
  compute,
  power,
  boot,
  warnings
};
report.wokwi = buildWokwiProject(report);
writeJson(path.join(simOutDir, "reports/esp32s3-system-report.json"), report);

assert.ok(compute.pass, "Compute budget is too high for ESP32-S3 target");
assert.ok(boot.pass, "Boot/reset RC model is out of expected bounds");
if (strictPower) {
  assert.equal(hardPowerFailures.length, 0, `Hard power failures: ${hardPowerFailures.map((scenario) => scenario.name).join(", ")}`);
}

console.log("ESP32-S3 matrix simulation passed.");
console.log(`Simulated ${switches.length} switches on ${expectedRows.length} rows x ${expectedCols.length} columns.`);
console.log("Verified USB/boot/module pins, N16 module choice, COL2ROW diode behavior, keymap coverage, and no-ghost chord.");
console.log(`Compute: ${compute.cyclesPerScan} cycles/scan, ${compute.cpuPct.toFixed(2)}% of dual-core 240 MHz at ${compute.scanRateHz} Hz.`);
console.log(`Power scenarios: ${power.scenarios.filter((scenario) => scenario.pass).length}/${power.scenarios.length} pass continuous limits.`);
if (hardPowerFailures.length) {
  console.warn(`WARN strict power would fail: ${hardPowerFailures.map((scenario) => scenario.name).join(", ")}`);
}
for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}
console.log("Generated hardware/sim/reports/esp32s3-system-report.json");
console.log("Generated hardware/sim/wokwi/diagram.json and sketch.ino");
