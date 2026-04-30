import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Coffee, MapPin, Calendar, Package, Award, Loader2 } from 'lucide-react';

const PublicTrace = () => {
  const { lotNumber } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTraceData();
  }, [lotNumber]);

  const fetchTraceData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/public/trace/${lotNumber}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load traceability data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-coffee-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Coffee size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500">Lot not found</p>
          <p className="text-gray-600 text-sm mt-2">The coffee lot you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  const { lot, trace_events, quality } = data;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Coffee className="mx-auto text-coffee-500 mb-3" size={40} />
          <h1 className="text-2xl font-bold text-white">Coffee Traceability</h1>
          <p className="text-gray-400">Farm to Cup Transparency</p>
        </div>

        {/* Lot Info Card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{lot.lot_number}</h2>
              <p className="text-coffee-400 mt-1">{lot.farm_name || 'Unknown Farm'}</p>
            </div>
            {quality && (
              <div className="text-center">
                <p className="text-gray-400 text-sm">SCA Score</p>
                <p className="text-2xl font-bold text-yellow-400">{quality.total_score}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-gray-500 text-sm">Farmer</p>
              <p className="text-white">{lot.farmer_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cooperative</p>
              <p className="text-white">{lot.cooperative_name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Harvest Date</p>
              <p className="text-white">{new Date(lot.harvest_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Processing</p>
              <p className="text-white capitalize">{lot.processing_method}</p>
            </div>
          </div>

          {lot.altitude && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <MapPin size={14} />
                Altitude: {lot.altitude}m above sea level
              </p>
            </div>
          )}
        </div>

        {/* Trace Timeline */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Journey Timeline</h3>
          
          <div className="space-y-4">
            {trace_events.map((event, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-coffee-600/20 flex items-center justify-center">
                  {event.event_type === 'harvest' && <Package size={18} className="text-coffee-400" />}
                  {event.event_type === 'export' && <Package size={18} className="text-coffee-400" />}
                  {(!event.event_type || event.event_type === 'washing') && <Package size={18} className="text-coffee-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <p className="text-white font-medium capitalize">{event.event_type}</p>
                    <p className="text-gray-500 text-sm">{new Date(event.event_date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>

          {trace_events.length === 0 && (
            <p className="text-gray-500 text-center py-8">No trace events recorded</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-xs">
            Verified by Coffee Traceability System • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicTrace;