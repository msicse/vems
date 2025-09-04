<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UserIndexRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(UserIndexRequest $request): Response
    {
        $validated = $request->validated();

        $query = User::with(['department', 'roles']);

        // Apply search
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('department', function ($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Apply filters
        if (!empty($validated['filters'])) {
            $filters = $validated['filters'];

            if (!empty($filters['user_type'])) {
                $query->whereIn('user_type', $filters['user_type']);
            }

            if (!empty($filters['status'])) {
                $query->whereIn('status', $filters['status']);
            }

            if (!empty($filters['department_id'])) {
                $query->whereIn('department_id', $filters['department_id']);
            }

            if (!empty($filters['blood_group'])) {
                $query->whereIn('blood_group', $filters['blood_group']);
            }

            if (!empty($filters['roles'])) {
                $query->whereHas('roles', function ($q) use ($filters) {
                    $q->whereIn('name', $filters['roles']);
                });
            }
        }

        // Apply sorting
        $sortColumn = $validated['sort'];
        $sortDirection = $validated['direction'];

        // Special handling for department sorting
        if ($sortColumn === 'department') {
            $query->leftJoin('departments', 'users.department_id', '=', 'departments.id')
                  ->orderBy('departments.name', $sortDirection)
                  ->select('users.*');
        } else {
            $query->orderBy($sortColumn, $sortDirection);
        }

        // Get pagination data
        $users = $query->paginate($validated['per_page'])
                      ->withQueryString()
                      ->through(fn ($user) => [
                          'id' => $user->id,
                          'name' => $user->name,
                          'username' => $user->username,
                          'employee_id' => $user->employee_id,
                          'email' => $user->email,
                          'user_type' => $user->user_type,
                          'status' => $user->status,
                          'driver_status' => $user->driver_status,
                          'department' => $user->department,
                          'blood_group' => $user->blood_group,
                          'phone' => $user->personal_phone ?? $user->official_phone,
                          'roles' => $user->roles,
                          'is_driver' => in_array($user->user_type, ['driver', 'transport_manager']),
                          'created_at' => $user->created_at,
                          'image' => $user->image,
                          'photo' => $user->photo,
                          'driving_license_no' => $user->driving_license_no,
                          'license_class' => $user->license_class,
                          'license_expiry_date' => $user->license_expiry_date,
                          'total_trips_completed' => $user->total_trips_completed ?? 0,
                          'average_rating' => $user->average_rating,
                      ]);

        // Get filter options
        $departments = Department::active()->get(['id', 'name']);
        $userTypes = User::distinct()->pluck('user_type')->filter()->values()->toArray();
        $statuses = User::distinct()->pluck('status')->filter()->values()->toArray();
        $bloodGroups = User::distinct()->pluck('blood_group')->filter()->values()->toArray();
        $roles = \Spatie\Permission\Models\Role::pluck('name')->toArray();

        // Calculate stats
        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'drivers' => User::whereIn('user_type', ['driver', 'transport_manager'])->count(),
            'inactive' => User::where('status', 'inactive')->count(),
        ];

        return Inertia::render('users/index', [
            'users' => $users,
            'filterOptions' => [
                'user_types' => $userTypes,
                'statuses' => $statuses,
                'departments' => $departments,
                'blood_groups' => $bloodGroups,
                'roles' => $roles,
            ],
            'stats' => $stats,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'filters', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $departments = Department::active()->get(['id', 'name']);
        $roles = Role::all(['id', 'name']);

        $userTypes = [
            ['value' => 'employee', 'label' => 'Employee'],
            ['value' => 'driver', 'label' => 'Driver'],
        ];

        $licenseClasses = [
            ['value' => 'A', 'label' => 'Class A - Motorcycle'],
            ['value' => 'B', 'label' => 'Class B - Car/Light Vehicle'],
            ['value' => 'C', 'label' => 'Class C - Heavy Vehicle'],
            ['value' => 'D', 'label' => 'Class D - Professional'],
        ];

        $bloodGroups = [
            ['value' => 'A+', 'label' => 'A+'],
            ['value' => 'A-', 'label' => 'A-'],
            ['value' => 'B+', 'label' => 'B+'],
            ['value' => 'B-', 'label' => 'B-'],
            ['value' => 'AB+', 'label' => 'AB+'],
            ['value' => 'AB-', 'label' => 'AB-'],
            ['value' => 'O+', 'label' => 'O+'],
            ['value' => 'O-', 'label' => 'O-'],
        ];

        return Inertia::render('users/create', [
            'departments' => $departments,
            'roles' => $roles,
            'userTypes' => $userTypes,
            'licenseClasses' => $licenseClasses,
            'bloodGroups' => $bloodGroups,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Handle file uploads
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('users/images', 'public');
        }

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('users/photos', 'public');
        }

        // Hash password
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        // Handle role assignments - roles are now required
        if (isset($validated['roles']) && is_array($validated['roles']) && !empty($validated['roles'])) {
            // Convert role IDs to role names/objects and assign
            $roles = Role::whereIn('id', $validated['roles'])->get();
            $user->assignRole($roles);
        } else {
            // This shouldn't happen due to validation, but fallback to automatic role assignment
            $this->assignRoleByUserType($user, $validated['user_type']);
        }

        return redirect()->route('users.index')
                        ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load(['department', 'roles', 'permissions']);

        // Calculate additional stats for drivers
        if ($user->isDriver()) {
            $user->load(['driverTrips' => function ($query) {
                $query->select('id', 'driver_id', 'status', 'actual_distance', 'driver_rating')
                      ->latest()
                      ->limit(10);
            }]);

            $user->performance_stats = [
                'completion_rate' => $user->calculateCompletionRate(),
                'recent_trips' => $user->driverTrips->count(),
                'license_status' => $user->license_status,
            ];
        }

        return Inertia::render('users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $departments = Department::active()->get(['id', 'name']);
        $roles = Role::all(['id', 'name']);
        $userRoles = $user->roles->pluck('id')->map(function($id) {
            return (string) $id;
        })->toArray();

        $userTypes = [
            ['value' => 'employee', 'label' => 'Employee'],
            ['value' => 'driver', 'label' => 'Driver'],
        ];

        $licenseClasses = [
            ['value' => 'A', 'label' => 'Class A - Motorcycle'],
            ['value' => 'B', 'label' => 'Class B - Car/Light Vehicle'],
            ['value' => 'C', 'label' => 'Class C - Heavy Vehicle'],
            ['value' => 'D', 'label' => 'Class D - Professional'],
        ];

        $bloodGroups = [
            ['value' => 'A+', 'label' => 'A+'],
            ['value' => 'A-', 'label' => 'A-'],
            ['value' => 'B+', 'label' => 'B+'],
            ['value' => 'B-', 'label' => 'B-'],
            ['value' => 'AB+', 'label' => 'AB+'],
            ['value' => 'AB-', 'label' => 'AB-'],
            ['value' => 'O+', 'label' => 'O+'],
            ['value' => 'O-', 'label' => 'O-'],
        ];

        $statusOptions = [
            ['value' => 'active', 'label' => 'Active'],
            ['value' => 'inactive', 'label' => 'Inactive'],
            ['value' => 'suspended', 'label' => 'Suspended'],
        ];

        $driverStatusOptions = [
            ['value' => 'available', 'label' => 'Available'],
            ['value' => 'on_trip', 'label' => 'On Trip'],
            ['value' => 'on_leave', 'label' => 'On Leave'],
            ['value' => 'inactive', 'label' => 'Inactive'],
            ['value' => 'suspended', 'label' => 'Suspended'],
        ];

        return Inertia::render('users/edit', [
            'user' => $user,
            'departments' => $departments,
            'roles' => $roles,
            'userRoles' => $userRoles,
            'userTypes' => $userTypes,
            'licenseClasses' => $licenseClasses,
            'bloodGroups' => $bloodGroups,
            'statusOptions' => $statusOptions,
            'driverStatusOptions' => $driverStatusOptions,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        // Handle file uploads
        if ($request->hasFile('image')) {
            if ($user->image) {
                Storage::disk('public')->delete($user->image);
            }
            $validated['image'] = $request->file('image')->store('users/images', 'public');
        }

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $validated['photo'] = $request->file('photo')->store('users/photos', 'public');
        }

        // Hash password if provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Handle role assignments - roles are now required
        if (isset($validated['roles']) && is_array($validated['roles']) && !empty($validated['roles'])) {
            // Convert role IDs to role objects and assign
            $roles = Role::whereIn('id', $validated['roles'])->get();
            $user->syncRoles($roles);
        } else {
            // This shouldn't happen due to validation, but fallback to automatic role assignment
            $user->syncRoles([]); // Remove all roles
            $this->assignRoleByUserType($user, $validated['user_type']);
        }

        return redirect()->route('users.index')
                        ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Check if user has any active trips
        if ($user->isDriver() && $user->driverTrips()->whereIn('status', ['pending', 'approved', 'in_progress'])->exists()) {
            return redirect()->back()
                           ->with('error', 'Cannot delete user with active trips. Please complete or reassign trips first.');
        }

        // Delete associated files
        if ($user->image) {
            Storage::disk('public')->delete($user->image);
        }
        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }

        $user->delete();

        return redirect()->route('users.index')
                        ->with('success', 'User deleted successfully.');
    }

    /**
     * Get available drivers for AJAX requests.
     */
    public function getAvailableDrivers(Request $request)
    {
        $drivers = User::availableDrivers()
            ->with('department:id,name')
            ->select('id', 'name', 'username', 'employee_id', 'department_id', 'driving_license_no', 'license_class')
            ->get();

        return response()->json($drivers);
    }

    /**
     * Update driver status.
     */
    public function updateDriverStatus(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'driver_status' => 'required|in:available,on_trip,on_leave,inactive,suspended',
        ]);

        if (!$user->isDriver()) {
            return redirect()->back()
                           ->with('error', 'User is not a driver.');
        }

        $user->update(['driver_status' => $request->driver_status]);

        return redirect()->back()
                        ->with('success', 'Driver status updated successfully.');
    }

    /**
     * Assign role based on user type.
     */
    private function assignRoleByUserType(User $user, string $userType): void
    {
        $roleMapping = [
            'employee' => 'employee',
            'driver' => 'driver',
            'transport_manager' => 'transport-manager',
            'admin' => 'super-admin',
        ];

        if (isset($roleMapping[$userType])) {
            try {
                $role = Role::findByName($roleMapping[$userType]);
                $user->assignRole($role);
            } catch (\Exception $e) {
                // Role doesn't exist, continue without assigning
            }
        }
    }

    /**
     * Export users to Excel.
     */
    public function export(Request $request)
    {
        // Implementation for Excel export
        // This would use Laravel Excel package
        return response()->json(['message' => 'Export functionality coming soon']);
    }

    /**
     * Import users from Excel.
     */
    public function import(Request $request)
    {
        // Implementation for Excel import
        // This would use Laravel Excel package
        return response()->json(['message' => 'Import functionality coming soon']);
    }
}
