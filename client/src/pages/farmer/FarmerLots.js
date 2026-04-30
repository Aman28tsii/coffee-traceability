import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Package, Loader2, QrCode } from 'lucide-react';

const FarmerLots = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLots();
  }, []);

  const fetchMyLots = async () => {
    try {
      const response = await API.get('/lots');
      setLots(response.data.data || []);
    } catch (err) {
      console.error('Fetch lots error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async (lotNumber) => {
    try {
      const response = await API.get(`/lots/qr/${lotNumber}`);
      if (response.data.success && response.data.qrCode) {
        const link = document.createElement('a');
        link.href = response.data.qrCode;
        link.download = `qrcode_${lotNumber}.png`;
        link.click();
      }
    } catch (err) {
      alert('Failed to download QR code');
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
        <h1 className="text-2xl font-bold text-white">My Coffee Lots</h1>
        <p className="text-gray-400 mt-1">Track your coffee production</p>
      </div>

      {lots.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <Package size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No coffee lots yet</p>
          <p className="text-gray-600 text-sm mt-1">Lots will appear here when harvest is recorded</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lots.map(lot => (
            <div key={lot.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">{lot.lot_number}</h3>
                    <p className="text-gray-400 text-sm">{lot.farm_name || 'Unknown Farm'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lot.status)}`}>
                    {lot.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-gray-300 text-sm">📅 Harvest: {new Date(lot.harvest_date).toLocaleDateString()}</p>
                  <p className="text-gray-300 text-sm">⚖️ Quantity: {lot.quantity_kg?.toLocaleString()} kg</p>
                  <p className="text-gray-300 text-sm">🔄 Processing: {lot.processing_method}</p>
                  {lot.sca_score && <p className="text-yellow-400 text-sm">⭐ SCA Score: {lot.sca_score}</p>}
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => downloadQRCode(lot.lot_number)}
                    className="w-full py-2 bg-gray-700 hover:bg-coffee-600 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <QrCode size={14} />
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerLots;