/// <reference types="vite/client" />

export interface TammerAppConfig {
    appName: string;
    apiBaseUrl: string;
    landlordApiBaseUrl: string;
    sanctumUrl: string;
    csrfToken: string;
    isLandlord: boolean;
    platformDomain?: string;
    tenant?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    defaultTenantSlug?: string | null;
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
