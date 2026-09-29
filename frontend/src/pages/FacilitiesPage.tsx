import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { api } from '../lib/api';
import { Facility, StatusResponse } from '../types';
import { 
  Building2, 
  Search, 
  ChevronDown, 
  ExternalLink, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Flame,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacilitiesPage: React.FC = () => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All India');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'Refinery', 'Petrochemical', 'Power Plant', 'Steel Plant', 'Cement Plant', 'Other'
  ]);
  const [currentPage, setCurrentPage] = useState(1);

  const typeOptions = [
    { label: 'Refinery', count: 24 },
    { label: 'Petrochemical', count: 16 },
    { label: 'Power Plant', count: 32 },
    { label: 'Steel Plant', count: 12 },
    { label: 'Cement Plant', count: 28 },
    { label: 'Other', count: 16 },
  ];

  useEffect(() => {
    const load = async () => {
      const [sRes, fRes] = await Promise.all([
        api.getStatus(),
        api.getFacilities(),
      ]);
      setStatus(sRes);
      setFacilities(fRes.items);
    };
    load();
  }, []);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filteredFacilities = facilities.filter(fac => {
    const matchesSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      fac.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All India' || fac.state === selectedRegion;
    const matchesType = selectedTypes.some(t => fac.type.toLowerCase().includes(t.toLowerCase()));
    return matchesSearch && matchesRegion && matchesType;
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const paged = filteredFacilities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!status) return null;

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans">
      <AppHeader status={status} />

      <main className="p-3.5 max-w-[1920px] mx-auto w-full flex-1 flex flex-col xl:flex-row gap-3">
        {/* Left Filter Rail */}
        <aside className="w-full xl:w-72 glass-panel p-4 rounded-xl border border-white/10 flex flex-col space-y-4 shrink-0">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Filters</h3>
          </div>

          {/* Search Facilities */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Search Facilities</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Region / State */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Region / State</label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="All India" className="bg-[#0B1320]">All India</option>
                <option value="Gujarat" className="bg-[#0B1320]">Gujarat</option>
                <option value="Assam" className="bg-[#0B1320]">Assam</option>
                <option value="Odisha" className="bg-[#0B1320]">Odisha</option>
                <option value="West Bengal" className="bg-[#0B1320]">West Bengal</option>
                <option value="Haryana" className="bg-[#0B1320]">Haryana</option>
                <option value="Bihar" className="bg-[#0B1320]">Bihar</option>
                <option value="Madhya Pradesh" className="bg-[#0B1320]">Madhya Pradesh</option>
                <option value="Jharkhand" className="bg-[#0B1320]">Jharkhand</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Facility Type Checkboxes */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-2 block">Facility Type</label>
            <div className="space-y-2">
              {typeOptions.map((type) => {
                const checked = selectedTypes.includes(type.label);
                return (
                  <label
                    key={type.label}
                    className="flex items-center justify-between py-1 px-1 rounded hover:bg-white/[0.02] cursor-pointer text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleTypeToggle(type.label)}
                        className="rounded bg-slate-800 border-white/20 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-slate-300">{type.label}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] tabular-nums">({type.count})</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center Table Container */}
        <div className="flex-1 glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">
                  Industrial Facilities ({filteredFacilities.length})
                </h3>
              </div>
            </div>

            {/* Facilities Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/5 text-[11px]">
                    <th className="py-2.5 px-3 font-medium">Name</th>
                    <th className="py-2.5 px-3 font-medium">Type</th>
                    <th className="py-2.5 px-3 font-medium">Location</th>
                    <th className="py-2.5 px-3 font-medium">State</th>
                    <th className="py-2.5 px-3 font-medium text-center">Nearby Events</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {paged.map((fac) => (
                    <tr key={fac.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {fac.name}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {fac.type}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {fac.location}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {fac.state}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 tabular-nums">
                          {fac.active_events}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/?q=${encodeURIComponent(fac.name)}`}
                          className="p-1 text-slate-400 hover:text-blue-400 transition-colors inline-block"
                          title="Locate on Map"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-xs text-slate-400">
            <span>Showing {paged.length} of {filteredFacilities.length} facilities</span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-white"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === pg
                      ? 'bg-blue-600 text-white font-bold'
                      : 'border border-white/10 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-white"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
