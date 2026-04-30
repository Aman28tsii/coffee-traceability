import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Edit2, Trash2, Search, X, Loader2, User } from 'lucide-react';

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cooperative_name: '',
    id_number: '',
    password: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFarmer) {
        await API.put(`/farmers/${editingFarmer.id}`, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          cooperative_name: formData.cooperative_name,
          id_number: formData.id_number
        });
        alert('Farmer updated successfully!');
      } else {
        const response = await API.post('/farmers', formData);
        if (response.data.credentials) {
          alert(`Farmer created!\nEmail: ${response.data.credentials.email}\nPassword: ${response.data.credentials.password}\n\nGive these credentials to the farmer.`);
        } else {
          alert('Farmer created successfully!');
        }
      }
      resetModal();
      fetchFarmers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save farmer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this farmer? This will also delete their user account.')) {
      try {
        await API.delete(`/farmers/${id}`);
        alert('Farmer deleted successfully');
        fetchFarmers();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingFarmer(null);
    setFormData({ name: '', phone: '', email: '', cooperative_name: '', id_number: '', password: '' });
  };

  const filteredFarmers = farmers.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.farmer_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-white">Farmers</h1>
          <p className="text-gray-400 mt-1">Manage coffee farmers and cooperatives</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
        >
          <Plus size={18} /> Add Farmer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by name, code, or email..."
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

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFarmers.map(farmer => (
          <div key={farmer.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-coffee-500 transition">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <User size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{farmer.name}</h3>
                    <p className="text-gray-400 text-sm">{farmer.farmer_code}</p>
                    <p className="text-gray-500 text-xs mt-1">{farmer.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingFarmer(farmer);
                      setFormData({
                        name: farmer.name,
                        phone: farmer.phone || '',
                        email: farmer.email || '',
                        cooperative_name: farmer.cooperative_name || '',
                        id_number: farmer.id_number || '',
                        password: ''
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(farmer.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {farmer.phone && (
                  <p className="text-gray-300 text-sm">📞 {farmer.phone}</p>
                )}
                {farmer.cooperative_name && (
                  <p className="text-gray-300 text-sm">🏢 {farmer.cooperative_name}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  🌾 {farmer.farm_count || 0} farms
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFarmers.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-xl">
          <User size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No farmers found</p>
          <p className="text-gray-600 text-sm mt-1">Click "Add Farmer" to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}
                </h2>
                <button onClick={resetModal} className="text-gray-400 hover:text-gray-300">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be their login username</p>
                </div>

                {!editingFarmer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="Leave empty for default: farmer123"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min 6 characters. Farmer will use this to login.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cooperative Name</label>
                  <input
                    type="text"
                    value={formData.cooperative_name}
                    onChange={(e) => setFormData({ ...formData, cooperative_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-2 bg-coffee-600 hover:bg-coffee-700 text-white rounded-xl font-semibold transition">
                    {editingFarmer ? 'Update' : 'Create'}
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

export default Farmers;