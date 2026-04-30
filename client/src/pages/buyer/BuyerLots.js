import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Package, Loader2, Eye, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuyerLots = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const response = await API.get('/lots');
      setLots(response.data.data || []);
    } catch (err) {
      console.error('Fetch lots error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      growing: 'bg-green-500/20 text-green-400',
      harvested: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      stored: 'bg-purple-500/20 text-purple-400',
      exported: 'bg-gray-500/20 text-gray-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
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
        <h1 className="text-2xl font-bold text-white">Available Coffee Lots</h1>
        <p className="text-gray-400 mt-1">Browse and trace Ethiopian coffee</p>
      </div>

      {lots.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <Package size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No coffee lots available</p>
          <p className="text-gray-600 text-sm mt-1">Check back later for new harvests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lots.map(lot => (
            <div key={lot.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-coffee-500 transition">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg">{lot.lot_number}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={12} />
                      {lot.farm_name || 'Ethiopian Farm'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lot.status)}`}>
                    {lot.status || 'Available'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-gray-300 text-sm">🌱 Farmer: {lot.farmer_name || 'Cooperative'}</p>
                  <p className="text-gray-300 text-sm">⚖️ Quantity: {lot.quantity_kg?.toLocaleString()} kg</p>
                  <p className="text-gray-300 text-sm">🔄 Processing: {lot.processing_method || 'Washed'}</p>
                  {lot.sca_score && (
                    <p className="text-yellow-400 text-sm font-semibold">⭐ SCA Score: {lot.sca_score}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-700">
                  <Link
                    to={`/trace/${lot.id}`}
                    className="w-full py-2 bg-coffee-600 hover:bg-coffee-700 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    View Traceability
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-400 text-sm text-center">
          🔍 Each lot has a unique QR code. Scan to see full farm-to-export traceability.
        </p>
      </div>
    </div>
  );
};

export default BuyerLots;