<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VehicleIndexRequest extends FormRequest
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
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', 'in:id,brand,model,color,registration_number,vendor,is_active,created_at'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
            'filters' => ['nullable', 'array'],
            'filters.brand' => ['nullable', 'array'],
            'filters.brand.*' => ['string'],
            'filters.color' => ['nullable', 'array'],
            'filters.color.*' => ['string'],
            'filters.is_active' => ['nullable', 'array'],
            'filters.is_active.*' => ['boolean'],
            'format' => ['nullable', 'string', 'in:csv,xlsx,pdf'],
            'template_id' => ['nullable', 'integer', 'exists:export_templates,id'],
        ];
    }

    /**
     * Get the validated data with defaults.
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();

        // Set defaults
        $validated['sort'] = $validated['sort'] ?? 'id';
        $validated['direction'] = $validated['direction'] ?? 'desc';
        $validated['per_page'] = $validated['per_page'] ?? 15;

        return $validated;
    }
}
