/*
 * ESP32 - Sistema de Monitoramento de Correias por Sensor Capacitivo
 * 
 * Hardware:
 * - 16 pinos GPIO para matriz de sensores capacitivos (leitura analógica)
 * - 1 pino GPIO para encoder (interrupção)
 * - WiFi para comunicação com backend Django
 * 
 * Funcionalidades:
 * - Leitura de tensão dos 16 sensores capacitivos
 * - Contagem de pulsos do encoder
 * - Habilitação/desabilitação dinâmica de sensores via API
 * - Envio de dados em batch para o backend
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_wpa2.h"  // Biblioteca para WPA2-Enterprise (IFES)

// ==================== CONFIGURAÇÕES WiFi ====================
// ✅ REDE DO IFES (WPA2-Enterprise)
const char* WIFI_SSID = "ws_wlan";
const char* WIFI_IDENTITY = "20212ceca0210";  // Usuário/identidade IFES
const char* WIFI_PASSWORD = "#RUte8320";       // Senha IFES

// ⚠️ REDE ALTERNATIVA (descomente se precisar usar outra rede)
// const char* WIFI_SSID = "PALMEIRAS";
// const char* WIFI_PASSWORD = "Rute8320";
// #define USE_SIMPLE_WIFI  // Descomente esta linha para usar rede simples

// ==================== CONFIGURAÇÕES DO BACKEND ====================
const char* BACKEND_URL = "http://172.19.147.228:8000";  // IP do backend no IFES
const int BELT_ID = 1;  // ID da correia configurada no backend

// ==================== CONFIGURAÇÕES DOS PINOS GPIO ====================
// Pinos analógicos para os 16 sensores capacitivos (ADC1 e ADC2)
// NOTA: GPIO 35 usado como Sensor 1 (ajustado para modelo específico)
const int SENSOR_PINS[16] = {
  35,  // GPIO35 (ADC1_CH7) - Sensor 1
  39,  // GPIO39 (ADC1_CH3) - Sensor 2
  34,  // GPIO34 (ADC1_CH6) - Sensor 3
  36,  // GPIO36 (ADC1_CH0) - Sensor 4 (se disponível)
  32,  // GPIO32 (ADC1_CH4) - Sensor 5
  33,  // GPIO33 (ADC1_CH5) - Sensor 6
  25,  // GPIO25 (ADC2_CH8) - Sensor 7
  26,  // GPIO26 (ADC2_CH9) - Sensor 8
  27,  // GPIO27 (ADC2_CH7) - Sensor 9
  14,  // GPIO14 (ADC2_CH6) - Sensor 10
  12,  // GPIO12 (ADC2_CH5) - Sensor 11
  13,  // GPIO13 (ADC2_CH4) - Sensor 12
  15,  // GPIO15 (ADC2_CH3) - Sensor 13
  2,   // GPIO2  (ADC2_CH2) - Sensor 14
  4,   // GPIO4  (ADC2_CH0) - Sensor 15
  0    // GPIO0  (ADC2_CH1) - Sensor 16
};

// Pino para o encoder (com interrupção)
const int ENCODER_PIN = 23;  // GPIO23 - Encoder

// ==================== VARIÁVEIS GLOBAIS ====================
// Estado dos sensores (habilitado/desabilitado)
bool sensorEnabled[16] = {false};

// Estado do encoder
bool encoderEnabled = false;
volatile long encoderCount = 0;

// Configuração de leitura
const int ADC_RESOLUTION = 12;  // 12 bits (0-4095)
const float ADC_VREF = 3.3;     // Tensão de referência 3.3V
const int READING_INTERVAL = 100;  // Intervalo entre leituras (ms)
const int CONFIG_UPDATE_INTERVAL = 5000;  // Atualizar configuração a cada 5s

// Timers
unsigned long lastReadingTime = 0;
unsigned long lastConfigUpdateTime = 0;

// Buffer para armazenar leituras antes de enviar
const int MAX_BUFFER_SIZE = 10;
int bufferIndex = 0;

// ==================== INTERRUPÇÃO DO ENCODER ====================
void IRAM_ATTR encoderISR() {
  if (encoderEnabled) {
    encoderCount++;
  }
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("##########################################");
  Serial.println("#  ESP32 - CODIGO PRINCIPAL              #");
  Serial.println("#  Sistema de Monitoramento de Correias  #");
  Serial.println("#  Versao: 1.0 - PRODUCAO                #");
  Serial.println("##########################################");
  Serial.println("");
  
  // Configurar resolução do ADC
  analogReadResolution(ADC_RESOLUTION);
  
  // Configurar pinos dos sensores como entrada
  for (int i = 0; i < 16; i++) {
    pinMode(SENSOR_PINS[i], INPUT);
  }
  Serial.println("[OK] Pinos dos sensores configurados");
  
  // Configurar pino do encoder
  pinMode(ENCODER_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENCODER_PIN), encoderISR, RISING);
  Serial.println("[OK] Encoder configurado");
  
  // Conectar ao WiFi
  connectWiFi();
  
  // Buscar configuração inicial
  updateConfiguration();
  
  Serial.println("[OK] Sistema inicializado com sucesso!\n");
}

// ==================== LOOP PRINCIPAL ====================
void loop() {
  unsigned long currentTime = millis();
  
  // Verificar conexão WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[AVISO] WiFi desconectado. Reconectando...");
    connectWiFi();
  }
  
  // Atualizar configuração periodicamente
  if (currentTime - lastConfigUpdateTime >= CONFIG_UPDATE_INTERVAL) {
    updateConfiguration();
    lastConfigUpdateTime = currentTime;
  }
  
  // Realizar leitura dos sensores
  if (currentTime - lastReadingTime >= READING_INTERVAL) {
    performReading();
    lastReadingTime = currentTime;
  }
  
  delay(10);
}

// ==================== FUNÇÕES WiFi ====================
void connectWiFi() {
  Serial.print("🏫 Conectando ao WiFi do IFES: ");
  Serial.println(WIFI_SSID);
  
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  
  #ifdef USE_SIMPLE_WIFI
    // Conexão simples (rede de casa)
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  #else
    // ✅ Conexão WPA2-Enterprise (IFES)
    esp_wifi_sta_wpa2_ent_set_identity((uint8_t *)WIFI_IDENTITY, strlen(WIFI_IDENTITY));
    esp_wifi_sta_wpa2_ent_set_username((uint8_t *)WIFI_IDENTITY, strlen(WIFI_IDENTITY));
    esp_wifi_sta_wpa2_ent_set_password((uint8_t *)WIFI_PASSWORD, strlen(WIFI_PASSWORD));
    esp_wifi_sta_wpa2_ent_enable();
    WiFi.begin(WIFI_SSID);
  #endif
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[OK] WiFi conectado com sucesso!");
    Serial.print("📍 IP da ESP32: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[ERRO] Falha ao conectar WiFi do IFES!");
    Serial.println("Verifique as credenciais e reinicie a ESP32.");
  }
}

// ==================== ATUALIZAR CONFIGURAÇÃO ====================
void updateConfiguration() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/configuration/sensors/?belt_id=" + String(BELT_ID);
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    
    // Parse JSON
    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      JsonArray sensors = doc["sensors"].as<JsonArray>();
      
      // Resetar todos os sensores
      for (int i = 0; i < 16; i++) {
        sensorEnabled[i] = false;
      }
      
      // Atualizar estado dos sensores
      for (JsonObject sensor : sensors) {
        int sensorNumber = sensor["sensor_number"];
        bool enabled = sensor["enabled"];
        
        if (sensorNumber >= 1 && sensorNumber <= 16) {
          sensorEnabled[sensorNumber - 1] = enabled;
        }
      }
      
      // Verificar se encoder está habilitado (pelo menos 1 sensor ativo)
      encoderEnabled = false;
      for (int i = 0; i < 16; i++) {
        if (sensorEnabled[i]) {
          encoderEnabled = true;
          break;
        }
      }
      
      Serial.println("[OK] Configuracao atualizada");
      printConfiguration();
    } else {
      Serial.println("[ERRO] Erro ao parsear JSON");
    }
  } else {
    Serial.printf("[ERRO] Erro HTTP: %d\n", httpCode);
  }
  
  http.end();
}

// ==================== REALIZAR LEITURA ====================
void performReading() {
  // Verificar se há sensores habilitados
  bool hasSensorsEnabled = false;
  for (int i = 0; i < 16; i++) {
    if (sensorEnabled[i]) {
      hasSensorsEnabled = true;
      break;
    }
  }
  
  if (!hasSensorsEnabled) {
    return;  // Nenhum sensor habilitado, não fazer leitura
  }
  
  // Criar JSON para envio
  DynamicJsonDocument doc(2048);
  doc["belt_id"] = BELT_ID;
  doc["encoder_count"] = encoderCount;
  
  JsonArray sensors = doc.createNestedArray("sensors");
  
  // Mostrar cabeçalho das leituras
  Serial.println("\n--- LEITURA DOS SENSORES ---");
  
  // Ler sensores habilitados
  for (int i = 0; i < 16; i++) {
    if (sensorEnabled[i]) {
      int adcValue = analogRead(SENSOR_PINS[i]);
      float voltage = (adcValue / 4095.0) * ADC_VREF;
      
      // Mostrar no Serial Monitor
      Serial.printf("Sensor %d (GPIO %d): ADC=%d | Tensao=%.3fV\n", 
                    i + 1, SENSOR_PINS[i], adcValue, voltage);
      
      JsonObject sensor = sensors.createNestedObject();
      sensor["sensor_id"] = i + 1;
      sensor["voltage"] = voltage;
    }
  }
  
  Serial.printf("Encoder: %ld pulsos\n", encoderCount);
  Serial.println("---------------------------");
  
  // Enviar dados para o backend
  sendDataToBackend(doc);
}

// ==================== ENVIAR DADOS PARA BACKEND ====================
void sendDataToBackend(DynamicJsonDocument& doc) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/acquisition/ingest/";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode == 200 || httpCode == 201) {
    Serial.println("[OK] Dados enviados com sucesso");
  } else {
    Serial.printf("[ERRO] Falha ao enviar dados. HTTP: %d\n", httpCode);
  }
  
  http.end();
}

// ==================== IMPRIMIR CONFIGURAÇÃO ====================
void printConfiguration() {
  Serial.println("\n========== CONFIGURACAO ATUAL ==========");
  Serial.print("Encoder: ");
  Serial.println(encoderEnabled ? "HABILITADO" : "DESABILITADO");
  Serial.println("\nSensores habilitados:");
  
  bool hasEnabled = false;
  for (int i = 0; i < 16; i++) {
    if (sensorEnabled[i]) {
      Serial.printf("  - Sensor %d (GPIO %d)\n", i + 1, SENSOR_PINS[i]);
      hasEnabled = true;
    }
  }
  
  if (!hasEnabled) {
    Serial.println("  (Nenhum sensor habilitado)");
  }
  
  Serial.println("========================================\n");
}
