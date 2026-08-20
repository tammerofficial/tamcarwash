import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ReactNode } from 'react';
import { appConfig } from '@/lib/api';

interface TvLayoutProps {
    title: string;
    subtitle?: string;
    branchName?: string;
    children: ReactNode;
}

export function TvLayout({ title, subtitle, branchName, children }: TvLayoutProps) {
    const businessName = branchName ?? appConfig.tenant?.name ?? appConfig.appName;

    return (
        <div className="min-h-screen bg-sidebar p-6 text-sidebar-foreground lg:p-10" dir="rtl">
            <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-sidebar-border pb-6">
                <div>
                    <h1 className="text-4xl font-black lg:text-5xl">{title}</h1>
                    <p className="mt-2 text-xl text-sidebar-foreground/70">
                        {subtitle ?? businessName}
                    </p>
                </div>
                <div className="text-start">
                    <p className="text-lg text-sidebar-foreground/70">
                        {format(new Date(), 'EEEE dd MMMM yyyy', { locale: ar })}
                    </p>
                    <p className="text-4xl font-bold tabular-nums" dir="ltr">
                        {format(new Date(), 'HH:mm')}
                    </p>
                </div>
            </header>

            {children}
        </div>
    );
}
