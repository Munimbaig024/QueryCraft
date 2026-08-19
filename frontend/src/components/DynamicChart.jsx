import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f43f5e'];

const DynamicChart = ({ data, type }) => {
  if (!data || data.length === 0) return null;

  // Basic auto-detection to guess the primary X-axis and Y-axes
  const keys = Object.keys(data[0]);
  
  // Assume the first key that contains strings or dates is our X-axis label
  let xKey = keys[0];
  for (let key of keys) {
    if (isNaN(data[0][key])) {
      xKey = key;
      break;
    }
  }

  // Use all other numeric keys as data series (Y-axes)
  const yKeys = keys.filter(key => key !== xKey && !isNaN(data[0][key]));

  // Fallback if no numeric data is found
  if (yKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 italic text-sm">
        Dataset doesn't contain numeric values suitable for a {type} chart.
      </div>
    );
  }

  const renderTooltip = (props) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  switch (type.toLowerCase()) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey={xKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={renderTooltip} cursor={{fill: '#f9fafb'}} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            {yKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
      
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey={xKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={renderTooltip} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            {yKeys.map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
      
    case 'pie':
      const valueKey = yKeys[0];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={renderTooltip} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500 italic text-sm">
          Visualization type "{type}" is not supported.
        </div>
      );
  }
};

export default DynamicChart;
