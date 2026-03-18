// src/pages/SensorConfig.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import '../styles/SensorConfig.css';
import '../styles/ConfigShared.css';

const SensorConfig = () => {
  const navigate = useNavigate();
  const { sensorConfig, updateSensorConfig } = useConfig();
  
  const [sensors, setSensors] = useState(sensorConfig);
  const [beltConfig, setBeltConfig] = useState({
    offset: 5, // mm - distância da borda até primeiro capacitor
    capacitorWidth: 40, // mm - dimensão global
    capacitorHeight: 40, // mm - dimensão global
    capacitors: [
      { id: 1, posX: 5, posY: 10 },    // +5mm (direita da referência)
      { id: 2, posX: -5, posY: 30 },   // -5mm (esquerda da referência)
      { id: 3, posX: 55, posY: 10 },   // +55mm (próximo capacitor à direita)
      { id: 4, posX: -55, posY: 30 },  // -55mm (próximo capacitor à esquerda)
    ],
    beltLength: 1120, // mm (comprimento total da correia)
    beltWidth: 100, // mm (largura da correia no visualizador)
  });

  useEffect(() => {
    setSensors(sensorConfig);
    const saved = localStorage.getItem('beltConfig');
    if (saved) {
      setBeltConfig(JSON.parse(saved));
    }
  }, [sensorConfig]);

  const toggleSensor = useCallback((sensorNumber) => {
    setSensors(prev =>
      prev.map(sensor =>
        sensor.number === sensorNumber
          ? { ...sensor, enabled: !sensor.enabled }
          : sensor
      )
    );
  }, []);

  const handleCapacitorChange = useCallback((id, field, value) => {
    setBeltConfig(prev => ({
      ...prev,
      capacitors: prev.capacitors.map(cap =>
        cap.id === id ? { ...cap, [field]: parseFloat(value) || 0 } : cap
      )
    }));
  }, []);

  const handleBeltConfigChange = useCallback((field, value) => {
    setBeltConfig(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  }, []);

  const addCapacitor = useCallback(() => {
    setBeltConfig(prev => {
      const newId = Math.max(...prev.capacitors.map(c => c.id), 0) + 1;
      return {
        ...prev,
        capacitors: [...prev.capacitors, { id: newId, posX: 0, posY: 50 }]
      };
    });
  }, []);

  const removeCapacitor = useCallback((id) => { // eslint-disable-line no-unused-vars
    setBeltConfig(prev => ({
      ...prev,
      capacitors: prev.capacitors.filter(cap => cap.id !== id)
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      updateSensorConfig(sensors);
      localStorage.setItem('beltConfig', JSON.stringify(beltConfig));
      alert('Configuração de sensores e correia salva com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração.');
    }
  }, [sensors, beltConfig, updateSensorConfig, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSensorsCount = useMemo(() => sensors.filter(s => s.enabled).length, [sensors]);

  const activeCapacitors = useMemo(() => {
    return beltConfig.capacitors.filter(cap => {
      const activeSensor = sensors.find(s => s.number === cap.id);
      return activeSensor && activeSensor.enabled;
    });
  }, [beltConfig.capacitors, sensors]);

  // Função para visualizar a correia com capacitores
  const renderBeltPreview = useCallback(() => {
    const scale = 2;
    const previewWidth = beltConfig.beltLength * scale;
    const previewHeight = beltConfig.beltWidth * scale;
    const centerX = previewWidth / 2;

    return (
      <svg width={previewWidth} height={previewHeight} className="belt-preview-svg">
        {/* Fundo da correia */}
        <rect width={previewWidth} height={previewHeight} fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2"/>

        {/* Linha de referência (X=0) */}
        <line 
          x1={centerX} 
          y1="0" 
          x2={centerX} 
          y2={previewHeight}
          stroke="#ef4444" 
          strokeWidth="2" 
          strokeDasharray="5,5"
        />
        <text x={centerX + 5} y="20" fontSize="12" fill="#ef4444" fontWeight="bold">
          X = 0
        </text>

        {/* Capacitores (apenas ativos) */}
        {activeCapacitors.map((cap) => {
          const x = centerX + (cap.posX * scale);
          const y = cap.posY * scale;
          const w = beltConfig.capacitorWidth * scale;
          const h = beltConfig.capacitorHeight * scale;

          return (
            <g key={cap.id}>
              <rect
                x={x - w / 2}
                y={y - h / 2}
                width={w}
                height={h}
                fill="#2563eb"
                stroke="#1e40af"
                strokeWidth="2"
                opacity="0.8"
              />
              <text
                x={x}
                y={y + 5}
                fontSize="10"
                fill="white"
                textAnchor="middle"
                fontWeight="bold"
              >
                {cap.id}
              </text>
              {/* Coordenadas */}
              <text
                x={x}
                y={y - h / 2 - 10}
                fontSize="9"
                fill="#1e40af"
                textAnchor="middle"
              >
                X:{cap.posX.toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }, [activeCapacitors, beltConfig, sensors]);

  return (
    <div className="sensor-config-page">
      <div className="config-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Voltar ao Dashboard
        </button>
        <h1>Configuração de Sensores e Capacitores</h1>
      </div>

      <div className="config-content">
        {/* SEÇÃO 1: Seleção de Sensores */}
        <div className="config-section">
          <h2>Sensores Capacitivos (0-16)</h2>
          <div className="sensor-info-box">
            <p>Total de sensores: <strong>16</strong></p>
            <p>Sensores ativos: <strong>{activeSensorsCount}</strong></p>
          </div>

          <div className="sensor-grid">
            {sensors.map(sensor => (
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

        {/* SEÇÃO 2: Configuração da Correia */}
        <div className="config-section">
          <h2>Configuração da Correia</h2>
          
          <div className="config-grid">
            <div className="config-field">
              <label>OFFSET (mm)</label>
              <input
                type="number"
                value={beltConfig.offset}
                onChange={(e) => handleBeltConfigChange('offset', e.target.value)}
                step="0.5"
              />
              <p className="field-description">
                Distância da borda da correia até o primeiro capacitor
              </p>
            </div>

            <div className="config-field">
              <label>Comprimento da Correia (mm)</label>
              <input
                type="number"
                value={beltConfig.beltLength}
                onChange={(e) => handleBeltConfigChange('beltLength', e.target.value)}
                step="10"
              />
              <p className="field-description">
                Comprimento total da correia
              </p>
            </div>

            <div className="config-field">
              <label>Largura da Correia (mm)</label>
              <input
                type="number"
                value={beltConfig.beltWidth}
                onChange={(e) => handleBeltConfigChange('beltWidth', e.target.value)}
                step="5"
              />
              <p className="field-description">
                Largura total da correia
              </p>
            </div>

            <div className="config-field">
              <label>Largura do Capacitor (mm)</label>
              <input
                type="number"
                value={beltConfig.capacitorWidth}
                onChange={(e) => handleBeltConfigChange('capacitorWidth', e.target.value)}
                step="1"
              />
              <p className="field-description">
                Largura comum de todos os capacitores
              </p>
            </div>

            <div className="config-field">
              <label>Altura do Capacitor (mm)</label>
              <input
                type="number"
                value={beltConfig.capacitorHeight}
                onChange={(e) => handleBeltConfigChange('capacitorHeight', e.target.value)}
                step="1"
              />
              <p className="field-description">
                Altura comum de todos os capacitores
              </p>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: Posicionamento dos Capacitores */}
        <div className="config-section">
          <h2>Posicionamento dos Capacitores</h2>
          <p className="section-description">
            Organize os capacitores â esquerda (valores negativos) e à direita (valores positivos). Os campos estão dispostos visualmente para facilitar a identificação.
          </p>

          <div className="capacitor-layout">
            <div className="capacitor-column left">
              <h3>Esquerda (X Negativo)</h3>
              {beltConfig.capacitors
                .filter(cap => cap.posX < 0)
                .map((cap) => (
                  <div key={cap.id} className="capacitor-card-input">
                    <div className="cap-header">
                      <span className="cap-label">Capacitor #{cap.id}</span>
                    </div>
                    <div className="input-group">
                      <label>Pos X (mm)</label>
                      <input
                        type="number"
                        value={cap.posX}
                        onChange={(e) => handleCapacitorChange(cap.id, 'posX', e.target.value)}
                        step="1"
                        className="pos-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>Pos Y (mm)</label>
                      <input
                        type="number"
                        value={cap.posY}
                        onChange={(e) => handleCapacitorChange(cap.id, 'posY', e.target.value)}
                        step="1"
                        className="pos-input"
                      />
                    </div>
                  </div>
                ))}
              {beltConfig.capacitors.filter(cap => cap.posX < 0).length === 0 && (
                <p className="empty-message">Nenhum capacitor à esquerda</p>
              )}
            </div>

            <div className="capacitor-divider"></div>

            <div className="capacitor-column right">
              <h3>Direita (X Positivo)</h3>
              {beltConfig.capacitors
                .filter(cap => cap.posX >= 0)
                .map((cap) => (
                  <div key={cap.id} className="capacitor-card-input">
                    <div className="cap-header">
                      <span className="cap-label">Capacitor #{cap.id}</span>
                    </div>
                    <div className="input-group">
                      <label>Pos X (mm)</label>
                      <input
                        type="number"
                        value={cap.posX}
                        onChange={(e) => handleCapacitorChange(cap.id, 'posX', e.target.value)}
                        step="1"
                        className="pos-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>Pos Y (mm)</label>
                      <input
                        type="number"
                        value={cap.posY}
                        onChange={(e) => handleCapacitorChange(cap.id, 'posY', e.target.value)}
                        step="1"
                        className="pos-input"
                      />
                    </div>
                  </div>
                ))}
              {beltConfig.capacitors.filter(cap => cap.posX >= 0).length === 0 && (
                <p className="empty-message">Nenhum capacitor à direita</p>
              )}
            </div>
          </div>

          <button className="btn-add" onClick={addCapacitor}>
            + Adicionar Capacitor
          </button>
        </div>

        {/* SEÇÃO 4: Visualização da Correia */}
        <div className="config-section">
          <h2>Visualização da Correia (Capacitores Ativos)</h2>
          <div className="belt-preview-container">
            {renderBeltPreview()}
          </div>
          <p className="preview-description">
            A linha vermelha tracejada indica a referência X=0. Os capacitores azuis mostram apenas os sensores ATIVOS com o posicionamento em relação ao encoder.
          </p>
        </div>

        {/* Botões de Ação */}
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
