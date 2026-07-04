"""Shrink the rear electronics band: board 173.063 -> 150.063 mm tall.

- Strip all tracks (full re-route follows)
- Outline rectangle: replace y=173.063 with 150.063
- Rotate U1 so the antenna points +x (east), repack all band components
  into y 129.5..149.5; J1 keeps its edge offset (new y 147.660)
- Replace the antenna keepout rule area (now east of the module, to 5 mm
  past the antenna tip, both copper layers)
- Move silk rev texts into the band
- Refill zones, save. Verify with render + DRC afterwards.
"""
import pcbnew
from pcbnew import FromMM, ToMM, VECTOR2I

BOARD = "oso75.kicad_pcb"
NEW_H = 150.063
OLD_H = 173.063

board = pcbnew.LoadBoard(BOARD)

# 0. strip tracks
old = list(board.GetTracks())
for t in old:
    board.Remove(t)
print("stripped", len(old), "tracks/vias")

# 1. outline
n = 0
for d in board.GetDrawings():
    if d.GetLayer() == pcbnew.Edge_Cuts:
        s, e = d.GetStart(), d.GetEnd()
        changed = False
        if abs(ToMM(s.y) - OLD_H) < 0.01:
            d.SetStart(VECTOR2I(s.x, FromMM(NEW_H)))
            changed = True
        if abs(ToMM(e.y) - OLD_H) < 0.01:
            d.SetEnd(VECTOR2I(e.x, FromMM(NEW_H)))
            changed = True
        n += changed
print("outline lines adjusted:", n)

# 2. U1 rotation: antenna is -y at rot 0; try 90 and check pads end up east
u1 = board.FindFootprintByReference("U1")
u1.SetOrientationDegrees(90)
xs = [ToMM(p.GetPosition().x) for p in u1.Pads()]
cx = ToMM(u1.GetPosition().x)
# pads should sit WEST of center if antenna points east
if (min(xs) + max(xs)) / 2 > cx:
    u1.SetOrientationDegrees(270)
    print("U1 rot 270 (antenna east)")
else:
    print("U1 rot 90 (antenna east)")

MOVES = {
    "U1": (196.0, 138.8),
    "J1": (168.54, 147.660),
    "U3": (147.0, 144.5),
    "C2": (141.5, 144.5),
    "C1": (152.5, 144.5),
    "C3": (181.0, 134.5),
    "C4": (181.0, 142.5),
    "R3": (157.5, 145.0),
    "R4": (157.5, 141.5),
    "R1": (179.5, 147.0),
    "R2": (179.5, 144.0),
    "SW_RESET": (93.5, 138.0),
    "SW_BOOT": (101.5, 138.0),
    "R10": (109.5, 138.0),
    "F1": (117.0, 138.0),
    "R5": (124.5, 138.0),
    "R6": (131.5, 138.0),
}
for ref, (x, y) in MOVES.items():
    fp = board.FindFootprintByReference(ref)
    fp.SetPosition(VECTOR2I(FromMM(x), FromMM(y)))
print("moved", len(MOVES), "footprints")

# verify U1 pads/antenna geometry after move
xs = [ToMM(p.GetPosition().x) for p in u1.Pads()]
ys = [ToMM(p.GetPosition().y) for p in u1.Pads()]
print("U1 pads x %.1f..%.1f y %.1f..%.1f" % (min(xs), max(xs), min(ys), max(ys)))

# 3. antenna keepout: delete old, add new east of module
for z in list(board.Zones()):
    if z.GetIsRuleArea() and z.GetZoneName() == "esp32s3_antenna_keepout":
        board.Remove(z)
        print("removed old keepout")
z = pcbnew.ZONE(board)
z.SetIsRuleArea(True)
z.SetDoNotAllowTracks(True)
z.SetDoNotAllowVias(True)
z.SetDoNotAllowZoneFills(True)
ls = pcbnew.LSET()
ls.AddLayer(pcbnew.F_Cu)
ls.AddLayer(pcbnew.B_Cu)
z.SetLayerSet(ls)
z.SetZoneName("esp32s3_antenna_keepout")
chain = pcbnew.SHAPE_LINE_CHAIN()
for x, y in ((201.5, 128.8), (215.0, 128.8), (215.0, NEW_H), (201.5, NEW_H)):
    chain.Append(FromMM(x), FromMM(y))
chain.SetClosed(True)
z.AddPolygon(chain)
board.Add(z)
print("added new antenna keepout x 201.5..215.0 y 128.8..%.3f" % NEW_H)

# 4. silk texts
for d in board.GetDrawings():
    if d.GetClass() == "PCB_TEXT" and "OSO75 rev" in d.GetText():
        p = d.GetPosition()
        d.SetPosition(VECTOR2I(p.x, FromMM(134.0 if d.GetLayer() == pcbnew.B_SilkS else 131.0)))
print("silk texts moved")

# 5. shrink GND zone outlines to new board bbox (avoid huge overhang)
for z in board.Zones():
    if not z.GetIsRuleArea() and z.GetNetname() == "GND":
        o = z.Outline()
        for i in range(o.OutlineCount()):
            ol = o.Outline(i)
            for k in range(ol.PointCount()):
                pt = ol.CPoint(k)
                if ToMM(pt.y) > NEW_H:
                    ol.SetPoint(k, VECTOR2I(pt.x, FromMM(NEW_H)))
print("zone outlines clamped")

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(BOARD, board)
print("saved")
