import { knownLocations } from '@/components/knownLocations';

export type SearchResultType = 'building' | 'indoor' | 'recent' | 'gate' | 'parking' | 'restaurant' | 'atm';

export interface SearchResult {
    id: string;
    name: string;
    subtitle: string;
    type: SearchResultType;
    coordinates?: [number, number];
    indoorId?: number;
    floorId?: number;
}

const RECENT_KEY = 'campusnav-recent-searches';
const MAX_RECENTS = 8;

export function getRecentSearches(): SearchResult[] {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as SearchResult[];
    } catch {
        return [];
    }
}

export function saveRecentSearch(result: SearchResult): void {
    const recents = getRecentSearches().filter((r) => r.id !== result.id);
    recents.unshift({ ...result, type: 'recent' });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
}

export function clearRecentSearches(): void {
    localStorage.removeItem(RECENT_KEY);
}

function categorizeLocation(name: string, type?: string): SearchResultType {
    const lower = name.toLowerCase();
    if (lower.includes('atm')) return 'atm';
    if (lower.includes('parking')) return 'parking';
    if (lower.includes('restaurant') || lower.includes('dining') || lower.includes('tuck shop')) return 'restaurant';
    if (lower.includes('gate')) return 'gate';
    return (type as SearchResultType) || 'building';
}

export function searchCampusLocations(query: string): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const buildingResults: SearchResult[] = knownLocations
        .filter((loc) => loc.name.toLowerCase().includes(q))
        .slice(0, 8)
        .map((loc) => ({
            id: `building-${loc.name}`,
            name: loc.name,
            subtitle: 'NUST Campus, Windhoek',
            type: categorizeLocation(loc.name, loc.type),
            coordinates: loc.coordinates as [number, number],
        }));

    return buildingResults;
}

export async function searchIndoorLocations(query: string): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q || q.length < 2) return [];

    try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data as Array<{
            id: number;
            name: string;
            display_name: string;
            building_name: string;
            floor_id: number;
        }>).map((loc) => ({
            id: `indoor-${loc.id}`,
            name: loc.name,
            subtitle: loc.display_name || loc.building_name,
            type: 'indoor' as const,
            indoorId: loc.id,
            floorId: loc.floor_id,
        }));
    } catch {
        return [];
    }
}

export async function searchAll(query: string): Promise<SearchResult[]> {
    const campus = searchCampusLocations(query);
    const indoor = await searchIndoorLocations(query);

    const seen = new Set<string>();
    const merged: SearchResult[] = [];
    for (const r of [...campus, ...indoor]) {
        const key = r.name.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            merged.push(r);
        }
    }
    return merged.slice(0, 10);
}

export const QUICK_CATEGORIES = [
    { label: 'Buildings', icon: 'building', filter: (n: string) => !n.toLowerCase().includes('parking') && !n.toLowerCase().includes('atm') },
    { label: 'Restaurants', icon: 'restaurant', filter: (n: string) => /restaurant|dining|tuck shop/i.test(n) },
    { label: 'Parking', icon: 'parking', filter: (n: string) => /parking/i.test(n) },
    { label: 'ATMs', icon: 'atm', filter: (n: string) => /atm/i.test(n) },
    { label: 'Hostels', icon: 'hostel', filter: (n: string) => /hostel/i.test(n) },
] as const;

export function getCategoryResults(categoryIndex: number): SearchResult[] {
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
            coordinates: loc.coordinates as [number, number],
        }));
}
