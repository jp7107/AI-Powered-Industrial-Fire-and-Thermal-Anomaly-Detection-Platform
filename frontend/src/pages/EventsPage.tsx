import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { KpiRow } from '../components/dashboard/KpiRow';
import { LeftRail } from '../components/dashboard/LeftRail';
import { api } from '../lib/api';
import { EventDetail, KpiCardData, StatusResponse, FilterState } from '../types';
import { 
  Download, 
  Search, 
  SlidersHorizontal, 
  ExternalLink, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [kpis, setKpis] = useState<KpiCardData[]>([]);
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'risk_desc' | 'frp_desc'>('newest');

  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'Last 7 Days',
    riskLevels: ['critical', 'high', 'medium', 'low'],
    eventClasses: ['industrial_fire', 'gas_flare_persistent', 'wildfire_forest', 'agricultural_burning', 'mining_activity', 'other_thermal'],
    facilityType: 'All',
    region: 'All India',
    searchQuery: '',
  });

  const [layers, setLayers] = useState<Record<string, boolean>>({
    firms: true,
    classified: true,
    facilities: true,
    osm: true,
    sentinel2: false,
    weather: false,
    admin: false,
  });

  useEffect(() => {
    const load = async () => {
      const [sRes, kRes, eRes] = await Promise.all([
        api.getStatus(),
        api.getKpis(filters),
        api.getEvents(filters),
      ]);
      setStatus(sRes);
      setKpis(kRes);
      setEvents(eRes.items);
    };
    load();
  }, [filters]);

  const getClassColor = (cls: string) => {
    switch (cls) {
      case 'industrial_fire': return '#FF3B47';
      case 'gas_flare_persistent': return '#FF8A1F';
      case 'wildfire_forest': return '#22C55E';
      case 'agricultural_burning': return '#F5B82E';
      case 'mining_activity': return '#A855F7';
      default: return '#B8C0CC';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500 font-bold';
    if (score >= 60) return 'text-orange-400 font-bold';
    if (score >= 40) return 'text-amber-400 font-semibold';
    return 'text-cyan-400';
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'risk_desc') return b.risk_score - a.risk_score;
    if (sortBy === 'frp_desc') return b.peak_frp_mw - a.peak_frp_mw;
    return new Date(b.first_detected_at).getTime() - new Date(a.first_detected_at).getTime();
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  const pagedEvents = sortedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    const json = JSON.stringify(sortedEvents, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thermowatch-events-${Date.now()}.json`;
    a.click();
  };

  if (!status) return null;

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans">
      <AppHeader status={status} />

      <main className="p-3.5 max-w-[1920px] mx-auto w-full flex-1 flex flex-col space-y-3">
        {/* Compact KPI Row */}
        <KpiRow kpis={kpis} />

        {/* Content split: Left Filters + Center Table */}
        <div className="flex flex-col xl:flex-row gap-3 flex-1">
          <LeftRail
            filters={filters}
            onFilterChange={setFilters}
            layers={layers}
            onLayerToggle={(k) => setLayers(prev => ({ ...prev, [k]: !prev[k] }))}
          />

          {/* Center Table Container */}
          <div className="flex-1 glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-white/5 gap-2.5">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-sm">Events ({events.length})</h3>
                  <span className="text-xs text-slate-400">Faceted & Filtered</span>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {/* Search box */}
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Sort dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer focus:outline-none"
                  >
                    <option value="newest" className="bg-[#0B1320]">Sort: Newest</option>
                    <option value="risk_desc" className="bg-[#0B1320]">Sort: Risk (High to Low)</option>
                    <option value="frp_desc" className="bg-[#0B1320]">Sort: FRP (Peak MW)</option>
                  </select>

                  {/* Export Button */}
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/5 text-[11px]">
                      <th className="py-2.5 px-3 font-medium">#</th>
                      <th className="py-2.5 px-3 font-medium">Time (UTC)</th>
                      <th className="py-2.5 px-3 font-medium">Location</th>
                      <th className="py-2.5 px-3 font-medium">Classification</th>
                      <th className="py-2.5 px-3 font-medium">Risk Score</th>
                      <th className="py-2.5 px-3 font-medium">Confidence</th>
                      <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {pagedEvents.map((evt) => {
                      const dotColor = getClassColor(evt.event_class);
                      return (
                        <tr
                          key={evt.id}
                          onClick={() => navigate(`/?sel=${evt.id}`)}
                          className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 font-mono font-medium text-slate-300">
                            {evt.numeric_id}
                          </td>
                          <td className="py-3 px-3 text-slate-400 tabular-nums whitespace-nowrap">
                            {new Date(evt.first_detected_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'UTC'
                            })}
                          </td>
                          <td className="py-3 px-3 font-medium text-white max-w-[240px] truncate">
                            {evt.place_name}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                              <span className="text-slate-200 capitalize">
                                {evt.event_class.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </td>
                          <td className={`py-3 px-3 tabular-nums ${getRiskColor(evt.risk_score)}`}>
                            {evt.risk_score}
                          </td>
                          <td className="py-3 px-3 text-slate-300 tabular-nums">
                            {evt.class_confidence}%
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2 text-slate-400">
                              <Link
                                to={`/?sel=${evt.id}`}
                                className="p-1 hover:text-blue-400 transition-colors"
                                title="View on Map"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                              </Link>
                              <Link
                                to={`/events/${evt.id}`}
                                className="p-1 hover:text-white transition-colors"
                                title="Full Details"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-xs text-slate-400">
              <span>Showing {pagedEvents.length} of {sortedEvents.length} events</span>
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
        </div>
      </main>
    </div>
  );
};
