import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    format?: 'number' | 'currency';
    loading?: boolean;
    className?: string;
}

export function StatsCard({ title, value, icon: Icon, format = 'number', loading, className }: StatsCardProps) {
    return (
        <Card className={cn('', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className="text-2xl font-bold">
                        {format === 'currency' ? formatCurrency(value) : formatNumber(value)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
