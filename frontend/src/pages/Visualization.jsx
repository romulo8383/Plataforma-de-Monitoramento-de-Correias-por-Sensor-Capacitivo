// src/pages/Visualization.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Visualization.css';
import '../styles/ConfigShared.css';

const Visualization = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    graphMode: 'Tempo real',
    historySize: 100,
    theme: 'Claro',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    console.log('Exportando dados...');
    alert('Dados exportados com sucesso!');
  };

  const handleSave = () => {
    console.log('Salvando configuração de visualização:', config);
    alert('Configuração salva com sucesso!');
  };

  return (
    <div className="visualization-page">
      <div className="config-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Voltar ao Dashboard
        </button>
        <h1>Visualização</h1>
      </div>

      <div className="config-content">
        <div className="config-section">
          <h2>Opções de Visualização</h2>
          <div className="config-grid">
            <div className="config-field">
              <label htmlFor="graphMode">Modo de Gráfico</label>
              <select
                id="graphMode"
                name="graphMode"
                value={config.graphMode}
                onChange={handleChange}
              >
                <option value="Tempo real">Tempo real</option>
                <option value="Histórico">Histórico</option>
                <option value="Comparativo">Comparativo</option>
              </select>
            </div>
            <div className="config-field">
              <label htmlFor="historySize">Histórico (leituras)</label>
              <input
                type="number"
                id="historySize"
                name="historySize"
                value={config.historySize}
                onChange={handleChange}
              />
            </div>
            <div className="config-field">
              <label htmlFor="theme">Tema</label>
              <select
                id="theme"
                name="theme"
                value={config.theme}
                onChange={handleChange}
              >
                <option value="Claro">Claro</option>
                <option value="Escuro">Escuro</option>
                <option value="Auto">Automático</option>
              </select>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2>Exportar Dados</h2>
          <div className="export-box">
            <p className="export-description">
              Exporte os dados coletados para análise externa em formato CSV ou PDF.
            </p>
            <button className="btn-export" onClick={handleExport}>
              📊 Exportar Dados
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

export default Visualization;
