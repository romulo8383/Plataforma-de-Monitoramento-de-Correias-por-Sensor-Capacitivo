/*
 * ESP32 - Código de Teste de Comunicação
 * 
 * Use este código para testar a comunicação com o backend
 * antes de fazer a montagem completa do hardware.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "esp_wpa2.h"  // Biblioteca para WPA2-Enterprise (IFES)

// ==================== CONFIGURAÇÕES ====================
// ✅ REDE DO IFES (WPA2-Enterprise)
const char* WIFI_SSID = "ws_wlan";
const char* WIFI_IDENTITY = "20212ceca0210";  // Usuário/identidade IFES
const char* WIFI_PASSWORD = "#RUte8320";       // Senha IFES

// ⚠️ REDE ALTERNATIVA (descomente se precisar usar outra rede)
// const char* WIFI_SSID = "PALMEIRAS";
// const char* WIFI_PASSWORD = "Rute8320";
// #define USE_SIMPLE_WIFI  // Descomente esta linha para usar rede simples
const char* BACKEND_URL = "http://172.19.146.173:8000";  // IP do backend no IFES
const int BELT_ID = 1;

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("========================================");
  Serial.println("   ESP32 - TESTE DE CONEXAO");
  Serial.println("   Sistema de Monitoramento de Correias");
  Serial.println("   Versao: 1.0 - TESTE");
  Serial.println("========================================");
  Serial.println("");
  
  // Conectar WiFi
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
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado com sucesso!");
    Serial.print("📍 IP da ESP32: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Falha ao conectar WiFi do IFES!");
    Serial.println("Verifique as credenciais e reinicie a ESP32.");
    return;
  }
  
  Serial.println("");
  Serial.println("========================================");
  Serial.println(">>> INICIANDO TESTES DE COMUNICACAO <<<");
  Serial.println("========================================");
  Serial.println("");
  
  // Teste 1: Buscar configuração
  Serial.println("TESTE 1: Buscar configuração dos sensores");
  testGetConfiguration();
  delay(2000);
  
  // Teste 2: Enviar dados simulados
  Serial.println("\nTESTE 2: Enviar dados simulados");
  testSendData();
  delay(2000);
  
  // Teste 3: Habilitar/desabilitar sensor
  Serial.println("\nTESTE 3: Toggle sensor");
  testToggleSensor(1, true);
  delay(2000);
  
  Serial.println("");
  Serial.println("========================================");
  Serial.println(">>> TESTES CONCLUIDOS COM SUCESSO! <<<");
  Serial.println("========================================");
  Serial.println("");
  Serial.println("Se todos os testes passaram, o sistema esta pronto!");
  Serial.println("Agora voce pode fazer upload do codigo principal (ESP32.ino)");
  Serial.println("");
}

void loop() {
  // Nada no loop - apenas testes no setup
}

// ==================== TESTE 1: GET CONFIGURAÇÃO ====================
void testGetConfiguration() {
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/configuration/sensors/?belt_id=" + String(BELT_ID);
  
  Serial.println("URL: " + url);
  http.begin(url);
  
  int httpCode = http.GET();
  Serial.printf("HTTP Code: %d\n", httpCode);
  
  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("[OK] Resposta recebida:");
    Serial.println(payload);
    
    // Parse JSON
    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      Serial.println("[OK] JSON parseado com sucesso!");
      
      int beltId = doc["belt_id"];
      const char* beltName = doc["belt_name"];
      JsonArray sensors = doc["sensors"].as<JsonArray>();
      
      Serial.printf("Belt ID: %d\n", beltId);
      Serial.printf("Belt Name: %s\n", beltName);
      Serial.printf("Sensores encontrados: %d\n", sensors.size());
      
      for (JsonObject sensor : sensors) {
        int num = sensor["sensor_number"];
        bool enabled = sensor["enabled"];
        Serial.printf("  Sensor %d: %s\n", num, enabled ? "HABILITADO" : "DESABILITADO");
      }
    } else {
      Serial.println("[ERRO] Erro ao parsear JSON");
    }
  } else if (httpCode == 404) {
    Serial.println("[ERRO] Belt nao encontrado!");
    Serial.println("Verifique se o BELT_ID está correto e se existe no banco de dados.");
  } else {
    Serial.println("[ERRO] Erro na requisicao");
    Serial.println("Verifique se o backend está rodando e o IP está correto.");
  }
  
  http.end();
}

// ==================== TESTE 2: POST DADOS ====================
void testSendData() {
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/acquisition/ingest/";
  
  Serial.println("URL: " + url);
  
  // Criar JSON com dados simulados
  DynamicJsonDocument doc(2048);
  doc["belt_id"] = BELT_ID;
  doc["encoder_count"] = 12345;
  
  JsonArray sensors = doc.createNestedArray("sensors");
  
  // Simular 3 sensores
  JsonObject s1 = sensors.createNestedObject();
  s1["sensor_id"] = 1;
  s1["voltage"] = 2.31;
  
  JsonObject s2 = sensors.createNestedObject();
  s2["sensor_id"] = 2;
  s2["voltage"] = 2.45;
  
  JsonObject s3 = sensors.createNestedObject();
  s3["sensor_id"] = 3;
  s3["voltage"] = 2.18;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("JSON enviado:");
  Serial.println(jsonString);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(jsonString);
  Serial.printf("HTTP Code: %d\n", httpCode);
  
  if (httpCode == 201) {
    String response = http.getString();
    Serial.println("[OK] Dados enviados com sucesso!");
    Serial.println("Resposta:");
    Serial.println(response);
  } else {
    Serial.println("[ERRO] Erro ao enviar dados");
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Resposta:");
      Serial.println(response);
    }
  }
  
  http.end();
}

// ==================== TESTE 3: TOGGLE SENSOR ====================
void testToggleSensor(int sensorId, bool enabled) {
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/configuration/toggle-sensor/";
  
  Serial.println("URL: " + url);
  
  // Criar JSON
  DynamicJsonDocument doc(256);
  doc["sensor_id"] = sensorId;
  doc["enabled"] = enabled;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("JSON enviado:");
  Serial.println(jsonString);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(jsonString);
  Serial.printf("HTTP Code: %d\n", httpCode);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.printf("[OK] Sensor %d %s com sucesso!\n", sensorId, enabled ? "habilitado" : "desabilitado");
    Serial.println("Resposta:");
    Serial.println(response);
  } else {
    Serial.println("[ERRO] Erro ao alterar sensor");
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Resposta:");
      Serial.println(response);
    }
  }
  
  http.end();
}
