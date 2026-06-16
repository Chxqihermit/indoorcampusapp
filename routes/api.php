<?php

use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\CampusBuildingController;
use App\Http\Controllers\GeoJsonController;
use App\Http\Controllers\IndoorNavigationController;
use App\Http\Controllers\PathController;
use App\Http\Controllers\StaffDirectoryController;
use App\Http\Controllers\WifiController;
use Illuminate\Support\Facades\Route;

// Auth (mobile)
Route::post('/auth/register', [ApiAuthController::class, 'register']);
Route::post('/auth/login', [ApiAuthController::class, 'login']);

Route::middleware('api.token')->group(function () {
    Route::post('/auth/logout', [ApiAuthController::class, 'logout']);
    Route::get('/user', [ApiAuthController::class, 'user']);
});

// Public campus data
Route::get('/geojson/{name}', [GeoJsonController::class, 'show']);
Route::get('/staff/search', [StaffDirectoryController::class, 'search']);
Route::get('/campus-buildings/search', [CampusBuildingController::class, 'search']);

// Indoor Navigation
Route::get('/buildings', [IndoorNavigationController::class, 'getAllBuildings']);
Route::get('/building/{buildingId}/floors', [IndoorNavigationController::class, 'getFloors']);
Route::get('/floor/{floorId}/graph', [IndoorNavigationController::class, 'getGraphData']);
Route::get('/floor-plans', [IndoorNavigationController::class, 'getFloorPlans']);
Route::post('/indoor-route', [IndoorNavigationController::class, 'calculateRoute']);
Route::get('/locations/search', [IndoorNavigationController::class, 'searchLocations']);

Route::middleware('api.token')->group(function () {
    Route::post('/save-geojson', [IndoorNavigationController::class, 'saveGeoJSON']);
    Route::post('/seed-floor-locations', [IndoorNavigationController::class, 'seedFloorLocations']);
});

// Pathfinding
Route::get('/floor/{floorId}/locations', [PathController::class, 'getFloorLocations']);
Route::get('/floor/{floorId}/paths', [PathController::class, 'getFloorPaths']);
Route::get('/path/{startId}/{endId}', [PathController::class, 'calculatePath']);

// WiFi
Route::get('/scan-wifi-networks', [WifiController::class, 'scanNetworks']);
Route::get('/floor/{floorId}/wifi-access-points', [WifiController::class, 'getFloorAccessPoints']);
Route::post('/user-position', [WifiController::class, 'recordUserPosition']);
Route::get('/floor/{floorId}/calibration-stats', [WifiController::class, 'getCalibrationStats']);

Route::middleware('api.token')->group(function () {
    Route::post('/wifi-ap', [WifiController::class, 'createAccessPoint']);
    Route::put('/wifi-ap/{id}', [WifiController::class, 'updateAccessPoint']);
    Route::delete('/wifi-ap/{id}', [WifiController::class, 'deleteAccessPoint']);
    Route::post('/floor/calibration-data', [WifiController::class, 'recordCalibrationData']);
});
