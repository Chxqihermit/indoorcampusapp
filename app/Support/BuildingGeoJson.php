<?php

namespace App\Support;

class BuildingGeoJson
{
    /** @var array<string, array{name: string, coordinates: array{0: float, 1: float}}>|null */
    private static ?array $index = null;

    /**
     * @return array<string, array{name: string, coordinates: array{0: float, 1: float}}>
     */
    public static function index(): array
    {
        if (self::$index !== null) {
            return self::$index;
        }

        $path = public_path('data/nust-buildings.geojson');
        if (! is_file($path)) {
            return self::$index = [];
        }

        $data = json_decode((string) file_get_contents($path), true);
        $index = [];

        foreach ($data['features'] ?? [] as $feature) {
            $id = $feature['properties']['id'] ?? null;
            $coords = $feature['geometry']['coordinates'] ?? null;
            if (! $id || ! is_array($coords) || count($coords) < 2) {
                continue;
            }

            $index[(string) $id] = [
                'name' => (string) ($feature['properties']['name'] ?? $id),
                'coordinates' => [(float) $coords[0], (float) $coords[1]],
            ];
        }

        return self::$index = $index;
    }

    /**
     * @return array{name: string, coordinates: array{0: float, 1: float}}|null
     */
    public static function lookup(string $buildingId): ?array
    {
        return self::index()[$buildingId] ?? null;
    }
}
