# Acquisition API

## Overview

The Acquisition API is responsible for receiving real-time sensor and encoder data from hardware IoT devices (ESP32, Raspberry Pi, etc.) and storing it in the database.

## Base Endpoint

All API endpoints start with:
```
http://localhost:8000/api/acquisition/
```

## Endpoints

### 1. Data Ingestion (Single Batch)

**Endpoint:** `POST /api/acquisition/ingest/`

**Purpose:** Ingest sensor and encoder data from hardware devices.

**Request Format:**
```json
{
  "belt_id": 1,
  "encoder_count": 182344,
  "sensors": [
    {
      "sensor_id": 1,
      "voltage": 2.31
    },
    {
      "sensor_id": 2,
      "voltage": 2.45
    },
    ...
    {
      "sensor_id": 16,
      "voltage": 2.12
    }
  ]
}
```

**Response (Success - 201 Created):**
```json
{
  "status": "success",
  "message": "Data ingested successfully",
  "data": {
    "encoder_reading_id": 42,
    "belt_position_mm": 523.45,
    "sensor_readings_count": 16
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "sensors": ["At least one sensor reading is required."]
  }
}
```

**Validation Rules:**
- `belt_id`: Must exist in the database
- `encoder_count`: Must be non-negative
- `sensors`: 
  - Minimum: 1 sensor
  - Maximum: 16 sensors
  - `sensor_id`: Must exist in the database
  - `voltage`: Must be between 0V and 5V

---

### 2. Batch Ingestion (Multiple Batches)

**Endpoint:** `POST /api/acquisition/batch-ingest/`

**Purpose:** Ingest multiple data batches in a single request.

**Request Format:**
```json
{
  "batches": [
    {
      "belt_id": 1,
      "encoder_count": 182344,
      "sensors": [
        {"sensor_id": 1, "voltage": 2.31},
        {"sensor_id": 2, "voltage": 2.45}
      ]
    },
    {
      "belt_id": 1,
      "encoder_count": 182354,
      "sensors": [
        {"sensor_id": 1, "voltage": 2.32},
        {"sensor_id": 2, "voltage": 2.46}
      ]
    }
  ]
}
```

**Response (207 Multi-Status - If some succeed and some fail):**
```json
{
  "status": "batch_complete",
  "total": 2,
  "successful": 1,
  "failed": 1,
  "results": [
    {
      "batch_index": 0,
      "status": "success",
      "data": {
        "encoder_reading_id": 42,
        "belt_position_mm": 523.45,
        "sensor_readings_count": 2
      }
    },
    {
      "batch_index": 1,
      "status": "error",
      "message": "Belt with ID 2 does not exist."
    }
  ]
}
```

---

### 3. Latest Reading

**Endpoint:** `GET /api/acquisition/latest-reading/`

**Purpose:** Retrieve the most recent encoder reading.

**Query Parameters:**
- `belt_id` (optional): Filter by specific belt

**Examples:**
```
GET /api/acquisition/latest-reading/
GET /api/acquisition/latest-reading/?belt_id=1
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": 42,
    "belt": 1,
    "belt_name": "Main Conveyor",
    "encoder_count": 182344,
    "belt_position_mm": 523.45,
    "timestamp": "2026-03-05T14:30:45.123456Z"
  }
}
```

---

### 4. Sensor Readings

**Endpoint:** `GET /api/acquisition/sensor-readings/`

**Purpose:** Retrieve sensor readings with filtering options.

**Query Parameters:**
- `sensor_id` (optional): Filter by specific sensor
- `limit` (optional): Number of records to return (default: 100, max recommended: 1000)

**Examples:**
```
GET /api/acquisition/sensor-readings/
GET /api/acquisition/sensor-readings/?sensor_id=1
GET /api/acquisition/sensor-readings/?sensor_id=1&limit=50
```

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": 1,
      "sensor": 1,
      "sensor_number": 1,
      "encoder_reading": 42,
      "encoder_reading_position": 523.45,
      "voltage_v": 2.31,
      "capacitance_pf": null,
      "timestamp": "2026-03-05T14:30:45.123456Z"
    },
    {
      "id": 2,
      "sensor": 2,
      "sensor_number": 2,
      "encoder_reading": 42,
      "encoder_reading_position": 523.45,
      "voltage_v": 2.45,
      "capacitance_pf": null,
      "timestamp": "2026-03-05T14:30:45.123456Z"
    }
  ]
}
```

---

## Data Flow

1. **Hardware Device** sends POST request with encoder_count and sensor voltages
2. **API** validates input data
3. **EncoderReading** is created with:
   - Raw encoder_count
   - Calculated belt_position_mm based on belt configuration
4. **SensorReading** instances are created for each sensor, linked to the EncoderReading
5. **Response** is returned with success status and created IDs

## Error Handling

### Common Errors

**400 Bad Request** - Invalid input data:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "belt_id": ["This field is required."],
    "sensors": ["At least one sensor reading is required."]
  }
}
```

**400 Bad Request** - Sensor does not exist:
```json
{
  "status": "error",
  "errors": {
    "sensors": [
      {
        "sensor_id": ["Sensor with ID 99 does not exist."]
      }
    ]
  }
}
```

**400 Bad Request** - Voltage out of range:
```json
{
  "status": "error",
  "errors": {
    "sensors": [
      {
        "voltage": ["Voltage exceeds typical range (0-5V)."]
      }
    ]
  }
}
```

**404 Not Found** - No data available:
```json
{
  "status": "error",
  "message": "No encoder readings found"
}
```

---

## Usage Examples

### Example 1: ESP32 with 16 Sensors

```python
import requests
import json

# Device sends data to Django API
url = "http://192.168.1.100:8000/api/acquisition/ingest/"
data = {
    "belt_id": 1,
    "encoder_count": 182344,
    "sensors": [
        {"sensor_id": i, "voltage": 2.3 + i*0.01}
        for i in range(1, 17)
    ]
}

response = requests.post(url, json=data)
print(response.json())
```

### Example 2: Using cURL

```bash
curl -X POST http://localhost:8000/api/acquisition/ingest/ \
  -H "Content-Type: application/json" \
  -d '{
    "belt_id": 1,
    "encoder_count": 182344,
    "sensors": [
      {"sensor_id": 1, "voltage": 2.31},
      {"sensor_id": 2, "voltage": 2.45},
      {"sensor_id": 3, "voltage": 2.38}
    ]
  }'
```

### Example 3: Batch Ingestion

```bash
curl -X POST http://localhost:8000/api/acquisition/batch-ingest/ \
  -H "Content-Type: application/json" \
  -d '{
    "batches": [
      {
        "belt_id": 1,
        "encoder_count": 182344,
        "sensors": [{"sensor_id": 1, "voltage": 2.31}]
      },
      {
        "belt_id": 1,
        "encoder_count": 182354,
        "sensors": [{"sensor_id": 1, "voltage": 2.32}]
      }
    ]
  }'
```

---

## Performance Considerations

1. **Single Ingest**: Optimized for real-time data from a single device
2. **Batch Ingest**: Use when you have multiple readings buffered
3. **Indexing**: Database queries are optimized with proper indexes on timestamp fields
4. **Rate Limiting**: Can be added later if needed

## Future Enhancements

- Authentication and API key validation
- Rate limiting per device
- WebSocket support for real-time data streaming
- Automatic capacitance calculation using calibration polynomial
- Data compression and archival strategies
