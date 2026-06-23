<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('campusbuilding')) {
            return;
        }

        if (! Schema::hasTable('floors')) {
            Schema::create('floors', function (Blueprint $table) {
                $table->id();
                $table->string('buildingID', 50);
                $table->foreign('buildingID')->references('buildingID')->on('campusbuilding')->onDelete('cascade');
                $table->integer('level');
                $table->string('image_path')->nullable();
                $table->string('pdf_path')->nullable();
                $table->integer('width')->nullable();
                $table->integer('height')->nullable();
                $table->timestamps();
            });

            return;
        }

        if (Schema::hasColumn('floors', 'building_id')) {
            Schema::table('floors', function (Blueprint $table) {
                $table->dropForeign(['building_id']);
                $table->dropColumn('building_id');
            });
        }

        if (! Schema::hasColumn('floors', 'buildingID')) {
            Schema::table('floors', function (Blueprint $table) {
                $table->string('buildingID', 50)->nullable()->after('id');
            });
        }

        if (! DB::table('campusbuilding')->where('buildingID', 'D1')->exists()) {
            DB::table('campusbuilding')->insert([
                'buildingID' => 'D1',
                'buildingName' => 'D1.Prof Tjama Tjivikua Library',
            ]);
        }

        DB::table('floors')->update(['buildingID' => 'D1']);

        if (! $this->foreignKeyExists('floors', 'floors_buildingid_foreign')) {
            Schema::table('floors', function (Blueprint $table) {
                $table->foreign('buildingID')->references('buildingID')->on('campusbuilding')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('floors')) {
            return;
        }

        if ($this->foreignKeyExists('floors', 'floors_buildingid_foreign')) {
            Schema::table('floors', function (Blueprint $table) {
                $table->dropForeign(['buildingID']);
                $table->dropColumn('buildingID');
            });
        }

        if (! Schema::hasColumn('floors', 'building_id') && Schema::hasTable('buildings')) {
            Schema::table('floors', function (Blueprint $table) {
                $table->foreignId('building_id')->after('id')->constrained('buildings')->onDelete('cascade');
            });
        }
    }

    private function foreignKeyExists(string $table, string $foreignKey): bool
    {
        $connection = Schema::getConnection()->getDatabaseName();

        $result = DB::selectOne(
            'SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = ?',
            [$connection, $table, $foreignKey, 'FOREIGN KEY']
        );

        return $result !== null;
    }
};
