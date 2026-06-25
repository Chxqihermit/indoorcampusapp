import { knownLocations } from '@/components/knownLocations';
import { BUILDINGS } from '@/services/buildings';
import { getFloorGraphData } from '@/services/graphData';

const RECENT_KEY = 'campusnav-recent-searches';
const MAX_RECENTS = 8;

export function getRecentSearches() {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function saveRecentSearch(result) {
    const recents = getRecentSearches().filter((r) => r.id !== result.id);
    const storedType = result.type === 'staff' || result.type === 'building' || result.type === 'indoor'
        ? result.type
        : 'recent';
    recents.unshift({ ...result, type: storedType });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
}

export function clearRecentSearches() {
    localStorage.removeItem(RECENT_KEY);
}

function categorizeLocation(name, type) {
    const lower = name.toLowerCase();
    if (lower.includes('atm')) return 'atm';
    if (lower.includes('parking')) return 'parking';
    if (lower.includes('restaurant') || lower.includes('dining') || lower.includes('tuck shop')) return 'restaurant';
    if (lower.includes('gate')) return 'gate';
    return type || 'building';
}

export function searchCampusLocations(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return knownLocations
        .filter((loc) => loc.name.toLowerCase().includes(q))
        .slice(0, 8)
        .map((loc) => ({
            id: `building-${loc.name}`,
            name: loc.name,
            subtitle: 'NUST Campus, Windhoek',
            type: categorizeLocation(loc.name, loc.type),
            coordinates: loc.coordinates,
        }));
}

export async function searchCampusBuildingsFromDb(query) {
    const q = query.trim();
    if (!q) return [];

    try {
        const res = await fetch(`/api/campus-buildings/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((building) => ({
            id: `campus-building-${building.building_id}`,
            name: building.building_name,
            subtitle: `Building ${building.building_id} · NUST Campus`,
            type: 'building',
            coordinates: building.coordinates ?? undefined,
            buildingId: building.building_id,
        }));
    } catch {
        return [];
    }
}

export async function searchStaff(query) {
    const q = query.trim();
    if (!q || q.length < 2) return [];

    try {
        const res = await fetch(`/api/staff/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((member) => {
            const buildingLabel = member.building_name ?? member.building_id;
            const roomLabel = member.room_no ? `, Room ${member.room_no}` : '';
            const roleLabel = member.staff_position ? ` · ${member.staff_position}` : '';

            return {
                id: `staff-${member.id}`,
                name: member.full_name,
                subtitle: `${buildingLabel}${roomLabel}${roleLabel}`,
                type: 'staff',
                coordinates: member.coordinates ?? undefined,
                staffId: member.id,
                buildingId: member.building_id,
                buildingName: buildingLabel,
                roomNo: member.room_no ?? undefined,
                staffPosition: member.staff_position ?? undefined,
                email: member.email ?? undefined,
            };
        });
    } catch {
        return [];
    }
}

export async function searchIndoorLocations(query) {
    const q = query.trim();
    if (!q || q.length < 2) return [];

    try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((loc) => ({
            id: `indoor-${loc.id}`,
            name: loc.name,
            subtitle: loc.display_name || loc.building_name,
            type: 'indoor',
            indoorId: loc.id,
            floorId: loc.floor_id,
        }));
    } catch {
        return [];
    }
}

function mergeResults(...groups) {
    const seen = new Set();
    const merged = [];

    for (const group of groups) {
        for (const result of group) {
            if (!seen.has(result.id)) {
                seen.add(result.id);
                merged.push(result);
            }
        }
    }

    return merged;
}

export function searchIndoorLocationsFromGraph(query) {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const results = [];
    for (const building of BUILDINGS) {
        for (const floor of building.floors) {
            try {
                const graphData = getFloorGraphData(floor.floorId);
                const matches = graphData.vertices
                    .filter(v => v.type !== 'walkway' && v.type !== 'exit')
                    .filter(v => v.name.toLowerCase().includes(q));
                for (const v of matches) {
                    results.push({
                        id: `graph-indoor-${floor.floorId}-${v.id}`,
                        name: v.name,
                        subtitle: `${building.name} · ${floor.name}`,
                        type: 'indoor',
                        indoorId: v.id,
                        floorId: floor.floorId,
                        buildingId: building.id,
                    });
                }
            } catch { continue; }
        }
    }
    return results;
}

export async function searchBuildings(query) {
    const campus = searchCampusLocations(query);
    const graphIndoor = searchIndoorLocationsFromGraph(query);
    const [dbBuildings, dbIndoor] = await Promise.all([
        searchCampusBuildingsFromDb(query),
        searchIndoorLocations(query),
    ]);

    return mergeResults(dbBuildings, campus, dbIndoor, graphIndoor).slice(0, 12);
}

export async function searchAll(query, scope = 'all') {
    if (scope === 'staff') {
        return searchStaff(query);
    }

    if (scope === 'building') {
        return searchBuildings(query);
    }

    const campus = searchCampusLocations(query);
    const graphIndoor = searchIndoorLocationsFromGraph(query);
    const [dbIndoor, staff, dbBuildings] = await Promise.all([
        searchIndoorLocations(query),
        searchStaff(query),
        searchCampusBuildingsFromDb(query),
    ]);

    return mergeResults(staff, dbBuildings, campus, dbIndoor, graphIndoor).slice(0, 12);
}

export const SEARCH_SCOPE_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'staff', label: 'Staff' },
    { id: 'building', label: 'Buildings' },
];

export const QUICK_CATEGORIES = [
    { label: 'Buildings', icon: 'building', filter: (n) => !n.toLowerCase().includes('parking') && !n.toLowerCase().includes('atm') },
    { label: 'Restaurants', icon: 'restaurant', filter: (n) => /restaurant|dining|tuck shop/i.test(n) },
    { label: 'Parking', icon: 'parking', filter: (n) => /parking/i.test(n) },
    { label: 'ATMs', icon: 'atm', filter: (n) => /atm/i.test(n) },
    { label: 'Hostels', icon: 'hostel', filter: (n) => /hostel/i.test(n) },
];

export function getCategoryResults(categoryIndex) {
    const cat = QUICK_CATEGORIES[categoryIndex];
    if (!cat) return [];

    return knownLocations
        .filter((loc) => cat.filter(loc.name))
        .slice(0, 8)
        .map((loc) => ({
            id: `building-${loc.name}`,
            name: loc.name,
            subtitle: 'NUST Campus, Windhoek',
            type: categorizeLocation(loc.name, loc.type),
            coordinates: loc.coordinates,
        }));
}
