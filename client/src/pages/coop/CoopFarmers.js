import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Users, Loader2, User } from 'lucide-react';

const CoopFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await API.get('/farmers');
      setFarmers(response.data.data || []);
    } catch (err) {
      console.error('Fetch farmers error:', err);
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
        <h1 className="text-2xl font-bold text-white">Cooperative Farmers</h1>
        <p className="text-gray-400 mt-1">View all farmers in your cooperative</p>
      </div>

      {farmers.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <Users size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No farmers found in your cooperative</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmers.map(farmer => (
            <div key={farmer.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <User size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{farmer.name}</h3>
                    <p className="text-gray-400 text-sm">{farmer.farmer_code}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {farmer.phone && <p className="text-gray-300 text-sm">📞 {farmer.phone}</p>}
                  {farmer.email && <p className="text-gray-300 text-sm">✉️ {farmer.email}</p>}
                  {farmer.cooperative_name && <p className="text-gray-300 text-sm">🏢 {farmer.cooperative_name}</p>}
                  <p className="text-gray-500 text-xs mt-2">🌾 {farmer.farm_count || 0} farms</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoopFarmers;