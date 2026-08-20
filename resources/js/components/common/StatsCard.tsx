import { Activity, ArrowUpRight, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
}

export function StatsCard({ title, value, icon: Icon, format = 'number', loading, className, trend }: StatsCardProps) {
    return (
        <Card className={cn('rounded-[2.5rem] border border-border/50 shadow-sm bg-white p-8 flex flex-col justify-center relative group hover:shadow-lg transition-all', className)}>
            <div className="absolute top-8 end-8 h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Icon className="h-5 w-5" />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ps-1">
                {title}
            </p>
            
            {loading ? (
                <Skeleton className="h-10 w-24" />
            ) : (
                <>
                    <p className="text-4xl font-black text-foreground mb-1 ps-1">
                        {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-primary ps-1 mt-1">
                        <Activity className="h-3.5 w-3.5" />
                        <span>{trend || 'نشاط مستقر'}</span>
                    </div>
                </>
            )}
            
            <ArrowUpRight className="absolute bottom-8 end-8 h-5 w-5 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </Card>
    );
}
