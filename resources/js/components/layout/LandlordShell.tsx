import { ReactNode, useState, useCallback, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
    Building2, 
    CreditCard, 
    LayoutDashboard, 
    LogOut, 
    Settings, 
    Users, 
    Menu, 
    ChevronLeft, 
    ChevronRight,
    Car,
    ShieldCheck,
    Home,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandlordAuth } from '@/providers/LandlordAuthProvider';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
    { to: '/landlord/dashboard', label: t('landlord.nav.dashboard'), icon: LayoutDashboard },
    { to: '/landlord/tenants', label: t('landlord.nav.tenants'), icon: Users },
    { to: '/landlord/subscriptions', label: t('landlord.nav.subscriptions'), icon: CreditCard },
    { to: '/landlord/plans', label: t('landlord.nav.plans'), icon: Building2 },
    { to: '/landlord/settings', label: t('landlord.nav.settings'), icon: Settings },
];

export function LandlordShell({ children }: { children?: ReactNode }) {
    const { user, logout } = useLandlordAuth();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const closeMobileNav = useCallback(() => {
        setMobileNavOpen(false);
    }, []);

    useEffect(() => {
        closeMobileNav();
    }, [location.pathname, closeMobileNav]);

    return (
        <div className="flex min-h-screen bg-muted/30 overflow-hidden" dir="rtl">
            {/* Sidebar Overlay for Mobile */}
            {mobileNavOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-300" 
                    onClick={closeMobileNav}
                />
            )}

            {/* Sidebar — flows on desktop, drawer on mobile */}
            <aside
                dir="rtl"
                className={cn(
                    'admin-sidebar fixed inset-y-0 right-0 z-50 flex flex-col transition-all duration-300 shadow-2xl border-s border-white/5 shrink-0 lg:relative',
                    collapsed ? 'admin-sidebar--collapsed w-[4.75rem]' : 'w-72',
                    mobileNavOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
                )}
            >
                <div className={cn('admin-sidebar-brand', collapsed && 'admin-sidebar-brand--compact')}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'absolute end-2 top-2 z-20 shrink-0 text-white/60 hover:bg-white/10 hover:text-white transition-all',
                            collapsed ? 'h-7 w-7' : 'h-8 w-8',
                        )}
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>

                    <Link to="/landlord/dashboard" className={cn('flex flex-col items-center gap-2 text-center', !collapsed && 'pt-2')}>
                        <div className={cn(
                            "flex items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-white/15 transition-all duration-300",
                            collapsed ? "h-10 w-10" : "h-14 w-14"
                        )}>
                            <Car className={cn("text-primary transition-all", collapsed ? "h-6 w-6" : "h-8 w-8")} />
                        </div>
                        {!collapsed && (
                            <div className="space-y-1 animate-in fade-in duration-500 text-center">
                                <p className="admin-sidebar-brand-title">Tammer Wash</p>
                                <p className="admin-sidebar-brand-subtitle">{t('auth.landlordPortal')}</p>
                                <p className="admin-sidebar-brand-sultanate">{t('app.sultanate')}</p>
                            </div>
                        )}
                    </Link>
                </div>

                <ScrollArea className="admin-sidebar-nav px-3 pb-6 pt-2">
                    <nav className="space-y-1">
                        {!collapsed && (
                            <p className="admin-sidebar-section-label">
                                {t('nav.main')}
                            </p>
                        )}
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.to);
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    title={collapsed ? item.label : undefined}
                                    dir={collapsed ? undefined : 'ltr'}
                                    className={cn(
                                        'admin-sidebar-nav-item group flex w-full flex-row items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200',
                                        isActive
                                            ? 'admin-sidebar-nav-item--active'
                                            : 'admin-sidebar-nav-item--inactive',
                                        collapsed ? 'justify-center px-2 py-2.5' : 'justify-end',
                                    )}
                                >
                                    {!collapsed && (
                                        <span className="min-w-0 flex-1 truncate text-right">{item.label}</span>
                                    )}
                                    <span className="flex w-5 shrink-0 items-center justify-center">
                                        <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0 stroke-[1.5]" />
                                    </span>
                                </Link>
                            );
                        })}
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

            {/* Main Content Area */}
            <div className="flex min-h-screen flex-1 flex-col min-w-0 overflow-hidden">
                <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border/40 bg-white/80 backdrop-blur-md px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 shrink-0 rounded-xl text-foreground hover:bg-muted lg:hidden" 
                            onClick={() => setMobileNavOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5 opacity-70">
                                {t('auth.landlordPortal') || 'بوابة الإدارة المركزية'}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-black text-foreground leading-none">
                                    Tammer Wash Admin
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all hidden sm:flex"
                                title={t('common.backHome') || 'الرئيسية'}
                            >
                                <Link to="/">
                                    <Home className="h-5 w-5" />
                                </Link>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-12 gap-3 px-2 hover:bg-muted/50 rounded-2xl transition-all group">
                                        <div className="text-end hidden sm:block">
                                            <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors leading-none">{user?.name ?? 'المدير'}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1">Platform Admin</p>
                                        </div>
                                        <Avatar className="h-9 w-9 border-2 border-primary/10 shadow-sm group-hover:border-primary/30 transition-all">
                                            <AvatarFallback className="bg-primary/5 text-primary font-bold uppercase">
                                                {user?.name?.charAt(0) ?? 'أ'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl shadow-2xl border-border/40 animate-in fade-in zoom-in-95 duration-200">
                                    <DropdownMenuLabel className="p-4">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-black text-foreground">{user?.name ?? 'المدير'}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground truncate">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="my-2 opacity-50" />
                                    <DropdownMenuItem className="h-11 rounded-xl font-bold cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors" disabled>
                                        <User className="me-3 h-4 w-4 text-muted-foreground" />
                                        {t('auth.profile') || 'الملف الشخصي'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-2 opacity-50" />
                                    <DropdownMenuItem 
                                        className="h-11 rounded-xl font-bold text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer transition-colors" 
                                        onClick={() => logout()}
                                    >
                                        <LogOut className="me-3 h-4 w-4" />
                                        {t('nav.logout') || 'خروج'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children ?? <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
}
