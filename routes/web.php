<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('indoor-map', function () {
        return Inertia::render('IndoorNavigation');
    })->name('indoor-map');

    Route::get('staff-directory', function () {
        return Inertia::render('staff-directory');
    })->name('staff-directory');
});

require __DIR__.'/settings.php';

// Add this route to render your map page
Route::get('/map', function () {
    return Inertia::render('ShowMap'); // 'ShowMap' matches the filename 'ShowMap.tsx'
});