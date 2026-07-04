"""Add GND stitching vias into isolated GND pour islands.

For each GND zone fill fragment that is not the largest one on its layer,
scan interior grid points for a spot where a 0.6/0.3 via fits with clearance
on both layers and lands inside both that fragment and the other layer's
main pour. Place one via per island. Refill, save.
"""
import pcbnew
from pcbnew import FromMM, ToMM, VECTOR2I

BOARD = "oso75.kicad_pcb"
VIA_D = FromMM(0.6)
VIA_DRILL = FromMM(0.3)
CLR = FromMM(0.25)
LAYERS = (pcbnew.F_Cu, pcbnew.B_Cu)

board = pcbnew.LoadBoard(BOARD)
gnd = board.GetNetsByName()["GND"]
GCODE = gnd.GetNetCode()

zones = {}
for z in board.Zones():
    if not z.GetIsRuleArea() and z.GetNetname() == "GND":
        for l in LAYERS:
            if z.IsOnLayer(l):
                zones[l] = z

polys = {l: zones[l].GetFilledPolysList(l) for l in LAYERS}
main = {}
for l in LAYERS:
    areas = [(polys[l].Outline(i).Area(), i) for i in range(polys[l].OutlineCount())]
    areas.sort(reverse=True)
    main[l] = areas[0][1]
    print(pcbnew.LayerName(l), "fragments:", polys[l].OutlineCount())


def via_fits(pt):
    probe = pcbnew.SHAPE_SEGMENT(pt, pt, VIA_D)
    for t in board.GetTracks():
        if t.GetNetCode() == GCODE:
            continue
        for l in LAYERS:
            if t.IsOnLayer(l) and probe.Collide(t.GetEffectiveShape(l), CLR):
                return False
    for fp in board.GetFootprints():
        for p in fp.Pads():
            pth = p.GetAttribute() in (pcbnew.PAD_ATTRIB_PTH, pcbnew.PAD_ATTRIB_NPTH)
            if p.GetNetCode() == GCODE and p.GetAttribute() != pcbnew.PAD_ATTRIB_NPTH:
                continue
            for l in LAYERS:
                if (p.IsOnLayer(l) or pth) and probe.Collide(p.GetEffectiveShape(l), CLR):
                    return False
    # keep out of rule areas (antenna keepout forbids vias)
    for z in board.Zones():
        if z.GetIsRuleArea() and z.GetDoNotAllowVias():
            if z.Outline().Contains(pt):
                return False
    return True


added = 0
for l in LAYERS:
    other = LAYERS[1] if l == LAYERS[0] else LAYERS[0]
    for i in range(polys[l].OutlineCount()):
        if i == main[l]:
            continue
        ol = polys[l].Outline(i)
        bb = ol.BBox()
        placed = False
        step = FromMM(0.5)
        y = bb.GetTop() + step
        while y < bb.GetBottom() and not placed:
            x = bb.GetLeft() + step
            while x < bb.GetRight() and not placed:
                pt = VECTOR2I(x, y)
                if polys[l].Contains(pt, i) and \
                        polys[other].Contains(pt, main[other]) and via_fits(pt):
                    v = pcbnew.PCB_VIA(board)
                    v.SetPosition(pt)
                    v.SetWidth(VIA_D)
                    v.SetDrill(VIA_DRILL)
                    v.SetViaType(pcbnew.VIATYPE_THROUGH)
                    v.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
                    v.SetNet(gnd)
                    board.Add(v)
                    added += 1
                    placed = True
                    print("via at (%.2f, %.2f) for %s island %d" %
                          (ToMM(x), ToMM(y), pcbnew.LayerName(l), i))
                x += step
            y += step
        if not placed:
            print("NO SPOT for %s island %d (bbox %.1f x %.1f mm)" %
                  (pcbnew.LayerName(l), i,
                   ToMM(bb.GetWidth()), ToMM(bb.GetHeight())))

print("added", added, "stitching vias")
pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(BOARD, board)
print("refilled + saved")
