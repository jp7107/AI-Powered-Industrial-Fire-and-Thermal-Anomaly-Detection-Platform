import React, { useState } from 'react';
import { 
  Flame, 
  Search, 
  Bell, 
  Map, 
  ListFilter, 
  Building2, 
  BarChart3, 
  AlertTriangle, 
  FileText, 
  Settings,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { StatusResponse } from '../../types';

interface AppHeaderProps {
  status: StatusResponse;
  unreadAlertsCount?: number;
  onSearch?: (query: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  status, 
  unreadAlertsCount = 3,
  onSearch 
}) => {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Flame },
    { label: 'Live Map', path: '/map', icon: Map },
    { label: 'Events', path: '/events', icon: ListFilter },
    { label: 'Facilities', path: '/facilities', icon: Building2 },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: unreadAlertsCount },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="w-full h-16 bg-[#050A12]/95 border-b border-white/10 px-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-3 shrink-0">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 flex items-center justify-center p-0.5 shadow-glowRed group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#050A12] rounded-full flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-500 fill-red-500/80 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-wide">ThermoWatch</span>
              <span className="text-xs font-extrabold uppercase px-1.5 py-0.2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
              Industrial Fire & Thermal Monitoring
            </p>
          </div>
        </Link>
      </div>

      {/* Center navigation pills */}
      <nav className="hidden lg:flex items-center space-x-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-glow font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right controls: mode chip, timestamp, search, alerts bell, profile */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Mode & freshness chip */}
        <div 
          onClick={() => setShowStatusModal(true)}
          className="cursor-pointer hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all text-xs"
          title="Click for data provenance & simulation status"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span className="font-semibold text-blue-300 text-[11px] uppercase tracking-wider">
            {status.mode === 'live' ? 'LIVE DATA' : status.mode === 'simulation' ? 'SIMULATION' : 'DEMO DATA'}
          </span>
          <span className="text-[10px] text-slate-400 hidden xl:inline border-l border-white/10 pl-2">
            Updated {new Date(status.as_of).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
          </span>
        </div>

        {/* Global search */}
        <div className="relative hidden md:block w-48 lg:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search facility, event... (⌘K)"
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Notification Bell */}
        <Link 
          to="/alerts" 
          className="relative p-2 rounded-lg bg-white/[0.04] border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </Link>

        {/* Settings shortcut */}
        <Link 
          to="/settings"
          className="p-2 rounded-lg bg-white/[0.04] border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          title="System Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center font-bold text-xs text-white shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
          JP
        </div>
      </div>

      {/* Status details modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/20 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white text-base">System Status & Data Provenance</h3>
              </div>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Current Mode</span>
                <span className="font-semibold text-blue-400 uppercase">{status.mode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Dataset Name</span>
                <span className="font-medium text-white">{status.dataset.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Data Origin</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                  {status.dataset.data_origin}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Freshness Status</span>
                <span className="font-semibold text-emerald-400 uppercase">{status.freshness.state}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Last Observation</span>
                <span className="text-slate-200">{new Date(status.freshness.last_observation_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Classification Model</span>
                <span className="font-mono text-purple-300">{status.versions.model}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Rules Engine</span>
                <span className="font-mono text-purple-300">{status.versions.rules}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
