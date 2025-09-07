export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface Vendor {
    id: number;
    name: string;
    address: string | null;
    status: 'active' | 'inactive';
    phone: string | null;
    email: string | null;
    website: string | null;
    description: string | null;
    trade_license: string | null;
    trade_license_file: string | null;
    tin: string | null;
    tin_file: string | null;
    bin: string | null;
    bin_file: string | null;
    tax_return: string | null;
    tax_return_file: string | null;
    bank_details: string | null;
    created_at: string;
    updated_at: string;
    contact_persons: VendorContactPerson[];
    vehicles?: Vehicle[];
    vehicles_count?: number;
}

export interface VendorContactPerson {
    id: number;
    vendor_id: number;
    name: string;
    position: string | null;
    phone: string | null;
    email: string | null;
    is_primary: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Vehicle {
    id: number;
    vendor_id?: number;
    department_id?: number;
    name: string;
    type: string;
    registration_number: string;
    status: string;
}

export interface Department {
    id: number;
    name: string;
    code: string;
    description: string | null;
    location: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
    budget_allocation: Record<string, number> | null;
    total_budget: number;
    head: {
        id: number;
        name: string;
        email: string;
    } | null;
    users: Array<{
        id: number;
        name: string;
        email: string;
        user_type: string;
        status: string;
        roles: string[];
        created_at: string;
    }>;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    user_type: string;
    status: string;
    roles?: string[];
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    users_count?: number;
    permissions_count?: number;
    users?: User[];
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    group?: string;
}

export interface Product {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    price: number;
    status: string;
    created_at: string;
    updated_at: string;
}
