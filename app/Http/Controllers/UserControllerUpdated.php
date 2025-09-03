// Simple UserController update to handle basic sorting and search
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        // Handle search
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Handle sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['id', 'name', 'email', 'created_at', 'is_driver'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        // Get stats
        $stats = [
            'total' => User::count(),
            'active' => User::count(),
            'drivers' => User::where('is_driver', true)->count(),
            'inactive' => 0
        ];

        return Inertia::render('users/index', [
            'users' => $users,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'per_page']),
            'filterOptions' => [],
            'stats' => $stats
        ]);
    }

    // ...existing methods...
}
