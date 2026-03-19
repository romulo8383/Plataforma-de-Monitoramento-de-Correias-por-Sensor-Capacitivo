// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { apiClient } from '../api/apiClient';
import ConveyorBeltDisplay from '../components/ConveyorBeltDisplay';
import ProfileWindow from '../components/ProfileWindow';
import Selector from '../components/Selector';
import ControlPanel from '../components/ControlPanel';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { sensorConfig } = useConfig(); // eslint-disable-line no-unused-vars
  const pollingIntervalRef = useRef(null);

  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [activeSensors, setActiveSensors] = useState([]);
  const [allSensors, setAllSensors] = useState([]);
  const [sensorHistory, setSensorHistory] = useState({});
  const [encoderPosition, setEncoderPosition] = useState(0);
  const [beltLength] = useState(1120);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const fetchSensorConfig = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getSensors(1);

        if (response.status === 'success') {
          const sensors = response.sensors || [];

          const allSensorsData = Array.from({ length: 16 }, (_, i) => {
            const sensorNumber = i + 1;
            const sensorConfig = sensors.find(s => s.sensor_number === sensorNumber);
            return {
              sensor_number: sensorNumber,
              enabled: sensorConfig?.enabled || false,
              belt_id: 1,
              capacitance_pf: null,
              voltage_v: null,
            };
          });

          setAllSensors(allSensorsData);

          const activeSensorsData = allSensorsData
            .filter(s => s.enabled)
            .map(s => ({
              id: s.sensor_number,
              sensor_number: s.sensor_number,
              enabled: s.enabled,
              belt_id: s.belt_id,
              voltage_v: null,
              capacitance_pf: null,
            }));

          setActiveSensors(activeSensorsData);

          if (activeSensorsData.length > 0) {
            setSelectedSensorId(activeSensorsData[0].id);
          }

          setError(null);
        }
      } catch (err) {
        console.error('Erro ao buscar configuração:', err);
        setError('Não foi possível conectar ao backend. Verifique se o servidor está rodando.');
      } finally {
        setLoading(false);
      }
    };

    fetchSensorConfig();
  }, []);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await apiClient.getLatestReading(1);

        if (response.status === 'success' && response.data) {
          const { belt_position_mm, sensor_readings } = response.data;

          setEncoderPosition(belt_position_mm || 0);

          if (sensor_readings && sensor_readings.length > 0) {
            setIsOnline(true);

            setActiveSensors(prevSensors =>
              prevSensors.map(sensor => {
                const reading = sensor_readings.find(r => r.sensor === sensor.sensor_number);
                if (reading) {
                  return {
                    ...sensor,
                    voltage_v: reading.voltage_v,
                    capacitance_pf: reading.capacitance_pf,
                    min_capacitance_pf: reading.min_capacitance_pf,
                    max_capacitance_pf: reading.max_capacitance_pf,
                    max_voltage_v: reading.max_voltage_v,
                  };
                }
                return sensor;
              })
            );

            setAllSensors(prevSensors =>
              prevSensors.map(sensor => {
                const reading = sensor_readings.find(r => r.sensor === sensor.sensor_number);
                if (reading && sensor.enabled) {
                  return {
                    ...sensor,
                    voltage_v: reading.voltage_v,
                    capacitance_pf: reading.capacitance_pf,
                    min_capacitance_pf: reading.min_capacitance_pf,
                    max_capacitance_pf: reading.max_capacitance_pf,
                    max_voltage_v: reading.max_voltage_v,
                  };
                }
                return sensor;
              })
            );

            setSensorHistory(prevHistory => {
              const newHistory = { ...prevHistory };
              sensor_readings.forEach(reading => {
                const sensorId = reading.sensor;
                if (!newHistory[sensorId]) newHistory[sensorId] = [];

                const lastEntry = newHistory[sensorId][newHistory[sensorId].length - 1];
                const calibrationChanged = lastEntry &&
                  (lastEntry.min_capacitance_pf !== reading.min_capacitance_pf ||
                   lastEntry.max_capacitance_pf !== reading.max_capacitance_pf);

                if (calibrationChanged) newHistory[sensorId] = [];

                newHistory[sensorId] = [
                  ...newHistory[sensorId],
                  {
                    capacitance_pf: reading.capacitance_pf,
                    voltage_v: reading.voltage_v,
                    min_capacitance_pf: reading.min_capacitance_pf,
                    max_capacitance_pf: reading.max_capacitance_pf,
                    max_voltage_v: reading.max_voltage_v,
                    timestamp: Date.now(),
                  },
                ].slice(-20);
              });
              return newHistory;
            });

            setError(null);
          } else {
            setIsOnline(false);
          }
        } else {
          setIsOnline(false);
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setIsOnline(false);
        setError('Aguardando dados da ESP32...');
      }
    };

    pollingIntervalRef.current = setInterval(fetchLatestData, 250);
    fetchLatestData();

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  const handleSensorSelect = (sensorId) => setSelectedSensorId(sensorId);

  const handleToggleSensor = async (sensorNumber) => {
    try {
      const sensor = allSensors.find(s => s.sensor_number === sensorNumber);
      if (!sensor) return;

      await apiClient.toggleSensor(sensorNumber, !sensor.enabled);

      const configResponse = await apiClient.getSensors(1);
      if (configResponse.status === 'success') {
        const sensors = configResponse.sensors || [];

        const allSensorsData = Array.from({ length: 16 }, (_, i) => {
          const sn = i + 1;
          const sc = sensors.find(s => s.sensor_number === sn);
          return { sensor_number: sn, enabled: sc?.enabled || false, belt_id: 1, capacitance_pf: null, voltage_v: null };
        });

        setAllSensors(allSensorsData);

        const activeSensorsData = allSensorsData
          .filter(s => s.enabled)
          .map(s => ({ id: s.sensor_number, sensor_number: s.sensor_number, enabled: s.enabled, belt_id: s.belt_id, voltage_v: null, capacitance_pf: null }));

        setActiveSensors(activeSensorsData);

        if (!selectedSensorId || !activeSensorsData.find(s => s.id === selectedSensorId)) {
          setSelectedSensorId(activeSensorsData.length > 0 ? activeSensorsData[0].id : null);
        }
      }
    } catch (err) {
      console.error('Erro ao alternar sensor:', err);
      alert('Erro ao alternar sensor. Verifique a conexão com o backend.');
    }
  };

  const selectedSensor = activeSensors.find((s) => s.id === selectedSensorId);

  if (loading) {
    return <div className="dashboard loading"><p>Carregando configuração...</p></div>;
  }

  if (error && allSensors.length === 0) {
    return (
      <div className="dashboard error">
        <h2>Erro de Conexão</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Medição e Desgaste da Correia Transportadora</h1>
          <div className="header-status">
            <span className="status-item">
              <span className="status-label">Estado:</span>
              <span className={`status-value ${isOnline ? 'online' : 'offline'}`}>
                ● {isOnline ? 'Online' : 'Aguardando dados'}
              </span>
            </span>
            {error && (
              <span className="status-item error">
                <span className="status-label">⚠</span>
                <span className="status-value">{error}</span>
              </span>
            )}
          </div>
        </div>

        <div className="conveyor-section">
          <ConveyorBeltDisplay
            activeSensors={activeSensors}
            selectedSensorId={selectedSensorId}
            onSensorSelect={handleSensorSelect}
            beltLength={beltLength}
            encoderPosition={encoderPosition}
            allSensors={allSensors}
            sensorHistory={sensorHistory}
          />
        </div>

        <div className="profile-section-below">
          <ProfileWindow
            selectedSensor={selectedSensor}
            capacitance={selectedSensor?.capacitance_pf || 0}
            minCapacitance={selectedSensor?.min_capacitance_pf || 0}
            maxCapacitance={selectedSensor?.max_capacitance_pf || 1}
          />
          <Selector
            sensors={activeSensors}
            selectedSensorId={selectedSensorId}
            onSelect={handleSensorSelect}
          />
        </div>
      </div>

      <div className="dashboard-sidebar">
        <ControlPanel allSensors={allSensors} onToggleSensor={handleToggleSensor} />
      </div>
    </div>
  );
};

export default Dashboard;
