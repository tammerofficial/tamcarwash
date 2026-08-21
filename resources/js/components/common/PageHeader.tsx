import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    kicker?: string;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({ title, description, kicker, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('admin-page-header flex flex-col gap-3 text-start sm:flex-row sm:items-end sm:justify-between', className)}>
            <div>
                {kicker && <p className="admin-page-kicker">{kicker}</p>}
                <h1 className="text-[1.55rem] font-bold tracking-tight text-inst-text">{title}</h1>
                {description && <p className="mt-1 text-sm font-medium text-inst-muted">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
