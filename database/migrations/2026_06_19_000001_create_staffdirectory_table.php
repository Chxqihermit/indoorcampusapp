<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('staffdirectory', function (Blueprint $table) {
            $table->id('StaffID');
            $table->string('firstName', 255);
            $table->string('lastName', 255);
            $table->string('email', 255);
            $table->string('staffPhone', 255);
            $table->string('staffPosition', 255);
            $table->string('Department', 255);
            $table->string('buildingID', 50);
            $table->foreign('buildingID')->references('buildingID')->on('campusbuilding');
            $table->string('roomNo', 255);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staffdirectory');
    }
};
