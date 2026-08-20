import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    actionTo?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionTo,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/30 text-muted-foreground/40">
                <Icon className="h-10 w-10" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">{title}</p>
            {description && (
                <p className="mt-1 max-w-sm text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {description}
                </p>
            )}
            {actionLabel && actionTo && (
                <Button asChild size="sm" className="mt-6 rounded-xl font-bold">
                    <Link to={actionTo}>{actionLabel}</Link>
                </Button>
            )}
            {actionLabel && onAction && !actionTo && (
                <Button size="sm" className="mt-6 rounded-xl font-bold" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
