from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

EventClass = Literal[
    'industrial_fire',
    'gas_flare_persistent',
    'wildfire_forest',
    'agricultural_burning',
    'mining_activity',
    'other_thermal'
]

RiskLevel = Literal['critical', 'high', 'medium', 'low']
DataOrigin = Literal['real_nrt', 'real_archive', 'real_static', 'demo_curated', 'synthetic', 'derived']
AppMode = Literal['live', 'simulation', 'demo']

class Coordinates(BaseModel):
    lat: float
    lon: float

class NearestFacility(BaseModel):
    id: str
    name: str
    type: str
    distance_m: float

class EvidenceItemSchema(BaseModel):
    id: str
    label: str
    text: str
    contribution: float
    source_tag: str
    origin: DataOrigin

class TimelineItemSchema(BaseModel):
    id: str
    ts: datetime
    type: str
    title: str
    description: str
    frp_mw: Optional[float] = None

class ImageryAssetSchema(BaseModel):
    kind: str
    url: str
    acquired_at: datetime
    cloud_pct: float
    status: str

class RiskComponentsSchema(BaseModel):
    intensity: float
    anomaly: float
    asset_criticality: float
    population_exposure: float
    escalation: float
    class_severity_conf: float

class EventSummarySchema(BaseModel):
    id: str
    numeric_id: int
    status: Literal['active', 'monitoring', 'closed']
    event_kind: Literal['transient', 'persistent']
    event_class: EventClass
    class_confidence: float
    detection_confidence: str
    risk_score: float
    risk_level: RiskLevel
    first_detected_at: datetime
    last_detected_at: datetime
    centroid: Coordinates
    place_name: str
    state: str
    district: str
    peak_frp_mw: float
    max_brightness_k: float
    persistence_days: int
    detection_count: int
    nearest_facility: NearestFacility
    affected_area_km2: float
    population_5km: int
    needs_review: bool
    data_origin: DataOrigin
    sensor: Optional[str] = "VIIRS"

class EventDetailSchema(EventSummarySchema):
    class_probs: Dict[str, float]
    risk_components: RiskComponentsSchema
    model_version: str
    rules_version: str
    imagery_status: str
    imagery_assets: List[ImageryAssetSchema] = []
    data_quality_flags: List[str] = []
    evidence: List[EvidenceItemSchema] = []
    timeline: List[TimelineItemSchema] = []

class SparkPoint(BaseModel):
    t: str
    v: float

class KpiCardSchema(BaseModel):
    key: str
    label: str
    value: int
    previous_value: int
    delta_pct: float
    sparkline: List[SparkPoint]
    subtitle: str
    color: str
    accentClass: str

class FacilitySchema(BaseModel):
    id: str
    name: str
    type: str
    operator: str
    location: str
    state: str
    district: str
    lat: float
    lon: float
    area_m2: float
    hazard_weight: float
    active_events: int
    baseline_median_frp: float
    baseline_p90_frp: float

class AlertSchema(BaseModel):
    id: str
    event_id: str
    numeric_id: int
    alert_type: str
    severity: RiskLevel
    title: str
    subtitle: str
    created_at: datetime
    status: Literal['new', 'acknowledged', 'resolved', 'false_positive']
    place_name: str

class StatusResponse(BaseModel):
    mode: AppMode
    as_of: datetime
    dataset: Dict[str, Any]
    freshness: Dict[str, Any]
    sim: Optional[Dict[str, Any]] = None
    versions: Dict[str, str]
