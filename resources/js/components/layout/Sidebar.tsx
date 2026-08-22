import { NavLink, Link } from 'react-router-dom';
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
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    X,
    Banknote,
    Wrench,
    Palette,
    BarChart3,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAppName, getAppTagline } from '@/lib/branding';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import type { PlanFeatureKey } from '@/lib/plan-features';

type NavItem = {
    to: string;
    label: string;
    icon: LucideIcon;
    end?: boolean;
    roles?: string[];
    feature?: PlanFeatureKey;
};

type NavSection = {
    sectionKey: string;
    sectionLabel: string;
    items: NavItem[];
};

const navSections: NavSection[] = [
    {
        sectionKey: 'main',
        sectionLabel: t('nav.sections.main'),
        items: [
            { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, end: true, roles: ['owner', 'manager', 'cashier', 'worker'], feature: 'dashboard' },
        ],
    },
    {
        sectionKey: 'operations',
        sectionLabel: t('nav.sections.operations'),
        items: [
            { to: '/cashier', label: t('nav.cashier'), icon: Banknote, roles: ['owner', 'manager', 'cashier'], feature: 'cashier' },
            { to: '/queue', label: t('nav.queue'), icon: ListOrdered, roles: ['owner', 'manager', 'cashier', 'worker'], feature: 'queue' },
            { to: '/orders', label: t('nav.orders'), icon: ClipboardList, roles: ['owner', 'manager', 'cashier', 'worker'], feature: 'orders' },
            { to: '/queue/screen', label: t('nav.queueScreen'), icon: Monitor, roles: ['owner', 'manager', 'cashier'], feature: 'queue_screen' },
            { to: '/booking', label: t('nav.booking'), icon: CalendarDays, roles: ['owner', 'manager'], feature: 'bookings' },
            { to: '/worker', label: t('nav.worker'), icon: Wrench, roles: ['owner', 'manager', 'worker'], feature: 'worker' },
        ],
    },
    {
        sectionKey: 'masterData',
        sectionLabel: t('nav.sections.masterData'),
        items: [
            { to: '/customers', label: t('nav.customers'), icon: Users, roles: ['owner', 'manager', 'cashier'], feature: 'customers' },
            { to: '/services', label: t('nav.services'), icon: Droplets, roles: ['owner', 'manager'], feature: 'services' },
            { to: '/vehicles', label: t('nav.vehicles'), icon: CarFront, roles: ['owner', 'manager', 'cashier'], feature: 'vehicles' },
            { to: '/branches', label: t('nav.branches'), icon: Building2, roles: ['owner', 'manager'], feature: 'branches' },
            { to: '/pricing', label: t('nav.pricing'), icon: Tags, roles: ['owner', 'manager'], feature: 'pricing' },
        ],
    },
    {
        sectionKey: 'finance',
        sectionLabel: t('nav.sections.finance'),
        items: [
            { to: '/invoices', label: t('nav.invoices'), icon: Receipt, roles: ['owner', 'manager', 'cashier'], feature: 'invoices' },
            { to: '/tax-reports', label: t('nav.taxReports'), icon: CreditCard, roles: ['owner', 'manager'], feature: 'tax_reports' },
        ],
    },
    {
        sectionKey: 'system',
        sectionLabel: t('nav.sections.system'),
        items: [
            { to: '/appearance', label: t('nav.appearance'), icon: Palette, roles: ['owner', 'manager'], feature: 'appearance' },
            { to: '/settings', label: t('nav.settings'), icon: Settings, roles: ['owner', 'manager'], feature: 'settings' },
        ],
    },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    showMobileClose?: boolean;
    onMobileClose?: () => void;
    onNavigate?: () => void;
    className?: string;
}

export function Sidebar({
    collapsed = false,
    onToggleCollapse,
    showMobileClose = false,
    onMobileClose,
    onNavigate,
    className,
}: SidebarProps) {
    const { user } = useAuth();
    const { hasFeature } = usePlanFeatures();
    const userRoles = user?.roles ?? [];
    const visibleSections = navSections
        .map((section) => ({
            ...section,
            items: section.items.filter(
                (item) =>
                    (!item.roles || item.roles.some((role) => userRoles.includes(role))) &&
                    (!item.feature || hasFeature(item.feature)),
            ),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <aside
            dir="rtl"
            className={cn(
                'admin-sidebar flex flex-col shrink-0 text-end',
                collapsed ? 'admin-sidebar--collapsed w-[4.75rem]' : 'w-72',
                className,
            )}
        >
            <div className={cn('admin-sidebar-brand', collapsed && 'admin-sidebar-brand--compact')}>
                {onToggleCollapse && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'absolute end-2 top-2 z-20 shrink-0 text-white/70 hover:bg-white/10 hover:text-white min-h-11 min-w-11 sm:min-h-10 sm:min-w-10',
                            collapsed ? 'h-9 w-9 sm:h-8 sm:w-8' : 'h-10 w-10 sm:h-9 sm:w-9',
                        )}
                        onClick={onToggleCollapse}
                        aria-label={t('admin.sidebarCollapse')}
                    >
                        {collapsed ? (
                            <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
                        ) : (
                            <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
                        )}
                    </Button>
                )}

                {showMobileClose && onMobileClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute end-2 top-2 z-20 h-10 w-10 sm:h-9 sm:w-9 shrink-0 text-white/70 hover:bg-white/10 hover:text-white lg:hidden min-h-12 min-w-12 sm:min-h-11 sm:min-w-11"
                        onClick={onMobileClose}
                        aria-label={t('public.closeMenu')}
                    >
                        <X className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                )}

                <Link to="/dashboard" onClick={onNavigate} className={cn('flex flex-col items-center gap-2.5 text-center', !collapsed && 'pt-1')}>
                    <div
                        className={cn(
                            'flex items-center justify-center rounded-lg border border-white/15 bg-white shadow-sm',
                            collapsed ? 'h-10 w-10' : 'h-12 w-12',
                        )}
                    >
                        <Car className={cn('text-inst-teal', collapsed ? 'h-5 w-5' : 'h-6 w-6')} />
                    </div>
                    {!collapsed && (
                        <div className="space-y-0.5">
                            <p className="admin-sidebar-brand-title">{getAppName()}</p>
                            <p className="admin-sidebar-brand-subtitle">{t('app.operationsConsole')}</p>
                            <p className="admin-sidebar-brand-sultanate">{getAppTagline() ?? t('app.sultanate')}</p>
                        </div>
                    )}
                </Link>
            </div>

            <ScrollArea className="admin-sidebar-nav px-2.5 pb-5 pt-3">
                <nav className="space-y-5">
                    {visibleSections.map((section) => (
                        <div key={section.sectionKey} className="space-y-0.5">
                            {!collapsed && (
                                <p className="admin-sidebar-section-label">
                                    {section.sectionLabel}
                                </p>
                            )}
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    title={collapsed ? item.label : undefined}
                                    onClick={onNavigate}
                                    dir={collapsed ? undefined : 'ltr'}
                                    className={({ isActive }) =>
                                        cn(
                                            'admin-sidebar-nav-item group flex w-full flex-row items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150',
                                            isActive
                                                ? 'admin-sidebar-nav-item--active'
                                                : 'admin-sidebar-nav-item--inactive',
                                            collapsed ? 'justify-center px-2 py-2' : 'justify-end',
                                        )
                                    }
                                >
                                    {!collapsed && (
                                        <span className="min-w-0 flex-1 truncate text-right">{item.label}</span>
                                    )}
                                    <span className="flex w-5 shrink-0 items-center justify-center">
                                        <item.icon className="h-[1.05rem] w-[1.05rem] shrink-0 stroke-[1.75]" />
                                    </span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {!collapsed && (
                <div className="border-t border-white/10 p-3">
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <p className="admin-sidebar-footer-note">{t('app.secureAccess')}</p>
                    </div>
                </div>
            )}
        </aside>
    );
}
