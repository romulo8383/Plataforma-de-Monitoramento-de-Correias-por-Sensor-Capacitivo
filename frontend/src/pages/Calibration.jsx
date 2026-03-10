// src/pages/Calibration.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Calibration.css';
import '../styles/ConfigShared.css';

const Calibration = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    referenceCapacitor: 4.0,
    calibrationPoints: 5,
    status: 'Calibrado',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleCalibrate = () => {
    console.log('Iniciando calibração:', config);
    alert('Calibração iniciada!');
  };

  return (
    <div className="calibration-page">
      <div className="config-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Voltar ao Dashboard
        </button>
        <h1>Calibração do Sistema</h1>
      </div>

      <div className="config-content">
        <div className="config-section">
          <h2>Capacitor de Referência</h2>
          <div className="config-grid">
            <div className="config-field">
              <label htmlFor="referenceCapacitor">Capacitor Fixo (pF)</label>
              <input
                type="number"
                id="referenceCapacitor"
                name="referenceCapacitor"
                step="0.1"
                value={config.referenceCapacitor}
                onChange={handleChange}
              />
              <p className="field-description">
                Valor do capacitor de referência usado na calibração. Medido em correia nova.
              </p>
            </div>
            <div className="config-field">
              <label htmlFor="calibrationPoints">Pontos de Calibração</label>
              <input
                type="number"
                id="calibrationPoints"
                name="calibrationPoints"
                value={config.calibrationPoints}
                onChange={handleChange}
              />
              <p className="field-description">
                Número de pontos usados para calcular a equação polinomial.
              </p>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2>Status da Calibração</h2>
          <div className="status-box">
            <div className="status-indicator">
              <span className={`status-dot ${config.status === 'Calibrado' ? 'active' : ''}`}></span>
              <span className="status-text">{config.status}</span>
            </div>
            <p className="status-description">
              O sistema está calibrado e pronto para uso. Valores acima do capacitor de referência serão limitados automaticamente.
            </p>
          </div>
        </div>

        <div className="config-actions">
          <button className="btn-cancel" onClick={() => navigate('/')}>
            Cancelar
          </button>
          <button className="btn-calibrate" onClick={handleCalibrate}>
            Nova Calibração
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calibration;
