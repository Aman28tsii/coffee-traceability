import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar, User, Package, Truck, Loader2, QrCode, FileText } from 'lucide-react';
import { generateLotReport } from '../utils/pdfExport';

const Traceability = () => {
  const { lotId } = useParams();
  const [lot, setLot] = useState(null);
  const [traceEvents, setTraceEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLotDetails();
  }, [lotId]);

  const fetchLotDetails = async () => {
    try {
      const [lotRes, traceRes] = await Promise.all([
        API.get(`/lots/${lotId}`),
        API.get(`/trace/lots/${lotId}/timeline`)
      ]);
      setLot(lotRes.data.data);
      setTraceEvents(traceRes.data.data || []);
    } catch (err) {
      console.error('Fetch trace error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (lot) {
      generateLotReport(lot, { name: lot.farm_name }, { name: lot.farmer_name }, traceEvents, { total_score: lot.sca_score });
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

  const getEventIcon = (type) => {
    const icons = {
      harvest: <Package size={20} />,
      washing: <Package size={20} />,
      drying: <Package size={20} />,
      storage: <Package size={20} />,
      export: <Truck size={20} />
    };
    return icons[type] || <MapPin size={20} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-coffee-500" size={40} />
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lot not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Traceability Timeline</h1>
          <p className="text-gray-400 mt-1">Lot #{lot.lot_number}</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition"
        >
          <FileText size={16} />
          Export PDF Report
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{lot.farm_name || 'Unknown Farm'}</h2>
            <p className="text-gray-400">{lot.farmer_name}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(lot.status)}`}>
              {lot.status?.toUpperCase()}
            </span>
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
              <QrCode size={20} className="text-coffee-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-gray-500 text-sm">Harvest Date</p>
            <p className="text-white">{new Date(lot.harvest_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Quantity</p>
            <p className="text-white">{lot.quantity_kg?.toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Processing</p>
            <p className="text-white capitalize">{lot.processing_method}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">SCA Score</p>
            <p className="text-yellow-400 font-bold">{lot.sca_score || 'Not assessed'}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Traceability Timeline</h3>
        
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-coffee-500/30"></div>
          
          {traceEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No trace events recorded yet</p>
          ) : (
            <div className="space-y-6">
              {traceEvents.map((event, idx) => (
                <div key={idx} className="relative flex gap-4">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-coffee-600 flex items-center justify-center">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h4 className="text-white font-semibold capitalize">{event.event_type}</h4>
                      <p className="text-gray-400 text-sm">{new Date(event.event_date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{event.description}</p>
                    {event.operator_name && (
                      <p className="text-gray-500 text-xs mt-2">Operator: {event.operator_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Traceability;