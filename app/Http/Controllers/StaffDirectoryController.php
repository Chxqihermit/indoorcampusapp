<?php

namespace App\Http\Controllers;

use App\Models\StaffDirectory;
use App\Support\BuildingGeoJson;
use Illuminate\Http\Request;

class StaffDirectoryController extends Controller
{
    public function search(Request $request)
    {
        $query = trim((string) $request->query('q', ''));
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $like = '%'.$query.'%';

        $staff = StaffDirectory::query()
            ->with('building')
            ->where(function ($q) use ($like, $query) {
                $q->where('firstName', 'like', $like)
                    ->orWhere('lastName', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('staffPosition', 'like', $like)
                    ->orWhere('roomNo', 'like', $like);

                $terms = preg_split('/\s+/', $query, -1, PREG_SPLIT_NO_EMPTY);
                if (count($terms) >= 2) {
                    $q->orWhere(function ($sub) use ($terms) {
                        $sub->where('firstName', 'like', '%'.$terms[0].'%')
                            ->where('lastName', 'like', '%'.$terms[count($terms) - 1].'%');
                    });
                }
            })
            ->orderBy('lastName')
            ->orderBy('firstName')
            ->limit(20)
            ->get();

        $results = $staff->map(function (StaffDirectory $member) {
            $geoBuilding = BuildingGeoJson::lookup((string) $member->buildingID);

            return [
                'id' => $member->StaffID,
                'first_name' => trim((string) $member->firstName),
                'last_name' => trim((string) $member->lastName),
                'full_name' => $member->full_name,
                'staff_position' => $member->staffPosition,
                'email' => $member->email,
                'building_id' => $member->buildingID,
                'building_name' => $member->building?->buildingName ?? $geoBuilding['name'] ?? null,
                'room_no' => $member->roomNo,
                'coordinates' => $geoBuilding['coordinates'] ?? null,
            ];
        });

        return response()->json($results);
    }
}
