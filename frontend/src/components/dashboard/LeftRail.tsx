import React from 'react';
import { 
  Layers, 
  Flame, 
  Building2, 
  MapPin, 
  Satellite, 
  Wind, 
  Shield, 
  Filter, 
  Calendar, 
  ChevronDown, 
  Trees, 
  Wheat, 
  Pickaxe, 
  HelpCircle,
  Search,
  RotateCcw
} from 'lucide-react';
import { FilterState, EventClass, RiskLevel } from '../../types';

interface LeftRailProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  layers: Record<string, boolean>;
  onLayerToggle: (layerKey: string) => void;
}

export const LeftRail: React.FC<LeftRailProps> = ({
  filters,
  onFilterChange,
  layers,
  onLayerToggle,
}) => {
  const layerList = [
    { key: 'firms', label: 'FIRMS Hotspots', icon: Flame, color: 'text-emerald-400' },
    { key: 'classified', label: 'Classified Events', icon: Shield, color: 'text-blue-400' },
    { key: 'facilities', label: 'Industrial Facilities', icon: Building2, color: 'text-purple-400' },
    { key: 'osm', label: 'OpenStreetMap', icon: MapPin, color: 'text-amber-400' },
    { key: 'sentinel2', label: 'Sentinel-2 Imagery', icon: Satellite, color: 'text-cyan-400' },
    { key: 'weather', label: 'Weather (Wind)', icon: Wind, color: 'text-slate-400' },
    { key: 'admin', label: 'Administrative Boundaries', icon: Layers, color: 'text-indigo-400' },
  ];

  const riskOptions: Array<{ level: RiskLevel; label: string; count: number; color: string }> = [
    { level: 'critical', label: 'Critical (≥ 90)', count: 12, color: 'bg-red-500' },
    { level: 'high', label: 'High (70 - 89)', count: 28, color: 'bg-orange-500' },
    { level: 'medium', label: 'Medium (40 - 69)', count: 41, color: 'bg-amber-400' },
    { level: 'low', label: 'Low (< 40)', count: 23, color: 'bg-cyan-400' },
  ];

  const classOptions: Array<{ key: EventClass; label: string; count: number; icon: any; color: string }> = [
    { key: 'industrial_fire', label: 'Industrial Fire', count: 312, icon: Flame, color: 'text-red-500' },
    { key: 'gas_flare_persistent', label: 'Gas Flare / Persistent', count: 156, icon: Flame, color: 'text-orange-400' },
    { key: 'wildfire_forest', label: 'Wildfire / Forest', count: 42, icon: Trees, color: 'text-emerald-400' },
    { key: 'agricultural_burning', label: 'Agricultural Burning', count: 31, icon: Wheat, color: 'text-amber-400' },
    { key: 'mining_activity', label: 'Mining Activity', count: 18, icon: Pickaxe, color: 'text-purple-400' },
    { key: 'other_thermal', label: 'Other / Unknown', count: 11, icon: HelpCircle, color: 'text-slate-400' },
  ];

  const handleRiskToggle = (level: RiskLevel) => {
    const current = filters.riskLevels;
    const next = current.includes(level)
      ? current.filter(r => r !== level)
      : [...current, level];
    onFilterChange({ ...filters, riskLevels: next });
  };

  const handleClassToggle = (cls: EventClass) => {
    const current = filters.eventClasses;
    const next = current.includes(cls)
      ? current.filter(c => c !== cls)
      : [...current, cls];
    onFilterChange({ ...filters, eventClasses: next });
  };

  const handleReset = () => {
    onFilterChange({
      timeRange: 'Last 7 Days',
      riskLevels: ['critical', 'high', 'medium', 'low'],
      eventClasses: ['industrial_fire', 'gas_flare_persistent', 'wildfire_forest', 'agricultural_burning', 'mining_activity', 'other_thermal'],
      facilityType: 'All',
      region: 'All India',
      searchQuery: '',
    });
  };

  return (
    <aside className="w-full xl:w-72 flex flex-col space-y-3 shrink-0">
      {/* 1. Data Layers Panel */}
      <div className="glass-panel p-3.5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-2.5">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Data Layers</h3>
          </div>
          <span className="text-[10px] text-slate-400">7 Overlays</span>
        </div>

        <div className="space-y-2">
          {layerList.map((item) => {
            const isChecked = layers[item.key] ?? false;
            return (
              <div 
                key={item.key}
                onClick={() => onLayerToggle(item.key)}
                className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <item.icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                  <span className="text-xs text-slate-300 truncate">{item.label}</span>
                </div>
                {/* Toggle switch */}
                <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${isChecked ? 'bg-blue-600' : 'bg-slate-700/60'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${isChecked ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Filters Panel */}
      <div className="glass-panel p-3.5 rounded-xl border border-white/10 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Filters</h3>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Time Range Select */}
          <div className="mb-3.5">
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Time Range</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <select
                value={filters.timeRange}
                onChange={(e) => onFilterChange({ ...filters, timeRange: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="Last 24 Hours" className="bg-[#0B1320]">Last 24 Hours</option>
                <option value="Last 3 Days" className="bg-[#0B1320]">Last 3 Days</option>
                <option value="Last 7 Days" className="bg-[#0B1320]">Last 7 Days</option>
                <option value="Last 30 Days" className="bg-[#0B1320]">Last 30 Days</option>
                <option value="Custom Range" className="bg-[#0B1320]">Custom Range</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Risk Level Filter */}
          <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-medium text-slate-400">Risk Level</label>
              <span className="text-[10px] text-slate-500">Counts</span>
            </div>
            <div className="space-y-1.5">
              {riskOptions.map((risk) => {
                const checked = filters.riskLevels.includes(risk.level);
                return (
                  <label
                    key={risk.level}
                    className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/[0.02] cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleRiskToggle(risk.level)}
                        className="rounded bg-slate-800 border-white/20 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className={`w-2 h-2 rounded-full ${risk.color}`} />
                      <span className="text-xs text-slate-300">{risk.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums">{risk.count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Event Classification Filter */}
          <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-medium text-slate-400">Event Classification</label>
              <span className="text-[10px] text-slate-500">Counts</span>
            </div>
            <div className="space-y-1.5">
              {classOptions.map((item) => {
                const checked = filters.eventClasses.includes(item.key);
                return (
                  <label
                    key={item.key}
                    className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/[0.02] cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleClassToggle(item.key)}
                        className="rounded bg-slate-800 border-white/20 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-xs text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums">{item.count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Region / State Select */}
          <div className="mb-3.5">
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Region / State</label>
            <div className="relative">
              <select
                value={filters.region}
                onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="All India" className="bg-[#0B1320]">All India</option>
                <option value="Gujarat" className="bg-[#0B1320]">Gujarat</option>
                <option value="Assam" className="bg-[#0B1320]">Assam</option>
                <option value="Odisha" className="bg-[#0B1320]">Odisha</option>
                <option value="West Bengal" className="bg-[#0B1320]">West Bengal</option>
                <option value="Maharashtra" className="bg-[#0B1320]">Maharashtra</option>
                <option value="Chhattisgarh" className="bg-[#0B1320]">Chhattisgarh</option>
                <option value="Punjab" className="bg-[#0B1320]">Punjab</option>
                <option value="Karnataka" className="bg-[#0B1320]">Karnataka</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search Location Input */}
        <div className="pt-2 border-t border-white/5">
          <label className="text-[11px] font-medium text-slate-400 mb-1 block">Search Location</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search facility, city, or coords..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
