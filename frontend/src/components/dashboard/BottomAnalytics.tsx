import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  ChevronRight, 
  Flame, 
  AlertTriangle, 
  Clock, 
  Building2,
  Calendar
} from 'lucide-react';
import { AlertItem } from '../../types';
import { Link } from 'react-router-dom';

interface BottomAnalyticsProps {
  classificationData: Array<{ key: string; name: string; count: number; pct: number; color: string }>;
  timeseriesData: Array<any>;
  recentAlerts: AlertItem[];
  onSelectEventId?: (eventId: string) => void;
}

export const BottomAnalytics: React.FC<BottomAnalyticsProps> = ({
  classificationData,
  timeseriesData,
  recentAlerts,
  onSelectEventId,
}) => {
  const [timelineInterval, setTimelineInterval] = useState('Daily');

  const totalEvents = classificationData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full">
      {/* 1. Events by Classification Donut Card (approx 3.5 cols) */}
      <div className="lg:col-span-4 xl:col-span-4 glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
          Events by Classification
        </h4>

        <div className="flex items-center justify-between">
          {/* Donut chart */}
          <div className="relative w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classificationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {classificationData.map((entry) => (
                    <Cell key={`cell-${entry.key}`} fill={entry.color} stroke="#050A12" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-base font-bold text-white tabular-nums tracking-tight">
                {totalEvents.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">Total Events</span>
            </div>
          </div>

          {/* Legend rows */}
          <div className="flex-1 pl-3 space-y-1 text-[11px]">
            {classificationData.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-0.5">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 truncate max-w-[110px]">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0 tabular-nums">
                  <span className="text-slate-400 text-[10px]">{item.pct}%</span>
                  <span className="text-white font-semibold">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Events Timeline Multi-line Card (approx 4.5 cols) */}
      <div className="lg:col-span-4 xl:col-span-4 glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Events Timeline
          </h4>
          <div className="relative">
            <select
              value={timelineInterval}
              onChange={(e) => setTimelineInterval(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 appearance-none pr-6 cursor-pointer focus:outline-none"
            >
              <option value="Daily" className="bg-[#0B1320]">Daily</option>
              <option value="Hourly" className="bg-[#0B1320]">Hourly</option>
            </select>
          </div>
        </div>

        {/* Legend dots */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-[10px] text-slate-300">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#FF3B47]" />
            <span>Industrial</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#FF8A1F]" />
            <span>Flare</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>Wildfire</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#F5B82E]" />
            <span>Agri</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
            <span>Mining</span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="w-full h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeseriesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 200]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(11, 19, 32, 0.95)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px', 
                  fontSize: '11px' 
                }} 
              />
              <Line type="monotone" dataKey="Industrial" stroke="#FF3B47" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Flare" stroke="#FF8A1F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Wildfire" stroke="#22C55E" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Agri" stroke="#F5B82E" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Mining" stroke="#A855F7" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Recent Alerts Card (approx 4 cols) */}
      <div className="lg:col-span-4 xl:col-span-4 glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Recent Alerts
          </h4>
          <Link
            to="/alerts"
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Alert items list */}
        <div className="space-y-2 overflow-y-auto max-h-36 pr-1">
          {recentAlerts.slice(0, 4).map((alert, idx) => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                onClick={() => onSelectEventId && onSelectEventId(alert.event_id)}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 cursor-pointer transition-all group"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isCritical 
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    <Flame className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                      {alert.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">
                      {alert.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400">
                    {idx === 0 ? '2 min ago' : idx === 1 ? '14 min ago' : idx === 2 ? '1 hour ago' : '2 hours ago'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
