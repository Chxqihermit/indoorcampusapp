import { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import { knownLocations } from "./knownLocations";
import MapCoordinateDebug from "./MapCoordinateDebug";
import { geolocationAllowed } from "@/lib/capacitor";
import maplibregl, { Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
const COORD_DEBUG_KEY = "campusnav-coord-debug";
const CAMPUS_LOCATIONS = {
  // Upper campus (Brahms Ave / Austin Rd side)
  main: [17.0775, -22.56575],
  upper: [17.0775, -22.56575],
  // Lower campus (Pasteur St / engineering cluster)
  lower: [17.0738, -22.56585]
};
const MapComponent = forwardRef(({ onRouteStateChange }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const keyHandlerRef = useRef(null);
  const routeSourceRef = useRef(null);
  const walkSelectingRef = useRef(null);
  const walkStartRef = useRef(null);
  const walkEndRef = useRef(null);
  const gpsBtnRef = useRef(null);
  const walkApiRef = useRef(null);
  const coordDebugEnabledRef = useRef(false);
  const setRouteActiveRef = useRef(null);
  const [routeActive, setRouteActive] = useState(false);
  const [coordDebugEnabled, setCoordDebugEnabled] = useState(
    () => localStorage.getItem(COORD_DEBUG_KEY) === "true"
  );
  const [hoverCoords, setHoverCoords] = useState(null);
  const toggleCoordDebug = useCallback(() => {
    setCoordDebugEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(COORD_DEBUG_KEY, String(next));
      coordDebugEnabledRef.current = next;
      if (!next) setHoverCoords(null);
      return next;
    });
  }, []);
  useEffect(() => {
    coordDebugEnabledRef.current = coordDebugEnabled;
  }, [coordDebugEnabled]);
  useEffect(() => {
    setRouteActiveRef.current = setRouteActive;
  }, []);
  useEffect(() => {
    if (map.current) return;
    if (mapContainer.current) {
      const container = mapContainer.current;
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        requestAnimationFrame(() => {
          if (container && !map.current) {
            initializeMap(container);
          }
        });
      } else {
        initializeMap(container);
      }
    }
    function initializeMap(container) {
      const nustCenter = CAMPUS_LOCATIONS.main;
      const satelliteStyle = {
        version: 8,
        sources: {
          "satellite": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            ],
            tileSize: 512,
            attribution: "\xA9 Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community"
          },
          "labels": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            ],
            tileSize: 512,
            attribution: "\xA9 Esri"
          }
        },
        layers: [
          {
            id: "satellite-layer",
            type: "raster",
            source: "satellite",
            minzoom: 0,
            maxzoom: 20
          },
          {
            id: "labels-layer",
            type: "raster",
            source: "labels",
            minzoom: 0,
            maxzoom: 20
          }
        ],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
      };
      const mapTilerKey = import.meta.env?.VITE_MAPTILER_KEY;
      const mapTilerStyleName = import.meta.env?.VITE_MAPTILER_STYLE || "hybrid";
      const mapTilerStyleUrl = mapTilerKey ? `https://api.maptiler.com/maps/${mapTilerStyleName}/style.json?key=${mapTilerKey}` : null;
      const cartoStyleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
      const osmRasterStyle = {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "\xA9 OpenStreetMap contributors"
          }
        },
        layers: [
          { id: "osm", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 }
        ],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
      };
      map.current = new maplibregl.Map({
        container,
        style: mapTilerStyleUrl || cartoStyleUrl || osmRasterStyle,
        center: nustCenter,
        zoom: 16.5,
        pitch: 0,
        bearing: 0,
        minZoom: 10,
        maxZoom: 20,
        pixelRatio: window.devicePixelRatio || 2,
        dragRotate: true,
        touchZoomRotate: true,
        keyboard: true,
        doubleClickZoom: true,
        scrollZoom: true,
        renderWorldCopies: true
      });
      map.current.on("error", (e) => {
        console.error("Map error:", e);
      });
      map.current.on("mousemove", (e) => {
        if (!coordDebugEnabledRef.current) return;
        setHoverCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
      map.current.on("mouseleave", () => {
        setHoverCoords(null);
      });
      map.current.on("styledata", () => {
        console.log("Map style loaded successfully");
      });
      const nav = new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      });
      map.current.addControl(nav, "top-right");
      map.current.addControl(new maplibregl.FullscreenControl(), "top-right");
      map.current.on("load", () => {
        console.log("Map loaded and ready");
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
          }
        }, 100);
        let campusRings = [];
        let labelsCache = null;
        let routePopup = null;
        const pointInPolygon = (lng, lat, rings) => {
          const insideRing = (ring) => {
            let inside = false;
            for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
              const xi = ring[i][0], yi = ring[i][1];
              const xj = ring[j][0], yj = ring[j][1];
              const intersect = yi > lat !== yj > lat && lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi;
              if (intersect) inside = !inside;
            }
            return inside;
          };
          for (const ring of rings) if (insideRing(ring)) return true;
          return false;
        };
        const bringCampusOutlineToFront = () => {
          if (!map.current) return;
          for (const id of [
            "nust-lower-campus-fill",
            "nust-lower-campus-outline-glow",
            "nust-lower-campus-outline"
          ]) {
            if (map.current.getLayer(id)) {
              try {
                map.current.moveLayer(id);
              } catch {
              }
            }
          }
        };
        const loadLowerCampusOutline = () => {
          if (!map.current || map.current.getSource("nust-lower-campus")) return;
          fetch("/data/nust-lower-campus.geojson").then((r) => r.ok ? r.json() : Promise.reject(new Error("lower campus 404"))).then((gj) => {
            if (!map.current) return;
            map.current.addSource("nust-lower-campus", { type: "geojson", data: gj });
            if (!map.current.getLayer("nust-lower-campus-fill")) {
              map.current.addLayer({
                id: "nust-lower-campus-fill",
                type: "fill",
                source: "nust-lower-campus",
                paint: {
                  "fill-color": "#3B82F6",
                  "fill-opacity": 0.06
                }
              });
            }
            if (!map.current.getLayer("nust-lower-campus-outline-glow")) {
              map.current.addLayer({
                id: "nust-lower-campus-outline-glow",
                type: "line",
                source: "nust-lower-campus",
                paint: {
                  "line-color": "#2563EB",
                  "line-width": 8,
                  "line-opacity": 0.2,
                  "line-blur": 2
                }
              });
            }
            if (!map.current.getLayer("nust-lower-campus-outline")) {
              map.current.addLayer({
                id: "nust-lower-campus-outline",
                type: "line",
                source: "nust-lower-campus",
                paint: {
                  "line-color": "#1D4ED8",
                  "line-width": ["interpolate", ["linear"], ["zoom"], 14, 2, 17, 3.5, 19, 5],
                  "line-opacity": 0.95
                },
                layout: {
                  "line-join": "round",
                  "line-cap": "round"
                }
              });
            }
            bringCampusOutlineToFront();
          }).catch((err) => console.warn("Lower campus outline failed to load", err));
        };
        try {
          const campusMap = map.current;
          if (campusMap && !campusMap.getSource("nust-campus")) {
            campusMap.addSource("nust-campus", { type: "geojson", data: "/data/nust-campus.geojson" });
            fetch("/data/nust-campus.geojson").then((r) => r.json()).then((gj) => {
              if (!map.current) return;
              const bounds = new maplibregl.LngLatBounds();
              const addCoords = (coords) => {
                if (!coords) return;
                if (typeof coords[0] === "number") {
                  bounds.extend(coords);
                } else {
                  coords.forEach(addCoords);
                }
              };
              (gj.features || []).forEach((f) => addCoords(f.geometry?.coordinates));
              const applyCampusBounds = (extraBounds) => {
                const b = new maplibregl.LngLatBounds();
                if (!bounds.isEmpty()) {
                  b.extend(bounds.getSouthWest());
                  b.extend(bounds.getNorthEast());
                }
                if (extraBounds && !extraBounds.isEmpty()) {
                  b.extend(extraBounds.getSouthWest());
                  b.extend(extraBounds.getNorthEast());
                }
                if (b.isEmpty()) return;
                map.current.fitBounds(b, { padding: 40, duration: 700 });
                const padLng = 25e-4;
                const padLat = 25e-4;
                const sw0 = b.getSouthWest();
                const ne0 = b.getNorthEast();
                map.current.setMaxBounds(new maplibregl.LngLatBounds(
                  [sw0.lng - padLng, sw0.lat - padLat],
                  [ne0.lng + padLng, ne0.lat + padLat]
                ));
                return b;
              };
              try {
                campusRings = [];
                for (const f of gj.features || []) {
                  const g = f.geometry;
                  if (!g) continue;
                  if (g.type === "Polygon" && g.coordinates?.[0]) campusRings.push(g.coordinates[0]);
                  if (g.type === "MultiPolygon") {
                    for (const poly of g.coordinates || []) if (poly?.[0]) campusRings.push(poly[0]);
                  }
                }
              } catch {
              }
              let campusBounds = applyCampusBounds();
              fetch("/data/nust-buildings.geojson").then((r) => r.ok ? r.json() : null).then((buildings) => {
                if (!map.current || !buildings?.features) return;
                const bldBounds = new maplibregl.LngLatBounds();
                for (const f of buildings.features) {
                  const c = f.geometry?.coordinates;
                  if (Array.isArray(c) && typeof c[0] === "number") {
                    bldBounds.extend(c);
                  }
                }
                if (!bldBounds.isEmpty()) {
                  campusBounds = applyCampusBounds(bldBounds) ?? campusBounds;
                }
              }).catch(() => {
              });
              try {
                const features = (gj.features || []).filter((f) => f.geometry);
                const worldRing = [
                  [-180, -85],
                  [180, -85],
                  [180, 85],
                  [-180, 85],
                  [-180, -85]
                ];
                const holes = [];
                for (const f of features) {
                  if (f.geometry.type === "Polygon") {
                    const ring = f.geometry.coordinates?.[0];
                    if (ring) holes.push(ring);
                  } else if (f.geometry.type === "MultiPolygon") {
                    (f.geometry.coordinates || []).forEach((poly) => {
                      if (poly && poly[0]) holes.push(poly[0]);
                    });
                  }
                }
                if (holes.length) {
                  const nearMask = {
                    type: "FeatureCollection",
                    features: [
                      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [worldRing, ...holes] } }
                    ]
                  };
                  if (!map.current.getSource("outside-mask-near")) {
                    map.current.addSource("outside-mask-near", { type: "geojson", data: nearMask });
                    map.current.addLayer({ id: "outside-mask-near", type: "fill", source: "outside-mask-near", paint: { "fill-color": "#ffffff", "fill-opacity": 0.4 } });
                  } else {
                    map.current.getSource("outside-mask-near").setData(nearMask);
                  }
                  const padLngFar = 25e-4;
                  const padLatFar = 25e-4;
                  const viewBounds = campusBounds && !campusBounds.isEmpty() ? campusBounds : bounds;
                  const sw = viewBounds.getSouthWest();
                  const ne = viewBounds.getNorthEast();
                  const rect = [
                    [sw.lng - padLngFar, sw.lat - padLatFar],
                    [ne.lng + padLngFar, sw.lat - padLatFar],
                    [ne.lng + padLngFar, ne.lat + padLatFar],
                    [sw.lng - padLngFar, ne.lat + padLatFar],
                    [sw.lng - padLngFar, sw.lat - padLatFar]
                  ];
                  const farMask = {
                    type: "FeatureCollection",
                    features: [
                      { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [worldRing, rect] } }
                    ]
                  };
                  if (!map.current.getSource("outside-mask-far")) {
                    map.current.addSource("outside-mask-far", { type: "geojson", data: farMask });
                    map.current.addLayer({ id: "outside-mask-far", type: "fill", source: "outside-mask-far", paint: { "fill-color": "#ffffff", "fill-opacity": 1 } });
                  } else {
                    map.current.getSource("outside-mask-far").setData(farMask);
                  }
                  if (map.current.getLayer("nust-campus-fill-bright")) {
                    map.current.removeLayer("nust-campus-fill-bright");
                  }
                }
              } catch (err) {
                console.warn("mask build failed", err);
              }
            }).catch(() => {
            });
          }
        } catch (e) {
          console.warn("nust-campus source not available", e);
        }
        loadLowerCampusOutline();
        try {
          fetch("/data/nust-labels.geojson").then((r) => r.ok ? r.json() : Promise.reject(new Error("labels 404"))).then((labels) => {
            try {
              labelsCache = labels;
              if (!map.current.getSource("nust-labels")) {
                map.current.addSource("nust-labels", { type: "geojson", data: labels });
              } else {
                map.current.getSource("nust-labels").setData(labels);
              }
              if (!map.current.getLayer("nust-labels")) {
                map.current.addLayer({
                  id: "nust-labels",
                  type: "symbol",
                  source: "nust-labels",
                  layout: {
                    "text-field": ["coalesce", ["get", "name"], ["get", "amenity"], ["get", "building"], ["get", "entrance"], ["get", "barrier"]],
                    "text-size": 12,
                    "text-offset": [0, 0.6],
                    "text-anchor": "top",
                    "text-optional": true
                  },
                  paint: {
                    "text-color": "#111827",
                    "text-halo-color": "#ffffff",
                    "text-halo-width": 1.2
                  }
                });
              }
            } catch (e) {
              console.warn("labels layer add failed", e);
            }
          }).catch(() => {
          });
        } catch {
        }
        try {
          const emptyMarkers = { type: "FeatureCollection", features: [] };
          fetch("/data/nust-buildings.geojson").then((r) => r.ok ? r.json() : Promise.reject(new Error("buildings 404"))).then((buildings) => {
            try {
              if (!map.current.getSource("nust-buildings-names")) {
                map.current.addSource("nust-buildings-names", { type: "geojson", data: buildings });
              } else {
                map.current.getSource("nust-buildings-names").setData(buildings);
              }
              if (!map.current.getSource("nust-buildings-markers")) {
                map.current.addSource("nust-buildings-markers", { type: "geojson", data: emptyMarkers });
              } else {
                map.current.getSource("nust-buildings-markers").setData(emptyMarkers);
              }
              if (!map.current.getLayer("nust-buildings-circles")) {
                map.current.addLayer({
                  id: "nust-buildings-circles",
                  type: "circle",
                  source: "nust-buildings-markers",
                  paint: {
                    "circle-radius": 8,
                    "circle-color": [
                      "case",
                      ["==", ["get", "role"], "start"],
                      "#10B981",
                      ["==", ["get", "role"], "end"],
                      "#EF4444",
                      "#2563EB"
                    ],
                    "circle-stroke-color": "#ffffff",
                    "circle-stroke-width": 2,
                    "circle-opacity": 0.95
                  }
                });
              }
              if (!map.current.getLayer("nust-buildings-text")) {
                map.current.addLayer({
                  id: "nust-buildings-text",
                  type: "symbol",
                  source: "nust-buildings-names",
                  layout: {
                    "text-field": ["get", "name"],
                    "text-font": ["Open Sans Bold"],
                    "text-size": 11,
                    "text-offset": [0, 0.6],
                    "text-anchor": "top",
                    "text-optional": true,
                    "text-allow-overlap": false
                  },
                  paint: {
                    "text-color": "#111827",
                    "text-halo-color": "#ffffff",
                    "text-halo-width": 1.5
                  }
                });
              }
              if (!map.current.getLayer("nust-waypoint-labels")) {
                map.current.addLayer({
                  id: "nust-waypoint-labels",
                  type: "symbol",
                  source: "nust-buildings-markers",
                  layout: {
                    "text-field": ["get", "name"],
                    "text-size": 12,
                    "text-offset": [0, 1.4],
                    "text-anchor": "top",
                    "text-optional": true,
                    "text-allow-overlap": true
                  },
                  paint: {
                    "text-color": [
                      "case",
                      ["==", ["get", "role"], "start"],
                      "#047857",
                      "#DC2626"
                    ],
                    "text-halo-color": "#ffffff",
                    "text-halo-width": 2
                  }
                });
              }
              map.current.on("click", "nust-buildings-circles", (e) => {
                if (!e.features?.[0]) return;
                const props = e.features[0].properties;
                new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<div style="padding:8px;color:#111827"><strong style="color:#111827">${props?.name || "Building"}</strong></div>`).addTo(map.current);
              });
              map.current.on("mouseenter", "nust-buildings-circles", () => {
                if (map.current) map.current.getCanvas().style.cursor = "pointer";
              });
              map.current.on("mouseleave", "nust-buildings-circles", () => {
                if (map.current) map.current.getCanvas().style.cursor = "";
              });
              bringCampusOutlineToFront();
            } catch (e) {
              console.warn("buildings layer add failed", e);
            }
          }).catch(() => {
          });
        } catch {
        }
        const handleKeyPress = (e) => {
          const target = e.target;
          if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement ||
            target instanceof HTMLElement && target.isContentEditable
          ) {
            return;
          }
          if (e.key === "*" && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (gpsBtnRef.current) {
              gpsBtnRef.current.click();
            }
            return;
          }
          if (!map.current || !e.shiftKey) return;
          const currentPitch = map.current.getPitch();
          const currentBearing = map.current.getBearing();
          switch (e.key) {
            case "ArrowUp":
              e.preventDefault();
              map.current.easeTo({ pitch: Math.min(currentPitch + 5, 60), duration: 300 });
              break;
            case "ArrowDown":
              e.preventDefault();
              map.current.easeTo({ pitch: Math.max(currentPitch - 5, 0), duration: 300 });
              break;
            case "ArrowLeft":
              e.preventDefault();
              map.current.easeTo({ bearing: currentBearing - 15, duration: 300 });
              break;
            case "ArrowRight":
              e.preventDefault();
              map.current.easeTo({ bearing: currentBearing + 15, duration: 300 });
              break;
          }
        };
        keyHandlerRef.current = handleKeyPress;
        window.addEventListener("keydown", handleKeyPress);
        try {
          let selecting = null;
          let startPt = null;
          let endPt = null;
          let startLabel = "";
          let endLabel = "";
          let fullRouteCoords = null;
          let routeProgressIndex = 0;
          let gpsWatchId = null;
          let lastKnownUserPos = null;
          let lastTrimPos = null;
          let routeTrackingActive = false;
          const graph = { nodes: {} };
          let graphReady = false;
          const hav = (a, b) => {
            const R = 6371e3;
            const toRad = (x) => x * Math.PI / 180;
            const dLat = toRad(b[1] - a[1]);
            const dLon = toRad(b[0] - a[0]);
            const la1 = toRad(a[1]);
            const la2 = toRad(b[1]);
            const s = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
            return 2 * R * Math.asin(Math.sqrt(s));
          };
          const routeMeters = (coords) => coords.reduce((sum, c, i) => i ? sum + hav(coords[i - 1], c) : 0, 0);
          const projectPointOnSegment = (px, py, ax, ay, bx, by) => {
            const mPerDegLat = 111320;
            const mPerDegLng = Math.cos(py * Math.PI / 180) * 111320;
            const P = { x: px * mPerDegLng, y: py * mPerDegLat };
            const A = { x: ax * mPerDegLng, y: ay * mPerDegLat };
            const B = { x: bx * mPerDegLng, y: by * mPerDegLat };
            const ABx = B.x - A.x;
            const ABy = B.y - A.y;
            const APx = P.x - A.x;
            const APy = P.y - A.y;
            const ab2 = ABx * ABx + ABy * ABy;
            if (!ab2) {
              const dx = P.x - A.x;
              const dy = P.y - A.y;
              return { lng: ax, lat: ay, t: 0, distM: Math.sqrt(dx * dx + dy * dy) };
            }
            let t = (APx * ABx + APy * ABy) / ab2;
            t = Math.max(0, Math.min(1, t));
            const Qx = A.x + t * ABx;
            const Qy = A.y + t * ABy;
            const dx = P.x - Qx;
            const dy = P.y - Qy;
            return {
              lng: Qx / mPerDegLng,
              lat: Qy / mPerDegLat,
              t,
              distM: Math.sqrt(dx * dx + dy * dy)
            };
          };
          const nid = (lng, lat) => `${lng.toFixed(6)},${lat.toFixed(6)}`;
          const ensureNode = (lng, lat) => {
            const id = nid(lng, lat);
            if (!graph.nodes[id]) graph.nodes[id] = { id, lng, lat, edges: [] };
            return graph.nodes[id];
          };
          const addEdge = (a, b) => {
            const w = hav([a.lng, a.lat], [b.lng, b.lat]);
            a.edges.push({ to: b.id, w });
            b.edges.push({ to: a.id, w });
          };
          const buildGraphFromGeoJSON = (gj) => {
            const addDensified = (lng1, lat1, lng2, lat2) => {
              const n1 = ensureNode(lng1, lat1);
              const n2 = ensureNode(lng2, lat2);
              const dist = hav([lng1, lat1], [lng2, lat2]);
              const step = 5;
              if (dist <= step) {
                addEdge(n1, n2);
                return;
              }
              const parts = Math.ceil(dist / step);
              let prev = n1;
              for (let i = 1; i < parts; i++) {
                const t = i / parts;
                const lng = lng1 + (lng2 - lng1) * t;
                const lat = lat1 + (lat2 - lat1) * t;
                const mid = ensureNode(lng, lat);
                addEdge(prev, mid);
                prev = mid;
              }
              addEdge(prev, n2);
            };
            for (const f of gj.features || []) {
              if (!f.geometry) continue;
              if (f.geometry.type === "LineString") {
                const coords = f.geometry.coordinates;
                for (let i = 0; i < coords.length - 1; i++) {
                  const [lng1, lat1] = coords[i];
                  const [lng2, lat2] = coords[i + 1];
                  addDensified(lng1, lat1, lng2, lat2);
                }
              } else if (f.geometry.type === "MultiLineString") {
                for (const line of f.geometry.coordinates) {
                  for (let i = 0; i < line.length - 1; i++) {
                    const [lng1, lat1] = line[i];
                    const [lng2, lat2] = line[i + 1];
                    addDensified(lng1, lat1, lng2, lat2);
                  }
                }
              }
            }
            try {
              const centerLat = -22.571;
              const mPerDegLat = 111320;
              const mPerDegLng = Math.cos(centerLat * Math.PI / 180) * 111320;
              const bucketM = 6;
              const dLng = bucketM / mPerDegLng;
              const dLat = bucketM / mPerDegLat;
              const buckets = {};
              const ids = Object.keys(graph.nodes);
              for (const id of ids) {
                const n = graph.nodes[id];
                const bx = Math.round(n.lng / dLng);
                const by = Math.round(n.lat / dLat);
                const key = bx + ":" + by;
                (buckets[key] ||= []).push(id);
              }
              const seenPair = /* @__PURE__ */ new Set();
              const neigh = [-1, 0, 1];
              for (const id of ids) {
                const a = graph.nodes[id];
                const bx = Math.round(a.lng / dLng);
                const by = Math.round(a.lat / dLat);
                for (const dx of neigh) for (const dy of neigh) {
                  const list = buckets[bx + dx + ":" + (by + dy)] || [];
                  for (const oid of list) {
                    if (oid === id) continue;
                    const b = graph.nodes[oid];
                    const dist = hav([a.lng, a.lat], [b.lng, b.lat]);
                    if (dist > bucketM) continue;
                    const k = id < oid ? id + "|" + oid : oid + "|" + id;
                    if (seenPair.has(k)) continue;
                    seenPair.add(k);
                    const has = a.edges.some((e) => e.to === b.id) || b.edges.some((e) => e.to === a.id);
                    if (!has) {
                      addEdge(a, b);
                    }
                  }
                }
              }
            } catch {
            }
            graphReady = Object.keys(graph.nodes).length > 0;
          };
          const segsIntersect = (ax, ay, bx, by, cx, cy, dx, dy) => {
            const orient = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
            const o1 = orient(ax, ay, bx, by, cx, cy);
            const o2 = orient(ax, ay, bx, by, dx, dy);
            const o3 = orient(cx, cy, dx, dy, ax, ay);
            const o4 = orient(cx, cy, dx, dy, bx, by);
            if (o1 === 0 && o2 === 0 && o3 === 0 && o4 === 0) return false;
            return o1 > 0 !== o2 > 0 && o3 > 0 !== o4 > 0;
          };
          const pointInRing = (lng, lat, ring) => {
            let inside = false;
            for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
              const xi = ring[i][0], yi = ring[i][1];
              const xj = ring[j][0], yj = ring[j][1];
              const intersect = yi > lat !== yj > lat && lng < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi;
              if (intersect) inside = !inside;
            }
            return inside;
          };
          const pruneEdgesAgainstBuildings = (rings) => {
            if (!rings.length) return;
            const nodeIds = Object.keys(graph.nodes);
            const seen = /* @__PURE__ */ new Set();
            for (const id of nodeIds) {
              const a = graph.nodes[id];
              a.edges = a.edges.filter((e) => {
                const b = graph.nodes[e.to];
                if (!b) return false;
                const key = id < b.id ? id + "|" + b.id : b.id + "|" + id;
                if (seen.has(key)) return true;
                let blocked = false;
                for (const ring of rings) {
                  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
                  for (const p of ring) {
                    if (p[0] < minx) minx = p[0];
                    if (p[0] > maxx) maxx = p[0];
                    if (p[1] < miny) miny = p[1];
                    if (p[1] > maxy) maxy = p[1];
                  }
                  if (a.lng < minx && b.lng < minx || a.lng > maxx && b.lng > maxx || a.lat < miny && b.lat < miny || a.lat > maxy && b.lat > maxy) {
                    continue;
                  }
                  if (pointInRing(a.lng, a.lat, ring) || pointInRing(b.lng, b.lat, ring)) {
                    blocked = true;
                    break;
                  }
                  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                    const c = ring[j], d = ring[i];
                    if (segsIntersect(a.lng, a.lat, b.lng, b.lat, c[0], c[1], d[0], d[1])) {
                      blocked = true;
                      break;
                    }
                  }
                  if (blocked) break;
                }
                if (blocked) {
                  const nb = graph.nodes[e.to];
                  if (nb) nb.edges = nb.edges.filter((ed) => ed.to !== id);
                }
                seen.add(key);
                return !blocked;
              });
            }
          };
          const loadWalkGraph = async () => {
            if (graphReady) return;
            try {
              const local = await fetch("/data/nust-walkways.geojson");
              if (local.ok) {
                const j = await local.json();
                buildGraphFromGeoJSON(j);
                try {
                  if (!map.current.getSource("walkways")) {
                    map.current.addSource("walkways", { type: "geojson", data: j });
                  } else {
                    map.current.getSource("walkways").setData(j);
                  }
                  if (!map.current.getLayer("walkways")) {
                    map.current.addLayer({ id: "walkways", type: "line", source: "walkways", paint: { "line-color": "#d8dee8", "line-width": 1.5, "line-opacity": 0.35 } });
                  }
                } catch {
                }
                try {
                  const bld = await fetch("/data/nust-buildings.geojson");
                  if (bld.ok) {
                    const bj = await bld.json();
                    const rings = [];
                    for (const f of bj.features || []) {
                      const g = f.geometry;
                      if (!g) continue;
                      if (g.type === "Polygon" && g.coordinates?.[0]) rings.push(g.coordinates[0]);
                      if (g.type === "MultiPolygon") {
                        for (const poly of g.coordinates || []) if (poly?.[0]) rings.push(poly[0]);
                      }
                    }
                    pruneEdgesAgainstBuildings(rings);
                  }
                } catch {
                }
                graphReady = Object.keys(graph.nodes).length > 0;
                if (graphReady) return;
              }
            } catch {
            }
            try {
              const b = map.current.getBounds();
              const s = b.getSouth(), w = b.getWest(), n = b.getNorth(), e = b.getEast();
              const q = `data=[out:json][timeout:25];(way["highway"~"footway|path|pedestrian|steps|living_street|service"](${s},${w},${n},${e});>;);out;`;
              const resp = await fetch(`https://overpass-api.de/api/interpreter?${new URLSearchParams({ data: q }).toString()}`);
              const j = await resp.json();
              const nodes = {};
              for (const el of j.elements) if (el.type === "node") nodes[el.id] = [el.lon, el.lat];
              const features = [];
              for (const el of j.elements) if (el.type === "way" && el.nodes?.length > 1) {
                const coords = el.nodes.map((id) => nodes[id]).filter(Boolean);
                if (coords.length > 1) features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } });
              }
              const gj = { type: "FeatureCollection", features };
              buildGraphFromGeoJSON(gj);
              try {
                if (!map.current.getSource("walkways")) {
                  map.current.addSource("walkways", { type: "geojson", data: gj });
                } else {
                  map.current.getSource("walkways").setData(gj);
                }
                if (!map.current.getLayer("walkways")) {
                  map.current.addLayer({ id: "walkways", type: "line", source: "walkways", paint: { "line-color": "#9CA3AF", "line-width": 1.5, "line-opacity": 0.35 } });
                }
              } catch {
              }
              try {
                const bld = await fetch("/data/nust-buildings.geojson");
                if (bld.ok) {
                  const bj = await bld.json();
                  const rings = [];
                  for (const f of bj.features || []) {
                    const g = f.geometry;
                    if (!g) continue;
                    if (g.type === "Polygon" && g.coordinates?.[0]) rings.push(g.coordinates[0]);
                    if (g.type === "MultiPolygon") {
                      for (const poly of g.coordinates || []) if (poly?.[0]) rings.push(poly[0]);
                    }
                  }
                  pruneEdgesAgainstBuildings(rings);
                }
              } catch {
              }
              graphReady = Object.keys(graph.nodes).length > 0;
            } catch {
            }
          };
          const nearestNodeId = (lng, lat) => {
            let best = null;
            for (const n of Object.values(graph.nodes)) {
              const d = hav([lng, lat], [n.lng, n.lat]);
              if (!best || d < best.d) best = { id: n.id, d };
            }
            return best?.id || null;
          };
          const projectToNearestSegment = (lng, lat) => {
            const toMeters = (xLng, xLat) => {
              const mPerDegLat = 111320;
              const mPerDegLng = Math.cos(lat * Math.PI / 180) * 111320;
              return { x: xLng * mPerDegLng, y: xLat * mPerDegLat };
            };
            let best = null;
            const visited = /* @__PURE__ */ new Set();
            for (const a of Object.values(graph.nodes)) {
              for (const e of a.edges) {
                const b = graph.nodes[e.to];
                if (!b) continue;
                const key = a.id < b.id ? a.id + "|" + b.id : b.id + "|" + a.id;
                if (visited.has(key)) continue;
                visited.add(key);
                const P = toMeters(lng, lat);
                const A = toMeters(a.lng, a.lat);
                const B = toMeters(b.lng, b.lat);
                const ABx = B.x - A.x, ABy = B.y - A.y;
                const APx = P.x - A.x, APy = P.y - A.y;
                const ab2 = ABx * ABx + ABy * ABy;
                if (!ab2) continue;
                let t = (APx * ABx + APy * ABy) / ab2;
                if (t < 0) t = 0;
                if (t > 1) t = 1;
                const Qx = A.x + t * ABx, Qy = A.y + t * ABy;
                const dx = P.x - Qx, dy = P.y - Qy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (!best || dist < best.distM) {
                  const mPerDegLat = 111320;
                  const mPerDegLng = Math.cos(lat * Math.PI / 180) * 111320;
                  const qLng = Qx / mPerDegLng;
                  const qLat = Qy / mPerDegLat;
                  best = { a, b, px: qLng, py: qLat, t, distM: dist };
                }
              }
            }
            return best;
          };
          const snapInfoFor = (lng, lat) => projectToNearestSegment(lng, lat);
          const addVirtualNodeOnNearestSegment = (lng, lat) => {
            const seg = projectToNearestSegment(lng, lat);
            if (!seg) return { id: nearestNodeId(lng, lat), cleanup: () => {
            } };
            const id = `virt:${seg.px.toFixed(7)},${seg.py.toFixed(7)}`;
            if (!graph.nodes[id]) graph.nodes[id] = { id, lng: seg.px, lat: seg.py, edges: [] };
            const v = graph.nodes[id];
            const a = seg.a, b = seg.b;
            const wa = hav([v.lng, v.lat], [a.lng, a.lat]);
            const wb = hav([v.lng, v.lat], [b.lng, b.lat]);
            a.edges.push({ to: v.id, w: wa });
            b.edges.push({ to: v.id, w: wb });
            v.edges.push({ to: a.id, w: wa });
            v.edges.push({ to: b.id, w: wb });
            const cleanup = () => {
              a.edges = a.edges.filter((ed) => ed.to !== v.id);
              b.edges = b.edges.filter((ed) => ed.to !== v.id);
              delete graph.nodes[v.id];
            };
            return { id: v.id, cleanup };
          };
          const astar = (start, goal) => {
            const open = /* @__PURE__ */ new Set([start]);
            const came = {};
            const g = { [start]: 0 };
            const h0 = hav([graph.nodes[start].lng, graph.nodes[start].lat], [graph.nodes[goal].lng, graph.nodes[goal].lat]);
            const fScore = { [start]: h0 };
            const popBest = () => {
              let bestId = null, bestF = Infinity;
              for (const id of open) {
                const val = fScore[id] ?? Infinity;
                if (val < bestF) {
                  bestF = val;
                  bestId = id;
                }
              }
              if (bestId) open.delete(bestId);
              return bestId;
            };
            while (open.size) {
              const current = popBest();
              if (!current) break;
              if (current === goal) {
                const path = [current];
                while (came[path[path.length - 1]]) path.push(came[path[path.length - 1]]);
                return path.reverse();
              }
              const ncur = graph.nodes[current];
              for (const e of ncur.edges) {
                const tent = (g[current] ?? Infinity) + e.w;
                if (tent < (g[e.to] ?? Infinity)) {
                  came[e.to] = current;
                  g[e.to] = tent;
                  const ng = graph.nodes[e.to];
                  fScore[e.to] = tent + hav([ng.lng, ng.lat], [graph.nodes[goal].lng, graph.nodes[goal].lat]);
                  open.add(e.to);
                }
              }
            }
            return null;
          };
          const componentOf = (seed) => {
            const seen = /* @__PURE__ */ new Set();
            const q = [seed];
            seen.add(seed);
            while (q.length) {
              const cur = q.shift();
              for (const e of graph.nodes[cur].edges) {
                if (!seen.has(e.to)) {
                  seen.add(e.to);
                  q.push(e.to);
                }
              }
            }
            return seen;
          };
          const connectComponentsByNearest = (sId, eId, maxDistM) => {
            const A = componentOf(sId);
            if (A.has(eId)) return true;
            const isNearEntrance = (lng, lat) => {
              try {
                if (!labelsCache?.features?.length) return false;
                for (const f of labelsCache.features) {
                  const p = f.properties || {};
                  const isEnt = p.barrier === "gate" || p.entrance;
                  const c = f.geometry?.coordinates;
                  if (!isEnt || !Array.isArray(c)) continue;
                  const d = hav([lng, lat], [c[0], c[1]]);
                  if (d <= 8) return true;
                }
              } catch {
              }
              return false;
            };
            let best = null;
            for (const aId of A) {
              const a = graph.nodes[aId];
              for (const bId in graph.nodes) {
                if (A.has(bId)) continue;
                const b = graph.nodes[bId];
                const d = hav([a.lng, a.lat], [b.lng, b.lat]);
                if (d <= maxDistM && (isNearEntrance(a.lng, a.lat) || isNearEntrance(b.lng, b.lat))) {
                  if (!best || d < best.d) best = { a: aId, b: bId, d };
                }
              }
            }
            if (best) {
              addEdge(graph.nodes[best.a], graph.nodes[best.b]);
              return true;
            }
            return false;
          };
          const ensurePointLayer = (id, color) => {
            if (!map.current.getSource(id)) {
              map.current.addSource(id, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
            }
            if (!map.current.getLayer(id)) {
              map.current.addLayer({ id, type: "circle", source: id, paint: { "circle-radius": 7, "circle-color": color, "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
              try {
                map.current.moveLayer(id);
              } catch {
              }
            }
          };
          const ensureRouteLayer = () => {
            if (!map.current.getSource("walk-route")) {
              map.current.addSource("walk-route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
            }
            if (!map.current.getLayer("walk-route")) {
              map.current.addLayer({ id: "walk-route", type: "line", source: "walk-route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#2563EB", "line-width": 5, "line-opacity": 0.95 } });
              try {
                map.current.moveLayer("walk-route");
              } catch {
              }
            }
          };
          const ensureUserLocationLayer = () => {
            if (!map.current.getSource("user-location")) {
              map.current.addSource("user-location", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
            }
            if (!map.current.getLayer("user-location-dot")) {
              map.current.addLayer({
                id: "user-location-dot",
                type: "circle",
                source: "user-location",
                paint: {
                  "circle-radius": 9,
                  "circle-color": "#4285F4",
                  "circle-stroke-color": "#ffffff",
                  "circle-stroke-width": 3,
                  "circle-opacity": 1
                }
              });
              try {
                map.current.moveLayer("user-location-dot");
              } catch {
              }
            }
          };
          const updateUserLocationDot = (lng, lat) => {
            if (!map.current) return;
            ensureUserLocationLayer();
            map.current.getSource("user-location").setData({
              type: "FeatureCollection",
              features: [{
                type: "Feature",
                properties: {},
                geometry: { type: "Point", coordinates: [lng, lat] }
              }]
            });
            if (map.current.getLayer("user-location-dot")) {
              map.current.setLayoutProperty("user-location-dot", "visibility", "visible");
            }
          };
          const hideUserLocationDot = () => {
            if (!map.current) return;
            if (map.current.getSource("user-location")) {
              map.current.getSource("user-location").setData({ type: "FeatureCollection", features: [] });
            }
            if (map.current.getLayer("user-location-dot")) {
              map.current.setLayoutProperty("user-location-dot", "visibility", "none");
            }
          };
          const removeDebugLayers = () => {
            try {
              if (map.current.getLayer("walk-snap-points")) map.current.removeLayer("walk-snap-points");
              if (map.current.getSource("walk-snap-points")) map.current.removeSource("walk-snap-points");
              if (map.current.getLayer("walk-snap-segs")) map.current.removeLayer("walk-snap-segs");
              if (map.current.getSource("walk-snap-segs")) map.current.removeSource("walk-snap-segs");
            } catch {
            }
          };
          const notifyRouteState = () => {
            onRouteStateChange?.({ start: startLabel, end: endLabel });
          };
          const syncHighlightedBuildingMarkers = () => {
            if (!map.current?.getSource("nust-buildings-markers")) return;
            const features = [];
            if (startPt) {
              features.push({
                type: "Feature",
                properties: { name: startLabel || "Start", role: "start" },
                geometry: { type: "Point", coordinates: startPt }
              });
            }
            if (endPt) {
              features.push({
                type: "Feature",
                properties: { name: endLabel || "Destination", role: "end" },
                geometry: { type: "Point", coordinates: endPt }
              });
            }
            map.current.getSource("nust-buildings-markers").setData({
              type: "FeatureCollection",
              features
            });
          };
          const renderRouteLine = (coords) => {
            if (!map.current?.getSource("walk-route") || !coords?.length) return;
            map.current.getSource("walk-route").setData({
              type: "FeatureCollection",
              features: [{
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: coords }
              }]
            });
          };
          const showRoutePopup = (coords, { arrived = false } = {}) => {
            const midpoint = coords[Math.floor(coords.length / 2)] || coords[0] || endPt;
            if (!midpoint) return;
            const meters = routeMeters(coords);
            const minutes = Math.max(1, Math.round(meters / 1.4 / 60));
            if (routePopup) {
              try {
                routePopup.remove();
              } catch {
              }
              routePopup = null;
            }
            const distanceLabel = meters < 1e3 ? `${Math.round(meters)} m` : `${(meters / 1e3).toFixed(2)} km`;
            const html = arrived ? `<div style="padding:8px;color:#111827"><strong style="color:#111827">You have arrived</strong></div>` : `<div style="padding:8px;color:#111827"><strong style="color:#111827">Walking route</strong><br/>Remaining: ${distanceLabel}<br/>~${minutes} min left</div>`;
            routePopup = new maplibregl.Popup().setLngLat(midpoint).setHTML(html).addTo(map.current);
          };
          const stopRouteTracking = () => {
            lastTrimPos = null;
            routeTrackingActive = false;
            setRouteActiveRef.current?.(false);
          };
          const stopContinuousGps = () => {
            if (gpsWatchId !== null && navigator.geolocation) {
              navigator.geolocation.clearWatch(gpsWatchId);
              gpsWatchId = null;
            }
            hideUserLocationDot();
          };
          const trimRouteToUserPosition = (lng, lat, accuracy = 25) => {
            if (!fullRouteCoords || fullRouteCoords.length < 2) return;
            if (!routeTrackingActive) return;
            if (lastTrimPos && hav([lng, lat], lastTrimPos) < 3) return;
            const snapThreshold = Math.max(30, (accuracy || 25) * 1.5);
            let bestSeg = -1;
            let bestDist = Infinity;
            let bestProj = null;
            for (let i = Math.max(0, routeProgressIndex); i < fullRouteCoords.length - 1; i++) {
              const [ax, ay] = fullRouteCoords[i];
              const [bx, by] = fullRouteCoords[i + 1];
              const proj = projectPointOnSegment(lng, lat, ax, ay, bx, by);
              if (proj.distM < bestDist) {
                bestDist = proj.distM;
                bestSeg = i;
                bestProj = proj;
              }
            }
            const dest = fullRouteCoords[fullRouteCoords.length - 1];
            if (hav([lng, lat], dest) < 15) {
              updateUserLocationDot(lng, lat);
              renderRouteLine([dest]);
              showRoutePopup([dest], { arrived: true });
              routeTrackingActive = false;
              lastTrimPos = [lng, lat];
              setRouteActiveRef.current?.(false);
              return;
            }
            if (bestSeg < 0 || bestDist > snapThreshold) return;
            const passedVertex = bestProj.t >= 0.5 ? bestSeg + 1 : bestSeg;
            if (passedVertex > routeProgressIndex) {
              routeProgressIndex = passedVertex;
            }
            const routePoint = [bestProj.lng, bestProj.lat];
            const remaining = [routePoint];
            for (let j = routeProgressIndex + 1; j < fullRouteCoords.length; j++) {
              remaining.push(fullRouteCoords[j]);
            }
            if (remaining.length < 2) {
              updateUserLocationDot(lng, lat);
              renderRouteLine([dest]);
              showRoutePopup([dest], { arrived: true });
              routeTrackingActive = false;
              setRouteActiveRef.current?.(false);
            } else {
              renderRouteLine(remaining);
              showRoutePopup(remaining);
            }
            lastTrimPos = [lng, lat];
          };
          const handleGpsUpdate = (pos) => {
            const lng = pos.coords.longitude;
            const lat = pos.coords.latitude;
            const accuracy = pos.coords.accuracy;
            lastKnownUserPos = { lng, lat, accuracy };
            updateUserLocationDot(lng, lat);
            trimRouteToUserPosition(lng, lat, accuracy);
          };
          const startContinuousGps = () => {
            if (!navigator.geolocation || !geolocationAllowed()) return;
            if (gpsWatchId !== null) return;
            const watchOpts = { enableHighAccuracy: true, maximumAge: 1e3, timeout: 15e3 };
            navigator.geolocation.getCurrentPosition(
              handleGpsUpdate,
              (err) => console.warn("GPS error:", err.message),
              watchOpts
            );
            gpsWatchId = navigator.geolocation.watchPosition(
              handleGpsUpdate,
              (err) => console.warn("GPS error:", err.message),
              watchOpts
            );
          };
          const startRouteTracking = () => {
            if (!fullRouteCoords?.length) return;
            lastTrimPos = null;
            routeTrackingActive = true;
            setRouteActiveRef.current?.(true);
            if (lastKnownUserPos) {
              const { lng, lat, accuracy } = lastKnownUserPos;
              trimRouteToUserPosition(lng, lat, accuracy);
            }
          };
          const setPoint = (which, lng, lat, label) => {
            const feature = { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [lng, lat] } };
            if (which === "start") {
              startPt = [lng, lat];
              if (label !== void 0) startLabel = label;
              map.current.getSource("walk-start")?.setData?.({ type: "FeatureCollection", features: [feature] });
            } else {
              endPt = [lng, lat];
              if (label !== void 0) endLabel = label;
              map.current.getSource("walk-end")?.setData?.({ type: "FeatureCollection", features: [feature] });
            }
            syncHighlightedBuildingMarkers();
            notifyRouteState();
          };
          const tryComputeRoute = async () => {
            if (!(startPt && endPt)) return;
            await loadWalkGraph();
            if (!graphReady) return;
            ensureRouteLayer();
            removeDebugLayers();
            if (routePopup) {
              try {
                routePopup.remove();
              } catch {
              }
              routePopup = null;
            }
            console.log("Graph nodes:", Object.keys(graph.nodes).length);
            const sVirt = addVirtualNodeOnNearestSegment(startPt[0], startPt[1]);
            const eVirt = addVirtualNodeOnNearestSegment(endPt[0], endPt[1]);
            const sId = sVirt.id;
            const eId = eVirt.id;
            if (!sId || !eId) return;
            let path = astar(sId, eId);
            if (!path || path.length < 2) {
              const thresholds = [8, 12];
              let bridged = false;
              for (const th of thresholds) {
                if (connectComponentsByNearest(sId, eId, th)) {
                  bridged = true;
                  path = astar(sId, eId);
                  if (path && path.length >= 2) break;
                }
              }
              if (!path || path.length < 2) {
                routePopup = new maplibregl.Popup().setLngLat([(startPt[0] + endPt[0]) / 2, (startPt[1] + endPt[1]) / 2]).setHTML('<div style="padding:8px;color:#111827">No walking path found between points.</div>').addTo(map.current);
                try {
                  sVirt.cleanup();
                  eVirt.cleanup();
                } catch {
                }
                return;
              }
            }
            const coords = path.map((id) => {
              const n = graph.nodes[id];
              return [n.lng, n.lat];
            });
            console.log("A* path length:", coords.length);
            fullRouteCoords = coords;
            routeProgressIndex = 0;
            lastTrimPos = null;
            renderRouteLine(coords);
            showRoutePopup(coords);
            startRouteTracking();
            try {
              sVirt.cleanup();
              eVirt.cleanup();
            } catch {
            }
            try {
              let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
              for (const [lng, lat] of coords) {
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
              }
              map.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, maxZoom: 19, duration: 600 });
            } catch {
            }
          };
          const clearWalk = () => {
            stopRouteTracking();
            fullRouteCoords = null;
            routeProgressIndex = 0;
            startPt = null;
            endPt = null;
            startLabel = "";
            endLabel = "";
            if (map.current.getSource("walk-start")) map.current.getSource("walk-start").setData({ type: "FeatureCollection", features: [] });
            if (map.current.getSource("walk-end")) map.current.getSource("walk-end").setData({ type: "FeatureCollection", features: [] });
            if (map.current.getSource("walk-route")) map.current.getSource("walk-route").setData({ type: "FeatureCollection", features: [] });
            syncHighlightedBuildingMarkers();
            removeDebugLayers();
            if (routePopup) {
              try {
                routePopup.remove();
              } catch {
              }
              routePopup = null;
            }
            notifyRouteState();
          };
          const geocodeAndSet = async (which, text) => {
            const t = text.trim();
            if (!t) return;
            const comma = t.indexOf(",");
            if (comma !== -1) {
              const a = parseFloat(t.slice(0, comma));
              const b = parseFloat(t.slice(comma + 1));
              if (!Number.isNaN(a) && !Number.isNaN(b)) {
                setPoint(which, a, b, t);
                await tryComputeRoute();
                return;
              }
            }
            try {
              if (labelsCache?.features?.length) {
                const q = t.toLowerCase();
                let best = null;
                let bestScore = -1;
                let bestName = t;
                for (const f of labelsCache.features) {
                  const name = (f.properties?.name || f.properties?.amenity || f.properties?.building || "").toString();
                  if (!name) continue;
                  const nm = name.toLowerCase();
                  if (nm.includes(q)) {
                    const c = f.geometry?.coordinates;
                    if (Array.isArray(c)) {
                      const center = map.current.getCenter();
                      const dx = Math.abs(center.lng - c[0]);
                      const dy = Math.abs(center.lat - c[1]);
                      const score = 1 / (dx + dy + 1e-6);
                      if (score > bestScore) {
                        bestScore = score;
                        best = c;
                        bestName = name;
                      }
                    }
                  }
                }
                if (best) {
                  setPoint(which, best[0], best[1], bestName);
                  await tryComputeRoute();
                  return;
                }
              }
            } catch {
            }
            const localMatch = knownLocations.find((loc) => loc.name.toLowerCase().includes(t.toLowerCase()));
            if (localMatch) {
              setPoint(which, localMatch.coordinates[0], localMatch.coordinates[1], localMatch.name);
              await tryComputeRoute();
              return;
            }
            try {
              const bnds = map.current.getBounds();
              const west = bnds.getWest(), south = bnds.getSouth(), east = bnds.getEast(), north = bnds.getNorth();
              const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=${west},${north},${east},${south}&q=${encodeURIComponent(t)}`;
              const r = await fetch(url, { headers: { "Accept": "application/json" } });
              const j = await r.json();
              if (Array.isArray(j) && j.length) {
                const { lon, lat, display_name } = j[0];
                setPoint(which, parseFloat(lon), parseFloat(lat), display_name || t);
                await tryComputeRoute();
              }
            } catch {
            }
          };
          const swapPoints = () => {
            if (!startPt && !endPt) return;
            const tmpPt = startPt;
            startPt = endPt;
            endPt = tmpPt;
            const tmpLabel = startLabel;
            startLabel = endLabel;
            endLabel = tmpLabel;
            if (startPt) setPoint("start", startPt[0], startPt[1]);
            else if (map.current.getSource("walk-start")) map.current.getSource("walk-start").setData({ type: "FeatureCollection", features: [] });
            if (endPt) setPoint("end", endPt[0], endPt[1]);
            else if (map.current.getSource("walk-end")) map.current.getSource("walk-end").setData({ type: "FeatureCollection", features: [] });
            notifyRouteState();
            tryComputeRoute();
          };
          const triggerGps = () => {
            if (!navigator.geolocation) {
              alert("Geolocation is not supported by your browser.");
              return;
            }
            const isSecure = geolocationAllowed();
            if (!isSecure) {
              alert("Geolocation requires HTTPS or localhost.");
              return;
            }
            startContinuousGps();
            if (lastKnownUserPos) {
              const { lng, lat, accuracy } = lastKnownUserPos;
              const label = `My Location (\xB1${Math.round(accuracy)}m)`;
              setPoint("start", lng, lat, label);
              map.current?.flyTo({ center: [lng, lat], zoom: 18, duration: 1e3 });
              tryComputeRoute();
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lng = pos.coords.longitude;
                const lat = pos.coords.latitude;
                const accuracy = pos.coords.accuracy;
                const label = `My Location (\xB1${Math.round(accuracy)}m)`;
                setPoint("start", lng, lat, label);
                map.current?.flyTo({ center: [lng, lat], zoom: 18, duration: 1e3 });
                tryComputeRoute();
              },
              (err) => {
                let errorMsg = "Could not get your location";
                switch (err.code) {
                  case err.PERMISSION_DENIED:
                    errorMsg = "Permission denied. Please allow location access in your browser settings.";
                    break;
                  case err.POSITION_UNAVAILABLE:
                    errorMsg = "Location unavailable. Try turning on GPS.";
                    break;
                  case err.TIMEOUT:
                    errorMsg = "Location request timed out. Please try again.";
                    break;
                }
                alert(errorMsg);
              },
              { enableHighAccuracy: true, timeout: 3e4, maximumAge: 0 }
            );
          };
          if (!map.current.getSource("walk-start")) map.current.addSource("walk-start", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          if (!map.current.getLayer("walk-start")) map.current.addLayer({ id: "walk-start", type: "circle", source: "walk-start", paint: { "circle-radius": 7, "circle-color": "#10B981", "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
          if (!map.current.getSource("walk-end")) map.current.addSource("walk-end", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          if (!map.current.getLayer("walk-end")) map.current.addLayer({ id: "walk-end", type: "circle", source: "walk-end", paint: { "circle-radius": 7, "circle-color": "#EF4444", "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
          try {
            if (map.current.getLayer("walk-start")) map.current.setLayoutProperty("walk-start", "visibility", "none");
            if (map.current.getLayer("walk-end")) map.current.setLayoutProperty("walk-end", "visibility", "none");
          } catch {
          }
          walkApiRef.current = {
            setPoint: (which, lng, lat, label) => {
              setPoint(which, lng, lat, label);
              tryComputeRoute();
            },
            clearWalk,
            tryComputeRoute,
            geocodeAndSet,
            stopRouteTracking,
            stopContinuousGps,
            setSelecting: (mode) => {
              selecting = mode;
            },
            swapPoints,
            getLabels: () => ({ start: startLabel, end: endLabel })
          };
          const gpsBtn = document.createElement("button");
          gpsBtn.style.display = "none";
          gpsBtn.setAttribute("data-gps-btn", "true");
          gpsBtnRef.current = gpsBtn;
          gpsBtn.onclick = () => triggerGps();
          document.body.appendChild(gpsBtn);
          startContinuousGps();
          map.current.on("click", async (e) => {
            if (!selecting) return;
            const { lng, lat } = e.lngLat;
            setPoint(selecting, lng, lat);
            selecting = null;
            await tryComputeRoute();
          });
        } catch (err) {
          console.warn("Walking routing UI failed to initialize", err);
        }
        map.current?.on("contextmenu", (e) => {
          e.preventDefault();
          map.current?.easeTo({
            center: nustCenter,
            zoom: 16.5,
            pitch: 0,
            bearing: 0,
            duration: 1e3
          });
        });
        function add3DBuildings() {
          if (!map.current) return;
          const nustBuildings = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {
                  name: "Engineering Building",
                  height: 25,
                  campus: "Main Campus",
                  color: "#4A90E2"
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [[
                    [17.0835, -22.5675],
                    [17.084, -22.5675],
                    [17.084, -22.568],
                    [17.0835, -22.568],
                    [17.0835, -22.5675]
                  ]]
                }
              },
              {
                type: "Feature",
                properties: {
                  name: "NUST Library",
                  height: 20,
                  campus: "Main Campus",
                  color: "#50C878"
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [[
                    [17.0845, -22.5678],
                    [17.085, -22.5678],
                    [17.085, -22.5683],
                    [17.0845, -22.5683],
                    [17.0845, -22.5678]
                  ]]
                }
              },
              {
                type: "Feature",
                properties: {
                  name: "Faculty of Health and Applied Sciences",
                  height: 22,
                  campus: "Main Campus",
                  color: "#FF6B6B"
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [[
                    [17.0855, -22.568],
                    [17.086, -22.568],
                    [17.086, -22.5685],
                    [17.0855, -22.5685],
                    [17.0855, -22.568]
                  ]]
                }
              },
              {
                type: "Feature",
                properties: {
                  name: "Biodiversity Research Centre",
                  height: 15,
                  campus: "Main Campus",
                  color: "#9B59B6"
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [[
                    [17.084, -22.5685],
                    [17.0845, -22.5685],
                    [17.0845, -22.569],
                    [17.084, -22.569],
                    [17.084, -22.5685]
                  ]]
                }
              },
              {
                type: "Feature",
                properties: {
                  name: "Lower Campus Building",
                  height: 18,
                  campus: "Lower Campus",
                  color: "#F39C12"
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [[
                    [17.082, -22.5695],
                    [17.0825, -22.5695],
                    [17.0825, -22.57],
                    [17.082, -22.57],
                    [17.082, -22.5695]
                  ]]
                }
              }
            ]
          };
          map.current.addSource("nust-buildings", {
            type: "geojson",
            data: nustBuildings
          });
          map.current.addLayer({
            id: "nust-buildings-3d",
            type: "fill-extrusion",
            source: "nust-buildings",
            paint: {
              "fill-extrusion-color": ["get", "color"],
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": 0,
              "fill-extrusion-opacity": 0.7
            }
          });
          map.current.addLayer({
            id: "nust-buildings-labels",
            type: "symbol",
            source: "nust-buildings",
            layout: {
              "text-field": ["get", "name"],
              "text-font": ["Open Sans Bold"],
              "text-size": 12,
              "text-anchor": "top",
              "text-offset": [0, 1.5],
              "text-allow-overlap": false
            },
            paint: {
              "text-color": "#111827",
              "text-halo-color": "#ffffff",
              "text-halo-width": 2
            }
          });
          map.current.on("click", "nust-buildings-3d", (e) => {
            if (e.features && e.features[0]) {
              const props = e.features[0].properties;
              new Popup().setLngLat(e.lngLat).setHTML(`
                                <div style="padding:8px;color:#111827">
                                    <strong style="color:#111827">${props?.name || "Building"}</strong><br/>
                                    Height: ${props?.height || "N/A"}m<br/>
                                    Campus: ${props?.campus || "N/A"}
                                </div>
                            `).addTo(map.current);
            }
          });
          map.current.on("mouseenter", "nust-buildings-3d", () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = "pointer";
            }
          });
          map.current.on("mouseleave", "nust-buildings-3d", () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = "";
            }
          });
        }
        function addNUSTPOIs() {
          if (!map.current) return;
          const nustPOIs = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {
                  name: "NUST Main Gate",
                  type: "gate",
                  description: "Main entrance to NUST campus"
                },
                geometry: {
                  type: "Point",
                  coordinates: [17.0845, -22.5678]
                }
              },
              {
                type: "Feature",
                properties: {
                  name: "NUST Small Gate",
                  type: "gate",
                  description: "Small gate near B1 road"
                },
                geometry: {
                  type: "Point",
                  coordinates: [17.083, -22.5685]
                }
              },
              {
                type: "Feature",
                properties: {
                  name: "NUST Library",
                  type: "building",
                  description: "Main library building"
                },
                geometry: {
                  type: "Point",
                  coordinates: [17.0845, -22.5678]
                }
              },
              {
                type: "Feature",
                properties: {
                  name: "INDIA - NAMIBIA CENTRE OF EXCELLENCE IN INFORMATION TECHNOLOGY",
                  type: "building",
                  description: "IT Centre of Excellence"
                },
                geometry: {
                  type: "Point",
                  coordinates: [17.0855, -22.568]
                }
              }
            ]
          };
          map.current.addSource("nust-pois", {
            type: "geojson",
            data: nustPOIs
          });
          map.current.addLayer({
            id: "nust-pois-markers",
            type: "circle",
            source: "nust-pois",
            paint: {
              "circle-radius": [
                "case",
                ["==", ["get", "type"], "gate"],
                10,
                8
              ],
              "circle-color": [
                "case",
                ["==", ["get", "type"], "gate"],
                "#FF6B6B",
                "#4A90E2"
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff"
            }
          });
          map.current.on("click", "nust-pois-markers", (e) => {
            if (e.features && e.features[0]) {
              const props = e.features[0].properties;
              new Popup().setLngLat(e.lngLat).setHTML(`
                                <div style="padding:8px;color:#111827">
                                    <strong style="color:#111827">${props?.name || "Location"}</strong><br/>
                                    <span style="color:#666;font-size:12px">${props?.type || ""}</span>
                                </div>
                            `).addTo(map.current);
            }
          });
          map.current.on("mouseenter", "nust-pois-markers", () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = "pointer";
            }
          });
          map.current.on("mouseleave", "nust-pois-markers", () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = "";
            }
          });
        }
        function goToMainCampus() {
          if (!map.current) return;
          map.current.easeTo({
            center: CAMPUS_LOCATIONS.main,
            zoom: 17,
            pitch: 45,
            bearing: 0,
            duration: 1e3
          });
        }
        function goToLowerCampus() {
          if (!map.current) return;
          map.current.easeTo({
            center: CAMPUS_LOCATIONS.lower,
            zoom: 17,
            pitch: 45,
            bearing: 0,
            duration: 1e3
          });
        }
      });
    }
    return () => {
      walkApiRef.current?.stopContinuousGps?.();
      walkApiRef.current?.stopRouteTracking?.();
      if (keyHandlerRef.current) {
        window.removeEventListener("keydown", keyHandlerRef.current);
        keyHandlerRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  useImperativeHandle(ref, () => ({
    findRoute: () => {
      walkApiRef.current?.tryComputeRoute();
    },
    clearRoute: () => {
      walkApiRef.current?.clearWalk();
    },
    goToMainCampus: () => {
      if (!map.current) return;
      map.current.easeTo({ center: CAMPUS_LOCATIONS.main, zoom: 17, pitch: 45, bearing: 0, duration: 1e3 });
    },
    goToLowerCampus: () => {
      if (!map.current) return;
      map.current.easeTo({ center: CAMPUS_LOCATIONS.lower, zoom: 17, pitch: 45, bearing: 0, duration: 1e3 });
    },
    setStart: (lng, lat, label) => {
      walkApiRef.current?.setPoint("start", lng, lat, label);
    },
    setEnd: (lng, lat, label) => {
      walkApiRef.current?.setPoint("end", lng, lat, label);
    },
    flyTo: (lng, lat, zoom = 18) => {
      map.current?.flyTo({ center: [lng, lat], zoom, duration: 800 });
    },
    geocodeAndSet: (which, text) => walkApiRef.current?.geocodeAndSet(which, text) ?? Promise.resolve(),
    useGpsLocation: () => {
      gpsBtnRef.current?.click();
    },
    startMapPick: (which) => {
      walkApiRef.current?.setSelecting(which);
    },
    swapPoints: () => {
      walkApiRef.current?.swapPoints();
    }
  }));
  return <div className="relative w-full h-full" style={{ minHeight: "500px" }}>
            <div
    ref={mapContainer}
    className="w-full h-full"
  />
            <MapCoordinateDebug
    enabled={coordDebugEnabled}
    onToggle={toggleCoordDebug}
    coords={hoverCoords}
  />
        </div>;
});
MapComponent.displayName = "MapComponent";
var stdin_default = MapComponent;
export {
  CAMPUS_LOCATIONS,
  stdin_default as default
};
