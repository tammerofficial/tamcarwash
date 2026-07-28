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
    return (
        detectTenantSlugFromSubdomain() ??
        detectTenantSlugFromPathname() ??
        readConfig().tenant?.slug ??
        null
    );
}

export function getRouterBasename(): string | undefined {
    if (isLandlordContext()) {
        return undefined;
    }

    const slug = detectTenantSlugFromPathname();

    if (slug && readConfig().subdirectoryEnabled) {
        return `/${slug}`;
    }

    return undefined;
}

export function tenantPath(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const basename = getRouterBasename();

    if (!basename) {
        return normalized;
    }

    return `${basename}${normalized}`;
}
