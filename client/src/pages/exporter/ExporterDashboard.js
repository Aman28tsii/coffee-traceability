import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Users, Map, Package, Truck, Loader2 } from 'lucide-react';

const ExporterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [farmersRes, farmsRes, lotsRes, shipmentsRes] = await Promise.all([
        API.get('/farmers'),
        API.get('/farms'),
        API.get('/lots'),
        API.get('/shipments')
      ]);
      
      setStats({
        totalFarmers: farmersRes.data.data?.length || 0,
        totalFarms: farmsRes.data.data?.length || 0,
        totalLots: lotsRes.data.data?.length || 0,
        totalShipments: shipmentsRes.data.data?.length || 0,
      });
    } catch (err) {
      console.error('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-coffee-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Exporter Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage your coffee supply chain</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-xs">Farmers</p>
          <p className="text-2xl font-bold text-white">{stats?.totalFarmers || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-xs">Farms</p>
          <p className="text-2xl font-bold text-white">{stats?.totalFarms || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-xs">Lots</p>
          <p className="text-2xl font-bold text-white">{stats?.totalLots || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-xs">Shipments</p>
          <p className="text-2xl font-bold text-white">{stats?.totalShipments || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ExporterDashboard;