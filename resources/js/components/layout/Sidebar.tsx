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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ScrollArea } from '@/components/ui/scroll-area';
import { appConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';

const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
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
    const isRtl = document.documentElement.dir === 'rtl';

    return (
        <aside
            className={cn(
                'admin-sidebar flex flex-col transition-all duration-300 shadow-2xl border-s border-white/5',
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
                        aria-label={t('admin.sidebarCollapse') || 'طي القائمة'}
                    >
                        {collapsed ? (
                            isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        ) : (
                            isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                )}

                {showMobileClose && onMobileClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute end-2 top-2 z-20 h-8 w-8 shrink-0 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
                        onClick={onMobileClose}
                        aria-label={t('public.closeMenu') || 'إغلاق القائمة'}
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
                            <p className="admin-sidebar-brand-title text-xl font-black">{appConfig.appName}</p>
                            <p className="admin-sidebar-brand-subtitle">{t('app.tagline')}</p>
                            <p className="admin-sidebar-brand-sultanate">Sultanate of Oman</p>
                        </div>
                    )}
                </Link>
            </div>

            <ScrollArea className="admin-sidebar-nav px-3 pb-6 pt-2">
                <nav className="space-y-6">
                    <div className="space-y-1">
                        {!collapsed && (
                            <p className="admin-sidebar-section-label">
                                {t('nav.main') || 'القائمة الرئيسية'}
                            </p>
                        )}
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                title={collapsed ? item.label : undefined}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    cn(
                                        'group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition-all duration-200',
                                        isActive
                                            ? 'admin-sidebar-nav-item--active'
                                            : 'admin-sidebar-nav-item--inactive',
                                        collapsed && 'justify-center px-2',
                                    )
                                }
                            >
                                <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0 stroke-[1.5]" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </ScrollArea>
            
            {!collapsed && (
                <div className="p-4 border-t border-white/5 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <p className="text-[10px] text-white/50 font-bold leading-relaxed">
                                {t('app.secureAccess') || 'وصول آمن ومشفر'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
