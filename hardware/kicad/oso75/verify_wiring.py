"""Electrical verification of oso75.kicad_pcb against the documented wiring:
  - every switch/diode connection in oso75_matrix_netlist.csv
  - every ROW/COL net lands on the correct physical ESP32-S3-WROOM-1U pad
    for the GPIO assigned in qmk keyboard.json
  - J3 module bay pads 1-10 carry the nets from oso75_circuit.md
  - bay signals reach the documented U1 GPIOs (I2C 41/42, MOD_A/B 39/40,
    MOD_INT 47, ESP_EN -> EN)
  - zero unconnected items in the routed board
"""
import csv, json, sys
import pcbnew

ROOT = "/Users/vamshikrishnaramasamy/CodeProjects/OSO Keyboard"
board = pcbnew.LoadBoard(f"{ROOT}/hardware/kicad/oso75/oso75.kicad_pcb")

# ref -> {pad_number: net_name}
pads = {}
for fp in board.GetFootprints():
    ref = fp.GetReference()
    pads.setdefault(ref, {})
    for p in fp.Pads():
        if p.GetNumber():
            pads[ref][p.GetNumber()] = p.GetNetname()

fails = []
ok = 0
def check(cond, msg):
    global ok
    if cond: ok += 1
    else: fails.append(msg)

# ---- 1. switch matrix: every connection in the CSV exists in copper
with open(f"{ROOT}/hardware/pcb/oso75_matrix_netlist.csv") as f:
    rows = list(csv.DictReader(f))
check(len(rows) == 82, f"expected 82 matrix entries, got {len(rows)}")
for r in rows:
    sw, d = pads.get(r["switch_ref"], {}), pads.get(r["diode_ref"], {})
    check(sw.get("1") == r["switch_pin_1"],
          f'{r["switch_ref"]} pad1 = {sw.get("1")} want {r["switch_pin_1"]}')
    check(sw.get("2") == r["switch_pin_2"],
          f'{r["switch_ref"]} pad2 = {sw.get("2")} want {r["switch_pin_2"]}')
    # diode: pad 2 = anode (matrix convention here), pad 1 = cathode
    dnets = set(d.values())
    check(r["diode_anode"] in dnets and r["diode_cathode"] in dnets,
          f'{r["diode_ref"]} nets {dnets} want {r["diode_anode"]}+{r["diode_cathode"]}')

# ---- 2. ROW/COL nets land on the right physical WROOM-1U pad
# ESP32-S3-WROOM-1(U) module pinout: pad number -> GPIO name
WROOM = {3:"EN",4:"GPIO4",5:"GPIO5",6:"GPIO6",7:"GPIO7",8:"GPIO15",9:"GPIO16",
         10:"GPIO17",11:"GPIO18",12:"GPIO8",13:"GPIO19",14:"GPIO20",15:"GPIO3",
         16:"GPIO46",17:"GPIO9",18:"GPIO10",19:"GPIO11",20:"GPIO12",21:"GPIO13",
         22:"GPIO14",23:"GPIO21",24:"GPIO47",25:"GPIO48",26:"GPIO45",27:"GPIO0",
         28:"GPIO35",29:"GPIO36",30:"GPIO37",31:"GPIO38",32:"GPIO39",33:"GPIO40",
         34:"GPIO41",35:"GPIO42",36:"GPIO44",37:"GPIO43",38:"GPIO2",39:"GPIO1"}
gpio_net = {WROOM[int(n)]: net for n, net in pads["U1"].items()
            if n.isdigit() and int(n) in WROOM}

kb = json.load(open(f"{ROOT}/qmk/keyboards/oso/oso75/keyboard.json"))
for i, g in enumerate(kb["matrix_pins"]["rows"]):
    check(gpio_net.get(g) == f"ROW{i}", f"U1 {g} = {gpio_net.get(g)} want ROW{i}")
for i, g in enumerate(kb["matrix_pins"]["cols"]):
    check(gpio_net.get(g) == f"COL{i}", f"U1 {g} = {gpio_net.get(g)} want COL{i}")

# ---- 3. J3 module bay pinout per oso75_circuit.md
J3_EXPECT = {1:"GND",2:"+3V3",3:"VBUS_FUSED",4:"I2C_SDA",5:"I2C_SCL",
             6:"MOD_A",7:"MOD_B",8:"MOD_INT",9:"ESP_EN",10:"GND"}
for n, want in J3_EXPECT.items():
    got = pads.get("J3", {}).get(str(n))
    check(got == want, f"J3 pad {n} = {got} want {want}")

# ---- 4. bay signals reach the documented ESP32 GPIOs
for g, want in [("GPIO41","I2C_SDA"),("GPIO42","I2C_SCL"),("GPIO39","MOD_A"),
                ("GPIO40","MOD_B"),("GPIO47","MOD_INT"),("EN","ESP_EN")]:
    check(gpio_net.get(g) == want, f"U1 {g} = {gpio_net.get(g)} want {want}")
# USB pins must NOT be in the matrix
for g in ("GPIO19", "GPIO20"):
    n = gpio_net.get(g, "")
    check(not n.startswith(("ROW","COL")), f"U1 {g} used by matrix net {n}")

# ---- 5. fully routed: no unconnected items
board.BuildConnectivity()
unrouted = board.GetConnectivity().GetUnconnectedCount(True)
check(unrouted == 0, f"{unrouted} unconnected items remain")

print(f"PASS {ok} checks" if not fails else f"{ok} ok, {len(fails)} FAILED:")
for m in fails:
    print("  FAIL:", m)
sys.exit(1 if fails else 0)
