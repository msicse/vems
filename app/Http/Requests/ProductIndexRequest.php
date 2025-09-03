<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductIndexRequest extends FormRequest
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
            'search' => 'nullable|string|max:255',
            'sort' => 'nullable|string|in:id,name,price,category,status,created_at,updated_at',
            'direction' => 'nullable|string|in:asc,desc',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|in:10,20,50,100',
            'filters' => 'nullable|array',
            'filters.category' => 'nullable|array',
            'filters.category.*' => 'string|max:255',
            'filters.status' => 'nullable|array',
            'filters.status.*' => 'string|in:active,inactive,pending',
            'format' => 'nullable|string|in:csv,excel,pdf',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'per_page' => 'items per page',
            'filters.category.*' => 'category filter',
            'filters.status.*' => 'status filter',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'per_page' => $this->per_page ?? 10,
            'page' => $this->page ?? 1,
            'direction' => $this->direction ?? 'desc',
            'sort' => $this->sort ?? 'created_at',
        ]);
    }
}
