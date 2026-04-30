import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Map, Loader2, MapPin } from 'lucide-react';

const CoopFarms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await API.get('/farms');
      setFarms(response.data.data || []);
    } catch (err) {
      console.error('Fetch farms error:', err);
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
        <h1 className="text-2xl font-bold text-white">Cooperative Farms</h1>
        <p className="text-gray-400 mt-1">View all farms from cooperative members</p>
      </div>

      {farms.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <Map size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No farms found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {farms.map(farm => (
            <div key={farm.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin size={20} className="text-coffee-400" />
                  <h3 className="font-bold text-white text-lg">{farm.name}</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">👨‍🌾 Farmer: {farm.farmer_name || 'Unknown'}</p>
                  <p className="text-gray-300 text-sm">📍 {farm.location_description || 'No location'}</p>
                  {farm.altitude && <p className="text-gray-300 text-sm">⛰️ Altitude: {farm.altitude}m</p>}
                  {farm.coffee_variety && <p className="text-gray-300 text-sm">🌱 Variety: {farm.coffee_variety}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoopFarms;