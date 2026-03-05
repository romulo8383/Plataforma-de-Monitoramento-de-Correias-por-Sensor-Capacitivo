// src/components/ProfileWindow.jsx
import React from 'react';
import '../styles/ProfileWindow.css';

const ProfileWindow = ({
  selectedSensor,
  voltage,
  capacitance,
  encoderPosition,
  beltThickness,
  maxCapacitance,
}) => {
  // Calculate the height of the profile based on measured capacitance
  // Assuming thickness is proportional to capacitance
  const thicknessPercentage = maxCapacitance > 0 
    ? ((capacitance || 0) / maxCapacitance) * 100 
    : 0;

  // Clamp to 0-100%
  const safThicknessPercentage = Math.max(0, Math.min(100, thicknessPercentage));

  return (
    <div className="profile-window-container">
      <h3 className="profile-title">
        Perfil - {selectedSensor ? `Sensor ${selectedSensor.sensor_number}` : 'Nenhum selecionado'}
      </h3>

      <div className="profile-window">
        {/* Measurement visualization */}
        <div className="profile-visualization">
          {/* Top line (moving) */}
          <div
            className="profile-line profile-line-top"
            style={{
              bottom: `${safThicknessPercentage}%`,
            }}
          >
            <div className="line-label-top">
              {capacitance?.toFixed(2) || '0.00'} pF
            </div>
          </div>

          {/* Grid background */}
          <div className="profile-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid-line" style={{ bottom: `${i * 25}%` }} />
            ))}
          </div>

          {/* Bottom line (fixed) */}
          <div className="profile-line profile-line-bottom">
            <div className="line-label-bottom">Base</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWindow;
