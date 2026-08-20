import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStorefrontBranches } from '@/hooks/useStorefront';

export function useTvBranchId(): number | undefined {
    const [searchParams] = useSearchParams();
    const branchParam = searchParams.get('branch_id');
    const { data: branches } = useStorefrontBranches();

    return useMemo(() => {
        if (branchParam) {
            const parsed = Number(branchParam);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
        }

        return branches?.[0]?.id;
    }, [branchParam, branches]);
}

export function useTvBranchName(branchId?: number): string | undefined {
    const { data: branches } = useStorefrontBranches();

    return useMemo(() => {
        if (!branchId) {
            return branches?.[0]?.name;
        }

        return branches?.find((branch) => branch.id === branchId)?.name ?? branches?.[0]?.name;
    }, [branchId, branches]);
}
