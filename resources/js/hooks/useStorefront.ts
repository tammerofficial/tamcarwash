import { useQuery } from '@tanstack/react-query';
import { api, appConfig, endpoints } from '@/lib/api';
import type {
    ApiResponse,
    StorefrontBranch,
    StorefrontProfile,
    StorefrontService,
} from '@/types/api';

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

export function getTenantBranding(profile?: StorefrontProfile | null) {
    const embedded = appConfig.tenant?.branding;
    const fromApi = profile?.branding;

    return {
        logoUrl: fromApi?.logo_url ?? embedded?.logo_url ?? null,
        primaryColor: fromApi?.primary_color ?? embedded?.primary_color ?? '#0ea5e9',
        tagline: fromApi?.tagline ?? embedded?.tagline ?? null,
        about: fromApi?.about ?? embedded?.about ?? null,
        social: fromApi?.social ?? embedded?.social ?? {},
    };
}

export function getTenantDisplayName(profile?: StorefrontProfile | null): string {
    return profile?.business_name ?? appConfig.tenant?.name ?? 'مغسلة سيارات';
}

export function formatPrice(amount: number, currency = 'OMR'): string {
    return `${amount.toFixed(3)} ${currency}`;
}

export const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
