# ThermoWatch AI — PS 26162

> **AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources**  
> **SIH 2026** · NASA FIRMS + OpenStreetMap + Sentinel-2 Multispectral Analysis

---

## 1. System Architecture

```
NASA FIRMS (VIIRS S-NPP / NOAA-20 / NOAA-21) / Static / Replay
                            │
                            ▼
           Ingestion Adapter & Schema Normalization
                            │
                            ▼
          ST-DBSCAN Spatial-Temporal Clustering
              (750 m tolerance, 48 h window)
                            │
                            ▼
   Geospatial Context (OSM Facilities, ESA WorldCover, Population)
                            │
                            ▼
      Persistence Baseline Registry (H3 res-8, 90d/365d)
                            │
                            ▼
     Hybrid 6-Class Classification (Fuzzy Rules R0-R6 + ML)
                            │
                            ▼
              Deterministic Risk Engine (0-100)
                            │
                            ▼
          Alert Rules Engine & Deduplication
                            │
                            ▼
 FastAPI REST APIs + GeoJSON + Server-Sent Events (SSE)
                            │
                            ▼
 React 18 + TypeScript + Vite + Tailwind CSS + GIS Map UI
```

---

## 2. Features Implemented

### Frontend
- **Master Reference Visual Parity**: Dark navy glassmorphism theme (`#050A12`), translucent panels, borders, neon highlights, and custom Inter typography.
- **Header**: Brand mark, nav pills with route indicator, `DEMO DATA` status chip, global search bar (`⌘K`), notification bell with unread badge, and user avatar.
- **6 Headline KPI Cards**: Total Hotspots (1,284), Industrial Events (312, selected blue glow), Persistent Sources (156), Forest / Wildfire (42), Agricultural Burning (31), High Risk Events (87, red alert treatment) with SVG sparklines and deltas.
- **Left Rail**: 7 Data Layer toggles with active status + faceted filters (time range, risk levels with counts, event classes with icons and counts, region select, location search, and reset).
- **Central GIS Map**: Interactive Leaflet canvas with satellite/hybrid/dark modes, class-colored flame/tree/wheat/pickaxe markers, pulsing clusters on critical events, legend, and 300 km scale bar.
- **Right Event Intelligence Panel**: Event #1042 header with prev/next/close, classification badge, risk badge, dual Sentinel-2 & VIIRS thermal footprint thumbnails, classification confidence (94%), risk score (87/100), brightness temperature (341 K), facts table, and acknowledge action.
- **Bottom Analytics**: Donut chart with center total (1,284 Total Events), multi-line timeline chart, and recent alerts card with status and time-ago.
- **Recent Events Table**: Tabular list of events with column sorting, location, classification dot, risk score, confidence, and action buttons.
- **Secondary Pages**:
  - `/map`: Full-bleed live map with opacity sliders, TimeControlBar scrubber, and simulation replay controls.
  - `/events`: Filtered events list with search, sort, and pagination.
  - `/events/:id`: Deep-dive event inspection with 4-thumbnail gallery, facts, and evidence.
  - `/facilities`: Searchable industrial facility registry with event count badges.
  - `/analytics`: 4-chart analytical grid (trend, donut, risk distribution, top states).
  - `/alerts`: Triage alert inbox with status pills and acknowledgment workflow.
  - `/reports`: Executive report generator and downloadable report artifacts.
  - `/settings`: General settings, mode switcher (Demo / Simulation / Live), map controls, and API settings.

### Backend
- **FastAPI Core**: REST endpoints under `/api/v1` for status, metadata, layers, KPIs, events, facilities, alerts, analytics, search, and stream.
- **Spatial Processing**: Haversine distance, KNN nearest facility matching, hazard tier weights.
- **Clustering**: ST-DBSCAN algorithm with 750m spatial radius and temporal linking.
- **Rule Engine**: Deterministic R0-R6 rule cascade for industrial fires, gas flares, wildfires, agricultural burns, and mining activity.
- **Risk Scoring**: 6-component weighted formula (intensity, anomaly, asset criticality, population exposure, escalation, class severity).
- **Simulation**: Virtual clock replay engine with playback controls (start, pause, resume, speed, reset).
- **SSE Stream**: Server-Sent Events delivering real-time status and telemetry.

---

## 3. Quick Start & Execution Commands

### Frontend Development
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python run.py
# Running on http://localhost:8000 (Docs: http://localhost:8000/docs)
```

### Run Automated Tests
```bash
cd backend
python -m pytest tests/test_backend.py -v
```

### Full Docker Compose Deployment
```bash
docker compose up --build
```
