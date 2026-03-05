// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import ConveyorBeltDisplay from '../components/ConveyorBeltDisplay';
import ProfileWindow from '../components/ProfileWindow';
import Selector from '../components/Selector';
import ControlPanel from '../components/ControlPanel';
// import { apiClient } from '../api/apiClient'; // TODO: Uncomment when backend API is running
import '../styles/Dashboard.css';

const Dashboard = () => {
  // State management
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [activeSensors, setActiveSensors] = useState([]);
  const [allSensors, setAllSensors] = useState([]);
  const [sensorHistory, setSensorHistory] = useState({}); // Track reading history for each sensor
  const [encoderPosition, setEncoderPosition] = useState(0);
  const [beltLength] = useState(1120); // mm
  const [maxCapacitance] = useState(4); // pF - Reference capacitor
  const [loading, setLoading] = useState(true);

  // Mock data for active sensors (in production, fetch from API)
  useEffect(() => {
    const mockActiveSensors = [
      {
        id: 1,
        sensor_number: 1,
        enabled: true,
        belt_id: 1,
        voltage_v: 2.31,
        capacitance_pf: 2.45,
      },
      {
        id: 2,
        sensor_number: 2,
        enabled: true,
        belt_id: 1,
        voltage_v: 2.45,
        capacitance_pf: 1.89,
      },
      {
        id: 3,
        sensor_number: 3,
        enabled: true,
        belt_id: 1,
        voltage_v: 2.38,
        capacitance_pf: 3.12,
      },
      {
        id: 4,
        sensor_number: 4,
        enabled: true,
        belt_id: 1,
        voltage_v: 2.42,
        capacitance_pf: 2.78,
      },
    ];

    // Mock all 16 sensors
    const mockAllSensors = Array.from({ length: 16 }, (_, i) => {
      const sensorNumber = i + 1;
      const isActive = mockActiveSensors.some(s => s.sensor_number === sensorNumber);
      const activeSensor = mockActiveSensors.find(s => s.sensor_number === sensorNumber);

      return {
        sensor_number: sensorNumber,
        enabled: isActive,
        belt_id: 1,
        capacitance_pf: activeSensor ? activeSensor.capacitance_pf : null,
        voltage_v: activeSensor ? activeSensor.voltage_v : null,
      };
    });

    setActiveSensors(mockActiveSensors);
    setAllSensors(mockAllSensors);
    // Initialize sensor history
    const initialHistory = {};
    mockActiveSensors.forEach(sensor => {
      initialHistory[sensor.id] = [{ capacitance_pf: sensor.capacitance_pf, timestamp: Date.now() }];
    });
    setSensorHistory(initialHistory);
    if (mockActiveSensors.length > 0) {
      setSelectedSensorId(mockActiveSensors[0].id);
    }
    setLoading(false);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    if (selectedSensorId) {
      const interval = setInterval(() => {
        // Simulate encoder position change (0-1120mm, moving right to left)
        setEncoderPosition((prev) => (prev + 5) % 1120);

        // Generate new readings for each active sensor
        setActiveSensors((prevActiveSensors) => {
          const updatedSensors = prevActiveSensors.map((sensor) => ({
            ...sensor,
            voltage_v: 2.3 + Math.random() * 0.3,
            capacitance_pf: 1.5 + Math.random() * 2.5, // 1.5-4.0 pF range
          }));

          // Update sensor history
          setSensorHistory((prevHistory) => {
            const newHistory = { ...prevHistory };
            updatedSensors.forEach((sensor) => {
              if (!newHistory[sensor.id]) {
                newHistory[sensor.id] = [];
              }
              // Add new reading and keep only last 20 readings
              newHistory[sensor.id] = [
                ...newHistory[sensor.id],
                { capacitance_pf: sensor.capacitance_pf, timestamp: Date.now() }
              ].slice(-20);
            });
            return newHistory;
          });

          return updatedSensors;
        });

        // Update all sensors with new capacitance values
        setAllSensors((prevAllSensors) =>
          prevAllSensors.map((sensor) => {
            if (sensor.enabled) {
              const activeSensor = activeSensors.find(s => s.sensor_number === sensor.sensor_number);
              return {
                ...sensor,
                capacitance_pf: activeSensor ? activeSensor.capacitance_pf : sensor.capacitance_pf,
                voltage_v: activeSensor ? activeSensor.voltage_v : sensor.voltage_v,
              };
            }
            return sensor;
          })
        );
      }, 250); // Update every 250ms

      return () => clearInterval(interval);
    }
  }, [selectedSensorId, activeSensors]);

  // Fetch real data from API (uncomment when backend is ready)
  /*
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getLatestReading(1);
        if (response.status === 'success') {
          setEncoderPosition(response.data.belt_position_mm);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchData, 250);
    fetchData();

    return () => clearInterval(interval);
  }, []);
  */

  const handleSensorSelect = (sensorId) => {
    setSelectedSensorId(sensorId);
  };

  const handleToggleSensor = (sensorNumber) => {
    setAllSensors(prevSensors => {
      const updatedSensors = prevSensors.map(sensor => {
        if (sensor.sensor_number === sensorNumber) {
          const newEnabled = !sensor.enabled;
          return { ...sensor, enabled: newEnabled };
        }
        return sensor;
      });

      // Update activeSensors based on allSensors
      const newActiveSensors = updatedSensors
        .filter(sensor => sensor.enabled)
        .map(sensor => ({
          id: sensor.sensor_number,
          sensor_number: sensor.sensor_number,
          enabled: sensor.enabled,
          belt_id: sensor.belt_id,
          voltage_v: sensor.voltage_v,
          capacitance_pf: sensor.capacitance_pf,
        }));

      setActiveSensors(newActiveSensors);

      // If no sensor is selected or selected sensor is disabled, select first active sensor
      if (!selectedSensorId || !newActiveSensors.find(s => s.id === selectedSensorId)) {
        setSelectedSensorId(newActiveSensors.length > 0 ? newActiveSensors[0].id : null);
      }

      return updatedSensors;
    });
  };

  const selectedSensor = activeSensors.find((s) => s.id === selectedSensorId);

  if (loading) {
    return (
      <div className="dashboard loading">
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Medição e Desgaste da Correia Transportadora</h1>
          <div className="header-status">
            <span className="status-item">
              <span className="status-label">Estado:</span>
              <span className="status-value online">● Online</span>
            </span>
          </div>
        </div>

        {/* Conveyor Display */}
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

        {/* New Profile Section Below */}
        <div className="profile-section-below">
          <ProfileWindow
            selectedSensor={selectedSensor}
            voltage={selectedSensor?.voltage_v || 0}
            capacitance={selectedSensor?.capacitance_pf || 0}
            encoderPosition={encoderPosition}
            beltThickness={selectedSensor?.capacitance_pf || 0}
            maxCapacitance={maxCapacitance}
          />
          
          <Selector
            sensors={activeSensors}
            selectedSensorId={selectedSensorId}
            onSelect={handleSensorSelect}
          />
        </div>
      </div>

      {/* Control Panel Sidebar */}
      <div className="dashboard-sidebar">
        <ControlPanel allSensors={allSensors} onToggleSensor={handleToggleSensor} />
      </div>
    </div>
  );
};

export default Dashboard;
