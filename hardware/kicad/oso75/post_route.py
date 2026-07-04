"""Post-route step: import freerouting SES, add GND pours on both copper
layers, fill zones, save. Run with KiCad's bundled python3 (pcbnew).

Units note: pcbnew API is nanometers; use FromMM for all dimensions.
"""
import sys
import pcbnew

BOARD = "oso75.kicad_pcb"
SES = "oso75.ses"

board = pcbnew.LoadBoard(BOARD)

# 0. Freerouting rerouted the whole board from a stripped DSN, so drop the
#    old tracks before importing to avoid duplicate copper.
old = list(board.GetTracks())
for t in old:
    board.Remove(t)
print("Removed", len(old), "old tracks/vias")

# 1. Import autorouter session
ok = pcbnew.ImportSpecctraSES(board, SES)
print("SES import:", ok)
if not ok:
    sys.exit(1)

# 2. Add a GND pour on each copper layer covering the board bounding box,
#    unless fill zones already exist (rule areas don't count).
#    The zone is clipped to the Edge.Cuts outline at fill time.
bbox = board.GetBoardEdgesBoundingBox()
gnd = board.GetNetsByName()["GND"]

have_pours = any(not z.GetIsRuleArea() for z in board.Zones())
layers = () if have_pours else (pcbnew.F_Cu, pcbnew.B_Cu)
if have_pours:
    print("GND pours already present; skipping zone creation")
for layer in layers:
    zone = pcbnew.ZONE(board)
    zone.SetLayer(layer)
    zone.SetNet(gnd)
    outline = zone.Outline()
    outline.NewOutline()
    for x, y in (
        (bbox.GetLeft(), bbox.GetTop()),
        (bbox.GetRight(), bbox.GetTop()),
        (bbox.GetRight(), bbox.GetBottom()),
        (bbox.GetLeft(), bbox.GetBottom()),
    ):
        outline.Append(x, y)
    zone.SetLocalClearance(pcbnew.FromMM(0.3))
    zone.SetMinThickness(pcbnew.FromMM(0.25))
    zone.SetPadConnection(pcbnew.ZONE_CONNECTION_THERMAL)
    zone.SetThermalReliefGap(pcbnew.FromMM(0.5))
    zone.SetThermalReliefSpokeWidth(pcbnew.FromMM(0.5))
    zone.SetIsFilled(False)
    board.Add(zone)
    print("Added GND zone on", pcbnew.LayerName(layer))

# 3. Refill all zones (mandatory after any copper change)
filler = pcbnew.ZONE_FILLER(board)
filler.Fill(board.Zones())
print("Zones filled:", board.Zones().size() if hasattr(board.Zones(), 'size') else len(board.Zones()))

pcbnew.SaveBoard(BOARD, board)
print("Saved", BOARD)
