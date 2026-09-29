import React, { useState } from 'react';
import { 
  Flame, 
  MapPin, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Bell, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  ExternalLink,
  Layers,
  Activity,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { EventDetail } from '../../types';

interface EventIntelligencePanelProps {
  event: EventDetail | null;
  onClose?: () => void;
  onPrevEvent?: () => void;
  onNextEvent?: () => void;
}

export const EventIntelligencePanel: React.FC<EventIntelligencePanelProps> = ({
  event,
  onClose,
  onPrevEvent,
  onNextEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'imagery' | 'timeline' | 'facilities'>('overview');
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  if (!event) {
    return (
      <aside className="w-full xl:w-96 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center text-slate-400">
        <Activity className="w-10 h-10 text-slate-500 mb-3 animate-pulse" />
        <h4 className="text-white font-semibold text-sm mb-1">No Event Selected</h4>
        <p className="text-xs">Click on any thermal anomaly on the map to inspect intelligence.</p>
      </aside>
    );
  }

  // Get classification label & color
  let classColor = '#FF3B47';
  let classLabel = 'Industrial Fire';
  if (event.event_class === 'gas_flare_persistent') {
    classColor = '#FF8A1F';
    classLabel = 'Gas Flare / Persistent';
  } else if (event.event_class === 'wildfire_forest') {
    classColor = '#22C55E';
    classLabel = 'Wildfire / Forest';
  } else if (event.event_class === 'agricultural_burning') {
    classColor = '#F5B82E';
    classLabel = 'Agricultural Burning';
  } else if (event.event_class === 'mining_activity') {
    classColor = '#A855F7';
    classLabel = 'Mining Activity';
  } else if (event.event_class === 'other_thermal') {
    classColor = '#B8C0CC';
    classLabel = 'Other / Unknown';
  }

  return (
    <aside className="w-full xl:w-[390px] glass-panel rounded-2xl border border-white/10 flex flex-col shrink-0 overflow-hidden shadow-2xl">
      {/* 1. Header with prev/next/close */}
      <div className="p-4 border-b border-white/10 bg-[#0B1320]/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
              <Flame className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base tracking-tight">Event #{event.numeric_id}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  event.risk_level === 'critical'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                }`}>
                  {event.risk_level.toUpperCase()} RISK
                </span>
              </div>
            </div>
          </div>

          {/* Controls: prev, next, close */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onPrevEvent}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Previous Event"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextEvent}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Next Event"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-1"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Location subline */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">{event.place_name}</span>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center space-x-1 p-2 border-b border-white/5 bg-white/[0.02]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('imagery')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'imagery'
              ? 'bg-blue-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Imagery
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Time Series
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'facilities'
              ? 'bg-blue-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Nearby Facilities
        </button>
      </div>

      {/* 3. Tab Body - Scrollable */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] xl:max-h-[500px]">
        {activeTab === 'overview' && (
          <>
            {/* Dual Images: Sentinel-2 & VIIRS Thermal Footprint */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative rounded-xl overflow-hidden border border-white/15 h-28 group bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=400&q=80"
                  alt="Sentinel-2"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[10px] font-bold text-white block">Sentinel-2</span>
                  <span className="text-[9px] text-slate-300">Sep 26, 2026 · 4% cloud</span>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-white/15 h-28 group bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
                  alt="VIIRS FIRMS"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[10px] font-bold text-amber-400 block">VIIRS (FIRMS)</span>
                  <span className="text-[9px] text-slate-300">Thermal Footprint</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2.5 pt-1 text-xs">
              {/* Classification */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Classification</span>
                <div className="flex items-center space-x-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: classColor }} />
                  <span style={{ color: classColor }}>{classLabel}</span>
                </div>
              </div>

              {/* Classification Confidence */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <div className="flex items-center space-x-1 text-slate-400">
                  <span>Classification Confidence</span>
                  <Info className="w-3 h-3 text-slate-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white tabular-nums text-sm">{event.class_confidence}%</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    FIRMS: {event.detection_confidence}
                  </span>
                </div>
              </div>

              {/* Risk Score */}
              <div className="py-1.5 border-b border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400">Risk Score</span>
                  <span className="font-bold text-red-400 tabular-nums">{event.risk_score} / 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-full transition-all"
                    style={{ width: `${event.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Brightness Temperature */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Brightness Temperature</span>
                </div>
                <span className="font-bold text-white tabular-nums">
                  {event.max_brightness_k} K <span className="text-[10px] text-slate-400 font-normal">({event.sensor || 'VIIRS I4'})</span>
                </span>
              </div>

              {/* Detection Time */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Detection Time (UTC)</span>
                </div>
                <span className="text-slate-200 tabular-nums">
                  {new Date(event.first_detected_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC'
                  })}
                </span>
              </div>

              {/* Alert Generated */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Bell className="w-3.5 h-3.5 text-red-400" />
                  <span>Alert Generated</span>
                </div>
                <span className="text-slate-200 tabular-nums">
                  {new Date(event.last_detected_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC'
                  })}
                </span>
              </div>

              {/* Nearest Facility */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Nearest Facility</span>
                <span className="text-slate-200 font-medium">
                  {event.nearest_facility.name} ({event.nearest_facility.distance_m} m)
                </span>
              </div>

              {/* Persistence */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Persistence</span>
                <span className="text-slate-200 tabular-nums">
                  {event.persistence_days} days ({event.detection_count} detections)
                </span>
              </div>

              {/* Affected Area */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Affected Area (est.)</span>
                <span className="text-slate-200 tabular-nums">{event.affected_area_km2} km²</span>
              </div>

              {/* Nearby Population */}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Nearby Population</span>
                <span className="text-slate-200 tabular-nums">{event.population_5km.toLocaleString()} (within 5 km)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => setIsAcknowledged(true)}
                className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                  isAcknowledged
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-glow'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Alert'}</span>
              </button>
              <button className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {activeTab === 'imagery' && (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-white/15">
              <img
                src="https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=600&q=80"
                alt="True Color"
                className="w-full h-40 object-cover"
              />
              <div className="p-2.5 bg-black/40 text-xs">
                <h5 className="font-semibold text-white">Sentinel-2 True Color (RGB B4-B3-B2)</h5>
                <p className="text-slate-400 text-[11px]">Acquired Sep 26, 2026 · Cloud cover 4.8%</p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/15">
              <img
                src="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80"
                alt="SWIR False Color"
                className="w-full h-40 object-cover"
              />
              <div className="p-2.5 bg-black/40 text-xs">
                <h5 className="font-semibold text-amber-400">Sentinel-2 SWIR Anomaly (B12-B11-B8A)</h5>
                <p className="text-slate-400 text-[11px]">Highlights active combustion and extreme thermal sources</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-3">
            {event.timeline.map((item) => (
              <div key={item.id} className="relative pl-5 pb-3 border-l border-white/10 last:pb-0">
                <span className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#050A12]" />
                <div className="text-[10px] text-slate-400 font-mono">
                  {new Date(item.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} UTC
                </div>
                <h5 className="text-xs font-semibold text-white mt-0.5">{item.title}</h5>
                <p className="text-[11px] text-slate-300 mt-0.5">{item.description}</p>
                {item.frp_mw && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[10px]">
                    FRP: {item.frp_mw} MW
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="space-y-3">
            <div className="glass-panel p-3 rounded-xl border border-white/10">
              <h5 className="font-bold text-white text-xs mb-1">{event.nearest_facility.name}</h5>
              <p className="text-[11px] text-slate-400 mb-2">Distance from anomaly: {event.nearest_facility.distance_m} m</p>
              <div className="text-[11px] space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Facility Type:</span>
                  <span className="font-semibold text-blue-400">{event.nearest_facility.type}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Hazard Tier:</span>
                  <span className="font-semibold text-red-400">Tier 1 (High Criticality)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
