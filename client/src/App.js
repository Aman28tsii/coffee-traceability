import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import Farms from './pages/Farms';
import Lots from './pages/Lots';
import Shipments from './pages/Shipments';
import Traceability from './pages/Traceability';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import PublicTrace from './pages/PublicTrace';
import AdminDashboard from './pages/admin/AdminDashboard';
import ExporterDashboard from './pages/exporter/ExporterDashboard';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerFarms from './pages/farmer/FarmerFarms';
import FarmerLots from './pages/farmer/FarmerLots';
import CoopDashboard from './pages/coop/CoopDashboard';
import CoopFarmers from './pages/coop/CoopFarmers';
import CoopFarms from './pages/coop/CoopFarms';
import BuyerLots from './pages/buyer/BuyerLots';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/public/trace/:lotNumber" element={<PublicTrace />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  const userRole = user?.role || 'exporter';

  const getDashboardComponent = (role) => {
    switch(role) {
      case 'admin': return <AdminDashboard />;
      case 'exporter': return <ExporterDashboard />;
      case 'farmer': return <FarmerDashboard />;
      case 'coop': return <CoopDashboard />;
      default: return <ExporterDashboard />;
    }
  };

  const getAccessibleRoutes = (role) => {
    if (role === 'admin' || role === 'exporter') {
      return (
        <>
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/lots" element={<Lots />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/trace/:lotId" element={<Traceability />} />
        </>
      );
    }
    
    if (role === 'farmer') {
      return (
        <>
          <Route path="/farmer/farms" element={<FarmerFarms />} />
          <Route path="/farmer/lots" element={<FarmerLots />} />
          <Route path="/trace/:lotId" element={<Traceability />} />
        </>
      );
    }
    
 if (role === 'coop') {
  return (
    <>
      <Route path="/coop/farmers" element={<CoopFarmers />} />
      <Route path="/coop/farms" element={<CoopFarms />} />
      <Route path="/lots" element={<Lots />} />
      <Route path="/trace/:lotId" element={<Traceability />} />
    </>
  );
}
// In getAccessibleRoutes function, add buyer to see lots
if (role === 'buyer') {
  return (
    <>
      <Route path="/lots" element={<BuyerLots />} />
      <Route path="/trace/:lotId" element={<Traceability />} />
    </>
  );
}
    return (
      <>
        <Route path="/trace/:lotId" element={<Traceability />} />
      </>
    );
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-900">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-6">
            <Routes>
              <Route path="/dashboard" element={getDashboardComponent(userRole)} />
              {getAccessibleRoutes(userRole)}
              <Route path="/public/trace/:lotNumber" element={<PublicTrace />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;