# 🔥 ThermoWatch AI — PS 26162

<div align="center">
  <h3>AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources</h3>
  <p><strong>Smart India Hackathon</strong> · NASA FIRMS + OpenStreetMap + Sentinel-2 Multispectral Analysis</p>

  <p align="center">
    <a href="#features"><img src="https://img.shields.io/badge/Features-Comprehensive-blue?style=for-the-badge" alt="Features"></a>
    <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-Robust-green?style=for-the-badge" alt="Architecture"></a>
    <a href="#quick-start"><img src="https://img.shields.io/badge/Quick%20Start-Ready-orange?style=for-the-badge" alt="Quick Start"></a>
  </p>
</div>

---

## 📸 Dashboard Interface

<p align="center">
  <img src="./dashboard-main.png" alt="ThermoWatch Main Dashboard" width="49%">
  &nbsp;
  <img src="./dashboard-analytics.png" alt="ThermoWatch Analytics Dashboard" width="49%">
</p>

<p align="center">
  <br/>
  <i>Developed for the Smart India Hackathon</i><br/><br/>
  <img src="./sih_logo.png" alt="Smart India Hackathon Logo" width="250"/>
</p>

---

## 📖 Overview

**ThermoWatch AI** is a state-of-the-art intelligent monitoring system designed to address the critical challenge of detecting, classifying, and mitigating industrial fires, agricultural burning, and other persistent thermal anomalies using real-time satellite data. 

By integrating multi-source satellite intelligence (NASA FIRMS, Sentinel-2) with advanced spatial-temporal clustering (ST-DBSCAN) and contextual data (OpenStreetMap), ThermoWatch provides an authoritative, deterministic risk assessment in real-time.

---

## 🏗 System Architecture

ThermoWatch AI employs a highly scalable, decoupled architecture combining a high-performance **FastAPI** Python backend with a reactive **React 18** frontend.

### 🔹 Core Architecture Diagram
```mermaid
graph TD
    A[NASA FIRMS] -->|VIIRS S-NPP / NOAA| B(Ingestion Adapter)
    B --> C{ST-DBSCAN Clustering}
    C -->|750m, 48h Window| D[Spatial-Temporal Events]
    D --> E(Geospatial Context Layer)
    E -.->|OSM, ESA WorldCover| F[Persistence Registry]
    F --> G{Hybrid Classification}
    G -->|Fuzzy Rules + ML| H[Risk Engine]
    H --> I[Alert Rules Engine]
    I --> J((FastAPI Backend))
    J <-->|REST API & SSE| K[React Vite Dashboard]
    
    style A fill:#0d1117,stroke:#58a6ff,stroke-width:2px,color:#c9d1d9
    style J fill:#238636,stroke:#2ea043,stroke-width:2px,color:#ffffff
    style K fill:#1f6feb,stroke:#388bfd,stroke-width:2px,color:#ffffff
```

### 🔹 Risk Evaluation Flowchart
Risk scoring is deterministic and factors in anomaly intensity, human exposure, and proximity to critical industrial assets.

```mermaid
flowchart LR
    A[Thermal Anomaly] --> B[Intensity & Size]
    A --> C[Proximity to Asset]
    A --> D[Population Exposure]
    B --> E{Risk Calculator}
    C --> E
    D --> E
    E --> F[Risk Score 0-100]
    F --> G[Low < 40]
    F --> H[Medium 40-69]
    F --> I[High 70-89]
    F --> J[Critical >= 90]
    
    style J fill:#f85149,stroke:#b62324,color:#ffffff
    style I fill:#d29922,stroke:#bb8009,color:#ffffff
    style H fill:#2ea043,stroke:#238636,color:#ffffff
    style G fill:#3fb950,stroke:#2ea043,color:#ffffff
```

### 🔹 Real-Time Data Pipeline Sequence
```mermaid
sequenceDiagram
    participant S as Satellites (VIIRS)
    participant B as FastAPI Backend
    participant M as Classification & Risk Model
    participant F as React Frontend

    S->>B: Stream Raw Hotspot Data
    B->>B: ST-DBSCAN Spatial Clustering
    B->>M: Request Classification
    M-->>B: Return Event Class & Confidence
    B->>B: Calculate Multi-Factor Risk Score
    B->>F: Server-Sent Events (SSE) Update
    F->>F: Render Alert & Map Marker
```

---

## ✨ Features Implemented

### 🖥 Frontend Application
- **Master Reference Visual Parity**: Dark navy glassmorphism theme (`#050A12`), translucent panels, borders, neon highlights, and custom Inter typography.
- **Header**: Brand mark, nav pills with route indicator, `DEMO DATA` status chip, global search bar (`⌘K`), notification bell with unread badge, and user avatar.
- **Headline KPI Cards**: Total Hotspots, Industrial Events, Persistent Sources, Forest / Wildfire, Agricultural Burning, High Risk Events with SVG sparklines and deltas.
- **Left Rail**: Data Layer toggles with active status + faceted filters (time range, risk levels, event classes, region select).
- **Central GIS Map**: Interactive Leaflet canvas with satellite/hybrid/dark modes, class-colored markers, pulsing clusters on critical events, legend, and 300 km scale bar.
- **Event Intelligence Panel**: Details including dual Sentinel-2 & VIIRS thermal footprint thumbnails, classification confidence (94%), risk score (87/100), brightness temperature, facts table.
- **Bottom Analytics**: Donut chart, multi-line timeline chart, and recent alerts card.
- **Secondary Pages**: 
  - `/map`, `/events`, `/facilities`, `/analytics`, `/alerts`, `/reports`, `/settings`

### ⚙️ Backend Services
- **FastAPI Core**: High-throughput REST endpoints under `/api/v1` for metadata, KPIs, events, facilities, alerts, and streams.
- **Spatial Processing**: Haversine distance calculations, KNN nearest facility matching, hazard tier weights.
- **Clustering**: ST-DBSCAN algorithm with 750m spatial radius and 48h temporal linking.
- **Rule Engine**: Deterministic R0-R6 rule cascade for classifying fire types (industrial, gas flares, wildfires, agricultural burns, mining).
- **Risk Scoring**: 6-component weighted formula (intensity, anomaly, asset criticality, population exposure, escalation, class severity).
- **Simulation**: Virtual clock replay engine with playback controls.
- **SSE Stream**: Server-Sent Events delivering real-time status and telemetry to the client.

---

## 🚀 Quick Start & Execution Commands

### 1. Frontend Development
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 2. Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python run.py
# API running on http://localhost:8000
# Docs available at http://localhost:8000/docs
```

### 3. Run Automated Tests
```bash
cd backend
python -m pytest tests/test_backend.py -v
```

### 4. Full Docker Compose Deployment
Ensure Docker is installed and running, then simply execute:
```bash
docker compose up --build
```
*The application will automatically orchestrate all services, binding the frontend to port 5173 and backend to 8000.*

---

<div align="center">
  <p>Built with ❤️ by Team PS 26162</p>
</div>
