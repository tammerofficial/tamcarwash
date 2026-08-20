import { useQuery } from '@tanstack/react-query';
import { api, appConfig, endpoints } from '@/lib/api';
import type {
    ApiResponse,
    StorefrontBranch,
    StorefrontProfile,
    StorefrontService,
    TenantBrandingPayload,
} from '@/types/api';

export const DEFAULT_CONTACT = {
    phone: appConfig.defaultContact?.phone ?? '+965 18XXXXXX',
    address: appConfig.defaultContact?.address ?? 'العاصمة ، الكويت',
};

export function getTenantPhone(profile?: StorefrontProfile | null): string {
    return profile?.phone ?? appConfig.tenant?.phone ?? DEFAULT_CONTACT.phone;
}

export function getBranchAddress(branch?: StorefrontBranch | null, profile?: StorefrontProfile | null): string {
    if (branch) {
        const parts = [branch.address, branch.city].filter(Boolean);
        if (parts.length > 0) {
            return parts.join('، ');
        }
    }

    return profile?.address ?? DEFAULT_CONTACT.address;
}

export function getBranchPhone(branch?: StorefrontBranch | null, profile?: StorefrontProfile | null): string {
    return branch?.phone ?? getTenantPhone(profile);
}

export function useStorefrontProfile() {
    return useQuery({
        queryKey: ['storefront', 'profile'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<StorefrontProfile>>(endpoints.storefront.profile);
            return response.data;
        },
        retry: false,
        staleTime: 60_000,
    });
}

export function useStorefrontBranding() {
    return useQuery({
        queryKey: ['storefront', 'branding'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TenantBrandingPayload>>(endpoints.storefront.branding);
            return response.data;
        },
        retry: false,
        staleTime: 300_000,
    });
}

export function useStorefrontServices(limit = 12) {
    return useQuery({
        queryKey: ['storefront', 'services', limit],
        queryFn: async () => {
            const response = await api.get<ApiResponse<StorefrontService[]>>(endpoints.storefront.services, {
                limit,
            });
            return response.data;
        },
        retry: false,
        staleTime: 60_000,
    });
}

export function useStorefrontBranches() {
    return useQuery({
        queryKey: ['storefront', 'branches'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<StorefrontBranch[]>>(endpoints.storefront.branches);
            return response.data;
        },
        retry: false,
        staleTime: 60_000,
    });
}

export { getTenantBranding, applyBrandingCssVariables, applyTenantBrandingPayload, brandingPayloadToResolved, DEFAULT_BRAND_PRIMARY, DEFAULT_BRAND_SECONDARY } from '@/lib/branding';
export type { ResolvedTenantBranding } from '@/lib/branding';

export function getTenantDisplayName(profile?: StorefrontProfile | null): string {
    return profile?.business_name ?? appConfig.tenant?.name ?? 'مغسلة سيارات';
}

export function formatPrice(amount: number, currency = 'OMR'): string {
    return `${amount.toFixed(3)} ${currency}`;
}

export const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
