import { fetchGeoJson } from "@/api/client";
let graphCache = null;
function haversine([lng1, lat1], [lng2, lat2]) {
  const R = 6371e3;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function coordsKey([lng, lat]) {
  return `${lng.toFixed(6)},${lat.toFixed(6)}`;
}
function addEdge(graph, a, b) {
  const keyA = coordsKey(a);
  const keyB = coordsKey(b);
  if (!graph[keyA]) graph[keyA] = [];
  if (!graph[keyB]) graph[keyB] = [];
  const dist = haversine(a, b);
  graph[keyA].push({ to: keyB, dist });
  graph[keyB].push({ to: keyA, dist });
}
async function loadWalkGraph() {
  if (graphCache) {
    return graphCache;
  }
  const data = await fetchGeoJson("nust-walkways");
  const graph = {};
  for (const feature of data.features ?? []) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    if (geometry.type === "LineString" && Array.isArray(geometry.coordinates)) {
      const coords = geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i++) {
        addEdge(graph, coords[i], coords[i + 1]);
      }
    }
  }
  graphCache = graph;
  return graph;
}
function findNearestNode(graph, lng, lat) {
  let minDist = Infinity;
  let nearest = null;
  for (const key of Object.keys(graph)) {
    const [nLng, nLat] = key.split(",").map(Number);
    const d = haversine([lng, lat], [nLng, nLat]);
    if (d < minDist) {
      minDist = d;
      nearest = key;
    }
  }
  return nearest;
}
function dijkstra(graph, startKey, endKey) {
  const dist = {};
  const prev = {};
  const visited = /* @__PURE__ */ new Set();
  dist[startKey] = 0;
  const queue = [[0, startKey]];
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [d, u2] = queue.shift();
    if (visited.has(u2)) continue;
    visited.add(u2);
    if (u2 === endKey) break;
    for (const edge of graph[u2] ?? []) {
      const alt = d + edge.dist;
      if (alt < (dist[edge.to] ?? Infinity)) {
        dist[edge.to] = alt;
        prev[edge.to] = u2;
        queue.push([alt, edge.to]);
      }
    }
  }
  const path = [];
  let u = endKey;
  while (u && u !== startKey) {
    path.unshift(u);
    u = prev[u];
  }
  if (u === startKey) {
    path.unshift(startKey);
  }
  return path;
}
function pathKeysToCoords(path) {
  return path.map((key) => {
    const [lng, lat] = key.split(",").map(Number);
    return { latitude: lat, longitude: lng };
  });
}
function routeDistanceMeters(coords) {
  return coords.reduce((sum, c, i) => {
    if (i === 0) return 0;
    const prev = coords[i - 1];
    return sum + haversine(
      [prev.longitude, prev.latitude],
      [c.longitude, c.latitude]
    );
  }, 0);
}
async function computeWalkRoute(startLng, startLat, endLng, endLat) {
  const graph = await loadWalkGraph();
  const startKey = findNearestNode(graph, startLng, startLat);
  const endKey = findNearestNode(graph, endLng, endLat);
  if (!startKey || !endKey) {
    return null;
  }
  const path = dijkstra(graph, startKey, endKey);
  if (path.length < 2) {
    return null;
  }
  return pathKeysToCoords(path);
}
export {
  computeWalkRoute,
  dijkstra,
  findNearestNode,
  loadWalkGraph,
  pathKeysToCoords,
  routeDistanceMeters
};
