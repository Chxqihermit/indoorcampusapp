import React from 'react';
import { Crosshair } from 'lucide-react';

export interface HoverCoordinates {
    lng: number;
    lat: number;
}

interface MapCoordinateDebugProps {
    enabled: boolean;
    onToggle: () => void;
    coords: HoverCoordinates | null;
}

export function formatCoords(coords: HoverCoordinates) {
    const lng = coords.lng.toFixed(6);
    const lat = coords.lat.toFixed(6);
    return {
        lng,
        lat,
        geojson: `[${lng}, ${lat}]`,
        human: `${lat}, ${lng}`,
    };
}

export default function MapCoordinateDebug({ enabled, onToggle, coords }: MapCoordinateDebugProps) {
    const formatted = coords ? formatCoords(coords) : null;

    return (
        <div className="map-coord-debug">
            <button
                type="button"
                onClick={onToggle}
                className={`map-coord-debug-toggle ${enabled ? 'map-coord-debug-toggle--on' : ''}`}
                title={enabled ? 'Hide coordinate debug' : 'Show coordinate debug'}
            >
                <Crosshair className="w-4 h-4" />
                <span>Coords</span>
            </button>

            {enabled && (
                <div className="map-coord-debug-panel">
                    {formatted ? (
                        <>
                            <div className="map-coord-debug-row">
                                <span className="map-coord-debug-label">Lng</span>
                                <code>{formatted.lng}</code>
                            </div>
                            <div className="map-coord-debug-row">
                                <span className="map-coord-debug-label">Lat</span>
                                <code>{formatted.lat}</code>
                            </div>
                            <div className="map-coord-debug-row map-coord-debug-row--full">
                                <span className="map-coord-debug-label">GeoJSON</span>
                                <code className="map-coord-debug-geojson">{formatted.geojson}</code>
                            </div>
                        </>
                    ) : (
                        <span className="map-coord-debug-hint">Hover over the map</span>
                    )}
                </div>
            )}
        </div>
    );
}
