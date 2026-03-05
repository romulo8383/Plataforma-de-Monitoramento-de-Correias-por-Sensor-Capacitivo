// src/components/CapacitorSegment.jsx
import React from 'react';
import '../styles/CapacitorSegment.css';

const CapacitorSegment = ({
  sensor,
  isSelected,
  onClick,
  width,
  index,
  capacitanceColor,
}) => {
  return (
    <div
      className={`capacitor-segment ${isSelected ? 'active' : ''}`}
      style={{
        width: `${width}%`,
        backgroundColor: capacitanceColor || '#cccccc',
      }}
      onClick={onClick}
      title={`Sensor ${sensor.sensor_number} - ${sensor.enabled ? 'Ativo' : 'Inativo'} - ${sensor.capacitance_pf ? sensor.capacitance_pf.toFixed(3) + 'pF' : 'Sem dados'}`}
    >
      <div className="segment-content">
        <span className="sensor-number">S{sensor.sensor_number}</span>
        {sensor.capacitance_pf !== undefined && (
          <span className="sensor-capacitance">{sensor.capacitance_pf.toFixed(3)}pF</span>
        )}
      </div>

      {isSelected && (
        <div className="selection-indicator">
          <div className="selection-check">✓</div>
        </div>
      )}
    </div>
  );
};

export default CapacitorSegment;
