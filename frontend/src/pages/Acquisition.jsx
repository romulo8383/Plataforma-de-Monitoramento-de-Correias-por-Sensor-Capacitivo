// src/pages/Acquisition.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Acquisition.css';
import '../styles/ConfigShared.css';

const Acquisition = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    samplingRate: 'Contínua',
    baudRate: 115200,
    isRunning: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleAcquisition = () => {
    setConfig(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  };

  const handleSave = () => {
    console.log('Salvando configuração de aquisição:', config);
    alert('Configuração salva com sucesso!');
  };

  return (
    <div className="acquisition-page">
      <div className="config-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Voltar ao Dashboard
        </button>
        <h1>Aquisição de Dados</h1>
      </div>

      <div className="config-content">
        <div className="config-section">
          <h2>Parâmetros de Aquisição</h2>
          <div className="config-grid">
            <div className="config-field">
              <label htmlFor="samplingRate">Taxa de Amostragem</label>
              <select
                id="samplingRate"
                name="samplingRate"
                value={config.samplingRate}
                onChange={handleChange}
              >
                <option value="Contínua">Contínua</option>
                <option value="1Hz">1 Hz</option>
                <option value="10Hz">10 Hz</option>
                <option value="100Hz">100 Hz</option>
              </select>
            </div>
            <div className="config-field">
              <label htmlFor="baudRate">Velocidade de Transmissão (baud)</label>
              <select
                id="baudRate"
                name="baudRate"
                value={config.baudRate}
                onChange={handleChange}
              >
                <option value="9600">9600</option>
                <option value="19200">19200</option>
                <option value="57600">57600</option>
                <option value="115200">115200</option>
              </select>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2>Status da Aquisição</h2>
          <div className="status-box">
            <div className="status-indicator">
              <span className={`status-dot ${config.isRunning ? 'active' : ''}`}></span>
              <span className="status-text">
                {config.isRunning ? 'Em Execução' : 'Pausado'}
              </span>
            </div>
            <p className="status-description">
              {config.isRunning 
                ? 'O sistema está coletando dados dos sensores continuamente.'
                : 'A aquisição de dados está pausada. Clique em "Retomar" para continuar.'}
            </p>
            <button 
              className={`btn-toggle ${config.isRunning ? 'pause' : 'resume'}`}
              onClick={toggleAcquisition}
            >
              {config.isRunning ? 'Pausar Aquisição' : 'Retomar Aquisição'}
            </button>
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

export default Acquisition;
