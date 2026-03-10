// src/components/CalibrationScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import '../styles/Calibration.css';

const CalibrationScreen = () => {
  const [calibrationPoints, setCalibrationPoints] = useState([
    { id: 1, fixedCap: 4, varCap: 1.0, voltage: 0.82 },
    { id: 2, fixedCap: 4, varCap: 1.2, voltage: 0.88 },
    { id: 3, fixedCap: 4, varCap: 1.4, voltage: 0.95 },
    { id: 4, fixedCap: 4, varCap: 1.6, voltage: 1.03 },
    { id: 5, fixedCap: 4, varCap: 2.0, voltage: 1.20 },
  ]);

  const [polynomial, setPolynomial] = useState(null);
  const [rmse, setRmse] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [outliers, setOutliers] = useState(new Set());
  const [nextId, setNextId] = useState(6);

  // Polynomial regression for 4th degree
  const polynomialRegression = (points) => {
    if (points.length < 5) {
      alert('Você precisa de pelo menos 5 pontos de calibração');
      return null;
    }

    const n = points.length;
    const voltages = points.map(p => p.voltage);
    const capacitances = points.map(p => p.varCap);

    // Build design matrix for 4th degree polynomial
    // [V^4, V^3, V^2, V, 1]
    const matrix = points.map(p => {
      const V = p.voltage;
      const V2 = V * V;
      const V3 = V2 * V;
      const V4 = V3 * V;
      return [V4, V3, V2, V, 1];
    });

    // Normal equations: X^T * X * coeffs = X^T * y
    const XtX = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];

    const Xty = [0, 0, 0, 0, 0];

    // Calculate X^T * X
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < 5; j++) {
        for (let k = 0; k < 5; k++) {
          XtX[j][k] += matrix[i][j] * matrix[i][k];
        }
        Xty[j] += matrix[i][j] * capacitances[i];
      }
    }

    // Solve using Gauss elimination
    const coeffs = gaussElimination(XtX, Xty);

    // Calculate RMSE
    let sumSquaredErrors = 0;
    const predictedValues = [];
    for (let i = 0; i < n; i++) {
      const V = voltages[i];
      const V2 = V * V;
      const V3 = V2 * V;
      const V4 = V3 * V;
      const predicted = coeffs[0] * V4 + coeffs[1] * V3 + coeffs[2] * V2 + coeffs[3] * V + coeffs[4];
      predictedValues.push(predicted);
      const error = capacitances[i] - predicted;
      sumSquaredErrors += error * error;
    }
    const rmseValue = Math.sqrt(sumSquaredErrors / n);

    // Detect outliers (points deviating more than 0.1 pF from curve)
    const outlierIndices = new Set();
    const threshold = 0.1;
    for (let i = 0; i < n; i++) {
      const error = Math.abs(capacitances[i] - predictedValues[i]);
      if (error > threshold) {
        outlierIndices.add(points[i].id);
      }
    }

    return {
      coefficients: {
        a: coeffs[0],
        b: coeffs[1],
        c: coeffs[2],
        d: coeffs[3],
        e: coeffs[4],
      },
      rmse: rmseValue,
      outliers: outlierIndices,
    };
  };

  // Gaussian elimination for solving linear systems
  const gaussElimination = (A, b) => {
    const n = A.length;
    const matrix = A.map(row => [...row]);
    const vector = [...b];

    // Forward elimination
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
      [vector[i], vector[maxRow]] = [vector[maxRow], vector[i]];

      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        const c = matrix[k][i] / matrix[i][i];
        for (let j = i; j < n; j++) {
          matrix[k][j] -= c * matrix[i][j];
        }
        vector[k] -= c * vector[i];
      }
    }

    // Back substitution
    const solution = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = vector[i] / matrix[i][i];
      for (let k = i - 1; k >= 0; k--) {
        vector[k] -= matrix[k][i] * solution[i];
      }
    }

    return solution;
  };

  // Generate polynomial curve for visualization
  const generateCurveData = (coeffs) => {
    const data = [];
    const minV = Math.min(...calibrationPoints.map(p => p.voltage));
    const maxV = Math.max(...calibrationPoints.map(p => p.voltage));
    const step = (maxV - minV) / 50;

    for (let V = minV - 0.1; V <= maxV + 0.1; V += step) {
      if (V >= 0) {
        const V2 = V * V;
        const V3 = V2 * V;
        const V4 = V3 * V;
        const C = coeffs.a * V4 + coeffs.b * V3 + coeffs.c * V2 + coeffs.d * V + coeffs.e;
        data.push({
          voltage: parseFloat(V.toFixed(3)),
          capacitance: parseFloat(C.toFixed(3)),
          type: 'curve',
        });
      }
    }

    return data;
  };

  const handleGeneratePolynomial = () => {
    const result = polynomialRegression(calibrationPoints);
    if (result) {
      setPolynomial(result.coefficients);
      setRmse(result.rmse);
      setOutliers(result.outliers);

      const curveData = generateCurveData(result.coefficients);
      const combined = calibrationPoints.map(p => ({
        voltage: p.voltage,
        capacitance: p.varCap,
        type: 'point',
        id: p.id,
      }));
      setChartData([...combined, ...curveData]);
    }
  };

  const handleAddPoint = () => {
    const newPoint = {
      id: nextId,
      fixedCap: 4,
      varCap: 1.5,
      voltage: 1.0,
    };
    setCalibrationPoints([...calibrationPoints, newPoint]);
    setNextId(nextId + 1);
  };

  const handleDeletePoint = (id) => {
    setCalibrationPoints(calibrationPoints.filter(p => p.id !== id));
  };

  const handleUpdatePoint = (id, field, value) => {
    setCalibrationPoints(
      calibrationPoints.map(p =>
        p.id === id ? { ...p, [field]: parseFloat(value) || 0 } : p
      )
    );
  };

  const handleSaveCalibration = () => {
    if (!polynomial) {
      alert('Gere o polinômio primeiro');
      return;
    }

    const calibrationData = {
      timestamp: new Date().toISOString(),
      coefficients: polynomial,
      rmse: rmse,
      pointsCount: calibrationPoints.length,
      points: calibrationPoints,
    };

    localStorage.setItem('sensorCalibration', JSON.stringify(calibrationData));
    alert('Calibração salva com sucesso!');
  };

  const formatPolynomial = () => {
    if (!polynomial) return null;
    const { a, b, c, d, e } = polynomial;
    const formatCoeff = (val) => (val >= 0 ? '+' : '') + val.toFixed(6);

    return `C = ${a.toFixed(6)}*(V*V*V*V) ${formatCoeff(b)}*(V*V*V) ${formatCoeff(c)}*(V*V) ${formatCoeff(d)}*V ${formatCoeff(e)}`;
  };

  return (
    <div className="calibration-form">

      {/* Section 1: Description */}
      <section className="calibration-section">
        <h3>Descrição da Calibração</h3>
        <p>
          Este processo de calibração gera uma equação polinomial que converte a tensão medida pelo sensor em capacitância.
          A equação resultante será usada pelo firmware embarcado para calcular a capacitância em tempo real.
        </p>
        <p>
          <strong>Processo:</strong> Conecte capacitores conhecidos à entrada do sensor e registre a tensão de saída para cada valor.
          O sistema usará esses dados para calcular os coeficientes polinomiais de 4º grau.
        </p>
      </section>

      {/* Section 2: Calibration Data Table */}
      <section className="calibration-section">
        <h3>Dados de Calibração</h3>
        <div className="table-container">
          <table className="calibration-table">
            <thead>
              <tr>
                <th>Capacitor Fixo (pF)</th>
                <th>Capacitor Variável (pF)</th>
                <th>Tensão de Saída (V)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {calibrationPoints.map(point => (
                <tr
                  key={point.id}
                  className={outliers.has(point.id) ? 'outlier-row' : ''}
                >
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={point.fixedCap}
                      onChange={(e) => handleUpdatePoint(point.id, 'fixedCap', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={point.varCap}
                      onChange={(e) => handleUpdatePoint(point.id, 'varCap', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={point.voltage}
                      onChange={(e) => handleUpdatePoint(point.id, 'voltage', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeletePoint(point.id)}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="action-btn add-btn" onClick={handleAddPoint}>
          + Adicionar Ponto de Calibração
        </button>
      </section>

      {/* Section 3: Generate Polynomial */}
      <section className="calibration-section">
        <button className="action-btn primary-btn" onClick={handleGeneratePolynomial}>
          Gerar Polinômio
        </button>
      </section>

      {/* Section 4: Display Polynomial */}
      {polynomial && (
        <section className="calibration-section polynomial-section">
          <h3>Equação Polinomial Gerada</h3>
          <div className="polynomial-display">
            <code className="polynomial-code">
              {formatPolynomial()}
            </code>
          </div>
          <div className="coefficients-grid">
            <div className="coefficient-item">
              <label>a (V⁴)</label>
              <span>{polynomial.a.toFixed(6)}</span>
            </div>
            <div className="coefficient-item">
              <label>b (V³)</label>
              <span>{polynomial.b.toFixed(6)}</span>
            </div>
            <div className="coefficient-item">
              <label>c (V²)</label>
              <span>{polynomial.c.toFixed(6)}</span>
            </div>
            <div className="coefficient-item">
              <label>d (V)</label>
              <span>{polynomial.d.toFixed(6)}</span>
            </div>
            <div className="coefficient-item">
              <label>e (constante)</label>
              <span>{polynomial.e.toFixed(6)}</span>
            </div>
          </div>
        </section>
      )}

      {/* Section 5: Error Metrics */}
      {rmse !== null && (
        <section className="calibration-section error-metrics">
          <h3>Métricas de Calibração</h3>
          <div className="metric-item">
            <label>Erro de Calibração (RMSE):</label>
            <span className="metric-value">{rmse.toFixed(4)} pF</span>
          </div>
          {outliers.size > 0 && (
            <div className="metric-item warning">
              <label>Pontos Fora da Curva Detectados:</label>
              <span className="metric-value">{outliers.size} ponto(s)</span>
            </div>
          )}
        </section>
      )}

      {/* Section 6: Calibration Curve Visualization */}
      {chartData.length > 0 && (
        <section className="calibration-section graph-section">
          <h3>Curva de Calibração</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="voltage"
                name="Tensão (V)"
                label={{ value: 'Tensão (V)', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                type="number"
                dataKey="capacitance"
                name="Capacitância (pF)"
                label={{ value: 'Capacitância (pF)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="capacitance"
                name="Curva de Regressão"
                stroke="#2563eb"
                dot={false}
                isAnimationActive={false}
              />
              <Scatter
                name="Pontos Medidos"
                dataKey="capacitance"
                data={calibrationPoints.map(p => ({
                  voltage: p.voltage,
                  capacitance: p.varCap,
                }))}
                fill="#10b981"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Section 8: Save Calibration */}
      {polynomial && (
        <section className="calibration-section">
          <button className="action-btn save-btn" onClick={handleSaveCalibration}>
            💾 Salvar Calibração
          </button>
        </section>
      )}
    </div>
  );
};

export default CalibrationScreen;
