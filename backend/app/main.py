import asyncio
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from datetime import datetime
from typing import Optional, List

from app.services.event_service import event_service
from app.services.kpi_service import get_kpis_data
from app.services.alert_service import alert_service
from app.db.seed import SEED_FACILITIES
from app.simulation.engine import sim_engine

app = FastAPI(
    title="ThermoWatch AI API",
    description="PS 26162 — AI-Based Detection & Classification of Industrial Fires and Persistent Thermal Sources",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app_state = {
    "mode": "demo",
    "as_of": "2026-09-28T10:42:00Z"
}

# --- System & Status ---
@app.get("/api/v1/status")
def get_status():
    return {
        "mode": app_state["mode"],
        "as_of": app_state["as_of"],
        "dataset": {
            "id": "demo-india-2026",
            "name": "India Industrial & Agricultural Thermal Dataset (Sep 2026)",
            "period_start": "2026-09-20T00:00:00Z",
            "period_end": "2026-09-28T23:59:59Z",
            "data_origin": "demo_curated"
        },
        "freshness": {
            "last_ingest_at": "2026-09-28T10:24:00Z",
            "last_observation_at": "2026-09-28T09:45:00Z",
            "expected_latency_min": 15,
            "state": "fresh"
        },
        "sim": sim_engine.get_status(),
        "versions": {
            "model": "xgb-hybrid-v2.1",
            "rules": "rules-engine-v1.4"
        }
    }

@app.get("/api/v1/meta/classes")
def get_meta_classes():
    return [
        {"key": "industrial_fire", "label": "Industrial Fire", "color": "#FF3B47"},
        {"key": "gas_flare_persistent", "label": "Gas Flare / Persistent", "color": "#FF8A1F"},
        {"key": "wildfire_forest", "label": "Wildfire / Forest", "color": "#22C55E"},
        {"key": "agricultural_burning", "label": "Agricultural Burning", "color": "#F5B82E"},
        {"key": "mining_activity", "label": "Mining Activity", "color": "#A855F7"},
        {"key": "other_thermal", "label": "Other / Unknown", "color": "#B8C0CC"}
    ]

@app.get("/api/v1/meta/risk-levels")
def get_meta_risk_levels():
    return [
        {"level": "critical", "min_score": 80, "color": "#EF3340"},
        {"level": "high", "min_score": 60, "color": "#FF8A1F"},
        {"level": "medium", "min_score": 40, "color": "#F5B82E"},
        {"level": "low", "min_score": 0, "color": "#22B8CF"}
    ]

@app.get("/api/v1/layers")
def get_layer_catalog():
    return {
        "layers": [
            {"key": "firms", "label": "FIRMS Thermal Hotspots", "default_on": True},
            {"key": "classified", "label": "Classified Events", "default_on": True},
            {"key": "facilities", "label": "Industrial Facilities", "default_on": True},
            {"key": "osm", "label": "OpenStreetMap", "default_on": True},
            {"key": "sentinel2", "label": "Sentinel-2 Imagery", "default_on": False},
            {"key": "weather", "label": "Weather (Wind)", "default_on": False},
            {"key": "admin", "label": "Administrative Boundaries", "default_on": False}
        ],
        "basemaps": ["hybrid", "satellite", "dark"]
    }

# --- KPIs ---
@app.get("/api/v1/kpis")
def get_kpis():
    return get_kpis_data()

# --- Events ---
@app.get("/api/v1/events")
def list_events(
    risk: Optional[str] = None,
    cls: Optional[str] = None,
    q: Optional[str] = None
):
    risk_list = risk.split(",") if risk else None
    cls_list = cls.split(",") if cls else None
    items = event_service.list_events(risk_levels=risk_list, classes=cls_list, query=q)
    return {
        "items": items,
        "total": len(items),
        "as_of": app_state["as_of"]
    }

@app.get("/api/v1/events/map")
def get_events_map():
    items = event_service.list_events()
    features = []
    for e in items:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e["centroid"]["lon"], e["centroid"]["lat"]]
            },
            "properties": {
                "id": e["id"],
                "numeric_id": e["numeric_id"],
                "event_class": e["event_class"],
                "risk_score": e["risk_score"],
                "risk_level": e["risk_level"],
                "peak_frp_mw": e["peak_frp_mw"],
                "place_name": e["place_name"]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@app.get("/api/v1/events/{event_id}")
def get_event(event_id: str):
    evt = event_service.get_event(event_id)
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    return evt

@app.get("/api/v1/events/{event_id}/evidence")
def get_event_evidence(event_id: str):
    evt = event_service.get_event(event_id)
    return evt.get("evidence", []) if evt else []

@app.get("/api/v1/events/{event_id}/timeline")
def get_event_timeline(event_id: str):
    evt = event_service.get_event(event_id)
    return evt.get("timeline", []) if evt else []

@app.get("/api/v1/events/{event_id}/imagery")
def get_event_imagery(event_id: str):
    evt = event_service.get_event(event_id)
    return evt.get("imagery_assets", []) if evt else []

# --- Facilities ---
@app.get("/api/v1/facilities")
def list_facilities(type: Optional[str] = None):
    facs = SEED_FACILITIES
    if type and type != "All":
        facs = [f for f in facs if f["type"].lower() == type.lower()]
    return {
        "items": facs,
        "total": len(facs)
    }

@app.get("/api/v1/facilities/{facility_id}")
def get_facility(facility_id: str):
    for f in SEED_FACILITIES:
        if f["id"] == facility_id:
            return f
    return SEED_FACILITIES[0]

# --- Alerts ---
@app.get("/api/v1/alerts")
def list_alerts(status: Optional[str] = None):
    items = alert_service.list_alerts(status=status)
    return {
        "items": items,
        "total": len(items),
        "unread_count": alert_service.unread_count()
    }

@app.get("/api/v1/alerts/unread-count")
def get_unread_alerts():
    return {"count": alert_service.unread_count()}

@app.patch("/api/v1/alerts/{alert_id}")
def acknowledge_alert(alert_id: str):
    success = alert_service.acknowledge_alert(alert_id)
    return {"success": success}

# --- Analytics ---
@app.get("/api/v1/analytics/classification")
def get_classification_distribution():
    return [
        {"key": "industrial_fire", "name": "Industrial Fire", "count": 312, "pct": 24.3, "color": "#FF3B47"},
        {"key": "gas_flare_persistent", "name": "Gas Flare / Persistent", "count": 156, "pct": 12.1, "color": "#FF8A1F"},
        {"key": "wildfire_forest", "name": "Wildfire / Forest", "count": 42, "pct": 3.3, "color": "#22C55E"},
        {"key": "agricultural_burning", "name": "Agricultural Burning", "count": 31, "pct": 2.4, "color": "#F5B82E"},
        {"key": "mining_activity", "name": "Mining Activity", "count": 18, "pct": 1.4, "color": "#A855F7"},
        {"key": "other_thermal", "name": "Other / Unknown", "count": 11, "pct": 0.9, "color": "#B8C0CC"}
    ]

@app.get("/api/v1/analytics/timeseries")
def get_analytics_timeseries():
    return [
        {"date": "Sep 22", "Industrial": 35, "Flare": 24, "Wildfire": 4, "Agri": 3, "Mining": 2},
        {"date": "Sep 23", "Industrial": 40, "Flare": 23, "Wildfire": 6, "Agri": 4, "Mining": 3},
        {"date": "Sep 24", "Industrial": 42, "Flare": 22, "Wildfire": 5, "Agri": 5, "Mining": 2},
        {"date": "Sep 25", "Industrial": 58, "Flare": 22, "Wildfire": 7, "Agri": 4, "Mining": 3},
        {"date": "Sep 26", "Industrial": 92, "Flare": 21, "Wildfire": 8, "Agri": 6, "Mining": 3},
        {"date": "Sep 27", "Industrial": 75, "Flare": 22, "Wildfire": 6, "Agri": 5, "Mining": 2},
        {"date": "Sep 28", "Industrial": 60, "Flare": 22, "Wildfire": 6, "Agri": 4, "Mining": 3}
    ]

@app.get("/api/v1/analytics/regions")
def get_analytics_regions():
    return [
        {"state": "Gujarat", "count": 142},
        {"state": "Odisha", "count": 98},
        {"state": "Assam", "count": 76},
        {"state": "Maharashtra", "count": 65},
        {"state": "Chhattisgarh", "count": 54},
        {"state": "West Bengal", "count": 48},
        {"state": "Punjab", "count": 42},
        {"state": "Karnataka", "count": 35}
    ]

@app.get("/api/v1/analytics/frp-distribution")
def get_frp_distribution():
    return [
        {"range": "0-20", "count": 42, "color": "#22B8CF"},
        {"range": "20-40", "count": 128, "color": "#22B8CF"},
        {"range": "40-60", "count": 246, "color": "#F5B82E"},
        {"range": "60-80", "count": 412, "color": "#FF8A1F"},
        {"range": "80-100", "count": 185, "color": "#EF3340"}
    ]

# --- Global Search ---
@app.get("/api/v1/search")
def global_search(q: str):
    q_low = q.lower()
    events = [e for e in event_service.list_events() if q_low in e["place_name"].lower()]
    facilities = [f for f in SEED_FACILITIES if q_low in f["name"].lower() or q_low in f["location"].lower()]
    return {
        "events": events,
        "facilities": facilities
    }

# --- Real-Time Stream (SSE) ---
@app.get("/api/v1/stream")
async def sse_stream(request: Request):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            # Send periodic heartbeat or status update
            sim_engine.tick(2.0)
            yield f"event: status.changed\ndata: {{\"mode\": \"{app_state['mode']}\", \"clock\": \"{sim_engine.virtual_clock.isoformat()}Z\"}}\n\n"
            await asyncio.sleep(5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# --- Admin Controls ---
@app.post("/api/v1/admin/mode")
def set_mode(payload: dict):
    new_mode = payload.get("mode", "demo")
    app_state["mode"] = new_mode
    return {"success": True, "mode": new_mode}

@app.post("/api/v1/admin/sim/{action}")
def sim_action(action: str):
    if action == "start":
        sim_engine.start()
    elif action == "pause":
        sim_engine.pause()
    elif action == "resume":
        sim_engine.resume()
    elif action == "reset":
        sim_engine.reset()
    return sim_engine.get_status()

# --- Health ---
@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "ThermoWatch AI Backend", "timestamp": datetime.utcnow().isoformat() + "Z"}

@app.get("/api/v1/ready")
def ready():
    return {"status": "ready"}
