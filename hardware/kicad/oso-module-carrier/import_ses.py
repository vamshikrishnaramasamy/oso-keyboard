#!/usr/bin/env python3
"""Apply freerouting's .ses wires/vias to the carrier board directly.

pcbnew.ImportSpecctraSES returns False under headless KiCad on this
machine, so this parses the (network_out ...) section itself.
SES units: 10000 per mm; SES y axis is negated relative to pcbnew.
"""
import os, re
import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
PCB = os.path.join(HERE, "oso_module_carrier.kicad_pcb")
SES = os.path.join(HERE, "oso_module_carrier.ses")
SCALE = 10000.0

board = pcbnew.LoadBoard(PCB)
nets = board.GetNetsByName()
layers = {"F.Cu": pcbnew.F_Cu, "B.Cu": pcbnew.B_Cu}

text = open(SES).read()
routes = text[text.index("(network_out"):]

def to_iu(xs, ys):
    return pcbnew.VECTOR2I(pcbnew.FromMM(float(xs) / SCALE),
                           pcbnew.FromMM(-float(ys) / SCALE))

n_tracks = n_vias = 0
for m in re.finditer(r'\(net "([^"]+)"((?:.(?!\(net "))*)', routes, re.S):
    netname, body = m.group(1), m.group(2)
    net = nets[netname]
    for w in re.finditer(r"\(path (\S+) (\d+)\s+([-\d\s]+?)\)", body):
        layer, width, coords = w.group(1), int(w.group(2)), w.group(3).split()
        pts = [to_iu(coords[i], coords[i + 1]) for i in range(0, len(coords), 2)]
        for a, b in zip(pts, pts[1:]):
            t = pcbnew.PCB_TRACK(board)
            t.SetStart(a); t.SetEnd(b)
            t.SetWidth(pcbnew.FromMM(width / SCALE))
            t.SetLayer(layers[layer])
            t.SetNet(net)
            board.Add(t)
            n_tracks += 1
    for v in re.finditer(r'\(via "[^"]*" (-?\d+) (-?\d+)', body):
        via = pcbnew.PCB_VIA(board)
        via.SetPosition(to_iu(v.group(1), v.group(2)))
        via.SetWidth(pcbnew.FromMM(0.6))
        via.SetDrill(pcbnew.FromMM(0.3))
        via.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
        via.SetNet(net)
        board.Add(via)
        n_vias += 1

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard(PCB, board)
print(f"added {n_tracks} track segments, {n_vias} vias; zones refilled")
