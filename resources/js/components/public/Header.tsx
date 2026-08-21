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
                'sf-header relative fixed top-0 z-50 w-full transition-[padding] duration-300',
                isScrolled ? 'py-2.5' : 'py-3.5',
            )}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
                <Link to="/" className="flex items-center gap-3 group">
                    <div
                        className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-lg shrink-0',
                            !logoUrl && 'text-white',
                        )}
                        style={{ backgroundColor: logoUrl ? 'transparent' : 'var(--brand-primary)' }}
                    >
                        {logoUrl ? (
                            <img src={logoUrl} alt={businessName} className="h-full w-full object-contain" />
                        ) : (
                            <Droplets className="h-5 w-5" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-lg font-bold tracking-tight text-[var(--inst-text)] truncate">
                            {businessName}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--inst-muted)] truncate">
                            {tagline}
                        </span>
                    </div>
                </Link>

                <nav className="hidden items-center gap-0.5 lg:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    'relative px-3.5 py-2 text-[13px] font-semibold transition-colors',
                                    isActive
                                        ? 'text-[var(--brand-primary)]'
                                        : 'text-[var(--inst-text)]/75 hover:text-[var(--brand-primary)]',
                                    isActive &&
                                        'after:absolute after:bottom-0 after:inset-x-3 after:h-0.5 after:bg-[var(--brand-secondary)] after:rounded-full',
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
                        className="flex items-center text-[13px] font-semibold text-[var(--inst-text)]/80 hover:text-[var(--brand-primary)]"
                    >
                        <Phone className="me-1.5 h-4 w-4 text-[var(--brand-primary)]" />
                        {contactPhone}
                    </a>

                    {isAuthenticated ? (
                        <Button variant="ghost" size="sm" asChild className="font-semibold text-[var(--inst-text)]">
                            <Link to="/dashboard">لوحة التحكم</Link>
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" asChild className="font-semibold text-[var(--inst-text)]">
                            <Link to="/login">دخول</Link>
                        </Button>
                    )}

                    <Button size="sm" asChild className="sf-cta-accent rounded-lg font-bold px-5 h-10 shadow-none">
                        <Link to="/book">احجز الآن</Link>
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-lg text-[var(--inst-text)]"
                    onClick={() => setMobileOpen((open) => !open)}
                    aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            <div
                className={cn(
                    'fixed inset-x-0 top-[68px] bottom-0 z-50 bg-white lg:hidden transition-all duration-300 ease-in-out border-t border-[var(--inst-border)]',
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
                                    'flex items-center p-4 rounded-xl text-base font-bold',
                                    isActive
                                        ? 'bg-brand-secondary-10 text-brand-primary'
                                        : 'text-[var(--inst-text)] hover:bg-[var(--inst-silver)]',
                                )
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {isAuthenticated ? (
                            <Button variant="outline" asChild className="rounded-xl h-12 font-bold border-[var(--inst-border)]">
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                                    <LayoutDashboard className="me-2 h-4 w-4" />
                                    لوحة التحكم
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" asChild className="rounded-xl h-12 font-bold border-[var(--inst-border)]">
                                <Link to="/login" onClick={() => setMobileOpen(false)}>
                                    <LogIn className="me-2 h-4 w-4" />
                                    دخول
                                </Link>
                            </Button>
                        )}
                        <Button asChild className="sf-cta-accent rounded-xl h-12 font-bold shadow-none">
                            <Link to="/book" onClick={() => setMobileOpen(false)}>
                                <CalendarDays className="me-2 h-4 w-4" />
                                احجز موعدك
                            </Link>
                        </Button>
                    </div>

                    <a
                        href={`tel:${contactPhone}`}
                        className="mt-auto flex items-center justify-center gap-3 p-5 rounded-xl bg-[var(--inst-silver)] text-[var(--inst-text)] font-bold"
                    >
                        <Phone className="h-5 w-5 text-[var(--brand-primary)]" />
                        {contactPhone}
                    </a>
                </nav>
            </div>
        </header>
    );
}
