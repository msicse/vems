<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Factory;
use Illuminate\Http\Request;
use App\Http\Requests\FactoryIndexRequest;
use App\Http\Requests\FactoryStoreRequest;
use App\Http\Requests\FactoryUpdateRequest;

class FactoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(FactoryIndexRequest $request)
    {
        $validated = $request->validated();
        $query = Factory::query();

        // Apply search
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('account_id', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if (!empty($validated['filters'])) {
            $filters = $validated['filters'];

            if (!empty($filters['status'])) {
                $query->whereIn('status', $filters['status']);
            }

            if (!empty($filters['city'])) {
                $query->whereIn('city', $filters['city']);
            }
        }

        // Apply sorting
        $sortColumn = $validated['sort'];
        $sortDirection = $validated['direction'];
        $query->orderBy($sortColumn, $sortDirection);

        // Get pagination data
        $factories = $query->paginate($validated['per_page'])
            ->withQueryString();

        // Get filter options
        $filterOptions = [
            'statuses' => ['active', 'inactive'],
            'cities' => Factory::distinct()->pluck('city')->filter()->sort()->values(),
        ];

        // Get stats
        $stats = [
            'total' => Factory::count(),
            'active' => Factory::where('status', 'active')->count(),
            'inactive' => Factory::where('status', 'inactive')->count(),
            'cities' => Factory::distinct()->count('city'),
        ];

        return Inertia::render('factories/index', [
            'factories' => $factories,
            'filterOptions' => $filterOptions,
            'stats' => $stats,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'filters', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('factories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FactoryStoreRequest $request)
    {
        $validated = $request->validated();

        Factory::create($validated);

        return redirect()->route('factories.index')
            ->with('success', 'Factory created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Factory $factory)
    {
        return Inertia::render('factories/show', [
            'factory' => $factory,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Factory $factory)
    {
        return Inertia::render('factories/edit', [
            'factory' => $factory,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FactoryUpdateRequest $request, Factory $factory)
    {
        $validated = $request->validated();

        $factory->update($validated);

        return redirect()->route('factories.index')
            ->with('success', 'Factory updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Factory $factory)
    {
        $factory->delete();

        return redirect()->route('factories.index')
            ->with('success', 'Factory deleted successfully.');
    }
}
