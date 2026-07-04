#!/usr/bin/env python3
"""OSO75 production case: bottom tray + screwed top bezel + switch plate.

Modeled from scratch in build123d. Ground truth comes ONLY from:
  - pcb_extract.json  (dumped from the routed oso75.kicad_pcb: outline,
    switch centers, stab NPTH holes, J1/J3/U1 placements)
  - hardware/layout/oso75.layout.json (switch cutout size, module bay size)

Architecture (the PCB has no mounting holes, so the stack is clamped):
  1. Build the sandwich outside the case: switches clip into the plate and
     their pins seat into the PCB hotswap sockets (plate-to-PCB = 3.5 mm).
  2. Drop the sandwich into the bottom tray. The PCB nests in the lower
     cavity; the plate is 1.1 mm proud of the PCB on every side.
  3. The top bezel's internal step lands on the plate's 1.1 mm border and
     clamps the whole sandwich down when the 10 M3 screws are tightened
     from below. Bezel underside sits 0.1 mm above the plate (tolerance).

Coordinate system: X = PCB canvas x, Y = boardH - canvas y (+Y = back of
keyboard, where the USB/ESP32 band lives), Z up. PCB outline spans
(0,0)-(337.088, 150.063).

Vertical stack:
  z 0.0    case bottom (feet recesses cut here)
  z 3.0    floor top = pocket floors in the acoustic deck
  z 5.8    acoustic deck top (0.2 mm nominal float; the plate step
           defines the stack height, not the deck). The deck is SOLID
           except for pockets over the bottom-side obstacle map + stab
           wire spans -- no hollow cavity, no drum resonance.
  z 6.0    PCB bottom
  z 7.0    SPLIT plane between bottom tray and top bezel
  z 7.6    PCB top (1.6 mm FR-4)
  z 11.1   plate bottom = bezel clamp step (MX: plate top 5.0 mm above PCB)
  z 12.6   plate top
  z 15.0   case top

Fasteners: 10x M3x10 socket head cap screws, self-tapping into 2.55 mm
pilot bores in the bezel (or drill 4.0 and use heat-set inserts for
injection molding / high-cycle use).
"""

import json
from pathlib import Path

from build123d import (
    Align, Axis, Box, Cylinder, Pos, Rot, Compound,
    export_step, export_stl, export_gltf, fillet,
)

HERE = Path(__file__).parent
ROOT = HERE.parent.parent.parent

pcb = json.loads((HERE / "pcb_extract.json").read_text())
layout = json.loads((ROOT / "hardware/layout/oso75.layout.json").read_text())

# ---------------------------------------------------------------- dimensions
# Board edge bbox includes the 0.1mm Edge.Cuts line width -> true outline:
BOARD_W = round(pcb["board"]["w"] - 0.1, 3)   # 337.088
BOARD_H = round(pcb["board"]["h"] - 0.1, 3)   # 150.063

CUTOUT = layout["switch_cutout_mm"]           # MX plate cutout (14.0)
BAY_W = layout["module_bay"]["w_mm"]          # 54
BAY_H = layout["module_bay"]["h_mm"]          # 25

WALL = 6.0          # wall thickness (houses the vertical screw columns)
FLOOR = 3.0
PCB_CLR = 0.3       # radial clearance PCB <-> cavity (and plate <-> pocket)
PCB_T = 1.6
PLATE_T = 1.5
PLATE_PCB = 5.0     # MX spec: plate TOP sits 5.0 mm above PCB top
LEDGE = 1.5         # PCB support ledge width (bottom tray)
PLATE_LIP = 1.1     # plate extends past the PCB outline; bezel clamps it
BEZEL_OVER = 2.2    # bezel overhang inward past the PCB edge (covers seam)
CLAMP_GAP = 0.1     # bezel underside to plate top (clamp tolerance)
CORNER_R = 4.0      # outer vertical edge fillet
KEYCAP_W = 18.5     # conservative envelope for adjacent keycap clearance
KEYCAP_H = 18.5
KEYCAP_CLR = 0.7

PCB_Z = 6.0                                  # PCB bottom
PCB_TOP = PCB_Z + PCB_T                      # 7.6
SPLIT = 7.0                                  # tray / bezel parting plane
PLATE_Z = PCB_TOP + PLATE_PCB - PLATE_T      # 11.1
PLATE_TOP = PLATE_Z + PLATE_T                # 12.6
CASE_TOP = PLATE_TOP + CLAMP_GAP + 2.3       # 15.0

def Y(canvas_y: float) -> float:
    """PCB canvas y (y-down) -> case Y (y-up, +Y = back)."""
    return BOARD_H - canvas_y

# inner cavity / outer shell rectangle
ix0, iy0 = -PCB_CLR, -PCB_CLR
ix1, iy1 = BOARD_W + PCB_CLR, BOARD_H + PCB_CLR
ox0, oy0, ox1, oy1 = ix0 - WALL, iy0 - WALL, ix1 + WALL, iy1 + WALL

# J1 USB-C HRO TYPE-C-31-M-12: body 8.94 mm wide, 3.26 mm tall on PCB top.
J1 = pcb["footprints"]["J1"]
USB_W, USB_H, USB_TOL = 8.94, 3.26, 0.4
USB_Z = PCB_TOP + USB_H / 2

# U1 ESP32-S3-WROOM-1U (3.1 mm tall, clears the 3.5 mm under-plate gap).
# Its u.FL pigtail runs UNDER the plate to an RP-SMA bulkhead hole in the
# back wall (hole straddles the split plane -> drop the pigtail in at
# assembly time instead of threading it).
U1 = pcb["footprints"]["U1"]
ANT_HOLE_D = 6.5
ANT_X = U1["x"] + 30
ANT_Z = SPLIT

# J3 module bay: 54x25 module hot-swaps from the top through the plate.
J3 = pcb["footprints"]["J3"]
BAY_X0, BAY_Y0 = J3["x"] - BAY_W / 2, J3["y"] - BAY_H / 2
BAY_TOL = 0.3

switches = [s for s in pcb["switches"] if s["ref"] not in ("SW_RESET", "SW_BOOT")]
buttons = [s for s in pcb["switches"] if s["ref"] in ("SW_RESET", "SW_BOOT")]
assert len(switches) == 82, len(switches)

inserts = [h for h in pcb["stabs"] if abs(h["d"] - 3.988) < 0.01]
wires = {round(h["x"], 2): h for h in pcb["stabs"] if abs(h["d"] - 3.048) < 0.01}
assert len(inserts) == 8 and len(wires) == 8

# 10 screw columns, axes centered in the wall; clear of the USB slot
# (x=168.5), antenna hole (x=226) and feet.
wall_cy_back, wall_cy_front = iy1 + WALL / 2, iy0 - WALL / 2
wall_cx_left, wall_cx_right = ix0 - WALL / 2, ix1 + WALL / 2
SCREWS = (
    [(x, wall_cy_back) for x in (15, 110, 250, 322)]
    + [(x, wall_cy_front) for x in (15, 110, 230, 322)]
    + [(wall_cx_left, BOARD_H / 2), (wall_cx_right, BOARD_H / 2)]
)
SCREW_CLEAR_D = 3.4     # through-bore in the tray
SCREW_CBORE_D = 6.4     # M3 SHCS head (5.5) counterbore
SCREW_CBORE_H = 3.0
SCREW_PILOT_D = 2.55    # self-tap pilot in the bezel (4.0 for heat-sets)
SCREW_PILOT_DEPTH = 7.0

FEET = [(45, -1), (292, -1), (45, BOARD_H + 1), (292, BOARD_H + 1)]
FOOT_D, FOOT_DEPTH = 10.0, 0.6   # recesses for 10 mm adhesive bumpons

# ----------------------------------------------- filled acoustic deck
# Instead of a hollow 2.8 mm air cavity under the PCB (a drum that gives
# the board a hollow/pingy sound), the whole under-PCB volume stays solid
# up to 0.2 mm below the PCB. Only the board's bottom-side obstacle map
# (hotswap sockets, solder joints, switch pegs, stab feet, bottom-side
# bodies -- extracted from KiCad, pre-inflated there) is pocketed down to
# the 3 mm floor. ~85-90 % solid: kills cavity resonance, backs every key
# against typing flex and switch hot-swap force.
POCKET_MARGIN = 0.3   # extra clearance around each (already inflated) rect

def stab_wire_spans():
    """Stab wires swing BELOW the PCB between each pair of wire holes when
    the key is pressed -- the deck must be pocketed along that span too."""
    ws = sorted(wires.values(), key=lambda h: (round(h["y"], 1), h["x"]))
    spans = []
    for a, b in zip(ws[0::2], ws[1::2]):
        assert abs(a["y"] - b["y"]) < 1.0, "unpaired stab wire holes"
        spans.append({"x0": min(a["x"], b["x"]) - 3.0,
                      "x1": max(a["x"], b["x"]) + 3.0,
                      "y0": a["y"] - 3.0, "y1": a["y"] + 3.0})
    return spans

POCKETS = pcb["bottom_obstacles"] + stab_wire_spans()

# ------------------------------------------------------------------- helpers
def box_xy(x0, y0, x1, y1, z0, z1):
    return Pos(x0, y0, z0) * Box(
        x1 - x0, y1 - y0, z1 - z0, align=(Align.MIN, Align.MIN, Align.MIN)
    )

def vbore(x, y, z0, z1, d):
    h = z1 - z0
    return Pos(x, y, z0 + h / 2) * Cylinder(d / 2, h)

def rects_overlap(a, b):
    ax0, ay0, ax1, ay1 = a
    bx0, by0, bx1, by1 = b
    return ax0 < bx1 and ax1 > bx0 and ay0 < by1 and ay1 > by0

# -------------------------------------------------------------- bottom tray
tray = box_xy(ox0, oy0, ox1, oy1, 0, SPLIT)
tray = fillet(tray.edges().filter_by(Axis.Z), CORNER_R)
# filled acoustic deck: the interior stays SOLID up to 0.2 mm under the
# PCB; pocket out only the bottom-side obstacles + stab wire spans
pocket_boxes = [
    box_xy(o["x0"] - POCKET_MARGIN, Y(o["y1"]) - POCKET_MARGIN,
           o["x1"] + POCKET_MARGIN, Y(o["y0"]) + POCKET_MARGIN,
           FLOOR, PCB_Z - 0.1)
    for o in POCKETS
]
tray -= Compound(children=pocket_boxes)
# PCB seat: deck top 5.8 -> 6.0 float, then PCB cavity to the split plane
tray -= box_xy(ix0, iy0, ix1, iy1, PCB_Z - 0.2, SPLIT + 0.1)
for x, y in SCREWS:
    tray -= vbore(x, y, -0.1, SPLIT + 0.1, SCREW_CLEAR_D)
    tray -= vbore(x, y, -0.1, SCREW_CBORE_H, SCREW_CBORE_D)
for x, y in FEET:
    tray -= vbore(x, y, -0.1, FOOT_DEPTH, FOOT_D)
# antenna hole straddles the split (lower half lives in the tray)
ant_hole = (Pos(ANT_X, iy1 + WALL / 2, ANT_Z) * Rot(90, 0, 0)
            * Cylinder(ANT_HOLE_D / 2, WALL + 2))
tray -= ant_hole

# ---------------------------------------------------------------- top bezel
bezel = box_xy(ox0, oy0, ox1, oy1, SPLIT, CASE_TOP)
bezel = fillet(bezel.edges().filter_by(Axis.Z), CORNER_R)
# PCB cavity continues up to the clamp step at PLATE_Z
bezel -= box_xy(ix0, iy0, ix1, iy1, SPLIT - 0.1, PLATE_Z)
# plate pocket: plate (PCB + 1.1/side) + 0.3 clearance, step lands on plate
px0, py0 = -PLATE_LIP, -PLATE_LIP
px1, py1 = BOARD_W + PLATE_LIP, BOARD_H + PLATE_LIP
bezel -= box_xy(px0 - PCB_CLR, py0 - PCB_CLR, px1 + PCB_CLR, py1 + PCB_CLR,
                PLATE_Z, PLATE_TOP + CLAMP_GAP)
# bezel opening above the plate (overhangs the seam by BEZEL_OVER)
bezel -= box_xy(BEZEL_OVER, BEZEL_OVER, BOARD_W - BEZEL_OVER,
                BOARD_H - BEZEL_OVER, PLATE_TOP + CLAMP_GAP, CASE_TOP + 1)
# USB-C slot, opened down to the split plane (no thin tongue below it;
# the tray's top face forms the slot floor)
slot_w, slot_h = USB_W + 2 * USB_TOL, USB_H + 2 * USB_TOL
bezel -= box_xy(J1["x"] - slot_w / 2, iy1 - 0.1, J1["x"] + slot_w / 2,
                oy1 + 0.1, SPLIT - 0.1, USB_Z + slot_h / 2)
bezel -= ant_hole
for x, y in SCREWS:
    bezel -= vbore(x, y, SPLIT - 0.1, SPLIT + SCREW_PILOT_DEPTH, SCREW_PILOT_D)
bezel = fillet(bezel.edges().group_by(Axis.Z)[-1], 1.0)   # soften the top rim

# ----------------------------------------------------------------- the plate
plate = box_xy(px0, py0, px1, py1, 0, PLATE_T)
for s in switches:
    plate -= box_xy(s["x"] - CUTOUT / 2, Y(s["y"]) - CUTOUT / 2,
                    s["x"] + CUTOUT / 2, Y(s["y"]) + CUTOUT / 2, -1, PLATE_T + 1)
# stab clearance: one opening per insert, spanning wire hole to insert hole
for ins in inserts:
    wire = wires[round(ins["x"], 2)]
    y_lo = Y(max(ins["y"], wire["y"])) - 2.0
    y_hi = Y(min(ins["y"], wire["y"])) + 2.0
    plate -= box_xy(ins["x"] - 3.5, y_lo, ins["x"] + 3.5, y_hi, -1, PLATE_T + 1)
# module bay drop-in opening
plate -= box_xy(BAY_X0 - BAY_TOL, Y(BAY_Y0 + BAY_H) - BAY_TOL,
                BAY_X0 + BAY_W + BAY_TOL, Y(BAY_Y0) + BAY_TOL, -1, PLATE_T + 1)
# rear electronics reliefs: the 3.5 mm PCB-to-plate underside channel is
# tight around the USB-C shell, ESP32-S3 module, and mated u.FL plug/cable.
# These cutouts keep the production plate from becoming the clearance limiter.
RELIEF_SWITCH_MARGIN = 0.5
u1_x0, u1_x1 = U1["x"] - 13.0, U1["x"] + 20.0
overlapping_switch_rears = [
    Y(s["y"]) + CUTOUT / 2 + RELIEF_SWITCH_MARGIN
    for s in switches
    if not (s["x"] + CUTOUT / 2 + RELIEF_SWITCH_MARGIN <= u1_x0
            or s["x"] - CUTOUT / 2 - RELIEF_SWITCH_MARGIN >= u1_x1)
]
u1_rear_relief_y0 = max([Y(U1["y"]) - 18.0] + overlapping_switch_rears)
electronics_reliefs = [
    ("usb", J1["x"] - USB_W / 2 - 1.0, Y(J1["y"]) - 4.0,
     J1["x"] + USB_W / 2 + 1.0, BOARD_H + PLATE_LIP + 1.0),
    # Start behind the F-row switch windows; the ESP32 body/u.FL live in the
    # rear band, but the plate must keep full switch-clip material around SW6/SW7.
    ("u1_rear", u1_x0, u1_rear_relief_y0, u1_x1, BOARD_H + PLATE_LIP + 1.0),
]
for _, rx0, ry0, rx1, ry1 in electronics_reliefs:
    plate -= box_xy(rx0, ry0, rx1, ry1, -1, PLATE_T + 1)
# polarization key: the carrier PCB has a 5 mm chamfer on its back-left
# corner; this 2.2 mm corner block only admits that orientation, so the
# module physically cannot be inserted 180 deg rotated (which would put
# the bay's 5 V/EN contacts on the I2C pins).
KEY = 2.2
kx, ky = BAY_X0 - BAY_TOL, Y(BAY_Y0) + BAY_TOL   # back-left opening corner
plate += box_xy(kx, ky - KEY, kx + KEY, ky, 0, PLATE_T)
# carrier chamfer line is 5 mm; the key's inner corner sits at depth
# (KEY + KEY) = 4.4 along the diagonal -> 0.42 mm clearance to the module
assert 2 * KEY < 5.0 - 0.4, "polarization key collides with carrier chamfer"
# finger holes over the reset/boot tactile switches in the band
for b in buttons:
    plate -= Pos(b["x"], Y(b["y"]), PLATE_T / 2) * Cylinder(2.0, PLATE_T + 2)

# ------------------------------------------------------- bay blank cover
# With no module installed the bay shows the bare J3 gold pads. This blank
# snaps into the plate opening: a 1.2 mm proud cap (pryable by fingernail
# under its lip) on a plug that drops through the plate, with four snap
# ridges that detent against the plate's underside. Pops out to fit a module.
COVER_CLR = 0.15     # plug to opening, per side
CAP_LIP = 1.2        # cap overlaps the plate around most of the opening
CAP_LIP_RIGHT = 0.3  # right edge sits near F-row keycaps; keep it skinny
CAP_T = 1.2
RIDGE_P = 0.3        # snap ridge proud of the plug face

bx0, by0 = BAY_X0 - BAY_TOL, Y(BAY_Y0 + BAY_H) - BAY_TOL
bx1, by1 = BAY_X0 + BAY_W + BAY_TOL, Y(BAY_Y0) + BAY_TOL
cover_cap_x0 = bx0 - CAP_LIP
cover_cap_x1 = bx1 + CAP_LIP_RIGHT
cover_cap_y0 = by0 - CAP_LIP
cover_cap_y1 = by1 + CAP_LIP
cover = box_xy(cover_cap_x0, cover_cap_y0, cover_cap_x1, cover_cap_y1,
               PLATE_TOP, PLATE_TOP + CAP_T)
cover = fillet(cover.edges().filter_by(Axis.Z), 1.5)
cover = fillet(cover.edges().group_by(Axis.Z)[-1], 0.6)
# plug through the plate, stopping 2.3 mm above the PCB (and its gold pads)
cover += box_xy(bx0 + COVER_CLR, by0 + COVER_CLR, bx1 - COVER_CLR,
                by1 - COVER_CLR, PLATE_Z - 1.2, PLATE_TOP + 0.1)
# snap ridges (two per long side) that catch under the plate
for ry0, ry1 in ((by0 + COVER_CLR - RIDGE_P, by0 + COVER_CLR),
                 (by1 - COVER_CLR, by1 - COVER_CLR + RIDGE_P)):
    for rx in (bx0 + 12, bx1 - 12):
        cover += box_xy(rx - 4, ry0, rx + 4, ry1, PLATE_Z - 1.0, PLATE_Z - 0.2)
# plug chamfer matching the carrier's polarizing corner (clears the plate's
# 2.2 mm key block); the proud cap above is untouched and hides it
cover -= (Pos(bx0 + COVER_CLR, by1 - COVER_CLR, (PLATE_Z - 1.3 + PLATE_TOP) / 2)
          * Rot(0, 0, 45)
          * Box(7.071, 7.071, PLATE_TOP - PLATE_Z + 2))

# ------------------------------------------------------------ sanity checks
pb = plate.bounding_box()
assert pb.size.X < (px1 + PCB_CLR) - (px0 - PCB_CLR), "plate jams in pocket"
assert PLATE_Z - PCB_TOP == 3.5, "MX plate-to-PCB spacing broken"
# slot may nick the clamp step by a hair (plate covers it from inside),
# but must stay below the plate top so the bezel face remains closed
assert USB_Z + slot_h / 2 < PLATE_TOP, "USB slot breaches the bezel face"
for x, y in SCREWS:
    assert abs(x - ANT_X) > ANT_HOLE_D / 2 + SCREW_PILOT_D or y < BOARD_H / 2, \
        "screw column hits antenna hole"
    assert abs(x - J1["x"]) > slot_w / 2 + SCREW_PILOT_D or y < BOARD_H / 2, \
        "screw column hits USB slot"
assert all(p.is_valid() and p.volume > 0 for p in (tray, bezel, plate, cover))
# the cover cap must not reach any neighboring switch cutout or keycap envelope
for s in switches:
    sx0, sy0 = s["x"] - CUTOUT / 2, Y(s["y"]) - CUTOUT / 2
    sx1, sy1 = s["x"] + CUTOUT / 2, Y(s["y"]) + CUTOUT / 2
    switch_with_margin = (
        sx0 - RELIEF_SWITCH_MARGIN, sy0 - RELIEF_SWITCH_MARGIN,
        sx1 + RELIEF_SWITCH_MARGIN, sy1 + RELIEF_SWITCH_MARGIN,
    )
    for name, rx0, ry0, rx1, ry1 in electronics_reliefs:
        assert not rects_overlap((rx0, ry0, rx1, ry1), switch_with_margin), \
            f"{name} plate relief overlaps {s['ref']} switch cutout margin"
    assert (sx1 < cover_cap_x0 or sx0 > cover_cap_x1
            or sy1 < cover_cap_y0 or sy0 > cover_cap_y1), \
        f"bay cover cap overlaps {s['ref']} cutout"
    kx0, ky0 = s["x"] - KEYCAP_W / 2 - KEYCAP_CLR, Y(s["y"]) - KEYCAP_H / 2 - KEYCAP_CLR
    kx1, ky1 = s["x"] + KEYCAP_W / 2 + KEYCAP_CLR, Y(s["y"]) + KEYCAP_H / 2 + KEYCAP_CLR
    assert (kx1 < cover_cap_x0 or kx0 > cover_cap_x1
            or ky1 < cover_cap_y0 or ky0 > cover_cap_y1), \
        f"bay cover cap violates keycap envelope near {s['ref']}"
assert PLATE_Z - 1.2 > PCB_TOP + 2.0, "cover plug too close to J3 pads"
# the acoustic deck must actually be filled: a hollow tray is ~198 cm^3,
# a fully solid interior ~340 cm^3 -- pockets should land us well above 250
assert tray.volume > 250e3, f"deck not filled? tray {tray.volume / 1e3:.1f} cm^3"

# ------------------------------------------------------------------- export
plate_placed = Pos(0, 0, PLATE_Z) * plate
assembly = Compound(children=[tray, bezel, plate_placed, cover])
# export the cover in the plate's local frame so the viewer can reuse the
# plate offset (and so it prints cap-down at a sane height)
cover_local = Pos(0, 0, -PLATE_Z) * cover
export_step(cover_local, str(HERE / "oso75_bay_cover.step"))
export_stl(cover_local, str(HERE / "oso75_bay_cover.stl"))

export_step(tray, str(HERE / "oso75_case_bottom.step"))
export_step(bezel, str(HERE / "oso75_case_bezel.step"))
export_step(plate, str(HERE / "oso75_plate.step"))
export_step(assembly, str(HERE / "oso75_assembly.step"))
export_stl(tray, str(HERE / "oso75_case_bottom.stl"))
export_stl(bezel, str(HERE / "oso75_case_bezel.stl"))
export_stl(plate, str(HERE / "oso75_plate.stl"))
export_gltf(assembly, str(HERE / "oso75_assembly.glb"), binary=True)

# --------------------------------------- A1-mini segmented variant
# The case is 349.7 mm wide -- far beyond a Bambu A1 mini's 180 x 180 bed,
# even diagonally. Tray and bezel are therefore ALSO exported as three
# X-segments each, joined by glued stepped lap joints (16 mm overlap, step
# at mid-height) with vertical 1.75 mm filament alignment pins in the
# walls. Tray and bezel seams are staggered so no joint runs through the
# assembled case, and the (laser-cut) plate bridges all seams as a spine.
LAP = 16.0          # total lap overlap at each seam
SEAM_GAP = 0.2      # fit/glue clearance on the mating faces
PIN_D = 1.8         # holes for 1.75 mm filament alignment pins
TRAY_SEAMS = (130.0, 268.0)
BEZEL_SEAMS = (95.0, 205.0)
BED = 176.0         # usable A1 mini bed (180) minus margin

# every seam's lap band must clear screws, feet, USB slot and antenna hole
for xs in TRAY_SEAMS + BEZEL_SEAMS:
    for sx, _ in SCREWS:
        assert abs(xs - sx) > LAP / 2 + SCREW_CBORE_D / 2 + 1, \
            f"seam {xs} hits screw column {sx}"
for xs in TRAY_SEAMS:
    for fx, _ in FEET:
        assert abs(xs - fx) > LAP / 2 + FOOT_D / 2 + 1, \
            f"tray seam {xs} hits foot {fx}"
for xs in BEZEL_SEAMS:
    assert abs(xs - J1["x"]) > LAP / 2 + slot_w / 2 + 1, \
        f"bezel seam {xs} hits USB slot"
    assert abs(xs - ANT_X) > LAP / 2 + ANT_HOLE_D / 2 + 1, \
        f"bezel seam {xs} hits antenna hole"

def seam_cutter(xs, zmid, grow=0.0):
    """Solid covering everything on the +X side of a stepped seam at xs
    (z-step at zmid). grow > 0 fattens it toward -X/-Z so subtracting it
    leaves SEAM_GAP of glue clearance on the mating faces."""
    return (box_xy(xs + LAP / 2 - grow, oy0 - 1, ox1 + 1, oy1 + 1,
                   -1, CASE_TOP + 1)
            + box_xy(xs - LAP / 2 - grow, oy0 - 1, ox1 + 1, oy1 + 1,
                     zmid - grow, CASE_TOP + 1))

def segment(part, seams, zmid, pin_z0, pin_z1):
    """Split part at the seam Xs; -X side keeps the lower lap half, +X side
    the upper, so pieces assemble by lowering onto each other over the
    alignment pins (two per seam, in the wall centerlines)."""
    for xs in seams:
        for y in (wall_cy_front, wall_cy_back):
            part -= vbore(xs, y, pin_z0, pin_z1, PIN_D)
    pieces, rest = [], part
    for xs in seams:
        pieces.append(rest - seam_cutter(xs, zmid, SEAM_GAP))
        rest = rest & seam_cutter(xs, zmid)
    pieces.append(rest)
    return pieces

# tray step at z 3.5 (through the solid deck = big glue area), pins open
# at the hidden split face; bezel step at z 11, pin holes blind 1 mm
# below the visible top face
tray_segs = segment(tray, TRAY_SEAMS, 3.5, 1.0, SPLIT + 0.1)
bezel_segs = segment(bezel, BEZEL_SEAMS, 11.0, SPLIT - 0.1, CASE_TOP - 1.0)

for name, segs in (("oso75_case_bottom", tray_segs), ("oso75_case_bezel", bezel_segs)):
    for i, piece in enumerate(segs, 1):
        bb = piece.bounding_box()
        assert piece.is_valid() and piece.volume > 0, f"{name}_seg{i} invalid"
        assert bb.size.X <= BED and bb.size.Y <= BED, \
            f"{name}_seg{i} {bb.size.X:.1f} x {bb.size.Y:.1f} exceeds A1 mini bed"
        export_stl(piece, str(HERE / f"{name}_seg{i}.stl"))
seg_sizes = [f"{p.bounding_box().size.X:.0f}" for p in tray_segs + bezel_segs]

print(f"outer: {ox1 - ox0:.3f} x {oy1 - oy0:.3f} x {CASE_TOP} mm")
print(f"volumes cm^3: tray {tray.volume / 1e3:.1f}, bezel {bezel.volume / 1e3:.1f}, "
      f"plate {plate.volume / 1e3:.1f}")
print(f"cutouts: {len(switches)} switches, {len(inserts)} stab openings, "
      f"bay {BAY_W + 2 * BAY_TOL:.1f} x {BAY_H + 2 * BAY_TOL:.1f}")
print(f"USB slot x={J1['x']:.2f} z {SPLIT}-{USB_Z + slot_h/2:.2f}; "
      f"antenna hole x={ANT_X:.1f} z={ANT_Z}; {len(SCREWS)} x M3x10 SHCS")
print(f"acoustic deck: {len(POCKETS)} pockets "
      f"({len(pcb['bottom_obstacles'])} obstacles + {len(POCKETS) - len(pcb['bottom_obstacles'])} stab wire spans)")
print(f"A1-mini segments: tray seams {TRAY_SEAMS}, bezel seams {BEZEL_SEAMS}, "
      f"widths {seg_sizes} mm (bed {BED})")
print("exported: bottom/bezel/plate/assembly STEP, STLs, assembly GLB, "
      "6 x _seg STLs")
