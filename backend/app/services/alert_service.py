from typing import List, Dict, Any, Optional

class AlertService:
    def __init__(self):
        self.alerts: List[Dict[str, Any]] = [
            {
                "id": "alt-1",
                "event_id": "evt-1042",
                "numeric_id": 1042,
                "alert_type": "industrial_fire_detected",
                "severity": "critical",
                "title": "High risk industrial fire detected",
                "subtitle": "Reliance Refinery, Jamnagar, Gujarat",
                "created_at": "2026-09-28T10:40:00Z",
                "status": "new",
                "place_name": "Reliance Refinery, Jamnagar"
            },
            {
                "id": "alt-2",
                "event_id": "evt-1041",
                "numeric_id": 1041,
                "alert_type": "persistent_thermal_source",
                "severity": "high",
                "title": "Persistent thermal source flare surge",
                "subtitle": "Numaligarh Refinery, Assam",
                "created_at": "2026-09-28T10:28:00Z",
                "status": "acknowledged",
                "place_name": "Numaligarh Refinery, Assam"
            },
            {
                "id": "alt-3",
                "event_id": "evt-1037",
                "numeric_id": 1037,
                "alert_type": "industrial_fire_detected",
                "severity": "critical",
                "title": "Industrial fire alert - Chemical Zone",
                "subtitle": "Paradip Port, Odisha",
                "created_at": "2026-09-28T09:42:00Z",
                "status": "new",
                "place_name": "Paradip Port, Odisha"
            },
            {
                "id": "alt-4",
                "event_id": "evt-1036",
                "numeric_id": 1036,
                "alert_type": "facility_thermal_anomaly",
                "severity": "high",
                "title": "Gas flare activity elevated",
                "subtitle": "Haldia Petrochemicals, West Bengal",
                "created_at": "2026-09-28T08:42:00Z",
                "status": "resolved",
                "place_name": "Haldia Petrochemicals, West Bengal"
            }
        ]

    def list_alerts(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if status and status != 'All':
            return [a for a in self.alerts if a['status'] == status]
        return self.alerts

    def acknowledge_alert(self, alert_id: str) -> bool:
        for a in self.alerts:
            if a['id'] == alert_id:
                a['status'] = 'acknowledged'
                return True
        return False

    def unread_count(self) -> int:
        return len([a for a in self.alerts if a['status'] == 'new'])

alert_service = AlertService()
