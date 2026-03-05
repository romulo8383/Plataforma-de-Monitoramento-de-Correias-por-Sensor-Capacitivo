// src/components/ConveyorBeltDisplay.jsx
import React from 'react';
import '../styles/ConveyorBeltDisplay.css';

const ConveyorBeltDisplay = ({
  activeSensors,
  selectedSensorId,
  onSensorSelect,
  beltLength,
  encoderPosition,
  allSensors = [],
  sensorHistory = {}, // Historical readings for each sensor
}) => {
  const [displayMode, setDisplayMode] = React.useState('color'); // 'color' or 'graph'

  // Calculate position indicator
  const positionPercentage = beltLength > 0 ? (encoderPosition / beltLength) * 100 : 0;

  // Reference capacitance for color scaling (4pF = white, 0.001pF = black)
  const referenceCapacitance = 4.0;
  const minCapacitance = 0.001;

  // Function to get grayscale color based on capacitance
  const getCapacitanceColor = (capacitance) => {
    if (capacitance === undefined || capacitance === null) return '#cccccc';
    const normalized = Math.max(0, Math.min(1, (capacitance - minCapacitance) / (referenceCapacitance - minCapacitance)));
    const grayValue = Math.round(normalized * 255);
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  };

  // Get maximum history length across all sensors for consistent width
  const maxHistoryLength = Math.max(
    ...activeSensors.map(sensor => (sensorHistory[sensor.id] || []).length),
    1
  );

  // Calculate percentage from capacitance
  const getPercentage = (capacitance) => {
    if (capacitance === undefined || capacitance === null) return 0;
    return Math.max(0, Math.min(100, ((capacitance - minCapacitance) / (referenceCapacitance - minCapacitance)) * 100));
  };

  // Lane height based on number of active sensors
  const laneHeight = activeSensors.length > 0 ? 100 / activeSensors.length : 100;

  return (
    <div className="conveyor-display-container">
      <div className="conveyor-belt-wrapper">
        <div className="conveyor-header">
          <h3 className="conveyor-title">Correia Transportadora</h3>
          
          {/* Display Mode Toggle */}
          <div className="display-mode-toggle">
            <span className={displayMode === 'color' ? 'active' : ''}>Cor</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={displayMode === 'graph'}
                onChange={() => setDisplayMode(displayMode === 'color' ? 'graph' : 'color')}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className={displayMode === 'graph' ? 'active' : ''}>Gráfico</span>
          </div>
        </div>

        {/* Sensor status bar - all 16 sensors */}
        <div className="sensor-status-bar">
          {Array.from({ length: 16 }, (_, i) => {
            const sensorNumber = i + 1;
            const sensor = allSensors.find(s => s.sensor_number === sensorNumber) || { sensor_number: sensorNumber, enabled: false };
            const isActive = sensor.enabled;

            return (
              <div
                key={sensorNumber}
                className={`sensor-status-item ${isActive ? 'active' : 'inactive'}`}
                title={`Sensor ${sensorNumber} - ${isActive ? 'Ativo' : 'Inativo'}`}
              >
                S{sensorNumber}
              </div>
            );
          })}
        </div>

        {/* Active capacitor display at right end */}
        {selectedSensorId && (
          <div className="active-capacitor-display">
            <div className="active-capacitor-label">
              Capacitor Ativo: S{activeSensors.find(s => s.id === selectedSensorId)?.sensor_number || '?'}
            </div>
            <div className="active-capacitor-value">
              {activeSensors.find(s => s.id === selectedSensorId)?.capacitance_pf?.toFixed(3) || '0.000'} pF
            </div>
          </div>
        )}

        {/* Conveyor belt with vertical lanes and horizontal history */}
        <div className="conveyor-belt">
          {activeSensors.map((sensor, laneIndex) => {
            const history = sensorHistory[sensor.id] || [];
            const readingWidth = maxHistoryLength > 0 ? 100 / maxHistoryLength : 100;

            return (
              <div
                key={sensor.id}
                className={`sensor-lane ${selectedSensorId === sensor.id ? 'selected' : ''}`}
                style={{
                  height: `${laneHeight}%`,
                }}
                title={`Sensor ${sensor.sensor_number} - ${history.length || 0} readings`}
              >
                {/* Percentage legend for graph mode */}
                {displayMode === 'graph' && (
                  <div className="percentage-legend">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                )}

                {/* Historical readings */}
                <div className="history-container">
                  {displayMode === 'color' ? (
                    // Color mode - existing implementation
                    <>
                      {history.map((reading, idx) => (
                        <div
                          key={idx}
                          className="reading-column"
                          style={{
                            width: `${readingWidth}%`,
                            backgroundColor: getCapacitanceColor(reading.capacitance_pf),
                            borderRight: '1px solid rgba(255,255,255,0.2)',
                          }}
                          title={`${reading.capacitance_pf?.toFixed(3) || '0.000'} pF`}
                        />
                      ))}
                      {history.length < maxHistoryLength &&
                        Array.from({ length: maxHistoryLength - history.length }).map((_, idx) => (
                          <div
                            key={`empty-${idx}`}
                            className="reading-column empty"
                            style={{
                              width: `${readingWidth}%`,
                              backgroundColor: '#f0f0f0',
                              borderRight: '1px solid rgba(255,255,255,0.2)',
                            }}
                          />
                        ))}
                    </>
                  ) : (
                    // Graph mode - line graph implementation
                    <svg
                      className="line-graph"
                      width="100%"
                      height="100%"
                      preserveAspectRatio="none"
                      style={{ backgroundColor: 'white' }}
                    >
                      {history.map((reading, idx) => {
                        const percentage = getPercentage(reading.capacitance_pf);
                        const x = (idx / maxHistoryLength) * 100;
                        const nextReading = history[idx + 1];
                        const nextPercentage = nextReading ? getPercentage(nextReading.capacitance_pf) : percentage;
                        const nextX = ((idx + 1) / maxHistoryLength) * 100;
                        
                        return (
                          <line
                            key={idx}
                            x1={`${x}%`}
                            y1={`${100 - percentage}%`}
                            x2={`${nextX}%`}
                            y2={`${100 - nextPercentage}%`}
                            stroke="var(--primary-color)"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>

                {/* Sensor label on right */}
                <div className="sensor-lane-label">
                  S{sensor.sensor_number}
                </div>
              </div>
            );
          })}
        </div>

        {/* Position indicator with belt movement */}
        <div className="position-indicator-wrapper">
          <div className="position-indicator-track">
            <div
              className="position-indicator-marker"
              style={{
                right: `${positionPercentage}%`,
                transition: 'right 0.25s ease-out',
              }}
            >
              <div className="position-marker-label">
                {encoderPosition.toFixed(2)} mm
              </div>
            </div>
          </div>
          <div className="position-display">
            <span className="position-label">Posição:</span>
            <span className="position-value">{encoderPosition.toFixed(2)} mm</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConveyorBeltDisplay;
