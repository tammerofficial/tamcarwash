import type { ApiError } from '@/types/api';

function readTammerConfig() {
    return (
        window.__TAMMER__ ?? {
            appName: import.meta.env.VITE_APP_NAME ?? 'Tammer Wash',
            apiBaseUrl: '/api/v1',
            landlordApiBaseUrl: '/api/landlord/v1',
            sanctumUrl: '/sanctum/csrf-cookie',
            csrfToken: document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
            isLandlord: false,
            tenant: null,
        }
    );
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
    dashboard: {
        stats: 'dashboard/stats',
    },
    branches: 'branches',
    customers: 'customers',
    vehicles: 'vehicles',
    services: 'services',
    pricing: {
        rules: 'pricing/rules',
        coupons: 'pricing/coupons',
    },
    bookings: 'bookings',
    queue: {
        entries: 'queue/entries',
        callNext: 'queue/call-next',
        screen: 'queue/screen',
    },
    orders: 'orders',
    invoices: 'invoices',
    taxReports: 'tax-reports',
    settings: 'settings',
} as const;

class ApiClient {
    private get baseUrl(): string {
        const config = readTammerConfig();
        return config.isLandlord ? config.landlordApiBaseUrl : config.apiBaseUrl;
    }

    private get csrfToken(): string {
        return readTammerConfig().csrfToken;
    }

    private headers(extra: HeadersInit = {}): HeadersInit {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(this.csrfToken ? { 'X-CSRF-TOKEN': this.csrfToken } : {}),
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
    ): Promise<T> {
        const response = await fetch(this.buildUrl(endpoint, params), {
            method: 'GET',
            headers: this.headers(),
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
    ): Promise<T> {
        const response = await fetch(this.buildUrl(endpoint, params), {
            method: 'POST',
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
