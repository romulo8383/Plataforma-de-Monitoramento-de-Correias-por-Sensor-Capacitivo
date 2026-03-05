// src/components/ControlPanel.jsx
import React, { useState } from 'react';
import '../styles/ControlPanel.css';

const ControlPanel = ({ allSensors, onToggleSensor }) => {
  const [activeModal, setActiveModal] = useState(null);

  const toggleModal = (modalName) => {
    setActiveModal(activeModal === modalName ? null : modalName);
  };

  const buttons = [
    {
      id: 'belt-config',
      label: 'Configuração da Correia',
      icon: '⚙️',
    },
    {
      id: 'sensor-config',
      label: 'Configuração Sensores',
      icon: '📡',
    },
    {
      id: 'calibration',
      label: 'Calibração',
      icon: '📊',
    },
    {
      id: 'acquisition',
      label: 'Aquisição',
      icon: '📥',
    },
    {
      id: 'visualization',
      label: 'Visualização',
      icon: '📈',
    },
  ];

  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h2>Painel de Controle</h2>
      </div>

      <div className="control-buttons">
        {buttons.map((button) => (
          <button
            key={button.id}
            className={`control-btn ${activeModal === button.id ? 'active' : ''}`}
            onClick={() => toggleModal(button.id)}
            title={button.label}
          >
            <span className="btn-icon">{button.icon}</span>
            <span className="btn-label">{button.label}</span>
          </button>
        ))}
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {buttons.find((b) => b.id === activeModal)?.label}
              </h3>
              <button
                className="modal-close"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {activeModal === 'belt-config' && <BeltConfigContent />}
              {activeModal === 'sensor-config' && <SensorConfigContent allSensors={allSensors} onToggleSensor={onToggleSensor} />}
              {activeModal === 'calibration' && <CalibrationContent />}
              {activeModal === 'acquisition' && <AcquisitionContent />}
              {activeModal === 'visualization' && <VisualizationContent />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Content Components
const BeltConfigContent = () => (
  <div className="config-content">
    <p>Configurações da correia transportadora:</p>
    <ul>
      <li>Comprimento: 1.12 m</li>
      <li>Largura: 500 mm</li>
      <li>Velocidade: 1.5 m/s</li>
      <li>Pulsos por revolução: 1000</li>
    </ul>
    <button className="action-btn">Editar Configuração</button>
  </div>
);

const SensorConfigContent = ({ allSensors, onToggleSensor }) => (
  <div className="config-content">
    <p>Configurações dos sensores capacitivos:</p>
    <div className="sensor-grid">
      {Array.from({ length: 16 }, (_, i) => {
        const sensorNumber = i + 1;
        const sensor = allSensors.find(s => s.sensor_number === sensorNumber) || { sensor_number: sensorNumber, enabled: false };

        return (
          <div
            key={sensorNumber}
            className={`sensor-toggle ${sensor.enabled ? 'active' : 'inactive'}`}
            onClick={() => onToggleSensor(sensorNumber)}
          >
            <span className="sensor-label">S{sensorNumber}</span>
            <span className="sensor-status">{sensor.enabled ? '✓' : '○'}</span>
          </div>
        );
      })}
    </div>
    <div className="sensor-info">
      <p>Total de sensores: 16</p>
      <p>Sensores ativos: {allSensors.filter(s => s.enabled).length}</p>
      <p>Tamanho da placa: 65 mm</p>
    </div>
  </div>
);

const CalibrationContent = () => (
  <div className="config-content">
    <p>Sistema de calibração:</p>
    <ul>
      <li>Capacitor fixo: 4 pF</li>
      <li>Pontos de calibração: 5</li>
      <li>Status: Calibrado</li>
    </ul>
    <button className="action-btn">Nova Calibração</button>
  </div>
);

const AcquisitionContent = () => (
  <div className="config-content">
    <p>Parâmetros de aquisição de dados:</p>
    <ul>
      <li>Taxa de amostragem: Contínua</li>
      <li>Velocidade de transmissão: 115200 baud</li>
      <li>Última leitura: Agora</li>
    </ul>
    <button className="action-btn">Pausar/Retomar Aquisição</button>
  </div>
);

const VisualizationContent = () => (
  <div className="config-content">
    <p>Opções de visualização:</p>
    <ul>
      <li>Modo de gráfico: Tempo real</li>
      <li>Histórico: 100 leituras</li>
      <li>Temas: Claro</li>
    </ul>
    <button className="action-btn">Exportar Dados</button>
  </div>
);

export default ControlPanel;
