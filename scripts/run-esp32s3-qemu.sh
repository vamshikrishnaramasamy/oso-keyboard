#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="$ROOT_DIR/firmware/esp32s3-sim"
BUILD_DIR="$PROJECT_DIR/build-esp32s3"
IDF_DIR="/Users/vamshikrishnaramasamy/esp/esp-idf"

export IDF_PYTHON_ENV_PATH="/Users/vamshikrishnaramasamy/.espressif/python_env/idf6.2_py3.10_env"
source "$IDF_DIR/export.sh" >/dev/null

cd "$PROJECT_DIR"
idf.py -B "$BUILD_DIR" build

cd "$BUILD_DIR"
esptool --chip=esp32s3 merge-bin \
  --output=qemu_flash.bin \
  --pad-to-size=16MB \
  --flash-mode dio \
  --flash-freq 80m \
  --flash-size 16MB \
  0x0 bootloader/bootloader.bin \
  0x8000 partition_table/partition-table.bin \
  0x10000 oso75_esp32s3_sim.bin

exec qemu-system-xtensa \
  -M esp32s3 \
  -m 32M \
  -drive "file=$BUILD_DIR/qemu_flash.bin,if=mtd,format=raw" \
  -global driver=timer.esp32s3.timg,property=wdt_disable,value=true \
  -nic user,model=open_eth \
  -nographic \
  -serial mon:stdio
