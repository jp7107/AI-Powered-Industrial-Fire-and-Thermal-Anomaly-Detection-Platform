import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { api } from '../lib/api';
import { EventDetail, StatusResponse } from '../types';
import { 
  ArrowLeft, 
  Flame, 
  MapPin, 
  Share2, 
  FilePlus2, 
  Maximize2, 
  Calendar, 
  Bell, 
  Thermometer, 
  ShieldCheck, 
  Building2, 
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'imagery' | 'timeseries' | 'facilities' | 'weather' | 'raw'>('overview');
  const [selectedGalleryThumb, setSelectedGalleryThumb] = useState<string>('s2_true');

  useEffect(() => {
    const load = async () => {
      const [sRes, eRes] = await Promise.all([
        api.getStatus(),
        api.getEventById(eventId || 'evt-1042'),
      ]);
      setStatus(sRes);
      setEvent(eRes);
    };
    load();
  }, [eventId]);

  if (!status || !event) {
    return (
      <div className="min-h-screen bg-[#050A12] flex items-center justify-center text-slate-400">
        Loading event details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans">
      <AppHeader status={status} />

      <main className="p-4 max-w-[1920px] mx-auto w-full flex-1 flex flex-col space-y-4">
        {/* Breadcrumb link */}
        <div>
          <Link
            to="/events"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Events</span>
          </Link>
        </div>

        {/* Header Strip */}
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold text-white tracking-tight">Event #{event.numeric_id}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  event.risk_level === 'critical'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                }`}>
                  {event.risk_level} RISK
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-300 mt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{event.place_name}, {event.state}</span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-glow transition-all">
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>Add to Report</span>
            </button>
          </div>
        </div>

        {/* Subnav Tabs */}
        <div className="flex items-center space-x-1 border-b border-white/10 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'imagery', label: 'Imagery' },
            { id: 'timeseries', label: 'Time Series' },
            { id: 'facilities', label: 'Nearby Facilities' },
            { id: 'weather', label: 'Weather' },
            { id: 'raw', label: 'Raw Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-glow font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 12-Column Grid Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Column (8 cols): Big Map with Satellite Overlay + Thumbnails Gallery */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* Big Map Canvas */}
            <div className="relative rounded-2xl overflow-hidden glass-panel border border-white/15 h-96 group">
              <img
                src={
                  selectedGalleryThumb === 'viirs'
                    ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
                    : selectedGalleryThumb === 's2_false'
                    ? 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80'
                    : 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80'
                }
                alt="Satellite view"
                className="w-full h-full object-cover brightness-90"
              />

              {/* Inset Heatmap Thermal Anomaly Box */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 rounded-full bg-red-600/40 border-2 border-red-500 animate-ping" />
                <div className="absolute w-16 h-16 rounded-full bg-red-600/70 border border-white flex items-center justify-center shadow-glowRed">
                  <Flame className="w-7 h-7 text-white fill-white" />
                </div>
              </div>

              {/* Map controls & overlays */}
              <div className="absolute top-4 left-4 glass-panel px-3 py-1.5 rounded-lg border border-white/20 text-xs font-semibold text-white">
                Sentinel-2 · {new Date(event.first_detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              <div className="absolute bottom-4 right-4">
                <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg glass-panel hover:bg-white/10 text-xs font-semibold text-white border border-white/20 shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>View Full Screen</span>
                </button>
              </div>
            </div>

            {/* Bottom 4 Thumbnails Gallery (from Storyboard #3) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setSelectedGalleryThumb('viirs')}
                className={`glass-panel p-2 rounded-xl border cursor-pointer transition-all ${
                  selectedGalleryThumb === 'viirs' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="h-20 rounded-lg overflow-hidden bg-slate-900 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80"
                    alt="VIIRS"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[11px] font-bold text-white">VIIRS (FIRMS)</div>
                <div className="text-[10px] text-slate-400">Sep 26, 2026</div>
              </div>

              <div
                onClick={() => setSelectedGalleryThumb('s2_true')}
                className={`glass-panel p-2 rounded-xl border cursor-pointer transition-all ${
                  selectedGalleryThumb === 's2_true' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="h-20 rounded-lg overflow-hidden bg-slate-900 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=300&q=80"
                    alt="Sentinel-2 True Color"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[11px] font-bold text-white">Sentinel-2 (True Color)</div>
                <div className="text-[10px] text-slate-400">Sep 26, 2026</div>
              </div>

              <div
                onClick={() => setSelectedGalleryThumb('s2_false')}
                className={`glass-panel p-2 rounded-xl border cursor-pointer transition-all ${
                  selectedGalleryThumb === 's2_false' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="h-20 rounded-lg overflow-hidden bg-slate-900 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&q=80"
                    alt="Sentinel-2 False Color"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[11px] font-bold text-white">Sentinel-2 (False Color)</div>
                <div className="text-[10px] text-slate-400">Sep 26, 2026</div>
              </div>

              <div
                onClick={() => setSelectedGalleryThumb('osm')}
                className={`glass-panel p-2 rounded-xl border cursor-pointer transition-all ${
                  selectedGalleryThumb === 'osm' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="h-20 rounded-lg overflow-hidden bg-slate-900 mb-1.5 flex items-center justify-center bg-blue-950/40">
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-[11px] font-bold text-white">OpenStreetMap</div>
                <div className="text-[10px] text-slate-400">Industrial Boundary</div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Event Information Card */}
          <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-white/10 mb-3">
                Event Information
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Classification</span>
                  <div className="flex items-center space-x-1.5 font-bold text-red-500">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Industrial Fire</span>
                  </div>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Classification Confidence</span>
                  <span className="font-bold text-white tabular-nums">{event.class_confidence}%</span>
                </div>

                <div className="py-1.5 border-b border-white/5">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Risk Score</span>
                    <span className="font-bold text-red-400 tabular-nums">{event.risk_score} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                      style={{ width: `${event.risk_score}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Brightness Temperature</span>
                  <span className="font-bold text-white tabular-nums">{event.max_brightness_k} K (VIIRS I4)</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Detection Time (UTC)</span>
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

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Alert Generated</span>
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

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Location</span>
                  <span className="font-mono text-slate-200">{event.centroid.lat.toFixed(4)}° N, {event.centroid.lon.toFixed(4)}° E</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Nearest Facility</span>
                  <span className="text-slate-200 font-medium">
                    {event.nearest_facility.name} ({(event.nearest_facility.distance_m / 1000).toFixed(1)} km)
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">State</span>
                  <span className="text-slate-200 font-medium">{event.state}</span>
                </div>
              </div>
            </div>

            {/* Evidence & Why Section */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Classification Evidence</h4>
              <div className="space-y-1.5">
                {event.evidence.map((ev) => (
                  <div key={ev.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[11px]">
                    <div className="flex justify-between text-blue-400 font-semibold mb-0.5">
                      <span>{ev.label}</span>
                      <span className="text-emerald-400 font-mono">+{(ev.contribution * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-slate-300 text-[10px]">{ev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
