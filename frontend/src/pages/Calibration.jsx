// src/pages/Calibration.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalibrationScreen from '../components/CalibrationScreen';
import '../styles/Calibration.css';
import '../styles/ConfigShared.css';

const Calibration = () => {
  const navigate = useNavigate();

  return (
    <div className="calibration-page">
      <div className="config-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Voltar ao Dashboard
        </button>
        <h1>Calibração do Sistema</h1>
      </div>

      <div className="config-content">
        <CalibrationScreen />
      </div>
    </div>
  );
};

export default Calibration;
