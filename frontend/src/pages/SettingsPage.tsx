import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { api } from '../lib/api';
import { StatusResponse, AppMode } from '../types';
import { 
  Settings as SettingsIcon, 
  Map, 
  Bell, 
  User, 
  Key, 
  Save, 
  CheckCircle2, 
  Database, 
  Activity,
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'map' | 'alerts' | 'profile' | 'api'>('general');
  const [mode, setMode] = useState<AppMode>('demo');
  const [defaultMapView, setDefaultMapView] = useState('India');
  const [defaultTimeRange, setDefaultTimeRange] = useState('Last 7 Days');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFacilityLayer, setShowFacilityLayer] = useState(true);
  const [showWeatherLayer, setShowWeatherLayer] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getStatus().then(s => {
      setStatus(s);
      if (s) setMode(s.mode);
    });
  }, []);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!status) return null;

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans">
      <AppHeader status={status} />

      <main className="p-3.5 max-w-[1920px] mx-auto w-full flex-1 flex flex-col space-y-3">
        <div className="glass-panel p-4 rounded-xl border border-white/10 mb-1">
          <h2 className="text-lg font-bold text-white tracking-tight">System & Application Configuration</h2>
          <p className="text-xs text-slate-400">Manage data operating mode, geospatial preferences, API keys, and notification thresholds.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
          {/* Left Column: Navigation Tabs */}
          <div className="lg:col-span-3 glass-panel p-4 rounded-xl border border-white/10 space-y-1.5">
            {[
              { id: 'general', label: 'General Settings', icon: SettingsIcon },
              { id: 'map', label: 'Map Settings', icon: Map },
              { id: 'alerts', label: 'Alert Preferences', icon: Bell },
              { id: 'profile', label: 'User Profile', icon: User },
              { id: 'api', label: 'API Settings', icon: Key },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right Column: Settings Form */}
          <div className="lg:col-span-9 glass-panel p-6 rounded-xl border border-white/10 flex flex-col justify-between">
            {activeTab === 'general' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Application Mode
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Switch between pre-packaged historical demo data, high-fidelity real-time simulation, or live NASA FIRMS feeds.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'demo' as AppMode, title: 'Demo Data', desc: 'Curated historical dataset for offline demo' },
                      { id: 'simulation' as AppMode, title: 'Simulation', desc: 'Virtual clock replay with scenario injection' },
                      { id: 'live' as AppMode, title: 'Live Data', desc: 'Direct near-real-time NASA FIRMS & OSM' },
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => setMode(item.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          mode === item.id
                            ? 'bg-blue-600/20 border-blue-500 shadow-glow ring-1 ring-blue-500/40'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <input
                            type="radio"
                            name="appMode"
                            checked={mode === item.id}
                            onChange={() => setMode(item.id)}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="text-xs font-bold text-white">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 pl-5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Default Map View</label>
                    <select
                      value={defaultMapView}
                      onChange={(e) => setDefaultMapView(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="India" className="bg-[#0B1320]">India Extent</option>
                      <option value="Western" className="bg-[#0B1320]">Western Corridor (Gujarat/Maharashtra)</option>
                      <option value="Eastern" className="bg-[#0B1320]">Eastern Industrial (Odisha/WB)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Default Time Range</label>
                    <select
                      value={defaultTimeRange}
                      onChange={(e) => setDefaultTimeRange(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Last 24 Hours" className="bg-[#0B1320]">Last 24 Hours</option>
                      <option value="Last 7 Days" className="bg-[#0B1320]">Last 7 Days</option>
                      <option value="Last 30 Days" className="bg-[#0B1320]">Last 30 Days</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Auto Refresh Data</h4>
                      <p className="text-[11px] text-slate-400">Refresh data automatically every 5 minutes or on SSE push</p>
                    </div>
                    <div 
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${autoRefresh ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Show Facility Layer</h4>
                      <p className="text-[11px] text-slate-400">Display verified industrial refineries, chemical plants & steel mills</p>
                    </div>
                    <div 
                      onClick={() => setShowFacilityLayer(!showFacilityLayer)}
                      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${showFacilityLayer ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showFacilityLayer ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Enable Notifications</h4>
                      <p className="text-[11px] text-slate-400">Trigger high-priority audio & toast alerts on Critical industrial fires</p>
                    </div>
                    <div 
                      onClick={() => setEnableNotifications(!enableNotifications)}
                      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${enableNotifications ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enableNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-white">Geospatial & Vector Tile Settings</h3>
                <p className="text-slate-400">Configure map tile providers, EPSG projection targets, and layer buffering distance.</p>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Metric Calculation CRS</span>
                    <span className="font-mono text-blue-400">EPSG:7755 (India NSF LCC)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Default Clustering Radius</span>
                    <span className="font-mono text-blue-400">750 meters (~2 VIIRS pixels)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Facility Proximity Buffer</span>
                    <span className="font-mono text-blue-400">1,000 meters</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-4 text-xs max-w-xl">
                <h3 className="text-sm font-bold text-white">NASA FIRMS & Copernicus Credentials</h3>
                <div>
                  <label className="text-slate-400 block mb-1">NASA FIRMS MAP_KEY</label>
                  <input
                    type="password"
                    defaultValue="••••••••••••••••••••••••••••••••"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Free transaction key from firms.modaps.eosdis.nasa.gov</span>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/10 mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all flex items-center space-x-2"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settings Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
