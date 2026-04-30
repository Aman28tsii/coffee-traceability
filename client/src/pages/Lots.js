import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Package, Plus, Search, X, Loader2, Eye, QrCode, FileText } from 'lucide-react';
import { generateLotReport } from '../utils/pdfExport';

const Lots = () => {
  const [lots, setLots] = useState([]);
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    farm_id: '',
    farmer_id: '',
    harvest_date: '',
    processing_method: 'washed',
    quantity_kg: '',
    notes: ''
  });

  useEffect(() => {
    fetchLots();
    fetchFarms();
    fetchFarmers();
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

  const fetchFarms = async () => {
    try {
      const response = await API.get('/farms');
      setFarms(response.data.data || []);
    } catch (err) {
      console.error('Fetch farms error:', err);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await API.get('/farmers');
      setFarmers(response.data.data || []);
    } catch (err) {
      console.error('Fetch farmers error:', err);
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

  const handleExportPDF = (lot) => {
    generateLotReport(lot, { name: lot.farm_name }, { name: lot.farmer_name }, [], { total_score: lot.sca_score });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/lots', formData);
      resetModal();
      fetchLots();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create lot');
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setFormData({
      farm_id: '',
      farmer_id: '',
      harvest_date: '',
      processing_method: 'washed',
      quantity_kg: '',
      notes: ''
    });
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

  const filteredLots = lots.filter(l =>
    l.lot_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.farm_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-coffee-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coffee Lots</h1>
          <p className="text-gray-400 mt-1">Manage coffee harvest batches</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
        >
          <Plus size={18} /> Create Lot
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by lot number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white pl-10 focus:outline-none focus:ring-2 focus:ring-coffee-500"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={18} className="text-gray-500" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLots.map(lot => (
          <div key={lot.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">{lot.lot_number}</h3>
                  <p className="text-gray-400 text-sm">{lot.farm_name || 'Unknown Farm'}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lot.status)}`}>
                    {lot.status}
                  </span>
                  <button
                    onClick={() => downloadQRCode(lot.lot_number)}
                    className="p-2 bg-gray-700 hover:bg-coffee-600 rounded-lg transition"
                    title="Download QR Code"
                  >
                    <QrCode size={16} className="text-coffee-400" />
                  </button>
                  <button
                    onClick={() => handleExportPDF(lot)}
                    className="p-2 bg-gray-700 hover:bg-green-600 rounded-lg transition"
                    title="Export PDF Report"
                  >
                    <FileText size={16} className="text-green-400" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-gray-300 text-sm">👨‍🌾 {lot.farmer_name || 'Unknown Farmer'}</p>
                <p className="text-gray-300 text-sm">📅 {new Date(lot.harvest_date).toLocaleDateString()}</p>
                <p className="text-gray-300 text-sm">⚖️ {lot.quantity_kg?.toLocaleString()} kg</p>
                <p className="text-gray-300 text-sm">🔄 {lot.processing_method}</p>
                {lot.sca_score && (
                  <p className="text-yellow-400 text-sm">⭐ SCA Score: {lot.sca_score}</p>
                )}
              </div>

              <div className="mt-4">
                <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                  <Eye size={14} />
                  View Trace
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLots.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-xl">
          <Package size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No lots found</p>
          <p className="text-gray-600 text-sm mt-1">Click "Create Lot" to get started</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Create New Lot</h2>
                <button onClick={resetModal} className="text-gray-400 hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Farm *</label>
                  <select
                    required
                    value={formData.farm_id}
                    onChange={(e) => setFormData({ ...formData, farm_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select Farm</option>
                    {farms.map(farm => (
                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Farmer *</label>
                  <select
                    required
                    value={formData.farmer_id}
                    onChange={(e) => setFormData({ ...formData, farmer_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select Farmer</option>
                    {farmers.map(farmer => (
                      <option key={farmer.id} value={farmer.id}>{farmer.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Harvest Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.harvest_date}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Processing Method</label>
                  <select
                    value={formData.processing_method}
                    onChange={(e) => setFormData({ ...formData, processing_method: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="washed">Washed</option>
                    <option value="natural">Natural</option>
                    <option value="honey">Honey</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Quantity (kg) *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-2 bg-coffee-600 hover:bg-coffee-700 text-white rounded-xl font-semibold transition">
                    Create Lot
                  </button>
                  <button type="button" onClick={resetModal} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lots;