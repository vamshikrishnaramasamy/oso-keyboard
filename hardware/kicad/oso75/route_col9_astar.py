"""Grid A* router (2 layers + vias) for the last COL9 link SW21-1 -> SW8-1.

Builds a 0.25 mm grid over the corridor, marks blocked nodes per copper layer
using pcbnew's collision engine (with bbox spatial binning), then A*-searches
8-connected moves plus layer-change (via) moves. Places tracks/vias, refills
zones, saves. DRC afterwards is the real verification gate.
"""
import heapq
import pcbnew
from pcbnew import FromMM, ToMM, VECTOR2I

BOARD = "oso75.kicad_pcb"
NET = "COL9"
STEP = 0.25          # grid step mm
NODE_CLR = 0.36      # node-free test clearance mm (0.22 rule + half-step slack)
VIA_CLR = 0.45       # extra margin for via nodes
X0, X1 = 187.0, 237.0
Y0, Y1 = 93.0, 132.0
WIDTH = FromMM(0.2)
VIA_D = FromMM(0.6)
VIA_DRILL = FromMM(0.3)

board = pcbnew.LoadBoard(BOARD)
net = board.GetNetsByName()[NET]
CODE = net.GetNetCode()
LAYERS = (pcbnew.B_Cu, pcbnew.F_Cu)

NX = int(round((X1 - X0) / STEP)) + 1
NY = int(round((Y1 - Y0) / STEP)) + 1


def to_xy(i, j):
    return X0 + i * STEP, Y0 + j * STEP


# ---- collect obstacles intersecting the region, per layer ----
region = pcbnew.BOX2I(VECTOR2I(FromMM(X0 - 2), FromMM(Y0 - 2)),
                      VECTOR2I(FromMM(X1 - X0 + 4), FromMM(Y1 - Y0 + 4)))

def gather(layer):
    obs = []
    for t in board.GetTracks():
        if t.GetNetCode() != CODE and t.IsOnLayer(layer):
            s = t.GetEffectiveShape(layer)
            if s.BBox().Intersects(region):
                obs.append(s)
    for fp in board.GetFootprints():
        for p in fp.Pads():
            pth = p.GetAttribute() in (pcbnew.PAD_ATTRIB_PTH, pcbnew.PAD_ATTRIB_NPTH)
            if p.GetNetCode() == CODE and p.GetAttribute() != pcbnew.PAD_ATTRIB_NPTH:
                continue
            if p.IsOnLayer(layer) or pth:
                s = p.GetEffectiveShape(layer)
                if s.BBox().Intersects(region):
                    obs.append(s)
    return obs

OBS = {l: gather(l) for l in LAYERS}
print("region obstacles:", {pcbnew.LayerName(l): len(o) for l, o in OBS.items()})

# spatial bins (2 mm cells) for speed
BIN = 2.0
def bins_for(bb):
    x0 = int((ToMM(bb.GetLeft()) - X0) // BIN); x1 = int((ToMM(bb.GetRight()) - X0) // BIN)
    y0 = int((ToMM(bb.GetTop()) - Y0) // BIN); y1 = int((ToMM(bb.GetBottom()) - Y0) // BIN)
    for bx in range(x0 - 1, x1 + 2):
        for by in range(y0 - 1, y1 + 2):
            yield (bx, by)

BINNED = {}
for l in LAYERS:
    d = {}
    for s in OBS[l]:
        for key in bins_for(s.BBox()):
            d.setdefault(key, []).append(s)
    BINNED[l] = d


def node_free(i, j, layer, clr):
    x, y = to_xy(i, j)
    pt = VECTOR2I(FromMM(x), FromMM(y))
    probe = pcbnew.SHAPE_SEGMENT(pt, pt, WIDTH)
    key = (int((x - X0) // BIN), int((y - Y0) // BIN))
    for s in BINNED[layer].get(key, ()):
        if probe.Collide(s, FromMM(clr)):
            return False
    return True


# precompute free maps
free = {}
for l in LAYERS:
    fm = bytearray(NX * NY)
    for i in range(NX):
        for j in range(NY):
            if node_free(i, j, l, NODE_CLR):
                fm[i * NY + j] = 1
    free[l] = fm
    print(pcbnew.LayerName(l), "free nodes:", sum(fm), "/", NX * NY)


def pth_pad(ref):
    fp = board.FindFootprintByReference(ref)
    for p in fp.Pads():
        if p.GetNetname() == NET and p.GetAttribute() == pcbnew.PAD_ATTRIB_PTH:
            return p

pa, pb = pth_pad("SW21"), pth_pad("SW8")
A = pa.GetPosition(); B = pb.GetPosition()
ai = int(round((ToMM(A.x) - X0) / STEP)); aj = int(round((ToMM(A.y) - Y0) / STEP))
bi = int(round((ToMM(B.x) - X0) / STEP)); bj = int(round((ToMM(B.y) - Y0) / STEP))
print("start", ai, aj, "goal", bi, bj)

# free the start/goal neighborhoods (pad itself is same net; its hole blocks
# the exact node via the PTH hole shape on the other-net check? no - same net
# pads were excluded, so nodes here should be free already)

DIRS = [(1, 0, 1.0), (-1, 0, 1.0), (0, 1, 1.0), (0, -1, 1.0),
        (1, 1, 1.42), (-1, 1, 1.42), (1, -1, 1.42), (-1, -1, 1.42)]
VIA_COST = 12.0

LIDX = {pcbnew.B_Cu: 0, pcbnew.F_Cu: 1}
LREV = {0: pcbnew.B_Cu, 1: pcbnew.F_Cu}

def h(i, j):
    return abs(i - bi) + abs(j - bj)

start_states = [(0, ai, aj), (1, ai, aj)]
goal = {(0, bi, bj), (1, bi, bj)}

openq = []
g = {}
came = {}
for st in start_states:
    g[st] = 0.0
    heapq.heappush(openq, (h(ai, aj), st))

found = None
while openq:
    f, st = heapq.heappop(openq)
    if st in goal:
        found = st
        break
    li, ci, cj = st
    layer = LREV[li]
    base = g[st]
    if base + h(ci, cj) < f - 1e-9:
        continue
    for di, dj, cost in DIRS:
        ni, nj = ci + di, cj + dj
        if not (0 <= ni < NX and 0 <= nj < NY):
            continue
        if not free[layer][ni * NY + nj]:
            continue
        ns = (li, ni, nj)
        ng = base + cost
        if ng < g.get(ns, 1e18):
            g[ns] = ng
            came[ns] = st
            heapq.heappush(openq, (ng + h(ni, nj), ns))
    # via move
    ol = 1 - li
    other = LREV[ol]
    if free[other][ci * NY + cj] and node_free(ci, cj, layer, VIA_CLR) \
            and node_free(ci, cj, other, VIA_CLR):
        ns = (ol, ci, cj)
        ng = base + VIA_COST
        if ng < g.get(ns, 1e18):
            g[ns] = ng
            came[ns] = st
            heapq.heappush(openq, (ng + h(ci, cj), ns))

if not found:
    print("NO PATH (A*)")
    raise SystemExit(1)

# reconstruct
path = [found]
while path[-1] in came:
    path.append(came[path[-1]])
path.reverse()
print("path nodes:", len(path), "cost", round(g[found], 1))

# split into per-layer polylines with via positions
events = []  # (layer, [pts...]) and ('via', pt)
cur_layer = path[0][0]
pts = [path[0]]
for st in path[1:]:
    if st[0] != cur_layer:
        events.append((cur_layer, pts))
        events.append(("via", st))
        cur_layer = st[0]
        pts = [st]
    else:
        pts.append(st)
events.append((cur_layer, pts))


def node_pt(st):
    x, y = to_xy(st[1], st[2])
    return VECTOR2I(FromMM(x), FromMM(y))

# simplify collinear points
def simplify(states):
    out = [states[0]]
    for k in range(1, len(states) - 1):
        x0, y0 = states[k - 1][1], states[k - 1][2]
        x1, y1 = states[k][1], states[k][2]
        x2, y2 = states[k + 1][1], states[k + 1][2]
        if (x1 - x0, y1 - y0) != (x2 - x1, y2 - y1):
            out.append(states[k])
    if len(states) > 1:
        out.append(states[-1])
    return out

added = 0
last_end = None
first_pt = None
for ev in events:
    if ev[0] == "via":
        v = pcbnew.PCB_VIA(board)
        v.SetPosition(node_pt(ev[1]))
        v.SetWidth(VIA_D)
        v.SetDrill(VIA_DRILL)
        v.SetViaType(pcbnew.VIATYPE_THROUGH)
        v.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
        v.SetNet(net)
        board.Add(v)
        added += 1
        continue
    layer, states = ev
    states = simplify(states)
    for k in range(len(states) - 1):
        t = pcbnew.PCB_TRACK(board)
        t.SetStart(node_pt(states[k]))
        t.SetEnd(node_pt(states[k + 1]))
        t.SetWidth(WIDTH)
        t.SetLayer(LREV[layer])
        t.SetNet(net)
        board.Add(t)
        added += 1
    if first_pt is None:
        first_pt = node_pt(states[0])
    last_end = (node_pt(states[-1]), LREV[layer])

# stitch exact pad centers to snapped grid endpoints
for pad, gridpt, layer in ((pa, first_pt, LREV[path[0][0]]),
                           (pb, last_end[0], last_end[1])):
    if pad.GetPosition() != gridpt:
        t = pcbnew.PCB_TRACK(board)
        t.SetStart(pad.GetPosition())
        t.SetEnd(gridpt)
        t.SetWidth(WIDTH)
        t.SetLayer(layer)
        t.SetNet(net)
        board.Add(t)
        added += 1

print("placed", added, "items")
pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(BOARD, board)
print("refilled + saved")
