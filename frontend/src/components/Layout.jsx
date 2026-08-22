import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Database, Search, History, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const closeMenu = () => setIsMobileMenuOpen(false);

  const getLinkClasses = (path) => {
    const isActive = location.pathname.startsWith(path);
    return `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
      isActive 
        ? 'text-brand-600 bg-brand-50' 
        : 'text-gray-600 hover:bg-gray-50'
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between md:block">
          <h1 className="text-2xl font-bold text-brand-600 flex items-center gap-2">
            <Database className="w-6 h-6" />
            QueryCraft
          </h1>
          <button className="md:hidden text-gray-500 hover:text-gray-700 p-1" onClick={closeMenu} aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link to="/dashboard" onClick={closeMenu} className={getLinkClasses('/dashboard')}>
            <Search className="w-5 h-5" />
            Query
          </Link>
          <Link to="/connections" onClick={closeMenu} className={getLinkClasses('/connections')}>
            <Database className="w-5 h-5" />
            Connections
          </Link>
          <Link to="/history" onClick={closeMenu} className={getLinkClasses('/history')}>
            <History className="w-5 h-5" />
            History
          </Link>
          <Link to="/settings" onClick={closeMenu} className={getLinkClasses('/settings')}>
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold border border-brand-200 uppercase shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors w-full"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 shrink-0">
          <button 
            className="md:hidden mr-4 p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 capitalize hidden sm:block">
            {location.pathname.replace('/', '')}
          </h2>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
