# OSO Keyboard Project Summary

Last updated: 2026-06-09

## Goal

OSO Keyboard is an open-source 75% mechanical keyboard project for Stardance. The current direction is a custom keyboard with an onboard ESP32-S3, USB-C, a real 75% ANSI-style layout, and a hot-swappable programmable module bay in the top-left corner for user-made add-ons like a volume knob, OLED screen, slider, macro pad, or LED widget.

## Current Public Links

- GitHub repository: https://github.com/vamshikrishnaramasamy/oso-keyboard
- Web demo / CAD viewer: https://vamshikrishnaramasamy.github.io/oso-keyboard/

## What We Built So Far

### Repo Structure

The project is now source-driven. The main layout source is:

- `hardware/layout/oso75.layout.json`

Generated outputs are produced with:

```sh
npm run generate
npm run validate
```

The generator currently creates or updates:

- CAD files in `hardware/cad/generated/`
- PCB placement/netlist data in `hardware/pcb/`
- KiCad project files in `hardware/kicad/oso75/`
- QMK-style firmware metadata in `qmk/keyboards/oso/oso75/`
- Web viewer assets in `web/public/models/`

### Web CAD Viewer

We built a Three.js-based browser viewer for the keyboard CAD. It can show the generated case/plate model in the browser and was improved several times because the first OpenSCAD-style render made it hard to see the switch holes.

Improvements made:

- Better lighting and material shading
- More visible switch cutout depth
- More useful camera/orbit controls
- CAD asset sync into the web viewer
- Generated STL support for the browser model

The viewer runs locally with:

```sh
npm run viewer
```

### Keyboard CAD

We created a parametric OpenSCAD model for the 75% keyboard case and plate.

Current CAD files include:

- `hardware/cad/generated/oso75_case_plate.scad`
- `hardware/cad/generated/oso75_case_plate.stl`
- `hardware/cad/generated/oso75_fit_report.json`
- `hardware/cad/generated/oso75_pcb_fit.png`

Major CAD revisions:

- Reworked the layout so it actually resembles a 75% keyboard.
- Mirrored the board after the left/right orientation was wrong.
- Moved the arrow/navigation cluster to the correct side.
- Added a top-left OSO hot-swappable module bay.
- Revised the module bay so it is flush with the case instead of awkwardly sticking out.
- Moved the USB-C opening multiple times, ending with a centered side placement that avoids the module bay better.
- Added a PCB fit visualization to check that the board and case line up.

### OSO Module Bay

The module bay is the main "cool part" of the keyboard. The idea is that the keyboard has a standard top-left dock where people can make their own programmable gadgets.

Planned module examples:

- Rotary volume knob
- OLED status display
- Slider module
- Macro module
- LED/status widget

Current electrical bay concept:

- 10-contact dock
- 3.3V
- Fused VBUS
- GND
- I2C SDA/SCL
- Two GPIO/encoder pins
- Interrupt/present pin
- ESP reset/enable access

The bay replaces the Esc/F1 corner area in the current layout.

## PCB and Electronics

### Main Controller Decision

We switched the design from a generic keyboard controller approach to a custom PCB centered around:

- ESP32-S3-WROOM-1U-N16

Reasoning:

- Native USB support, so the computer can plug directly into the ESP32-S3 over USB-C.
- Wi-Fi and BLE available for future customization.
- More flexible than a basic wired-only microcontroller.
- Good fit for a programmable open-source keyboard with add-on modules.

Important design note: the keyboard should enumerate as a USB HID keyboard through the ESP32-S3 native USB pins, not through a separate USB-to-serial chip.

### Pin Plan

The current matrix target is:

- 6 rows
- 16 columns
- 82 key positions
- COL2ROW diode direction

Current planned ESP32-S3 pins:

- Rows: GPIO1, GPIO2, GPIO4, GPIO5, GPIO6, GPIO7
- Columns: GPIO8, GPIO9, GPIO10, GPIO11, GPIO12, GPIO13, GPIO14, GPIO15, GPIO16, GPIO17, GPIO18, GPIO21, GPIO35, GPIO36, GPIO37, GPIO38
- Native USB: GPIO19 / GPIO20
- Module I2C: GPIO41 / GPIO42
- Module GPIO/encoder: GPIO39 / GPIO40
- Module interrupt/present: GPIO47

Details live in:

- `hardware/pcb/esp32s3-pin-plan.md`

### PCB Files

Current PCB-related files include:

- `hardware/pcb/README.md`
- `hardware/pcb/esp32s3-pin-plan.md`
- `hardware/pcb/oso75_circuit.md`
- `hardware/pcb/oso75_components.csv`
- `hardware/pcb/oso75_matrix_netlist.csv`
- `hardware/pcb/oso75_esp32s3_netlist.csv`
- `hardware/pcb/oso75_placement.csv`
- `hardware/kicad/oso75/oso75.kicad_pro`
- `hardware/kicad/oso75/oso75.kicad_sch`
- `hardware/kicad/oso75/oso75.kicad_pcb`

### KiCad Status

KiCad is installed locally and the project has a generated KiCad starting point. The KiCad CLI was found at:

```sh
/Applications/KiCad/KiCad.app/Contents/MacOS/kicad-cli
```

KiCad version checked:

```text
10.0.3
```

We generated a board with:

- ESP32-S3-WROOM-1 footprint
- USB-C connector area
- Matrix switch/diode positions
- Module bay footprint area
- Initial board outline matching the CAD intent
- Render/export support

**Update 2026-06-09: the PCB was routed, but later review found blocker bugs.**

- All 82 generator placeholder switch footprints were replaced with the proven Kailh MX hotswap footprint from the annovax75 reference (real 3.05 mm plated contact holes + socket pads); the USB-C connector was replaced with the official KiCad library `USB_C_Receptacle_HRO_TYPE-C-31-M-12`.
- PrtSc was moved to the right nav column (layout bug: it overlapped F12 by 0.25u). Fixed in `oso75.layout.json` and on the board.
- Cherry PCB-mount stabilizer holes added (Backspace, Enter, LShift, Space).
- ESP32-S3 external antenna rule area added on both copper layers.
- Full board routed (freerouting + local A* scripts), GND pours both layers with stitching vias.
- Previous DRC/fab exports are stale after the Oracle review.
- Important: normal `npm run generate` no longer runs `scripts/generate-kicad.mjs`;
  the KiCad starter generator is explicit as `npm run generate:kicad:starter`.

**Update 2026-06-10: rear electronics band shrunk 173 -> 150 mm.**

- The back band behind the F-row was 45 mm deep; cut to 22 mm (`rearElectronicsHeight` 36 -> 13 in `scripts/generate.mjs`/`validate.mjs`).
- ESP32-S3 rotated horizontal with the antenna facing east into a fresh both-layer keepout; USB-C, LDO, fuse, buttons, and passives repacked into the band.
- Whole board was re-routed (freerouting + A* finishing), but the Oracle audit
  later found ESP32 module and regulator pinout blockers.
- Case/plate CAD regenerated to the same 150.063 mm height.

**Update 2026-06-10: Oracle PCB bugs fixed.**

- U1 retargeted from ESP32-S3-WROOM-1U-N16R8 to ESP32-S3-WROOM-1U-N16 so
  GPIO35/GPIO36/GPIO37 can legally remain COL12-COL14.
- U3 AP2112K pad nets and local copper fixed: VIN/EN on VBUS, NC floating,
  VOUT on +3V3.
- `npm run generate` no longer runs `scripts/generate-kicad.mjs`; KiCad starter
  regeneration is explicit via `npm run generate:kicad:starter`.
- KiCad 10.0.3 DRC after refill: 0 errors, 0 unconnected items, 276 warnings.

## Hardware Parts Direction

We moved toward factory assembly for the annoying tiny parts, especially the diodes, so the builder does not have to hand-solder 82 SMD diodes.

Planned factory-assembled PCB parts:

- ESP32-S3-WROOM-1U-N16
- USB-C receptacle
- SMD matrix diodes
- Reset and boot buttons
- Voltage regulator / power support
- USB-C CC resistors
- Module bay dock
- Protection/current-limiting parts
- Required passives

Builder-installed parts:

- MX switches
- Keycaps
- Stabilizers
- Case/plate hardware
- Optional module bay accessories
- USB-C cable

Parts notes live in:

- `hardware/bom.md`
- `hardware/pcb/oso75_components.csv`

## PCB Manufacturing / Quote Work

We looked at PCB fabrication options and started filling PCBWay quote settings.

Final board dimensions for quoting (from Edge.Cuts):

- 337.088 mm x 150.063 mm

Settings to use when re-quoting (the earlier ~$170 quote was for 4 layers at 320x135 - re-quote!):

- **2 layers** (the routed board is 2-layer)
- FR-4
- 1.6 mm thickness
- 1 oz copper
- Lead-free HASL surface finish
- Green solder mask
- White silkscreen
- No stencil
- Min track/clearance 0.2 mm, min via 0.6/0.3 mm, copper-to-edge 0.35 mm

PCBWay showed a high prototype price for 5 boards, roughly around:

- PCB cost: about $140
- Shipping: about $30
- Total: about $170

Important: no final Gerbers should be ordered yet. The current KiCad board still needs routing and DRC cleanup.

Also important: during quote testing, an unpaid PCBWay draft/cart item was created without uploaded Gerbers. It should not be treated as a real production order.

## Existing 75% Board Reference

We pulled in an existing 75% keyboard PCB/CAD reference to compare against our dimensions, layout, and fit:

- `references/existing-75-cad/annovax75/PCB/keyboard.kicad_pcb`

We used it as a sanity check for:

- Overall 75% proportions
- Layout orientation
- USB placement concerns
- Case/PCB fit expectations

## Firmware Direction

The repo currently has a QMK-style skeleton, but the ESP32-S3 direction means the real firmware path should likely move toward:

- ESP-IDF
- TinyUSB HID keyboard support
- Matrix scanner
- Module bay driver layer
- Optional BLE support later
- Optional Wi-Fi configuration layer later

Current firmware skeleton:

- `qmk/keyboards/oso/oso75/`

This is useful as metadata/reference, but the final ESP32-S3 firmware still needs to be implemented and compiled.

## Stardance / Hackatime Work

We also worked through Stardance setup questions around:

- How Hackatime tracks activity
- How Stardance uses logged project time
- Why the account still showed 0 stardust before linked/eligible project time was visible
- How to send Hackatime heartbeats from the CLI
- How to install/setup the Hackatime extension in Antigravity/VS Code

Key rule learned: Hackatime counts editor/activity heartbeats from actual working tools. It should not be spoofed or artificially inflated, but legitimate coding/research/documentation work in the project can be tracked if Hackatime is configured and heartbeats are being sent correctly.

## Slack Bot / Nest Side Quest

There was also a separate Stardance mission side quest for a Slack bot.

What happened:

- Created/edited a Stardance project for a Slack bot.
- Tried to get a Slack slash command working.
- Hit `invalid_service` errors.
- Realized the mission expected deployment on Hack Club Nest.
- Applied for Nest.
- Nest account was approved.

Nest login info from the approval email:

```sh
ssh vamshikrishnaramasamy@hackclub.app
```

That work is mostly separate from OSO Keyboard, but it happened during the same Stardance setup period.

## Current Status

Working / useful now:

- Repo structure
- Source layout
- Generators
- Validation script
- CAD model
- Web CAD viewer
- KiCad project starting point
- ESP32-S3 pin plan
- BOM direction
- PCB quote research
- Existing board reference comparison

Done since (2026-06-09):

- Final KiCad routing (freerouting + scripted A* finishing)
- Fresh DRC after Oracle fixes
- Real switch/USB-C footprints, stabilizer holes, external antenna
- Gerber/drill/position export (`hardware/kicad/oso75/fab/`)

Not done yet:

- PCB order
- ESP32-S3 firmware compile
- Real hardware test
- Module bay electrical validation
- Final case/plate mechanical validation

## Next Steps

Recommended next steps:

1. Finish KiCad routing manually or with a controlled autorouter pass.
2. Run KiCad ERC and DRC until there are no real electrical/manufacturing errors.
3. Re-check USB-C placement against the module bay and case wall.
4. Generate final Gerbers and drill files.
5. Upload Gerbers to JLCPCB and PCBWay for real quotes.
6. Decide whether the first prototype should be bare PCB only or PCB assembly.
7. Build a minimal ESP-IDF/TinyUSB keyboard firmware.
8. Test the CAD model with a real 75% plate/PCB outline before ordering.
9. Make a Stardance devlog with screenshots of the CAD viewer, PCB, and design decisions.

## Honest Risk List

- A custom ESP32-S3 keyboard PCB is possible, but it is more complex than using an existing keyboard MCU board.
- USB-C routing and ESP32-S3 boot/reset/power circuitry need careful KiCad verification.
- The OSO module bay is custom and needs mechanical/electrical testing before anyone should rely on it.
- The current PCB should be treated as an engineering prototype, not a finished production design.
- Ordering before DRC/ERC cleanup could waste money.
