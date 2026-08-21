import type { ApiError } from '@/types/api';
import {
    isLandlordContext,
    resolveActiveTenantSlug,
    SESSION_TENANT_SLUG_KEY,
} from '@/lib/tenancy';

export { SESSION_TENANT_SLUG_KEY };

function readXsrfTokenFromCookie(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    if (!match?.[1]) {
        return '';
    }

    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

function resolveCsrfToken(): string {
    const fromCookie = readXsrfTokenFromCookie();
    if (fromCookie) {
        return fromCookie;
    }

    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
        readTammerConfig().csrfToken ??
        ''
    );
}

function readTammerConfig() {
    return (
        window.__TAMMER__ ?? {
            appName: import.meta.env.VITE_APP_NAME ?? 'تمير واش',
            tagline: 'Enterprise SaaS',
            platform: {
                name: import.meta.env.VITE_APP_NAME ?? 'تمير واش',
                tagline: 'Enterprise SaaS',
            },
            apiBaseUrl: '/api/v1',
            landlordApiBaseUrl: '/api/landlord/v1',
            sanctumUrl: '/sanctum/csrf-cookie',
            csrfToken: '',
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
    return resolveActiveTenantSlug();
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
        tenant: (id: string) => `tenants/${id}`,
        subscriptions: 'subscriptions',
        subscription: (id: string) => `subscriptions/${id}`,
        subscriptionCancel: (id: string) => `subscriptions/${id}/cancel`,
        subscriptionReactivate: (id: string) => `subscriptions/${id}/reactivate`,
        plans: 'plans',
        plan: (id: string) => `plans/${id}`,
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
    bookingConvert: (id: number) => `bookings/${id}/convert-to-order`,
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
        screenPublic: 'queue/screen/public',
    },
    payments: 'payments',
    paymentMethods: 'payment-methods',
    orders: 'orders',
    order: (id: number) => `orders/${id}`,
    orderTransition: (id: number) => `orders/${id}/transition`,
    orderAssignWorker: (id: number) => `orders/${id}/assign-worker`,
    orderAddItem: (id: number) => `orders/${id}/items`,
    orderInvoice: (orderId: number) => `orders/${orderId}/invoice`,
    ordersScreen: 'orders/screen',
    ordersScreenPublic: 'orders/screen/public',
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
        branding: 'storefront/branding',
        brandingJson: 'branding.json',
        services: 'storefront/services',
        branches: 'storefront/branches',
        timeSlots: 'storefront/time-slots/available',
        bookings: 'storefront/bookings',
        queueStatus: 'storefront/queue-status',
        track: 'storefront/track',
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
        return resolveCsrfToken();
    }

    private requestCredentials(): RequestCredentials {
        return 'include';
    }

    private headers(extra: HeadersInit = {}, tenantSlugOverride?: string | null, isFormData = false): HeadersInit {
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

        const baseHeaders: Record<string, string> = {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(this.csrfToken ? { 'X-XSRF-TOKEN': this.csrfToken } : {}),
            ...tenantHeaders,
        };

        if (!isFormData) {
            baseHeaders['Content-Type'] = 'application/json';
        }

        return {
            ...baseHeaders,
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
            credentials: this.requestCredentials(),
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
        options?: { tenantSlug?: string | null; baseUrl?: 'tenant' | 'landlord'; headers?: HeadersInit },
    ): Promise<T> {
        if (! readXsrfTokenFromCookie()) {
            await this.ensureCsrfCookie();
        }

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

        const isFormData = body instanceof FormData;

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: this.headers(options?.headers ?? {}, options?.tenantSlug, isFormData),
            credentials: this.requestCredentials(),
            body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
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
            credentials: this.requestCredentials(),
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
            credentials: this.requestCredentials(),
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
            credentials: this.requestCredentials(),
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
            credentials: this.requestCredentials(),
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
