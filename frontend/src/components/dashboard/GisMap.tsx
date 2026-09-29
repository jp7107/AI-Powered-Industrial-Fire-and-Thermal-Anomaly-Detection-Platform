import React, { useEffect, useRef, useState } from 'react';
import { 
  Flame, 
  Trees, 
  Wheat, 
  Pickaxe, 
  Building2, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Layers, 
  Crosshair,
  MapPin
} from 'lucide-react';
import { EventDetail, Facility, EventClass } from '../../types';

interface GisMapProps {
  events: EventDetail[];
  facilities: Facility[];
  selectedEventId?: string;
  onSelectEvent: (event: EventDetail) => void;
  layers: Record<string, boolean>;
  center?: [number, number];
  zoom?: number;
}

export const GisMap: React.FC<GisMapProps> = ({
  events,
  facilities,
  selectedEventId = 'evt-1042',
  onSelectEvent,
  layers,
  center = [22.5, 78.9], // India center
  zoom = 5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mapStyle, setMapStyle] = useState<'hybrid' | 'satellite' | 'dark'>('hybrid');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      const L = await import('leaflet');

      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 16,
      });

      // Base tile layer
      // Hybrid/Satellite using Esri World Imagery
      const satelliteTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri, Maxar, Earthstar Geographics',
          className: 'satellite-map-tiles'
        }
      );

      // CartoDB Dark Matter for dark vector basemap
      const darkTile = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '© OpenStreetMap contributors © CARTO',
          subdomains: 'abcd',
          maxZoom: 20
        }
      );

      // Boundaries and labels overlay for hybrid
      const labelsTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          opacity: 0.8
        }
      );

      if (mapStyle === 'dark') {
        darkTile.addTo(map);
      } else {
        satelliteTile.addTo(map);
        if (mapStyle === 'hybrid') {
          labelsTile.addTo(map);
        }
      }

      // Layer group for markers
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markerGroup;
      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when events or selectedEventId change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const updateMarkers = async () => {
      const L = await import('leaflet');
      const markerGroup = markersLayerRef.current;
      markerGroup.clearLayers();

      // Render facilities if layer is on
      if (layers['facilities']) {
        facilities.forEach((fac) => {
          const facIcon = L.divIcon({
            className: 'custom-facility-marker',
            html: `
              <div class="w-6 h-6 rounded bg-blue-600/90 border border-blue-400 flex items-center justify-center shadow-lg cursor-pointer hover:scale-125 transition-transform" title="${fac.name}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                  <path d="M10 6h4"/>
                  <path d="M10 10h4"/>
                  <path d="M10 14h4"/>
                  <path d="M10 18h4"/>
                </svg>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([fac.lat, fac.lon], { icon: facIcon })
            .bindTooltip(`<b>${fac.name}</b><br/><span style="color:#94a3b8">${fac.type} · ${fac.location}</span>`, {
              direction: 'top',
              className: 'glass-panel text-xs text-white p-2 border border-white/20'
            })
            .addTo(markerGroup);
        });
      }

      // Render events
      if (layers['classified'] || layers['firms']) {
        events.forEach((evt) => {
          const isSelected = evt.id === selectedEventId || evt.numeric_id.toString() === selectedEventId;
          const isCritical = evt.risk_level === 'critical' || evt.risk_score >= 80;

          // Color based on class
          let iconColor = '#FF3B47'; // red default
          if (evt.event_class === 'gas_flare_persistent') iconColor = '#FF8A1F';
          else if (evt.event_class === 'wildfire_forest') iconColor = '#22C55E';
          else if (evt.event_class === 'agricultural_burning') iconColor = '#F5B82E';
          else if (evt.event_class === 'mining_activity') iconColor = '#A855F7';
          else if (evt.event_class === 'other_thermal') iconColor = '#B8C0CC';

          // Pulse ring for critical or selected
          const pulseHtml = (isCritical || isSelected) ? `
            <div class="absolute -inset-2.5 rounded-full bg-red-600/30 animate-ping"></div>
            <div class="absolute -inset-1.5 rounded-full border border-red-500/80 animate-pulse"></div>
          ` : '';

          const selectedHalo = isSelected ? `
            <div class="absolute -inset-3.5 rounded-full border-2 border-white shadow-glow"></div>
          ` : '';

          const eventIcon = L.divIcon({
            className: 'custom-event-marker',
            html: `
              <div class="relative flex items-center justify-center cursor-pointer group">
                ${selectedHalo}
                ${pulseHtml}
                <div style="background-color: ${iconColor};" class="w-7 h-7 rounded-full border-2 border-white/90 shadow-xl flex items-center justify-center transform group-hover:scale-125 transition-transform z-10">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                  </svg>
                </div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([evt.centroid.lat, evt.centroid.lon], { icon: eventIcon });
          marker.on('click', () => {
            onSelectEvent(evt);
            mapInstanceRef.current?.flyTo([evt.centroid.lat, evt.centroid.lon], 10, { duration: 1.2 });
          });

          marker.bindTooltip(`
            <div style="font-family:Inter,sans-serif; min-width:140px;">
              <div style="font-weight:700; color:#fff; font-size:12px;">Event #${evt.numeric_id}</div>
              <div style="color:#94a3b8; font-size:11px;">${evt.place_name}</div>
              <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:11px;">
                <span style="color:${iconColor}; font-weight:600;">${evt.event_class.replace('_', ' ').toUpperCase()}</span>
                <span style="color:#ef4444; font-weight:700;">Score ${evt.risk_score}</span>
              </div>
            </div>
          `, {
            direction: 'top',
            offset: [0, -14],
            className: 'glass-panel text-xs text-white p-2.5 rounded-lg border border-white/20'
          });

          marker.addTo(markerGroup);
        });
      }
    };

    updateMarkers();
  }, [events, facilities, selectedEventId, layers]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapInstanceRef.current?.flyTo(center, zoom, { duration: 1 });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden glass-panel border border-white/10 ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[500px] xl:h-[540px]'
    }`}>
      {/* Map Leaflet canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left: Map Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col space-y-1.5">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-white/10 flex items-center justify-center text-white border border-white/15 shadow-md active:scale-95 transition-all"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-white/10 flex items-center justify-center text-white border border-white/15 shadow-md active:scale-95 transition-all"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-white/10 flex items-center justify-center text-white border border-white/15 shadow-md active:scale-95 transition-all"
          title="Reset View to India"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Top Right: Fullscreen & Basemap Style switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <div className="glass-panel rounded-lg border border-white/15 p-1 flex items-center space-x-1 shadow-md">
          <button
            onClick={() => setMapStyle('hybrid')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              mapStyle === 'hybrid' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Hybrid
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              mapStyle === 'dark' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Dark Vector
          </button>
        </div>

        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-lg glass-panel hover:bg-white/10 flex items-center justify-center text-white border border-white/15 shadow-md active:scale-95 transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Left: Map Legend Card */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel p-3 rounded-xl border border-white/15 shadow-2xl max-w-xs backdrop-blur-md">
        <h4 className="text-[11px] font-bold text-white mb-2 tracking-wide uppercase">Legend</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-300">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B47] inline-block shadow-sm" />
            <span>Industrial Fire</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block shadow-sm" />
            <span>Industrial Facility</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A1F] inline-block shadow-sm" />
            <span>Gas Flare / Persistent</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 border-t border-dashed border-slate-400 inline-block" />
            <span>State Boundary</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block shadow-sm" />
            <span>Wildfire / Forest</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 border-t border-white inline-block" />
            <span>Country Boundary</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B82E] inline-block shadow-sm" />
            <span>Agricultural Burning</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] inline-block shadow-sm" />
            <span>Mining Activity</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8C0CC] inline-block shadow-sm" />
            <span>Other / Unknown</span>
          </div>
        </div>
      </div>

      {/* Bottom Right: Scale indicator */}
      <div className="absolute bottom-4 right-4 z-20 glass-panel px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-300 flex items-center space-x-2">
        <div className="w-12 h-1 border-b-2 border-l-2 border-r-2 border-white/80" />
        <span className="font-mono">300 km</span>
      </div>
    </div>
  );
};
