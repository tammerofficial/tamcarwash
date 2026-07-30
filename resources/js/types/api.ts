export interface ApiError {
    message: string;
    status: number;
    code?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links?: {
        first?: string;
        last?: string;
        prev?: string | null;
        next?: string | null;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface Branch {
    id: number;
    name: string;
    code: string;
    city: string;
    is_active: boolean;
    capacity?: number;
    wash_bays_count?: number;
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string;
    status: 'active' | 'inactive' | 'blacklisted';
    loyalty_points?: number;
    vehicles_count?: number;
}

export interface Vehicle {
    id: number;
    plate_number: string;
    brand: string;
    model: string;
    color: string;
    type: string;
    customer_id: number;
    customer?: Customer;
}

export interface Service {
    id: number;
    name: string;
    category?: string;
    duration_minutes: number;
    base_price: number;
    vat_inclusive: boolean;
    is_active: boolean;
}

export interface PriceRule {
    id: number;
    name: string;
    rule_type: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    is_active: boolean;
}

export interface Booking {
    id: number;
    booking_number: string;
    customer_name: string;
    vehicle_plate: string;
    service_name: string;
    scheduled_at: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    branch_id: number;
}

export interface QueueEntry {
    id: number;
    queue_number: string;
    customer_name: string;
    vehicle_plate: string;
    status: 'waiting' | 'arrived' | 'in_service' | 'ready' | 'completed' | 'no_show';
    source: 'walk_in' | 'booking';
    estimated_wait_minutes?: number;
    called_at?: string;
}

export interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    vehicle_plate: string;
    total: number;
    status: string;
    branch_id: number;
    created_at: string;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    customer_name: string;
    subtotal: number;
    vat_amount: number;
    total: number;
    status: 'draft' | 'issued' | 'paid' | 'cancelled';
    issued_at?: string;
}

export interface PlanMeta {
    plan_name: string;
    plan_slug: string;
    subscription_status: 'active' | 'trial' | 'none' | string;
    subscription_starts_at?: string | null;
    subscription_ends_at?: string | null;
    days_remaining?: number | null;
    features: string[];
    limits: {
        max_branches: number | null;
        max_users: number | null;
        max_vehicles_per_day: number | null;
    };
    usage: {
        branches: number;
    };
    can_add_branch: boolean;
}

export interface DashboardStats {
    today_orders: number;
    today_revenue: number;
    queue_waiting: number;
    active_bookings: number;
    revenue_trend: Array<{ date: string; revenue: number }>;
    orders_by_status: Array<{ status: string; count: number }>;
    top_services: Array<{ name: string; count: number; revenue: number }>;
    plan?: PlanMeta | null;
}

export interface TaxReportSummary {
    period: string;
    taxable_sales: number;
    exempt_sales: number;
    vat_collected: number;
    vat_on_expenses: number;
    net_vat_due: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles?: string[];
}

export interface LoginPayload {
    email: string;
    password: string;
    remember?: boolean;
    tenantSlug?: string;
}

export interface LoginResponse {
    user: User;
    token?: string;
}

export interface RegisterTenantPayload {
    business_name: string;
    slug?: string;
    owner_name: string;
    owner_email: string;
    owner_password: string;
    password_confirmation: string;
    phone?: string;
    plan_slug?: string;
}

export interface RegisterTenantResponse {
    tenant: {
        id: string;
        slug: string;
        name: string;
        plan: {
            slug: string;
            name: string;
        };
        domain: string;
    };
    owner: {
        email: string;
        name: string;
    };
    login: {
        tenant_slug: string;
        endpoint: string;
        header: string;
        instructions: string;
    };
}

export interface TenantSettings {
    business_name: string;
    tenant_slug?: string;
    vat_enabled: boolean;
    vat_rate: number;
    vat_inclusive: boolean;
    currency: string;
    timezone: string;
    plan?: PlanMeta | null;
}

export interface StorefrontBranding {
    logo_url?: string | null;
    primary_color?: string;
    tagline?: string | null;
    about?: string | null;
    social?: Record<string, string>;
}

export interface StorefrontProfile {
    business_name: string;
    tenant_slug?: string;
    email?: string | null;
    phone?: string | null;
    country?: string;
    timezone?: string;
    currency?: string;
    vat_rate?: number;
    branding?: StorefrontBranding;
    stats?: {
        branches: number;
        services: number;
    };
}

export interface StorefrontBranch {
    id: number;
    name: string;
    code: string;
    address?: string;
    city: string;
    phone?: string;
    email?: string;
    is_active: boolean;
    working_hours?: WorkingHour[];
}

export interface WorkingHour {
    id: number;
    day_of_week: number;
    opens_at?: string;
    closes_at?: string;
    is_closed: boolean;
}

export interface StorefrontService {
    id: number;
    name: string;
    name_ar?: string;
    description?: string;
    duration_minutes: number;
    base_price: number;
    vat_included: boolean;
    is_active: boolean;
    category?: {
        id: number;
        name: string;
    };
}

export interface StorefrontTimeSlot {
    id: number;
    branch_id: number;
    slot_date: string;
    start_time: string;
    end_time: string;
    remaining_capacity: number;
    is_available: boolean;
}

export interface PublicBookingPayload {
    branch_id: number;
    time_slot_id?: number;
    scheduled_date: string;
    scheduled_start_time: string;
    scheduled_end_time?: string;
    notes?: string;
    service_ids?: number[];
    customer: {
        name: string;
        phone: string;
        email?: string;
    };
    vehicle: {
        plate_number: string;
        brand?: string;
        model?: string;
        color?: string;
        vehicle_type?: string;
    };
}
