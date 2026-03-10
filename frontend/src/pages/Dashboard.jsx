// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import ConveyorBeltDisplay from '../components/ConveyorBeltDisplay';
import ProfileWindow from '../components/ProfileWindow';
import Selector from '../components/Selector';
import ControlPanel from '../components/ControlPanel';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { sensorConfig, updateSensorConfig } = useConfig();
  const encoderIntervalRef = useRef(null);
  const encoderPositionRef = useRef(0); // Keep encoder value persistent
  
  // State management
  const [selectedSensorId, setSelectedSensorId] = useState(null);
  const [activeSensors, setActiveSensors] = useState([]);
  const [allSensors, setAllSensors] = useState([]);
  const [sensorHistory, setSensorHistory] = useState({});
  const [encoderPosition, setEncoderPosition] = useState(0);
  const [beltLength] = useState(1120);
  const [maxCapacitance] = useState(4);
  const [loading, setLoading] = useState(true);

  // Mock data for active sensors - ONLY on initial mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Only initialize if we don't have data yet
    if (activeSensors.length === 0) {
      const enabledSensors = sensorConfig.filter(s => s.enabled).map(s => s.number);
      
      const mockActiveSensors = enabledSensors.map(sensorNum => ({
        id: sensorNum,
        sensor_number: sensorNum,
        enabled: true,
        belt_id: 1,
        voltage_v: 2.3 + Math.random() * 0.3,
        capacitance_pf: 1.5 + Math.random() * 2.5,
      }));

      const mockAllSensors = Array.from({ length: 16 }, (_, i) => {
        const sensorNumber = i + 1;
        const isActive = enabledSensors.includes(sensorNumber);
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
      
      setSensorHistory(prevHistory => {
        const newHistory = { ...prevHistory };
        mockActiveSensors.forEach(sensor => {
          if (!newHistory[sensor.id]) {
            newHistory[sensor.id] = [{ capacitance_pf: sensor.capacitance_pf, timestamp: Date.now() }];
          }
        });
        return newHistory;
      });
      
      if (mockActiveSensors.length > 0 && !selectedSensorId) {
        setSelectedSensorId(mockActiveSensors[0].id);
      }
      setLoading(false);
    }
  }, []); // Empty dependency - only run ONCE on mount

  // Encoder position update - ONLY runs once and updates independently
  useEffect(() => {
    // Initialize encoder ref - recover from localStorage if available
    const savedEncoderPosition = localStorage.getItem('encoderPosition');
    if (savedEncoderPosition) {
      encoderPositionRef.current = parseInt(savedEncoderPosition, 10);
      setEncoderPosition(encoderPositionRef.current);
    } else {
      encoderPositionRef.current = 0;
    }
    
    encoderIntervalRef.current = setInterval(() => {
      // Update the ref value
      encoderPositionRef.current = (encoderPositionRef.current + 5) % 1120;
      // Update the state for UI display
      setEncoderPosition(encoderPositionRef.current);
      // Save to localStorage to persist across page reloads
      localStorage.setItem('encoderPosition', encoderPositionRef.current.toString());
    }, 250);

    // Return cleanup function
    return () => {
      if (encoderIntervalRef.current) {
        clearInterval(encoderIntervalRef.current);
      }
    };
  }, []); // Empty dependency array - NEVER re-run this effect

  // Simulate real-time data updates - only runs once, never stops
  useEffect(() => {
    const interval = setInterval(() => {
      // Update activeSensors with new readings
      setActiveSensors((prevActiveSensors) => {
        const updatedSensors = prevActiveSensors.map((sensor) => ({
          ...sensor,
          voltage_v: 2.3 + Math.random() * 0.3,
          capacitance_pf: 1.5 + Math.random() * 2.5,
        }));

        // Update sensor history
        setSensorHistory((prevHistory) => {
          const newHistory = { ...prevHistory };
          updatedSensors.forEach((sensor) => {
            if (!newHistory[sensor.id]) {
              newHistory[sensor.id] = [];
            }
            newHistory[sensor.id] = [
              ...newHistory[sensor.id],
              { capacitance_pf: sensor.capacitance_pf, timestamp: Date.now() }
            ].slice(-20);
          });
          return newHistory;
        });

        return updatedSensors;
      });

      // Update all sensors capacitance values from their latest active state
      setAllSensors((prevAllSensors) =>
        prevAllSensors.map((sensor) => {
          if (sensor.enabled) {
            // Generate random values for enabled sensors
            return {
              ...sensor,
              voltage_v: 2.3 + Math.random() * 0.3,
              capacitance_pf: 1.5 + Math.random() * 2.5,
            };
          }
          return sensor;
        })
      );
    }, 250);

    return () => clearInterval(interval);
  }, []); // Empty dependency - only run once on mount

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

      // Save the new configuration to Context/localStorage
      const newSensorConfig = updatedSensors.map(s => ({
        number: s.sensor_number,
        enabled: s.enabled,
      }));
      updateSensorConfig(newSensorConfig);

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
