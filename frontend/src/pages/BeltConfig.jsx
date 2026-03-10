// src/pages/BeltConfig.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BeltConfig.css';
import '../styles/ConfigShared.css';

const BeltConfig = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    length: 1120,
    width: 500,
    speed: 1.5,
    pulsesPerRevolution: 1000,
    encoderEnabled: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (parseFloat(value) || 0)
    }));
  };

  const handleSave = () => {
    console.log('Salvando configuração:', config);
    alert('Configuração salva com sucesso!');
  };

  return (
    <div className="belt-config-page">
      <div className="config-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Voltar ao Dashboard
        </button>
        <h1>Configuração da Correia Transportadora</h1>
      </div>

      <div className="config-content">
        <div className="config-section">
          <h2>Dimensões da Correia</h2>
          <div className="config-grid">
            <div className="config-field">
              <label htmlFor="length">Comprimento (mm)</label>
              <input
                type="number"
                id="length"
                name="length"
                value={config.length}
                onChange={handleChange}
              />
            </div>
            <div className="config-field">
              <label htmlFor="width">Largura (mm)</label>
              <input
                type="number"
                id="width"
                name="width"
                value={config.width}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2>Parâmetros de Operação</h2>
          <div className="config-grid">
            <div className="config-field">
              <label htmlFor="speed">Velocidade (m/s)</label>
              <input
                type="number"
                id="speed"
                name="speed"
                step="0.1"
                value={config.speed}
                onChange={handleChange}
              />
            </div>
            <div className="config-field">
              <label htmlFor="pulsesPerRevolution">Pulsos por Revolução</label>
              <input
                type="number"
                id="pulsesPerRevolution"
                name="pulsesPerRevolution"
                value={config.pulsesPerRevolution}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2>Encoder</h2>
          <div className="encoder-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                name="encoderEnabled"
                checked={config.encoderEnabled}
                onChange={handleChange}
              />
              <span className="toggle-text">
                {config.encoderEnabled ? 'Encoder Ativado' : 'Encoder Desativado'}
              </span>
            </label>
            <p className="toggle-description">
              {config.encoderEnabled 
                ? 'O encoder está rastreando a posição da correia automaticamente.'
                : 'Modo manual ativado. Você pode mover a correia manualmente para testes.'}
            </p>
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

export default BeltConfig;
