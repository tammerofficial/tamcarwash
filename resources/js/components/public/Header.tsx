import { Link, NavLink } from 'react-router-dom';
import { CalendarDays, Droplets, LogIn, Menu, Phone, X, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getTenantDisplayName, getTenantPhone } from '@/hooks/useStorefront';
import type { StorefrontProfile } from '@/types/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

interface PublicHeaderProps {
    profile?: StorefrontProfile | null;
}

export function PublicHeader({ profile }: PublicHeaderProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { isAuthenticated } = useAuth();

    const businessName = getTenantDisplayName(profile);
    const contactPhone = getTenantPhone(profile);
    const logoUrl = profile?.branding?.logo_url;
    const tagline = profile?.branding?.tagline ?? 'عناية سيارات احترافية';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 12);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { to: '/', label: 'الرئيسية' },
        { to: '/services', label: 'الخدمات' },
        { to: '/pricing', label: 'الأسعار' },
        { to: '/branches', label: 'الفروع' },
        { to: '/queue', label: 'حالة الطابور' },
        { to: '/track', label: 'تتبع طلبي' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 z-50 w-full transition-all duration-300 border-b',
                isScrolled ? 'py-3 bg-white/90 backdrop-blur-md border-slate-200 shadow-sm' : 'py-4 bg-white border-transparent',
            )}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
                <Link to="/" className="flex items-center gap-3 group">
                    <div
                        className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
                            !logoUrl && 'bg-slate-900 text-white',
                        )}
                    >
                        {logoUrl ? (
                            <img src={logoUrl} alt={businessName} className="h-full w-full object-contain" />
                        ) : (
                            <Droplets className="h-5 w-5" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-lg font-bold tracking-tight text-slate-900 truncate">
                            {businessName}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 truncate">
                            {tagline}
                        </span>
                    </div>
                </Link>

                <nav className="hidden items-center gap-1 lg:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    'px-4 py-2 text-[13px] font-semibold transition-colors rounded-full',
                                    isActive
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                                )
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center gap-4 lg:flex">
                    <a
                        href={`tel:${contactPhone}`}
                        className="flex items-center text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <Phone className="me-1.5 h-4 w-4" />
                        {contactPhone}
                    </a>

                    {isAuthenticated ? (
                        <Button variant="ghost" size="sm" asChild className="font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                            <Link to="/dashboard">لوحة التحكم</Link>
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" asChild className="font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                            <Link to="/login">دخول</Link>
                        </Button>
                    )}

                    <Button size="sm" asChild className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 h-10 font-semibold shadow-sm transition-all">
                        <Link to="/book">احجز الآن</Link>
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-lg text-slate-900 hover:bg-slate-100"
                    onClick={() => setMobileOpen((open) => !open)}
                    aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            <div
                className={cn(
                    'fixed inset-x-0 top-[72px] bottom-0 z-50 bg-white lg:hidden transition-all duration-300 ease-in-out border-t border-slate-100',
                    mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none',
                )}
            >
                <nav className="flex flex-col gap-1 p-5 overflow-y-auto h-full">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center p-4 rounded-xl text-base font-bold transition-colors',
                                    isActive
                                        ? 'bg-slate-50 text-slate-900'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                                )
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {isAuthenticated ? (
                            <Button variant="outline" asChild className="rounded-xl h-12 font-bold border-slate-200 text-slate-900">
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                                    <LayoutDashboard className="me-2 h-4 w-4" />
                                    لوحة التحكم
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" asChild className="rounded-xl h-12 font-bold border-slate-200 text-slate-900">
                                <Link to="/login" onClick={() => setMobileOpen(false)}>
                                    <LogIn className="me-2 h-4 w-4" />
                                    دخول
                                </Link>
                            </Button>
                        )}
                        <Button asChild className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-12 font-bold shadow-sm">
                            <Link to="/book" onClick={() => setMobileOpen(false)}>
                                <CalendarDays className="me-2 h-4 w-4" />
                                احجز موعدك
                            </Link>
                        </Button>
                    </div>

                    <a
                        href={`tel:${contactPhone}`}
                        className="mt-auto flex items-center justify-center gap-3 p-5 rounded-xl bg-slate-50 text-slate-900 font-bold hover:bg-slate-100 transition-colors"
                    >
                        <Phone className="h-5 w-5" />
                        {contactPhone}
                    </a>
                </nav>
            </div>
        </header>
    );
}
