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
        <div className={cn('flex flex-col items-center justify-center px-4 py-10 text-center', className)}>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-inst-border bg-inst-silver text-inst-teal">
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-inst-text">{title}</p>
            {description && (
                <p className="mt-1 max-w-sm text-xs font-medium text-inst-muted">
                    {description}
                </p>
            )}
            {actionLabel && actionTo && (
                <Button asChild size="sm" className="mt-4 rounded-lg bg-inst-primary font-bold text-white hover:bg-inst-teal">
                    <Link to={actionTo}>{actionLabel}</Link>
                </Button>
            )}
            {actionLabel && onAction && !actionTo && (
                <Button size="sm" className="mt-4 rounded-lg bg-inst-primary font-bold text-white hover:bg-inst-teal" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
