import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import Dashboard from './pages/Dashboard';
import BeltConfig from './pages/BeltConfig';
import SensorConfig from './pages/SensorConfig';
import Calibration from './pages/Calibration';
import Acquisition from './pages/Acquisition';
import Visualization from './pages/Visualization';
import './App.css';

function App() {
  return (
    <ConfigProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/belt-config" element={<BeltConfig />} />
            <Route path="/sensor-config" element={<SensorConfig />} />
            <Route path="/calibration" element={<Calibration />} />
            <Route path="/acquisition" element={<Acquisition />} />
            <Route path="/visualization" element={<Visualization />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
