# Configuration App

## Purpose
Manages system setup, device configuration, and parameter management for the belt monitoring system.

## Responsibilities
- Device registry and management
- Sensor configuration (calibration, sensitivity parameters)
- System settings and user preferences
- Alert thresholds and limit configuration
- User permissions and access control
- API endpoints for CRUD operations

## Models to Implement
- `Device` - Represents a physical monitoring device
- `Sensor` - Represents individual sensors attached to devices
- `AlertThreshold` - Defines alert conditions and limits
- `SystemSettings` - Stores system-wide configuration

## Key Endpoints (to be implemented)
- `GET /api/configuration/devices/` - List all devices
- `POST /api/configuration/devices/` - Create new device
- `GET /api/configuration/sensors/` - List all sensors
- `POST /api/configuration/sensors/` - Register new sensor
- `GET/POST /api/configuration/thresholds/` - Manage alert thresholds

## Related Apps
- Interacts with `acquisition` app for sensor data validation
- Provides settings for `visualization` app

## Admin Interface
All models should be registered in `admin.py` for easy management via Django admin panel.
