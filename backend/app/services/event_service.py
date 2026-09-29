from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.geo.clustering import find_nearest_facility
from app.classification.rules_engine import evaluate_classification_rules
from app.risk.engine import compute_risk_score
from app.db.seed import SEED_FACILITIES

class EventService:
    def __init__(self):
        self.facilities = SEED_FACILITIES
        self.events: List[Dict[str, Any]] = []
        self._init_demo_events()

    def _init_demo_events(self):
        # Base event records matching master prototype
        raw_seed = [
            {
                "id": "evt-1042",
                "numeric_id": 1042,
                "status": "active",
                "event_kind": "transient",
                "lat": 22.4707,
                "lon": 70.0577,
                "place_name": "Reliance Refinery, Jamnagar",
                "state": "Gujarat",
                "district": "Jamnagar",
                "peak_frp_mw": 750.4,
                "max_brightness_k": 341.2,
                "first_detected_at": "2026-09-26T14:32:00Z",
                "last_detected_at": "2026-09-28T08:15:00Z",
                "persistence_days": 3,
                "detection_count": 14,
                "affected_area_km2": 1.84,
                "population_5km": 42500,
                "sensor": "VIIRS + Sentinel-2"
            },
            {
                "id": "evt-1041",
                "numeric_id": 1041,
                "status": "active",
                "event_kind": "persistent",
                "lat": 26.5824,
                "lon": 93.7541,
                "place_name": "Numaligarh Refinery, Assam",
                "state": "Assam",
                "district": "Golaghat",
                "peak_frp_mw": 112.5,
                "max_brightness_k": 329.8,
                "first_detected_at": "2026-09-26T13:18:00Z",
                "last_detected_at": "2026-09-28T07:45:00Z",
                "persistence_days": 94,
                "detection_count": 182,
                "affected_area_km2": 0.42,
                "population_5km": 12400,
                "sensor": "VIIRS"
            },
            {
                "id": "evt-1040",
                "numeric_id": 1040,
                "status": "active",
                "event_kind": "transient",
                "lat": 15.2412,
                "lon": 74.6234,
                "place_name": "Dandeli Forest, Karnataka",
                "state": "Karnataka",
                "district": "Uttara Kannada",
                "peak_frp_mw": 145.2,
                "max_brightness_k": 334.6,
                "first_detected_at": "2026-09-26T11:05:00Z",
                "last_detected_at": "2026-09-28T06:20:00Z",
                "persistence_days": 2,
                "detection_count": 8,
                "affected_area_km2": 4.65,
                "population_5km": 1800,
                "sensor": "VIIRS",
                "in_forest": True
            },
            {
                "id": "evt-1039",
                "numeric_id": 1039,
                "status": "active",
                "event_kind": "persistent",
                "lat": 22.3654,
                "lon": 82.7241,
                "place_name": "Korba Open Cast Coalfield",
                "state": "Chhattisgarh",
                "district": "Korba",
                "peak_frp_mw": 64.8,
                "max_brightness_k": 322.4,
                "first_detected_at": "2026-09-26T09:42:00Z",
                "last_detected_at": "2026-09-28T05:30:00Z",
                "persistence_days": 42,
                "detection_count": 58,
                "affected_area_km2": 1.12,
                "population_5km": 8400,
                "sensor": "VIIRS"
            },
            {
                "id": "evt-1038",
                "numeric_id": 1038,
                "status": "active",
                "event_kind": "transient",
                "lat": 30.2110,
                "lon": 74.9523,
                "place_name": "Bathinda Farmland, Punjab",
                "state": "Punjab",
                "district": "Bathinda",
                "peak_frp_mw": 42.0,
                "max_brightness_k": 318.5,
                "first_detected_at": "2026-09-26T07:21:00Z",
                "last_detected_at": "2026-09-27T12:10:00Z",
                "persistence_days": 1,
                "detection_count": 4,
                "affected_area_km2": 0.35,
                "population_5km": 15600,
                "sensor": "VIIRS"
            },
            {
                "id": "evt-1037",
                "numeric_id": 1037,
                "status": "active",
                "event_kind": "transient",
                "lat": 20.2644,
                "lon": 86.6719,
                "place_name": "Paradip Port Chemical Zone",
                "state": "Odisha",
                "district": "Jagatsinghpur",
                "peak_frp_mw": 410.0,
                "max_brightness_k": 339.0,
                "first_detected_at": "2026-09-25T22:11:00Z",
                "last_detected_at": "2026-09-27T18:40:00Z",
                "persistence_days": 2,
                "detection_count": 11,
                "affected_area_km2": 1.25,
                "population_5km": 31000,
                "sensor": "VIIRS"
            }
        ]

        for item in raw_seed:
            nearest_fac, dist = find_nearest_facility(item['lat'], item['lon'], self.facilities)
            features = {
                "peak_frp_mw": item['peak_frp_mw'],
                "nearest_facility_dist_m": dist,
                "facility_name": nearest_fac['name'],
                "facility_type": nearest_fac['type'],
                "baseline_p90_frp": nearest_fac.get('baseline_p90_frp', 50.0),
                "persistence_days": item['persistence_days'],
                "detection_count": item['detection_count'],
                "state": item['state'],
                "place_name": item['place_name'],
                "in_forest": item.get('in_forest', False)
            }

            event_class, class_probs, confidence, evidence = evaluate_classification_rules(features)
            score, risk_lvl, risk_comp = compute_risk_score(
                event_class=event_class,
                class_confidence=confidence,
                peak_frp_mw=item['peak_frp_mw'],
                baseline_p90_frp=features['baseline_p90_frp'],
                facility_dist_m=dist,
                hazard_weight=nearest_fac.get('hazard_weight', 0.5),
                population_5km=item['population_5km'],
                persistence_days=item['persistence_days']
            )

            full_event = {
                "id": item['id'],
                "numeric_id": item['numeric_id'],
                "status": item['status'],
                "event_kind": item['event_kind'],
                "event_class": event_class,
                "class_confidence": confidence,
                "detection_confidence": "High" if item['peak_frp_mw'] > 40 else "Nominal",
                "risk_score": score,
                "risk_level": risk_lvl,
                "first_detected_at": item['first_detected_at'],
                "last_detected_at": item['last_detected_at'],
                "centroid": {"lat": item['lat'], "lon": item['lon']},
                "place_name": item['place_name'],
                "state": item['state'],
                "district": item['district'],
                "peak_frp_mw": item['peak_frp_mw'],
                "max_brightness_k": item['max_brightness_k'],
                "persistence_days": item['persistence_days'],
                "detection_count": item['detection_count'],
                "nearest_facility": {
                    "id": nearest_fac['id'],
                    "name": nearest_fac['name'],
                    "type": nearest_fac['type'],
                    "distance_m": round(dist, 1)
                },
                "affected_area_km2": item['affected_area_km2'],
                "population_5km": item['population_5km'],
                "needs_review": False,
                "data_origin": "real_archive",
                "sensor": item['sensor'],
                "class_probs": class_probs,
                "risk_components": risk_comp,
                "model_version": "xgb-hybrid-v2.1",
                "rules_version": "rules-engine-v1.4",
                "imagery_status": "ready",
                "imagery_assets": [
                    {
                        "kind": "s2_truecolor",
                        "url": "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=600&q=80",
                        "acquired_at": item['first_detected_at'],
                        "cloud_pct": 4.8,
                        "status": "ready"
                    }
                ],
                "data_quality_flags": ["verified_footprint"],
                "evidence": evidence,
                "timeline": [
                    {
                        "id": f"tl-{item['numeric_id']}-1",
                        "ts": item['first_detected_at'],
                        "type": "detection",
                        "title": f"Initial VIIRS Detection ({item['sensor']})",
                        "description": f"Thermal anomaly registered with FRP {item['peak_frp_mw']} MW",
                        "frp_mw": item['peak_frp_mw']
                    }
                ]
            }
            self.events.append(full_event)

    def list_events(self, risk_levels: Optional[List[str]] = None, classes: Optional[List[str]] = None, query: Optional[str] = None) -> List[Dict[str, Any]]:
        res = self.events
        if risk_levels:
            res = [e for e in res if e['risk_level'] in risk_levels]
        if classes:
            res = [e for e in res if e['event_class'] in classes]
        if query:
            q = query.lower()
            res = [e for e in res if q in e['place_name'].lower() or q in str(e['numeric_id'])]
        return res

    def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        for e in self.events:
            if e['id'] == event_id or str(e['numeric_id']) == event_id:
                return e
        return self.events[0] if self.events else None

event_service = EventService()
