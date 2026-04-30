import React from 'react';
import { Coffee, Map, Package, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Farmer Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Track your coffee production</p>
      </div>

      <div className="bg-gradient-to-r from-coffee-800 to-coffee-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Coffee size={28} />
          <h2 className="text-xl font-semibold">Your Coffee Journey</h2>
        </div>
        <p className="text-coffee-200">
          Track your coffee from harvest to export. Every lot you produce gets a unique QR code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/farmer/farms" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-coffee-500 transition group">
          <Map size={32} className="text-coffee-400 mb-3" />
          <h3 className="text-white font-semibold text-lg">My Farms</h3>
          <p className="text-gray-400 text-sm mt-1">View your registered farms</p>
        </Link>

        <Link to="/farmer/lots" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-coffee-500 transition group">
          <Package size={32} className="text-coffee-400 mb-3" />
          <h3 className="text-white font-semibold text-lg">My Lots</h3>
          <p className="text-gray-400 text-sm mt-1">Track your coffee harvests</p>
        </Link>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <QrCode size={32} className="text-coffee-400 mb-3" />
          <h3 className="text-white font-semibold text-lg">QR Codes</h3>
          <p className="text-gray-400 text-sm mt-1">Download QR codes for your lots</p>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;