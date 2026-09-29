import pytest
from app.geo.clustering import haversine_distance_m, cluster_detections, find_nearest_facility
from app.classification.rules_engine import evaluate_classification_rules
from app.risk.engine import compute_risk_score
from app.services.event_service import EventService
from app.services.kpi_service import get_kpis_data
from app.services.alert_service import AlertService
from app.simulation.engine import SimulationEngine

def test_haversine_distance():
    # Jamnagar refinery coords
    lat1, lon1 = 22.4707, 70.0577
    lat2, lon2 = 22.4715, 70.0585
    dist = haversine_distance_m(lat1, lon1, lat2, lon2)
    assert 50 < dist < 200, f"Distance expected around 120m, got {dist}"

def test_cluster_detections():
    # 2 close detections within 750m and 1 far away
    detections = [
        {"id": 1, "lat": 22.4707, "lon": 70.0577, "frp": 100},
        {"id": 2, "lat": 22.4715, "lon": 70.0585, "frp": 200},
        {"id": 3, "lat": 26.5824, "lon": 93.7541, "frp": 50},  # Assam
    ]
    clusters = cluster_detections(detections, eps_meters=750.0)
    assert len(clusters) == 2, f"Expected 2 clusters, got {len(clusters)}"

def test_rules_industrial_fire():
    features = {
        "peak_frp_mw": 750.0,
        "nearest_facility_dist_m": 320.0,
        "facility_type": "Refinery",
        "baseline_p90_frp": 80.0,
        "persistence_days": 3,
        "detection_count": 14,
        "state": "Gujarat",
        "place_name": "Jamnagar Refinery"
    }
    winning_class, probs, conf, evidence = evaluate_classification_rules(features)
    assert winning_class == "industrial_fire"
    assert conf >= 85.0
    assert len(evidence) >= 2

def test_rules_wildfire():
    features = {
        "peak_frp_mw": 145.0,
        "nearest_facility_dist_m": 16000.0,
        "facility_type": "None",
        "baseline_p90_frp": 20.0,
        "persistence_days": 2,
        "detection_count": 8,
        "state": "Karnataka",
        "place_name": "Dandeli Forest",
        "in_forest": True
    }
    winning_class, probs, conf, evidence = evaluate_classification_rules(features)
    assert winning_class == "wildfire_forest"
    assert conf >= 80.0

def test_risk_scoring():
    score, level, components = compute_risk_score(
        event_class="industrial_fire",
        class_confidence=94.0,
        peak_frp_mw=750.0,
        baseline_p90_frp=80.0,
        facility_dist_m=320.0,
        hazard_weight=1.0,
        population_5km=42500,
        persistence_days=3
    )
    assert 80 <= score <= 95, f"Expected score around 87, got {score}"
    assert level == "critical"
    assert "intensity" in components
    assert "anomaly" in components

def test_kpi_service():
    kpis = get_kpis_data()
    assert len(kpis) == 6
    assert kpis[0]["key"] == "total_hotspots"
    assert kpis[1]["key"] == "industrial_events"

def test_simulation_clock():
    sim = SimulationEngine()
    sim.start()
    init_clock = sim.virtual_clock
    sim.tick(seconds_elapsed=10.0)
    assert sim.virtual_clock > init_clock
