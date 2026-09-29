from typing import List, Dict, Any

def get_kpis_data() -> List[Dict[str, Any]]:
    return [
        {
            "key": "total_hotspots",
            "label": "Total Hotspots",
            "value": 1284,
            "previous_value": 1146,
            "delta_pct": 12.0,
            "subtitle": "Raw FIRMS detections",
            "color": "#FF3B47",
            "accentClass": "border-slate-800/80 hover:border-red-500/50",
            "sparkline": [
                {"t": "Sep 22", "v": 140},
                {"t": "Sep 23", "v": 155},
                {"t": "Sep 24", "v": 168},
                {"t": "Sep 25", "v": 182},
                {"t": "Sep 26", "v": 220},
                {"t": "Sep 27", "v": 205},
                {"t": "Sep 28", "v": 214}
            ]
        },
        {
            "key": "industrial_events",
            "label": "Industrial Events",
            "value": 312,
            "previous_value": 289,
            "delta_pct": 8.0,
            "subtitle": "Clustered events",
            "color": "#2F7BFF",
            "accentClass": "border-blue-500/80 bg-blue-500/10 shadow-glow",
            "sparkline": [
                {"t": "Sep 22", "v": 35},
                {"t": "Sep 23", "v": 40},
                {"t": "Sep 24", "v": 42},
                {"t": "Sep 25", "v": 45},
                {"t": "Sep 26", "v": 52},
                {"t": "Sep 27", "v": 48},
                {"t": "Sep 28", "v": 50}
            ]
        },
        {
            "key": "persistent_sources",
            "label": "Persistent Sources",
            "value": 156,
            "previous_value": 161,
            "delta_pct": -3.0,
            "subtitle": "Clustered events",
            "color": "#FF8A1F",
            "accentClass": "border-slate-800/80 hover:border-orange-500/50",
            "sparkline": [
                {"t": "Sep 22", "v": 24},
                {"t": "Sep 23", "v": 23},
                {"t": "Sep 24", "v": 22},
                {"t": "Sep 25", "v": 22},
                {"t": "Sep 26", "v": 21},
                {"t": "Sep 27", "v": 22},
                {"t": "Sep 28", "v": 22}
            ]
        },
        {
            "key": "forest_wildfire",
            "label": "Forest / Wildfire",
            "value": 42,
            "previous_value": 40,
            "delta_pct": 5.0,
            "subtitle": "Clustered events",
            "color": "#22C55E",
            "accentClass": "border-slate-800/80 hover:border-green-500/50",
            "sparkline": [
                {"t": "Sep 22", "v": 4},
                {"t": "Sep 23", "v": 6},
                {"t": "Sep 24", "v": 5},
                {"t": "Sep 25", "v": 7},
                {"t": "Sep 26", "v": 8},
                {"t": "Sep 27", "v": 6},
                {"t": "Sep 28", "v": 6}
            ]
        },
        {
            "key": "agricultural_burning",
            "label": "Agricultural Burning",
            "value": 31,
            "previous_value": 28,
            "delta_pct": 12.0,
            "subtitle": "Clustered events",
            "color": "#F5B82E",
            "accentClass": "border-slate-800/80 hover:border-amber-500/50",
            "sparkline": [
                {"t": "Sep 22", "v": 3},
                {"t": "Sep 23", "v": 4},
                {"t": "Sep 24", "v": 5},
                {"t": "Sep 25", "v": 4},
                {"t": "Sep 26", "v": 6},
                {"t": "Sep 27", "v": 5},
                {"t": "Sep 28", "v": 4}
            ]
        },
        {
            "key": "high_risk_events",
            "label": "High Risk Events",
            "value": 87,
            "previous_value": 72,
            "delta_pct": 20.0,
            "subtitle": "Risk score ≥ 70",
            "color": "#EF3340",
            "accentClass": "border-red-600/80 bg-red-950/20 shadow-glowRed",
            "sparkline": [
                {"t": "Sep 22", "v": 8},
                {"t": "Sep 23", "v": 10},
                {"t": "Sep 24", "v": 12},
                {"t": "Sep 25", "v": 14},
                {"t": "Sep 26", "v": 18},
                {"t": "Sep 27", "v": 13},
                {"t": "Sep 28", "v": 12}
            ]
        }
    ]
