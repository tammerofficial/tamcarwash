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
            { to: '/cashier', label: t('nav.cashier'), icon: Banknote, roles: ['owner', 'manager', 'cashier'], feature: 'cashier' },
            { to: '/worker', label: t('nav.worker'), icon: Wrench, roles: ['owner', 'manager', 'worker'], feature: 'worker' },
        ],
    },
    {
        sectionKey: 'operations',
        sectionLabel: t('nav.sections.operations'),
        items: [
            { to: '/queue', label: t('nav.queue'), icon: ListOrdered, roles: ['owner', 'manager', 'cashier', 'worker'], feature: 'queue' },
            { to: '/queue/screen', label: t('nav.queueScreen'), icon: Monitor, roles: ['owner', 'manager', 'cashier'], feature: 'queue_screen' },
            { to: '/orders', label: t('nav.orders'), icon: ClipboardList, roles: ['owner', 'manager', 'cashier', 'worker'], feature: 'orders' },
            { to: '/booking', label: t('nav.booking'), icon: CalendarDays, roles: ['owner', 'manager'], feature: 'bookings' },
        ],
    },
    {
        sectionKey: 'masterData',
        sectionLabel: t('nav.sections.masterData'),
        items: [
            { to: '/branches', label: t('nav.branches'), icon: Building2, roles: ['owner', 'manager'], feature: 'branches' },
            { to: '/customers', label: t('nav.customers'), icon: Users, roles: ['owner', 'manager', 'cashier'], feature: 'customers' },
            { to: '/vehicles', label: t('nav.vehicles'), icon: CarFront, roles: ['owner', 'manager', 'cashier'], feature: 'vehicles' },
            { to: '/services', label: t('nav.services'), icon: Droplets, roles: ['owner', 'manager'], feature: 'services' },
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
    className 
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
                'admin-sidebar flex flex-col transition-all duration-300 shadow-2xl border-s border-white/5 shrink-0 text-end',
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
                            'absolute end-2 top-2 z-20 shrink-0 text-white/60 hover:bg-white/10 hover:text-white transition-all',
                            collapsed ? 'h-7 w-7' : 'h-8 w-8',
                        )}
                        onClick={onToggleCollapse}
                        aria-label={t('admin.sidebarCollapse')}
                    >
                        {collapsed ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                )}

                {showMobileClose && onMobileClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute end-2 top-2 z-20 h-8 w-8 shrink-0 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
                        onClick={onMobileClose}
                        aria-label={t('public.closeMenu')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}

                <Link to="/dashboard" onClick={onNavigate} className={cn('flex flex-col items-center gap-2 text-center', !collapsed && 'pt-2')}>
                    <div className={cn(
                        "flex items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-white/15 transition-all duration-300",
                        collapsed ? "h-10 w-10" : "h-14 w-14"
                    )}>
                        <Car className={cn("text-primary transition-all", collapsed ? "h-6 w-6" : "h-8 w-8")} />
                    </div>
                    {!collapsed && (
                        <div className="space-y-1 animate-in fade-in duration-500">
                            <p className="admin-sidebar-brand-title">{getAppName()}</p>
                            <p className="admin-sidebar-brand-subtitle">{getAppTagline() ?? t('app.tagline')}</p>
                            <p className="admin-sidebar-brand-sultanate">{t('app.sultanate')}</p>
                        </div>
                    )}
                </Link>
            </div>

            <ScrollArea className="admin-sidebar-nav px-3 pb-6 pt-2">
                <nav className="space-y-6">
                    {visibleSections.map((section) => (
                        <div key={section.sectionKey} className="space-y-1">
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
                                            'admin-sidebar-nav-item group flex w-full flex-row items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200',
                                            isActive
                                                ? 'admin-sidebar-nav-item--active'
                                                : 'admin-sidebar-nav-item--inactive',
                                            collapsed ? 'justify-center px-2 py-2.5' : 'justify-end',
                                        )
                                    }
                                >
                                    {!collapsed && (
                                        <span className="min-w-0 flex-1 truncate text-right">{item.label}</span>
                                    )}
                                    <span className="flex w-5 shrink-0 items-center justify-center">
                                        <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0 stroke-[1.5]" />
                                    </span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
            </ScrollArea>
            
            {!collapsed && (
                <div className="p-4 border-t border-white/5 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <p className="admin-sidebar-footer-note">
                                {t('app.secureAccess')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
