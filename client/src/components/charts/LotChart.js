import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#a67c42', '#8b5e2e', '#6e441f', '#c2a06e', '#d4b892'];

export const LotStatusChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;
  
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-semibold mb-4">Lots by Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
            {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const HarvestTrendChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;
  
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-semibold mb-4">Harvest Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} formatter={(value) => `${value.toLocaleString()} kg`} />
          <Legend />
          <Line type="monotone" dataKey="quantity" stroke="#a67c42" name="Harvest (kg)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const QualityDistributionChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;
  
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-semibold mb-4">Quality Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="range" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Bar dataKey="count" fill="#a67c42" name="Lots" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};