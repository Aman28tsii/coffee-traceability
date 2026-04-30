import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Coffee, LayoutDashboard, Users, Map, Package, Truck, LogOut, Menu, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Sidebar = ({ user, onLogout }) => {
  const { t } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getMenuItems = () => {
    const role = user?.role || 'exporter';
    
    if (role === 'admin' || role === 'exporter') {
      return [
        { path: '/dashboard', icon: LayoutDashboard, label: t('Dashboard') },
        { path: '/farmers', icon: Users, label: t('Farmers') },
        { path: '/farms', icon: Map, label: t('Farms') },
        { path: '/lots', icon: Package, label: t('Lots') },
        { path: '/shipments', icon: Truck, label: t('Exports') },
      ];
    }
    
    if (role === 'farmer') {
      return [
        { path: '/dashboard', icon: LayoutDashboard, label: t('Dashboard') },
        { path: '/farmer/farms', icon: Map, label: t('My Farms') },
        { path: '/farmer/lots', icon: Package, label: t('My Lots') },
      ];
    }
    
    if (role === 'coop') {
      return [
        { path: '/dashboard', icon: LayoutDashboard, label: t('Dashboard') },
        { path: '/coop/farmers', icon: Users, label: t('Member Farmers') },
        { path: '/coop/farms', icon: Map, label: t('Farms') },
        { path: '/lots', icon: Package, label: t('Lots') },
      ];
    }
    
    if (role === 'buyer') {
      return [
        { path: '/dashboard', icon: LayoutDashboard, label: t('Dashboard') },
        { path: '/lots', icon: Package, label: t('Browse Lots') },
      ];
    }
    
    return [{ path: '/dashboard', icon: LayoutDashboard, label: t('Dashboard') }];
  };

  const menuItems = getMenuItems();

  const MenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Coffee className="text-coffee-500" size={32} />
          <div>
            <h1 className="text-xl font-bold text-white">CoffeeTrace</h1>
            <p className="text-xs text-gray-400 capitalize">{user?.role || 'exporter'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-coffee-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-3 px-4 py-2 bg-gray-700 rounded-xl">
          <p className="text-sm text-gray-400">{t('Logged in as')}</p>
          <p className="text-white font-semibold truncate">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role || 'exporter'}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-semibold"
        >
          <LogOut size={18} />
          {t('Logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-700"
      >
        {isMobileOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`
        fixed md:relative z-40 w-72 bg-gray-800 border-r border-gray-700 transition-transform duration-300 h-full
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <MenuContent />
      </aside>
    </>
  );
};

export default Sidebar;