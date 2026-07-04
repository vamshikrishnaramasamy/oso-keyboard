# OSO75 current PCB extracted review pack

Generated from actual `hardware/kicad/oso75/oso75.kicad_pcb` after Oracle fixes. Units mm.

## DRC summary

KiCad 10.0.3; violations 276; unconnected 0.

```json
{
  "via_dangling": 2,
  "courtyards_overlap": 2,
  "npth_inside_courtyard": 2,
  "pth_inside_courtyard": 1,
  "silk_edge_clearance": 2,
  "lib_footprint_issues": 184,
  "lib_footprint_mismatch": 1,
  "silk_over_copper": 82
}
```

## Board-critical footprints

### C1 10uF OSO75:C_0603 at 152.5,144.5 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2

### C2 10uF OSO75:C_0603 at 141.5,144.5 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 

### C3 100nF OSO75:C_0603 at 178,130.5 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2

### C4 100nF OSO75:C_0603 at 181,142.5 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2

### F1 500mA OSO75:Polyfuse_1206 at 117,138 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS_FUSED; zone_connect 

### J1 USB_C_HRO_TYPE-C-31-M-12 Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12 at 168.54,147.66 rot 0
- pad A1: at -3.25 -4.045; size 0.6 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2
- pad A4: at -2.45 -4.045; size 0.6 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS; zone_connect 
- pad A5: at -1.25 -4.045; size 0.3 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_CC1; zone_connect 
- pad A6: at -0.25 -4.045; size 0.3 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DP_CONN; zone_connect 
- pad A7: at 0.25 -4.045; size 0.3 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DM_CONN; zone_connect 
- pad A8: at 1.25 -4.045; size 0.3 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad A9: at 2.45 -4.045; size 0.6 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS; zone_connect 
- pad A12: at 3.25 -4.045; size 0.6 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2
- pad B1: at 3.25 -4.045; size 0.6 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2
- pad B4: at 2.45 -4.045; size 0.6 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS; zone_connect 
- pad B5: at 1.75 -4.045; size 0.3 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_CC2; zone_connect 
- pad B6: at 0.75 -4.045; size 0.3 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DP_CONN; zone_connect 
- pad B7: at -0.75 -4.045; size 0.3 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DM_CONN; zone_connect 
- pad B8: at -1.75 -4.045; size 0.3 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad B9: at -2.45 -4.045; size 0.6 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS; zone_connect 
- pad B12: at -3.25 -4.045; size 0.6 1.45; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2
- pad SH: at -4.32 -3.13; size 1 2.1; drill oval 0.6 1.7; layers "*.Cu" "*.Mask"; net GND; zone_connect 2
- pad SH: at -4.32 1.05; size 1 1.6; drill oval 0.6 1.2; layers "*.Cu" "*.Mask"; net GND; zone_connect 2
- pad SH: at 4.32 -3.13; size 1 2.1; drill oval 0.6 1.7; layers "*.Cu" "*.Mask"; net GND; zone_connect 2
- pad SH: at 4.32 1.05; size 1 1.6; drill oval 0.6 1.2; layers "*.Cu" "*.Mask"; net GND; zone_connect 2

### J3 OSO_Module_Bay_10 OSO75:OSO_Module_Bay_10 at 38,119.563 rot 0
- pad 1: at -17.1 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 
- pad 2: at -13.3 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 
- pad 3: at -9.5 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS_FUSED; zone_connect 
- pad 4: at -5.7 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net I2C_SDA; zone_connect 
- pad 5: at -1.9 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net I2C_SCL; zone_connect 
- pad 6: at 1.9 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net MOD_A; zone_connect 
- pad 7: at 5.7 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net MOD_B; zone_connect 
- pad 8: at 9.5 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net MOD_INT; zone_connect 
- pad 9: at 13.3 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ESP_EN; zone_connect 
- pad 10: at 17.1 -5.2; size 2.2 5; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 

### R1 5.1k OSO75:R_0603 at 179.5,147 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_CC1; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 

### R2 5.1k OSO75:R_0603 at 179.5,144 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_CC2; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 

### R3 27R OSO75:R_0603 at 157.5,145 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DP_CONN; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DP; zone_connect 

### R4 27R OSO75:R_0603 at 157.5,141.5 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DM_CONN; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DM; zone_connect 

### R5 10k OSO75:R_0603 at 124.5,138 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ESP_EN; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 

### R6 10k OSO75:R_0603 at 131.5,138 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net BOOT_IO0; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 

### R10 10k OSO75:R_0603 at 109.5,138 rot 0
- pad 1: at -0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net MOD_INT; zone_connect 
- pad 2: at 0.8 0; size 0.8 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 

### SW_BOOT BOOT OSO75:SW_Tactile_4x3 at 101.5,138 rot 0
- pad 1: at -1.7 0; size 1.2 1.7; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net BOOT_IO0; zone_connect 
- pad 2: at 1.7 0; size 1.2 1.7; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 

### SW_RESET RESET OSO75:SW_Tactile_4x3 at 93.5,138 rot 0
- pad 1: at -1.7 0; size 1.2 1.7; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ESP_EN; zone_connect 
- pad 2: at 1.7 0; size 1.2 1.7; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 

### U1 ESP32-S3-WROOM-1-N16 RF_Module:ESP32-S3-WROOM-1 at 196,138.8 rot -90
- pad 1: at -8.75 -5.26 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2
- pad 2: at -8.75 -3.99 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 
- pad 3: at -8.75 -2.72 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ESP_EN; zone_connect 
- pad 4: at -8.75 -1.45 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ROW2; zone_connect 
- pad 5: at -8.75 -0.18 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ROW3; zone_connect 
- pad 6: at -8.75 1.09 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ROW4; zone_connect 
- pad 7: at -8.75 2.36 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ROW5; zone_connect 
- pad 8: at -8.75 3.63 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL7; zone_connect 
- pad 9: at -8.75 4.9 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL8; zone_connect 
- pad 10: at -8.75 6.17 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL9; zone_connect 
- pad 11: at -8.75 7.44 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL10; zone_connect 
- pad 12: at -8.75 8.71 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL0; zone_connect 
- pad 13: at -8.75 9.98 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DM; zone_connect 
- pad 14: at -8.75 11.25 90; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net USB_DP; zone_connect 
- pad 15: at -6.985 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad 16: at -5.715 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad 17: at -4.445 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL1; zone_connect 
- pad 18: at -3.175 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL2; zone_connect 
- pad 19: at -1.905 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL3; zone_connect 
- pad 20: at -0.635 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL4; zone_connect 
- pad 21: at 0.635 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL5; zone_connect 
- pad 22: at 1.905 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL6; zone_connect 
- pad 23: at 3.175 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL11; zone_connect 
- pad 24: at 4.445 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net MOD_INT; zone_connect 
- pad 25: at 5.715 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad 26: at 6.985 12.5 180; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad 27: at 8.75 11.25 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net BOOT_IO0; zone_connect 
- pad 28: at 8.75 9.98 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL12; zone_connect 
- pad 29: at 8.75 8.71 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL13; zone_connect 
- pad 30: at 8.75 7.44 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL14; zone_connect 
- pad 31: at 8.75 6.17 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net COL15; zone_connect 
- pad 32: at 8.75 4.9 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net MOD_A; zone_connect 
- pad 33: at 8.75 3.63 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net MOD_B; zone_connect 
- pad 34: at 8.75 2.36 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net I2C_SDA; zone_connect 
- pad 35: at 8.75 1.09 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net I2C_SCL; zone_connect 
- pad 36: at 8.75 -0.18 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad 37: at 8.75 -1.45 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad 38: at 8.75 -2.72 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ROW1; zone_connect 
- pad 39: at 8.75 -3.99 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ROW0; zone_connect 
- pad 40: at 8.75 -5.26 270; size 1.5 0.9; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 
- pad 41: at -2.9 1.76; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -2.9 3.16 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -2.2 1.06 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -2.2 2.46 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -2.2 3.86 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -1.5 1.76 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -1.5 2.46 180; size 3.9 3.9; drill ; layers "F.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -1.5 3.16 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -0.8 1.06 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -0.8 2.46 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -0.8 3.86 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -0.1 1.76 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2
- pad 41: at -0.1 3.16 270; size 0.6 0.6; drill 0.3; layers "*.Cu" "F.Mask"; net GND; zone_connect 2

### U3 AP2112K-3.3 OSO75:SOT-23-5_LDO at 147,144.5 rot 0
- pad 1: at -1.1 -0.95; size 0.65 0.55; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS; zone_connect 
- pad 2: at -1.1 0; size 0.65 0.55; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net GND; zone_connect 2
- pad 3: at -1.1 0.95; size 0.65 0.55; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net VBUS; zone_connect 
- pad 4: at 1.1 0.95; size 0.65 0.55; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net ; zone_connect 
- pad 5: at 1.1 -0.95; size 0.65 0.55; drill ; layers "F.Cu" "F.Mask" "F.Paste"; net +3V3; zone_connect 

## All footprints placement list

```csv
ref,value,footprint,x,y,rot
D12,1N4148W,OSO75:D_SOD-123_Keyboard,25.025,101.225,0
C3,100nF,OSO75:C_0603,178,130.5,0
SW12,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,18.525,94.725,180
SW68,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,139.969,18.525,180
SW74,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,318.563,94.725,180
SW22,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,209.025,94.725,180
SW37,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,237.6,75.675,180
SW60,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,175.688,37.575,180
SW38,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,256.65,75.675,180
D75,1N4148W,OSO75:D_SOD-123_Keyboard,306.012,82.175,0
D28,1N4148W,OSO75:D_SOD-123_Keyboard,72.65,82.175,0
SW_RESET,RESET,OSO75:SW_Tactile_4x3,93.5,138,0
D14,1N4148W,OSO75:D_SOD-123_Keyboard,63.125,101.225,0
SW53,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,30.431,37.575,180
SW17,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,113.775,94.725,180
SW44,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,109.013,56.625,180
SW82,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,318.563,18.525,180
D25,1N4148W,OSO75:D_SOD-123_Keyboard,282.2,101.225,0
D65,1N4148W,OSO75:D_SOD-123_Keyboard,27.406,25.025,0
D37,1N4148W,OSO75:D_SOD-123_Keyboard,244.1,82.175,0
D80,1N4148W,OSO75:D_SOD-123_Keyboard,286.963,25.025,0
SW30,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,104.25,75.675,180
SW61,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,194.738,37.575,180
J1,USB_C_HRO_TYPE-C-31-M-12,Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12,168.54,147.66,0
SW78,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,318.563,56.625,180
D6,1N4148W,OSO75:D_SOD-123_Keyboard,186.95,125.037,0
SW18,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,132.825,94.725,180
SW57,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,118.538,37.575,180
SW26,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,23.288,75.675,180
D26,1N4148W,OSO75:D_SOD-123_Keyboard,29.788,82.175,0
D45,1N4148W,OSO75:D_SOD-123_Keyboard,134.563,63.125,0
R2,5.1k,OSO75:R_0603,179.5,144,0
D22,1N4148W,OSO75:D_SOD-123_Keyboard,215.525,101.225,0
D21,1N4148W,OSO75:D_SOD-123_Keyboard,196.475,101.225,0
SW31,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,123.3,75.675,180
D55,1N4148W,OSO75:D_SOD-123_Keyboard,86.938,44.075,0
D33,1N4148W,OSO75:D_SOD-123_Keyboard,167.9,82.175,0
SW10,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,266.175,118.537,180
SW16,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,94.725,94.725,180
R4,27R,OSO75:R_0603,157.5,141.5,0
SW9,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,247.125,118.537,180
D58,1N4148W,OSO75:D_SOD-123_Keyboard,144.088,44.075,0
SW51,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,242.363,56.625,180
SW3,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,113.775,118.537,180
D31,1N4148W,OSO75:D_SOD-123_Keyboard,129.8,82.175,0
SW64,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,259.031,37.575,180
SW2,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,94.725,118.537,180
SW67,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,68.531,18.525,180
SW_BOOT,BOOT,OSO75:SW_Tactile_4x3,101.5,138,0
C4,100nF,OSO75:C_0603,181,142.5,0
U3,AP2112K-3.3,OSO75:SOT-23-5_LDO,147,144.5,0
D50,1N4148W,OSO75:D_SOD-123_Keyboard,229.813,63.125,0
SW8,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,228.075,118.537,180
U1,ESP32-S3-WROOM-1-N16,RF_Module:ESP32-S3-WROOM-1,196,138.8,-90
SW27,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,47.1,75.675,180
SW33,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,161.4,75.675,180
SW5,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,161.4,118.537,180
D1,1N4148W,OSO75:D_SOD-123_Keyboard,82.175,125.037,0
D67,1N4148W,OSO75:D_SOD-123_Keyboard,75.031,25.025,0
SW65,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,20.906,18.525,180
SW29,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,85.2,75.675,180
SW48,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,185.213,56.625,180
D19,1N4148W,OSO75:D_SOD-123_Keyboard,158.375,101.225,0
D63,1N4148W,OSO75:D_SOD-123_Keyboard,239.338,44.075,0
D36,1N4148W,OSO75:D_SOD-123_Keyboard,225.05,82.175,0
D7,1N4148W,OSO75:D_SOD-123_Keyboard,206,125.037,0
ST3,Stabilizer_Cherry_MX_2.00u,Stabilizer_MX:Stabilizer_Cherry_MX_2.00u,30.431,37.575,180
SW21,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,189.975,94.725,180
D68,1N4148W,OSO75:D_SOD-123_Keyboard,146.469,25.025,0
D59,1N4148W,OSO75:D_SOD-123_Keyboard,163.138,44.075,0
ST1,Stabilizer_Cherry_MX_2.00u,Stabilizer_MX:Stabilizer_Cherry_MX_2.00u,275.7,94.725,180
D47,1N4148W,OSO75:D_SOD-123_Keyboard,172.662,63.125,0
D9,1N4148W,OSO75:D_SOD-123_Keyboard,253.625,125.037,0
ST4,Stabilizer_Cherry_MX_6.25u,Stabilizer_MX:Stabilizer_Cherry_MX_6.25u,139.969,18.525,180
SW52,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,273.319,56.625,180
D11,1N4148W,OSO75:D_SOD-123_Keyboard,291.725,125.037,0
J3,OSO_Module_Bay_10,OSO75:OSO_Module_Bay_10,38,119.563,0
D18,1N4148W,OSO75:D_SOD-123_Keyboard,139.325,101.225,0
SW66,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,44.719,18.525,180
D72,1N4148W,OSO75:D_SOD-123_Keyboard,325.063,125.037,0
D76,1N4148W,OSO75:D_SOD-123_Keyboard,325.063,82.175,0
SW58,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,137.588,37.575,180
D35,1N4148W,OSO75:D_SOD-123_Keyboard,206,82.175,0
D5,1N4148W,OSO75:D_SOD-123_Keyboard,167.9,125.037,0
D8,1N4148W,OSO75:D_SOD-123_Keyboard,234.575,125.037,0
SW75,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,299.512,75.675,180
SW72,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,318.563,118.537,180
D32,1N4148W,OSO75:D_SOD-123_Keyboard,148.85,82.175,0
SW80,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,280.463,18.525,180
SW81,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,299.512,18.525,180
SW23,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,228.075,94.725,180
SW42,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,70.912,56.625,180
D3,1N4148W,OSO75:D_SOD-123_Keyboard,120.275,125.037,0
D71,1N4148W,OSO75:D_SOD-123_Keyboard,265.531,25.025,0
SW34,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,180.45,75.675,180
D66,1N4148W,OSO75:D_SOD-123_Keyboard,51.219,25.025,0
SW4,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,142.35,118.537,180
SW62,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,213.787,37.575,180
SW73,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,299.512,94.725,180
D48,1N4148W,OSO75:D_SOD-123_Keyboard,191.713,63.125,0
SW49,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,204.263,56.625,180
C2,10uF,OSO75:C_0603,141.5,144.5,0
D54,1N4148W,OSO75:D_SOD-123_Keyboard,67.888,44.075,0
SW76,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,318.563,75.675,180
D44,1N4148W,OSO75:D_SOD-123_Keyboard,115.513,63.125,0
SW47,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,166.162,56.625,180
R5,10k,OSO75:R_0603,124.5,138,0
SW36,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,218.55,75.675,180
D23,1N4148W,OSO75:D_SOD-123_Keyboard,234.575,101.225,0
D61,1N4148W,OSO75:D_SOD-123_Keyboard,201.238,44.075,0
SW39,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,280.463,75.675,180
SW35,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,199.5,75.675,180
D27,1N4148W,OSO75:D_SOD-123_Keyboard,53.6,82.175,0
D60,1N4148W,OSO75:D_SOD-123_Keyboard,182.188,44.075,0
SW71,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,259.031,18.525,180
SW46,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,147.113,56.625,180
D69,1N4148W,OSO75:D_SOD-123_Keyboard,217.906,25.025,0
F1,500mA,OSO75:Polyfuse_1206,117,138,0
D4,1N4148W,OSO75:D_SOD-123_Keyboard,148.85,125.037,0
D17,1N4148W,OSO75:D_SOD-123_Keyboard,120.275,101.225,0
SW15,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,75.675,94.725,180
D34,1N4148W,OSO75:D_SOD-123_Keyboard,186.95,82.175,0
SW79,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,299.512,37.575,180
D42,1N4148W,OSO75:D_SOD-123_Keyboard,77.412,63.125,0
SW28,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,66.15,75.675,180
SW43,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,89.963,56.625,180
D38,1N4148W,OSO75:D_SOD-123_Keyboard,263.15,82.175,0
D53,1N4148W,OSO75:D_SOD-123_Keyboard,36.931,44.075,0
R6,10k,OSO75:R_0603,131.5,138,0
D56,1N4148W,OSO75:D_SOD-123_Keyboard,105.987,44.075,0
D49,1N4148W,OSO75:D_SOD-123_Keyboard,210.763,63.125,0
R1,5.1k,OSO75:R_0603,179.5,147,0
D43,1N4148W,OSO75:D_SOD-123_Keyboard,96.463,63.125,0
SW32,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,142.35,75.675,180
SW19,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,151.875,94.725,180
R10,10k,OSO75:R_0603,109.5,138,0
D39,1N4148W,OSO75:D_SOD-123_Keyboard,286.963,82.175,0
D77,1N4148W,OSO75:D_SOD-123_Keyboard,306.012,63.125,0
D30,1N4148W,OSO75:D_SOD-123_Keyboard,110.75,82.175,0
SW11,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,285.225,118.537,180
D16,1N4148W,OSO75:D_SOD-123_Keyboard,101.225,101.225,0
SW13,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,37.575,94.725,180
SW69,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,211.406,18.525,180
SW55,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,80.438,37.575,180
D79,1N4148W,OSO75:D_SOD-123_Keyboard,306.012,44.075,0
C1,10uF,OSO75:C_0603,152.5,144.5,0
D73,1N4148W,OSO75:D_SOD-123_Keyboard,306.012,101.225,0
SW50,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,223.313,56.625,180
SW7,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,199.5,118.537,180
SW20,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,170.925,94.725,180
D2,1N4148W,OSO75:D_SOD-123_Keyboard,101.225,125.037,0
R3,27R,OSO75:R_0603,157.5,145,0
SW54,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,61.388,37.575,180
D82,1N4148W,OSO75:D_SOD-123_Keyboard,325.063,25.025,0
D51,1N4148W,OSO75:D_SOD-123_Keyboard,248.863,63.125,0
D70,1N4148W,OSO75:D_SOD-123_Keyboard,241.719,25.025,0
D78,1N4148W,OSO75:D_SOD-123_Keyboard,325.063,63.125,0
D40,1N4148W,OSO75:D_SOD-123_Keyboard,32.169,63.125,0
SW59,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,156.638,37.575,180
SW56,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,99.487,37.575,180
D74,1N4148W,OSO75:D_SOD-123_Keyboard,325.063,101.225,0
SW70,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,235.219,18.525,180
SW63,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,232.838,37.575,180
SW77,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,299.512,56.625,180
D10,1N4148W,OSO75:D_SOD-123_Keyboard,272.675,125.037,0
D15,1N4148W,OSO75:D_SOD-123_Keyboard,82.175,101.225,0
ST2,Stabilizer_Cherry_MX_2.00u,Stabilizer_MX:Stabilizer_Cherry_MX_2.00u,273.319,56.625,180
D20,1N4148W,OSO75:D_SOD-123_Keyboard,177.425,101.225,0
D81,1N4148W,OSO75:D_SOD-123_Keyboard,306.012,25.025,0
SW24,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,247.125,94.725,180
SW40,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,25.669,56.625,180
D13,1N4148W,OSO75:D_SOD-123_Keyboard,44.075,101.225,0
D62,1N4148W,OSO75:D_SOD-123_Keyboard,220.287,44.075,0
D29,1N4148W,OSO75:D_SOD-123_Keyboard,91.7,82.175,0
SW41,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,51.863,56.625,180
D64,1N4148W,OSO75:D_SOD-123_Keyboard,265.531,44.075,0
D52,1N4148W,OSO75:D_SOD-123_Keyboard,279.819,63.125,0
SW1,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,75.675,118.537,180
D57,1N4148W,OSO75:D_SOD-123_Keyboard,125.038,44.075,0
D24,1N4148W,OSO75:D_SOD-123_Keyboard,253.625,101.225,0
SW6,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,180.45,118.537,180
D41,1N4148W,OSO75:D_SOD-123_Keyboard,58.363,63.125,0
SW14,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,56.625,94.725,180
D46,1N4148W,OSO75:D_SOD-123_Keyboard,153.613,63.125,0
SW25,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,275.7,94.725,180
SW45,MX_Hotswap,Switch_MX_Hotswap:SW_Hotswap_Kailh_MX_Plated_1.00u_With_Switch,128.063,56.625,180
```

## Critical net copper snippets

### VBUS
count 25
```sexpr
(segment
		(start 166.2927 145.6589)
		(end 166.5134 145.8797)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "0281c665-0cc0-4ef6-bd27-cb3a9c52aded")
	)
```
```sexpr
(segment
		(start 169.644 145.2752)
		(end 169.9314 145.2752)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "0d4a628f-ec1f-434a-9c35-38bce1851fd5")
	)
```
```sexpr
(segment
		(start 144.8 143.55)
		(end 145.9 143.55)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "0ee4f78e-2eaf-4176-ade1-69aaea3fdf42")
	)
```
```sexpr
(segment
		(start 117.3659 136.8341)
		(end 139.1841 136.8341)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "105970a6-c132-43fa-ac6b-3d77a1642fc4")
	)
```
```sexpr
(segment
		(start 166.09 143.615)
		(end 166.09 144.2166)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "189b4aec-65b8-4853-86e2-2c2896ec6bde")
	)
```
```sexpr
(segment
		(start 144.8 145.45)
		(end 144.8 143.55)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "265c7de8-750d-43fd-b140-fb7358e682d2")
	)
```
```sexpr
(segment
		(start 166.0055 145.9461)
		(end 153.4389 145.9461)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "4253d17f-afdb-4932-98d6-3c4dfad259d4")
	)
```
```sexpr
(segment
		(start 166.5451 144.6717)
		(end 166.5451 145.4065)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "5b7846e9-fa1c-4f90-b5cd-534b85140d4f")
	)
```
```sexpr
(segment
		(start 169.9314 145.2752)
		(end 170.99 144.2166)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "66125cc3-2d4e-45da-8dfb-dbda93f9774f")
	)
```
```sexpr
(segment
		(start 166.2927 145.6589)
		(end 166.0055 145.9461)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "69b3074b-e5c4-4405-854c-7f34692ad679")
	)
```
```sexpr
(segment
		(start 151.7 144.5)
		(end 151.7 142.4)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "7cafa720-c5b1-4815-aa8f-7bc56744fcca")
	)
```
```sexpr
(segment
		(start 116.2 138)
		(end 117.3659 136.8341)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "8d50264b-b22b-46ea-8388-c31e40a5349a")
	)
```
```sexpr
(segment
		(start 145.9 142.4)
		(end 145.9 143.55)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "933c6eee-1168-4e30-8139-b52ef1ba0fc0")
	)
```
```sexpr
(segment
		(start 170.99 144.2166)
		(end 170.99 143.615)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "ac65dd3a-f79e-4197-817d-6c0861a2f309")
	)
```
```sexpr
(segment
		(start 166.5451 145.4065)
		(end 166.2927 145.6589)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "b236bbfc-32c6-49ee-8b6d-4d86a5e54179")
	)
```
```sexpr
(segment
		(start 153.4389 145.9461)
		(end 151.9928 144.5)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "b8277197-cb6e-42fc-9a6d-5ebcb1511fb7")
	)
```
```sexpr
(segment
		(start 151.9928 144.5)
		(end 151.7 144.5)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "da09f8f2-c354-4e47-8f4f-2e50be7d0e04")
	)
```
```sexpr
(segment
		(start 145.9 145.45)
		(end 144.8 145.45)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "dde1331d-8908-4d4f-a47f-6661936a9c46")
	)
```
```sexpr
(segment
		(start 166.09 144.2166)
		(end 166.5451 144.6717)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "e08128d9-9c16-470d-b497-9e194bcf5aa4")
	)
```
```sexpr
(segment
		(start 151.7 142.4)
		(end 145.9 142.4)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "e0dc7190-3ffa-4a9d-8c09-e95fcc8daf2b")
	)
```
```sexpr
(segment
		(start 139.1841 136.8341)
		(end 145.9 143.55)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS")
		(uuid "f27bd40d-ac6b-4067-8cf1-013d302f1a76")
	)
```
```sexpr
(via
		(at 166.5134 145.8797)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "VBUS")
		(uuid "2b7afc7d-1301-4991-a039-b0f7bbeaa2bd")
	)
```
```sexpr
(via
		(at 169.644 145.2752)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "VBUS")
		(uuid "6927882d-58f4-4a85-a172-c7c35f69e24f")
	)
```
```sexpr
(segment
		(start 166.5134 145.8797)
		(end 167.1179 145.2752)
		(width 0.2)
		(layer "B.Cu")
		(net "VBUS")
		(uuid "9a4a8f51-c969-4444-ad02-f22bfb17ed52")
	)
```
```sexpr
(segment
		(start 167.1179 145.2752)
		(end 169.644 145.2752)
		(width 0.2)
		(layer "B.Cu")
		(net "VBUS")
		(uuid "ac21367e-adc6-4f3d-8d9a-db41c55b78d1")
	)
```
### +3V3
count 61
```sexpr
(segment
		(start 95.2 109.113)
		(end 32.7 109.113)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "00869be7-d072-44e7-be56-cb61af70d7b9")
	)
```
```sexpr
(segment
		(start 126.0547 137.2453)
		(end 131.5453 137.2453)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "04a5ca5f-6f55-4293-b8bb-d4c801559e24")
	)
```
```sexpr
(segment
		(start 140.7 144.5)
		(end 138.8 144.5)
		(width 0.4)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "1c711a1c-a05b-4aed-9dfd-e9717639c5c6")
	)
```
```sexpr
(segment
		(start 199.99 130.05)
		(end 199.99 131.1017)
		(width 0.4)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "27f50ba8-ff88-4ce4-bbec-f2e8eb2f31e2")
	)
```
```sexpr
(segment
		(start 198.0205 133.0712)
		(end 199.99 131.1017)
		(width 0.4)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "33e0d953-9199-4fac-803a-47aef22d991d")
	)
```
```sexpr
(segment
		(start 178.2263 142.5046)
		(end 180.1954 142.5046)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "33e31304-885e-4160-a611-e7f1fd0d60a3")
	)
```
```sexpr
(segment
		(start 24.95 113.863)
		(end 24.95 114.113)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "4384cba3-3026-4a4e-9af3-12d5b0536275")
	)
```
```sexpr
(segment
		(start 148.1 143.55)
		(end 149.2 143.55)
		(width 0.25)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "4813ffd2-0faf-459b-89fd-bcc6030b918b")
	)
```
```sexpr
(segment
		(start 138.8 144.5)
		(end 132.3 138)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "4c1f4cf6-87ff-44f7-a01c-d81f3dda8389")
	)
```
```sexpr
(segment
		(start 24.95 114.113)
		(end 24.7 114.363)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "61bbf38c-29b3-48ab-bc8d-a1ceb551534e")
	)
```
```sexpr
(segment
		(start 131.5453 137.2453)
		(end 132.3 138)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "6b097e34-ef45-4ac1-b1d3-acd422570501")
	)
```
```sexpr
(segment
		(start 30.45 111.363)
		(end 27.45 111.363)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "7c92a998-205c-4fc7-afbe-b61d4bf67e1a")
	)
```
```sexpr
(segment
		(start 124.7 138.363)
		(end 124.5163 138.7837)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "81ec7714-2e3a-46b7-af21-1d4907b2716c")
	)
```
```sexpr
(segment
		(start 125.3 138)
		(end 124.5163 138.7837)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "8feb4785-5d07-453c-ba3d-1e2d4c7485d9")
	)
```
```sexpr
(segment
		(start 125.3 138)
		(end 126.0547 137.2453)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "98cd1d1b-a405-43e1-9063-a6a3b5fd745e")
	)
```
```sexpr
(segment
		(start 27.45 111.363)
		(end 24.95 113.863)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "a86e5690-9363-41a3-8f33-4ed5408dedc2")
	)
```
```sexpr
(segment
		(start 32.7 109.113)
		(end 30.45 111.363)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "afbd60af-3d4b-41e8-aadc-0dad3a47c8ef")
	)
```
```sexpr
(segment
		(start 185.8003 133.0712)
		(end 198.0205 133.0712)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "b0a8dbfa-7e20-4c16-8c6c-193dce8e3995")
	)
```
```sexpr
(segment
		(start 180.1954 142.5046)
		(end 180.2 142.5)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "bde5e56c-38f4-4604-90f9-31a46e1ae205")
	)
```
```sexpr
(segment
		(start 124.5163 138.7837)
		(end 111.0837 138.7837)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "c184f772-bda3-4c48-949a-806f2457f0e8")
	)
```
```sexpr
(segment
		(start 111.0837 138.7837)
		(end 110.3 138)
		(width 0.2)
		(layer "F.Cu")
		(net "+3V3")
		(uuid "e0db4649-9200-4d09-bbc6-ce4f64ad8fb3")
	)
```
```sexpr
(via
		(at 138.8 144.5)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "+3V3")
		(uuid "36cb89f5-8e7f-455b-a9c1-7d97158c39de")
	)
```
```sexpr
(via
		(at 124.7 138.363)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "+3V3")
		(uuid "43d1d67c-3c6f-4fb5-964a-db0d8576fb53")
	)
```
```sexpr
(via
		(at 177.2 130.5)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "+3V3")
		(uuid "69c3b7e8-ce2d-4738-8cea-8bdfed0b480d")
	)
```
```sexpr
(via
		(at 149.2 143.55)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "+3V3")
		(uuid "7724fb7d-d12b-41da-ac74-0566610f14b8")
	)
```
```sexpr
(via
		(at 178.2263 142.5046)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "+3V3")
		(uuid "87fad802-672d-4e7f-92fb-6bdcb9af972f")
	)
```
```sexpr
(via
		(at 95.2 109.113)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "+3V3")
		(uuid "ce50dba8-a62b-4e55-96d6-30a8b3b310c2")
	)
```
```sexpr
(via
		(at 185.8003 133.0712)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "+3V3")
		(uuid "d246fdca-e32a-4a70-ac5a-c68862efee79")
	)
```
```sexpr
(via
		(at 177.6797 134.5133)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "+3V3")
		(uuid "d7ab6308-c6d6-4f5e-bbc9-c4601cc46b27")
	)
```
```sexpr
(segment
		(start 181.1723 131.0207)
		(end 181.2 131)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "1f78d1d1-124b-46c3-b978-49b2529adda6")
	)
```
```sexpr
(segment
		(start 107.45 119.363)
		(end 107.45 119.113)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "224c2e5d-90dd-4542-928e-928153284595")
	)
```
```sexpr
(segment
		(start 185.8003 131.4634)
		(end 185.8003 133.0712)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "323d5e47-ea2e-4676-9577-e12e85ff376f")
	)
```
```sexpr
(segment
		(start 107.45 119.113)
		(end 97.95 109.613)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "3dfbcdb3-1c31-4dcc-8092-9c97e28766af")
	)
```
```sexpr
(segment
		(start 177.5526 143.1783)
		(end 178.2263 142.5046)
		(width 0.4)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "3f91c63e-5a03-4e78-b74a-855b27c22183")
	)
```
```sexpr
(segment
		(start 138.8 144.5)
		(end 149.2 143.55)
		(width 0.25)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "40456ce7-b4df-497e-ac03-c393806a8d53")
	)
```
```sexpr
(segment
		(start 112.2 121.363)
		(end 111.45 121.363)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "586b668f-9ea6-40e8-901b-e1322655beee")
	)
```
```sexpr
(segment
		(start 97.95 109.363)
		(end 97.7 109.113)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "665745df-86b7-4081-aa71-93eb2e0528b5")
	)
```
```sexpr
(segment
		(start 113.45 122.613)
		(end 112.2 121.363)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "6d63878e-bcf6-4c6e-a500-dc0ac8c9af35")
	)
```
```sexpr
(segment
		(start 124.7 138.363)
		(end 113.7 127.363)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "703a87dc-b01d-41a2-a556-6e3a43622f03")
	)
```
```sexpr
(segment
		(start 177.6797 134.5133)
		(end 181.1723 131.0207)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "72f60bf5-9173-4a63-9203-aa93bfce314c")
	)
```
```sexpr
(segment
		(start 113.7 123.363)
		(end 113.45 123.113)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "7953b2a7-4cdd-4823-9e19-5962b176fcf1")
	)
```
```sexpr
(segment
		(start 178.2 131)
		(end 177.95 130.75)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "799724ba-8f12-4002-9a72-97877e738472")
	)
```
```sexpr
(segment
		(start 113.7 127.363)
		(end 113.7 123.363)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "7da18834-12cb-4299-ac43-5c5eff00a2e9")
	)
```
```sexpr
(segment
		(start 181.2 131)
		(end 178.2 131)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "8c78ffa1-4ea3-426f-acf2-5065f21c2d70")
	)
```
```sexpr
(segment
		(start 111.45 121.363)
		(end 111.2 121.113)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "8ee174c3-e2c5-4cb7-a2ef-b402071128f1")
	)
```
```sexpr
(segment
		(start 185.8003 136.584)
		(end 179.8797 142.5046)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "92a84a2e-f6ca-44e4-8ebd-a9391f7f90d5")
	)
```
```sexpr
(segment
		(start 163.8879 143.1783)
		(end 177.5526 143.1783)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "a6143498-2e4b-493f-b478-7c9ece8fe92d")
	)
```
```sexpr
(segment
		(start 177.95 130.75)
		(end 177.45 130.75)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "ab5f7321-f8c1-4311-9415-7584741e972e")
	)
```
```sexpr
(segment
		(start 177.45 130.75)
		(end 177.2 130.5)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "acb19c37-e9ac-488d-9303-263a1e5f2a41")
	)
```
```sexpr
(segment
		(start 185.8003 133.0712)
		(end 185.8003 136.584)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "aea2d3f3-b0bd-484f-8d4c-30f3beb09386")
	)
```
```sexpr
(segment
		(start 149.2 143.55)
		(end 152.5173 145.8754)
		(width 0.25)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "aec4b333-fc65-48fa-8877-f5648ff72473")
	)
```
```sexpr
(segment
		(start 185.3576 131.0207)
		(end 185.8003 131.4634)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "b49220d7-332b-4d4b-b847-c208c3ba53f5")
	)
```
```sexpr
(segment
		(start 113.45 123.113)
		(end 113.45 122.613)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "c33c8cb7-11c4-4804-be1f-7c48a4661298")
	)
```
```sexpr
(segment
		(start 97.7 109.113)
		(end 95.2 109.113)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "cfd2d12d-4093-4487-b12d-1d0cb31e1d5d")
	)
```
```sexpr
(segment
		(start 152.5173 145.8754)
		(end 161.1908 145.8754)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "deefa29d-1d81-4fde-bf7a-264c759180d4")
	)
```
```sexpr
(segment
		(start 97.95 109.613)
		(end 97.95 109.363)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "e2826417-d371-46aa-8a46-4f94e7f5c5c2")
	)
```
```sexpr
(segment
		(start 179.8797 142.5046)
		(end 178.2263 142.5046)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "e4c7aa21-79ed-4ad9-8a19-3b7709027ff1")
	)
```
```sexpr
(segment
		(start 181.1723 131.0207)
		(end 185.3576 131.0207)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "e869e53a-6fec-4566-b05c-9f8b1303f703")
	)
```
```sexpr
(segment
		(start 111.2 121.113)
		(end 109.2 121.113)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "eb9e9642-b730-4581-8abc-17f329fd8ad0")
	)
```
```sexpr
(segment
		(start 161.1908 145.8754)
		(end 163.8879 143.1783)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "fedb9d28-ee5b-4bee-80ef-425ad96ea505")
	)
```
```sexpr
(segment
		(start 109.2 121.113)
		(end 107.45 119.363)
		(width 0.2)
		(layer "B.Cu")
		(net "+3V3")
		(uuid "ffa58ebd-8bdd-4caf-bb67-b13ff23fa8e2")
	)
```
### GND
count 13
```sexpr
(via
		(at 138 141.5)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "2081d886-6b99-4a3f-972c-273270f241f1")
	)
```
```sexpr
(via
		(at 133.383364 137.7346)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "2ff67a1c-37a5-4a78-9f66-407d16895c81")
	)
```
```sexpr
(via
		(at 92 131.5)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "442b1bf0-3c7a-4bdd-9bd4-61240ccc156c")
	)
```
```sexpr
(via
		(at 180.552405 143.9763)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "4db4cb34-8191-4aef-a516-f67d3cc206c7")
	)
```
```sexpr
(via
		(at 140.911489 137.3169)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "4ea98e69-f13a-4488-ae13-71f27bea0d40")
	)
```
```sexpr
(via
		(at 194.853075 133.764808)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "602d2163-3cd6-47e0-9376-ac23dfb62a91")
	)
```
```sexpr
(via
		(at 156.8342 142.6202)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "60e6a62d-734c-4d5e-926d-01a19d2b4f74")
	)
```
```sexpr
(via
		(at 148.6 144.5)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "69f1b32a-4fe7-41b8-b7f1-85bb83ba1723")
	)
```
```sexpr
(via
		(at 48.245088 117.499354)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "6ff9ea4e-f37b-4522-98d4-db0f570a8203")
	)
```
```sexpr
(via
		(at 181.9578 142.6482)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "705f06d0-8209-4f7e-bb6d-f5db4eb43da8")
	)
```
```sexpr
(via
		(at 163.5811 129.8988)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "86675eb5-2a4e-472a-b3cc-5bc109346220")
	)
```
```sexpr
(via
		(at 101.150688 137.5074)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "99eff9d1-889a-4fa1-af10-0bf3fcac7533")
	)
```
```sexpr
(via
		(at 149 139.2)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "GND")
		(uuid "ae8e6f39-0b39-42ba-9820-412287bc2050")
	)
```
### USB_DP
count 14
```sexpr
(segment
		(start 158.3581 145.0581)
		(end 158.3 145)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP")
		(uuid "26806dad-e6b9-4372-a89b-c2c89118deb7")
	)
```
```sexpr
(segment
		(start 184.75 131.3104)
		(end 185.0819 131.6423)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP")
		(uuid "5014ee68-bbe0-4bd8-ade1-6d9169d312d2")
	)
```
```sexpr
(segment
		(start 159.8926 145.0581)
		(end 158.3581 145.0581)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP")
		(uuid "6f560cb6-1b0a-4a62-abec-8d271ab6a835")
	)
```
```sexpr
(segment
		(start 184.75 130.05)
		(end 184.75 131.3104)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP")
		(uuid "c1c60d3b-6335-4f60-9172-b5482042c782")
	)
```
```sexpr
(via
		(at 161.5 143.4)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "USB_DP")
		(uuid "0aecc3ef-2198-46d9-abad-60a47d805775")
	)
```
```sexpr
(via
		(at 185.0819 131.6423)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "USB_DP")
		(uuid "5ca2683c-f6ef-4c17-9d7b-6d940193084a")
	)
```
```sexpr
(via
		(at 159.8926 145.0581)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "USB_DP")
		(uuid "a49f6e26-14f0-402b-99b2-a90614247c65")
	)
```
```sexpr
(segment
		(start 179.9132 141.9029)
		(end 177.9772 141.9029)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DP")
		(uuid "1026dc58-264d-484d-905a-35fe384df8b0")
	)
```
```sexpr
(segment
		(start 162.6587 142.292)
		(end 159.8926 145.0581)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DP")
		(uuid "380d933e-778e-4fa8-a01c-933df49bf044")
	)
```
```sexpr
(segment
		(start 177.5882 142.2919)
		(end 177.5882 142.292)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DP")
		(uuid "7fbf2e1c-7f5a-4022-8bc6-31cc552832d8")
	)
```
```sexpr
(segment
		(start 185.0819 131.6423)
		(end 185.0819 136.7342)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DP")
		(uuid "988c70b2-3467-434e-836a-4f767f060083")
	)
```
```sexpr
(segment
		(start 185.0819 136.7342)
		(end 179.9132 141.9029)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DP")
		(uuid "9950100d-0541-42bd-b172-86096c943ba6")
	)
```
```sexpr
(segment
		(start 177.5882 142.292)
		(end 162.6587 142.292)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DP")
		(uuid "acd4b5d8-eb6a-419c-b0da-82f0e7a1105a")
	)
```
```sexpr
(segment
		(start 177.9772 141.9029)
		(end 177.5882 142.2919)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DP")
		(uuid "c08a0376-ee45-4c6f-899b-f300d0b2e675")
	)
```
### USB_DM
count 10
```sexpr
(segment
		(start 159.4806 133.0491)
		(end 163.5314 128.9983)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM")
		(uuid "4a19e00d-2af4-48c8-b874-4f27a33305a7")
	)
```
```sexpr
(segment
		(start 158.4903 141.6903)
		(end 158.3 141.5)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM")
		(uuid "85eb1869-0741-41ee-a288-81db19236391")
	)
```
```sexpr
(segment
		(start 163.5314 128.9983)
		(end 186.02 128.9983)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM")
		(uuid "d2deb044-64ab-4368-af3b-6235b0f718bd")
	)
```
```sexpr
(segment
		(start 186.02 130.05)
		(end 186.02 128.9983)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM")
		(uuid "d67bf549-ba9c-4ea0-8aa2-757482e2fb83")
	)
```
```sexpr
(segment
		(start 163.3817 141.6903)
		(end 158.4903 141.6903)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM")
		(uuid "fe97b89b-ad25-4066-9b57-48ab4cc16dc2")
	)
```
```sexpr
(via
		(at 163.3817 141.6903)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "USB_DM")
		(uuid "75a674c2-829f-4758-901f-a9b75761255e")
	)
```
```sexpr
(via
		(at 159.4806 133.0491)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "USB_DM")
		(uuid "b49bf583-9641-4367-8964-478d8733e180")
	)
```
```sexpr
(segment
		(start 163.3817 141.6903)
		(end 159.4807 137.7893)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DM")
		(uuid "50bdbf82-ba6e-4d6a-8eaa-b8c2bd400620")
	)
```
```sexpr
(segment
		(start 159.4807 133.0491)
		(end 159.4806 133.0491)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DM")
		(uuid "6ef3c6a2-88ab-45bf-bdd2-2a3b9a889e76")
	)
```
```sexpr
(segment
		(start 159.4807 137.7893)
		(end 159.4807 133.0491)
		(width 0.2)
		(layer "B.Cu")
		(net "USB_DM")
		(uuid "d948e49d-af9a-44b1-af69-8ba6296b967b")
	)
```
### USB_DP_CONN
count 11
```sexpr
(segment
		(start 166.8776 140.2841)
		(end 156.6601 140.2841)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "0264342c-ee05-4095-aeb4-67f9613b701f")
	)
```
```sexpr
(segment
		(start 169.29 143.615)
		(end 169.29 142.6965)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "0f80f42a-fe0a-460f-b9bf-cc23c1588552")
	)
```
```sexpr
(segment
		(start 168.29 144.4007)
		(end 168.29 143.615)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "140b4acd-123e-4815-8da9-67c8da7338b2")
	)
```
```sexpr
(segment
		(start 156.6601 140.2841)
		(end 155.9337 141.0105)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "450a1901-057e-4a8c-b59f-941199e9c452")
	)
```
```sexpr
(segment
		(start 168.5395 144.6502)
		(end 168.29 144.4007)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "53c74464-c569-47fa-b96b-7c261c1bb7a4")
	)
```
```sexpr
(segment
		(start 169.1024 144.6502)
		(end 168.5395 144.6502)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "57a04a7a-64ce-4d19-88ef-db4cb313ae2e")
	)
```
```sexpr
(segment
		(start 169.29 142.6965)
		(end 166.8776 140.2841)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "5e786959-1cc1-4218-bffc-1b702a6ba3b3")
	)
```
```sexpr
(segment
		(start 169.29 144.4626)
		(end 169.1024 144.6502)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "5fd18cd7-b783-42ef-8b4c-111e6a731e77")
	)
```
```sexpr
(segment
		(start 155.9337 144.2337)
		(end 156.7 145)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "9f6bf848-2ca8-4d26-960e-8aa04ec41f23")
	)
```
```sexpr
(segment
		(start 169.29 143.615)
		(end 169.29 144.4626)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "9fda8d49-e165-4e8b-866c-5c0a9dd960e9")
	)
```
```sexpr
(segment
		(start 155.9337 141.0105)
		(end 155.9337 144.2337)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DP_CONN")
		(uuid "d2c340d0-7756-4a49-aed5-3686137f45b2")
	)
```
### USB_DM_CONN
count 8
```sexpr
(segment
		(start 165.6867 140.7197)
		(end 167.79 142.823)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM_CONN")
		(uuid "118d9cc2-c992-43d1-9a80-c7b3bab521be")
	)
```
```sexpr
(segment
		(start 167.79 143.615)
		(end 167.79 142.823)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM_CONN")
		(uuid "1c2f3033-7808-4ea9-a3f1-40241e712c06")
	)
```
```sexpr
(segment
		(start 167.79 142.823)
		(end 168.0674 142.5456)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM_CONN")
		(uuid "69f2f73e-4574-4ad8-8ce5-d45dbb3a72fb")
	)
```
```sexpr
(segment
		(start 168.5191 142.5456)
		(end 168.79 142.8165)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM_CONN")
		(uuid "aa257124-5328-49e9-a025-bd9de69eef2e")
	)
```
```sexpr
(segment
		(start 157.4803 140.7197)
		(end 165.6867 140.7197)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM_CONN")
		(uuid "b537d886-7ec4-4d19-a901-c8810e41201f")
	)
```
```sexpr
(segment
		(start 168.0674 142.5456)
		(end 168.5191 142.5456)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM_CONN")
		(uuid "cf48aea9-9db4-4dc8-8074-e3cd820d1593")
	)
```
```sexpr
(segment
		(start 156.7 141.5)
		(end 157.4803 140.7197)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM_CONN")
		(uuid "eb027581-3d25-4d59-855d-81c53ff52cd4")
	)
```
```sexpr
(segment
		(start 168.79 142.8165)
		(end 168.79 143.615)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_DM_CONN")
		(uuid "f9f6ca6e-53b2-47b3-8f4c-acf4cd73d6b8")
	)
```
### USB_CC1
count 4
```sexpr
(segment
		(start 167.29 143.615)
		(end 167.29 144.421)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_CC1")
		(uuid "2e2c59dd-de85-4c1a-a8ba-ba1da7699094")
	)
```
```sexpr
(segment
		(start 177.7051 146.0051)
		(end 178.7 147)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_CC1")
		(uuid "41e39144-f291-4ff8-b599-5bedf5fce1ba")
	)
```
```sexpr
(segment
		(start 168.8741 146.0051)
		(end 177.7051 146.0051)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_CC1")
		(uuid "729f7878-f7c6-43bd-af73-30ab65409297")
	)
```
```sexpr
(segment
		(start 167.29 144.421)
		(end 168.8741 146.0051)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_CC1")
		(uuid "ae127c0c-6581-409d-a761-e5053fc4b918")
	)
```
### USB_CC2
count 4
```sexpr
(segment
		(start 177.2758 142.5758)
		(end 178.7 144)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_CC2")
		(uuid "188a14a9-6146-4a5c-b869-6ad9a1684215")
	)
```
```sexpr
(segment
		(start 170.29 142.8886)
		(end 170.6028 142.5758)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_CC2")
		(uuid "522440a4-fb34-495d-b033-ec1146e7b24c")
	)
```
```sexpr
(segment
		(start 170.29 143.615)
		(end 170.29 142.8886)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_CC2")
		(uuid "a003686b-5f2b-48a5-b174-7c28c9c3a820")
	)
```
```sexpr
(segment
		(start 170.6028 142.5758)
		(end 177.2758 142.5758)
		(width 0.2)
		(layer "F.Cu")
		(net "USB_CC2")
		(uuid "b3e09d7e-3526-45e0-8224-da6ec5710bee")
	)
```
### ESP_EN
count 24
```sexpr
(segment
		(start 51.3 114.363)
		(end 53.0149 116.0779)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "13cb30e3-3e75-40d4-b363-3f232c6478d0")
	)
```
```sexpr
(segment
		(start 123.3557 137.6557)
		(end 123.7 138)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "1a66f065-4207-401c-8d1e-858a7f0f5d90")
	)
```
```sexpr
(segment
		(start 186.481 131.9533)
		(end 186.7747 132.247)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "2bf6be86-5c38-40d1-8d0f-9c3c1c0df3ba")
	)
```
```sexpr
(segment
		(start 91.1435 137.3435)
		(end 91.8 138)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "59720cf1-455e-4103-8d78-3b76eed40873")
	)
```
```sexpr
(segment
		(start 198.72 130.05)
		(end 198.72 131.1017)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "6d84812c-27ff-4144-8cd3-da65f25bb3b5")
	)
```
```sexpr
(segment
		(start 197.5747 132.247)
		(end 198.72 131.1017)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "8c33bab6-bc97-4028-b069-e1b792810601")
	)
```
```sexpr
(segment
		(start 90.3231 137.3435)
		(end 91.1435 137.3435)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "b0107e25-f7c5-4fb3-abe5-3818bd8804a5")
	)
```
```sexpr
(segment
		(start 122.7902 137.6557)
		(end 123.3557 137.6557)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "b34a1ba5-411c-48c9-b7c0-0fe7a2a8a37c")
	)
```
```sexpr
(segment
		(start 53.0149 116.0779)
		(end 53.0149 116.2794)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "ccccd374-7a8f-4343-b224-03cfb5563c3e")
	)
```
```sexpr
(segment
		(start 186.7747 132.247)
		(end 197.5747 132.247)
		(width 0.2)
		(layer "F.Cu")
		(net "ESP_EN")
		(uuid "ee560f3c-1f8a-426d-9935-bb3ab291e8ec")
	)
```
```sexpr
(via
		(at 186.481 131.9533)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "ESP_EN")
		(uuid "2ff988d7-2f90-43ab-9433-d1f87496bb05")
	)
```
```sexpr
(via
		(at 122.7902 137.6557)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "ESP_EN")
		(uuid "901ddc99-3e9c-4259-bc25-2e39080397e5")
	)
```
```sexpr
(via
		(at 90.3231 137.3435)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "ESP_EN")
		(uuid "c1492f68-2c60-45e2-b6f1-05b57dc1c073")
	)
```
```sexpr
(via
		(at 53.0149 116.2794)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "ESP_EN")
		(uuid "dfc3e80b-499e-4a34-85f3-16f220ab7c4f")
	)
```
```sexpr
(segment
		(start 91.4522 138.4726)
		(end 90.3231 137.3435)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "36a3c125-aa90-42d8-9827-711fd4e59363")
	)
```
```sexpr
(segment
		(start 122.7902 137.6557)
		(end 131.6682 146.5337)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "444b86bd-51b6-4c77-8fed-d5444e7aa2cf")
	)
```
```sexpr
(segment
		(start 73.7631 137.3435)
		(end 90.3231 137.3435)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "5c81595d-969e-4eb9-a2cc-441d1e85dee1")
	)
```
```sexpr
(segment
		(start 186.481 136.5102)
		(end 186.481 131.9533)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "637e3ada-a7fe-4b86-ab6b-1225c74c7d16")
	)
```
```sexpr
(segment
		(start 176.4575 146.5337)
		(end 186.481 136.5102)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "63f2e90b-6036-42ee-b672-b9fac0e91f96")
	)
```
```sexpr
(segment
		(start 53.0149 116.5953)
		(end 73.7631 137.3435)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "a7e1554b-4931-4f8f-ad35-e1364c0c1d95")
	)
```
```sexpr
(segment
		(start 131.6682 146.5337)
		(end 176.4575 146.5337)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "b0e8455f-fc63-4b2a-9855-942d4e10ac37")
	)
```
```sexpr
(segment
		(start 121.9733 138.4726)
		(end 91.4522 138.4726)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "bc5bb4b1-6d18-4189-8d29-cdd48777da43")
	)
```
```sexpr
(segment
		(start 122.7902 137.6557)
		(end 121.9733 138.4726)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "d250ac65-f349-48b4-9a9c-b3222a83de0b")
	)
```
```sexpr
(segment
		(start 53.0149 116.2794)
		(end 53.0149 116.5953)
		(width 0.2)
		(layer "B.Cu")
		(net "ESP_EN")
		(uuid "ff67185c-9b04-48be-86ff-737d7f3b96a2")
	)
```
### BOOT_IO0
count 8
```sexpr
(segment
		(start 137.9646 146.4814)
		(end 176.9975 146.4814)
		(width 0.2)
		(layer "F.Cu")
		(net "BOOT_IO0")
		(uuid "3925a27e-61a3-47d7-ac2d-c0464fe80f88")
	)
```
```sexpr
(segment
		(start 130.7 139.2168)
		(end 130.7 138)
		(width 0.2)
		(layer "F.Cu")
		(net "BOOT_IO0")
		(uuid "5a726561-0a30-4701-b854-d9edf5166e5d")
	)
```
```sexpr
(segment
		(start 176.9975 146.4814)
		(end 179.1178 148.6017)
		(width 0.2)
		(layer "F.Cu")
		(net "BOOT_IO0")
		(uuid "9baab7ca-4b5e-41c7-8265-d783e867be19")
	)
```
```sexpr
(segment
		(start 130.7 139.2168)
		(end 101.0168 139.2168)
		(width 0.2)
		(layer "F.Cu")
		(net "BOOT_IO0")
		(uuid "a084a2a4-80fc-48c6-9004-d224415e7895")
	)
```
```sexpr
(segment
		(start 179.1178 148.6017)
		(end 184.75 148.6017)
		(width 0.2)
		(layer "F.Cu")
		(net "BOOT_IO0")
		(uuid "be692bd7-1bec-4e56-b6fd-bf8b9e5ff553")
	)
```
```sexpr
(segment
		(start 184.75 147.55)
		(end 184.75 148.6017)
		(width 0.2)
		(layer "F.Cu")
		(net "BOOT_IO0")
		(uuid "cbf685ef-09ac-4044-8a82-aedf5f4df183")
	)
```
```sexpr
(segment
		(start 101.0168 139.2168)
		(end 99.8 138)
		(width 0.2)
		(layer "F.Cu")
		(net "BOOT_IO0")
		(uuid "e56b339e-182a-4885-ad7f-debfc4949386")
	)
```
```sexpr
(segment
		(start 130.7 139.2168)
		(end 137.9646 146.4814)
		(width 0.2)
		(layer "F.Cu")
		(net "BOOT_IO0")
		(uuid "fe059769-6023-4a54-8890-7a3d0e6bab44")
	)
```
### VBUS_FUSED
count 9
```sexpr
(segment
		(start 117.9457 137.8543)
		(end 117.8 138)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS_FUSED")
		(uuid "3eb065a8-ccd4-4052-a441-70c577a42af0")
	)
```
```sexpr
(segment
		(start 118.7483 137.8543)
		(end 117.9457 137.8543)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS_FUSED")
		(uuid "4455c8a5-1590-411f-8323-4be047f930e8")
	)
```
```sexpr
(segment
		(start 28.5 114.363)
		(end 32.9163 109.9467)
		(width 0.2)
		(layer "F.Cu")
		(net "VBUS_FUSED")
		(uuid "773608ec-05b2-4407-9b59-75b393741c7c")
	)
```
```sexpr
(segment
		(start 32.9163 109.9467)
		(end 97.2607 109.9467)
		(width 0.4)
		(layer "F.Cu")
		(net "VBUS_FUSED")
		(uuid "ff28fdf6-e981-4ccc-a36a-417749196b58")
	)
```
```sexpr
(via
		(at 118.7483 137.8543)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "VBUS_FUSED")
		(uuid "18c853b0-ad40-47d6-a930-ef119c78003d")
	)
```
```sexpr
(via
		(at 97.2607 109.9467)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "VBUS_FUSED")
		(uuid "bca3f226-cc45-42b2-b48e-e4d7ee099517")
	)
```
```sexpr
(segment
		(start 105.3681 124.4741)
		(end 105.3681 118.0541)
		(width 0.4)
		(layer "B.Cu")
		(net "VBUS_FUSED")
		(uuid "242a8606-2b5a-45c3-b65d-a608c9a6cbb5")
	)
```
```sexpr
(segment
		(start 118.7483 137.8543)
		(end 105.3681 124.4741)
		(width 0.2)
		(layer "B.Cu")
		(net "VBUS_FUSED")
		(uuid "63cc4f5e-e854-4346-8a16-ba954cbfbb71")
	)
```
```sexpr
(segment
		(start 105.3681 118.0541)
		(end 97.2607 109.9467)
		(width 0.4)
		(layer "B.Cu")
		(net "VBUS_FUSED")
		(uuid "b8c967b7-45c8-4acc-b54e-dcb05764512e")
	)
```
### MOD_A
count 13
```sexpr
(segment
		(start 172.1702 113.2501)
		(end 177.3475 118.4274)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "24eadf14-58b9-4ec4-9619-e97b29810c8e")
	)
```
```sexpr
(segment
		(start 177.3475 118.4274)
		(end 177.3475 119.2258)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "4ec5c975-cfa6-4ce6-a3cf-a0e2359bc84a")
	)
```
```sexpr
(segment
		(start 39.9 114.363)
		(end 42.7097 111.5533)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "60bf652d-b830-43b4-bfea-28ef56d3e860")
	)
```
```sexpr
(segment
		(start 191.1 147.55)
		(end 191.1 146.4983)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "88f67255-0703-4b46-8ca8-1ead04d7860a")
	)
```
```sexpr
(segment
		(start 191.1 146.4983)
		(end 190.1384 145.5367)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "89348954-0e60-44c4-9a45-6343db5f90b0")
	)
```
```sexpr
(segment
		(start 171.9865 113.2501)
		(end 172.1702 113.2501)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "8c5bc5a3-da06-443f-a777-caefff15f410")
	)
```
```sexpr
(segment
		(start 170.2897 111.5533)
		(end 171.9865 113.2501)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "94418963-a428-425b-b404-204d12dd0cd1")
	)
```
```sexpr
(segment
		(start 42.7097 111.5533)
		(end 170.2897 111.5533)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "b063d130-3790-4b62-95de-10f55d92819c")
	)
```
```sexpr
(segment
		(start 190.1384 145.5367)
		(end 187.8444 145.5367)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_A")
		(uuid "f288248e-a634-42c8-abca-cda28c200d59")
	)
```
```sexpr
(via
		(at 187.8444 145.5367)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "MOD_A")
		(uuid "33d3eb61-ed25-4fee-ac0d-d9beede116bd")
	)
```
```sexpr
(via
		(at 177.3475 119.2258)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "MOD_A")
		(uuid "87362b7c-d14a-4858-ad94-3c47c50e8034")
	)
```
```sexpr
(segment
		(start 187.8444 129.7227)
		(end 187.8444 145.5367)
		(width 0.2)
		(layer "B.Cu")
		(net "MOD_A")
		(uuid "5e6b3e58-b621-4936-bf36-da651f8fd5cf")
	)
```
```sexpr
(segment
		(start 177.3475 119.2258)
		(end 187.8444 129.7227)
		(width 0.2)
		(layer "B.Cu")
		(net "MOD_A")
		(uuid "97cdd751-f456-4798-a29e-84cb1b2c702b")
	)
```
### MOD_B
count 6
```sexpr
(segment
		(start 192.37 148.6017)
		(end 191.9655 149.0062)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_B")
		(uuid "07a9330b-49ae-436d-8171-18f7a723223e")
	)
```
```sexpr
(segment
		(start 173.8266 147.0522)
		(end 76.3892 147.0522)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_B")
		(uuid "3af0a120-92d0-4058-83b8-45de07ceb0ef")
	)
```
```sexpr
(segment
		(start 192.37 147.55)
		(end 192.37 148.6017)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_B")
		(uuid "45492f00-7b75-432b-9131-2331e6d89ad7")
	)
```
```sexpr
(segment
		(start 191.9655 149.0062)
		(end 175.7806 149.0062)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_B")
		(uuid "839de28b-84b1-46c9-92cf-4f60af202356")
	)
```
```sexpr
(segment
		(start 175.7806 149.0062)
		(end 173.8266 147.0522)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_B")
		(uuid "b6d61c51-f34f-4073-b74b-077d2b642893")
	)
```
```sexpr
(segment
		(start 76.3892 147.0522)
		(end 43.7 114.363)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_B")
		(uuid "c85bad55-a3ae-41ad-917b-d9a1afd344b0")
	)
```
### MOD_INT
count 15
```sexpr
(segment
		(start 182.3908 143.3025)
		(end 182.4483 143.245)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "0d9d9e80-3a0f-4814-abba-f2972fdfdd48")
	)
```
```sexpr
(segment
		(start 181.0573 142.1636)
		(end 181.0573 142.9831)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "2f83c334-2599-450e-889c-9d786d8a54fc")
	)
```
```sexpr
(segment
		(start 156.7111 139.4654)
		(end 178.3591 139.4654)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "37af70cb-71ab-4880-8d5a-3abe63826502")
	)
```
```sexpr
(segment
		(start 108.7 137.041)
		(end 108.7 138)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "40d618f3-4b96-4035-8107-2e81582ff984")
	)
```
```sexpr
(segment
		(start 108.2659 136.6069)
		(end 69.7439 136.6069)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "4461e19b-785b-40a0-8faa-1d82987d803c")
	)
```
```sexpr
(segment
		(start 181.0573 142.9831)
		(end 181.3767 143.3025)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "59fbee07-a29e-4960-b8b6-e6df6a1fc6d5")
	)
```
```sexpr
(segment
		(start 108.7 137.041)
		(end 108.2659 136.6069)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "770c4b62-cba4-4d88-80a1-076f592a7944")
	)
```
```sexpr
(segment
		(start 183.5 143.245)
		(end 182.4483 143.245)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "858df696-b599-491b-a8f6-6d9035820e88")
	)
```
```sexpr
(segment
		(start 153.6621 136.4164)
		(end 156.7111 139.4654)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "a6041359-479c-4b6c-8069-ae95046914c1")
	)
```
```sexpr
(segment
		(start 69.7439 136.6069)
		(end 47.5 114.363)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "bc456735-d6cb-4440-9c69-fcf8611c0281")
	)
```
```sexpr
(segment
		(start 114.9086 137.041)
		(end 115.5332 136.4164)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "d5966a84-b24b-4e94-992f-61b376c812ca")
	)
```
```sexpr
(segment
		(start 108.7 137.041)
		(end 114.9086 137.041)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "e2f87616-ad94-46ce-b4ba-59613f3e9580")
	)
```
```sexpr
(segment
		(start 181.3767 143.3025)
		(end 182.3908 143.3025)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "ef17a06d-922b-440a-bd35-900b97981b79")
	)
```
```sexpr
(segment
		(start 178.3591 139.4654)
		(end 181.0573 142.1636)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "f7bb5f42-ba66-491b-9bd0-ba8db57849e4")
	)
```
```sexpr
(segment
		(start 115.5332 136.4164)
		(end 153.6621 136.4164)
		(width 0.2)
		(layer "F.Cu")
		(net "MOD_INT")
		(uuid "fb4f715e-0c13-414f-a9dc-be478f547d23")
	)
```
### I2C_SDA
count 6
```sexpr
(segment
		(start 65.4688 147.5318)
		(end 173.3711 147.5318)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SDA")
		(uuid "3d4ceef7-107b-4114-890a-6c8031863073")
	)
```
```sexpr
(segment
		(start 32.3 114.363)
		(end 65.4688 147.5318)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SDA")
		(uuid "439dbeca-5674-49e9-b729-8f2bb34e2fb0")
	)
```
```sexpr
(segment
		(start 193.64 147.55)
		(end 193.64 148.6017)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SDA")
		(uuid "4d802415-8c11-4d11-945b-8af10971d552")
	)
```
```sexpr
(segment
		(start 192.7805 149.4612)
		(end 193.64 148.6017)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SDA")
		(uuid "5b33711e-09ac-40fd-824d-ea0b00448f13")
	)
```
```sexpr
(segment
		(start 175.3005 149.4612)
		(end 192.7805 149.4612)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SDA")
		(uuid "74632ba1-c8e6-4966-afc8-7a1553e5ad37")
	)
```
```sexpr
(segment
		(start 173.3711 147.5318)
		(end 175.3005 149.4612)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SDA")
		(uuid "b6514823-59d0-40e6-9b10-61853781df01")
	)
```
### I2C_SCL
count 14
```sexpr
(segment
		(start 39.3603 111.1027)
		(end 170.6899 111.1027)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SCL")
		(uuid "506f427a-2b40-4e15-989c-e40b57180412")
	)
```
```sexpr
(segment
		(start 194.91 148.6755)
		(end 194.91 147.55)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SCL")
		(uuid "5968e6c3-2219-46cc-a904-2471fdce742a")
	)
```
```sexpr
(segment
		(start 170.6899 111.1027)
		(end 172.2356 112.6484)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SCL")
		(uuid "7bc2b7a8-45fb-4053-a0ec-1dc03a1ea6ed")
	)
```
```sexpr
(segment
		(start 36.1 114.363)
		(end 39.3603 111.1027)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SCL")
		(uuid "7eaa2730-5f53-426f-84e1-319f53e97755")
	)
```
```sexpr
(segment
		(start 195.411 149.1765)
		(end 194.91 148.6755)
		(width 0.2)
		(layer "F.Cu")
		(net "I2C_SCL")
		(uuid "85e3c824-619e-4190-8af6-4245620eb014")
	)
```
```sexpr
(via
		(at 172.2356 112.6484)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "I2C_SCL")
		(uuid "c9517982-ea76-4137-ab21-70e5b8352a63")
	)
```
```sexpr
(via
		(at 195.411 149.1765)
		(size 0.6)
		(drill 0.3)
		(layers "F.Cu" "B.Cu")
		(net "I2C_SCL")
		(uuid "d41f38c9-f6fb-4bc5-a2ff-a91aab2196b7")
	)
```
```sexpr
(segment
		(start 187.1631 129.8695)
		(end 177.2782 119.9846)
		(width 0.2)
		(layer "B.Cu")
		(net "I2C_SCL")
		(uuid "4c0f36db-e31b-46d1-8b5e-525548206882")
	)
```
```sexpr
(segment
		(start 177.2782 119.9846)
		(end 174.728 119.9846)
		(width 0.2)
		(layer "B.Cu")
		(net "I2C_SCL")
		(uuid "6f8ce86b-a511-4206-a3e6-fed7554fc30f")
	)
```
```sexpr
(segment
		(start 172.2356 117.4922)
		(end 172.2356 112.6484)
		(width 0.2)
		(layer "B.Cu")
		(net "I2C_SCL")
		(uuid "990907ad-70f0-411b-9bf1-38dd2112448b")
	)
```
```sexpr
(segment
		(start 190.5718 149.1765)
		(end 187.1631 145.7678)
		(width 0.2)
		(layer "B.Cu")
		(net "I2C_SCL")
		(uuid "aa989731-60eb-48d1-8a48-655de0705d67")
	)
```
```sexpr
(segment
		(start 174.728 119.9846)
		(end 172.2356 117.4922)
		(width 0.2)
		(layer "B.Cu")
		(net "I2C_SCL")
		(uuid "d36e8e92-4ba2-47da-b97b-2c31642e488e")
	)
```
```sexpr
(segment
		(start 187.1631 145.7678)
		(end 187.1631 129.8695)
		(width 0.2)
		(layer "B.Cu")
		(net "I2C_SCL")
		(uuid "eaf34839-86ef-451e-8bee-828debd03738")
	)
```
```sexpr
(segment
		(start 195.411 149.1765)
		(end 190.5718 149.1765)
		(width 0.2)
		(layer "B.Cu")
		(net "I2C_SCL")
		(uuid "ef3c2522-383c-43c9-b2d2-adf21b732bad")
	)
```
## DRC first 80 warnings

- warning via_dangling: Via is not connected or connected on only one layer; items=Via [+3V3] on F.Cu - B.Cu @ {"x":177.6797,"y":134.5133}
- warning via_dangling: Via is not connected or connected on only one layer; items=Via [USB_DP] on F.Cu - B.Cu @ {"x":161.5,"y":143.4}
- warning courtyards_overlap: Courtyards overlap; items=Footprint SW8 @ {"x":228.075,"y":118.537} | Footprint U1 @ {"x":196,"y":138.8}
- warning npth_inside_courtyard: NPTH inside courtyard; items=NPTH pad of SW8 @ {"x":222.995,"y":118.537} | Footprint U1 @ {"x":196,"y":138.8}
- warning courtyards_overlap: Courtyards overlap; items=Footprint U1 @ {"x":196,"y":138.8} | Footprint SW7 @ {"x":199.5,"y":118.537}
- warning npth_inside_courtyard: NPTH inside courtyard; items=NPTH pad of SW7 @ {"x":204.58,"y":118.537} | Footprint U1 @ {"x":196,"y":138.8}
- warning pth_inside_courtyard: PTH inside courtyard; items=PTH pad 1 [COL8] of SW7 @ {"x":203.31,"y":121.077} | Footprint U1 @ {"x":196,"y":138.8}
- warning silk_edge_clearance: Silkscreen clipped by board edge; items=Segment on Edge.Cuts @ {"x":337.088,"y":150.063} | Segment of J1 on F.Silkscreen @ {"x":163.84,"y":149.66}
- warning silk_edge_clearance: Silkscreen clipped by board edge; items=Segment on Edge.Cuts @ {"x":337.088,"y":150.063} | Segment of J1 on F.Silkscreen @ {"x":173.24,"y":149.66}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D12 @ {"x":25.025,"y":101.225}
- warning lib_footprint_issues: Footprint 'C_0603' not found in library 'OSO75'; items=Footprint C3 @ {"x":178,"y":130.5}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW12 @ {"x":18.525,"y":94.725}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW68 @ {"x":139.969,"y":18.525}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW74 @ {"x":318.563,"y":94.725}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW22 @ {"x":209.025,"y":94.725}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW37 @ {"x":237.6,"y":75.675}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW60 @ {"x":175.688,"y":37.575}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW38 @ {"x":256.65,"y":75.675}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D75 @ {"x":306.012,"y":82.175}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D28 @ {"x":72.65,"y":82.175}
- warning lib_footprint_issues: Footprint 'SW_Tactile_4x3' not found in library 'OSO75'; items=Footprint SW_RESET @ {"x":93.5,"y":138}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D14 @ {"x":63.125,"y":101.225}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW53 @ {"x":30.431,"y":37.575}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW17 @ {"x":113.775,"y":94.725}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW44 @ {"x":109.013,"y":56.625}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW82 @ {"x":318.563,"y":18.525}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D25 @ {"x":282.2,"y":101.225}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D65 @ {"x":27.406,"y":25.025}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D37 @ {"x":244.1,"y":82.175}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D80 @ {"x":286.963,"y":25.025}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW30 @ {"x":104.25,"y":75.675}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW61 @ {"x":194.738,"y":37.575}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW78 @ {"x":318.563,"y":56.625}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D6 @ {"x":186.95,"y":125.037}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW18 @ {"x":132.825,"y":94.725}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW57 @ {"x":118.538,"y":37.575}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW26 @ {"x":23.288,"y":75.675}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D26 @ {"x":29.788,"y":82.175}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D45 @ {"x":134.563,"y":63.125}
- warning lib_footprint_issues: Footprint 'R_0603' not found in library 'OSO75'; items=Footprint R2 @ {"x":179.5,"y":144}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D22 @ {"x":215.525,"y":101.225}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D21 @ {"x":196.475,"y":101.225}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW31 @ {"x":123.3,"y":75.675}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D55 @ {"x":86.938,"y":44.075}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D33 @ {"x":167.9,"y":82.175}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW10 @ {"x":266.175,"y":118.537}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW16 @ {"x":94.725,"y":94.725}
- warning lib_footprint_issues: Footprint 'R_0603' not found in library 'OSO75'; items=Footprint R4 @ {"x":157.5,"y":141.5}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW9 @ {"x":247.125,"y":118.537}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D58 @ {"x":144.088,"y":44.075}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW51 @ {"x":242.363,"y":56.625}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW3 @ {"x":113.775,"y":118.537}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D31 @ {"x":129.8,"y":82.175}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW64 @ {"x":259.031,"y":37.575}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW2 @ {"x":94.725,"y":118.537}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW67 @ {"x":68.531,"y":18.525}
- warning lib_footprint_issues: Footprint 'SW_Tactile_4x3' not found in library 'OSO75'; items=Footprint SW_BOOT @ {"x":101.5,"y":138}
- warning lib_footprint_issues: Footprint 'C_0603' not found in library 'OSO75'; items=Footprint C4 @ {"x":181,"y":142.5}
- warning lib_footprint_issues: Footprint 'SOT-23-5_LDO' not found in library 'OSO75'; items=Footprint U3 @ {"x":147,"y":144.5}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D50 @ {"x":229.813,"y":63.125}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW8 @ {"x":228.075,"y":118.537}
- warning lib_footprint_mismatch: Footprint 'ESP32-S3-WROOM-1' does not match copy in library 'RF_Module'; items=Footprint U1 @ {"x":196,"y":138.8}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW27 @ {"x":47.1,"y":75.675}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW33 @ {"x":161.4,"y":75.675}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW5 @ {"x":161.4,"y":118.537}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D1 @ {"x":82.175,"y":125.037}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D67 @ {"x":75.031,"y":25.025}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW65 @ {"x":20.906,"y":18.525}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW29 @ {"x":85.2,"y":75.675}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW48 @ {"x":185.213,"y":56.625}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D19 @ {"x":158.375,"y":101.225}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D63 @ {"x":239.338,"y":44.075}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D36 @ {"x":225.05,"y":82.175}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D7 @ {"x":206,"y":125.037}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Stabilizer_MX'; items=Footprint ST3 @ {"x":30.431,"y":37.575}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Switch_MX_Hotswap'; items=Footprint SW21 @ {"x":189.975,"y":94.725}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D68 @ {"x":146.469,"y":25.025}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D59 @ {"x":163.138,"y":44.075}
- warning lib_footprint_issues: The current configuration does not include the footprint library 'Stabilizer_MX'; items=Footprint ST1 @ {"x":275.7,"y":94.725}
- warning lib_footprint_issues: Footprint 'D_SOD-123_Keyboard' not found in library 'OSO75'; items=Footprint D47 @ {"x":172.662,"y":63.125}
