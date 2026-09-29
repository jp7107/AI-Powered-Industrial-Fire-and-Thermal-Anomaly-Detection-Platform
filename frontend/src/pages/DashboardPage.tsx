import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/layout/AppHeader';
import { LeftRail } from '../components/dashboard/LeftRail';
import { KpiRow } from '../components/dashboard/KpiRow';
import { GisMap } from '../components/dashboard/GisMap';
import { EventIntelligencePanel } from '../components/dashboard/EventIntelligencePanel';
import { BottomAnalytics } from '../components/dashboard/BottomAnalytics';
import { RecentEventsTable } from '../components/dashboard/RecentEventsTable';
import { api } from '../lib/api';
import { 
  EventDetail, 
  Facility, 
  AlertItem, 
  KpiCardData, 
  StatusResponse, 
  FilterState 
} from '../types';
import { useSearchParams } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [kpis, setKpis] = useState<KpiCardData[]>([]);
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [classificationData, setClassificationData] = useState<any[]>([]);
  const [timeseriesData, setTimeseriesData] = useState<any[]>([]);
  
  const [selectedEventId, setSelectedEventId] = useState<string>(
    searchParams.get('sel') || 'evt-1042'
  );
  const [selectedKpiKey, setSelectedKpiKey] = useState<string>('industrial_events');

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    timeRange: searchParams.get('range') || 'Last 7 Days',
    riskLevels: ['critical', 'high', 'medium', 'low'],
    eventClasses: [
      'industrial_fire',
      'gas_flare_persistent',
      'wildfire_forest',
      'agricultural_burning',
      'mining_activity',
      'other_thermal'
    ],
    facilityType: searchParams.get('fac') || 'All',
    region: searchParams.get('region') || 'All India',
    searchQuery: searchParams.get('q') || '',
  });

  // Layer toggles
  const [layers, setLayers] = useState<Record<string, boolean>>({
    firms: true,
    classified: true,
    facilities: true,
    osm: true,
    sentinel2: false,
    weather: false,
    admin: false,
  });

  // Load data on mount and on filter changes
  useEffect(() => {
    const loadAllData = async () => {
      const [
        statusRes,
        kpisRes,
        eventsRes,
        facilitiesRes,
        alertsRes,
        donutRes,
        timelineRes
      ] = await Promise.all([
        api.getStatus(),
        api.getKpis(filters),
        api.getEvents(filters),
        api.getFacilities(),
        api.getAlerts(),
        api.getClassificationDistribution(),
        api.getTimeseries(),
      ]);

      setStatus(statusRes);
      setKpis(kpisRes);
      setEvents(eventsRes.items);
      setFacilities(facilitiesRes.items);
      setAlerts(alertsRes.items);
      setClassificationData(donutRes);
      setTimeseriesData(timelineRes);
    };

    loadAllData();
  }, [filters]);

  const handleLayerToggle = (key: string) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectEvent = (event: EventDetail) => {
    setSelectedEventId(event.id);
    setSearchParams(prev => {
      prev.set('sel', event.id);
      return prev;
    });
  };

  const handleSelectKpi = (key: string) => {
    setSelectedKpiKey(key);
    // When user clicks Industrial Events KPI, focus on industrial_fire class
    if (key === 'industrial_events') {
      setFilters(prev => ({
        ...prev,
        eventClasses: prev.eventClasses.includes('industrial_fire') && prev.eventClasses.length === 1
          ? ['industrial_fire', 'gas_flare_persistent', 'wildfire_forest', 'agricultural_burning', 'mining_activity', 'other_thermal']
          : ['industrial_fire']
      }));
    } else if (key === 'high_risk_events') {
      setFilters(prev => ({
        ...prev,
        riskLevels: prev.riskLevels.includes('critical') && prev.riskLevels.length === 1
          ? ['critical', 'high', 'medium', 'low']
          : ['critical', 'high']
      }));
    }
  };

  // Step prev/next event
  const currentEventIndex = events.findIndex(e => e.id === selectedEventId || e.numeric_id.toString() === selectedEventId);
  const handlePrevEvent = () => {
    if (events.length === 0) return;
    const nextIdx = (currentEventIndex - 1 + events.length) % events.length;
    handleSelectEvent(events[nextIdx]);
  };
  const handleNextEvent = () => {
    if (events.length === 0) return;
    const nextIdx = (currentEventIndex + 1) % events.length;
    handleSelectEvent(events[nextIdx]);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId || e.numeric_id.toString() === selectedEventId) || events[0] || null;

  if (!status) {
    return (
      <div className="min-h-screen bg-[#050A12] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading ThermoWatch AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A12] text-[#E8EDF5] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header */}
      <AppHeader 
        status={status} 
        unreadAlertsCount={alerts.filter(a => a.status === 'new').length} 
        onSearch={(q) => setFilters(prev => ({ ...prev, searchQuery: q }))}
      />

      {/* 2. Main Content Body */}
      <main className="p-3.5 max-w-[1920px] mx-auto w-full flex-1 flex flex-col xl:flex-row gap-3">
        {/* Left Rail: Data Layers & Filters */}
        <LeftRail
          filters={filters}
          onFilterChange={setFilters}
          layers={layers}
          onLayerToggle={handleLayerToggle}
        />

        {/* Center & Right Column */}
        <div className="flex-1 flex flex-col space-y-3 min-w-0">
          {/* Top: 6 KPI Cards */}
          <KpiRow
            kpis={kpis}
            selectedKey={selectedKpiKey}
            onSelectKpi={handleSelectKpi}
          />

          {/* Middle: Map + Event Intelligence Panel */}
          <div className="flex flex-col xl:flex-row gap-3">
            {/* Central Interactive Map */}
            <div className="flex-1 min-w-0">
              <GisMap
                events={events}
                facilities={facilities}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
                layers={layers}
              />
            </div>

            {/* Right Event Intelligence Panel */}
            <EventIntelligencePanel
              event={selectedEvent}
              onClose={() => setSelectedEventId('')}
              onPrevEvent={handlePrevEvent}
              onNextEvent={handleNextEvent}
            />
          </div>

          {/* Bottom: Donut + Timeline + Recent Alerts */}
          <BottomAnalytics
            classificationData={classificationData}
            timeseriesData={timeseriesData}
            recentAlerts={alerts}
            onSelectEventId={(id) => {
              const matched = events.find(e => e.id === id);
              if (matched) handleSelectEvent(matched);
            }}
          />

          {/* Bottom Table: Recent Events */}
          <RecentEventsTable
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </main>
    </div>
  );
};
