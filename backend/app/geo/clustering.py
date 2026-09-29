import math
from typing import List, Dict, Any, Tuple
from datetime import datetime

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def cluster_detections(detections: List[Dict[str, Any]], eps_meters: float = 750.0) -> List[List[Dict[str, Any]]]:
    """
    ST-DBSCAN style spatial clustering of satellite thermal detections.
    Clusters detections within eps_meters (default ~750m, 2 VIIRS 375m pixels).
    """
    visited = set()
    clusters: List[List[Dict[str, Any]]] = []

    for i, det in enumerate(detections):
        if i in visited:
            continue
        visited.add(i)

        current_cluster = [det]
        queue = [i]

        while queue:
            curr_idx = queue.pop(0)
            curr_det = detections[curr_idx]

            for j, neighbor in enumerate(detections):
                if j not in visited:
                    dist = haversine_distance_m(
                        curr_det['lat'], curr_det['lon'],
                        neighbor['lat'], neighbor['lon']
                    )
                    if dist <= eps_meters:
                        visited.add(j)
                        current_cluster.append(neighbor)
                        queue.append(j)

        clusters.append(current_cluster)

    return clusters

def find_nearest_facility(lat: float, lon: float, facilities: List[Dict[str, Any]]) -> Tuple[Dict[str, Any], float]:
    """Find the closest facility to a thermal detection or cluster centroid."""
    if not facilities:
        return ({"id": "unknown", "name": "None", "type": "Unknown", "hazard_weight": 0.5}, 999999.0)

    best_fac = facilities[0]
    best_dist = float('inf')

    for fac in facilities:
        dist = haversine_distance_m(lat, lon, fac['lat'], fac['lon'])
        if dist < best_dist:
            best_dist = dist
            best_fac = fac

    return (best_fac, best_dist)
