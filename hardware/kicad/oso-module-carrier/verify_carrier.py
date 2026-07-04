"""Carrier board electrical + cross-board mating verification.

1. Carrier pads carry the documented nets (contacts, XIAO seat, Qwiic
   pinout, jumpers, passives).
2. MATING: each carrier bottom contact lands exactly on the keyboard's
   J3 pad with the same net function when the module is dropped into the
   bay (carrier center == J3 center, carrier x/y == keyboard canvas
   offset mirrored by J3's 180-degree placement).
3. Retention holes line up.
"""
import sys
import pcbnew

ROOT = "/Users/vamshikrishnaramasamy/CodeProjects/OSO Keyboard"
kb = pcbnew.LoadBoard(f"{ROOT}/hardware/kicad/oso75/oso75.kicad_pcb")
ca = pcbnew.LoadBoard(f"{ROOT}/hardware/kicad/oso-module-carrier/oso_module_carrier.kicad_pcb")

fails, ok = [], 0
def check(cond, msg):
    global ok
    if cond: ok += 1
    else: fails.append(msg)

def pads_of(board, ref):
    for fp in board.GetFootprints():
        if fp.GetReference() == ref:
            return fp
    return None

# ---- 1. carrier nets
EXPECT = {
    "MOD1": {str(i+1): n for i, n in enumerate(
        ["GND","+3V3","VBUS_FUSED","SDA_BAY","SCL_BAY","MOD_A","MOD_B",
         "MOD_INT","ESP_EN","GND"])},
    "U2": {"1":"MOD_A","2":"MOD_INT","3":"SDA_DEV","4":"SCL_DEV",
           "5":"SDA_BAY","6":"SCL_BAY","7":"MOD_B"},
    "U3": {"1":"XIAO_5V","2":"GND","3":"+3V3"},
    "J1": {"1":"GND","2":"+3V3","3":"SDA_DEV","4":"SCL_DEV"},
    "J2": {"1":"GND","2":"+3V3","3":"SDA_DEV","4":"SCL_DEV"},
    "J4": {"1":"+3V3","2":"GND","3":"MOD_A","4":"MOD_B"},
    "JP1": {"1":"SDA_BAY","2":"SDA_DEV"},
    "JP2": {"1":"SCL_BAY","2":"SCL_DEV"},
    "JP3": {"1":"VBUS_FUSED","2":"XIAO_5V"},
    "C1": {"1":"+3V3","2":"GND"}, "C2": {"1":"+3V3","2":"GND"},
    "R1": {"1":"MOD_INT","2":"GND"},
}
for ref, padmap in EXPECT.items():
    fp = pads_of(ca, ref)
    check(fp is not None, f"carrier missing {ref}")
    if not fp: continue
    for num, want in padmap.items():
        got = fp.FindPadByNumber(num).GetNetname()
        check(got == want, f"carrier {ref}.{num} = {got} want {want}")

# ---- 2. mating geometry: carrier local (x,y) + J3 center must equal the
# keyboard pad absolute position. J3 is placed rot 180, so keyboard pad
# offsets are the negation of footprint-local; the carrier was built with
# pad k at (-17.1 + 3.8k, -5.2) which must match exactly.
j3 = pads_of(kb, "J3")
mod1 = pads_of(ca, "MOD1")
c = j3.GetPosition()
NET_PAIR = {"SDA_BAY": "I2C_SDA", "SCL_BAY": "I2C_SCL"}  # renamed nets
for k in range(1, 11):
    kp = j3.FindPadByNumber(str(k))
    cp = mod1.FindPadByNumber(str(k))
    kx, ky = (kp.GetPosition().x - c.x) / 1e6, (kp.GetPosition().y - c.y) / 1e6
    cx, cy = cp.GetPosition().x / 1e6, cp.GetPosition().y / 1e6
    check(abs(kx - cx) < 0.01 and abs(ky - cy) < 0.01,
          f"pad {k} misaligned: keyboard offset ({kx:.2f},{ky:.2f}) vs carrier ({cx:.2f},{cy:.2f})")
    kn, cn = kp.GetNetname(), cp.GetNetname()
    check(NET_PAIR.get(cn, cn) == kn,
          f"pad {k} function mismatch: keyboard {kn} vs carrier {cn}")
    check(abs(kp.GetSize().x - cp.GetSize().x) < 1 and abs(kp.GetSize().y - cp.GetSize().y) < 1,
          f"pad {k} size mismatch")

# ---- 3. retention holes
knpth = sorted([(p.GetPosition().x - c.x) / 1e6 for p in j3.Pads()
                if p.GetAttribute() == pcbnew.PAD_ATTRIB_NPTH])
cnpth = sorted([p.GetPosition().x / 1e6 for p in mod1.Pads()
                if p.GetAttribute() == pcbnew.PAD_ATTRIB_NPTH])
check(len(knpth) == 2 and len(cnpth) == 2 and
      all(abs(a - b) < 0.01 for a, b in zip(knpth, cnpth)),
      f"retention holes mismatch: keyboard {knpth} vs carrier {cnpth}")

print(f"PASS {ok} checks" if not fails else f"{ok} ok, {len(fails)} FAILED:")
for m in fails:
    print("  FAIL:", m)
sys.exit(1 if fails else 0)
