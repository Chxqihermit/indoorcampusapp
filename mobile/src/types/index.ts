export type SearchScope = 'all' | 'staff' | 'building';

export type SearchResultType = 'building' | 'indoor' | 'staff';

export interface SearchResult {
  id: string;
  name: string;
  subtitle: string;
  type: SearchResultType;
  coordinates?: [number, number];
  indoorId?: number;
  staffId?: number;
  buildingId?: string;
  roomNo?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Building {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface Floor {
  id: number;
  building_id: number;
  level: number;
  name?: string;
  pdf_path?: string;
}

export interface IndoorLocation {
  id: number;
  name: string;
  type: string;
  floor_id: number;
  x: number;
  y: number;
}

export interface WifiAccessPoint {
  id: number;
  ssid: string;
  bssid: string;
  x: number;
  y: number;
  floor_id: number;
}
