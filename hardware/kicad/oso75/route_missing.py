"""Generic island-stitching router for broken nets after the SW72 move.

For each target net: build connected components of its copper items
(union-find over touching shapes), pick the closest endpoint pair between
two components, A*-route it on a local grid (2 layers + via moves), repeat
until one component remains. Refill zones, save. DRC verifies afterwards.
"""
import heapq
import math
import pcbnew
from pcbnew import FromMM, ToMM, VECTOR2I

BOARD = "oso75.kicad_pcb"
import sys
NETS = sys.argv[1:] or ["D72_A", "COL13", "ROW0", "COL15"]
STEP = 0.25
NODE_CLR = 0.36
VIA_CLR = 0.45
WIDTH = FromMM(0.2)
VIA_D = FromMM(0.6)
VIA_DRILL = FromMM(0.3)
MARGIN = float(__import__("os").environ.get("ROUTE_MARGIN", 8.0))
VIA_COST = 12.0
LAYERS = (pcbnew.B_Cu, pcbnew.F_Cu)

board = pcbnew.LoadBoard(BOARD)


def net_items(code):
    items = []
    for t in board.GetTracks():
        if t.GetNetCode() == code:
            items.append(t)
    for fp in board.GetFootprints():
        for p in fp.Pads():
            if p.GetNetCode() == code:
                items.append(p)
    return items


def item_points(it):
    """candidate connection points: (VECTOR2I, set-of-layers)"""
    if isinstance(it, pcbnew.PAD):
        if it.GetAttribute() == pcbnew.PAD_ATTRIB_PTH:
            return [(it.GetPosition(), set(LAYERS))]
        lay = pcbnew.F_Cu if it.IsOnLayer(pcbnew.F_Cu) else pcbnew.B_Cu
        return [(it.GetPosition(), {lay})]
    if it.GetClass() == "PCB_VIA":
        return [(it.GetPosition(), set(LAYERS))]
    return [(it.GetStart(), {it.GetLayer()}), (it.GetEnd(), {it.GetLayer()})]


def touching(a, b):
    for la in LAYERS:
        a_on = a.IsOnLayer(la) or (isinstance(a, pcbnew.PAD) and
                                   a.GetAttribute() == pcbnew.PAD_ATTRIB_PTH)
        b_on = b.IsOnLayer(la) or (isinstance(b, pcbnew.PAD) and
                                   b.GetAttribute() == pcbnew.PAD_ATTRIB_PTH)
        if a_on and b_on:
            if a.GetEffectiveShape(la).Collide(b.GetEffectiveShape(la), 0):
                return True
    return False


def components(items):
    parent = list(range(len(items)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if find(i) != find(j) and touching(items[i], items[j]):
                parent[find(i)] = find(j)
    comps = {}
    for i in range(len(items)):
        comps.setdefault(find(i), []).append(items[i])
    return list(comps.values())


def astar_route(net, p_from, layers_from, p_to, layers_to):
    code = net.GetNetCode()
    x0 = min(ToMM(p_from.x), ToMM(p_to.x)) - MARGIN
    x1 = max(ToMM(p_from.x), ToMM(p_to.x)) + MARGIN
    y0 = min(ToMM(p_from.y), ToMM(p_to.y)) - MARGIN
    y1 = max(ToMM(p_from.y), ToMM(p_to.y)) + MARGIN
    nx = int(round((x1 - x0) / STEP)) + 1
    ny = int(round((y1 - y0) / STEP)) + 1

    region = pcbnew.BOX2I(VECTOR2I(FromMM(x0 - 2), FromMM(y0 - 2)),
                          VECTOR2I(FromMM(x1 - x0 + 4), FromMM(y1 - y0 + 4)))

    def gather(layer):
        obs = []
        for t in board.GetTracks():
            if t.GetNetCode() != code and t.IsOnLayer(layer):
                s = t.GetEffectiveShape(layer)
                if s.BBox().Intersects(region):
                    obs.append(s)
        for fp in board.GetFootprints():
            for p in fp.Pads():
                pth = p.GetAttribute() in (pcbnew.PAD_ATTRIB_PTH,
                                           pcbnew.PAD_ATTRIB_NPTH)
                if p.GetNetCode() == code and \
                        p.GetAttribute() != pcbnew.PAD_ATTRIB_NPTH:
                    continue
                if p.IsOnLayer(layer) or pth:
                    s = p.GetEffectiveShape(layer)
                    if s.BBox().Intersects(region):
                        obs.append(s)
        return obs

    BIN = 2.0
    binned = {}
    for l in LAYERS:
        d = {}
        for s in gather(l):
            bb = s.BBox()
            bx0 = int((ToMM(bb.GetLeft()) - x0) // BIN)
            bx1 = int((ToMM(bb.GetRight()) - x0) // BIN)
            by0 = int((ToMM(bb.GetTop()) - y0) // BIN)
            by1 = int((ToMM(bb.GetBottom()) - y0) // BIN)
            for bx in range(bx0 - 1, bx1 + 2):
                for by in range(by0 - 1, by1 + 2):
                    d.setdefault((bx, by), []).append(s)
        binned[l] = d

    def node_free(i, j, layer, clr):
        x, y = x0 + i * STEP, y0 + j * STEP
        pt = VECTOR2I(FromMM(x), FromMM(y))
        probe = pcbnew.SHAPE_SEGMENT(pt, pt, WIDTH)
        key = (int((x - x0) // BIN), int((y - y0) // BIN))
        for s in binned[layer].get(key, ()):
            if probe.Collide(s, FromMM(clr)):
                return False
        return True

    free = {}
    for l in LAYERS:
        fm = bytearray(nx * ny)
        for i in range(nx):
            for j in range(ny):
                if node_free(i, j, l, NODE_CLR):
                    fm[i * ny + j] = 1
        free[l] = fm

    LIDX = {pcbnew.B_Cu: 0, pcbnew.F_Cu: 1}
    LREV = {0: pcbnew.B_Cu, 1: pcbnew.F_Cu}
    ai = int(round((ToMM(p_from.x) - x0) / STEP))
    aj = int(round((ToMM(p_from.y) - y0) / STEP))
    bi = int(round((ToMM(p_to.x) - x0) / STEP))
    bj = int(round((ToMM(p_to.y) - y0) / STEP))

    def h(i, j):
        return math.hypot(i - bi, j - bj)

    DIRS = [(1, 0, 1.0), (-1, 0, 1.0), (0, 1, 1.0), (0, -1, 1.0),
            (1, 1, 1.42), (-1, 1, 1.42), (1, -1, 1.42), (-1, -1, 1.42)]

    openq, g, came = [], {}, {}
    for l in layers_from:
        st = (LIDX[l], ai, aj)
        g[st] = 0.0
        heapq.heappush(openq, (h(ai, aj), st))
    goal = {(LIDX[l], bi, bj) for l in layers_to}

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
            if not (0 <= ni < nx and 0 <= nj < ny):
                continue
            if not free[layer][ni * ny + nj]:
                continue
            ns = (li, ni, nj)
            ng = base + cost
            if ng < g.get(ns, 1e18):
                g[ns] = ng
                came[ns] = st
                heapq.heappush(openq, (ng + h(ni, nj), ns))
        ol = 1 - li
        other = LREV[ol]
        if free[other][ci * ny + cj] and node_free(ci, cj, layer, VIA_CLR) \
                and node_free(ci, cj, other, VIA_CLR):
            ns = (ol, ci, cj)
            ng = base + VIA_COST
            if ng < g.get(ns, 1e18):
                g[ns] = ng
                came[ns] = st
                heapq.heappush(openq, (ng + h(ci, cj), ns))

    if not found:
        print("  [debug] grid %dx%d, free F=%d B=%d, start=%s goal=%s, explored=%d"
              % (nx, ny, sum(free[pcbnew.F_Cu]), sum(free[pcbnew.B_Cu]),
                 [(LIDX[l], ai, aj, bool(free[l][ai * ny + aj])) for l in layers_from],
                 [(LIDX[l], bi, bj, bool(free[l][bi * ny + bj])) for l in layers_to],
                 len(g)))
        return None

    path = [found]
    while path[-1] in came:
        path.append(came[path[-1]])
    path.reverse()

    def node_pt(st):
        return VECTOR2I(FromMM(x0 + st[1] * STEP), FromMM(y0 + st[2] * STEP))

    def simplify(states):
        out = [states[0]]
        for k in range(1, len(states) - 1):
            dx0, dy0 = states[k][1] - states[k - 1][1], states[k][2] - states[k - 1][2]
            dx1, dy1 = states[k + 1][1] - states[k][1], states[k + 1][2] - states[k][2]
            if (dx0, dy0) != (dx1, dy1):
                out.append(states[k])
        if len(states) > 1:
            out.append(states[-1])
        return out

    new_items = []
    cur = path[0][0]
    run = [path[0]]
    events = []
    for st in path[1:]:
        if st[0] != cur:
            events.append((cur, run))
            events.append(("via", st))
            cur = st[0]
            run = [st]
        else:
            run.append(st)
    events.append((cur, run))

    first_layer = LREV[path[0][0]]
    last_layer = LREV[path[-1][0]]
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
            new_items.append(v)
            continue
        lidx, states = ev
        states = simplify(states)
        for k in range(len(states) - 1):
            t = pcbnew.PCB_TRACK(board)
            t.SetStart(node_pt(states[k]))
            t.SetEnd(node_pt(states[k + 1]))
            t.SetWidth(WIDTH)
            t.SetLayer(LREV[lidx])
            t.SetNet(net)
            board.Add(t)
            new_items.append(t)

    # stitch exact endpoints to snapped grid nodes
    for exact, gridpt, layer in ((p_from, node_pt(path[0]), first_layer),
                                 (p_to, node_pt(path[-1]), last_layer)):
        if exact != gridpt:
            t = pcbnew.PCB_TRACK(board)
            t.SetStart(exact)
            t.SetEnd(gridpt)
            t.SetWidth(WIDTH)
            t.SetLayer(layer)
            t.SetNet(net)
            board.Add(t)
            new_items.append(t)
    return new_items


for netname in NETS:
    net = board.GetNetsByName()[netname]
    code = net.GetNetCode()
    for _round in range(6):
        comps = components(net_items(code))
        if len(comps) <= 1:
            print(netname, "fully connected (%d items)" % len(net_items(code)))
            break
        # candidate pairs between components, nearest first; try several
        pairs = []
        for a in range(len(comps)):
            for b in range(a + 1, len(comps)):
                for ia in comps[a]:
                    for pa, la in item_points(ia):
                        for ib in comps[b]:
                            for pb, lb in item_points(ib):
                                d = math.hypot(pa.x - pb.x, pa.y - pb.y)
                                pairs.append((d, pa, la, pb, lb))
        pairs.sort(key=lambda t: t[0])
        print(netname, "%d comps; %.2fmm closest gap" % (len(comps), pairs[0][0] / 1e6))
        res = None
        for d, pa, la, pb, lb in pairs[:12]:
            res = astar_route(net, pa, la, pb, lb)
            if res is not None:
                print(netname, "placed", len(res), "items (pair gap %.2fmm)" % (d / 1e6))
                break
        if res is None:
            print(netname, "A* FAILED for all candidate pairs")
            break
    else:
        print(netname, "WARNING: still split after 6 rounds")

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(BOARD, board)
print("refilled + saved")
