<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\UserIndexRequest;

class DriversController extends Controller
{
    /**
     * Display a listing of drivers only.
     */
    public function index(UserIndexRequest $request)
    {
        $validated = $request->validated();
        $query = User::where('user_type', 'driver');

        // Apply search
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if (!empty($validated['filters'])) {
            $filters = $validated['filters'];

            if (!empty($filters['status'])) {
                $query->whereIn('status', $filters['status']);
            }

            if (!empty($filters['blood_group'])) {
                $query->whereIn('blood_group', $filters['blood_group']);
            }
        }

        // Apply sorting
        $sortColumn = $validated['sort'];
        $sortDirection = $validated['direction'];
        $query->orderBy($sortColumn, $sortDirection);

        // Get pagination data
        $drivers = $query->paginate($validated['per_page'])
            ->withQueryString(); // Preserve query parameters in pagination links

        // Get filter options for the frontend (drivers only)
        $filterOptions = [
            'statuses' => ['active', 'inactive', 'suspended'],
            'blood_groups' => User::where('user_type', 'driver')
                ->distinct()
                ->pluck('blood_group')
                ->filter()
                ->sort()
                ->values(),
        ];

        // Get driver-specific stats
        $stats = [
            'total' => User::where('user_type', 'driver')->count(),
            'active' => User::where('user_type', 'driver')->where('status', 'active')->count(),
            'inactive' => User::where('user_type', 'driver')->where('status', 'inactive')->count(),
            'suspended' => User::where('user_type', 'driver')->where('status', 'suspended')->count(),
        ];

        return Inertia::render('drivers/index', [
            'drivers' => $drivers,
            'filterOptions' => $filterOptions,
            'stats' => $stats,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'filters', 'per_page']),
        ]);
    }

    /**
     * Display the specified driver.
     */
    public function show(User $driver)
    {
        // Ensure the user is actually a driver
        if ($driver->user_type !== 'driver') {
            abort(404, 'Driver not found');
        }

        return Inertia::render('drivers/show', [
            'driver' => $driver,
        ]);
    }

    /**
     * Show the form for editing the specified driver.
     */
    public function edit(User $driver)
    {
        // Ensure the user is actually a driver
        if ($driver->user_type !== 'driver') {
            abort(404, 'Driver not found');
        }

        $bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        $statuses = [
            ['label' => 'Active', 'value' => 'active'],
            ['label' => 'Inactive', 'value' => 'inactive'],
            ['label' => 'Suspended', 'value' => 'suspended'],
        ];

        return Inertia::render('drivers/edit', [
            'driver' => $driver,
            'bloodGroups' => $bloodGroups,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified driver in storage.
     */
    public function update(Request $request, User $driver)
    {
        // Ensure the user is actually a driver
        if ($driver->user_type !== 'driver') {
            abort(404, 'Driver not found');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $driver->id,
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'blood_group' => 'nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'image' => 'nullable|string|max:255',
            'status' => 'required|string|in:active,inactive,suspended',
            'address' => 'nullable|string|max:500',
            'whatsapp_id' => 'nullable|string|max:20',
        ]);

        // Hash password if provided
        if (!empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Ensure user_type remains 'driver'
        $validated['user_type'] = 'driver';

        $driver->update($validated);

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Driver updated successfully!');
    }

    /**
     * Remove the specified driver from storage.
     */
    public function destroy(User $driver)
    {
        // Ensure the user is actually a driver
        if ($driver->user_type !== 'driver') {
            abort(404, 'Driver not found');
        }

        // Prevent deleting the current user if they are a driver
        if ($driver->id === auth()->id()) {
            return redirect()
                ->route('drivers.index')
                ->with('error', 'You cannot delete your own account!');
        }

        $driver->delete();

        return redirect()
            ->route('drivers.index')
            ->with('success', 'Driver deleted successfully!');
    }
}
