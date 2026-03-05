// src/components/Selector.jsx
import React from 'react';
import '../styles/Selector.css';

const Selector = ({ sensors, selectedSensorId, onSelect }) => {
  return (
    <div className="selector-container">
      <label htmlFor="sensor-select" className="selector-label">
        Selecionar Sensor:
      </label>
      <select
        id="sensor-select"
        className="selector-dropdown"
        value={selectedSensorId || ''}
        onChange={(e) => onSelect(Number(e.target.value))}
      >
        <option value="">-- Selecione um sensor --</option>
        {sensors.map((sensor) => (
          <option key={sensor.id} value={sensor.id}>
            Sensor {sensor.sensor_number}
            {sensor.voltage_v && ` (${sensor.voltage_v.toFixed(2)}V)`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Selector;
