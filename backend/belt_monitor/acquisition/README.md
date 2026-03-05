# Acquisition App

## Purpose
Handles real-time sensor data collection, storage, and initial processing for the belt monitoring system.

## Responsibilities
- Data ingestion from sensors (via APIs, IoT protocols, direct connections)
- Real-time data validation and quality checks
- Data storage and persistence to database
- Data archival and cleanup strategies
- Signal processing and filtering
- Anomaly detection in sensor readings
- Data streaming capabilities for real-time dashboards

## Models to Implement
- `SensorReading` - Individual sensor data points with timestamp
- `RawData` - Unprocessed sensor data for archival
- `ProcessedData` - Cleaned and validated data ready for analysis
- `DataLog` - Activity log of data ingestion and processing

## Key Endpoints (to be implemented)
- `POST /api/acquisition/readings/` - Ingest new sensor data
- `GET /api/acquisition/readings/` - Retrieve historical readings (paginated)
- `GET /api/acquisition/readings/{id}/` - Get specific reading details
- `POST /api/acquisition/batch/` - Batch data ingestion
- `GET /api/acquisition/latest/` - Get latest readings from all sensors

## Data Processing Pipeline
1. **Validation** - Check data format and sensor configuration
2. **Filtering** - Apply noise reduction and signal processing
3. **Storage** - Save raw and processed data
4. **Alerting** - Compare against thresholds from configuration app
5. **Archival** - Move old data to long-term storage

## Related Apps
- Consumes configuration from `configuration` app
- Provides data to `visualization` app for analysis

## Performance Considerations
- Use database indexing on timestamp fields
- Implement batch insert operations for high-frequency data
- Consider time-series specialized database (InfluxDB) for future scaling
