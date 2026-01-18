import { LucideIcon } from 'lucide-react';

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
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
    driver_id?: number;
    department_id?: number;
    brand?: string;
    model?: string;
    color?: string;
    name: string;
    type: string;
    registration_number: string;
    vehicle_type: 'sedan' | 'suv' | 'van' | 'microbus' | 'coaster' | 'bus' | 'pickup' | 'truck' | 'other';
    rental_type: 'own' | 'pool' | 'rental' | 'adhoc' | 'support';
    capacity?: number;
    vendor?: string | Vendor;
    driver?: {
        id: number;
        name: string;
        email: string;
        official_phone?: string;
        user_type?: string;
        driving_license_no?: string;
        nid_number?: string;
        personal_phone?: string;
        present_address?: string;
        emergency_contact_name?: string;
        emergency_contact_phone?: string;
        emergency_contact_relation?: string;
        status?: 'active' | 'inactive';
    };
    parking_address: string | null;
    parking_latitude: number | null;
    parking_longitude: number | null;
    is_active: boolean;
    // Tax Token
    tax_token_last_date?: string;
    tax_token_number?: string;
    // Fitness Certificate
    fitness_certificate_last_date?: string;
    fitness_certificate_number?: string;
    // Insurance
    insurance_type?: string;
    insurance_last_date?: string;
    insurance_policy_number?: string;
    insurance_company?: string;
    // Registration Certificate & Owner Info
    registration_certificate_number?: string;
    owner_name?: string;
    owner_address?: string;
    owner_phone?: string;
    owner_email?: string;
    owner_nid?: string;
    // Additional Vehicle Info
    manufacture_year?: number;
    engine_number?: string;
    chassis_number?: string;
    fuel_type?: string;
    // Alert Settings
    tax_token_alert_enabled?: boolean;
    fitness_alert_enabled?: boolean;
    insurance_alert_enabled?: boolean;
    alert_days_before?: number;
    status: string;
    created_at?: string;
    updated_at?: string;
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
    area?: string;
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

export interface Stop {
    id: number;
    name: string;
    description: string | null;
    latitude: string | null;
    longitude: string | null;
    created_at: string;
    updated_at: string;
}

export interface VehicleRoute {
    id: number;
    name: string;
    description: string | null;
    remarks: string | null;
    total_distance: number | null;
    route_stops?: RouteStop[];
    created_at: string;
    updated_at: string;
}

export interface RouteStop {
    id: number;
    vehicle_route_id: number;
    stop_id: number;
    stop_order: number;
    arrival_time: string | null;
    departure_time: string | null;
    distance_from_previous: number | null;
    cumulative_distance: number | null;
    stop?: Stop;
    created_at: string;
    updated_at: string;
}

export interface Trip {
    id: number;
    trip_number: string;
    vehicle_route_id: number | null;
    vehicle_id: number | null;
    department_id: number | null;
    requested_by: number;
    approved_by: number | null;
    purpose: string;
    description: string | null;
    schedule_type: 'pick-and-drop' | 'engineer' | 'training' | 'adhoc' | 'reposition';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduled_date: string;
    scheduled_start_time: string;
    scheduled_end_time: string;
    actual_start_time: string | null;
    actual_end_time: string | null;
    odometer_start: number | null;
    odometer_end: number | null;
    distance_traveled: number | null;
    actual_duration: number | null;
    fuel_consumed: number | null;
    fuel_cost: number | null;
    other_costs: number | null;
    total_cost: number | null;
    status: 'pending' | 'approved' | 'rejected' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    driver_rating: number | null;
    vehicle_rating: number | null;
    feedback: string | null;
    rejection_reason: string | null;
    notes: string | null;
    trip_documents: string[] | null;
    vehicle?: Vehicle;
    vehicle_route?: VehicleRoute;
    department?: Department;
    requester?: User;
    approver?: User;
    driver?: User;
    passengers?: TripPassenger[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface TripPassenger {
    id: number;
    trip_id: number;
    user_id: number;
    pickup_stop_id: number | null;
    dropoff_stop_id: number | null;
    status: 'pending' | 'confirmed' | 'boarded' | 'completed' | 'cancelled' | 'no_show';
    boarded_at: string | null;
    dropped_at: string | null;
    notes: string | null;
    user?: User;
    pickup_stop?: Stop;
    dropoff_stop?: Stop;
    created_at: string;
    updated_at: string;
}

export interface DataTableColumn<T = any> {
    key: keyof T | 'actions';
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
    className?: string;
}
