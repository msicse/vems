<?php

namespace App\Http\Controllers;

use App\Models\Stop;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StopController extends Controller
{
    /**
     * Store a newly created stop via API.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:stops,name',
            'description' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $stop = Stop::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Stop created successfully',
            'data' => $stop
        ], 201);
    }

    /**
     * Get all stops for API.
     */
    public function index(): JsonResponse
    {
        $stops = Stop::select('id', 'name', 'description', 'latitude', 'longitude')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stops
        ]);
    }
}
