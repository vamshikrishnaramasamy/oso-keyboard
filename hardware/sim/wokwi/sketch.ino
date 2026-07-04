// Generated OSO75 ESP32-S3 Wokwi harness.
// Open with Wokwi or run with wokwi-cli when installed.

const uint8_t ROWS[] = {1, 2, 4, 5, 6, 7};
const uint8_t COLS[] = {8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 35, 36, 37, 38};
const char* LABELS[6][16] = {
  {"", "", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "PrtSc", "", ""},
  {"`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace", "Ins", "Home"},
  {"Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "PgUp", "Del"},
  {"Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter", "", "End", "PgDn"},
  {"LShift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "RShift", "", "", "Up", ""},
  {"LCtrl", "LGUI", "LAlt", "", "", "", "Space", "", "", "RAlt", "Fn", "RCtrl", "", "Left", "Down", "Right"}
};

void setup() {
  Serial.begin(115200);
  for (uint8_t r = 0; r < 6; r++) {
    pinMode(ROWS[r], INPUT_PULLUP);
  }
  for (uint8_t c = 0; c < 16; c++) {
    pinMode(COLS[c], INPUT_PULLUP);
    digitalWrite(COLS[c], HIGH);
  }
  Serial.println("OSO75 ESP32-S3 Wokwi harness ready");
  Serial.println("Matrix: 6 rows x 16 cols, 82 populated switches, COL2ROW in PCB");
}

void loop() {
  for (uint8_t c = 0; c < 16; c++) {
    pinMode(COLS[c], OUTPUT);
    digitalWrite(COLS[c], LOW);
    delayMicroseconds(30);
    for (uint8_t r = 0; r < 6; r++) {
      if (digitalRead(ROWS[r]) == LOW && LABELS[r][c][0]) {
        Serial.print("key ");
        Serial.print(LABELS[r][c]);
        Serial.print(" row ");
        Serial.print(r);
        Serial.print(" col ");
        Serial.println(c);
      }
    }
    pinMode(COLS[c], INPUT_PULLUP);
  }
  delay(5);
}
