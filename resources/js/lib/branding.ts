import { appConfig } from '@/lib/api';
import type { StorefrontProfile, TenantBrandingPayload } from '@/types/api';

export function initDocumentTitle(): void {
    document.title = getDocumentTitle();
}

export function getAppName(): string {
    return appConfig.appName || appConfig.platform?.name || 'تمير واش';
}

export function getAppTagline(): string | null {
    return appConfig.tagline ?? appConfig.platform?.tagline ?? null;
}

export function getPlatformName(): string {
    return appConfig.platform?.name ?? appConfig.appName ?? 'تمير واش';
}

export function getPlatformTagline(): string | null {
    return appConfig.platform?.tagline ?? null;
}

export function getDocumentTitle(): string {
    const name = getAppName();
    const tagline = getAppTagline();

    return tagline ? `${name} — ${tagline}` : name;
}

/** Professional government deep blue primary */
export const DEFAULT_BRAND_PRIMARY = '#003D5C';

/** Bright light blue accent for institutional design */
export const DEFAULT_BRAND_SECONDARY = '#4A90E2';

export const DEFAULT_BRAND_PRIMARY_DARK = '#001F35';

export interface ResolvedTenantBranding {
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    tagline: string | null;
    about: string | null;
    social: Record<string, string>;
}

export function getTenantBranding(profile?: StorefrontProfile | null): ResolvedTenantBranding {
    const embedded = appConfig.tenant?.branding;
    const fromApi = profile?.branding;

    return {
        logoUrl: fromApi?.logo_url ?? embedded?.logo_url ?? null,
        primaryColor: fromApi?.primary_color ?? embedded?.primary_color ?? DEFAULT_BRAND_PRIMARY,
        secondaryColor: fromApi?.secondary_color ?? embedded?.secondary_color ?? DEFAULT_BRAND_SECONDARY,
        tagline: fromApi?.tagline ?? embedded?.tagline ?? null,
        about: fromApi?.about ?? embedded?.about ?? null,
        social: fromApi?.social ?? embedded?.social ?? {},
    };
}

export function darkenHex(hex: string, amount = 0.35): string {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
        ? normalized.split('').map((c) => c + c).join('')
        : normalized;
    const r = Math.round(parseInt(full.slice(0, 2), 16) * (1 - amount));
    const g = Math.round(parseInt(full.slice(2, 4), 16) * (1 - amount));
    const b = Math.round(parseInt(full.slice(4, 6), 16) * (1 - amount));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function applyBrandingCssVariables(branding: Pick<ResolvedTenantBranding, 'primaryColor' | 'secondaryColor'>): void {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.primaryColor);
    root.style.setProperty('--brand-secondary', branding.secondaryColor);
    root.style.setProperty('--brand-primary-dark', darkenHex(branding.primaryColor));
}

export function initTenantBrandingFromConfig(): void {
    const branding = appConfig.tenant?.branding;

    if (! branding?.primary_color || ! branding?.secondary_color) {
        return;
    }

    applyBrandingCssVariables({
        primaryColor: branding.primary_color,
        secondaryColor: branding.secondary_color,
    });
}

/** Apply branding from the public JSON payload (Flutter parity / runtime refresh). */
export function applyTenantBrandingPayload(payload: TenantBrandingPayload): void {
    applyBrandingCssVariables({
        primaryColor: payload.primary_color,
        secondaryColor: payload.secondary_color,
    });

    if (payload.primary_color_dark) {
        document.documentElement.style.setProperty('--brand-primary-dark', payload.primary_color_dark);
    }
}

export function brandingPayloadToResolved(payload: TenantBrandingPayload): ResolvedTenantBranding {
    return {
        logoUrl: payload.logo_url,
        primaryColor: payload.primary_color,
        secondaryColor: payload.secondary_color,
        tagline: payload.tagline,
        about: payload.about,
        social: payload.social ?? {},
    };
}

export function hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
        ? normalized.split('').map((c) => c + c).join('')
        : normalized;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
