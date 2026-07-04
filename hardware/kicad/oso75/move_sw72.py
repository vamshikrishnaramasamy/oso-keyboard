"""Move SW72/D72 (PrtSc) +19.051 mm x to the nav column, rip broken tracks.

Layout fix: PrtSc was at 0.75u after F12 (keycap overlap). New positions from
regenerated placement csv: SW72 (318.563, 118.537), D72 (325.063, 125.037).
Rips: all D72_A tracks, COL13/ROW0 tracks near the old location, and any
track now colliding with the moved footprints. Refill + save. The missing
connections are re-routed afterwards (route_astar) and verified by DRC.
"""
import pcbnew
from pcbnew import FromMM, ToMM, VECTOR2I

BOARD = "oso75.kicad_pcb"
board = pcbnew.LoadBoard(BOARD)

NEW = {"SW72": (318.563, 118.537), "D72": (325.063, 125.037)}
OLD = {}
for ref, (x, y) in NEW.items():
    fp = board.FindFootprintByReference(ref)
    OLD[ref] = (ToMM(fp.GetPosition().x), ToMM(fp.GetPosition().y))
    fp.SetPosition(VECTOR2I(FromMM(x), FromMM(y)))
    print("moved", ref, OLD[ref], "->", (x, y))

# nets whose local wiring is now broken
RIP_NEAR = []  # (netname, cx, cy, radius_mm)
RIP_NEAR.append(("COL13", OLD["SW72"][0], OLD["SW72"][1], 12.0))
RIP_NEAR.append(("ROW0", OLD["D72"][0], OLD["D72"][1], 8.0))

ripped = []
for t in list(board.GetTracks()):
    nn = t.GetNetname()
    if nn == "D72_A":
        ripped.append(t)
        continue
    for net, cx, cy, r in RIP_NEAR:
        if nn != net:
            continue
        for p in (t.GetStart(), t.GetEnd()):
            if abs(ToMM(p.x) - cx) < r and abs(ToMM(p.y) - cy) < r:
                ripped.append(t)
                break
        else:
            continue
        break

# tracks colliding with moved footprints at the new spot
moved_shapes = []
for ref in NEW:
    fp = board.FindFootprintByReference(ref)
    for p in fp.Pads():
        for layer in (pcbnew.F_Cu, pcbnew.B_Cu):
            if p.IsOnLayer(layer) or p.GetAttribute() in (
                    pcbnew.PAD_ATTRIB_PTH, pcbnew.PAD_ATTRIB_NPTH):
                moved_shapes.append((p.GetEffectiveShape(layer), layer,
                                     p.GetNetCode()))

CLR = FromMM(0.25)
for t in list(board.GetTracks()):
    if t in ripped:
        continue
    ts = None
    for s, layer, code in moved_shapes:
        if not t.IsOnLayer(layer):
            continue
        if t.GetNetCode() == code:
            continue
        if ts is None:
            ts = {}
        if layer not in ts:
            ts[layer] = t.GetEffectiveShape(layer)
        if ts[layer].Collide(s, CLR):
            ripped.append(t)
            print("rip colliding", t.GetNetname(),
                  round(ToMM(t.GetStart().x), 2), round(ToMM(t.GetStart().y), 2))
            break

seen = set()
n = 0
for t in ripped:
    if id(t) in seen:
        continue
    seen.add(id(t))
    board.Remove(t)
    n += 1
print("ripped", n, "tracks")

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(BOARD, board)
print("saved")
