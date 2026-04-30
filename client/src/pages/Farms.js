import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Edit2, Trash2, Search, X, Loader2, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  
  return position ? <Marker position={position} /> : null;
};

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 9.03, lng: 38.74 });
  const [formData, setFormData] = useState({
    farmer_id: '',
    name: '',
    location_description: '',
    latitude: '',
    longitude: '',
    altitude: '',
    area_hectares: '',
    coffee_variety: '',
    tree_age: '',
    certifications: []
  });

  useEffect(() => {
    fetchFarms();
    fetchFarmers();
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

  const fetchFarmers = async () => {
    try {
      const response = await API.get('/farmers');
      setFarmers(response.data.data || []);
    } catch (err) {
      console.error('Fetch farmers error:', err);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setSelectedLocation({ lat, lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFarm) {
        await API.put(`/farms/${editingFarm.id}`, formData);
      } else {
        await API.post('/farms', formData);
      }
      resetModal();
      fetchFarms();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save farm');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this farm?')) {
      try {
        await API.delete(`/farms/${id}`);
        fetchFarms();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingFarm(null);
    setFormData({
      farmer_id: '',
      name: '',
      location_description: '',
      latitude: '',
      longitude: '',
      altitude: '',
      area_hectares: '',
      coffee_variety: '',
      tree_age: '',
      certifications: []
    });
    setShowMap(false);
  };

  const filteredFarms = farms.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.farm_code?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-white">Farms</h1>
          <p className="text-gray-400 mt-1">Manage coffee farm locations and details</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
        >
          <Plus size={18} /> Add Farm
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by name or code..."
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
        {filteredFarms.map(farm => (
          <div key={farm.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                    <MapPin size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{farm.name}</h3>
                    <p className="text-gray-400 text-sm">{farm.farm_code}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingFarm(farm);
                      setFormData(farm);
                      if (farm.latitude && farm.longitude) {
                        setSelectedLocation({ lat: parseFloat(farm.latitude), lng: parseFloat(farm.longitude) });
                      }
                      setShowModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(farm.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-gray-300 text-sm">👨‍🌾 {farm.farmer_name || 'Unknown Farmer'}</p>
                {farm.coffee_variety && (
                  <p className="text-gray-300 text-sm">🌱 Variety: {farm.coffee_variety}</p>
                )}
                {farm.altitude && (
                  <p className="text-gray-300 text-sm">⛰️ Altitude: {farm.altitude}m</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFarms.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-xl">
          <MapPin size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No farms found</p>
          <p className="text-gray-600 text-sm mt-1">Click "Add Farm" to get started</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingFarm ? 'Edit Farm' : 'Add New Farm'}
                </h2>
                <button onClick={resetModal} className="text-gray-400 hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      <option key={farmer.id} value={farmer.id}>{farmer.name} ({farmer.farmer_code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Farm Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location Description</label>
                  <input
                    type="text"
                    value={formData.location_description}
                    onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">GPS Coordinates</label>
                    <button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className="text-xs text-coffee-400 hover:text-coffee-300"
                    >
                      {showMap ? 'Hide Map' : 'Click on Map to Set Location'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || '' })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || '' })}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  
                  {showMap && (
                    <div className="mt-3 h-64 rounded-lg overflow-hidden border border-gray-600">
                      <MapContainer center={[selectedLocation.lat, selectedLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker onLocationSelect={handleLocationSelect} />
                      </MapContainer>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Altitude (m)</label>
                    <input
                      type="number"
                      value={formData.altitude}
                      onChange={(e) => setFormData({ ...formData, altitude: parseInt(e.target.value) || '' })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Area (hectares)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.area_hectares}
                      onChange={(e) => setFormData({ ...formData, area_hectares: parseFloat(e.target.value) || '' })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Coffee Variety</label>
                    <input
                      type="text"
                      value={formData.coffee_variety}
                      onChange={(e) => setFormData({ ...formData, coffee_variety: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tree Age (years)</label>
                    <input
                      type="number"
                      value={formData.tree_age}
                      onChange={(e) => setFormData({ ...formData, tree_age: parseInt(e.target.value) || '' })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-2 bg-coffee-600 hover:bg-coffee-700 text-white rounded-xl font-semibold transition">
                    {editingFarm ? 'Update' : 'Create'}
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

export default Farms;