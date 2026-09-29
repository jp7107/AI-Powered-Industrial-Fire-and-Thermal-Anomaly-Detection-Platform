import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { KpiRow } from '../components/dashboard/KpiRow';
import { api } from '../lib/api';
import { AlertItem, KpiCardData, StatusResponse, RiskLevel } from '../types';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Flame,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertsPage: React.FC = () => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [kpis, setKpis] = useState<KpiCardData[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['new', 'acknowledged', 'resolved']);
  const [selectedRisks, setSelectedRisks] = useState<RiskLevel[]>(['critical', 'high', 'medium', 'low']);
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      const [sRes, kRes, aRes] = await Promise.all([
        api.getStatus(),
        api.getKpis(),
        api.getAlerts(),
      ]);
      setStatus(sRes);
      setKpis(kRes);
      setAlerts(aRes.items);
    };
    load();
  }, []);

  const handleStatusToggle = (st: string) => {
    setSelectedStatus(prev => 
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

  const handleRiskToggle = (rk: RiskLevel) => {
    setSelectedRisks(prev =>
      prev.includes(rk) ? prev.filter(r => r !== rk) : [...prev, rk]
    );
  };

  const handleAcknowledge = async (id: string) => {
    await api.acknowledgeAlert(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
  };

  const filteredAlerts = alerts.filter(a => {
    const statusMatch = selectedStatus.includes(a.status);
    const riskMatch = selectedRisks.includes(a.severity);
    return statusMatch && riskMatch;
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paged = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!status) return null;

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans">
      <AppHeader status={status} unreadAlertsCount={alerts.filter(a => a.status === 'new').length} />

      <main className="p-3.5 max-w-[1920px] mx-auto w-full flex-1 flex flex-col space-y-3">
        {/* KPI Row */}
        <KpiRow kpis={kpis} />

        <div className="flex flex-col xl:flex-row gap-3 flex-1">
          {/* Left Filter Rail */}
          <aside className="w-full xl:w-72 glass-panel p-4 rounded-xl border border-white/10 flex flex-col space-y-4 shrink-0">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
              <Filter className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Filters</h3>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-2 block">Status</label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'new', label: 'New', color: 'text-amber-400' },
                  { id: 'acknowledged', label: 'Acknowledged', color: 'text-blue-400' },
                  { id: 'resolved', label: 'Resolved', color: 'text-emerald-400' },
                ].map(item => (
                  <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatus.includes(item.id)}
                      onChange={() => handleStatusToggle(item.id)}
                      className="rounded bg-slate-800 border-white/20 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className={item.color}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Risk Level Filter */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-2 block">Risk Level</label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'critical' as RiskLevel, label: 'Critical', color: 'text-red-500' },
                  { id: 'high' as RiskLevel, label: 'High', color: 'text-orange-400' },
                  { id: 'medium' as RiskLevel, label: 'Medium', color: 'text-amber-400' },
                  { id: 'low' as RiskLevel, label: 'Low', color: 'text-cyan-400' },
                ].map(item => (
                  <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRisks.includes(item.id)}
                      onChange={() => handleRiskToggle(item.id)}
                      className="rounded bg-slate-800 border-white/20 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className={item.color}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="Last 24 Hours" className="bg-[#0B1320]">Last 24 Hours</option>
                <option value="Last 7 Days" className="bg-[#0B1320]">Last 7 Days</option>
                <option value="Last 30 Days" className="bg-[#0B1320]">Last 30 Days</option>
              </select>
            </div>
          </aside>

          {/* Center Alerts Table */}
          <div className="flex-1 glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <h3 className="font-bold text-white text-sm">Alerts ({filteredAlerts.length})</h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/5 text-[11px]">
                      <th className="py-2.5 px-3 font-medium">Time (UTC)</th>
                      <th className="py-2.5 px-3 font-medium">Event #</th>
                      <th className="py-2.5 px-3 font-medium">Alert Type</th>
                      <th className="py-2.5 px-3 font-medium">Location</th>
                      <th className="py-2.5 px-3 font-medium text-center">Status</th>
                      <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {paged.map((alert) => (
                      <tr key={alert.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap tabular-nums">
                          {new Date(alert.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'UTC'
                          })}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-400">
                          #{alert.numeric_id}
                        </td>
                        <td className="py-3 px-3 font-medium text-white">
                          <div className="flex items-center space-x-1.5">
                            <Flame className={`w-3.5 h-3.5 ${alert.severity === 'critical' ? 'text-red-500' : 'text-orange-400'}`} />
                            <span>{alert.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {alert.subtitle}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            alert.status === 'new'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              : alert.status === 'acknowledged'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2 text-slate-400">
                            {alert.status === 'new' && (
                              <button
                                onClick={() => handleAcknowledge(alert.id)}
                                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-colors"
                              >
                                Acknowledge
                              </button>
                            )}
                            <Link
                              to={`/events/${alert.event_id}`}
                              className="p-1 hover:text-white transition-colors"
                              title="Open Event Detail"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4 text-xs text-slate-400">
              <span>Showing {paged.length} of {filteredAlerts.length} alerts</span>
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
