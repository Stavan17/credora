import React from 'react';
import { Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RiskMatrix = ({ loanScore, fraudScore, applications = [] }) => {
  // Create quadrants
  const quadrants = [
    { name: 'Low Risk', x: [0.5, 1], y: [0, 0.5], color: '#10b981' },
    { name: 'Medium Risk', x: [0, 0.5], y: [0, 0.5], color: '#f59e0b' },
    { name: 'High Risk', x: [0, 0.5], y: [0.5, 1], color: '#ef4444' },
    { name: 'Review Required', x: [0.5, 1], y: [0.5, 1], color: '#3b82f6' },
  ];

  // Current application point
  const currentPoint = {
    loanScore: loanScore || 0,
    fraudScore: fraudScore || 0,
    name: 'Current Application',
  };

  // Combine with other applications for context
  const dataPoints = applications.map(app => ({
    loanScore: app.approval_probability || 0,
    fraudScore: app.fraud_score || 0,
    name: `App #${app.id}`,
  }));

  const allData = [currentPoint, ...dataPoints];

  const getQuadrant = (x, y) => {
    if (x >= 0.5 && y < 0.5) return 'Low Risk';
    if (x < 0.5 && y < 0.5) return 'Medium Risk';
    if (x < 0.5 && y >= 0.5) return 'High Risk';
    return 'Review Required';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">Loan Score: {(data.loanScore * 100).toFixed(1)}%</p>
          <p className="text-sm">Fraud Score: {(data.fraudScore * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quadrant: {getQuadrant(data.loanScore, data.fraudScore)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Risk Matrix</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="loanScore"
            name="Loan Score"
            domain={[0, 1]}
            label={{ value: 'Loan Approval Score', position: 'insideBottom', offset: -5 }}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <YAxis
            type="number"
            dataKey="fraudScore"
            name="Fraud Score"
            domain={[0, 1]}
            label={{ value: 'Fraud Risk Score', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Quadrant backgrounds */}
          <defs>
            <pattern id="lowRisk" patternUnits="userSpaceOnUse" width="100" height="100">
              <rect width="100" height="100" fill="#10b981" fillOpacity="0.1" />
            </pattern>
            <pattern id="mediumRisk" patternUnits="userSpaceOnUse" width="100" height="100">
              <rect width="100" height="100" fill="#f59e0b" fillOpacity="0.1" />
            </pattern>
            <pattern id="highRisk" patternUnits="userSpaceOnUse" width="100" height="100">
              <rect width="100" height="100" fill="#ef4444" fillOpacity="0.1" />
            </pattern>
            <pattern id="reviewRisk" patternUnits="userSpaceOnUse" width="100" height="100">
              <rect width="100" height="100" fill="#3b82f6" fillOpacity="0.1" />
            </pattern>
          </defs>
          
          {/* Current application point */}
          <Scatter
            name="Current Application"
            data={[currentPoint]}
            fill="#8b5cf6"
            shape="star"
          />
          
          {/* Other applications */}
          {dataPoints.length > 0 && (
            <Scatter
              name="Other Applications"
              data={dataPoints}
              fill="#6b7280"
              shape="circle"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {quadrants.map((quad) => (
          <div key={quad.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: quad.color, opacity: 0.3 }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{quad.name}</span>
          </div>
        ))}
      </div>

      {/* Current position info */}
      {loanScore !== null && fraudScore !== null && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Current Position: {getQuadrant(loanScore, fraudScore)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Loan Score: {(loanScore * 100).toFixed(1)}% | Fraud Score: {(fraudScore * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskMatrix;

