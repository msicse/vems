import type { User } from './user';

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
    color: string | null;
    registration_number: string;
    vendor: string | null;
    vendor_id: number | null;
    vendor_obj?: Vendor;
    driver_id: number;
    driver?: User;
    is_active: boolean;
    tax_token_last_date: string | null;
    tax_token_number: string | null;
    fitness_certificate_last_date: string | null;
    fitness_certificate_number: string | null;
    insurance_type: '1st_party' | '3rd_party' | 'comprehensive' | null;
    insurance_last_date: string | null;
    insurance_policy_number: string | null;
    insurance_company: string | null;
    registration_certificate_number: string | null;
    owner_name: string | null;
    owner_address: string | null;
    owner_phone: string | null;
    owner_email: string | null;
    owner_nid: string | null;
    manufacture_year: number | null;
    engine_number: string | null;
    chassis_number: string | null;
    fuel_type: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid' | null;
    tax_token_alert_enabled: boolean;
    fitness_alert_enabled: boolean;
    insurance_alert_enabled: boolean;
    alert_days_before: number;
    created_at: string;
    updated_at: string;
}
