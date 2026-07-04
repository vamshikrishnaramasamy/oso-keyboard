# OSO Module Carrier (XIAO + Qwiic)

The first OSO module: a 54 x 25 mm carrier for the OSO75 bay that makes
the whole Qwiic/STEMMA-QT ecosystem — and optionally a whole second
ESP32 — pluggable into the keyboard. DRC-clean, fully routed
(`fab/oso_module_carrier_gerbers.zip`).

Two personalities on one PCB:

| Mode | Fit | JP1/JP2 (I2C bridge) | JP3 (5 V) |
|---|---|---|---|
| Dumb Qwiic adapter (default) | no XIAO | bridged (factory default) | open |
| Smart module | XIAO ESP32-S3 in U2/U3 | **cut** | close to power XIAO from bay |

- **Dumb mode**: the keyboard's ESP32-S3 drives any Qwiic device plugged
  into J1/J2 over the bay I2C (GPIO41/42). Zero firmware on the module.
- **Smart mode**: the XIAO owns the Qwiic (device) bus on D2/D3 and talks
  to the keyboard over the bay (link) bus on D4/D5 as an I2C peripheral;
  MOD_INT (keyboard GPIO47 / XIAO D1) is the attention line. The XIAO's
  USB-C faces up through the bay for reflashing. MOD_A/B also land on
  D0/D6 as spare link lines.

## Parts

| Ref | Part |
|---|---|
| MOD1 | ten 2.2 x 5.0 bottom pads (3.8 mm pitch) at the keyboard J3 pad positions — solder **Mill-Max 0965-0-15-20-80-14-11-0** SMT spring pins here (2.79 mm extended, ~2.5 mm at rated mid-stroke, 2 A) |
| U2/U3 | 1x7 2.54 mm SMD socket strips (XIAO ESP32-S3 seat) |
| J1/J2 | JST SH 4-pin (SM04B-SRSS-TB) = Qwiic / STEMMA-QT |
| J4 | 1x4 pin header: 3V3 / GND / MOD_A / MOD_B (encoders, raw GPIO) |
| JP1/JP2 | solder jumpers: bay I2C <-> Qwiic bus (bridged by default) |
| JP3 | solder jumper: bay fused 5 V -> XIAO 5 V pin (open by default) |
| C1/C2 | 100 nF + 10 uF 0603 on 3V3 |
| R1 | 10 k 0603, MOD_INT -> GND (module-present strap) |

Retention: Ø3.6 NPTH at ±21 mm, matching the bay's holes. ESP_EN from
the bay lands on contact 9 (unrouted on the carrier by design).

**Polarization**: the back-left corner has a 5 mm chamfer and the case
plate's bay opening a matching 2.2 mm corner key — the module physically
cannot be inserted 180° rotated (which would land 5 V/EN on the I2C
contacts). Cross-board mating is machine-verified: every contact pad's
position, size and net function is checked against the keyboard's J3 by
`verify_carrier.py` (87 checks).

## Regenerating

`generate_carrier.py` (run under KiCad's bundled python) rebuilds
placement/nets/zones from scratch; route with
`java -jar tools/freerouting/freerouting.jar -de oso_module_carrier.dsn
-do oso_module_carrier.ses -mp 10` and apply with `import_ses.py`
(pcbnew's own SES import returns False headless on this machine).
Note: regenerating discards the routed tracks and the hand-placed GND
stitch at J2 — re-run the route + import steps after.

See `docs/oso-module-spec.md` for the full bay interface contract.
