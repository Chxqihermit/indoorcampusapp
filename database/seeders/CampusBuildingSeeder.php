<?php

namespace Database\Seeders;

use App\Models\CampusBuilding;
use Illuminate\Database\Seeder;
use RuntimeException;

class CampusBuildingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = public_path('data/nust-buildings.geojson');

        if (! is_file($path)) {
            throw new RuntimeException("GeoJSON file not found at: {$path}");
        }

        $data = json_decode(file_get_contents($path), true);

        if (! is_array($data) || ($data['type'] ?? null) !== 'FeatureCollection') {
            throw new RuntimeException('Invalid GeoJSON: expected a FeatureCollection.');
        }

        foreach ($data['features'] ?? [] as $feature) {
            $properties = $feature['properties'] ?? [];
            $buildingId = trim((string) ($properties['id'] ?? ''));
            $buildingName = trim((string) ($properties['name'] ?? ''));
            $type = $properties['type'] ?? 'building';

            if ($buildingId === '' || $buildingName === '' || $type !== 'building') {
                continue;
            }

            CampusBuilding::updateOrCreate(
                ['buildingID' => $buildingId],
                ['buildingName' => $buildingName]
            );
        }
    }
}
