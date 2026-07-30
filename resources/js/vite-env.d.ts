/// <reference types="vite/client" />

export interface TenantBranding {
    logo_url?: string | null;
    primary_color?: string;
    tagline?: string | null;
    about?: string | null;
    social?: Record<string, string>;
}

export interface TammerAppConfig {
    appName: string;
    apiBaseUrl: string;
    landlordApiBaseUrl: string;
    sanctumUrl: string;
    csrfToken: string;
    isLandlord: boolean;
    platformDomain?: string;
    tenancyMode?: 'subdirectory' | 'subdomain';
    subdirectoryEnabled?: boolean;
    reservedPaths?: string[];
    subdirectorySlug?: string | null;
    tenant?: {
        id: string;
        name: string;
        slug: string;
        email?: string | null;
        phone?: string | null;
        branding?: TenantBranding | null;
    } | null;
    allowQuickLogin?: boolean;
}

declare global {
    interface Window {
        __TAMMER__?: TammerAppConfig;
    }
}

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
