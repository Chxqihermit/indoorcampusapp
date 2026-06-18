import { apiFetch } from "@/api/client";
import { knownLocations } from "@/data/knownLocations";
async function searchStaff(query) {
  const data = await apiFetch(`/staff/search?q=${encodeURIComponent(query)}`);
  return data.map((member) => {
    const buildingLabel = member.building_name ?? member.building_id;
    const roomLabel = member.room_no ? `, Room ${member.room_no}` : "";
    const roleLabel = member.staff_position ? ` · ${member.staff_position}` : "";
    return {
      id: `staff-${member.id}`,
      name: member.full_name,
      subtitle: `${buildingLabel}${roomLabel}${roleLabel}`,
      type: "staff",
      coordinates: member.coordinates ?? void 0,
      staffId: member.id,
      buildingId: member.building_id,
      buildingName: buildingLabel,
      roomNo: member.room_no ?? void 0,
      staffPosition: member.staff_position ?? void 0,
      email: member.email ?? void 0
    };
  });
}
async function searchCampusBuildingsDb(query) {
  const data = await apiFetch(`/campus-buildings/search?q=${encodeURIComponent(query)}`);
  return data.map((building) => ({
    id: `db-building-${building.building_id}`,
    name: building.building_name,
    subtitle: `Building ${building.building_id}`,
    type: "building",
    coordinates: building.coordinates ?? void 0,
    buildingId: building.building_id
  }));
}
function searchKnownLocations(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return knownLocations.filter((loc) => loc.name.toLowerCase().includes(q)).slice(0, 10).map((loc) => ({
    id: `known-${loc.name}`,
    name: loc.name,
    subtitle: "NUST Campus, Windhoek",
    type: "building",
    coordinates: loc.coordinates
  }));
}
async function searchIndoor(query) {
  const data = await apiFetch(`/locations/search?q=${encodeURIComponent(query)}`);
  return data.map((loc) => ({
    id: `indoor-${loc.id}`,
    name: loc.name,
    subtitle: loc.display_name,
    type: "indoor",
    indoorId: loc.id
  }));
}
function mergeResults(...groups) {
  const seen = /* @__PURE__ */ new Set();
  const merged = [];
  for (const group of groups) {
    for (const item of group) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
  }
  return merged;
}
async function searchCampus(query, scope = "all") {
  if (scope === "staff") return searchStaff(query);
  if (scope === "building") {
    const [db2, known2, indoor2] = await Promise.all([
      searchCampusBuildingsDb(query),
      Promise.resolve(searchKnownLocations(query)),
      searchIndoor(query)
    ]);
    return mergeResults(db2, known2, indoor2).slice(0, 12);
  }
  const [staff, db, known, indoor] = await Promise.all([
    searchStaff(query),
    searchCampusBuildingsDb(query),
    Promise.resolve(searchKnownLocations(query)),
    searchIndoor(query)
  ]);
  return mergeResults(staff, db, known, indoor).slice(0, 12);
}
async function getBuildings() {
  return apiFetch("/buildings");
}
async function getFloors(buildingId) {
  return apiFetch(`/building/${buildingId}/floors`);
}
async function getFloorLocations(floorId) {
  const res = await apiFetch(`/floor/${floorId}/locations`);
  return res.data ?? [];
}
async function calculateIndoorPath(startId, endId) {
  return apiFetch(
    `/path/${startId}/${endId}`
  );
}
async function getWifiAccessPoints(floorId) {
  return apiFetch(
    `/floor/${floorId}/wifi-access-points`
  );
}
async function scanWifiNetworks() {
  return apiFetch("/scan-wifi-networks");
}
async function recordUserPosition(payload) {
  return apiFetch("/user-position", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
export {
  calculateIndoorPath,
  getBuildings,
  getFloorLocations,
  getFloors,
  getWifiAccessPoints,
  recordUserPosition,
  scanWifiNetworks,
  searchCampus,
  searchCampusBuildingsDb,
  searchIndoor,
  searchKnownLocations,
  searchStaff
};
