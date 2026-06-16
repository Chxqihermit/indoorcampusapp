function euclideanDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
function nodeKey(nodeId, floorId) {
  return `${floorId}:${nodeId}`;
}
function buildIndoorGraph(nodes, paths, floors = []) {
  const graph = {};
  const nodeMap = /* @__PURE__ */ new Map();
  nodes.forEach((node) => {
    const key = nodeKey(node.id, node.floor_id);
    graph[key] = [];
    nodeMap.set(key, { ...node, floor_id: node.floor_id });
  });
  paths.forEach((path) => {
    if (!path.startLocation || !path.endLocation) return;
    const startKey = nodeKey(path.startLocation.id, path.startLocation.floor_id);
    const endKey = nodeKey(path.endLocation.id, path.endLocation.floor_id);
    const distance = path.distance || euclideanDistance(
      path.startLocation.x_coordinate,
      path.startLocation.y_coordinate,
      path.endLocation.x_coordinate,
      path.endLocation.y_coordinate
    );
    if (graph[startKey]) {
      graph[startKey].push({
        to: endKey,
        nodeId: path.endLocation.id,
        floorId: path.endLocation.floor_id,
        dist: distance
      });
    }
    if (graph[endKey]) {
      graph[endKey].push({
        to: startKey,
        nodeId: path.startLocation.id,
        floorId: path.startLocation.floor_id,
        dist: distance
      });
    }
  });
  const stairsByName = /* @__PURE__ */ new Map();
  nodes.filter((n) => n.type === "stairs").forEach((stair) => {
    const name = stair.name || `Stairs-${stair.id}`;
    if (!stairsByName.has(name)) {
      stairsByName.set(name, []);
    }
    stairsByName.get(name).push(stair);
  });
  stairsByName.forEach((stairsOnFloors) => {
    if (stairsOnFloors.length > 1) {
      const floorMap = new Map(floors.map((f) => [f.id, f.level]));
      stairsOnFloors.sort((a, b) => (floorMap.get(a.floor_id) || 0) - (floorMap.get(b.floor_id) || 0));
      for (let i = 0; i < stairsOnFloors.length - 1; i++) {
        const currentStair = stairsOnFloors[i];
        const nextStair = stairsOnFloors[i + 1];
        const currentKey = nodeKey(currentStair.id, currentStair.floor_id);
        const nextKey = nodeKey(nextStair.id, nextStair.floor_id);
        const verticalDistance = 5;
        if (graph[currentKey]) {
          graph[currentKey].push({
            to: nextKey,
            nodeId: nextStair.id,
            floorId: nextStair.floor_id,
            dist: verticalDistance
          });
        }
        if (graph[nextKey]) {
          graph[nextKey].push({
            to: currentKey,
            nodeId: currentStair.id,
            floorId: currentStair.floor_id,
            dist: verticalDistance
          });
        }
      }
    }
  });
  return { graph, nodeMap };
}
function findNearestNodeOnFloor(nodes, floorId, x, y) {
  let minDist = Infinity;
  let nearest = null;
  nodes.filter((n) => n.floor_id === floorId).forEach((node) => {
    const dist = euclideanDistance(x, y, node.x_coordinate, node.y_coordinate);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  });
  return nearest;
}
function findShortestPath(graph, nodeMap, startKey, endKey) {
  const dist = {};
  const prev = {};
  const visited = /* @__PURE__ */ new Set();
  dist[startKey] = 0;
  const queue = [[0, startKey]];
  while (queue.length > 0) {
    queue.sort((a, b) => a[0] - b[0]);
    const [d, u2] = queue.shift();
    if (visited.has(u2)) continue;
    visited.add(u2);
    if (u2 === endKey) break;
    const neighbors = graph[u2] || [];
    for (const edge of neighbors) {
      const v = edge.to;
      const alt = d + edge.dist;
      if (alt < (dist[v] ?? Infinity)) {
        dist[v] = alt;
        prev[v] = u2;
        queue.push([alt, v]);
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
function extractRouteSteps(pathKeys, nodeMap, paths, floorMap = /* @__PURE__ */ new Map()) {
  const steps = [];
  let currentFloor = null;
  let stepNumber = 0;
  for (let i = 0; i < pathKeys.length - 1; i++) {
    const fromKey = pathKeys[i];
    const toKey = pathKeys[i + 1];
    const fromNode = nodeMap.get(fromKey);
    const toNode = nodeMap.get(toKey);
    if (!fromNode || !toNode) continue;
    if (fromNode.floor_id !== toNode.floor_id) {
      stepNumber++;
      const fromFloor = floorMap.get(fromNode.floor_id) || { level: fromNode.floor_id, name: `Floor ${fromNode.floor_id}` };
      const toFloor = floorMap.get(toNode.floor_id) || { level: toNode.floor_id, name: `Floor ${toNode.floor_id}` };
      const verticalPath = paths.find(
        (p) => p.startLocation?.id === fromNode.id && p.endLocation?.id === toNode.id || p.startLocation?.id === toNode.id && p.endLocation?.id === fromNode.id
      );
      steps.push({
        step: stepNumber,
        floor_id: fromNode.floor_id,
        floor_level: fromFloor.level,
        start_location_id: fromNode.id,
        start_name: fromNode.name || "Current Location",
        end_location_id: toNode.id,
        end_name: toNode.name || `${toFloor.name}`,
        distance: verticalPath?.distance || 5,
        instruction: `Proceed to ${fromNode.name || "stairs/elevator"} and climb/take elevator to ${toFloor.name}`,
        nodes: [fromNode, toNode],
        paths: verticalPath ? [verticalPath.id] : []
      });
      currentFloor = toNode.floor_id;
    } else if (fromNode.floor_id !== currentFloor) {
      currentFloor = fromNode.floor_id;
      stepNumber++;
      const floorInfo = floorMap.get(fromNode.floor_id) || { level: fromNode.floor_id, name: `Floor ${fromNode.floor_id}` };
      steps.push({
        step: stepNumber,
        floor_id: fromNode.floor_id,
        floor_level: floorInfo.level,
        start_location_id: fromNode.id,
        start_name: fromNode.name || "Start",
        end_location_id: toNode.id,
        end_name: toNode.name || "Destination",
        distance: 0,
        instruction: `You are now on ${floorInfo.name}. Walk to ${toNode.name}`,
        nodes: [fromNode, toNode],
        paths: []
      });
    } else {
      const nodePath = paths.find(
        (p) => p.startLocation?.id === fromNode.id && p.endLocation?.id === toNode.id || p.startLocation?.id === toNode.id && p.endLocation?.id === fromNode.id
      );
      if (!steps.some((s) => s.step === stepNumber) && stepNumber === 0) {
        stepNumber++;
        const floorInfo = floorMap.get(fromNode.floor_id) || { level: fromNode.floor_id, name: `Floor ${fromNode.floor_id}` };
        steps.push({
          step: stepNumber,
          floor_id: fromNode.floor_id,
          floor_level: floorInfo.level,
          start_location_id: fromNode.id,
          start_name: fromNode.name || "Start",
          end_location_id: toNode.id,
          end_name: toNode.name || "Destination",
          distance: nodePath?.distance || euclideanDistance(fromNode.x_coordinate, fromNode.y_coordinate, toNode.x_coordinate, toNode.y_coordinate),
          instruction: `Walk to ${toNode.name || "destination"}`,
          nodes: [fromNode, toNode],
          paths: nodePath ? [nodePath.id] : []
        });
      }
    }
  }
  return steps;
}
async function calculateIndoorRoute(startLocationId, endLocationId, nodes, paths, floors = []) {
  const { graph, nodeMap } = buildIndoorGraph(nodes, paths, floors);
  const startNode = nodes.find((n) => n.id === startLocationId);
  const endNode = nodes.find((n) => n.id === endLocationId);
  if (!startNode || !endNode) {
    console.error("Start or end location not found");
    return null;
  }
  const startKey = nodeKey(startNode.id, startNode.floor_id);
  const endKey = nodeKey(endNode.id, endNode.floor_id);
  if (!graph[startKey] || !graph[endKey]) {
    console.error("Start or end location not in graph");
    return null;
  }
  const pathKeys = findShortestPath(graph, nodeMap, startKey, endKey);
  if (pathKeys.length === 0) {
    console.error("No path found");
    return null;
  }
  const floorMap = new Map(floors.map((f) => [f.id, { level: f.level, name: f.name }]));
  const steps = extractRouteSteps(pathKeys, nodeMap, paths, floorMap);
  const totalDistance = steps.reduce((sum, s) => sum + s.distance, 0);
  const estimatedTime = Math.ceil(totalDistance / 1.4);
  return {
    totalDistance,
    totalSteps: steps.length,
    steps,
    estimatedTime
  };
}
export {
  buildIndoorGraph,
  calculateIndoorRoute,
  extractRouteSteps,
  findNearestNodeOnFloor,
  findShortestPath
};
