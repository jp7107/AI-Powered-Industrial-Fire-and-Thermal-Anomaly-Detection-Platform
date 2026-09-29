# frontend.md — ThermoWatch AI Frontend Implementation Plan
**Project:** SIH 2026 · PS 26162 — AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources (NASA FIRMS + OSM + Satellite)
**Scope of this file:** frontend only — UI/UX, pages, components, interactions, design system, data integration, folder structure. No code. Backend behaviour lives in `backend.md`.

---

## 0. Ground rules

1. `frontend dashboard demo.png` ("**the reference**") is the **master design template** for every page. Other pages are *variations of the same product*, built from the same tokens and components, never a new template.
2. **Nothing visible in the reference is hardcoded.** Every number, name, coordinate, chart point, alert, thumbnail and legend count comes from the API. The reference defines *structure and style*, not content.
3. The UI must **never call historical/demo/synthetic data "Live"**. The header status chip and provenance badges are driven by `GET /api/v1/status` (see §3).
4. Every component ships with **loading, empty and error** states (skeletons match the final shape).
5. Store the reference at `docs/reference/frontend-dashboard-demo.png` and treat it as a visual-regression baseline (§15).

---

## 1. Reference analysis (what we must reproduce)

### 1.1 Layout map (reference canvas 1672 × 941)

| Region | Approx. geometry | Content |
|---|---|---|
| Header | full width, ~64 px | Brand mark + "ThermoWatch AI" + subtitle · nav tabs (Dashboard active = blue pill; Live Map, Events, Facilities, Analytics, Alerts) · live-data chip with timestamp · global search · bell · avatar |
| Left rail | x 10–270 (~272 px incl. gutter), full height | Card 1 **Data Layers** (8 toggles, collapse icon) · Card 2 **Filters** (Reset link, Date Range, Event Type ×6 with counts, Risk Level ×4 with counts, Facility Type select) |
| KPI row | x 283–1662, ~90 px | 6 equal cards, icon + label + value + delta + sparkline. Card 2 shows a *selected* (blue) state; last card has red alert treatment |
| Map | x 283–1262, ~550 px | Dark hybrid GIS map · zoom ± · locate · cloud/download button · in-map search · Map/Satellite/Hybrid switcher · legend (bottom-left) · minimap + scale bar (bottom-right) · flame/tree/wheat/pickaxe/factory markers and large red clusters |
| Event panel | x 1273–1662, ~390 px | "Event #id" + prev/next/close · class badge + risk badge · place + lat/lon + distance to facility · tabs (Overview / Evidence / Timeline / Analysis) · two image thumbs · metric triplet (Confidence ring, FRP, Temperature) · 9-row facts table · risk-score bar |
| Bottom row | 3 cards ≈ **28 / 34 / 38 %** of the centre+right width | Events by Classification (donut + legend) · Thermal Events Over Time (multi-line + tooltip) · Recent Alerts (severity badge, time-ago, title, subtitle, thumbnail, chevron, "View All") |

**Grid decision:** the reference's event panel is ~17 px taller than the map (mock artefact). We align them into one row. Bottom-row cards use their own 3-column grid (they do *not* align to the map/panel columns — this matches the reference, where Recent Alerts starts left of the event panel).

Desktop app shell = **single-screen layout** (no page scroll on Dashboard at ≥1536 px); left rail, event panel and alert list scroll internally.

### 1.2 Inconsistencies in the reference — decisions

| # | Observation in reference | Decision |
|---|---|---|
| 1 | KPI "Total **Hotspots** 1,284" and donut centre "1,284 Total **Events**" share a number; donut class counts sum to 559 and risk counts to 517 | Three separate, reconciled measures: **Hotspots** (raw satellite detections), **Events** (clustered incidents), **Sources** (persistent registry). Donut segments must sum to *events in current filter*; risk-facet counts must sum to the same number. Tooltips define each. Never copy reference numbers. |
| 2 | "Confidence 94%" | This is **our classification confidence**. FIRMS' own detection confidence (VIIRS is low/nominal/high) is shown separately as a small chip "FIRMS: High". |
| 3 | "Temperature 341 K" | It is satellite **brightness temperature** (VIIRS I-4), not flame temperature. Label "Brightness Temp", tooltip explains; unit toggle K/°C. |
| 4 | Header shows "Live Data · 28 Sep 2026, 10:24 IST" | Chip shows **last successful ingest / data-as-of time**, and its label/colour depends on mode (Live / Simulation / Demo / Stale). |
| 5 | Sentinel-2 caption "28 Sep 2026" | Always show the **actual acquisition date** and cloud %. Sentinel-2 revisit is days, so "latest clear image" may be older than the event. |
| 6 | Filter counts (148, 36, …) | **Faceted counts**: each facet's counts respect all *other* filters but ignore its own selection. |
| 7 | "2 min ago" in alerts | Relative to server `as_of` (not browser clock) so demo/simulation modes stay coherent. |
| 8 | KPI delta colours: ▲ green / ▼ red on most cards | Follow the reference (direction-coded) via config flag `deltaSemantics = "direction" \| "hazard"`; default `direction`. |
| 9 | Base-map country labels/borders | Basemap must use **India-official boundaries** (see §7.3). |

---

## 2. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript + Vite | Fast dev, strict typing |
| Styling | Tailwind CSS driven by CSS-variable design tokens + Radix primitives (shadcn/ui pattern) | Token-first, accessible primitives, easy dark/glass theme |
| Map | **MapLibre GL JS** via `react-map-gl` (+ optional deck.gl overlay for density/heat) | Vector tiles (MVT), clustering, custom sprites, no vendor lock |
| Server state | TanStack Query | Caching, cancellation, invalidation from SSE |
| UI state | Zustand (layers, basemap, panel/rail open, prefs) | Minimal boilerplate |
| URL state | React Router v6 + typed `useSearchParams` helpers | Shareable filters/selection |
| Charts | Recharts (donut, line, bar, sparkline) + small D3 helpers (heatmap, choropleth) | Matches reference chart styles |
| Tables | TanStack Table + react-virtual | Large event lists |
| Icons | lucide-react + custom SVG set (flame, tree, wheat, pickaxe, factory, gas-flare) + map sprite (SDF) | Class icons are part of the identity |
| API typing | OpenAPI → `openapi-typescript` + Zod at boundaries | Contract-first |
| Realtime | SSE (`EventSource`) with polling fallback | One-way updates; simple |
| Tests | Vitest, Testing Library, MSW, Playwright, Storybook | Component, contract, visual fidelity |
| Fonts | Inter (variable), tabular numerals for metrics | Matches reference typography |

---

## 3. Application shell

### 3.1 Routing plan

| Route | Page | Notes |
|---|---|---|
| `/` | Dashboard | Reference layout |
| `/map` | Live / NRT Map | Full-bleed map, same chrome |
| `/events` | Events | Table / cards / split-map |
| `/events/:eventId` | Event Details | Full-page version of event panel |
| `/facilities` · `/facilities/:facilityId` | Facilities | List+map · detail |
| `/analytics` | Analytics | Sectioned tabs (`?section=`) |
| `/alerts` · `/alerts/:alertId` | Alerts | Inbox + detail pane |
| `/about/data` | Data & provenance | Sources, licences, REAL/DEMO/SYNTHETIC/AI legend |
| `/login`, `*` | Auth / 404 | Same dark theme |

**Shared search params** (all list/map pages): `range` (`7d`/custom `from`,`to`), `cls` (comma class keys), `risk`, `fac` (facility type), `region`, `q`, `sel` (selected event id), `tab` (panel tab), `bm` (basemap), `layers`, `view` (`lon,lat,zoom`, debounced), `scope` (`india|view|region`).
**Route rules:** routes are code-split, but the **MapProvider sits above the router** so Dashboard ↔ Live Map transitions reuse the same map instance (no reload, keeps viewport/selection).

### 3.2 Data-mode awareness (global)

`GET /api/v1/status` → `mode` (`live|simulation|demo`), `as_of`, `freshness`, `dataset`, `sim` clock. The store exposes `effectiveNow = status.as_of`; all "Last 7 Days", "x min ago" and chart ranges are computed from it.

| Mode | Header chip | Global banner | Map/list badge |
|---|---|---|---|
| Live (NRT) | green pulsing dot "Live Data · <last ingest IST>" + tooltip: last satellite observation, NRT latency | none | none |
| Live but stale (> 3× expected ingest interval) | amber "Delayed · last update 47 min ago" | dismissible "Data delayed" | — |
| Simulation | violet "Simulation · virtual time <clock> · 60×" + play/pause mini-control (admins) | "Replaying historical observations (not live)" | "SIM" on events |
| Demo | blue "Demo dataset · <period>" | "Demo data — not live" | "DEMO" |
| Backend down | red "Offline" | error banner + retry | — |

**ProvenanceBadge** (used in event panel, table rows, tooltips): `REAL` (real satellite/OSM observation) · `DEMO` (curated historical/demo slice) · `SYNTHETIC` (generated scenario, hatched purple) · `AI` (derived class/risk/confidence, sparkle icon). Every AI-derived number gets an info tooltip listing model/rules version.

---

## 4. Page specifications

### 4.1 Dashboard (`/`) — follows the reference exactly

Component hierarchy:
```
AppShell
├─ AppHeader
│  ├─ BrandMark · PrimaryNav · DataStatusChip · GlobalSearch · NotificationBell · ProfileMenu
├─ ProvenanceBanner (conditional)
├─ LeftRail
│  ├─ DataLayersPanel → LayerToggleRow ×N
│  └─ FiltersPanel → DateRangeSelect · EventTypeFilter · RiskLevelFilter · FacilityTypeSelect · ResetLink
├─ MainColumn
│  ├─ KpiRow → KpiStatCard ×6 → Sparkline
│  ├─ MapRegion
│  │  ├─ GisMap (hotspot layer, facility layer, overlays)
│  │  ├─ MapSearchBox · MapControls · BaseMapSwitcher
│  │  ├─ MapLegend · MiniMap · ScaleBar · MapHoverCard
│  └─ BottomRow
│     ├─ ClassificationDonutCard
│     ├─ ThermalTimelineCard
│     └─ RecentAlertsCard → AlertRow ×N
└─ EventDetailPanel (right column)
   ├─ PanelHeader (prev/next/close) · ClassBadge · RiskBadge · LocationLine
   ├─ Tabs: Overview | Evidence | Timeline | Analysis
   └─ Overview: EvidenceThumbs · MetricTriplet · EventFactsTable · RiskScoreBar
```

Behaviour highlights:
- Filters/date/scope are one `FilterState` shared by KPIs, facets, donut, timeline, map, alerts (single source of truth in URL).
- Selecting a marker/alert/KPI drill-down sets `sel` → panel loads → map flies to the event with padding equal to panel width.
- Empty selection: panel shows **"Select an event on the map"** placeholder (with the highest-risk event offered as a shortcut chip).
- KPI cards are **clickable filters** (selected = blue border/gradient as on the reference's "Industrial Events").

### 4.2 Live / NRT Map (`/map`)
Same header, left rail (collapsible to an icon rail) and event panel; KPI row and bottom charts removed. Adds:
- **TimeControlBar** (bottom, glass): 24 h / 72 h / 7 d scrubber over `acq_datetime`; play/pause replays hotspot appearance; "Follow live" toggle (auto-focus new critical events, off by default); in Simulation mode it displays the virtual clock.
- **Latest overpass ticker**: last observation time per satellite (from `/status`).
- **Draw AOI / Measure** tools → AOI summary card (counts by class, max risk, list) via `/events?geometry=`.
- Layer opacity sliders, coordinate readout, export (PNG snapshot of map view, GeoJSON of visible events).
- Same legend/minimap/scale bar/basemap switcher as dashboard.

### 4.3 Events (`/events`)
- **EventFilterBar**: same `FiltersPanel` in a slide-in drawer + active-filter chips + search.
- **Views:** Table (default) · Cards · Split (table + map).
- **Columns:** ID · Class badge · Risk bar/score · Confidence · Place (district, state) · Nearest facility (name, distance) · Peak FRP · Brightness temp · Persistence · First/Last detected · Status · Provenance. Column chooser, sortable, virtualised, saved views (URL).
- Row click → EventDetailPanel drawer; "Open" / double-click → `/events/:id`; `j/k` keyboard navigation; export CSV/GeoJSON.

### 4.4 Event Details (`/events/:eventId`)
12-col grid:
- Header strip: `Event #id`, class badge, risk badge, provenance, place, coords, actions (Acknowledge, Mark false positive / correct class, Export report PDF, Copy link).
- Left (8 cols): large map (footprints, facility polygon, buffers) · **ImageryCompare** (True-colour / SWIR / Thermal footprints; before/after slider between latest clear Sentinel-2 scenes) · **FrpTimeSeries** with facility baseline band.
- Right (4 cols): Metric triplet, facts table, risk score with **component breakdown**.
- Tabs below: Evidence · Timeline · Analysis · Alerts · Similar events (same facility/region).

### 4.5 Facilities (`/facilities`, `/facilities/:id`)
- List + map split; filters: type, state, operator, hazard tier, "has active events", search.
- **FacilityCard**: type icon, name, operator, area, hazard tier, thermal baseline (median/p90 FRP, % days detected), active events, last anomaly.
- **Facility detail:** polygon map with detection footprints, **BaselineChart** (90-day FRP with normal band and anomalies), event history table, linked persistent thermal sources, OSM link + "OSM coverage may be incomplete" note.

### 4.6 Analytics (`/analytics?section=`)
Global filter bar + sections:
1. **Overview** — KPI row, classification distribution, timeline (hour/day/week toggle).
2. **Regions** — state/district choropleth (events or risk-weighted), ranked table.
3. **Facilities** — top facilities by anomalous events, persistent-source leaderboard.
4. **Patterns** — hour-of-day × day heatmap (agricultural afternoon peak vs 24 h flares), seasonality by class, FRP distribution by class.
5. **Model & Data Quality** — confusion matrix / per-class precision-recall (only if a validation set exists), data-origin breakdown (REAL/DEMO/SYNTHETIC), ingest freshness, class-probability calibration.
Every chart: export PNG/CSV, "how is this computed?" tooltip.

### 4.6b Alerts (`/alerts`)
- **Inbox** (left): filters (severity, type, status: new/acknowledged/resolved/false-positive, date), list of `AlertRow`s (same visual as dashboard Recent Alerts, larger).
- **Detail pane** (right): mini-map, event summary, evidence highlights, actions (Acknowledge, Resolve, Mark false positive, Open event), alert history.
- **Rules & subscriptions** modal: read-only thresholds (admin can edit), channel toggles (in-app, browser push; email/webhook if enabled).

---

## 5. Component specifications
Format: **Purpose · UI · Data · API · Backend field · Interaction · States**. API paths are under `/api/v1`. Field names follow the contracts in `backend.md §14`.

### 5.1 Shell

**S1 AppHeader / PrimaryNav**
- Purpose: branding + navigation. UI: logo mark (flame ring), "ThermoWatch AI", subtitle "Industrial Fire & Thermal Source Intelligence", nav pills with icons; active = filled blue pill; Alerts tab shows unread badge.
- Data: unread count. API: `GET /alerts/unread-count`. Backend field: `alerts.status='new'` count.
- Interaction: route navigation preserving shared search params; keyboard focus ring.
- States: badge hidden on error; nav never blocks.

**S2 DataStatusChip**
- Purpose: honest data-mode + freshness. UI: dot + label + IST timestamp; tooltip with last ingest, last observation, latency, dataset name.
- Data: `mode, as_of, freshness.{last_ingest_at,last_observation_at,state}, dataset, sim`. API: `GET /status` (poll 30 s + SSE `status.changed`). Backend: `datasets`, `ingest_runs.finished_at`, `sim_runs.clock`.
- Interaction: click → popover with mode details; admin sees mode/sim controls (`POST /admin/mode`, `/admin/sim/*`).
- States: loading → grey "Connecting…"; error → red "Offline"; stale → amber.

**S3 GlobalSearch**
- Purpose: find places, facilities, events. UI: pill input "Search location, facility, event…", `/` or `⌘K` focus, grouped dropdown (Places · Facilities · Events) with icons.
- Data: `{places[], facilities[], events[]}` each with id, name, type, lat/lon, admin path. API: `GET /search?q=&limit=` (debounce 250 ms, cancel in flight). Backend: `facilities.name`, `events.place_name`, gazetteer table `places`.
- Interaction: ↑↓ Enter; place → fly map to bbox; facility → `/facilities/:id` or select on map; event → set `sel`. Recent searches in localStorage.
- States: skeleton rows; "No matches — try a district or facility name"; error row with retry.

**S4 NotificationBell / ToastHost**
- Purpose: surface new alerts. UI: bell + count; dropdown of 5 latest `AlertRow`s + "View all". Toasts for SSE `alert.created` (critical persists until dismissed; others 6 s).
- Data: alert summary. API: `GET /alerts?status=new&limit=5`, SSE `alert.created`. Backend: `alerts`.
- Interaction: click item → `sel` + fly-to; "Mark all read" (`PATCH /alerts/bulk`); optional browser Notification for critical (opt-in).
- States: empty "You're all caught up"; error → toast "Live alerts unavailable, retrying".

**S5 ProfileMenu** — avatar (initials), menu: profile, preferences (timezone IST/UTC, temperature unit K/°C, delta semantics), mode (admin), sign out. API: `GET /me`. Backend: `users`. States: skeleton avatar.

### 5.2 Left rail

**D1 DataLayersPanel / LayerToggleRow**
- Purpose: control map overlays. UI: card titled "Data Layers" with collapse chevron; rows = coloured icon + name + toggle (blue when on). Layers: FIRMS Thermal Hotspots · Industrial Facilities · Land Cover (ESA) · Administrative Boundaries · Satellite Imagery (Sentinel-2) · Risk Zones · Population Density · Weather Overlay.
- Data: layer catalog `{key,label,type,tile_url|source,default_on,available,attribution,legend,opacity}`. API: `GET /layers`. Backend: layer registry (config + tile services). Defaults come from catalog, user overrides in localStorage.
- Interaction: toggle → show/hide MapLibre layer (no refetch of the page); long-press/⋯ → opacity slider; unavailable layers rendered disabled with "Not available in this deployment" tooltip.
- States: skeleton rows; catalog error → fallback to built-in layer list with warning icon.

**D2 FiltersPanel** (parent; Reset link resets to defaults)
- Common: filter changes update URL (debounced 150 ms) → refetch KPI/facets/charts/tiles; previous data kept visible (`keepPreviousData`) with subtle top-progress bar.
- **D2a DateRangeSelect** — "Last 7 Days" select with presets (24 h, 3 d, 7 d, 30 d, season, custom range popover with calendar). Data: preset → `from/to` computed against `effectiveNow`. API: none (params on other calls); presets list in `/status.dataset` bounds (min/max selectable). In Demo/Sim, range limited to dataset period.
- **D2b EventTypeFilter** — 6 checkboxes with class icon, coloured box, label, **faceted count**. API: `GET /events/facets?…` → `{event_class:{key:count}}`. Backend: `events.event_class` GROUP BY. Interaction: click toggles; Alt-click = "only this"; select-all via header. States: count skeleton; 0-count rows dimmed but selectable.
- **D2c RiskLevelFilter** — Critical/High/Medium/Low with dot + count. Backend: `events.risk_level`.
- **D2d FacilityTypeSelect** — dropdown "All Types" + list (Refinery, Petrochemical, Power plant, Steel, Cement, Mining/Quarry, LNG/Gas terminal, Chemical, Other industrial). API: `GET /facilities/facets`. Backend: `facilities.facility_type`. Filter means "events whose nearest facility is of type X within N m".
- Empty result state anywhere: "No events match these filters" + **Reset filters** button.

### 5.3 KPI row

**D3 KpiStatCard (×6) + Sparkline**
- Purpose: headline metrics with trend. UI: coloured icon tile, label, big tabular number, delta chip (▲/▼ %), sparkline (area under line), small caption "(Last N days)" on first card; accent colour per class; selected/hover/focus states.
- Cards & meaning: Total Hotspots (raw detections) · Industrial Events · Persistent Sources (distinct sources) · Forest Fires · Agricultural Burns · High Risk Events (Critical+High or Critical only — set by config `highRiskDefinition`, shown in tooltip).
- Data: `key,label,value,previous_value,delta_pct,spark[{t,v}]`. API: `GET /kpis?from&to&cls&risk&fac&scope`. Backend: `mv_kpi_daily` / live aggregation of `firms_detections` and `events`; delta vs previous equal-length period.
- Interaction: hover tooltip (definition, prev period value); click → applies matching filter (Industrial Events → `cls=industrial_fire`, High Risk → `risk=critical,high`), click again clears; keyboard Enter.
- States: skeleton number+sparkline; empty → "0" with flat line + "No data in range"; error → "—" with retry icon; delta hidden when previous = 0 (shows "new").

### 5.4 Map

**D4 GisMap (container)**
- Purpose: central GIS canvas. UI: MapLibre canvas + overlay slots; rounded panel with 1 px border; attribution control (OSM, NASA FIRMS, Copernicus/ESA, basemap providers).
- Data: layer sources listed below. API: MVT `GET /tiles/hotspots/{z}/{x}/{y}.mvt`, `/tiles/facilities/…`, `/tiles/risk_zones/…`, `/tiles/admin/…`; GeoJSON `GET /events/map?bbox&…`; raster tiles for land cover/pop from `/layers` catalog.
- Interaction: pan/zoom (viewport → URL), click marker → select, hover → card, double-click zoom, right-click → "Copy coordinates / Nearby facilities", keyboard arrows/±.
- States: tile skeleton (dark grid), "Map failed to load" with retry + basemap fallback; partial layer failure shows layer-level warning icon in D1.

**D5 MapControls** — zoom ±, locate (fit India / geolocate), download/cloud button (export view: PNG snapshot, GeoJSON of visible events; "Download data" opens export menu). API for export: `GET /export/events?format=geojson&bbox&…`. States: disabled while exporting; error toast.

**D6 MapSearchBox** — in-map search identical to global search but scoped to map; result selection flies the map. Same API as S3.

**D7 BaseMapSwitcher** — segmented control Map · Satellite · Hybrid (active = filled blue). Data: basemap styles from `/layers` catalog (`basemaps[]`). Persisted in `bm` + localStorage. Fallback provider on tile errors.

**D8 HotspotLayer (events + clusters)**
- Purpose: show classified events as class-coloured icon markers; cluster dense areas.
- UI: circular marker with class icon + glow; size scaled by risk/FRP bucket; critical = pulsing ring; **cluster bubble** = count, ring colour of highest-risk member, red gradient for critical; declusters progressively (≈ zoom 9+). Selected marker = larger with white ring + animated pulse.
- Data (per feature): `id, event_class, risk_level, risk_score, peak_frp_mw, lat, lon, last_detected_at, place_name, data_origin`. API: `GET /events/map` (GeoJSON, ≤ 50 k features; above that server returns grid aggregates flagged `aggregated:true`). Raw detections layer (`hotspots`, small dots) from MVT at zoom ≥ 7 when "FIRMS Thermal Hotspots" toggle is on.
- Interaction: hover (card), click (select), shift-click cluster → zoom to expansion; legend items click → toggle class.
- States: initial loading shimmer "Loading events…" chip; empty "No events in this view" chip (with Reset); error chip with retry.

**D9 FacilityLayer** — blue rounded-square markers with factory icon (points at low zoom, polygon outlines at zoom ≥ 12); MVT from `/tiles/facilities`. Properties: `id,name,facility_type,hazard_tier`. Click → mini popup (name, type, active events) + "Open facility". Hidden when toggle off. States: layer-warning icon on tile errors.

**D10 MapLegend** — bottom-left glass card listing 6 classes + Industrial Facility with icons; **clickable to toggle class**; collapsible; counts optional (from facets). Data: class metadata from `/meta/classes` (labels, colours, icons) so UI colours are server-driven-with-local-fallback.

**D11 MiniMap + ScaleBar** — overview map bottom-right (India extent, viewport rectangle, click/drag to pan); scale bar (km) auto-updates. Local only, no API.

**D12 MapHoverCard** — compact glass tooltip: class badge, place, risk score, FRP, "x h ago", provenance. Data from feature properties (no request); on 400 ms hover-intent prefetches `/events/{id}` for instant panel open.

### 5.5 Event intelligence panel

**D13 EventDetailPanel (container)**
- Purpose: drill-down for the selected event. UI: glass card ~390 px; header "Event #id", ◀ ▶ (previous/next in current filtered/sorted result set), ✕ close; badge row; location line; tab bar (active tab = filled pill); scrollable body.
- Data: `EventDetail` (see backend contract). API: `GET /events/{id}` (+ tab-lazy calls). Backend: `events` + joins (`facilities`, `event_evidence`, `imagery_assets`).
- Interaction: ◀▶ steps through `/events` ordering (default: risk desc); Esc closes; URL `sel` + `tab`; on mobile becomes bottom sheet (snap 30/60/95 %).
- States: skeleton mirroring layout; 404 → "Event no longer available (merged or closed)" with link to merged event (`merged_into`); error → retry.

**D13a Header block** — `ClassBadge` (solid class colour: INDUSTRIAL FIRE etc.), `RiskBadge` (outline: CRITICAL RISK etc.), `ProvenanceBadge`, place name (`place_name`), coordinates (`centroid.lat/lon`, copy on click), "320 m from facility" (`nearest_facility.distance_m`, click → facility). Backend fields: `event_class, risk_level, place_name, centroid, nearest_facility_dist_m`.

**D14 EvidenceThumbs** — left: **thermal footprint mini-map** (frontend-rendered MapLibre mini map with 375 m detection footprints coloured by FRP over the satellite basemap; no backend image needed); right: **Sentinel-2 chip** with caption "Satellite View (Sentinel-2) · <acquisition date> · cloud %". Click → lightbox with True-colour/SWIR toggle. API: `GET /events/{id}/imagery` → `assets[{kind,url,acquired_at,cloud_pct,bbox,status}]`; footprints from `GET /events/{id}/detections`. Backend: `imagery_assets`, `firms_detections` via `event_detections`. States: `status=pending` → shimmer + "Fetching imagery…"; `no_clear_scene` → placeholder "No clear Sentinel-2 image in last N days" with last-cloudy option; error → placeholder + retry.

**D15 MetricTriplet** — Confidence ring (`class_confidence` %, check icon, colour by band), FRP (`peak_frp_mw` MW with flame icon), Brightness Temp (`max_brightness_k` K, thermometer). Extra micro-caption: "FIRMS: High" (`detection_confidence`). Tooltips explain each metric. States: skeleton circles; "—" when null.

**D16 EventFactsTable** — key/value rows with thin dividers: Nearest Facility (`nearest_facility.name (distance)`), Event Type (`event_class` label), First Detected, Last Detected (IST, `first_detected_at`, `last_detected_at`), Persistence ("6 days (18 detections)" ← `persistence_days`, `detection_count`), Affected Area (est.) (`affected_area_km2`), Nearby Population (`population_5km`, "within 5 km"), Risk Score (D17). Values with provenance (AI/REAL) info icons. Copy-on-click for coordinates/timestamps. Null → "Unknown".

**D17 RiskScoreBar** — gradient bar with score "87 / 100"; hover/click expands **risk components** (intensity, anomaly, asset criticality, population exposure, escalation, class severity) from `risk_components`. Colour by `risk_level`.

**D18a EvidenceTab** — (a) **Why this class?**: ordered evidence rows (icon, plain-language text, signed contribution bar, source tag REAL/AI); (b) **Rule trace** (which rules fired + support); (c) **Context**: land-cover donut within 1 km, facility card, forest/farmland distances; (d) **Detections table** (satellite, time, FRP, FIRMS confidence). API: `GET /events/{id}/evidence`, `/detections`. Backend: `event_evidence`, `event_features`, `firms_detections`. States: skeleton bars; empty "No evidence recorded"; error retry.

**D18b TimelineTab** — vertical timeline: overpass detections (satellite icon, FRP), class/risk changes, alerts fired, imagery acquisitions; mini FRP sparkline on top. API: `GET /events/{id}/timeline`. Backend: `event_timeline`. Live-appends via SSE `event.updated`.

**D18c AnalysisTab** — class-probability bars (6 classes), risk-component stacked bar, **facility baseline comparison** ("FRP 3.4× 90-day baseline"), similar past events, model/rules versions, data-quality flags, **feedback** control ("Correct class?" → `POST /events/{id}/feedback`). API: `GET /events/{id}/analysis`. Backend: `events.class_probs`, `risk_components`, `thermal_sources` baseline, `labels`.

### 5.6 Bottom row

**D19 ClassificationDonutCard**
- Purpose: distribution of events by class. UI: donut with centre total ("Total Events"), legend rows (coloured dot, label, count, % of total).
- Data: `{total, items:[{event_class,count,pct}]}`. API: `GET /analytics/classification?…filters`. Backend: `events` GROUP BY `event_class` (materialised view for common ranges).
- Interaction: hover segment highlights legend + tooltip; click segment/legend row toggles class filter; keyboard accessible.
- States: skeleton ring; empty → grey ring "No events"; error → card-level retry.

**D20 ThermalTimelineCard**
- Purpose: temporal trend by class. UI: multi-line chart (Industrial, Persistent, Wildfire, Agriculture; Mining/Other togglable), legend at top-right, y-grid, crosshair + tooltip listing per-series values for hovered date; incomplete latest bucket drawn dashed.
- Data: `{interval, series:[{event_class, points:[{t,count}]}]}`. API: `GET /analytics/timeseries?interval=auto|hour|day&…`. Backend: `events`/`mv_events_by_class_day`, bucketed by `first_detected_at` in IST. Interval auto = hourly when range ≤ 48 h.
- Interaction: legend click toggles series; drag-select range → zooms date range filter (optional); tooltip follows pointer.
- States: skeleton axes + shimmering line; empty "No events in range"; error retry.

**D21 RecentAlertsCard / AlertRow**
- Purpose: newest alerts, one-click drill-down. UI: rows: class icon · severity badge (CRITICAL red / HIGH orange / MEDIUM amber / LOW teal) · time-ago · title · subtitle (facility/place) · thumbnail · chevron; header link "View All →".
- Data: `alert_id,severity,alert_type,title,subtitle,created_at,event_id,thumbnail_url`. API: `GET /alerts?limit=4&sort=-created_at` + SSE `alert.created` (new row slides in, 300 ms highlight). Backend: `alerts` (+ `imagery_assets` thumbnail).
- Interaction: click row → select event (`sel`) and fly-to; hover shows chevron/brighter row; "View All" → `/alerts`.
- States: skeleton rows; empty "No alerts in this period" with green shield icon; error retry.

---

## 6. Other-page components (same 7-field logic, condensed)

| Component | Purpose · UI | API → backend field | Interaction | States |
|---|---|---|---|---|
| **E1 EventsTable** | Virtualised table with class badge, risk bar, provenance | `GET /events?cursor&sort&…` → `events.*` | sort, resize, column chooser, row select, export | skeleton rows / "No events match" / error banner |
| **E2 SavedViews** | Named filter presets | localStorage (later `/me/views`) | apply/save/delete | empty "No saved views" |
| **ED1 ImageryCompare** | True-colour ↔ SWIR ↔ footprints; before/after slider | `/events/{id}/imagery` → `imagery_assets` | drag slider, layer tabs, zoom | pending shimmer / "No clear scene" / error |
| **ED2 FrpTimeSeries** | FRP per overpass + facility baseline band | `/events/{id}/detections`, `/facilities/{fid}/baseline` → `firms_detections.frp`, `thermal_sources.p90_frp` | hover crosshair | empty "single detection" |
| **ED3 ExplainabilityChart** | Signed contribution bars (rules/SHAP) | `/events/{id}/evidence` → `event_evidence.contribution` | hover explains source | empty / error |
| **ED4 EventActionBar** | Ack, false-positive, class correction, report | `PATCH /events/{id}`, `POST /events/{id}/feedback`, `GET /events/{id}/report.pdf` → `labels`, `events.status` | optimistic update + undo toast | disabled without role |
| **F1 FacilityList/Map** | Facility browse | `GET /facilities` → `facilities.*` + counts | filter, select, fly-to | skeleton / empty / error |
| **F2 BaselineChart** | 90-day FRP baseline + anomalies | `GET /facilities/{id}/baseline` → `thermal_sources` stats | range toggle 30/90/365 | "Insufficient history" empty state |
| **A1 RegionChoropleth** | State/district counts or risk | `GET /analytics/regions?level=` → `events.state/district` | hover, click → filter region | skeleton / empty |
| **A2 HourDayHeatmap** | Detection hour × weekday/date | `GET /analytics/heatmap` → `firms_detections.acq_datetime` | hover cell | skeleton |
| **A3 TopFacilities** | Ranked bars | `GET /analytics/facilities-top` | click → facility | empty |
| **A4 FrpHistogram** | FRP distribution per class | `GET /analytics/frp-distribution` | class toggles | skeleton |
| **A5 ModelPerformance** | Confusion matrix, P/R/F1 | `GET /analytics/model-performance` → `model_evaluations` | class hover | **empty: "No validation set registered"** |
| **A6 DataQuality** | Origin mix, freshness, ingest history | `GET /analytics/data-quality` → `ingest_runs`, `data_origin` | — | error retry |
| **L1 AlertsInbox / L2 DetailPane** | Triage workflow | `GET /alerts`, `PATCH /alerts/{id}` → `alerts.*` | ack/resolve/false-positive, bulk | empty "Inbox zero" |
| **L3 AlertRules** | Threshold viewer/editor | `GET/PUT /alert-rules` → `alert_rules` | admin edit | read-only for viewers |
| **LM1 TimeControlBar** | Playback/scrub on Live Map | uses `/events/map?from&to`, `/tiles/hotspots?…time` | play/pause/step/speed | disabled if range empty |
| **LM2 DrawAOI/Measure** | AOI summary | `GET /events?geometry=` | draw/edit/clear | "Draw an area" hint |

---

## 7. Map engineering

### 7.1 Layers and order (bottom → top)
1 Basemap (Map/Satellite/Hybrid) → 2 Land cover (raster) → 3 Population density (raster) → 4 Sentinel-2 imagery overlay (raster; zoom ≥ 10, event-focused) → 5 Weather overlay (raster; optional/phase 2) → 6 Admin boundaries (vector lines) → 7 Risk zones (vector polygons, translucent red/orange) → 8 Industrial facilities → 9 Raw FIRMS hotspots (dots, zoom ≥ 7) → 10 Classified events (icons/clusters) → 11 Selection halo & hover.

### 7.2 Clustering & performance
- Events use a MapLibre **GeoJSON source with `cluster: true`** and `clusterProperties` (max risk rank, counts per class) so cluster colour/label are computed client-side. Cluster radius ≈ 50 px, `clusterMaxZoom` ≈ 9.
- If `/events/map` returns `aggregated:true` (too many events) render server grid cells as circles sized by count until zoom in.
- Facilities and raw hotspots are **vector tiles** (never loaded as bulk GeoJSON).
- Filters passed to tile/GeoJSON URLs; filter-hash in URL forces new tiles; debounce viewport-driven fetches (300 ms), abort stale requests.
- Sprite atlas (SDF icons) for class markers; feature-state for hover/selection; targets 60 fps at ≤ 20 k visible features.

### 7.3 Basemaps & compliance
- **Map** (dark vector style, self-hosted or licensed provider), **Satellite** (raster imagery provider), **Hybrid** (satellite + vector labels/boundaries). Providers finalized in Phase 0 after checking licence/attribution terms; keep a second fallback provider.
- India-official external boundary and labels: use a boundary overlay that follows Survey of India depiction, drawn above the basemap; keep OSM ODbL attribution ("© OpenStreetMap contributors") and other required attributions visible.

### 7.4 Interaction rules
- Selecting an event: `flyTo` (zoom ≥ 11 for industrial/persistent, ≥ 9 for wildfire/agri) with right padding = panel width; pulsing halo; URL `sel`.
- Prev/next in the panel move within current filtered ordering and fly the map.
- Hover: cursor pointer, marker scale 1.15, hover card; touch: tap = select (no hover).
- Layer toggles never reset viewport or selection.

---

## 8. Data states, notifications & real-time behaviour

### 8.1 Global patterns
| State | Pattern |
|---|---|
| Loading | Skeleton shaped like final content (shimmer 1.4 s), never spinners over whole page; top progress bar for background refetch |
| Empty | Icon + one sentence + primary action (Reset filters / Widen range) |
| Error | Widget-level card: message, correlation id (`X-Request-Id`), Retry; page-level error boundary only for shell failures |
| Offline | Sticky banner; cached data stays readable (TanStack persisted cache, read-only) |
| Rate limited (429) | Banner with countdown, automatic backoff |
| Auth (401/403) | Redirect to login / "insufficient permission" placeholder |

### 8.2 Real-time / NRT refresh
- **SSE** `GET /api/v1/stream` with events: `event.created`, `event.updated`, `alert.created`, `ingest.completed`, `status.changed`. Client invalidates only affected query keys (KPIs, facets, timeline, alerts, map source) and shows a **"12 new events · Refresh"** pill instead of forcibly moving the map.
- Polling fallback: `/status` every 30 s, KPIs/charts every 60 s, map every 60 s (paused when tab hidden; resumed with immediate refetch).
- "Updated 2 min ago" text in the chip ticks locally from `last_ingest_at`.
- In **Simulation** mode the same SSE events arrive at simulated pace, and the chip shows virtual time; in **Demo** mode no SSE updates (static dataset).
- Reconnect with `Last-Event-ID`; exponential backoff.

### 8.3 Notification rules
Critical alert → persistent toast + bell badge (+ optional browser notification). High → toast 6 s. Medium/Low → bell only. Deduped by `alert_id`; muted alerts respect user prefs.

---

## 9. State management

| Layer | Holds | Tool |
|---|---|---|
| URL | filters, range, scope, selected event, tab, basemap, layers, viewport | Router search params (schema-validated with Zod; invalid params dropped) |
| Server cache | status, KPIs, facets, events, detail, analytics, alerts | TanStack Query; key = `[resource, filterHash, params]`; `staleTime`: status 15 s, KPIs 30 s, event detail 60 s, layers 1 h |
| UI store | rail collapsed, layer opacity, panel size, toasts queue, prefs (units/timezone) | Zustand (+ persist) |
| Map instance | viewport, feature-state (hover/selected) | MapLibre ref in MapProvider |

Flow: `FilterState` → URL → query keys → KPI/facets/charts/map. Prev/next selection uses the ordered id list cached from the latest `/events` query.

---

## 10. API integration approach
- Generated typed client from OpenAPI; single `apiFetch` wrapper: base URL, credentials, `AbortSignal`, JSON/problem+json parsing, request-id header, retry (2×, exponential+jitter, only network/5xx/429 with `Retry-After`).
- Every list response is `{items, next_cursor, total?, as_of}`; every aggregate response includes `as_of` and `data_origin_summary` so the UI can show provenance.
- Timestamps: ISO-8601 UTC from API; formatted to IST client-side (toggle UTC).
- Enum metadata (class labels, colours, icons, risk thresholds) from `GET /meta/classes` and `/meta/risk-levels` with bundled fallback so the UI style never depends on a network call.
- **No hardcoded content**: Storybook/tests use MSW fixtures generated from OpenAPI examples; production code contains no sample events.
- Errors mapped to user messages by `code` (e.g., `RANGE_OUT_OF_DATASET`, `TILE_UNAVAILABLE`).

---

## 11. Responsive behaviour

| Breakpoint | Layout |
|---|---|
| ≥ 1536 px (reference) | Full layout as §1.1 |
| 1280–1535 | Left rail 240 px; KPI sparklines shrink; event panel 360 px |
| 1024–1279 | Left rail → 56 px icon rail with flyout panels; event panel overlays map (slide-over); KPI row 3×2; bottom row 2 columns + alerts full-width |
| 768–1023 (tablet) | Nav collapses to icon+label compact tabs; rail = drawer (☰ Filters/Layers); event panel = right drawer 60 %; charts stack 2-up |
| < 768 (mobile) | Bottom tab bar (Dashboard, Map, Events, Alerts, More); header shows brand + status dot + search icon; KPIs horizontal snap carousel; map full-height with **bottom sheets** (Filters, Layers, Event details with snap points); charts stacked; tables → cards; touch-sized targets ≥ 44 px |

MapLibre `resize()` on layout changes; hover-only affordances have tap equivalents; reduced-motion respected.

---

## 12. Design system (derived from the reference)

> Initial values are **estimates from the reference**; Phase 0 finalises them by sampling the PNG and freezes them in `design-tokens.json` (single source of truth for Tailwind + CSS variables + chart theme + map style).

### 12.1 Colour tokens
| Token | Role | Est. value |
|---|---|---|
| `bg.app` | page background | `#050A12` |
| `bg.panel` | glass panel fill | `rgba(11,19,32,0.82)` + `backdrop-blur 12px` |
| `bg.panelRaised` | inner rows/hover | `rgba(255,255,255,0.04)` |
| `border.subtle` | 1 px panel border | `rgba(255,255,255,0.08)` |
| `text.primary / muted / faint` | text | `#E8EDF5 / #8B98AB / #5F6B7E` |
| `accent.blue` | active nav, toggles, selected | `#2F7BFF` |
| `class.industrial` | Industrial Fire | `#FF3B47` (red) |
| `class.flare` | Gas Flare / Persistent | `#FF8A1F` (orange) |
| `class.wildfire` | Wildfire (Forest) | `#22C55E` (green) |
| `class.agri` | Agricultural Burning | `#F5B82E` (amber) |
| `class.mining` | Mining Activity | `#A855F7` (purple) |
| `class.other` | Other Thermal | `#B8C0CC` (grey) |
| `facility` | Industrial Facility | `#3B82F6` |
| `risk.critical/high/medium/low` | badges/bars | `#EF3340 / #FF8A1F / #F5B82E / #22B8CF` |
| `status.live/stale/sim/demo` | data-mode chip | green `#22C55E` / amber / violet `#8B5CF6` / blue |

Card tinting: each KPI card uses its class colour at ~8–12 % gradient on the left/top and a matching sparkline stroke.

### 12.2 Typography
Inter; scale: KPI value 30/600 tabular; card title 15–16/600; label 12–13/500 muted; table 13/400; badges 11/700 uppercase with letter-spacing 0.04em; brand 22/700. Numerals use `font-variant-numeric: tabular-nums`.

### 12.3 Shape, spacing, elevation
8-pt grid; panel gap 12; panel padding 16; radius 12 (panels), 8 (inputs, rows), 999 (pills/badges); shadow: soft outer glow on selected/critical (`0 0 0 1px accent, 0 0 24px accent/25%`). z-index scale: map 0 · overlays 10 · panels 20 · header 30 · popovers 40 · toasts 50.

### 12.4 Component states
| State | Treatment |
|---|---|
| Hover | +4 % white fill, border → `rgba(255,255,255,0.16)`, cursor pointer |
| Active/selected | accent border + tinted gradient (e.g., selected KPI card, active nav pill, active tab, active basemap segment) |
| Focus | 2 px accent ring, offset 2 px (keyboard only) |
| Disabled | 40 % opacity, no pointer events, tooltip explains why |
| Critical | red border/glow; pulse 2 s on map markers and unread badge (disabled under `prefers-reduced-motion`) |

### 12.5 Core primitives
`Panel/GlassCard`, `Badge` (class solid, risk outline, provenance), `Toggle` (blue on), `Checkbox` (class-coloured), `Select`, `SegmentedControl`, `Tabs` (pill), `Button` (primary blue, ghost, danger), `IconButton`, `Tooltip`, `Popover`, `Skeleton`, `ProgressBar` (risk gradient), `RingGauge`, `KeyValueTable`, `Sparkline`, `EmptyState`, `ErrorState`, `Toast`, `Drawer/BottomSheet`, `Lightbox`.

### 12.6 Map styling
Dark basemap with muted labels; boundaries `rgba(255,255,255,0.35)`; markers = filled circle in class colour + white glyph + 1 px dark outline + soft glow; facilities = blue rounded square + factory glyph; clusters = gradient bubble (size steps 24/32/40/52 px); legend and minimap use the same glass card style.

### 12.7 Accessibility
WCAG AA contrast on all text; class is never colour-only (glyph shape differs per class); full keyboard support (map arrows, panel tabs, table nav); ARIA live region for new alerts; `aria-label`s on map controls; focus trap in modals; reduced-motion mode.

---

## 13. Frontend folder structure

```
frontend/
├─ public/                      # favicon, static sprites
├─ docs/reference/frontend-dashboard-demo.png
├─ design/design-tokens.json    # colours, type, spacing (source of truth)
├─ src/
│  ├─ app/                      # main.tsx, App.tsx, providers (Query, Map, Theme, Auth), router.tsx
│  ├─ routes/                   # one folder per page
│  │  ├─ dashboard/ ├─ live-map/ ├─ events/ ├─ event-detail/
│  │  ├─ facilities/ ├─ analytics/ ├─ alerts/ ├─ about-data/ └─ auth/
│  ├─ features/                 # domain slices (UI + hooks + queries)
│  │  ├─ status/  ├─ filters/  ├─ layers/  ├─ kpis/  ├─ map/
│  │  │   ├─ layers/ (events, hotspots, facilities, overlays) ├─ controls/ ├─ legend/ ├─ minimap/
│  │  ├─ event-panel/ (tabs, thumbs, metrics, facts, risk)
│  │  ├─ charts/ (donut, timeline, sparkline, heatmap, choropleth)
│  │  ├─ alerts/  ├─ search/  ├─ facilities/  └─ analytics/
│  ├─ components/ui/            # primitives (Panel, Badge, Toggle, Tabs, Skeleton…)
│  ├─ components/feedback/      # EmptyState, ErrorState, ProvenanceBadge, DataStatusChip
│  ├─ lib/
│  │  ├─ api/ (client, generated types, zod schemas, error mapping)
│  │  ├─ realtime/ (SSE client, invalidation map)
│  │  ├─ format/ (IST/UTC dates, units, numbers)
│  │  ├─ geo/ (bbox, fly-to helpers)
│  │  └─ url-state/ (typed search-param codec)
│  ├─ stores/                   # Zustand (ui, prefs)
│  ├─ styles/                   # tailwind.css, tokens.css, map-style.json
│  ├─ assets/icons/             # class icons, sprite source
│  └─ tests/ (msw handlers, fixtures from OpenAPI, e2e/)
├─ .storybook/
├─ playwright.config.ts · vite.config.ts · tailwind.config.ts · package.json
```

---

## 14. Reusable component inventory
Layout: `AppShell`, `LeftRail`, `RightPanel`, `BottomSheet`, `Grid12`. Cards: `KpiStatCard`, `ChartCard`, `AlertRow`, `FacilityCard`, `EventCard`. Data display: `ClassBadge`, `RiskBadge`, `ProvenanceBadge`, `MetricStat`, `RingGauge`, `RiskScoreBar`, `KeyValueTable`, `Sparkline`, `DonutChart`, `LineChartMulti`, `Heatmap`, `Choropleth`. Map: `GisMap`, `LayerToggleRow`, `MapLegend`, `MiniMap`, `ScaleBar`, `BaseMapSwitcher`, `MapControls`, `ClusterBubble`, `MapHoverCard`, `TimeControlBar`. Inputs: `FilterCheckboxRow` (icon+count), `DateRangeSelect`, `SegmentedControl`, `SearchCombobox`. Feedback: `SkeletonBlock` variants, `EmptyState`, `ErrorState`, `Toast`, `StatusBanner`.

---

## 15. Quality, fidelity and delivery

**Fidelity acceptance (Dashboard @ 1672×941):**
- Region geometry within ±4 px of §1.1; all typography/colour tokens match `design-tokens.json`.
- Playwright screenshot diff vs. reference-derived baseline with dynamic areas masked (numbers, map tiles, thumbnails); threshold 3 %.
- Checklist review: every element in §1.1 present, all hover/active/selected states implemented, every other page uses the same components/tokens (storybook "Design Review" story).

**Testing:** unit (formatters, url-state), component (Storybook + play tests for loading/empty/error), contract (MSW handlers validated against OpenAPI), e2e (filter → KPI/map/panel update; marker click → panel; alert click → fly-to; SSE new alert; mode chip in demo/sim/live/stale), a11y (axe), performance (Lighthouse; map interactive < 3 s on broadband; 60 fps pan with 20 k events).

**Phases (2–3 devs):**
| Phase | Deliverable |
|---|---|
| P0 (2 d) | Tokens from reference, primitives, Storybook, shell + header + status chip |
| P1 (3 d) | Dashboard chrome: rail, filters, KPI row, charts, alert list (MSW data) |
| P2 (4 d) | GisMap, layers, clustering, legend, minimap, basemaps |
| P3 (3 d) | Event panel (all 4 tabs), imagery, prev/next, URL state |
| P4 (5 d) | Live Map extras, Events, Event Details, Facilities, Analytics, Alerts |
| P5 (2 d) | Real-time SSE, notifications, mode banners (demo/sim/live/stale) |
| P6 (3 d) | Responsive, a11y, visual regression, performance polish, integration with real backend |

**Assumptions / open items:** basemap and imagery provider licences; whether Weather overlay ships in v1 (default OFF, hidden if unavailable); "High Risk Events" definition (Critical only vs Critical+High) confirmed with stakeholders; auth may be skipped for the public demo with admin-only mode controls.
