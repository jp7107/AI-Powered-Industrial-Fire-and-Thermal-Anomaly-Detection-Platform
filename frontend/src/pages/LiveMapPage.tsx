import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { GisMap } from '../components/dashboard/GisMap';
import { EventIntelligencePanel } from '../components/dashboard/EventIntelligencePanel';
import { api } from '../lib/api';
import { EventDetail, Facility, StatusResponse } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Sliders, 
  Eye, 
  EyeOff, 
  Clock, 
  Sparkles,
  Flame
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-1042');
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrubberTime, setScrubberTime] = useState(100);
  const [simSpeed, setSimSpeed] = useState('60x');

  const [layers, setLayers] = useState<Record<string, boolean>>({
    firms: true,
    classified: true,
    facilities: true,
    osm: true,
    sentinel2: true,
    weather: false,
    admin: true,
  });

  const [opacity, setOpacity] = useState<Record<string, number>>({
    firms: 100,
    classified: 100,
    facilities: 90,
    sentinel2: 75,
    weather: 60,
  });

  useEffect(() => {
    const load = async () => {
      const [sRes, eRes, fRes] = await Promise.all([
        api.getStatus(),
        api.getEvents(),
        api.getFacilities(),
      ]);
      setStatus(sRes);
      setEvents(eRes.items);
      setFacilities(fRes.items);
      if (eRes.items.length > 0) {
        setSelectedEvent(eRes.items[0]);
      }
    };
    load();
  }, []);

  const handleSelectEvent = (event: EventDetail) => {
    setSelectedEventId(event.id);
    setSelectedEvent(event);
  };

  // Playback timer effect
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setScrubberTime(prev => (prev >= 100 ? 0 : prev + 2));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!status) return null;

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans overflow-hidden">
      <AppHeader status={status} />

      <main className="p-3 max-w-[1920px] mx-auto w-full flex-1 flex flex-col xl:flex-row gap-3 relative">
        {/* Left Layers and Opacity Sliders Panel */}
        <aside className="w-full xl:w-80 glass-panel p-4 rounded-2xl border border-white/10 flex flex-col space-y-4 shrink-0 max-h-[calc(100vh-160px)] overflow-y-auto">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Map Layers & Opacity</h3>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { id: 'firms', label: 'FIRMS Hotspots', color: 'text-emerald-400' },
              { id: 'classified', label: 'Classified Events', color: 'text-blue-400' },
              { id: 'facilities', label: 'Industrial Facilities', color: 'text-purple-400' },
              { id: 'osm', label: 'OpenStreetMap', color: 'text-amber-400' },
              { id: 'sentinel2', label: 'Sentinel-2 Imagery', color: 'text-cyan-400' },
              { id: 'weather', label: 'Weather (Wind)', color: 'text-slate-400' },
              { id: 'admin', label: 'Administrative Boundaries', color: 'text-indigo-400' },
            ].map(layer => (
              <div key={layer.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${layer.color}`}>{layer.label}</span>
                  <button
                    onClick={() => setLayers(prev => ({ ...prev, [layer.id]: !prev[layer.id] }))}
                    className="text-slate-400 hover:text-white"
                  >
                    {layers[layer.id] ? <Eye className="w-4 h-4 text-blue-400" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {opacity[layer.id] !== undefined && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity[layer.id]}
                      onChange={(e) => setOpacity({ ...opacity, [layer.id]: Number(e.target.value) })}
                      className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 w-8 tabular-nums">{opacity[layer.id]}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Center Canvas Area with GIS Map and Scrubber Bar */}
        <div className="flex-1 flex flex-col space-y-3 min-w-0 h-[calc(100vh-160px)]">
          <div className="flex-1 relative rounded-2xl overflow-hidden glass-panel border border-white/10">
            <GisMap
              events={events}
              facilities={facilities}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
              layers={layers}
            />

            {/* Floating Slide-over Intelligence Drawer if selected */}
            {selectedEvent && (
              <div className="absolute top-4 right-4 z-30 w-80 max-h-[calc(100%-80px)] overflow-y-auto">
                <EventIntelligencePanel
                  event={selectedEvent}
                  onClose={() => setSelectedEvent(null)}
                />
              </div>
            )}
          </div>

          {/* TimeControlBar (bottom glass scrubber) */}
          <div className="glass-panel p-3 rounded-xl border border-white/10 flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-glow transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setScrubberTime(0)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-300 flex items-center justify-center transition-all"
                title="Reset Replay"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress Slider */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Sep 22, 00:00 UTC</span>
                <span className="font-semibold text-blue-400">
                  Replay Progress: {scrubberTime}%
                </span>
                <span>Sep 28, 23:59 UTC</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scrubberTime}
                onChange={(e) => setScrubberTime(Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Speed Selector */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Speed:</span>
              <select
                value={simSpeed}
                onChange={(e) => setSimSpeed(e.target.value)}
                className="bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-white cursor-pointer focus:outline-none"
              >
                <option value="1x" className="bg-[#0B1320]">1×</option>
                <option value="60x" className="bg-[#0B1320]">60×</option>
                <option value="300x" className="bg-[#0B1320]">300×</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
