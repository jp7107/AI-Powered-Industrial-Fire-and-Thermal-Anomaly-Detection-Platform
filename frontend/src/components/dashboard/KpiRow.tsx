import React from 'react';
import { 
  Flame, 
  Building2, 
  Trees, 
  Wheat, 
  AlertOctagon, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react';
import { KpiCardData } from '../../types';

interface KpiRowProps {
  kpis: KpiCardData[];
  selectedKey?: string;
  onSelectKpi?: (key: string) => void;
}

export const KpiRow: React.FC<KpiRowProps> = ({ 
  kpis, 
  selectedKey = 'industrial_events',
  onSelectKpi 
}) => {
  const getIcon = (key: string) => {
    switch (key) {
      case 'total_hotspots':
        return <Flame className="w-5 h-5 text-red-500 fill-red-500/20" />;
      case 'industrial_events':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'persistent_sources':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'forest_wildfire':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'agricultural_burning':
        return <Wheat className="w-5 h-5 text-amber-400" />;
      case 'high_risk_events':
        return <AlertOctagon className="w-5 h-5 text-red-500 fill-red-500/20" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 w-full">
      {kpis.map((kpi) => {
        const isSelected = selectedKey === kpi.key;
        const isPositive = kpi.delta_pct >= 0;

        // Custom borders and card accents based on reference
        let cardStyle = "border-white/10 hover:border-white/20 bg-[#0B1320]/80";
        if (isSelected) {
          cardStyle = "border-blue-500/80 bg-blue-950/20 shadow-glow ring-1 ring-blue-500/40";
        } else if (kpi.key === 'high_risk_events') {
          cardStyle = "border-red-600/70 bg-red-950/20 hover:border-red-500 shadow-glowRed";
        }

        return (
          <div
            key={kpi.key}
            onClick={() => onSelectKpi && onSelectKpi(kpi.key)}
            className={`glass-panel p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${cardStyle}`}
          >
            {/* Top row: Icon + Label */}
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/5 group-hover:scale-105 transition-transform">
                {getIcon(kpi.key)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-semibold text-slate-300 truncate">
                  {kpi.label}
                </h4>
                <p className="text-[10px] text-slate-500 truncate">
                  {kpi.subtitle}
                </p>
              </div>
            </div>

            {/* Middle row: Big metric value */}
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                {kpi.value.toLocaleString()}
              </span>

              {/* Sparkline mini visual */}
              <div className="w-16 h-7 opacity-80 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 60 25">
                  <path
                    d={`M 0 ${25 - (kpi.sparkline[0]?.v || 10) / 4} ` +
                      kpi.sparkline.map((pt, idx) => `L ${(idx / (kpi.sparkline.length - 1)) * 60} ${Math.max(2, 25 - (pt.v / 4))}`).join(' ')}
                    fill="none"
                    stroke={kpi.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`M 0 ${25 - (kpi.sparkline[0]?.v || 10) / 4} ` +
                      kpi.sparkline.map((pt, idx) => `L ${(idx / (kpi.sparkline.length - 1)) * 60} ${Math.max(2, 25 - (pt.v / 4))}`).join(' ') +
                      ` L 60 25 L 0 25 Z`}
                    fill={`${kpi.color}15`}
                  />
                </svg>
              </div>
            </div>

            {/* Bottom row: Delta trend */}
            <div className="mt-1 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">vs. Prev. 7d</span>
              <div className={`flex items-center space-x-1 font-semibold ${
                kpi.key === 'persistent_sources' 
                  ? 'text-amber-400' 
                  : isPositive 
                    ? 'text-emerald-400' 
                    : 'text-rose-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {isPositive ? '▲' : '▼'} {Math.abs(kpi.delta_pct)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
