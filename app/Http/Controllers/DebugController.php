<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DebugController extends Controller
{
    public function authCheck()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'authenticated' => false,
                'message' => 'User not authenticated'
            ]);
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'can_view_departments' => $user->can('view-departments'),
                'can_create_departments' => $user->can('create-departments'),
                'can_edit_departments' => $user->can('edit-departments'),
                'can_delete_departments' => $user->can('delete-departments'),
            ]
        ]);
    }
}
