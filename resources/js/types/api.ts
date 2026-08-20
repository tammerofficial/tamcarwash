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

export interface WashBay {
    id: number;
    name: string;
    bay_number: number;
    status?: string;
    status_label?: string;
    is_active: boolean;
}

export interface Branch {
    id: number;
    name: string;
    code: string;
    address?: string;
    city: string;
    phone?: string;
    email?: string;
    is_active: boolean;
    capacity?: number;
    capacity_per_hour?: number;
    wash_bays_count?: number;
    wash_bays?: WashBay[];
    working_hours?: WorkingHour[];
}

export interface CustomerNote {
    id: number;
    note: string;
    is_pinned: boolean;
    user_id?: number;
    created_at?: string;
}

export interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string;
    status: 'active' | 'inactive' | 'blacklisted';
    status_label?: string;
    loyalty_points_balance?: number;
    loyalty_points?: number;
    vehicles_count?: number;
    notes?: CustomerNote[];
    blacklisted_at?: string;
    blacklist_reason?: string;
}

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van' | 'bus' | 'other';

export interface Vehicle {
    id: number;
    plate_number: string;
    brand: string;
    model: string;
    color: string;
    vehicle_type?: VehicleType;
    vehicle_type_label?: string;
    type?: string;
    customer_id: number;
    customer?: Customer;
    is_active?: boolean;
}

export interface ServiceCategory {
    id: number;
    name: string;
    name_ar?: string;
    slug?: string;
    sort_order?: number;
    is_active: boolean;
    services_count?: number;
}

export interface ServiceAddon {
    id: number;
    name: string;
    name_ar?: string;
    price: number;
    duration_minutes: number;
    vat_included: boolean;
    is_active: boolean;
}

export interface Service {
    id: number;
    category_id: number;
    name: string;
    name_ar?: string;
    slug?: string;
    description?: string;
    duration_minutes: number;
    base_price: number;
    vat_included: boolean;
    vat_rate?: number;
    sort_order?: number;
    is_active: boolean;
    category?: ServiceCategory;
    addons?: ServiceAddon[];
}

export interface PriceRule {
    id: number;
    name: string;
    rule_type: string;
    rule_type_label?: string;
    branch_id?: number | null;
    service_id?: number | null;
    vehicle_type?: string | null;
    price?: number | null;
    discount_percent?: number | null;
    priority?: number;
    is_active: boolean;
    valid_from?: string | null;
    valid_until?: string | null;
}

export interface Discount {
    id: number;
    name: string;
    type: 'percentage' | 'fixed';
    type_label?: string;
    value: number;
    min_order_amount?: number | null;
    max_uses?: number | null;
    used_count?: number;
    is_active: boolean;
}

export interface Coupon {
    id: number;
    discount_id: number;
    code: string;
    max_uses_per_customer?: number | null;
    max_uses?: number | null;
    used_count?: number;
    is_active: boolean;
    discount?: Discount;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface TimeSlot {
    id: number;
    branch_id: number;
    slot_date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    booked_count: number;
    remaining_capacity: number;
    is_available: boolean;
}

export interface Booking {
    id: number;
    booking_number: string;
    branch_id: number;
    customer_id: number;
    vehicle_id: number;
    time_slot_id?: number | null;
    scheduled_date: string;
    scheduled_start_time: string;
    scheduled_end_time?: string | null;
    status: BookingStatus;
    status_label?: string;
    source?: string;
    source_label?: string;
    notes?: string | null;
    cancellation_reason?: string | null;
    service_ids?: number[];
    customer_name?: string;
    vehicle_plate?: string;
    time_slot?: TimeSlot;
    created_at?: string;
}

export type QueueEntryStatus = 'waiting' | 'arrived' | 'in_service' | 'ready' | 'completed' | 'no_show';

export interface QueueEntry {
    id: number;
    branch_id: number;
    queue_number: string;
    queue_date?: string;
    customer_name?: string;
    vehicle_plate?: string;
    status: QueueEntryStatus;
    status_label?: string;
    source: 'walk_in' | 'booking' | 'booked';
    source_label?: string;
    estimated_wait_minutes?: number;
    priority?: number;
    booking_id?: number | null;
    called_at?: string | null;
    arrived_at?: string | null;
    in_service_at?: string | null;
    ready_at?: string | null;
    completed_at?: string | null;
    notes?: string | null;
}

export interface QueueScreenData {
    branch_id: number;
    queue_date: string;
    current_number?: string | null;
    current_status?: QueueEntryStatus | null;
    waiting_count: number;
    estimated_wait_minutes: number;
    entries: QueueEntry[];
}

export type OrderStatus =
    | 'pending'
    | 'checked_in'
    | 'queued'
    | 'in_service'
    | 'quality_check'
    | 'ready'
    | 'completed'
    | 'cancelled';

export interface OrderItem {
    id: number;
    order_id: number;
    service_id?: number;
    addon_id?: number;
    item_type: 'service' | 'addon';
    item_type_label?: string;
    name: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    tax_amount: number;
    total_price: number;
    worker_id?: number;
    status?: string;
}

export interface Order {
    id: number;
    order_number: string;
    branch_id: number;
    customer_id?: number;
    vehicle_id?: number;
    worker_id?: number;
    status: OrderStatus;
    status_label?: string;
    source?: string;
    source_label?: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    notes?: string;
    cancellation_reason?: string;
    items?: OrderItem[];
    customer?: Customer;
    vehicle?: Vehicle;
    worker?: User;
    created_at: string;
    updated_at?: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void' | 'refunded';

export interface InvoiceItem {
    id: number;
    item_type?: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    subtotal: number;
    vat_rate: number;
    vat_amount: number;
    total: number;
    is_tax_exempt?: boolean;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    order_id?: number;
    customer_id?: number;
    branch_id?: number;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    subtotal: number;
    discount_amount?: number;
    vat_rate?: number;
    vat_amount: number;
    total: number;
    status: InvoiceStatus;
    payment_status?: string;
    issue_date?: string;
    due_date?: string;
    is_tax_exempt?: boolean;
    tax_inclusive?: boolean;
    vatin?: string;
    cr_number?: string;
    notes?: string;
    items?: InvoiceItem[];
    created_at?: string;
}

export interface TaxSettings {
    id?: number;
    vat_enabled: boolean;
    vat_rate: number;
    prices_tax_inclusive: boolean;
    vatin?: string | null;
    cr_number?: string | null;
    legal_name_ar?: string | null;
    legal_name_en?: string | null;
    address?: string | null;
}

export interface TaxReportDetail {
    period: string;
    from: string;
    to: string;
    branch_id?: number | null;
    summary: {
        invoice_count: number;
        taxable_sales: number;
        exempt_sales: number;
        vat_collected: number;
        vat_on_expenses: number;
        net_vat_due: number;
        payments_received: number;
    };
    currency: string;
}

export interface TaxReportBreakdownItem {
    date: string;
    invoice_count: number;
    taxable_sales: number;
    exempt_sales: number;
    vat_collected: number;
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
    address?: string | null;
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
