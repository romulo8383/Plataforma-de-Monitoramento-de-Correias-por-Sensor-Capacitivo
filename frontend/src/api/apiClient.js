// src/api/apiClient.js
// API client for communication with Django backend

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = {
  // Acquisition endpoints
  ingestSensorData: async (belCorrId, encoderCount, sensors) => {
    try {
      const response = await fetch(`${API_BASE_URL}/acquisition/ingest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          belt_id: belCorrId,
          encoder_count: encoderCount,
          sensors: sensors,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error ingesting sensor data:', error);
      throw error;
    }
  },

  getLatestReading: async (beltId) => {
    try {
      const url = beltId
        ? `${API_BASE_URL}/acquisition/latest-reading/?belt_id=${beltId}`
        : `${API_BASE_URL}/acquisition/latest-reading/`;
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching latest reading:', error);
      throw error;
    }
  },

  getSensorReadings: async (sensorId, limit = 100) => {
    try {
      const url = sensorId
        ? `${API_BASE_URL}/acquisition/sensor-readings/?sensor_id=${sensorId}&limit=${limit}`
        : `${API_BASE_URL}/acquisition/sensor-readings/?limit=${limit}`;
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching sensor readings:', error);
      throw error;
    }
  },

  // Configuration endpoints (to be implemented later)
  getBelts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/configuration/belts/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching belts:', error);
      throw error;
    }
  },

  getSensors: async (beltId) => {
    try {
      const url = beltId
        ? `${API_BASE_URL}/configuration/sensors/?belt_id=${beltId}`
        : `${API_BASE_URL}/configuration/sensors/`;
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching sensors:', error);
      throw error;
    }
  },

  getSensorCalibrations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/configuration/calibrations/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching calibrations:', error);
      throw error;
    }
  },

  toggleSensor: async (sensorId, enabled) => {
    try {
      const response = await fetch(`${API_BASE_URL}/configuration/toggle-sensor/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sensor_id: sensorId,
          enabled: enabled,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error toggling sensor:', error);
      throw error;
    }
  },

  createCalibration: async (calibrationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/configuration/calibrations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calibrationData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating calibration:', error);
      throw error;
    }
  },

  getCalibrations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/configuration/calibrations/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching calibrations:', error);
      throw error;
    }
  },

  getCalibrationById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/configuration/calibrations/detail/?id=${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching calibration by id:', error);
      throw error;
    }
  },
};
