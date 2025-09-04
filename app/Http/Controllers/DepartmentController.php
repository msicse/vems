<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Requests\DepartmentIndexRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(DepartmentIndexRequest $request): Response
    {
        $validated = $request->validated();

        $query = Department::with(['users', 'head']);

        // Apply search
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Apply filters
        if (!empty($validated['filters'])) {
            $filters = $validated['filters'];

            if (!empty($filters['status'])) {
                $statuses = $filters['status'];
                $query->where(function ($q) use ($statuses) {
                    foreach ($statuses as $status) {
                        if ($status === 'active') {
                            $q->orWhere('is_active', true);
                        } elseif ($status === 'inactive') {
                            $q->orWhere('is_active', false);
                        }
                    }
                });
            }
        }

        // Apply sorting
        $sortColumn = $validated['sort'];
        $sortDirection = $validated['direction'];

        $validSortFields = ['name', 'code', 'location', 'is_active', 'created_at', 'status'];
        if (in_array($sortColumn, $validSortFields)) {
            // Map frontend column names to database column names
            $dbColumn = $sortColumn === 'status' ? 'is_active' : $sortColumn;
            $query->orderBy($dbColumn, $sortDirection);
        }

        // Get pagination data
        $departments = $query->paginate($validated['per_page'])
            ->withQueryString()
            ->through(fn ($department) => [
                'id' => $department->id,
                'name' => $department->name,
                'code' => $department->code,
                'description' => $department->description,
                'location' => $department->location,
                'phone' => $department->phone,
                'email' => $department->email,
                'is_active' => $department->is_active,
                'status' => $department->is_active ? 'active' : 'inactive',
                'users_count' => $department->users->count(),
                'head' => $department->head ? [
                    'id' => $department->head->id,
                    'name' => $department->head->name,
                    'email' => $department->head->email,
                ] : null,
                'created_at' => $department->created_at,
            ]);

        return Inertia::render('departments/index', [
            'departments' => $departments,
            'filterOptions' => [
                'statuses' => ['active', 'inactive'],
            ],
            'queryParams' => $request->only(['search', 'sort', 'direction', 'filters', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new department.
     */
    public function create(): Response
    {
        $users = User::active()->get(['id', 'name', 'email']);

        return Inertia::render('departments/create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created department in storage.
     */
    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $department = Department::create($validated);

        return redirect()->route('departments.index')
                        ->with('success', 'Department created successfully.');
    }

    /**
     * Display the specified department.
     */
    public function show(Department $department): Response
    {
        $department->load(['users.roles', 'head']);

        // Get department statistics
        $stats = [
            'total_users' => $department->users->count(),
            'active_users' => $department->users->where('status', 'active')->count(),
            'drivers' => $department->users->filter(function($user) {
                return $user->roles->contains('name', 'Driver') ||
                       in_array($user->user_type, ['driver', 'transport_manager']);
            })->count(),
            'managers' => $department->users->filter(function($user) {
                return $user->roles->contains('name', 'Manager');
            })->count(),
        ];

        return Inertia::render('departments/show', [
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'code' => $department->code,
                'description' => $department->description,
                'location' => $department->location,
                'phone' => $department->phone,
                'email' => $department->email,
                'is_active' => $department->is_active,
                'budget_allocation' => $department->budget_allocation,
                'total_budget' => $department->total_budget,
                'head' => $department->head,
                'users' => $department->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'user_type' => $user->user_type,
                        'status' => $user->status,
                        'roles' => $user->roles->pluck('name'),
                        'created_at' => $user->created_at->format('M d, Y'),
                    ];
                }),
                'created_at' => $department->created_at->format('M d, Y H:i'),
                'updated_at' => $department->updated_at->format('M d, Y H:i'),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified department.
     */
    public function edit(Department $department): Response
    {
        $users = User::active()->get(['id', 'name', 'email']);

        return Inertia::render('departments/edit', [
            'department' => $department,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified department in storage.
     */
    public function update(UpdateDepartmentRequest $request, Department $department): RedirectResponse
    {
        $validated = $request->validated();

        $department->update($validated);

        return redirect()->route('departments.index')
                        ->with('success', 'Department updated successfully.');
    }

    /**
     * Remove the specified department from storage.
     */
    public function destroy(Department $department): RedirectResponse
    {
        // Check if department has users
        if ($department->users()->count() > 0) {
            return redirect()->back()
                           ->with('error', 'Cannot delete department with active users. Please reassign users first.');
        }

        $department->delete();

        return redirect()->route('departments.index')
                        ->with('success', 'Department deleted successfully.');
    }

    /**
     * Toggle department status.
     */
    public function toggleStatus(Department $department): RedirectResponse
    {
        $department->update([
            'is_active' => !$department->is_active
        ]);

        $status = $department->is_active ? 'activated' : 'deactivated';

        return redirect()->back()
                        ->with('success', "Department {$status} successfully.");
    }

    /**
     * Export departments to Excel.
     */
    public function export(Request $request)
    {
        // Implementation for Excel export
        // This would use Laravel Excel package
        return response()->json(['message' => 'Export functionality coming soon']);
    }

    /**
     * Import departments from Excel.
     */
    public function import(Request $request)
    {
        // Implementation for Excel import
        // This would use Laravel Excel package
        return response()->json(['message' => 'Import functionality coming soon']);
    }
}
