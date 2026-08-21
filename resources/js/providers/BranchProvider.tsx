import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { resolveActiveTenantSlug } from '@/lib/tenancy';
import { useAuth } from '@/providers/AuthProvider';
import type { Branch, PaginatedResponse } from '@/types/api';

interface BranchContextValue {
    branches: Branch[];
    selectedBranchId: number | null;
    setSelectedBranchId: (id: number | null) => void;
    isLoading: boolean;
}

const BranchContext = createContext<BranchContextValue | undefined>(undefined);
const STORAGE_KEY = 'tammer_selected_branch';

function branchStorageKey(tenantSlug: string | null): string {
    return tenantSlug ? `${STORAGE_KEY}:${tenantSlug}` : STORAGE_KEY;
}

function readStoredBranchId(tenantSlug: string | null): number | null {
    const scopedKey = branchStorageKey(tenantSlug);
    const scoped = localStorage.getItem(scopedKey);
    if (scoped) {
        return Number(scoped);
    }

    // Migrate legacy global key once per tenant.
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy && tenantSlug) {
        localStorage.setItem(scopedKey, legacy);
        localStorage.removeItem(STORAGE_KEY);
        return Number(legacy);
    }

    return legacy ? Number(legacy) : null;
}

export function BranchProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLandlord, isLoading: authLoading } = useAuth();
    const tenantSlug = resolveActiveTenantSlug();
    const [selectedBranchId, setSelectedBranchIdState] = useState<number | null>(() =>
        readStoredBranchId(tenantSlug),
    );

    const { data, isLoading } = useQuery({
        queryKey: ['branches', tenantSlug],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Branch>>(endpoints.branches, { per_page: 50 });
            return response.data;
        },
        enabled: isAuthenticated && !isLandlord && !authLoading && Boolean(tenantSlug),
        retry: false,
    });

    const branches = data ?? [];
    const storageKey = branchStorageKey(tenantSlug);

    useEffect(() => {
        setSelectedBranchIdState(readStoredBranchId(tenantSlug));
    }, [tenantSlug]);

    useEffect(() => {
        if (branches.length === 0) {
            return;
        }

        const validIds = new Set(branches.map((branch) => branch.id));
        const storedId = readStoredBranchId(tenantSlug);
        const resolvedId =
            storedId && validIds.has(storedId) ? storedId : branches[0].id;

        if (selectedBranchId !== resolvedId) {
            setSelectedBranchIdState(resolvedId);
        }

        localStorage.setItem(storageKey, String(resolvedId));
    }, [branches, tenantSlug, storageKey, selectedBranchId]);

    const setSelectedBranchId = (id: number | null) => {
        setSelectedBranchIdState(id);
        if (id) {
            localStorage.setItem(storageKey, String(id));
        } else {
            localStorage.removeItem(storageKey);
        }
    };

    const value = useMemo(
        () => ({ branches, selectedBranchId, setSelectedBranchId, isLoading }),
        [branches, selectedBranchId, isLoading],
    );

    return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch() {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error('useBranch must be used within BranchProvider');
    }
    return context;
}

export function useBranchQueryParams() {
    const { selectedBranchId } = useBranch();
    return selectedBranchId ? { branch_id: selectedBranchId } : {};
}
