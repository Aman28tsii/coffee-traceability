import React from 'react';
import { Coffee, Package, QrCode, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuyerDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Buyer Dashboard</h1>
        <p className="text-gray-400 mt-1">Discover and trace Ethiopian specialty coffee</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/lots" className="bg-gradient-to-r from-coffee-700 to-coffee-800 rounded-2xl p-6 text-white hover:from-coffee-600 transition">
          <Package size={40} className="mb-3" />
          <h2 className="text-xl font-bold">Browse Lots</h2>
          <p className="text-coffee-200 mt-1">View available coffee lots with full traceability</p>
        </Link>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <QrCode size={40} className="text-coffee-400 mb-3" />
          <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
          <p className="text-gray-400 mt-1">Trace any coffee lot from farm to cup</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={20} className="text-green-400" />
          <h3 className="text-white font-semibold">Why Traceability Matters</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Every coffee lot in our system is fully traceable from farm to export. 
          You can see the farm location, processing method, quality scores, and export documentation.
        </p>
      </div>
    </div>
  );
};

export default BuyerDashboard;