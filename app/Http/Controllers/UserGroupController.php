<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserGroupController extends Controller
{
    /**
     * Display a listing of user groups.
     */
    public function index(Request $request): Response
    {
        $query = UserGroup::with(['creator', 'users']);

        // Search
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $groups = $query->withCount('users')
            ->latest()
            ->paginate(15)
            ->through(fn($group) => [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'status' => $group->status,
                'total_members' => $group->users_count,
                'creator' => $group->creator ? [
                    'id' => $group->creator->id,
                    'name' => $group->creator->name,
                ] : null,
                'created_at' => $group->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('user-groups/index', [
            'groups' => $groups,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'total' => UserGroup::count(),
                'active' => UserGroup::where('status', 'active')->count(),
                'inactive' => UserGroup::where('status', 'inactive')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user group.
     */
    public function create(): Response
    {
        $users = User::where('status', 'active')
            ->with('department:id,name')
            ->select('id', 'name', 'email', 'user_type', 'employee_id', 'department_id')
            ->orderBy('name')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'employee_id' => $user->employee_id,
                'department' => $user->department?->name,
            ]);

        return Inertia::render('user-groups/create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created user group.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:user_groups,name'],
            'description' => ['nullable', 'string'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = 'active'; // Default status

        $userIds = $validated['user_ids'] ?? [];
        unset($validated['user_ids']);

        $group = UserGroup::create($validated);

        // Add members if provided
        if (!empty($userIds)) {
            $group->syncMembers($userIds);
        }

        return redirect()->route('user-groups.index')
            ->with('success', 'User group created successfully.');
    }

    /**
     * Display the specified user group.
     */
    public function show(UserGroup $userGroup): Response
    {
        $userGroup->load(['creator', 'users' => function ($query) {
            $query->with('department')->select('users.id', 'users.name', 'users.email', 'users.user_type', 'users.department_id', 'users.status');
        }]);

        return Inertia::render('user-groups/show', [
            'group' => [
                'id' => $userGroup->id,
                'name' => $userGroup->name,
                'description' => $userGroup->description,
                'status' => $userGroup->status,
                'total_members' => $userGroup->users->count(),
                'creator' => $userGroup->creator ? [
                    'id' => $userGroup->creator->id,
                    'name' => $userGroup->creator->name,
                ] : null,
                'created_at' => $userGroup->created_at->format('Y-m-d H:i'),
                'members' => $userGroup->users->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'status' => $user->status,
                    'department' => $user->department?->name,
                    'added_at' => $user->pivot->added_at,
                    'added_by' => $user->pivot->added_by,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified user group.
     */
    public function edit(UserGroup $userGroup): Response
    {
        $userGroup->load(['users']);

        $users = User::where('status', 'active')
            ->with('department:id,name')
            ->select('id', 'name', 'email', 'user_type', 'employee_id', 'department_id')
            ->orderBy('name')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'employee_id' => $user->employee_id,
                'department' => $user->department?->name,
            ]);

        return Inertia::render('user-groups/edit', [
            'group' => [
                'id' => $userGroup->id,
                'name' => $userGroup->name,
                'description' => $userGroup->description,
                'status' => $userGroup->status,
                'member_ids' => $userGroup->users->pluck('id'),
            ],
            'users' => $users,
        ]);
    }

    /**
     * Update the specified user group.
     */
    public function update(Request $request, UserGroup $userGroup): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:user_groups,name,' . $userGroup->id],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        $userIds = $validated['user_ids'] ?? [];
        unset($validated['user_ids']);

        $userGroup->update($validated);

        // Sync members if provided
        if (isset($userIds)) {
            $userGroup->syncMembers($userIds);
        }

        return redirect()->route('user-groups.index')
            ->with('success', 'User group updated successfully.');
    }

    /**
     * Remove the specified user group.
     */
    public function destroy(UserGroup $userGroup): RedirectResponse
    {
        $userGroup->delete();

        return redirect()->route('user-groups.index')
            ->with('success', 'User group deleted successfully.');
    }

    /**
     * Add members to a group.
     */
    public function addMembers(Request $request, UserGroup $userGroup): RedirectResponse
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        $addedCount = 0;
        foreach ($validated['user_ids'] as $userId) {
            if ($userGroup->addMember($userId)) {
                $addedCount++;
            }
        }

        return redirect()->back()
            ->with('success', "{$addedCount} member(s) added to group successfully.");
    }

    /**
     * Remove a member from a group.
     */
    public function removeMember(UserGroup $userGroup, User $user): RedirectResponse
    {
        if ($userGroup->removeMember($user->id)) {
            return redirect()->back()
                ->with('success', 'Member removed from group successfully.');
        }

        return redirect()->back()
            ->with('error', 'Member not found in this group.');
    }

    /**
     * Get available users to add to group.
     */
    public function availableUsers(Request $request, UserGroup $userGroup): \Illuminate\Http\JsonResponse
    {
        $search = $request->get('search', '');

        // Get users not already in the group
        $users = User::where('status', 'active')
            ->whereNotIn('id', $userGroup->users()->pluck('users.id'))
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%')
                      ->orWhere('employee_id', 'like', '%' . $search . '%');
                });
            })
            ->select('id', 'name', 'email', 'employee_id', 'user_type')
            ->limit(50)
            ->get();

        return response()->json($users);
    }
}
