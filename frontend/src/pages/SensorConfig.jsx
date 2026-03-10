// src/pages/SensorConfig.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import '../styles/SensorConfig.css';
import '../styles/ConfigShared.css';

const SensorConfig = () => {
  const navigate = useNavigate();
  const { sensorConfig, updateSensorConfig } = useConfig();
  const [sensors, setSensors] = useState(sensorConfig);

  useEffect(() => {
    setSensors(sensorConfig);
  }, [sensorConfig]);

  const toggleSensor = (sensorNumber) => {
    setSensors(prev =>
      prev.map(sensor =>
        sensor.number === sensorNumber
          ? { ...sensor, enabled: !sensor.enabled }
          : sensor
      )
    );
  };

  const handleSave = () => {
    updateSensorConfig(sensors);
    console.log('Salvando configuração de sensores:', sensors);
    alert('Configuração de sensores salva com sucesso!');
    navigate('/');
  };

  const activeSensorsCount = sensors.filter(s => s.enabled).length;

  return (
    <div className="sensor-config-page">
      <div className="config-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Voltar ao Dashboard
        </button>
        <h1>Configuração de Sensores</h1>
      </div>

      <div className="config-content">
        <div className="config-section">
          <h2>Sensores Capacitivos</h2>
          <div className="sensor-info-box">
            <p>Total de sensores: <strong>16</strong></p>
            <p>Sensores ativos: <strong>{activeSensorsCount}</strong></p>
            <p>Tamanho da placa: <strong>65 mm</strong></p>
          </div>
        </div>

        <div className="config-section">
          <h2>Ativar/Desativar Sensores</h2>
          <div className="sensor-grid">
            {sensors.map((sensor) => (
              <div
                key={sensor.number}
                className={`sensor-card ${sensor.enabled ? 'active' : 'inactive'}`}
                onClick={() => toggleSensor(sensor.number)}
              >
                <div className="sensor-number">S{sensor.number}</div>
                <div className="sensor-status">
                  {sensor.enabled ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="config-actions">
          <button className="btn-cancel" onClick={() => navigate('/')}>
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSave}>
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  );
};

export default SensorConfig;
