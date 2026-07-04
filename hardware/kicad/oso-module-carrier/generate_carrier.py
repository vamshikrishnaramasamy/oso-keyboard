#!/usr/bin/env python3
"""OSO module carrier: XIAO ESP32-S3 socket + 2x Qwiic, for the OSO75 bay.

One PCB, two personalities:
  - XIAO socket empty, JP1/JP2 bridged (default): dumb Qwiic adapter --
    the keyboard's ESP32-S3 drives Qwiic devices over the bay I2C.
  - XIAO fitted, JP1/JP2 cut: smart module -- the XIAO owns the Qwiic
    (device) bus on D2/D3 and talks to the keyboard over the bay (link)
    bus on D4/D5, MOD_INT (D1) as attention line. Close JP3 to power the
    XIAO from the bay's fused 5 V instead of its own USB-C.

Bottom side carries the ten 2.2x5.0 contact pads that mirror the
keyboard's J3 (pogo pins solder here), Ø3.6 retention holes at ±21 mm.
Run under KiCad's bundled python. Routing is done by freerouting
afterwards (see route_carrier.sh).
"""
import os
import pcbnew
from pcbnew import VECTOR2I, FromMM

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "oso_module_carrier.kicad_pcb")
LIBS = "/Applications/KiCad/KiCad.app/Contents/SharedSupport/footprints"

W, H = 54.0, 25.0          # board outline, fits the 54.6 x 25.6 bay opening
# Contact row at the keyboard's ACTUAL J3 pad positions (J3 sits rotated
# 180 on the keyboard, so its pad 1 lands at +17.1, +5.2 from bay center).
# Carrier local coords == keyboard canvas offsets when the module drops in.
CONTACT_Y = 5.2
CONTACT_X0, CONTACT_PITCH = 17.1, -3.8
CHAMFER = 5.0              # back-left polarizing chamfer; the plate opening
                           # carries a matching corner key so the module
                           # physically cannot be inserted 180 deg wrong

board = pcbnew.NewBoard(OUT)

def mm(x, y):
    return VECTOR2I(FromMM(x), FromMM(y))

# ------------------------------------------------------------------ nets
NET_NAMES = ["GND", "+3V3", "VBUS_FUSED", "SDA_BAY", "SCL_BAY", "SDA_DEV",
             "SCL_DEV", "MOD_A", "MOD_B", "MOD_INT", "ESP_EN", "XIAO_5V"]
nets = {}
for n in NET_NAMES:
    item = pcbnew.NETINFO_ITEM(board, n)
    board.Add(item)
    nets[n] = item

# ------------------------------------- outline (chamfered back-left corner)
for a, b in [((-W/2 + CHAMFER, -H/2), (W/2, -H/2)), ((W/2, -H/2), (W/2, H/2)),
             ((W/2, H/2), (-W/2, H/2)), ((-W/2, H/2), (-W/2, -H/2 + CHAMFER)),
             ((-W/2, -H/2 + CHAMFER), (-W/2 + CHAMFER, -H/2))]:
    seg = pcbnew.PCB_SHAPE(board)
    seg.SetShape(pcbnew.SHAPE_T_SEGMENT)
    seg.SetLayer(pcbnew.Edge_Cuts)
    seg.SetWidth(FromMM(0.1))
    seg.SetStart(mm(*a)); seg.SetEnd(mm(*b))
    board.Add(seg)

# --------------------------------- bottom contact pads + retention holes
mod = pcbnew.FOOTPRINT(board)
mod.SetReference("MOD1")
mod.SetValue("OSO_BAY_CONTACTS")
mod.SetPosition(mm(0, 0))
CONTACT_NETS = ["GND", "+3V3", "VBUS_FUSED", "SDA_BAY", "SCL_BAY",
                "MOD_A", "MOD_B", "MOD_INT", "ESP_EN", "GND"]
bset = pcbnew.LSET()
bset.AddLayer(pcbnew.B_Cu); bset.AddLayer(pcbnew.B_Mask)
for k in range(10):
    p = pcbnew.PAD(mod)
    p.SetNumber(str(k + 1))
    p.SetAttribute(pcbnew.PAD_ATTRIB_SMD)
    p.SetShape(pcbnew.PAD_SHAPE_ROUNDRECT)
    p.SetRoundRectRadiusRatio(0.15)
    p.SetSize(mm(2.2, 5.0))
    p.SetLayerSet(bset)
    p.SetLayer(pcbnew.B_Cu)
    p.SetPosition(mm(CONTACT_X0 + CONTACT_PITCH * k, CONTACT_Y))
    mod.Add(p)
for sx in (-21.0, 21.0):
    p = pcbnew.PAD(mod)
    p.SetNumber("")
    p.SetAttribute(pcbnew.PAD_ATTRIB_NPTH)
    p.SetShape(pcbnew.PAD_SHAPE_CIRCLE)
    p.SetSize(mm(3.6, 3.6))
    p.SetDrillSize(mm(3.6, 3.6))
    p.SetLayerSet(pcbnew.PAD.UnplatedHoleMask())
    p.SetPosition(mm(sx, 0))
    mod.Add(p)
board.Add(mod)
for k, nname in enumerate(CONTACT_NETS):
    mod.FindPadByNumber(str(k + 1)).SetNet(nets[nname])

# ------------------------------------------------------------- footprints
def place(lib, name, ref, x, y, rot, padnets):
    fp = pcbnew.FootprintLoad(os.path.join(LIBS, lib + ".pretty"), name)
    assert fp, f"footprint {lib}/{name} not found"
    fp.SetReference(ref)
    fp.SetPosition(mm(x, y))
    fp.SetOrientationDegrees(rot)
    board.Add(fp)
    for num, nname in padnets.items():
        pad = fp.FindPadByNumber(num)
        assert pad, f"{ref} has no pad {num}"
        pad.SetNet(nets[nname])
    return fp

# XIAO ESP32-S3 socket: two SMD 1x7 sockets, pin 1 at the back (y-),
# columns 17.78 mm apart. SMD-only pads stay clear of the bottom contacts.
XIAO_CX = 6.5
xl = place("Connector_PinSocket_2.54mm", "PinSocket_1x07_P2.54mm_Vertical_SMD_Pin1Left",
           "U2", XIAO_CX - 8.89, 0, 0,
           {"1": "MOD_A", "2": "MOD_INT", "3": "SDA_DEV", "4": "SCL_DEV",
            "5": "SDA_BAY", "6": "SCL_BAY", "7": "MOD_B"})
xr = place("Connector_PinSocket_2.54mm", "PinSocket_1x07_P2.54mm_Vertical_SMD_Pin1Right",
           "U3", XIAO_CX + 8.89, 0, 0,
           {"1": "XIAO_5V", "2": "GND", "3": "+3V3"})
# Qwiic / STEMMA-QT, openings toward the front edge
j1 = place("Connector_JST", "JST_SH_SM04B-SRSS-TB_1x04-1MP_P1.00mm_Horizontal",
           "J1", -19.0, 9.2, 0,
           {"1": "GND", "2": "+3V3", "3": "SDA_DEV", "4": "SCL_DEV"})
j2 = place("Connector_JST", "JST_SH_SM04B-SRSS-TB_1x04-1MP_P1.00mm_Horizontal",
           "J2", -9.5, 9.2, 0,
           {"1": "GND", "2": "+3V3", "3": "SDA_DEV", "4": "SCL_DEV"})
# encoder / raw GPIO breakout header
place("Connector_PinHeader_2.54mm", "PinHeader_1x04_P2.54mm_Vertical",
      "J4", 25.3, 2.2, 0,
      {"1": "+3V3", "2": "GND", "3": "MOD_A", "4": "MOD_B"})
# bus-ownership jumpers (bridged = dumb adapter), 5 V feed (open)
place("Jumper", "SolderJumper-2_P1.3mm_Bridged_Pad1.0x1.5mm", "JP1",
      -8.0, -10.5, 0, {"1": "SDA_BAY", "2": "SDA_DEV"})
place("Jumper", "SolderJumper-2_P1.3mm_Bridged_Pad1.0x1.5mm", "JP2",
      -12.5, -10.5, 0, {"1": "SCL_BAY", "2": "SCL_DEV"})
place("Jumper", "SolderJumper-2_P1.3mm_Open_Pad1.0x1.5mm", "JP3",
      23.0, -10.5, 0, {"1": "VBUS_FUSED", "2": "XIAO_5V"})
# decoupling + MOD_INT presence strap
place("Capacitor_SMD", "C_0603_1608Metric", "C1", -14.0, 1.5, 90,
      {"1": "+3V3", "2": "GND"})
place("Capacitor_SMD", "C_0603_1608Metric", "C2", -11.5, 1.5, 90,
      {"1": "+3V3", "2": "GND"})
place("Resistor_SMD", "R_0603_1608Metric", "R1", 10.0, -1.2, 90,
      {"1": "MOD_INT", "2": "GND"})

# No GND pours: freerouting routes GND as tracks (zones + thermal-spoke
# rules kept causing starved thermals / islands on this dense little board).

# ------------------------------------------------------------- net classes
ds = board.GetDesignSettings()
ds.m_TrackMinWidth = FromMM(0.2)
ds.m_ViasMinSize = FromMM(0.5)
ds.m_MinThroughDrill = FromMM(0.3)
nc = board.GetAllNetClasses()["Default"]
nc.SetTrackWidth(FromMM(0.25))
nc.SetViaDiameter(FromMM(0.6))
nc.SetViaDrill(FromMM(0.3))
nc.SetClearance(FromMM(0.15))

pcbnew.SaveBoard(OUT, board)
print(f"wrote {OUT}")
print(f"{len(board.GetPads())} pads, {len(NET_NAMES)} nets")
