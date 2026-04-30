import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Truck, Plus, Search, X, Loader2, Eye, FileText } from 'lucide-react';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLots, setSelectedLots] = useState([]);
  const [formData, setFormData] = useState({
    lot_ids: [],
    container_number: '',
    shipping_line: '',
    bill_of_lading: '',
    export_date: '',
    port_of_origin: 'Djibouti',
    port_of_destination: '',
    quantity_kg: '',
    number_of_bags: '',
    fob_price_usd: '',
    buyer_name: '',
    buyer_company: '',
    buyer_country: '',
    eudr_compliant: false,
    gps_validated: false
  });

  useEffect(() => {
    fetchShipments();
    fetchAvailableLots();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await API.get('/shipments');
      setShipments(response.data.data || []);
    } catch (err) {
      console.error('Fetch shipments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableLots = async () => {
    try {
      const response = await API.get('/lots');
      const available = (response.data.data || []).filter(lot => lot.status === 'stored');
      setLots(available);
    } catch (err) {
      console.error('Fetch lots error:', err);
    }
  };

  const toggleLotSelection = (lotId) => {
    setSelectedLots(prev => {
      if (prev.includes(lotId)) {
        return prev.filter(id => id !== lotId);
      } else {
        return [...prev, lotId];
      }
    });
    setFormData(prev => ({
      ...prev,
      lot_ids: selectedLots.includes(lotId) 
        ? prev.lot_ids.filter(id => id !== lotId)
        : [...prev.lot_ids, lotId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.lot_ids.length === 0) {
      alert('Please select at least one lot');
      return;
    }
    
    try {
      await API.post('/shipments', formData);
      resetModal();
      fetchShipments();
      fetchAvailableLots();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create shipment');
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setSelectedLots([]);
    setFormData({
      lot_ids: [],
      container_number: '',
      shipping_line: '',
      bill_of_lading: '',
      export_date: '',
      port_of_origin: 'Djibouti',
      port_of_destination: '',
      quantity_kg: '',
      number_of_bags: '',
      fob_price_usd: '',
      buyer_name: '',
      buyer_company: '',
      buyer_country: '',
      eudr_compliant: false,
      gps_validated: false
    });
  };

  const handleAddCompliance = async (shipmentId) => {
    // Simplified - in real app, would open a modal
    alert('Compliance document upload feature coming soon');
  };

  const filteredShipments = shipments.filter(s =>
    s.shipment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelectedWeight = lots
    .filter(l => selectedLots.includes(l.id))
    .reduce((sum, l) => sum + (l.quantity_kg || 0), 0);

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
          <h1 className="text-2xl font-bold text-white">Export Shipments</h1>
          <p className="text-gray-400 mt-1">Manage coffee export shipments and compliance</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
        >
          <Plus size={18} /> Create Shipment
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by shipment number or buyer..."
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredShipments.map(shipment => (
          <div key={shipment.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                    <Truck size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{shipment.shipment_number}</h3>
                    <p className="text-gray-400 text-sm">{shipment.buyer_company || 'Unknown Buyer'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  shipment.eudr_compliant ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {shipment.eudr_compliant ? 'EUDR Compliant' : 'Pending Compliance'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <p className="text-gray-300 text-sm">📦 {shipment.lot_count || 0} lots</p>
                <p className="text-gray-300 text-sm">⚖️ {shipment.quantity_kg?.toLocaleString()} kg</p>
                <p className="text-gray-300 text-sm">🚢 {shipment.shipping_line || 'TBD'}</p>
                <p className="text-gray-300 text-sm">📅 {new Date(shipment.export_date).toLocaleDateString()}</p>
                <p className="text-gray-300 text-sm">💰 ${shipment.fob_price_usd?.toLocaleString()}</p>
                <p className="text-gray-300 text-sm">📍 {shipment.port_of_destination}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                  <Eye size={14} />
                  View Details
                </button>
                <button 
                  onClick={() => handleAddCompliance(shipment.id)}
                  className="flex-1 py-2 bg-coffee-600 hover:bg-coffee-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  Compliance
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredShipments.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-xl">
          <Truck size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No shipments found</p>
          <p className="text-gray-600 text-sm mt-1">Click "Create Shipment" to export coffee</p>
        </div>
      )}

      {/* Create Shipment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Create New Shipment</h2>
                <button onClick={resetModal} className="text-gray-400 hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Lots */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Lots to Export</label>
                  <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-700 rounded-lg p-3">
                    {lots.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No stored lots available for export</p>
                    ) : (
                      lots.map(lot => (
                        <label key={lot.id} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedLots.includes(lot.id)}
                            onChange={() => toggleLotSelection(lot.id)}
                            className="w-4 h-4 rounded border-gray-500 bg-gray-600 text-coffee-600"
                          />
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{lot.lot_number}</p>
                            <p className="text-gray-400 text-xs">{lot.farm_name} | {lot.quantity_kg?.toLocaleString()} kg</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedLots.length > 0 && (
                    <p className="text-coffee-400 text-xs mt-2">Total: {totalSelectedWeight.toLocaleString()} kg</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Container Number</label>
                    <input
                      type="text"
                      value={formData.container_number}
                      onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="e.g., MSCU1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Shipping Line</label>
                    <input
                      type="text"
                      value={formData.shipping_line}
                      onChange={(e) => setFormData({ ...formData, shipping_line: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="e.g., Maersk, MSC"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bill of Lading</label>
                    <input
                      type="text"
                      value={formData.bill_of_lading}
                      onChange={(e) => setFormData({ ...formData, bill_of_lading: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Export Date</label>
                    <input
                      type="date"
                      required
                      value={formData.export_date}
                      onChange={(e) => setFormData({ ...formData, export_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Port of Origin</label>
                    <select
                      value={formData.port_of_origin}
                      onChange={(e) => setFormData({ ...formData, port_of_origin: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="Djibouti">Djibouti</option>
                      <option value="Berbera">Berbera</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Port of Destination</label>
                    <input
                      type="text"
                      required
                      value={formData.port_of_destination}
                      onChange={(e) => setFormData({ ...formData, port_of_destination: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="e.g., Hamburg, Rotterdam"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Total Quantity (kg)</label>
                    <input
                      type="number"
                      value={formData.quantity_kg}
                      onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Number of Bags</label>
                    <input
                      type="number"
                      value={formData.number_of_bags}
                      onChange={(e) => setFormData({ ...formData, number_of_bags: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">FOB Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fob_price_usd}
                      onChange={(e) => setFormData({ ...formData, fob_price_usd: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Buyer Name</label>
                    <input
                      type="text"
                      value={formData.buyer_name}
                      onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Buyer Company</label>
                    <input
                      type="text"
                      value={formData.buyer_company}
                      onChange={(e) => setFormData({ ...formData, buyer_company: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Buyer Country</label>
                  <input
                    type="text"
                    value={formData.buyer_country}
                    onChange={(e) => setFormData({ ...formData, buyer_country: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g., Germany, USA"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.eudr_compliant}
                      onChange={(e) => setFormData({ ...formData, eudr_compliant: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-500"
                    />
                    <span className="text-gray-300 text-sm">EUDR Compliant</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.gps_validated}
                      onChange={(e) => setFormData({ ...formData, gps_validated: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-500"
                    />
                    <span className="text-gray-300 text-sm">GPS Validated</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-2 bg-coffee-600 hover:bg-coffee-700 text-white rounded-xl font-semibold transition">
                    Create Shipment
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

export default Shipments;