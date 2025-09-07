<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorContactPerson;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Vendor::with(['contactPersons', 'vehicles']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $vendors = $query->paginate($request->get('per_page', 15))
            ->withQueryString();

        // Get stats
        $stats = [
            'total' => Vendor::count(),
            'active' => Vendor::where('status', 'active')->count(),
            'inactive' => Vendor::where('status', 'inactive')->count(),
            'with_vehicles' => Vendor::has('vehicles')->count(),
        ];

        return Inertia::render('vendors/index', [
            'vendors' => $vendors,
            'stats' => $stats,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'status', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('vendors/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'trade_license' => 'nullable|string|max:255',
            'trade_license_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'tin' => 'nullable|string|max:255',
            'tin_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'bin' => 'nullable|string|max:255',
            'bin_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'tax_return' => 'nullable|string|max:255',
            'tax_return_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'bank_details' => 'nullable|string',
            'contact_persons' => 'array|min:1', // Minimum 1 contact person
            'contact_persons.*.name' => 'required|string|max:255',
            'contact_persons.*.position' => 'nullable|string|max:255',
            'contact_persons.*.phone' => 'nullable|string|max:20',
            'contact_persons.*.email' => 'nullable|email|max:255',
            'contact_persons.*.is_primary' => 'boolean',
            'contact_persons.*.notes' => 'nullable|string',
        ]);

        $data = $request->except(['trade_license_file', 'tin_file', 'bin_file', 'tax_return_file']);

        // Handle file uploads
        if ($request->hasFile('trade_license_file')) {
            $file = $request->file('trade_license_file');
            $fileName = 'trade_license_' . time() . '.' . $file->getClientOriginalExtension();
            // Store in public disk directly (not as a subdirectory called public)
            $result = $file->storeAs('vendor_documents', $fileName, 'public');
            \Log::info('Trade license file upload result: ' . ($result ?: 'failed') . ' for file ' . $fileName . ' to public disk');
            $data['trade_license_file'] = $fileName;
        } else {
            \Log::info('No trade_license_file uploaded: ' . json_encode($request->all()));
        }

        if ($request->hasFile('tin_file')) {
            $file = $request->file('tin_file');
            $fileName = 'tin_' . time() . '.' . $file->getClientOriginalExtension();
            $result = $file->storeAs('vendor_documents', $fileName, 'public');
            \Log::info('TIN file upload result: ' . ($result ?: 'failed') . ' for file ' . $fileName . ' to public disk');
            $data['tin_file'] = $fileName;
        } else {
            \Log::info('No tin_file uploaded');
        }

        if ($request->hasFile('bin_file')) {
            $file = $request->file('bin_file');
            $fileName = 'bin_' . time() . '.' . $file->getClientOriginalExtension();
            $result = $file->storeAs('vendor_documents', $fileName, 'public');
            \Log::info('BIN file upload result: ' . ($result ?: 'failed') . ' for file ' . $fileName . ' to public disk');
            $data['bin_file'] = $fileName;
        } else {
            \Log::info('No bin_file uploaded');
        }

        if ($request->hasFile('tax_return_file')) {
            $file = $request->file('tax_return_file');
            $fileName = 'tax_return_' . time() . '.' . $file->getClientOriginalExtension();
            $result = $file->storeAs('vendor_documents', $fileName, 'public');
            \Log::info('Tax return file upload result: ' . ($result ?: 'failed') . ' for file ' . $fileName . ' to public disk');
            $data['tax_return_file'] = $fileName;
        } else {
            \Log::info('No tax_return_file uploaded');
        }

        $vendor = Vendor::create($data);

        // Create contact persons
        if (isset($validated['contact_persons'])) {
            foreach ($validated['contact_persons'] as $contactData) {
                $vendor->contactPersons()->create($contactData);
            }
        }

        return redirect()
            ->route('vendors.index')
            ->with('success', 'Vendor created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        $vendor->load(['contactPersons', 'vehicles']);

        return Inertia::render('vendors/show', [
            'vendor' => $vendor,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vendor $vendor)
    {
        $vendor->load('contactPersons');

        // Transform the vendor data to match frontend expectations
        $vendorData = $vendor->toArray();
        $vendorData['contact_persons'] = $vendor->contactPersons->toArray();

        // Remove the camelCase relationship key if Laravel added it
        unset($vendorData['contact_persons_count']);
        unset($vendorData['contactPersons']);

        return Inertia::render('vendors/edit', [
            'vendor' => $vendorData,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vendor $vendor)
    {
        \Log::info('Vendor update request data:', $request->all());

        // Get existing contact persons count
        $existingContactsCount = $vendor->contactPersons()->count();
        $submittedContactsCount = count($request->input('contact_persons', []));

        // Only require minimum 1 if no existing contacts and no submitted contacts
        $minContactsRule = ($existingContactsCount > 0 || $submittedContactsCount >= 1) ? 'array' : 'array|min:1';

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'trade_license' => 'nullable|string|max:255',
            'trade_license_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'tin' => 'nullable|string|max:255',
            'tin_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'bin' => 'nullable|string|max:255',
            'bin_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'tax_return' => 'nullable|string|max:255',
            'tax_return_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'bank_details' => 'nullable|string',
            'contact_persons' => $minContactsRule,
            'contact_persons.*.id' => 'nullable|exists:vendor_contact_persons,id',
            'contact_persons.*.name' => 'required|string|max:255',
            'contact_persons.*.position' => 'nullable|string|max:255',
            'contact_persons.*.phone' => 'nullable|string|max:20',
            'contact_persons.*.email' => 'nullable|email|max:255',
            'contact_persons.*.is_primary' => 'boolean',
            'contact_persons.*.notes' => 'nullable|string',
        ]);

        try {
            $data = $request->except(['trade_license_file', 'tin_file', 'bin_file', 'tax_return_file']);

            // Handle file uploads
            \Log::info('Checking for trade_license_file upload');
            if ($request->hasFile('trade_license_file')) {
                \Log::info('trade_license_file is being uploaded');
                // Remove old file if it exists
                if ($vendor->trade_license_file) {
                    \Log::info('Removing old trade license file: ' . $vendor->trade_license_file);
                    Storage::delete('public/vendor_documents/' . $vendor->trade_license_file);
                }

                $file = $request->file('trade_license_file');
                $originalName = $file->getClientOriginalName();
                $fileName = 'trade_license_' . time() . '.' . $file->getClientOriginalExtension();
                \Log::info('New trade license file: ' . $fileName . ' (original: ' . $originalName . ')');
                $result = $file->storeAs('vendor_documents', $fileName, 'public');
                \Log::info('Trade license file store result: ' . ($result ?: 'failed') . ' to public disk');
                $data['trade_license_file'] = $fileName;
            } else {
                \Log::info('No trade_license_file present in the request');
            }

            if ($request->hasFile('tin_file')) {
                if ($vendor->tin_file) {
                    Storage::delete('public/vendor_documents/' . $vendor->tin_file);
                }

                $file = $request->file('tin_file');
                $fileName = 'tin_' . time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('vendor_documents', $fileName, 'public');
                $data['tin_file'] = $fileName;
            }

            if ($request->hasFile('bin_file')) {
                if ($vendor->bin_file) {
                    Storage::delete('public/vendor_documents/' . $vendor->bin_file);
                }

                $file = $request->file('bin_file');
                $fileName = 'bin_' . time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('vendor_documents', $fileName, 'public');
                $data['bin_file'] = $fileName;
            }

            if ($request->hasFile('tax_return_file')) {
                if ($vendor->tax_return_file) {
                    Storage::delete('public/vendor_documents/' . $vendor->tax_return_file);
                }

                $file = $request->file('tax_return_file');
                $fileName = 'tax_return_' . time() . '.' . $file->getClientOriginalExtension();
                $file->storeAs('vendor_documents', $fileName, 'public');
                $data['tax_return_file'] = $fileName;
            }

            $vendor->update($data);
            \Log::info('Vendor updated successfully:', ['vendor_id' => $vendor->id]);

            // Update contact persons
        if (isset($validated['contact_persons'])) {
            // Get existing contact person IDs
            $existingIds = $vendor->contactPersons->pluck('id')->toArray();
            $submittedIds = collect($validated['contact_persons'])
                ->pluck('id')
                ->filter()
                ->toArray();

            // Delete removed contact persons
            $toDelete = array_diff($existingIds, $submittedIds);
            VendorContactPerson::whereIn('id', $toDelete)->delete();

            // Update or create contact persons
            foreach ($validated['contact_persons'] as $contactData) {
                if (isset($contactData['id'])) {
                    // Update existing
                    VendorContactPerson::where('id', $contactData['id'])
                        ->update(\Arr::except($contactData, ['id']));
                } else {
                    // Create new
                    $vendor->contactPersons()->create($contactData);
                }
            }
        }

            return redirect()
                ->route('vendors.index')
                ->with('success', 'Vendor updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Error updating vendor:', ['error' => $e->getMessage()]);

            return back()
                ->withErrors(['error' => 'Failed to update vendor: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vendor $vendor)
    {
        // Check if vendor has vehicles
        if ($vendor->vehicles()->count() > 0) {
            return redirect()
                ->route('vendors.index')
                ->with('error', 'Cannot delete vendor with associated vehicles.');
        }

        $vendor->delete();

        return redirect()
            ->route('vendors.index')
            ->with('success', 'Vendor deleted successfully!');
    }

    /**
     * Get vendors for dropdown/select options
     */
    public function getVendorsForSelect()
    {
        $vendors = Vendor::active()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($vendors);
    }
}
