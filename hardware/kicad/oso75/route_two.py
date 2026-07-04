"""Hand-route the two column links freerouting could not finish.

For each pad pair, search L-shaped (3-segment) candidate paths on B.Cu:
  P1 -> (x1, ym) -> (x2, ym) -> P2  for street heights ym in a scan range.
Each candidate segment is collision-checked against every same-layer item
(tracks, vias, pads incl. holes) of a different net using GetEffectiveShape.
First clear path is placed as real PCB_TRACKs. Zones refilled, board saved.
"""
import pcbnew
from pcbnew import FromMM, ToMM, VECTOR2I

BOARD = "oso75.kicad_pcb"
WIDTH = FromMM(0.2)
CLEAR = FromMM(0.22)  # rule is 0.2; small margin
LAYER = pcbnew.B_Cu

board = pcbnew.LoadBoard(BOARD)

# (net, ref_a, ref_b)
JOBS = [("COL7", "SW19", "SW6"), ("COL9", "SW21", "SW8")]


def pth_pad(ref, net):
    fp = board.FindFootprintByReference(ref)
    for p in fp.Pads():
        if p.GetNetname() == net and p.GetAttribute() == pcbnew.PAD_ATTRIB_PTH:
            return p
    raise SystemExit("no PTH pad for %s %s" % (ref, net))


def seg_collides(a, b, netcode):
    shape = pcbnew.SHAPE_SEGMENT(a, b, WIDTH)
    for t in board.GetTracks():
        if t.GetNetCode() == netcode:
            continue
        if not t.IsOnLayer(LAYER):
            continue
        if shape.Collide(t.GetEffectiveShape(LAYER), CLEAR):
            return True
    for fp in board.GetFootprints():
        for p in fp.Pads():
            if p.GetNetCode() == netcode and p.GetAttribute() != pcbnew.PAD_ATTRIB_NPTH:
                continue
            if not p.IsOnLayer(LAYER) and p.GetAttribute() not in (
                pcbnew.PAD_ATTRIB_PTH, pcbnew.PAD_ATTRIB_NPTH):
                continue
        # NPTH/PTH holes and B.Cu pads all matter
            if shape.Collide(p.GetEffectiveShape(LAYER), CLEAR):
                return True
    return False


def path_ok(pts, netcode):
    for i in range(len(pts) - 1):
        if pts[i] == pts[i + 1]:
            continue
        if seg_collides(pts[i], pts[i + 1], netcode):
            return False
    return True


def place(pts, net):
    n = 0
    for i in range(len(pts) - 1):
        if pts[i] == pts[i + 1]:
            continue
        t = pcbnew.PCB_TRACK(board)
        t.SetStart(pts[i])
        t.SetEnd(pts[i + 1])
        t.SetWidth(WIDTH)
        t.SetLayer(LAYER)
        t.SetNet(net)
        board.Add(t)
        n += 1
    return n


for netname, ra, rb in JOBS:
    net = board.GetNetsByName()[netname]
    code = net.GetNetCode()
    pa, pb = pth_pad(ra, netname), pth_pad(rb, netname)
    a, b = pa.GetPosition(), pb.GetPosition()
    placed = False
    # scan street heights between the two rows, then beyond
    cands = []
    for ymm in [y / 4.0 for y in range(400, 470)]:  # 100.0 .. 117.25 mm
        cands.append(ymm)
    for ymm in cands:
        ym = FromMM(ymm)
        pts = [a, VECTOR2I(a.x, ym), VECTOR2I(b.x, ym), b]
        if path_ok(pts, code):
            n = place(pts, net)
            print(netname, "routed via street y=%.2fmm (%d segs)" % (ymm, n))
            placed = True
            break
    if not placed:
        print(netname, "NO PATH FOUND in scan range")

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(BOARD, board)
print("refilled + saved")
