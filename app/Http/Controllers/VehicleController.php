<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use App\Http\Requests\VehicleIndexRequest;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(VehicleIndexRequest $request)
    {
        $validated = $request->validated();
        $query = Vehicle::with(['vendor', 'driver']);

        // Apply search
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('color', 'like', "%{$search}%")
                    ->orWhere('registration_number', 'like', "%{$search}%")
                    ->orWhere('vendor', 'like', "%{$search}%")
                    ->orWhereHas('vendor', function ($vendorQuery) use ($search) {
                        $vendorQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('driver', function ($driverQuery) use ($search) {
                        $driverQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Apply filters
        if (!empty($validated['filters'])) {
            $filters = $validated['filters'];

            if (!empty($filters['brand'])) {
                $query->whereIn('brand', $filters['brand']);
            }

            if (!empty($filters['color'])) {
                $query->whereIn('color', $filters['color']);
            }

            if (isset($filters['is_active'])) {
                $query->whereIn('is_active', $filters['is_active']);
            }
        }

        // Apply sorting
        $sortColumn = $validated['sort'];
        $sortDirection = $validated['direction'];
        $query->orderBy($sortColumn, $sortDirection);

        // Get pagination data
        $vehicles = $query->paginate($validated['per_page'])
            ->withQueryString(); // Preserve query parameters in pagination links

        // Get filter options for the frontend
        $filterOptions = [
            'brands' => Vehicle::distinct()->pluck('brand')->filter()->sort()->values(),
            'colors' => Vehicle::distinct()->pluck('color')->filter()->sort()->values(),
            'statuses' => [
                ['label' => 'Active', 'value' => true],
                ['label' => 'Inactive', 'value' => false],
            ],
        ];

        // Get stats
        $stats = [
            'total' => Vehicle::count(),
            'active' => Vehicle::where('is_active', true)->count(),
            'brands' => Vehicle::distinct()->count('brand'),
            'inactive' => Vehicle::where('is_active', false)->count(),
        ];

        return Inertia::render('vehicles/index', [
            'vehicles' => $vehicles,
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
        try {
            $vendors = \App\Models\Vendor::active()
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        } catch (\Exception $e) {
            // If there's an issue with vendors, provide empty array
            $vendors = collect([]);
        }

        try {
            $drivers = \App\Models\User::where('status', 'active')
                ->where('user_type', 'driver')
                ->select('id', 'name', 'email', 'user_type', 'official_phone')
                ->orderBy('name')
                ->get();
        } catch (\Exception $e) {
            // If there's an issue with users, provide empty array
            $drivers = collect([]);
        }

        return Inertia::render('vehicles/create', [
            'vendors' => $vendors,
            'drivers' => $drivers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the incoming request data

        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'color' => 'nullable|string|max:255', // Made optional
            'registration_number' => 'required|string|max:255|unique:vehicles',
            'vendor' => 'nullable|string|max:255', // Keep for backward compatibility
            'vendor_id' => 'nullable|string',
            'driver_id' => 'required|exists:users,id', // Required driver
            'is_active' => 'boolean',
            // Tax Token
            'tax_token_last_date' => 'nullable|date',
            'tax_token_number' => 'nullable|string|max:255',
            // Fitness Certificate
            'fitness_certificate_last_date' => 'nullable|date',
            'fitness_certificate_number' => 'nullable|string|max:255',
            // Insurance
            'insurance_type' => 'nullable|in:1st_party,3rd_party,comprehensive',
            'insurance_last_date' => 'nullable|date',
            'insurance_policy_number' => 'nullable|string|max:255',
            'insurance_company' => 'nullable|string|max:255',
            // Registration Certificate & Owner Info
            'registration_certificate_number' => 'nullable|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'owner_address' => 'nullable|string',
            'owner_phone' => 'nullable|string|max:20',
            'owner_email' => 'nullable|email|max:255',
            'owner_nid' => 'nullable|string|max:50',
            // Additional Vehicle Info
            'manufacture_year' => 'nullable|numeric|min:1900|max:' . (date('Y') + 1),
            'engine_number' => 'nullable|string|max:255',
            'chassis_number' => 'nullable|string|max:255',
            'fuel_type' => 'nullable|in:petrol,diesel,cng,electric,hybrid',
            // Alert Settings
            'tax_token_alert_enabled' => 'sometimes|boolean',
            'fitness_alert_enabled' => 'sometimes|boolean',
            'insurance_alert_enabled' => 'sometimes|boolean',
            'alert_days_before' => 'nullable|numeric|min:1|max:365',
        ]);

        \Log::info('Validated data:', $validated);

        // Convert empty vendor_id to null and validate if it's a valid vendor
        if (!empty($validated['vendor_id']) && $validated['vendor_id'] !== 'none') {
            $request->validate([
                'vendor_id' => 'exists:vendors,id'
            ]);
        } else {
            $validated['vendor_id'] = null;
        }

        // Set default values for boolean fields if not present
        $validated['tax_token_alert_enabled'] = $validated['tax_token_alert_enabled'] ?? true;
        $validated['fitness_alert_enabled'] = $validated['fitness_alert_enabled'] ?? true;
        $validated['insurance_alert_enabled'] = $validated['insurance_alert_enabled'] ?? true;
        $validated['alert_days_before'] = $validated['alert_days_before'] ?? 30;

        try {
            $vehicle = Vehicle::create($validated);
            \Log::info('Vehicle created successfully:', ['vehicle_id' => $vehicle->id]);

            return redirect()
                ->route('vehicles.index')
                ->with('success', 'Vehicle created successfully!');
        } catch (\Exception $e) {
            \Log::error('Error creating vehicle:', ['error' => $e->getMessage()]);

            return back()
                ->withErrors(['error' => 'Failed to create vehicle: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehicle $vehicle)
    {
        $vehicle->load(['vendor.contactPersons', 'driver']);

        return Inertia::render('vehicles/show', [
            'vehicle' => $vehicle,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vehicle $vehicle)
    {
        $vehicle->load(['vendor', 'driver']);

        $vendors = \App\Models\Vendor::active()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $drivers = \App\Models\User::where('status', 'active')
            ->where('user_type', 'driver')
            ->select('id', 'name', 'email', 'user_type', 'official_phone')
            ->orderBy('name')
            ->get();

        return Inertia::render('vehicles/edit', [
            'vehicle' => $vehicle,
            'vendors' => $vendors,
            'drivers' => $drivers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'color' => 'nullable|string|max:255', // Made optional
            'registration_number' => 'required|string|max:255|unique:vehicles,registration_number,' . $vehicle->id,
            'vendor' => 'nullable|string|max:255', // Keep for backward compatibility
            'vendor_id' => 'nullable|string',
            'driver_id' => 'required|exists:users,id', // Required driver
            'is_active' => 'boolean',
            // Tax Token
            'tax_token_last_date' => 'nullable|date',
            'tax_token_number' => 'nullable|string|max:255',
            // Fitness Certificate
            'fitness_certificate_last_date' => 'nullable|date',
            'fitness_certificate_number' => 'nullable|string|max:255',
            // Insurance
            'insurance_type' => 'nullable|in:1st_party,3rd_party,comprehensive',
            'insurance_last_date' => 'nullable|date',
            'insurance_policy_number' => 'nullable|string|max:255',
            'insurance_company' => 'nullable|string|max:255',
            // Registration Certificate & Owner Info
            'registration_certificate_number' => 'nullable|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'owner_address' => 'nullable|string',
            'owner_phone' => 'nullable|string|max:20',
            'owner_email' => 'nullable|email|max:255',
            'owner_nid' => 'nullable|string|max:50',
            // Additional Vehicle Info
            'manufacture_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'engine_number' => 'nullable|string|max:255',
            'chassis_number' => 'nullable|string|max:255',
            'fuel_type' => 'nullable|in:petrol,diesel,cng,electric,hybrid',
            // Alert Settings
            'tax_token_alert_enabled' => 'boolean',
            'fitness_alert_enabled' => 'boolean',
            'insurance_alert_enabled' => 'boolean',
            'alert_days_before' => 'nullable|integer|min:1|max:365',
        ]);

        // Convert empty vendor_id to null and validate if it's a valid vendor
        if (!empty($validated['vendor_id']) && $validated['vendor_id'] !== 'none') {
            $request->validate([
                'vendor_id' => 'exists:vendors,id'
            ]);
        } else {
            $validated['vendor_id'] = null;
        }

        $vehicle->update($validated);

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehicle updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return redirect()
            ->route('vehicles.index')
            ->with('success', 'Vehicle deleted successfully!');
    }

    /**
     * Get vehicles with expiring documents for dashboard
     */
    public function getExpiringVehicles()
    {
        $expiringVehicles = Vehicle::withExpiringDocuments()
            ->where('is_active', true)
            ->get()
            ->map(function ($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'brand' => $vehicle->brand,
                    'model' => $vehicle->model,
                    'registration_number' => $vehicle->registration_number,
                    'expiring_documents' => $vehicle->getExpiringDocuments(),
                ];
            });

        return response()->json($expiringVehicles);
    }
}
