import type { TammerAppConfig } from '@/vite-env';

const DEFAULT_RESERVED_PATHS = [
    'api',
    'login',
    'register',
    'sanctum',
    'up',
    'landlord',
    'build',
    'storage',
    'dashboard',
    'settings',
    'appearance',
    'branches',
    'customers',
    'vehicles',
    'services',
    'pricing',
    'booking',
    'queue',
    'cashier',
    'worker',
    'orders',
    'invoices',
    'tax-reports',
];

function readConfig(): TammerAppConfig {
    return (
        window.__TAMMER__ ?? {
            appName: 'Tammer Wash',
            apiBaseUrl: '/api/v1',
            landlordApiBaseUrl: '/api/landlord/v1',
            sanctumUrl: '/sanctum/csrf-cookie',
            csrfToken: '',
            isLandlord: false,
        }
    );
}

export function getReservedPaths(): string[] {
    return readConfig().reservedPaths ?? DEFAULT_RESERVED_PATHS;
}

export function isLandlordContext(): boolean {
    const config = readConfig();
    if (config.isLandlord) {
        return true;
    }

    return window.location.pathname.startsWith('/landlord');
}

export function detectTenantSlugFromSubdomain(): string | null {
    const config = readConfig();
    const host = window.location.hostname;
    const platformDomain = config.platformDomain ?? 'tamcarwash.test';

    if (!host.endsWith(`.${platformDomain}`)) {
        return null;
    }

    const subdomain = host.slice(0, -(platformDomain.length + 1));

    if (!subdomain || ['www', 'api', 'admin', 'landlord', 'platform'].includes(subdomain)) {
        return null;
    }

    return subdomain;
}

export function detectTenantSlugFromPathname(pathname = window.location.pathname): string | null {
    const config = readConfig();

    if (!config.subdirectoryEnabled) {
        return null;
    }

    const segment = pathname.split('/').filter(Boolean)[0];

    if (!segment) {
        return null;
    }

    if (getReservedPaths().includes(segment.toLowerCase())) {
        return null;
    }

    return segment.toLowerCase();
}

export function resolveTenantSlug(): string | null {
    const config = readConfig();

    return (
        detectTenantSlugFromSubdomain() ??
        (config.subdirectorySlug ? config.subdirectorySlug.toLowerCase() : null) ??
        detectTenantSlugFromPathname() ??
        config.tenant?.slug ??
        null
    );
}

function readSessionTenantSlug(): string | null {
    try {
        return sessionStorage.getItem(SESSION_TENANT_SLUG_KEY);
    } catch {
        return null;
    }
}

export function getRouterBasename(): string | undefined {
    if (isLandlordContext() || ! readConfig().subdirectoryEnabled) {
        return undefined;
    }

    if (detectTenantSlugFromSubdomain()) {
        return undefined;
    }

    const config = readConfig();

    if (config.subdirectorySlug) {
        return `/${config.subdirectorySlug.toLowerCase()}`;
    }

    const fromPath = detectTenantSlugFromPathname();

    return fromPath ? `/${fromPath}` : undefined;
}

export function tenantPath(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const basename = getRouterBasename();

    if (!basename) {
        return normalized;
    }

    return `${basename}${normalized}`;
}

export function isTenantContext(): boolean {
    return ! isLandlordContext() && resolveTenantSlug() !== null;
}

export const SESSION_TENANT_SLUG_KEY = 'tammer_tenant_slug';

/** Tenant slug for API requests — prefers login/session over app route segments. */
export function resolveActiveTenantSlug(): string | null {
    const config = readConfig();

    const fromSubdomain = detectTenantSlugFromSubdomain();
    if (fromSubdomain) {
        return fromSubdomain;
    }

    if (config.subdirectorySlug) {
        return config.subdirectorySlug.toLowerCase();
    }

    const fromSession = readSessionTenantSlug();
    if (fromSession) {
        return fromSession.toLowerCase();
    }

    if (config.tenant?.slug) {
        return config.tenant.slug.toLowerCase();
    }

    return detectTenantSlugFromPathname();
}

/**
 * Browser path to the tenant's public marketing home.
 * Subdomain tenants: `/`. Subdirectory tenants: `/{slug}`.
 */
export function getTenantPublicHomeHref(): string {
    if (detectTenantSlugFromSubdomain()) {
        return '/';
    }

    const slug = resolveActiveTenantSlug();
    const config = readConfig();

    if (slug && config.subdirectoryEnabled) {
        return `/${slug}`;
    }

    return '/';
}

/** Alias for getTenantPublicHomeHref — full path to tenant public home. */
export function getTenantPublicUrl(): string {
    return getTenantPublicHomeHref();
}

/** Use React Router Link when basename already scopes routes to the tenant. */
export function shouldUseTenantHomeRouterLink(): boolean {
    return getRouterBasename() != null || getTenantPublicHomeHref() === '/';
}
