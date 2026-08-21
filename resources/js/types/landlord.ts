export interface LandlordPlanRef {
    id: string;
    slug: string;
    name: string;
}

export interface LandlordPlan extends LandlordPlanRef {
    description?: string;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    max_branches?: number | null;
    max_users?: number | null;
    max_vehicles_per_day?: number | null;
    features?: Record<string, boolean> | string[];
    is_active?: boolean;
    sort_order?: number;
    created_at?: string;
    tenants_count?: number;
}

export interface LandlordTenantRow {
    id: string;
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    status: string;
    plan_id?: string;
    plan?: LandlordPlanRef | null;
    subscription_status?: string;
    subscription_ends_at?: string;
    trial_ends_at?: string;
    created_at?: string;
    activated_at?: string;
    suspended_at?: string;
    dashboard_url?: string;
    subdirectory_url?: string;
    subdomain_url?: string;
    domains?: Array<{ domain: string; type: string; is_primary: boolean }>;
    database_status?: string;
    subscriptions?: LandlordSubscriptionRow[];
}

export interface LandlordSubscriptionRow {
    id: string;
    status: string;
    billing_cycle?: string;
    amount: number;
    currency: string;
    starts_at?: string;
    ends_at?: string;
    trial_ends_at?: string;
    cancelled_at?: string;
    tenant_id?: string;
    plan_id?: string;
    tenant?: {
        id: string;
        name: string;
        slug: string;
        status: string;
        email?: string;
        phone?: string;
        plan?: LandlordPlanRef | null;
    } | null;
    plan?: LandlordPlanRef | null;
}

export type TenantStatus = 'active' | 'suspended' | 'pending' | 'provisioning';
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired';
