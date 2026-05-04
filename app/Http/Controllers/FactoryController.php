<?php

namespace App\Http\Controllers;

use App\Http\Requests\FactoryIndexRequest;
use App\Http\Requests\FactoryStoreRequest;
use App\Http\Requests\FactoryUpdateRequest;
use App\Models\Factory;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class FactoryController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:view-factories', only: ['index', 'show']),
            new Middleware('permission:create-factories', only: ['create', 'store']),
            new Middleware('permission:edit-factories', only: ['edit', 'update']),
            new Middleware('permission:delete-factories', only: ['destroy']),
        ];
    }

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

        // Get stats with a single aggregate query
        $factoryStats = Factory::selectRaw(
            'COUNT(*) as total, ' .
            'SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active, ' .
            'SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as inactive, ' .
            'COUNT(DISTINCT city) as cities',
            ['active', 'inactive']
        )->first();

        $stats = [
            'total' => (int) ($factoryStats->total ?? 0),
            'active' => (int) ($factoryStats->active ?? 0),
            'inactive' => (int) ($factoryStats->inactive ?? 0),
            'cities' => (int) ($factoryStats->cities ?? 0),
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
