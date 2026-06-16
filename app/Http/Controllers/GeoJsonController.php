<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class GeoJsonController extends Controller
{
    private const ALLOWED = [
        'nust-buildings',
        'nust-campus',
        'nust-lower-campus',
        'nust-walkways',
        'nust-labels',
    ];

    public function show(string $name): BinaryFileResponse
    {
        if (! in_array($name, self::ALLOWED, true)) {
            abort(404);
        }

        $path = public_path("data/{$name}.geojson");
        if (! File::exists($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type' => 'application/geo+json',
        ]);
    }
}
