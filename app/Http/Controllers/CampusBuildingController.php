<?php

namespace App\Http\Controllers;

use App\Models\CampusBuilding;
use App\Support\BuildingGeoJson;
use Illuminate\Http\Request;

class CampusBuildingController extends Controller
{
    public function search(Request $request)
    {
        $query = trim((string) $request->query('q', ''));
        if ($query === '') {
            return response()->json([]);
        }

        $like = '%'.$query.'%';

        $buildings = CampusBuilding::query()
            ->where('buildingName', 'like', $like)
            ->orWhere('buildingID', 'like', $like)
            ->orderBy('buildingName')
            ->limit(20)
            ->get();

        return response()->json($buildings->map(function (CampusBuilding $building) {
            $geoBuilding = BuildingGeoJson::lookup((string) $building->buildingID);

            return [
                'building_id' => $building->buildingID,
                'building_name' => $building->buildingName,
                'coordinates' => $geoBuilding['coordinates'] ?? null,
            ];
        }));
    }
}
