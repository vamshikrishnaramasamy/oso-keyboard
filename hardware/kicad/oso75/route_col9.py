"""Route COL9 SW21->SW8 with a wider search than route_two.py.

Tries, in order:
  1. L-paths (P1 -> vert -> street -> vert -> P2) on B.Cu then F.Cu,
     streets y = 98..130 mm in 0.25 steps.
  2. Dogleg paths: vertical legs shifted by dx in [-8..8] mm, both layers.
Places the first clear path; refills zones; saves.
"""
import pcbnew
from pcbnew import FromMM, VECTOR2I

BOARD = "oso75.kicad_pcb"
WIDTH = FromMM(0.2)
CLEAR = FromMM(0.22)

board = pcbnew.LoadBoard(BOARD)
NET = "COL9"
net = board.GetNetsByName()[NET]
CODE = net.GetNetCode()


def pth_pad(ref):
    fp = board.FindFootprintByReference(ref)
    for p in fp.Pads():
        if p.GetNetname() == NET and p.GetAttribute() == pcbnew.PAD_ATTRIB_PTH:
            return p
    raise SystemExit("no pad")


# cache obstacles per layer for speed
def obstacles(layer):
    obs = []
    for t in board.GetTracks():
        if t.GetNetCode() != CODE and t.IsOnLayer(layer):
            obs.append(t.GetEffectiveShape(layer))
    for fp in board.GetFootprints():
        for p in fp.Pads():
            pth = p.GetAttribute() in (pcbnew.PAD_ATTRIB_PTH, pcbnew.PAD_ATTRIB_NPTH)
            if p.GetNetCode() == CODE and p.GetAttribute() != pcbnew.PAD_ATTRIB_NPTH:
                continue
            if p.IsOnLayer(layer) or pth:
                obs.append(p.GetEffectiveShape(layer))
    return obs

OBS = {l: obstacles(l) for l in (pcbnew.B_Cu, pcbnew.F_Cu)}


def path_ok(pts, layer):
    for i in range(len(pts) - 1):
        if pts[i] == pts[i + 1]:
            continue
        shape = pcbnew.SHAPE_SEGMENT(pts[i], pts[i + 1], WIDTH)
        for o in OBS[layer]:
            if shape.Collide(o, CLEAR):
                return False
    return True


def place(pts, layer):
    for i in range(len(pts) - 1):
        if pts[i] == pts[i + 1]:
            continue
        t = pcbnew.PCB_TRACK(board)
        t.SetStart(pts[i])
        t.SetEnd(pts[i + 1])
        t.SetWidth(WIDTH)
        t.SetLayer(layer)
        t.SetNet(net)
        board.Add(t)


pa, pb = pth_pad("SW21"), pth_pad("SW8")
a, b = pa.GetPosition(), pb.GetPosition()

streets = [y / 4.0 for y in range(392, 521)]  # 98.0 .. 130.0 mm
found = None
for layer in (pcbnew.B_Cu, pcbnew.F_Cu):
    for ymm in streets:
        ym = FromMM(ymm)
        pts = [a, VECTOR2I(a.x, ym), VECTOR2I(b.x, ym), b]
        if path_ok(pts, layer):
            found = (pts, layer, "L street y=%.2f" % ymm)
            break
    if found:
        break

if not found:
    for layer in (pcbnew.B_Cu, pcbnew.F_Cu):
        for ymm in streets:
            ym = FromMM(ymm)
            for dxa in range(-8, 9, 1):
                for dxb in range(-8, 9, 1):
                    xa = a.x + FromMM(float(dxa))
                    xb = b.x + FromMM(float(dxb))
                    ya_mid = FromMM(99.0)
                    yb_mid = FromMM(119.0)
                    pts = [a, VECTOR2I(a.x, ya_mid), VECTOR2I(xa, ya_mid),
                           VECTOR2I(xa, ym), VECTOR2I(xb, ym),
                           VECTOR2I(xb, yb_mid), VECTOR2I(b.x, yb_mid), b]
                    if path_ok(pts, layer):
                        found = (pts, layer,
                                 "dogleg y=%.2f dxa=%d dxb=%d" % (ymm, dxa, dxb))
                        break
                if found:
                    break
            if found:
                break
        if found:
            break

if found:
    pts, layer, desc = found
    place(pts, layer)
    print("COL9 routed:", desc, "on", pcbnew.LayerName(layer))
    pcbnew.ZONE_FILLER(board).Fill(board.Zones())
    pcbnew.SaveBoard(BOARD, board)
    print("refilled + saved")
else:
    print("COL9 STILL NO PATH")
