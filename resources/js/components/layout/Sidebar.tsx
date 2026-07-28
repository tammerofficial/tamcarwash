import { NavLink } from 'react-router-dom';
import {
    Building2,
    Car,
    CarFront,
    ClipboardList,
    CreditCard,
    Droplets,
    LayoutDashboard,
    ListOrdered,
    Monitor,
    Receipt,
    Settings,
    Tags,
    Users,
    CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ScrollArea } from '@/components/ui/scroll-area';
import { appConfig } from '@/lib/api';

const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/branches', label: t('nav.branches'), icon: Building2 },
    { to: '/customers', label: t('nav.customers'), icon: Users },
    { to: '/vehicles', label: t('nav.vehicles'), icon: CarFront },
    { to: '/services', label: t('nav.services'), icon: Droplets },
    { to: '/pricing', label: t('nav.pricing'), icon: Tags },
    { to: '/booking', label: t('nav.booking'), icon: CalendarDays },
    { to: '/queue', label: t('nav.queue'), icon: ListOrdered },
    { to: '/queue/screen', label: t('nav.queueScreen'), icon: Monitor },
    { to: '/orders', label: t('nav.orders'), icon: ClipboardList },
    { to: '/invoices', label: t('nav.invoices'), icon: Receipt },
    { to: '/tax-reports', label: t('nav.taxReports'), icon: CreditCard },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
];

export function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-s bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
            <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Car className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-bold">{appConfig.appName}</p>
                    <p className="text-xs text-sidebar-foreground/70">{t('app.tagline')}</p>
                </div>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                )
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </ScrollArea>
        </aside>
    );
}
