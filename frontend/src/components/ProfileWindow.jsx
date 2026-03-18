// src/components/ProfileWindow.jsx
import React from 'react';
import '../styles/ProfileWindow.css';

const ProfileWindow = ({
  selectedSensor,
  capacitance,
  minCapacitance,
  maxCapacitance,
}) => {
  const range = (maxCapacitance - minCapacitance) || 1;
  const percentage = Math.max(0, Math.min(100, ((capacitance || 0) - minCapacitance) / range * 100));

  return (
    <div className="profile-window-container">
      <h3 className="profile-title">
        Perfil - {selectedSensor ? `Sensor ${selectedSensor.sensor_number}` : 'Nenhum selecionado'}
      </h3>

      <div className="profile-window">
        <div className="profile-visualization">
          <div
            className="profile-line profile-line-top"
            style={{ bottom: `${percentage}%` }}
          >
            <div className="line-label-top">
              {capacitance?.toFixed(2) || '0.00'} pF
            </div>
          </div>

          <div className="profile-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid-line" style={{ bottom: `${i * 25}%` }} />
            ))}
          </div>

          <div className="profile-line profile-line-bottom">
            <div className="line-label-bottom">Base</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWindow;
