# 🔌 API - Exemplos de Uso

## Endpoints Disponíveis

### 1. Configuração de Sensores

#### GET - Buscar configuração dos sensores
```http
GET /api/configuration/sensors/?belt_id=1
```

**Resposta (200 OK):**
```json
{
  "status": "success",
  "belt_id": 1,
  "belt_name": "Correia Principal",
  "encoder_pulses_per_revolution": 360,
  "sensors": [
    {
      "id": 1,
      "sensor_number": 1,
      "enabled": true,
      "plate_size_mm": 50.0,
      "offset_longitudinal_mm": 0.0,
      "offset_lateral_mm": 100.0
    },
    {
      "id": 2,
      "sensor_number": 2,
      "enabled": false,
      "plate_size_mm": 50.0,
      "offset_longitudinal_mm": 0.0,
      "offset_lateral_mm": 200.0
    }
  ]
}
```

#### GET - Buscar configuração completa da correia
```http
GET /api/configuration/belt/?belt_id=1
```

**Resposta (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Correia Principal",
    "length_m": 100.0,
    "width_mm": 1000.0,
    "speed_m_s": 2.5,
    "encoder_pulses_per_revolution": 360,
    "sensors": [...]
  }
}
```

#### POST - Habilitar/Desabilitar sensor
```http
POST /api/configuration/toggle-sensor/
Content-Type: application/json

{
  "sensor_id": 1,
  "enabled": true
}
```

**Resposta (200 OK):**
```json
{
  "status": "success",
  "message": "Sensor 1 enabled",
  "sensor": {
    "id": 1,
    "sensor_number": 1,
    "enabled": true,
    "plate_size_mm": 50.0,
    "offset_longitudinal_mm": 0.0,
    "offset_lateral_mm": 100.0
  }
}
```

---

### 2. Aquisição de Dados

#### POST - Enviar dados (single batch)
```http
POST /api/acquisition/ingest/
Content-Type: application/json

{
  "belt_id": 1,
  "encoder_count": 12345,
  "sensors": [
    {"sensor_id": 1, "voltage": 2.31},
    {"sensor_id": 3, "voltage": 2.45},
    {"sensor_id": 5, "voltage": 2.18}
  ]
}
```

**Resposta (201 Created):**
```json
{
  "status": "success",
  "message": "Data ingested successfully",
  "data": {
    "encoder_reading_id": 42,
    "belt_position_mm": 1234.5,
    "sensor_readings_count": 3
  }
}
```

#### POST - Enviar múltiplos batches
```http
POST /api/acquisition/batch-ingest/
Content-Type: application/json

{
  "batches": [
    {
      "belt_id": 1,
      "encoder_count": 12345,
      "sensors": [
        {"sensor_id": 1, "voltage": 2.31}
      ]
    },
    {
      "belt_id": 1,
      "encoder_count": 12346,
      "sensors": [
        {"sensor_id": 1, "voltage": 2.32}
      ]
    }
  ]
}
```

**Resposta (201 Created):**
```json
{
  "status": "batch_complete",
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "batch_index": 0,
      "status": "success",
      "data": {...}
    },
    {
      "batch_index": 1,
      "status": "success",
      "data": {...}
    }
  ]
}
```

#### GET - Buscar última leitura
```http
GET /api/acquisition/latest-reading/?belt_id=1
```

**Resposta (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 42,
    "belt": 1,
    "timestamp": "2024-01-15T10:30:00Z",
    "encoder_count": 12345,
    "belt_position_mm": 1234.5,
    "sensor_readings": [
      {
        "sensor": 1,
        "voltage_v": 2.31,
        "capacitance_pf": 150.5
      }
    ]
  }
}
```

#### GET - Buscar leituras de sensor específico
```http
GET /api/acquisition/sensor-readings/?sensor_id=1&limit=100
```

**Resposta (200 OK):**
```json
{
  "status": "success",
  "count": 100,
  "data": [
    {
      "id": 1,
      "sensor": 1,
      "timestamp": "2024-01-15T10:30:00Z",
      "voltage_v": 2.31,
      "capacitance_pf": 150.5
    },
    ...
  ]
}
```

---

## 🧪 Exemplos com cURL

### Configuração

```bash
# Buscar configuração dos sensores
curl -X GET "http://localhost:8000/api/configuration/sensors/?belt_id=1"

# Buscar configuração da correia
curl -X GET "http://localhost:8000/api/configuration/belt/?belt_id=1"

# Habilitar sensor 1
curl -X POST http://localhost:8000/api/configuration/toggle-sensor/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": 1, "enabled": true}'

# Desabilitar sensor 1
curl -X POST http://localhost:8000/api/configuration/toggle-sensor/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": 1, "enabled": false}'
```

### Aquisição

```bash
# Enviar dados
curl -X POST http://localhost:8000/api/acquisition/ingest/ \
  -H "Content-Type: application/json" \
  -d '{
    "belt_id": 1,
    "encoder_count": 12345,
    "sensors": [
      {"sensor_id": 1, "voltage": 2.31},
      {"sensor_id": 2, "voltage": 2.45}
    ]
  }'

# Buscar última leitura
curl -X GET "http://localhost:8000/api/acquisition/latest-reading/?belt_id=1"

# Buscar leituras de sensor
curl -X GET "http://localhost:8000/api/acquisition/sensor-readings/?sensor_id=1&limit=10"
```

---

## 🐍 Exemplos com Python

### Configuração

```python
import requests

BASE_URL = "http://localhost:8000"
BELT_ID = 1

# Buscar configuração
response = requests.get(
    f"{BASE_URL}/api/configuration/sensors/",
    params={"belt_id": BELT_ID}
)
config = response.json()
print(f"Sensores habilitados: {len([s for s in config['sensors'] if s['enabled']])}")

# Habilitar sensor
response = requests.post(
    f"{BASE_URL}/api/configuration/toggle-sensor/",
    json={"sensor_id": 1, "enabled": True}
)
print(response.json()["message"])
```

### Aquisição

```python
import requests
import time

BASE_URL = "http://localhost:8000"
BELT_ID = 1

# Simular envio de dados
encoder_count = 0

while True:
    # Simular leituras
    data = {
        "belt_id": BELT_ID,
        "encoder_count": encoder_count,
        "sensors": [
            {"sensor_id": 1, "voltage": 2.31 + (encoder_count % 10) * 0.01},
            {"sensor_id": 2, "voltage": 2.45 + (encoder_count % 10) * 0.01},
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/acquisition/ingest/",
        json=data
    )
    
    if response.status_code == 201:
        print(f"✓ Dados enviados: encoder={encoder_count}")
    else:
        print(f"✗ Erro: {response.status_code}")
    
    encoder_count += 1
    time.sleep(0.1)  # 10 Hz
```

---

## 🔧 Exemplos com Arduino/ESP32

### Buscar Configuração

```cpp
void getConfiguration() {
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/configuration/sensors/?belt_id=" + String(BELT_ID);
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    
    DynamicJsonDocument doc(4096);
    deserializeJson(doc, payload);
    
    JsonArray sensors = doc["sensors"];
    for (JsonObject sensor : sensors) {
      int num = sensor["sensor_number"];
      bool enabled = sensor["enabled"];
      sensorEnabled[num - 1] = enabled;
    }
  }
  
  http.end();
}
```

### Enviar Dados

```cpp
void sendData() {
  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/acquisition/ingest/";
  
  DynamicJsonDocument doc(2048);
  doc["belt_id"] = BELT_ID;
  doc["encoder_count"] = encoderCount;
  
  JsonArray sensors = doc.createNestedArray("sensors");
  
  for (int i = 0; i < 16; i++) {
    if (sensorEnabled[i]) {
      float voltage = (analogRead(SENSOR_PINS[i]) / 4095.0) * 3.3;
      
      JsonObject sensor = sensors.createNestedObject();
      sensor["sensor_id"] = i + 1;
      sensor["voltage"] = voltage;
    }
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode == 201) {
    Serial.println("✓ Dados enviados");
  }
  
  http.end();
}
```

---

## 📊 Códigos de Status HTTP

| Código | Significado | Quando ocorre |
|--------|-------------|---------------|
| 200 | OK | Requisição GET bem-sucedida |
| 201 | Created | Dados criados com sucesso |
| 207 | Multi-Status | Batch parcialmente bem-sucedido |
| 400 | Bad Request | Dados inválidos ou faltando parâmetros |
| 404 | Not Found | Recurso não encontrado (belt_id, sensor_id) |
| 500 | Server Error | Erro interno do servidor |

---

## 🔍 Validação de Dados

### Regras de Validação

**belt_id:**
- Obrigatório
- Deve existir no banco de dados
- Tipo: inteiro

**encoder_count:**
- Obrigatório
- Tipo: inteiro
- Valor: >= 0

**sensor_id:**
- Obrigatório
- Deve existir no banco de dados
- Tipo: inteiro (1-16)

**voltage:**
- Obrigatório
- Tipo: float
- Faixa: 0.0 - 3.3V (recomendado)

**enabled:**
- Obrigatório (para toggle)
- Tipo: boolean

---

## 🚨 Tratamento de Erros

### Erro 400 - Bad Request

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "belt_id": ["This field is required."],
    "sensors": ["This field is required."]
  }
}
```

### Erro 404 - Not Found

```json
{
  "status": "error",
  "message": "Belt with id 999 not found"
}
```

### Erro 500 - Server Error

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## 💡 Dicas de Uso

### Performance

1. **Batch Ingest:** Use para enviar múltiplas leituras de uma vez
2. **Limite de Dados:** Não envie mais de 100 leituras por batch
3. **Intervalo:** Recomendado 100ms entre leituras (10 Hz)

### Segurança

1. **CORS:** Configurado para desenvolvimento
2. **Authentication:** Atualmente AllowAny (adicionar auth em produção)
3. **Rate Limiting:** Considerar adicionar em produção

### Debugging

1. Use `curl -v` para ver headers completos
2. Verifique logs do Django para erros detalhados
3. Use Postman/Insomnia para testar endpoints manualmente

---

## 📚 Referências

- [Django REST Framework](https://www.django-rest-framework.org/)
- [ESP32 HTTPClient](https://github.com/espressif/arduino-esp32/tree/master/libraries/HTTPClient)
- [ArduinoJson](https://arduinojson.org/)
