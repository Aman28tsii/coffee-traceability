import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Users, Map, Package, Loader2, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

const CoopDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [farmersRes, farmsRes, lotsRes] = await Promise.all([
        API.get('/farmers'),
        API.get('/farms'),
        API.get('/lots')
      ]);
      
      setStats({
        totalFarmers: farmersRes.data.data?.length || 0,
        totalFarms: farmsRes.data.data?.length || 0,
        totalLots: lotsRes.data.data?.length || 0,
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
        <h1 className="text-2xl font-bold text-white">Cooperative Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage your cooperative's coffee</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/coop/farmers" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-coffee-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Member Farmers</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalFarmers || 0}</p>
            </div>
            <Users size={32} className="text-blue-400" />
          </div>
        </Link>

        <Link to="/coop/farms" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-coffee-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Coffee Farms</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalFarms || 0}</p>
            </div>
            <Map size={32} className="text-green-400" />
          </div>
        </Link>

        <Link to="/lots" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-coffee-500 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Coffee Lots</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalLots || 0}</p>
            </div>
            <Package size={32} className="text-coffee-400" />
          </div>
        </Link>
      </div>

      <div className="bg-gradient-to-r from-coffee-800 to-coffee-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Coffee size={28} />
          <h2 className="text-xl font-semibold">Cooperative Traceability</h2>
        </div>
        <p className="text-coffee-200">
          Track all coffee from your member farmers with full transparency.
        </p>
      </div>
    </div>
  );
};

export default CoopDashboard;