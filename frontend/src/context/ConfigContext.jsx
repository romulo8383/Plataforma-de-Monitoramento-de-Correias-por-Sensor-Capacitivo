// src/context/ConfigContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [sensorConfig, setSensorConfig] = useState(() => {
    // Load from localStorage if available, otherwise use defaults
    const saved = localStorage.getItem('sensorConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sensorConfig from localStorage:', e);
      }
    }
    // Default: first 4 sensors enabled
    return Array.from({ length: 16 }, (_, i) => ({
      number: i + 1,
      enabled: i < 4,
    }));
  });

  const updateSensorConfig = (newConfig) => {
    setSensorConfig(newConfig);
    // Save to localStorage
    localStorage.setItem('sensorConfig', JSON.stringify(newConfig));
  };

  return (
    <ConfigContext.Provider value={{ sensorConfig, updateSensorConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
