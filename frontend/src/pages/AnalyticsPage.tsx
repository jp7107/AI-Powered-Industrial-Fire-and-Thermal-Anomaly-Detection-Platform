import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { KpiRow } from '../components/dashboard/KpiRow';
import { api } from '../lib/api';
import { KpiCardData, StatusResponse } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { Filter, Calendar, ChevronDown, BarChart3, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [kpis, setKpis] = useState<KpiCardData[]>([]);
  const [donutData, setDonutData] = useState<any[]>([]);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [topStates, setTopStates] = useState<any[]>([]);
  const [riskDist, setRiskDist] = useState<any[]>([]);

  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [groupBy, setGroupBy] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All India');

  useEffect(() => {
    const load = async () => {
      const [sRes, kRes, dRes, tRes, statesRes, riskRes] = await Promise.all([
        api.getStatus(),
        api.getKpis(),
        api.getClassificationDistribution(),
        api.getTimeseries(),
        api.getTopStates(),
        api.getRiskDistribution(),
      ]);
      setStatus(sRes);
      setKpis(kRes);
      setDonutData(dRes);
      setTimeseries(tRes);
      setTopStates(statesRes);
      setRiskDist(riskRes);
    };
    load();
  }, []);

  if (!status) return null;

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans">
      <AppHeader status={status} />

      <main className="p-3.5 max-w-[1920px] mx-auto w-full flex-1 flex flex-col space-y-3">
        {/* KPI Row */}
        <KpiRow kpis={kpis} />

        <div className="flex flex-col xl:flex-row gap-3 flex-1">
          {/* Left Analytics Filters */}
          <aside className="w-full xl:w-72 glass-panel p-4 rounded-xl border border-white/10 flex flex-col space-y-4 shrink-0">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
              <Filter className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Filters</h3>
            </div>

            {/* Time Range */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Time Range</label>
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="Last 7 Days" className="bg-[#0B1320]">Last 7 Days</option>
                  <option value="Last 30 Days" className="bg-[#0B1320]">Last 30 Days</option>
                  <option value="Last 90 Days" className="bg-[#0B1320]">Last 90 Days</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Group By Radio */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Group By</label>
              <div className="space-y-1.5">
                {(['Daily', 'Weekly', 'Monthly'] as const).map((opt) => (
                  <label key={opt} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="groupBy"
                      checked={groupBy === opt}
                      onChange={() => setGroupBy(opt)}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Metric Checkboxes */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Metric</label>
              <div className="space-y-1.5 text-xs text-slate-300">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0" />
                  <span>Event Count</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0" />
                  <span>Avg. Risk Score</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-0" />
                  <span>Hotspot Count</span>
                </label>
              </div>
            </div>

            {/* Classification Select */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Classification</label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="All" className="bg-[#0B1320]">All</option>
                  <option value="industrial_fire" className="bg-[#0B1320]">Industrial Fire</option>
                  <option value="gas_flare_persistent" className="bg-[#0B1320]">Gas Flare</option>
                  <option value="wildfire_forest" className="bg-[#0B1320]">Wildfire</option>
                  <option value="agricultural_burning" className="bg-[#0B1320]">Agricultural Burning</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Region Select */}
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
                  <option value="Odisha" className="bg-[#0B1320]">Odisha</option>
                  <option value="Assam" className="bg-[#0B1320]">Assam</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </aside>

          {/* 4 Analytics Charts 2x2 Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Chart 1: Events Trend */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Events Trend</h4>
                <span className="text-[11px] text-slate-400">Daily breakdown</span>
              </div>
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeseries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1320', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Line type="monotone" dataKey="Industrial" stroke="#FF3B47" strokeWidth={2} />
                    <Line type="monotone" dataKey="Flare" stroke="#FF8A1F" strokeWidth={2} />
                    <Line type="monotone" dataKey="Wildfire" stroke="#22C55E" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="Agri" stroke="#F5B82E" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Events by Classification */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Events by Classification</h4>
                <span className="text-[11px] text-slate-400">1,284 Total Events</span>
              </div>
              <div className="flex items-center justify-between h-52">
                <div className="w-48 h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {donutData.map((entry) => (
                          <Cell key={entry.key} fill={entry.color} stroke="#050A12" strokeWidth={2} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-bold text-white">1,284</span>
                    <span className="text-[9px] text-slate-400">Total Events</span>
                  </div>
                </div>

                <div className="flex-1 pl-4 space-y-1 text-xs">
                  {donutData.map((item) => (
                    <div key={item.key} className="flex justify-between items-center py-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 text-[11px] truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <span className="text-white font-semibold tabular-nums text-[11px]">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 3: Risk Score Distribution */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Risk Score Distribution</h4>
                <span className="text-[11px] text-slate-400">0 - 100 Range</span>
              </div>
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDist} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1320', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Bar dataKey="count" fill="#2F7BFF" radius={[4, 4, 0, 0]}>
                      {riskDist.map((entry, idx) => (
                        <Cell key={`bar-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Top States by Events */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top States by Events</h4>
                <span className="text-[11px] text-slate-400">Ranked by volume</span>
              </div>
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStates} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="state" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={75} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B1320', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Bar dataKey="count" fill="#2F7BFF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
