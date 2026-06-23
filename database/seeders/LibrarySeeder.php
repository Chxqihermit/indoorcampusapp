<?php

namespace Database\Seeders;

use App\Models\CampusBuilding;
use App\Models\Floor;
use Illuminate\Database\Seeder;
use RuntimeException;

class LibrarySeeder extends Seeder
{
    private const LIBRARY_BUILDING_ID = 'D1';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $library = CampusBuilding::query()
            ->where('buildingID', self::LIBRARY_BUILDING_ID)
            ->first();

        if (! $library) {
            throw new RuntimeException(
                'Library building (D1) not found in campusbuilding. Run CampusBuildingSeeder first.'
            );
        }

        $floors = [
            [
                'level' => 0,
                'pdf_path' => 'Floor Plans/938-11_Floor Fin layouts_P-231_Basement Floor.pdf',
            ],
            [
                'level' => 1,
                'pdf_path' => 'Floor Plans/938-11_Floor Fin layouts_P-232_Ground Floor.pdf',
            ],
            [
                'level' => 2,
                'pdf_path' => 'Floor Plans/938-11_Floor Fin layouts_P-233_First Floor.pdf',
            ],
            [
                'level' => 3,
                'pdf_path' => 'Floor Plans/938-11_Floor Fin layouts_P-234_Second Floor.pdf',
            ],
        ];

        foreach ($floors as $floorData) {
            Floor::firstOrCreate(
                [
                    'buildingID' => $library->buildingID,
                    'level' => $floorData['level'],
                ],
                [
                    'pdf_path' => $floorData['pdf_path'],
                    'image_path' => null,
                    'width' => null,
                    'height' => null,
                ]
            );
        }
    }
}
