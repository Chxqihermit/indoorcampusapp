<?php

namespace Database\Seeders;

use App\Models\StaffDirectory;
use Illuminate\Database\Seeder;
use RuntimeException;

class StaffDirectorySeeder extends Seeder
{
    private const DEPARTMENT = 'Faculty of Computing and Informatics';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = database_path('seeders/data/fci-staff.json');

        if (! is_file($path)) {
            throw new RuntimeException("Staff data file not found at: {$path}");
        }

        $staffMembers = json_decode(file_get_contents($path), true);

        if (! is_array($staffMembers)) {
            throw new RuntimeException('Invalid staff data JSON.');
        }

        foreach ($staffMembers as $member) {
            StaffDirectory::updateOrCreate(
                ['email' => $member['email']],
                [
                    'firstName' => $member['firstName'],
                    'lastName' => $member['lastName'],
                    'staffPhone' => $member['staffPhone'] ?? '',
                    'staffPosition' => $member['staffPosition'] ?? '',
                    'Department' => self::DEPARTMENT,
                    'buildingID' => $this->resolveBuildingId($member['buildingName'] ?? ''),
                    'roomNo' => $member['roomNo'] ?? 'n/a',
                ]
            );
        }
    }

    private function resolveBuildingId(string $buildingName): string
    {
        $building = strtolower(trim($buildingName));

        return match (true) {
            str_contains($building, 'it house') => 'L1',
            str_contains($building, 'inceit'), str_contains($building, 'ceit') => 'L1',
            str_contains($building, 'poly') => 'A18',
            str_contains($building, 'science') => 'D4',
            str_contains($building, 'https') => 'E4',
            str_contains($building, 'office') => 'A17',
            str_contains($building, 'library') => 'D1',
            str_contains($building, 'lecture') => 'A15',
            str_contains($building, 'admin') => 'A3',
            str_contains($building, 'dawasco'), str_contains($building, 'dawakos') => 'A13',
            str_contains($building, 'finance') => 'A3',
            str_contains($building, 'international') => 'A3',
            default => 'L1',
        };
    }
}
