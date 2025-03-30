#include <WiFi.h>
#include <WebSocketsClient.h>

// WiFi credentials
const char* ssid = "Viju";  // Replace with your WiFi name
const char* password = "Vhcm@#038370";  // Replace with your WiFi password

// WebSocket server details
const char* websocket_server = "192.168.1.105";  // Replace with your computer's IP address
const int websocket_port = 3001;

// WebSocket client
WebSocketsClient webSocket;

// Test data counter
int counter = 0;

void setup() {
  Serial.begin(115200);
  #include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Viju";
const char* password = "Vhcm@#038370";
// Change this line in your ESP32 code
const char* serverUrl = "http://192.168.0.105:3000/esp32/data";  // Your server URL
unsigned long messageCounter = 0;
unsigned long lastDataSent = 0;

void setup() {
    Serial.begin(115200);
    
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");
    Serial.println(WiFi.localIP());
}

void loop() {
    if (WiFi.status() == WL_CONNECTED && millis() - lastDataSent > 2000) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        
        // Create JSON document
        DynamicJsonDocument doc(1024);
        doc["test"] = "ESP32 Test Message";
        doc["counter"] = messageCounter++;
        doc["wifi_strength"] = WiFi.RSSI();
        
        // Serialize JSON to String
        String jsonString;
        serializeJson(doc, jsonString);
        
        // Send POST request
        int httpCode = http.POST(jsonString);
        
        if (httpCode > 0) {
            Serial.printf("HTTP Response: %d\n", httpCode);
            Serial.println("Sent: " + jsonString);
        } else {
            Serial.println("Error sending data");
        }
        
        http.end();
        lastDataSent = millis();
    }#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Viju";
const char* password = "Vhcm@#038370";
// Change this line in your ESP32 code
const char* serverUrl = "http://192.168.0.105:3000/esp32/data";  // Your server URL
unsigned long messageCounter = 0;
unsigned long lastDataSent = 0;

void setup() {
    Serial.begin(115200);
    
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");
    Serial.println(WiFi.localIP());
}

void loop() {
    if (WiFi.status() == WL_CONNECTED && millis() - lastDataSent > 2000) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        
        // Create JSON document
        DynamicJsonDocument doc(1024);
        doc["test"] = "ESP32 Test Message";
        doc["counter"] = messageCounter++;
        doc["wifi_strength"] = WiFi.RSSI();
        
        // Serialize JSON to String
        String jsonString;
        serializeJson(doc, jsonString);
        
        // Send POST request
        int httpCode = http.POST(jsonString);
        
        if (httpCode > 0) {
            Serial.printf("HTTP Response: %d\n", httpCode);
            Serial.println("Sent: " + jsonString);
        } else {
            Serial.println("Error sending data");
        }
        
        http.end();
        lastDataSent = millis();
    }
    
    delay(100);
}
    
    delay(100);
}
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Connect to WebSocket server
  webSocket.begin(websocket_server, websocket_port, "/socket.io/?EIO=4&transport=websocket");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  // Send test data every 2 seconds
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 2000) {
    // Create test data JSON
    char jsonBuffer[100];
    sprintf(jsonBuffer, 
      "{\"test\":\"Hello from ESP32\",\"counter\":%d,\"timestamp\":%lu}",
      counter++, millis());
    
    // Send data with the correct event name
    webSocket.sendTXT(jsonBuffer);
    lastSend = millis();
  }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket server");
      break;
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket server");
      break;
    case WStype_TEXT:
      Serial.printf("Received text: %s\n", payload);
      break;
  }
} 