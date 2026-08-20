import { Building2 } from 'lucide-react';
import { useBranch } from '@/providers/BranchProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';

export function BranchSelector() {
    const { branches, selectedBranchId, setSelectedBranchId, isLoading } = useBranch();

    if (isLoading) {
        return <Skeleton className="h-10 w-48" />;
    }

    return (
        <Select
            value={selectedBranchId ? String(selectedBranchId) : undefined}
            onValueChange={(value) => setSelectedBranchId(Number(value))}
        >
            <SelectTrigger className="w-56 h-11 rounded-xl border-border/60 bg-white font-bold transition-all hover:bg-muted/30">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <SelectValue placeholder={t('common.branch')} />
                </div>
            </SelectTrigger>
            <SelectContent>
                {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
