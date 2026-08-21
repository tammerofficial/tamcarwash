import { Building2 } from 'lucide-react';
import { useBranch } from '@/providers/BranchProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';

export function BranchSelector() {
    const { branches, selectedBranchId, setSelectedBranchId, isLoading } = useBranch();

    if (isLoading) {
        return <Skeleton className="h-10 w-48 rounded-lg" />;
    }

    return (
        <Select
            value={selectedBranchId ? String(selectedBranchId) : undefined}
            onValueChange={(value) => setSelectedBranchId(Number(value))}
        >
            <SelectTrigger className="h-10 w-56 rounded-lg border-inst-border bg-white font-bold text-inst-text hover:bg-inst-silver">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-inst-primary" />
                    <SelectValue placeholder={t('common.branch')} />
                </div>
            </SelectTrigger>
            <SelectContent className="border-inst-border">
                {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
