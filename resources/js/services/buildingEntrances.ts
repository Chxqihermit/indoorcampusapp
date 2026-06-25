export interface BuildingEntrance {
  buildingId: string;
  name: string;
  outdoor: { lat: number; lng: number };
  indoor: { floorId: number; vertexId: number };
}

// Maps building IDs (from buildings.ts) to their outdoor entrance coordinates
// and indoor entry vertex. To add a new building: append an entry here —
// no other files need to change.
//
// Tip: use the MapCoordinateDebug overlay on the campus map to read exact
// lat/lng for any entrance point.
export const BUILDING_ENTRANCES: Record<string, BuildingEntrance> = {
  library: {
    buildingId: 'library',
    name: 'Library Main Entrance',
    // Approximate — verify with MapCoordinateDebug tool and update as needed
    outdoor: { lat: -22.55980, lng: 17.07325 },
    indoor: { floorId: 2, vertexId: 15 }, // Ground Floor, vertex 15 = "Library Entrance"
  },
};

export function getEntranceForBuilding(buildingId: string): BuildingEntrance | undefined {
  return BUILDING_ENTRANCES[buildingId];
}
