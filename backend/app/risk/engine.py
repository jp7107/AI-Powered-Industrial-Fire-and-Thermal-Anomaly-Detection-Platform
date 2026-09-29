import math
from typing import Dict, Any, Tuple

def compute_risk_score(
    event_class: str,
    class_confidence: float,
    peak_frp_mw: float,
    baseline_p90_frp: float,
    facility_dist_m: float,
    hazard_weight: float,
    population_5km: int,
    persistence_days: int
) -> Tuple[int, str, Dict[str, float]]:
    """
    Computes deterministic 0-100 risk score and components breakdown from backend.md §10:
    risk = 100 * clip( 0.20·intensity + 0.20·anomaly + 0.20·asset_criticality
                     + 0.15·population_exposure + 0.10·escalation + 0.15·class_severity_conf )
    """
    # 1. Intensity (0-1): log scaled peak FRP vs 1000 MW ref
    intensity = min(1.0, math.log10(max(1.0, peak_frp_mw)) / math.log10(1000.0))

    # 2. Anomaly (0-1): FRP ratio vs baseline p90
    frp_ratio = peak_frp_mw / max(1.0, baseline_p90_frp)
    if facility_dist_m <= 2000.0:
        anomaly = min(1.0, math.log(max(1.0, frp_ratio)) / math.log(5.0))
    else:
        anomaly = 0.1

    # 3. Asset Criticality (0-1): hazard_weight * proximity decay
    dist_decay = max(0.0, 1.0 - (facility_dist_m / 2000.0))
    asset_criticality = hazard_weight * dist_decay

    # 4. Population Exposure (0-1): log10(1 + pop) / log10(1 + 100000)
    population_exposure = min(1.0, math.log10(1.0 + population_5km) / math.log10(100001.0))

    # 5. Escalation (0-1): duration and cluster growth
    escalation = min(1.0, 0.2 + (persistence_days * 0.15))

    # 6. Class Severity & Confidence (0-1)
    class_priors = {
        'industrial_fire': 1.0,
        'gas_flare_persistent': 0.35,
        'wildfire_forest': 0.70,
        'agricultural_burning': 0.30,
        'mining_activity': 0.40,
        'other_thermal': 0.15
    }
    prior = class_priors.get(event_class, 0.2)
    conf_norm = class_confidence / 100.0
    class_severity_conf = prior * conf_norm

    raw_risk = (
        0.20 * intensity +
        0.20 * anomaly +
        0.20 * asset_criticality +
        0.15 * population_exposure +
        0.10 * escalation +
        0.15 * class_severity_conf
    )

    score = int(round(max(0.0, min(1.0, raw_risk)) * 100.0))

    if score >= 80:
        level = 'critical'
    elif score >= 60:
        level = 'high'
    elif score >= 40:
        level = 'medium'
    else:
        level = 'low'

    components = {
        "intensity": round(intensity, 2),
        "anomaly": round(anomaly, 2),
        "asset_criticality": round(asset_criticality, 2),
        "population_exposure": round(population_exposure, 2),
        "escalation": round(escalation, 2),
        "class_severity_conf": round(class_severity_conf, 2),
    }

    return score, level, components
