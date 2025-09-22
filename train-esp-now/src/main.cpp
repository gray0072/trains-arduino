/* Pins:
            USB-C
     MISO 5       5V
     MOSI 6       G
       SS 7       3.3
LED-, SDA 8       4 SCK A4
boot, SCL 9       3 +++ A3
      +++ 10      2 boot, A2
 bootUart 20      1 +++ A1
 bootUart 21      0 +++ A0
*/

#include <Arduino.h>
#include <esp_now.h>
#include <WiFi.h>
#include <Adafruit_VL53L0X.h>

// #define LOG_SERIAL 1
#define CURRENT_TRAIN_INDEX 1 // 1 Green or 2 Blue
#define COMMAND_TRAIN_INDEX_DIVIDER 100
#define CMD_BEEP 1
#define CMD_STOP 2
#define CMD_SPEED_UP 3
#define CMD_SPEED_DOWN 4
#define CMD_LIGHT_TOGGLE 7

#define INTERNAL_LED_PIN 8
// Pins 2, 6, 8, 9, 20, 21 have +3.3v on start (pulled-up)
#define MOTOR1_PIN 5  // IN2
#define MOTOR2_PIN 10 // IN1
#define BUZZER_PIN 0
#define LED_PIN 2
#define BUZZER_PIN 0
#define DISTANCE_SDA_PIN 1 // Green wire
#define DISTANCE_SCL_PIN 4 // White wire

Adafruit_VL53L0X distanceSensor = Adafruit_VL53L0X();

#define motorLevelMax 15
#define motorSpeedMin255 140 // 140 is tested, starts easy even with a trailer
#define motorSpeedMax255 230
#define rangeStopMm 250     // Train will stop if smth is closer than this range
#define rangeMaxSpeedMm 350 // Train will start slow down if smth is closer than this range

int8_t motorLevel = 0;
int16_t motor1Speed = 0;
int16_t motor2Speed = 0;
bool lightEnabled = false;
unsigned long easyStartEndMillis = 0;
unsigned long easyStartDurationMillis = 300;
unsigned long buzzerToneFrequency = 170;
unsigned long buzzerEndMillis = 0;
unsigned long buzzerDurationMillis = 500;
unsigned long lastCommandEndMillis = 0;

byte espNowCommand;
bool gotData = false;
bool hasDistanceSensor = false;
void OnDataRecv(const uint8_t *mac, const uint8_t *incomingData, int len)
{
#ifdef LOG_SERIAL
    Serial.print("Got ESP-NOW mesage: ");
    Serial.write(incomingData, len);
    Serial.println();
#endif
    memcpy(&espNowCommand, incomingData, sizeof(espNowCommand));
    gotData = true;
}

void setup()
{
    Serial.begin(115200);
    digitalWrite(MOTOR1_PIN, LOW);
    digitalWrite(MOTOR2_PIN, LOW);
    pinMode(MOTOR1_PIN, OUTPUT);
    pinMode(MOTOR2_PIN, OUTPUT);

    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);
    pinMode(INTERNAL_LED_PIN, OUTPUT);
    digitalWrite(INTERNAL_LED_PIN, HIGH); // Disabled

    WiFi.mode(WIFI_STA);
    esp_now_init();
    esp_now_register_recv_cb(esp_now_recv_cb_t(OnDataRecv));

    // Maximum value, on 800k errors starts, many 0mm range
    Wire.begin(DISTANCE_SDA_PIN, DISTANCE_SCL_PIN, 400000);
    hasDistanceSensor = distanceSensor.begin();
    // Minimum value, less is ignored. Measurement time 36ms => 22ms
    distanceSensor.setMeasurementTimingBudgetMicroSeconds(20000);
    distanceSensor.startRangeContinuous(0);
}

void loop()
{
    uint8_t command = 0;

    if (hasDistanceSensor)
    {
        uint32_t rangeStartMcs = micros();
        VL53L0X_RangingMeasurementData_t measure;
        distanceSensor.rangingTest(&measure, false);
        uint32_t rangeEndMcs = micros();

        // Status 4 means no object detected - Out of range
        uint16_t rangeMm = 4000;
        if (measure.RangeStatus != 4)
        {
            rangeMm = measure.RangeMilliMeter;
        }
        // Serial.printf("Range mm: %i, Time mcs: %i\n", rangeMm, rangeEndMcs - rangeStartMcs);

        for (byte i = 0; i < 15; i++)
        {
            uint16_t minAllowedRange = map(i, 0, motorLevelMax, rangeStopMm, rangeMaxSpeedMm);
            if (motorLevel > i && rangeMm < minAllowedRange)
            {
                motorLevel = i;
                easyStartEndMillis = 0;
#ifdef LOG_SERIAL
                Serial.print("Slow down, range mm: ");
                Serial.println(rangeMm);
#endif
            }
        }
    }

    if (gotData)
    {
        gotData = false;
#ifdef LOG_SERIAL
        Serial.print("Received command: ");
        Serial.println(espNowCommand);
#endif

        uint8_t commandTrainIndex = espNowCommand / COMMAND_TRAIN_INDEX_DIVIDER;
        if (commandTrainIndex == CURRENT_TRAIN_INDEX)
        {
            command = espNowCommand % COMMAND_TRAIN_INDEX_DIVIDER;
            lastCommandEndMillis = millis() + 50;
        }
    }

    switch (command)
    {
    case CMD_BEEP:
#ifdef LOG_SERIAL
        Serial.println("CMD_BEEP");
#endif
        buzzerEndMillis = millis() + buzzerDurationMillis;
        break;
    case CMD_LIGHT_TOGGLE:
#ifdef LOG_SERIAL
        Serial.println("CMD_LIGHT_TOGGLE");
#endif
        lightEnabled = !lightEnabled;
        Serial.printf("lightEnabled %b\n", lightEnabled);
        break;
    case CMD_SPEED_UP:
#ifdef LOG_SERIAL
        Serial.println("CMD_SPEED_UP");
#endif
        if (motorLevel + 1 <= motorLevelMax)
        {
            if (motorLevel == 0)
            {
                easyStartEndMillis = millis() + easyStartDurationMillis;
            }
            motorLevel++;
            if (motorLevel == 0)
            {
                easyStartEndMillis = 0;
            }
            Serial.printf("motorLevel %i\n", motorLevel);
        }
        break;
    case CMD_SPEED_DOWN:
#ifdef LOG_SERIAL
        Serial.println("CMD_SPEED_DOWN");
#endif
        if (motorLevel - 1 >= -motorLevelMax)
        {
            if (motorLevel == 0)
            {
                easyStartEndMillis = millis() + easyStartDurationMillis;
            }
            motorLevel--;
            if (motorLevel == 0)
            {
                easyStartEndMillis = 0;
            }
            Serial.printf("motorLevel %i\n", motorLevel);
        }
        break;
    case CMD_STOP:
#ifdef LOG_SERIAL
        Serial.println("CMD_STOP");
#endif
        motorLevel = 0;
        Serial.printf("motorLevel %i\n", motorLevel);
        break;
    }

    static bool isBuzzerActive = false;
    if ((millis() < buzzerEndMillis) && !isBuzzerActive)
    {
        tone(BUZZER_PIN, buzzerToneFrequency);
        isBuzzerActive = true;
    }
    if ((millis() > buzzerEndMillis) && isBuzzerActive)
    {
        noTone(BUZZER_PIN);
        isBuzzerActive = false;
    }

    int16_t prevMotor1Speed = motor1Speed;
    int16_t prevMotor2Speed = motor2Speed;
    if (motorLevel == 0)
    {
        motor1Speed = 255;
        motor2Speed = 255;
    }
    else
    {
        // Serial.print("motorLevel: ");
        // Serial.println(motorLevel);
        int motorAbsSpeed = map(abs(motorLevel), 1, motorLevelMax, motorSpeedMin255, motorSpeedMax255);
        if (millis() < easyStartEndMillis)
        {
            motorAbsSpeed = 255;
        }
        // Serial.print("motorAbsSpeed: ");
        // Serial.println(motorAbsSpeed);

        if (motorLevel > 0)
        {
            motor1Speed = motorAbsSpeed;
            motor2Speed = 0;
        }
        else
        {
            motor1Speed = 0;
            motor2Speed = motorAbsSpeed;
        }
    }

    if (motor1Speed != prevMotor1Speed)
    {
#ifdef LOG_SERIAL
        Serial.print("MOTOR1_PIN: ");
        Serial.println(motor1Speed);
#endif
        analogWrite(MOTOR1_PIN, motor1Speed);
    }
    if (motor2Speed != prevMotor2Speed)
    {
#ifdef LOG_SERIAL
        Serial.print("MOTOR2_PIN: ");
        Serial.println(motor2Speed);
#endif
        analogWrite(MOTOR2_PIN, motor2Speed);
    }

    static bool prevLightEnabled = 0;
    if (lightEnabled != prevLightEnabled)
    {
        prevLightEnabled = lightEnabled;
        analogWrite(LED_PIN, lightEnabled ? 255 : 0);
    }

    if (millis() < lastCommandEndMillis)
    {
        digitalWrite(INTERNAL_LED_PIN, LOW); // Enable, logic inverted
    }
    else
    {
        digitalWrite(INTERNAL_LED_PIN, HIGH); // Disable
    }
}

/*
void setup()
{
    pinMode(8, OUTPUT);
    while (1)
    {
        digitalWrite(8, LOW);
        delay(500);
        digitalWrite(8, HIGH);
        delay(500);
    }
}
void loop() {}
*/