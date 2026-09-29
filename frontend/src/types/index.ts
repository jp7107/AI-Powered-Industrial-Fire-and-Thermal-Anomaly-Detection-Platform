export type EventClass = 
  | 'industrial_fire'
  | 'gas_flare_persistent'
  | 'wildfire_forest'
  | 'agricultural_burning'
  | 'mining_activity'
  | 'other_thermal';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type DataOrigin = 'real_nrt' | 'real_archive' | 'real_static' | 'demo_curated' | 'synthetic' | 'derived';

export type AppMode = 'live' | 'simulation' | 'demo';

export interface NearestFacility {
  id: string;
  name: string;
  type: string;
  distance_m: number;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface EventSummary {
  id: string;
  numeric_id: number;
  status: 'active' | 'monitoring' | 'closed';
  event_kind: 'transient' | 'persistent';
  event_class: EventClass;
  class_confidence: number; // 0 - 100
  detection_confidence: string; // 'High' | 'Nominal' | 'Low'
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  first_detected_at: string;
  last_detected_at: string;
  centroid: Coordinates;
  place_name: string;
  state: string;
  district: string;
  peak_frp_mw: number;
  max_brightness_k: number;
  persistence_days: number;
  detection_count: number;
  nearest_facility: NearestFacility;
  affected_area_km2: number;
  population_5km: number;
  needs_review: boolean;
  data_origin: DataOrigin;
  sensor?: string;
}

export interface RiskComponents {
  intensity: number;
  anomaly: number;
  asset_criticality: number;
  population_exposure: number;
  escalation: number;
  class_severity_conf: number;
}

export interface EvidenceItem {
  id: string;
  label: string;
  text: string;
  contribution: number; // e.g. +0.45 or -0.10
  source_tag: 'FIRMS' | 'OSM' | 'WorldCover' | 'Derived' | 'Sentinel-2';
  origin: DataOrigin;
}

export interface TimelineItem {
  id: string;
  ts: string;
  type: 'detection' | 'class_change' | 'risk_change' | 'alert' | 'imagery';
  title: string;
  description: string;
  frp_mw?: number;
}

export interface ImageryAsset {
  kind: 's2_truecolor' | 's2_swir' | 'viirs_footprint';
  url: string;
  acquired_at: string;
  cloud_pct: number;
  status: 'ready' | 'pending' | 'no_clear_scene' | 'error';
}

export interface EventDetail extends EventSummary {
  class_probs: Record<EventClass, number>;
  risk_components: RiskComponents;
  footprint_geojson?: any;
  model_version: string;
  rules_version: string;
  merged_into?: string;
  imagery_status: 'ready' | 'pending' | 'no_clear_scene';
  imagery_assets: ImageryAsset[];
  data_quality_flags: string[];
  evidence: EvidenceItem[];
  timeline: TimelineItem[];
  raw_detections?: Array<{
    id: string;
    satellite: string;
    sensor: string;
    acq_datetime: string;
    frp_mw: number;
    brightness_k: number;
    confidence: string;
    lat: number;
    lon: number;
  }>;
}

export interface KpiCardData {
  key: string;
  label: string;
  value: number;
  previous_value: number;
  delta_pct: number;
  sparkline: Array<{ t: string; v: number }>;
  subtitle: string;
  color: string;
  accentClass: string;
}

export interface AlertItem {
  id: string;
  event_id: string;
  numeric_id: number;
  alert_type: string;
  severity: RiskLevel;
  title: string;
  subtitle: string;
  created_at: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'false_positive';
  thumbnail_url?: string;
  place_name: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  operator: string;
  location: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
  area_m2: number;
  hazard_weight: number;
  active_events: number;
  baseline_median_frp: number;
  baseline_p90_frp: number;
  tags?: Record<string, string>;
}

export interface StatusResponse {
  mode: AppMode;
  as_of: string;
  dataset: {
    id: string;
    name: string;
    period_start: string;
    period_end: string;
    data_origin: DataOrigin;
  };
  freshness: {
    last_ingest_at: string;
    last_observation_at: string;
    expected_latency_min: number;
    state: 'fresh' | 'delayed' | 'stale';
  };
  sim?: {
    clock: string;
    speed: number;
    state: 'running' | 'paused' | 'stopped';
  };
  versions: {
    model: string;
    rules: string;
  };
}

export interface FilterState {
  timeRange: string;
  riskLevels: RiskLevel[];
  eventClasses: EventClass[];
  facilityType: string;
  region: string;
  searchQuery: string;
}
