from datetime import datetime, timedelta
from typing import Dict, Any

class SimulationEngine:
    def __init__(self):
        self.state: str = "paused"  # "running", "paused", "stopped"
        self.speed: int = 60
        self.virtual_clock: datetime = datetime(2026, 9, 26, 12, 0, 0)
        self.start_ts: datetime = datetime(2026, 9, 26, 0, 0, 0)
        self.end_ts: datetime = datetime(2026, 9, 28, 23, 59, 59)

    def start(self):
        self.state = "running"
        return self.get_status()

    def pause(self):
        self.state = "paused"
        return self.get_status()

    def resume(self):
        self.state = "running"
        return self.get_status()

    def set_speed(self, speed: int):
        self.speed = speed
        return self.get_status()

    def reset(self):
        self.virtual_clock = self.start_ts
        self.state = "paused"
        return self.get_status()

    def tick(self, seconds_elapsed: float = 1.0):
        if self.state == "running":
            advance_seconds = seconds_elapsed * self.speed
            self.virtual_clock += timedelta(seconds=advance_seconds)
            if self.virtual_clock > self.end_ts:
                self.virtual_clock = self.end_ts
                self.state = "paused"
        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        return {
            "clock": self.virtual_clock.isoformat() + "Z",
            "speed": self.speed,
            "state": self.state,
            "start": self.start_ts.isoformat() + "Z",
            "end": self.end_ts.isoformat() + "Z"
        }

sim_engine = SimulationEngine()
