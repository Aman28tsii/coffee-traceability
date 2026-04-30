import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Coffee, Users, Map, Package, TrendingUp, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = user.role || '';
      
      let farmersCount = 0;
      let farmsCount = 0;
      let lotsCount = 0;
      
      // Only fetch if role has permission
      if (role === 'admin' || role === 'exporter') {
        try {
          const [farmersRes, farmsRes, lotsRes] = await Promise.all([
            API.get('/farmers'),
            API.get('/farms'),
            API.get('/lots')
          ]);
          farmersCount = farmersRes.data.data?.length || 0;
          farmsCount = farmsRes.data.data?.length || 0;
          lotsCount = lotsRes.data.data?.length || 0;
        } catch (err) {
          console.log('Permission denied for some endpoints');
        }
      } else if (role === 'farmer') {
        // Farmer can only see their own data
        try {
          const farmsRes = await API.get('/farms');
          farmsCount = farmsRes.data.data?.length || 0;
          const lotsRes = await API.get('/lots');
          lotsCount = lotsRes.data.data?.length || 0;
        } catch (err) {
          console.log('Farmer data fetch error');
        }
      }
      
      setStats({
        totalFarmers: farmersCount,
        totalFarms: farmsCount,
        totalLots: lotsCount,
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

  // Different stats display based on role
  const getStatCards = () => {
    if (userRole === 'admin' || userRole === 'exporter') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Farmers</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.totalFarmers || 0}</p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <Users size={24} className="text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Farms</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.totalFarms || 0}</p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-xl">
                <Map size={24} className="text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Coffee Lots</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.totalLots || 0}</p>
              </div>
              <div className="p-3 bg-coffee-600/20 rounded-xl">
                <Package size={24} className="text-coffee-400" />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (userRole === 'farmer') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">My Farms</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.totalFarms || 0}</p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-xl">
                <Map size={24} className="text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">My Lots</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.totalLots || 0}</p>
              </div>
              <div className="p-3 bg-coffee-600/20 rounded-xl">
                <Package size={24} className="text-coffee-400" />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
          <Coffee size={48} className="mx-auto text-coffee-500 mb-3" />
          <p className="text-white">Welcome to Coffee Traceability System</p>
          <p className="text-gray-400 text-sm mt-1">Your role: {userRole || 'Unknown'}</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome to Coffee Traceability System</p>
      </div>

      {getStatCards()}

      <div className="bg-gradient-to-r from-coffee-800 to-coffee-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Coffee size={28} />
          <h2 className="text-xl font-semibold">Track from Farm to Cup</h2>
        </div>
        <p className="text-coffee-200">
          Full traceability with EUDR compliance. Every lot is tracked from harvest to export.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;