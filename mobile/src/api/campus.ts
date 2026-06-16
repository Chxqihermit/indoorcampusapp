import { apiFetch } from '@/api/client';
import { knownLocations } from '@/data/knownLocations';
import type { Building, Floor, IndoorLocation, SearchResult, SearchScope } from '@/types';

export async function searchStaff(query: string): Promise<SearchResult[]> {
  const data = await apiFetch<Array<{
    id: number;
    full_name: string;
    staff_position: string | null;
    building_id: string;
    building_name: string | null;
    room_no: string | null;
    coordinates: [number, number] | null;
  }>>(`/staff/search?q=${encodeURIComponent(query)}`);

  return data.map((member) => ({
    id: `staff-${member.id}`,
    name: member.full_name,
    subtitle: `${member.building_name ?? member.building_id}${member.room_no ? `, Room ${member.room_no}` : ''}${member.staff_position ? ` · ${member.staff_position}` : ''}`,
    type: 'staff',
    coordinates: member.coordinates ?? undefined,
    staffId: member.id,
    buildingId: member.building_id,
    roomNo: member.room_no ?? undefined,
  }));
}

export async function searchCampusBuildingsDb(query: string): Promise<SearchResult[]> {
  const data = await apiFetch<Array<{
    building_id: string;
    building_name: string;
    coordinates: [number, number] | null;
  }>>(`/campus-buildings/search?q=${encodeURIComponent(query)}`);

  return data.map((building) => ({
    id: `db-building-${building.building_id}`,
    name: building.building_name,
    subtitle: `Building ${building.building_id}`,
    type: 'building',
    coordinates: building.coordinates ?? undefined,
    buildingId: building.building_id,
  }));
}

export function searchKnownLocations(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return knownLocations
    .filter((loc) => loc.name.toLowerCase().includes(q))
    .slice(0, 10)
    .map((loc) => ({
      id: `known-${loc.name}`,
      name: loc.name,
      subtitle: 'NUST Campus, Windhoek',
      type: 'building' as const,
      coordinates: loc.coordinates,
    }));
}

export async function searchIndoor(query: string): Promise<SearchResult[]> {
  const data = await apiFetch<Array<{
    id: number;
    name: string;
    display_name: string;
    floor_id: number;
  }>>(`/locations/search?q=${encodeURIComponent(query)}`);

  return data.map((loc) => ({
    id: `indoor-${loc.id}`,
    name: loc.name,
    subtitle: loc.display_name,
    type: 'indoor',
    indoorId: loc.id,
  }));
}

function mergeResults(...groups: SearchResult[][]): SearchResult[] {
  const seen = new Set<string>();
  const merged: SearchResult[] = [];
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

export async function searchCampus(query: string, scope: SearchScope = 'all'): Promise<SearchResult[]> {
  if (scope === 'staff') return searchStaff(query);
  if (scope === 'building') {
    const [db, known, indoor] = await Promise.all([
      searchCampusBuildingsDb(query),
      Promise.resolve(searchKnownLocations(query)),
      searchIndoor(query),
    ]);
    return mergeResults(db, known, indoor).slice(0, 12);
  }

  const [staff, db, known, indoor] = await Promise.all([
    searchStaff(query),
    searchCampusBuildingsDb(query),
    Promise.resolve(searchKnownLocations(query)),
    searchIndoor(query),
  ]);
  return mergeResults(staff, db, known, indoor).slice(0, 12);
}

export async function getBuildings(): Promise<Building[]> {
  return apiFetch<Building[]>('/buildings');
}

export async function getFloors(buildingId: number): Promise<Floor[]> {
  return apiFetch<Floor[]>(`/building/${buildingId}/floors`);
}

export async function getFloorLocations(floorId: number): Promise<IndoorLocation[]> {
  const res = await apiFetch<{ success: boolean; data: IndoorLocation[] }>(`/floor/${floorId}/locations`);
  return res.data ?? [];
}

export async function calculateIndoorPath(startId: number, endId: number) {
  return apiFetch<{ success: boolean; data: { path: IndoorLocation[]; distance: number } }>(
    `/path/${startId}/${endId}`,
  );
}

export async function getWifiAccessPoints(floorId: number) {
  return apiFetch<Array<{ id: number; ssid: string; bssid: string; x: number; y: number }>>(
    `/floor/${floorId}/wifi-access-points`,
  );
}

export async function scanWifiNetworks() {
  return apiFetch<Array<{ ssid: string; bssid: string; rssi: number }>>('/scan-wifi-networks');
}

export async function recordUserPosition(payload: Record<string, unknown>) {
  return apiFetch('/user-position', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
