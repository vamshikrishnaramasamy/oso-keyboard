"""Widen power-net tracks to 0.4 mm; revert segments listed in a DRC report.

Usage:
  widen_power.py           -> widen all power segments, refill, save
  widen_power.py revert drc.json  -> shrink violating power segments back to 0.2
"""
import json
import sys
import pcbnew

POWER = {"GND", "+3V3", "VBUS", "VBUS_FUSED"}
WIDE = pcbnew.FromMM(0.4)
NARROW = pcbnew.FromMM(0.2)

board = pcbnew.LoadBoard("oso75.kicad_pcb")

if len(sys.argv) > 2 and sys.argv[1] == "revert":
    with open(sys.argv[2]) as f:
        rpt = json.load(f)
    coords = []
    for v in rpt.get("violations", []):
        for it in v.get("items", []):
            p = it.get("pos")
            if p:
                coords.append((pcbnew.FromMM(p["x"]), pcbnew.FromMM(p["y"])))
    tol = pcbnew.FromMM(1.5)
    n = 0
    for t in board.GetTracks():
        if t.GetClass() == "PCB_TRACK" and t.GetNetname() in POWER and t.GetWidth() == WIDE:
            for cx, cy in coords:
                s, e = t.GetStart(), t.GetEnd()
                if (min(abs(s.x - cx), abs(e.x - cx)) < tol and
                        min(abs(s.y - cy), abs(e.y - cy)) < tol):
                    t.SetWidth(NARROW)
                    n += 1
                    break
    print("reverted", n, "segments to 0.2mm")
else:
    n = 0
    for t in board.GetTracks():
        if t.GetClass() == "PCB_TRACK" and t.GetNetname() in POWER:
            t.SetWidth(WIDE)
            n += 1
    print("widened", n, "power segments to 0.4mm")

pcbnew.ZONE_FILLER(board).Fill(board.Zones())
pcbnew.SaveBoard("oso75.kicad_pcb", board)
print("refilled + saved")
