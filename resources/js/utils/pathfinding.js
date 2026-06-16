function findShortestPath(nodes, paths, startNodeId, endNodeId) {
  const distances = {};
  const previous = {};
  const unvisited = /* @__PURE__ */ new Set();
  nodes.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });
  distances[startNodeId] = 0;
  while (unvisited.size > 0) {
    let currentId = null;
    unvisited.forEach((id) => {
      if (currentId === null || distances[id] < distances[currentId]) {
        currentId = id;
      }
    });
    if (currentId === null || distances[currentId] === Infinity || currentId === endNodeId) {
      break;
    }
    unvisited.delete(currentId);
    const connections = paths.filter((p) => p.start_location_id === currentId || p.end_location_id === currentId);
    for (const path of connections) {
      const neighborId = path.start_location_id === currentId ? path.end_location_id : path.start_location_id;
      if (!unvisited.has(neighborId)) continue;
      const alt = distances[currentId] + path.distance;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentId;
      }
    }
  }
  const pathIds = [];
  let curr = endNodeId;
  while (curr !== null) {
    pathIds.unshift(curr);
    curr = previous[curr];
  }
  return pathIds[0] === startNodeId ? pathIds : [];
}
export {
  findShortestPath
};
