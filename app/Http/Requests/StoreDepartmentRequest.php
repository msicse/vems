<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepartmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->can('create-departments');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Basic Information
            'name' => ['required', 'string', 'max:255', 'unique:departments'],
            'code' => ['required', 'string', 'max:10', 'unique:departments'],
            'description' => ['nullable', 'string', 'max:1000'],

            // Management
            'head_id' => ['nullable', 'exists:users,id'],

            // Contact Information
            'location' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],

            // Status
            'is_active' => ['required', 'boolean'],

            // Budget (optional JSON field)
            'budget_allocation' => ['nullable', 'array'],
            'budget_allocation.vehicle_maintenance' => ['nullable', 'numeric', 'min:0'],
            'budget_allocation.fuel' => ['nullable', 'numeric', 'min:0'],
            'budget_allocation.operations' => ['nullable', 'numeric', 'min:0'],
            'budget_allocation.equipment' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Department name is required.',
            'name.unique' => 'This department name already exists.',
            'code.required' => 'Department code is required.',
            'code.unique' => 'This department code already exists.',
            'code.max' => 'Department code must not exceed 10 characters.',
            'head_id.exists' => 'Selected department head is invalid.',
            'email.email' => 'Please enter a valid email address.',
            'budget_allocation.*.numeric' => 'Budget amounts must be numeric.',
            'budget_allocation.*.min' => 'Budget amounts must be positive.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'head_id' => 'department head',
            'is_active' => 'status',
            'budget_allocation.vehicle_maintenance' => 'vehicle maintenance budget',
            'budget_allocation.fuel' => 'fuel budget',
            'budget_allocation.operations' => 'operations budget',
            'budget_allocation.equipment' => 'equipment budget',
        ];
    }
}
