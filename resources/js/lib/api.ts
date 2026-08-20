import type { ApiError } from '@/types/api';
import { isLandlordContext, resolveTenantSlug } from '@/lib/tenancy';

export const SESSION_TENANT_SLUG_KEY = 'tammer_tenant_slug';

function readTammerConfig() {
    return (
        window.__TAMMER__ ?? {
            appName: import.meta.env.VITE_APP_NAME ?? 'Tammer Wash',
            apiBaseUrl: '/api/v1',
            landlordApiBaseUrl: '/api/landlord/v1',
            sanctumUrl: '/sanctum/csrf-cookie',
            csrfToken: document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
            isLandlord: false,
            platformDomain: 'tamcarwash.com',
            tenant: null,
            allowQuickLogin: false,
            defaultContact: {
                phone: '+965 18XXXXXX',
                address: 'العاصمة ، الكويت',
            },
        }
    );
}

export function getActiveTenantSlug(): string | null {
    const fromRouting = resolveTenantSlug();
    if (fromRouting) {
        return fromRouting;
    }

    const stored = sessionStorage.getItem(SESSION_TENANT_SLUG_KEY);
    if (stored) {
        return stored;
    }

    const config = readTammerConfig();
    if (config.tenant?.slug) {
        return config.tenant.slug;
    }

    return null;
}

export function setActiveTenantSlug(slug: string): void {
    sessionStorage.setItem(SESSION_TENANT_SLUG_KEY, slug);
}

export const appConfig = readTammerConfig();

export class ApiClientError extends Error implements ApiError {
    status: number;
    code?: string;
    errors?: Record<string, string[]>;

    constructor(message: string, status: number, code?: string, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiClientError';
        this.status = status;
        this.code = code;
        this.errors = errors;
    }
}

export const endpoints = {
    auth: {
        login: 'auth/login',
        logout: 'auth/logout',
        user: 'auth/user',
    },
    landlord: {
        register: 'tenants/register',
        login: 'auth/login',
        logout: 'auth/logout',
        user: 'auth/user',
        dashboardStats: 'dashboard/stats',
        tenants: 'tenants',
        subscriptions: 'subscriptions',
        plans: 'plans',
        settings: 'settings',
    },
    dashboard: {
        stats: 'dashboard/stats',
    },
    branches: 'branches',
    customers: 'customers',
    vehicles: 'vehicles',
    serviceCategories: 'service-categories',
    services: 'services',
    service: (id: number) => `services/${id}`,
    pricing: {
        rules: 'pricing/rules',
        discounts: 'pricing/discounts',
        coupons: 'pricing/coupons',
        couponsValidate: 'pricing/coupons/validate',
    },
    bookings: 'bookings',
    booking: (id: number) => `bookings/${id}`,
    bookingConfirm: (id: number) => `bookings/${id}/confirm`,
    bookingCancel: (id: number) => `bookings/${id}/cancel`,
    bookingReschedule: (id: number) => `bookings/${id}/reschedule`,
    timeSlots: {
        available: 'time-slots/available',
    },
    queue: {
        entries: 'queue/entries',
        walkIn: 'queue/entries/walk-in',
        fromBooking: (bookingId: number) => `queue/entries/from-booking/${bookingId}`,
        entryStatus: (id: number) => `queue/entries/${id}/status`,
        callNext: 'queue/call-next',
        estimatedWait: 'queue/estimated-wait',
        screen: 'queue/screen',
    },
    orders: 'orders',
    order: (id: number) => `orders/${id}`,
    orderTransition: (id: number) => `orders/${id}/transition`,
    orderAssignWorker: (id: number) => `orders/${id}/assign-worker`,
    orderAddItem: (id: number) => `orders/${id}/items`,
    orderInvoice: (orderId: number) => `orders/${orderId}/invoice`,
    invoices: 'invoices',
    invoice: (id: number) => `invoices/${id}`,
    invoiceVoid: (id: number) => `invoices/${id}/void`,
    invoicePdf: (id: number) => `invoices/${id}/pdf`,
    taxReports: 'tax-reports',
    taxReportsDaily: 'tax-reports/daily',
    taxReportsMonthly: 'tax-reports/monthly',
    taxReportsQuarterly: 'tax-reports/quarterly',
    taxReportsBreakdown: 'tax-reports/breakdown',
    settings: 'settings',
    taxSettings: 'tax-settings',
    storefront: {
        profile: 'storefront',
        services: 'storefront/services',
        branches: 'storefront/branches',
        timeSlots: 'storefront/time-slots/available',
        bookings: 'storefront/bookings',
    },
} as const;

class ApiClient {
    private get baseUrl(): string {
        const config = readTammerConfig();
        return isLandlordContext() ? config.landlordApiBaseUrl : config.apiBaseUrl;
    }

    private getLandlordBaseUrl(): string {
        return readTammerConfig().landlordApiBaseUrl;
    }

    private get csrfToken(): string {
        return readTammerConfig().csrfToken;
    }

    private headers(extra: HeadersInit = {}, tenantSlugOverride?: string | null): HeadersInit {
        const config = readTammerConfig();
        const tenantHeaders: Record<string, string> = {};

        if (!isLandlordContext()) {
            const sessionSlug = getActiveTenantSlug();
            const resolvedSlug = tenantSlugOverride ?? sessionSlug;

            // Explicit slug (register/login flow or sessionStorage) wins over the
            // embedded demo tenant on central domains — otherwise post-registration
            // login hits the wrong tenant DB and shows invalid credentials.
            if (resolvedSlug) {
                tenantHeaders['X-Tenant-Slug'] = resolvedSlug;
            } else if (config.tenant?.id) {
                tenantHeaders['X-Tenant-Id'] = config.tenant.id;
            }
        }

        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(this.csrfToken ? { 'X-CSRF-TOKEN': this.csrfToken } : {}),
            ...tenantHeaders,
            ...extra,
        };
    }

    private buildUrl(
        endpoint: string,
        params?: Record<string, string | number | boolean | undefined>,
    ): string {
        const normalized = endpoint.replace(/^\//, '');
        const url = new URL(`${this.baseUrl}/${normalized}`, window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    url.searchParams.set(key, String(value));
                }
            });
        }

        return url.toString();
    }

    private async handleError(response: Response): Promise<never> {
        let message = response.statusText;
        let code: string | undefined;
        let errors: Record<string, string[]> | undefined;

        try {
            const data = (await response.json()) as {
                message?: string;
                code?: string;
                errors?: Record<string, string[]>;
            };
            message = data.message ?? message;
            code = data.code;
            errors = data.errors;
        } catch {
            // Response body is not JSON.
        }

        throw new ApiClientError(message, response.status, code, errors);
    }

    async get<T>(
        endpoint: string,
        params?: Record<string, string | number | boolean | undefined>,
        options?: { tenantSlug?: string | null },
    ): Promise<T> {
        const response = await fetch(this.buildUrl(endpoint, params), {
            method: 'GET',
            headers: this.headers({}, options?.tenantSlug),
            credentials: 'same-origin',
        });

        if (!response.ok) {
            await this.handleError(response);
        }

        return response.json() as Promise<T>;
    }

    async post<T>(
        endpoint: string,
        body?: unknown,
        params?: Record<string, string | number | boolean | undefined>,
        options?: { tenantSlug?: string | null; baseUrl?: 'tenant' | 'landlord' },
    ): Promise<T> {
        const base = options?.baseUrl === 'landlord' ? this.getLandlordBaseUrl() : this.baseUrl;
        const normalized = endpoint.replace(/^\//, '');
        const url = new URL(`${base}/${normalized}`, window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    url.searchParams.set(key, String(value));
                }
            });
        }

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: this.headers({}, options?.tenantSlug),
            credentials: 'same-origin',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            await this.handleError(response);
        }

        return response.json() as Promise<T>;
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await fetch(this.buildUrl(endpoint), {
            method: 'PATCH',
            headers: this.headers(),
            credentials: 'same-origin',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            await this.handleError(response);
        }

        return response.json() as Promise<T>;
    }

    async put<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await fetch(this.buildUrl(endpoint), {
            method: 'PUT',
            headers: this.headers(),
            credentials: 'same-origin',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            await this.handleError(response);
        }

        return response.json() as Promise<T>;
    }

    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(this.buildUrl(endpoint), {
            method: 'DELETE',
            headers: this.headers(),
            credentials: 'same-origin',
        });

        if (!response.ok) {
            await this.handleError(response);
        }

        return response.json() as Promise<T>;
    }

    async ensureCsrfCookie(): Promise<void> {
        const { sanctumUrl } = readTammerConfig();
        await fetch(sanctumUrl, {
            method: 'GET',
            credentials: 'same-origin',
        });
    }
}

export const api = new ApiClient();
export { readTammerConfig as getTammerConfig };

export function buildApiUrl(endpoint: string): string {
    const config = readTammerConfig();
    const base = isLandlordContext() ? config.landlordApiBaseUrl : config.apiBaseUrl;
    return `${window.location.origin}${base}/${endpoint.replace(/^\//, '')}`;
}
