#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <string.h>

#include "driver/gpio.h"
#include "esp_chip_info.h"
#include "esp_heap_caps.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define OSO75_ROWS 6
#define OSO75_COLS 16
#define OSO75_SWITCHES 82
#define OSO75_SCAN_ITERATIONS 1000

typedef struct {
    uint8_t row;
    uint8_t col;
    const char *label;
} oso75_switch_t;

static const char *TAG = "oso75-sim";

static const gpio_num_t row_pins[OSO75_ROWS] = {
    GPIO_NUM_1,
    GPIO_NUM_2,
    GPIO_NUM_4,
    GPIO_NUM_5,
    GPIO_NUM_6,
    GPIO_NUM_7,
};

static const gpio_num_t col_pins[OSO75_COLS] = {
    GPIO_NUM_8,
    GPIO_NUM_9,
    GPIO_NUM_10,
    GPIO_NUM_11,
    GPIO_NUM_12,
    GPIO_NUM_13,
    GPIO_NUM_14,
    GPIO_NUM_15,
    GPIO_NUM_16,
    GPIO_NUM_17,
    GPIO_NUM_18,
    GPIO_NUM_21,
    GPIO_NUM_35,
    GPIO_NUM_36,
    GPIO_NUM_37,
    GPIO_NUM_38,
};

static const oso75_switch_t switches[OSO75_SWITCHES] = {
    {0, 2, "F2"}, {0, 3, "F3"}, {0, 4, "F4"}, {0, 5, "F5"},
    {0, 6, "F6"}, {0, 7, "F7"}, {0, 8, "F8"}, {0, 9, "F9"},
    {0, 10, "F10"}, {0, 11, "F11"}, {0, 12, "F12"},
    {1, 0, "`"}, {1, 1, "1"}, {1, 2, "2"}, {1, 3, "3"},
    {1, 4, "4"}, {1, 5, "5"}, {1, 6, "6"}, {1, 7, "7"},
    {1, 8, "8"}, {1, 9, "9"}, {1, 10, "0"}, {1, 11, "-"},
    {1, 12, "="}, {1, 13, "Backspace"}, {2, 0, "Tab"}, {2, 1, "Q"},
    {2, 2, "W"}, {2, 3, "E"}, {2, 4, "R"}, {2, 5, "T"},
    {2, 6, "Y"}, {2, 7, "U"}, {2, 8, "I"}, {2, 9, "O"},
    {2, 10, "P"}, {2, 11, "["}, {2, 12, "]"}, {2, 13, "\\"},
    {3, 0, "Caps"}, {3, 1, "A"}, {3, 2, "S"}, {3, 3, "D"},
    {3, 4, "F"}, {3, 5, "G"}, {3, 6, "H"}, {3, 7, "J"},
    {3, 8, "K"}, {3, 9, "L"}, {3, 10, ";"}, {3, 11, "'"},
    {3, 12, "Enter"}, {4, 0, "LShift"}, {4, 1, "Z"}, {4, 2, "X"},
    {4, 3, "C"}, {4, 4, "V"}, {4, 5, "B"}, {4, 6, "N"},
    {4, 7, "M"}, {4, 8, ","}, {4, 9, "."}, {4, 10, "/"},
    {4, 11, "RShift"}, {5, 0, "LCtrl"}, {5, 1, "LGUI"},
    {5, 2, "LAlt"}, {5, 6, "Space"}, {5, 9, "RAlt"}, {5, 10, "Fn"},
    {5, 11, "RCtrl"}, {0, 13, "PrtSc"}, {1, 14, "Ins"}, {1, 15, "Home"},
    {2, 14, "PgUp"}, {2, 15, "Del"}, {3, 14, "End"}, {3, 15, "PgDn"},
    {4, 14, "Up"}, {5, 13, "Left"}, {5, 14, "Down"}, {5, 15, "Right"},
};

static uint16_t simulated_pressed[OSO75_ROWS];

static void configure_matrix_pins(void) {
    gpio_config_t row_config = {
        .pin_bit_mask = 0,
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };

    gpio_config_t col_config = {
        .pin_bit_mask = 0,
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };

    for (size_t i = 0; i < OSO75_ROWS; i++) {
        row_config.pin_bit_mask |= 1ULL << row_pins[i];
    }

    for (size_t i = 0; i < OSO75_COLS; i++) {
        col_config.pin_bit_mask |= 1ULL << col_pins[i];
    }

    ESP_ERROR_CHECK(gpio_config(&row_config));
    ESP_ERROR_CHECK(gpio_config(&col_config));

    for (size_t i = 0; i < OSO75_COLS; i++) {
        ESP_ERROR_CHECK(gpio_set_level(col_pins[i], 1));
    }
}

static void press_label(const char *label) {
    for (size_t i = 0; i < OSO75_SWITCHES; i++) {
        if (strcmp(switches[i].label, label) == 0) {
            simulated_pressed[switches[i].row] |= 1U << switches[i].col;
            return;
        }
    }
}

static uint16_t scan_matrix_once(void) {
    uint16_t detections = 0;

    for (size_t col = 0; col < OSO75_COLS; col++) {
        ESP_ERROR_CHECK(gpio_set_level(col_pins[col], 0));

        for (size_t row = 0; row < OSO75_ROWS; row++) {
            const bool synthetic_low = (simulated_pressed[row] & (1U << col)) != 0;
            (void)gpio_get_level(row_pins[row]);

            if (synthetic_low) {
                detections++;
            }
        }

        ESP_ERROR_CHECK(gpio_set_level(col_pins[col], 1));
    }

    return detections;
}

static void run_matrix_benchmark(void) {
    int64_t started = esp_timer_get_time();
    uint32_t total_detections = 0;

    for (size_t i = 0; i < OSO75_SCAN_ITERATIONS; i++) {
        total_detections += scan_matrix_once();
    }

    int64_t elapsed_us = esp_timer_get_time() - started;
    uint32_t avg_us = (uint32_t)(elapsed_us / OSO75_SCAN_ITERATIONS);
    ESP_LOGI(TAG, "matrix scans=%d avg_us=%" PRIu32 " total_detections=%" PRIu32,
             OSO75_SCAN_ITERATIONS, avg_us, total_detections);
}

void app_main(void) {
    esp_chip_info_t chip_info;
    esp_chip_info(&chip_info);

    ESP_LOGI(TAG, "boot OSO75 ESP32-S3 firmware sim");
    ESP_LOGI(TAG, "cores=%d revision=%d features=0x%lx", chip_info.cores,
             chip_info.revision, chip_info.features);
    ESP_LOGI(TAG, "matrix rows=%d cols=%d switches=%d", OSO75_ROWS, OSO75_COLS,
             OSO75_SWITCHES);

    configure_matrix_pins();

    press_label("Q");
    press_label("A");
    press_label("Space");
    press_label("Right");

    const uint16_t detections = scan_matrix_once();
    ESP_LOGI(TAG, "sample detections=%u expected=4", detections);

    run_matrix_benchmark();

    ESP_LOGI(TAG, "free_heap=%" PRIu32 " min_free_heap=%" PRIu32,
             heap_caps_get_free_size(MALLOC_CAP_DEFAULT),
             heap_caps_get_minimum_free_size(MALLOC_CAP_DEFAULT));

    while (true) {
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
