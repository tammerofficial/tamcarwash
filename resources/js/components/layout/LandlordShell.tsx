import { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, CreditCard, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLandlordAuth } from '@/providers/LandlordAuthProvider';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/landlord/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { to: '/landlord/tenants', label: 'المستأجرون', icon: Users },
    { to: '/landlord/subscriptions', label: 'الاشتراكات', icon: CreditCard },
    { to: '/landlord/plans', label: 'الباقات', icon: Building2 },
    { to: '/landlord/settings', label: 'الإعدادات', icon: Settings },
];

export function LandlordShell({ children }: { children?: ReactNode }) {
    const { user, logout } = useLandlordAuth();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="border-b bg-background">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Tammer Wash Platform</p>
                        <h1 className="text-lg font-semibold">لوحة إدارة المنصة</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{user?.name}</span>
                        <Button variant="outline" size="sm" onClick={() => logout()}>
                            <LogOut className="ms-2 h-4 w-4" />
                            خروج
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-6">
                <aside className="rounded-lg border bg-background p-3">
                    <nav className="space-y-1">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={cn(
                                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                                    location.pathname.startsWith(to)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <main>{children ?? <Outlet />}</main>
            </div>
        </div>
    );
}
