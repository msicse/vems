import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    username?: string;
    email?: string; // Made optional for drivers
    phone?: string; // Keep for backward compatibility
    official_phone?: string;
    personal_phone?: string;
    emergency_phone?: string;
    user_type?: string;
    blood_group?: string;
    image?: string;
    avatar?: string; // Keep for backward compatibility
    status: string;
    address?: string;
    whatsapp_id?: string;
    // Driver-specific fields
    driving_license_no?: string;
    nid_number?: string;
    present_address?: string;
    permanent_address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
    last_login_at?: string;
    last_login_ip?: string;
    last_login_location?: string;
    last_login_device?: string;
    last_login_country?: string;
    last_login_timezone?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    department_id?: number;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    status: 'active' | 'inactive' | 'pending';
    created_at: string;
    updated_at: string;
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

export interface Vendor {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    description: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    contact_persons?: VendorContactPerson[];
    vehicles?: Vehicle[];
    vehicles_count?: number;
}

export interface Vehicle {
    id: number;
    brand: string;
    model: string;
    color: string | null; // Made optional
    registration_number: string;
    vendor: string | null; // Keep for backward compatibility
    vendor_id: number | null;
    vendor?: Vendor;
    driver_id: number;
    driver?: User;
    is_active: boolean;
    // Tax Token
    tax_token_last_date: string | null;
    tax_token_number: string | null;
    // Fitness Certificate
    fitness_certificate_last_date: string | null;
    fitness_certificate_number: string | null;
    // Insurance
    insurance_type: '1st_party' | '3rd_party' | 'comprehensive' | null;
    insurance_last_date: string | null;
    insurance_policy_number: string | null;
    insurance_company: string | null;
    // Registration Certificate & Owner Info
    registration_certificate_number: string | null;
    owner_name: string | null;
    owner_address: string | null;
    owner_phone: string | null;
    owner_email: string | null;
    owner_nid: string | null;
    // Additional Vehicle Info
    manufacture_year: number | null;
    engine_number: string | null;
    chassis_number: string | null;
    fuel_type: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid' | null;
    // Alert Settings
    tax_token_alert_enabled: boolean;
    fitness_alert_enabled: boolean;
    insurance_alert_enabled: boolean;
    alert_days_before: number;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
    users?: User[];
    users_count?: number;
    permissions_count?: number;
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    users?: User[];
    roles_count?: number;
    users_count?: number;
}

export interface ActionButton {
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
}


// DataTable Types
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
    key: string;
    direction: SortDirection;
}

export interface FilterOption {
    label: string;
    value: string | number;
}

export interface ColumnFilter {
    key: string;
    label: string;
    options: FilterOption[];
    type: 'select' | 'multiselect';
}

export interface DataTableColumn<T = any> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    filterOptions?: FilterOption[];
    render?: (value: any, row: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    startItem: number;
    endItem: number;
}

export interface DataTableProps<T = any> {
    data: T[];
    columns: DataTableColumn<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    filterable?: boolean;
    filters?: ColumnFilter[];
    sortable?: boolean;
    paginated?: boolean;
    itemsPerPage?: number;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
    onRowClick?: (row: T) => void;
}

