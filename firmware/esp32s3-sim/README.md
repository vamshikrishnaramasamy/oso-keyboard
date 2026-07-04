# OSO75 ESP32-S3 Firmware Sim

This is a tiny ESP-IDF target for exercising the OSO75 ESP32-S3 pin plan on a
real ESP32-S3 build toolchain. It configures the same matrix pins as the PCB,
runs a deterministic COL2ROW matrix scan, and prints CPU/heap/timing stats.

Build it from the repo root:

```sh
npm run firmware:esp32s3:build
```

Run under Espressif QEMU when the selected IDF/QEMU target supports ESP32-S3:

```sh
npm run firmware:esp32s3:qemu
```

For full board/circuit validation, run the repo-level system sim too:

```sh
npm run simulate:esp32
npm run simulate:system:strict
```
