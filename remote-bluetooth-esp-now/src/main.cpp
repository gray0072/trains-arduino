/* Pins:
            USB-C
     MISO 5       5V
     MOSI 6       G
       SS 7       3.3
LED-, SDA 8       4 SCK A4
boot, SCL 9       3 +++ A3
+++, no A 10      2 boot, A2
 bootUart 20      1 +++ A1
 bootUart 21      0 +++ A0
*/

#include <Arduino.h>
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
#include <esp_now.h>
#include <WiFi.h>
uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// Bluetooth service
#define DEVICE_NAME "TrainsRemote"
#define SERVICE_UUID "12345678-1234-1234-1234-123456789000"
#define CHARACTERISTIC_UUID "87654321-4321-4321-4321-9876543210ab"
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define ENCODER_S1_PIN 4
#define ENCODER_S2_PIN 3
#define ENCODER_KEY_PIN 1

#include <EncButton.h>
EncButton enc(ENCODER_S1_PIN, ENCODER_S2_PIN, ENCODER_KEY_PIN);

#define INTERNAL_LED_PIN 8
#define BTN_BEEP_PIN 0
#define BTN_LIGHT_PIN 7
// #define BTN_CHANGE_TRAIN_PIN 10 // encoder click
#define BTN_STOP_PIN 6
#define TRAIN1_LED_PIN 20
#define TRAIN2_LED_PIN 21

byte currentTrainIndex = 1; // 1 green or 2 blue

const byte CMD_BEEP = 1;
const byte CMD_STOP = 2;
const byte CMD_SPEED_UP = 3;
const byte CMD_SPEED_DOWN = 4;
const byte CMD_LIGHT_TOGGLE = 7;

IRAM_ATTR void rotate_isr()
{
    enc.tickISR();
}
IRAM_ATTR void click_isr()
{
    enc.pressISR();
}

void handleCommand(String command)
{
    byte currentTrainIndex = command.startsWith("TRAIN1_") ? 1 : 2;
    command = command.substring(strlen("TRAIN1_"));
    byte commandToSend = 0;

    if (command == "CMD_BEEP")
    {
        commandToSend = CMD_BEEP;
    }
    else if (command == "CMD_STOP")
    {
        commandToSend = CMD_STOP;
    }
    else if (command == "CMD_SPEED_UP")
    {
        commandToSend = CMD_SPEED_UP;
    }
    else if (command == "CMD_SPEED_DOWN")
    {
        commandToSend = CMD_SPEED_DOWN;
    }
    else if (command == "CMD_LIGHT_TOGGLE")
    {
        commandToSend = CMD_LIGHT_TOGGLE;
    }

    if (commandToSend > 0)
    {
        commandToSend = currentTrainIndex * 100 + commandToSend;
        digitalWrite(INTERNAL_LED_PIN, LOW);

        esp_now_send(broadcastAddress, (uint8_t *)&commandToSend, sizeof(commandToSend));
    }
    else
    {
        digitalWrite(INTERNAL_LED_PIN, HIGH);
    }
}

class MyServerCallbacks : public BLEServerCallbacks
{
    void onConnect(BLEServer *pServer)
    {
        // Only 1 client can connect at once
        Serial.println("Device connected");
    };

    void onDisconnect(BLEServer *pServer)
    {
        Serial.println("Device disconnected");
        BLEDevice::startAdvertising();
    }
};

class MyCharacteristicCallbacks : public BLECharacteristicCallbacks
{
    void onWrite(BLECharacteristic *pCharacteristic) override
    {
        std::string value = pCharacteristic->getValue();
        if (value.length() > 0)
        {
            // Serial.print("Received Value: ");
            // for (int i = 0; i < value.length(); i++) {
            //   Serial.print(value[i]);
            // }
            // Serial.println();

            String incomingData = String(value.c_str());
            handleCommand(incomingData);
        }
    }
};

void initBluetothServer()
{
    BLEDevice::init(DEVICE_NAME);
    BLEServer *pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    BLEService *pService = pServer->createService(SERVICE_UUID);
    BLECharacteristic *pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY);
    pCharacteristic->setCallbacks(new MyCharacteristicCallbacks());
    pService->start();

    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06); // functions that help with iPhone connections issue
    pAdvertising->setMinPreferred(0x12);
    pAdvertising->setMinInterval(200);
    pAdvertising->setMaxInterval(500);
    BLEDevice::startAdvertising();
}

void errorInfiniteBlink(String message)
{
    while (true)
    {
        Serial.println(message);
        digitalWrite(INTERNAL_LED_PIN, LOW);
        delay(200);
        digitalWrite(INTERNAL_LED_PIN, HIGH);
        delay(200);
    }
}

void initWifiEspNow()
{
    WiFi.mode(WIFI_STA);
    WiFi.setTxPower(WIFI_POWER_2dBm);
    // WiFi.setTxPower(WIFI_POWER_8_5dBm);
    if (esp_now_init() != ESP_OK)
    {
        errorInfiniteBlink("Ошибка инициализации ESP-NOW");
    }
    esp_now_peer_info_t peerInfo = {};
    peerInfo.channel = 0;
    peerInfo.encrypt = false;
    memcpy(&peerInfo.peer_addr, broadcastAddress, 6);
    if (!esp_now_is_peer_exist(broadcastAddress))
    {
        if (esp_now_add_peer(&peerInfo) != ESP_OK)
        {
            errorInfiniteBlink("Ошибка добавления peer");
        }
    }
}

void initEncoder()
{
    attachInterrupt(digitalPinToInterrupt(ENCODER_S1_PIN), rotate_isr, CHANGE);
    attachInterrupt(digitalPinToInterrupt(ENCODER_S2_PIN), rotate_isr, CHANGE);
    enc.setEncISR(true);
    attachInterrupt(digitalPinToInterrupt(ENCODER_KEY_PIN), click_isr, FALLING);
}

void setup()
{
    Serial.begin(115200);
    pinMode(INTERNAL_LED_PIN, OUTPUT);
    pinMode(TRAIN1_LED_PIN, OUTPUT);
    pinMode(TRAIN2_LED_PIN, OUTPUT);
    pinMode(BTN_BEEP_PIN, INPUT_PULLUP);
    pinMode(BTN_LIGHT_PIN, INPUT_PULLUP);
    pinMode(BTN_STOP_PIN, INPUT_PULLUP);
    pinMode(ENCODER_KEY_PIN, INPUT_PULLUP);

    initBluetothServer();
    initWifiEspNow();
    initEncoder();
}

void loop()
{
    enc.tick();

    static byte commandToSend;
    commandToSend = 0;

    static ulong lastTrainChangeMillis;
    if (enc.pressing())
    {
        Serial.println("enc pressing");
        if (millis() > lastTrainChangeMillis + 500)
        {
            if (currentTrainIndex == 1)
            {
                currentTrainIndex = 2;
            }
            else
            {
                currentTrainIndex = 1;
            }
            Serial.print("Current train: ");
            Serial.println(currentTrainIndex);
            lastTrainChangeMillis = millis();
        }
    }
    else
    {
        lastTrainChangeMillis = 0;
    }
    if (enc.right())
    {
        Serial.println("enc right");
        commandToSend = CMD_SPEED_UP;
    }
    if (enc.left())
    {
        Serial.println("enc left");
        commandToSend = CMD_SPEED_DOWN;
    }
    if (digitalRead(BTN_BEEP_PIN) == LOW)
    {
        Serial.println("btn beep");
        commandToSend = CMD_BEEP;
    }

    static ulong lastLightChangeMillis = 0;
    if (digitalRead(BTN_LIGHT_PIN) == LOW)
    {
        Serial.println("btn light");
        if (millis() > lastLightChangeMillis + 500)
        {
            commandToSend = CMD_LIGHT_TOGGLE;
            lastLightChangeMillis = millis();
        }
    }
    else
    {
        lastLightChangeMillis = 0;
    }

    if (digitalRead(BTN_STOP_PIN) == LOW)
    {
        Serial.println("btn stop");
        commandToSend = CMD_STOP;
    }

    static ulong lastCommandSentMillis;
    static ulong commandLedDurationMillis = 50;
    if (commandToSend > 0)
    {
        commandToSend = currentTrainIndex * 100 + commandToSend;
        // Serial.print("Command to send: ");
        // Serial.println(commandToSend);
        digitalWrite(INTERNAL_LED_PIN, LOW);
        lastCommandSentMillis = millis();

        esp_now_send(broadcastAddress, (uint8_t *)&commandToSend, sizeof(commandToSend));
    }
    else
    {
        if (millis() > lastCommandSentMillis + commandLedDurationMillis)
        {
            digitalWrite(INTERNAL_LED_PIN, HIGH);
        }
    }

    const byte led1Brightness = 10;
    const byte led2Brightness = 50;
    static byte lastTrainIndex = 0;
    if (currentTrainIndex != lastTrainIndex)
    {
        if (currentTrainIndex == 1)
        {
            analogWrite(TRAIN1_LED_PIN, led1Brightness);
            analogWrite(TRAIN2_LED_PIN, 0);
        }
        else
        {
            analogWrite(TRAIN1_LED_PIN, 0);
            analogWrite(TRAIN2_LED_PIN, led2Brightness);
        }
        lastTrainIndex = currentTrainIndex;
    }

    // delay(10);
}