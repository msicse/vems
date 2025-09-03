<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'official_phone' => ['nullable', 'string', 'max:20'],
            'personal_phone' => ['nullable', 'string', 'max:20'],
            'emergency_phone' => ['nullable', 'string', 'max:20'],
            'user_type' => ['nullable', 'string', 'in:admin,driver,manager,employee'],
            'blood_group' => ['nullable', 'string', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'image' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:active,inactive,suspended'],
            'address' => ['nullable', 'string', 'max:500'],
            'whatsapp_id' => ['nullable', 'string', 'max:20'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            // Driver-specific fields
            'driving_license_no' => ['nullable', 'string', 'max:50'],
            'nid_number' => ['nullable', 'string', 'max:50'],
            'present_address' => ['nullable', 'string', 'max:1000'],
            'permanent_address' => ['nullable', 'string', 'max:1000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_relation' => ['nullable', 'string', 'max:100'],
        ];

        // Driver-specific validation rules
        $userType = $this->input('user_type');
        if ($userType === 'driver') {
            $rules['username'] = ['required', 'string', 'max:255', 'unique:users'];
            $rules['email'] = ['nullable', 'string', 'email', 'max:255', 'unique:users'];
            // Required fields for drivers
            $rules['driving_license_no'] = ['required', 'string', 'max:50', 'unique:users'];
            $rules['nid_number'] = ['required', 'string', 'max:50', 'unique:users'];
            $rules['official_phone'] = ['required', 'string', 'max:20'];
            $rules['present_address'] = ['required', 'string', 'max:1000'];
            $rules['permanent_address'] = ['required', 'string', 'max:1000'];
            $rules['emergency_contact_name'] = ['required', 'string', 'max:255'];
            $rules['emergency_contact_phone'] = ['required', 'string', 'max:20'];
            $rules['emergency_contact_relation'] = ['required', 'string', 'max:100'];
        } elseif ($userType && $userType !== 'none') {
            $rules['username'] = ['nullable', 'string', 'max:255', 'unique:users'];
            $rules['email'] = ['required', 'string', 'email', 'max:255', 'unique:users'];
        } else {
            // Default rules when no user type is selected
            $rules['username'] = ['nullable', 'string', 'max:255', 'unique:users'];
            $rules['email'] = ['required', 'string', 'email', 'max:255', 'unique:users'];
        }

        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'user_type' => 'user type',
            'blood_group' => 'blood group',
            'whatsapp_id' => 'WhatsApp ID',
            'department_id' => 'department',
        ];
    }
}
