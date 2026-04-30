import React from 'react';
import { Bell, User, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = ({ user }) => {
  const { language, toggleLanguage, t } = useLanguage();
  
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 md:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="ml-12 md:ml-0">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            {t('Welcome')}, {user?.name?.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-sm text-gray-400">{t('Coffee Traceability Dashboard')}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Globe size={20} className="text-gray-400" />
            <span className="text-gray-400 text-sm font-medium">
              {language === 'en' ? 'አማርኛ' : 'English'}
            </span>
          </button>
          
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-coffee-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-400" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role || 'exporter'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;