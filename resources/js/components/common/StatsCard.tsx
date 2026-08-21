import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    format?: 'number' | 'currency';
    loading?: boolean;
    className?: string;
    trend?: string;
    hint?: string;
}

export function StatsCard({ title, value, icon: Icon, format = 'number', loading, className, trend, hint }: StatsCardProps) {
    return (
        <div className={cn('admin-stat-card flex min-h-[7.5rem] flex-col justify-between rounded-xl p-5', className)}>
            <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-bold tracking-wide text-inst-muted">{title}</p>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal">
                    <Icon className="h-4 w-4" />
                </div>
            </div>

            {loading ? (
                <Skeleton className="mt-3 h-9 w-24" />
            ) : (
                <div>
                    <p className="text-[1.85rem] font-bold leading-none tracking-tight text-inst-text">
                        {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
                    </p>
                    {(trend || hint) && (
                        <p className="mt-2 text-[11px] font-semibold text-inst-muted">{trend ?? hint}</p>
                    )}
                </div>
            )}
        </div>
    );
}
