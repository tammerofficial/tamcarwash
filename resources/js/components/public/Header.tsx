import { Link, NavLink } from 'react-router-dom';
import { CalendarDays, Droplets, LogIn, Menu, Phone, X, LayoutDashboard, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getTenantDisplayName, getTenantPhone } from '@/hooks/useStorefront';
import { getAppTagline } from '@/lib/branding';
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
    const tagline = profile?.branding?.tagline ?? getAppTagline();

    const primaryColor = 'var(--brand-primary)';
    const secondaryColor = 'var(--brand-secondary)';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
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
                'fixed top-0 z-50 w-full transition-all duration-500',
                isScrolled 
                    ? 'border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm py-3' 
                    : 'bg-white/90 backdrop-blur-sm py-6 shadow-sm'
            )}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <div
                            className={cn(
                                "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-lg",
                                !logoUrl && "text-white shadow-lg"
                            )}
                            style={{ backgroundColor: !logoUrl ? primaryColor : 'transparent' }}
                        >
                            {logoUrl ? (
                                <img src={logoUrl} alt={businessName} className="h-full w-full object-contain" />
                            ) : (
                                <Droplets className="h-6 w-6" />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className={cn(
                            "text-xl font-bold tracking-tight transition-colors duration-300",
                            "text-primary"
                        )}>
                            {businessName}
                        </span>
                        <span className={cn(
                            "text-[10px] font-medium uppercase tracking-[0.2em]",
                            "text-gray-600"
                        )}>
                            {tagline ?? 'Professional Car Care'}
                        </span>
                    </div>
                </Link>

                <nav className="hidden items-center gap-2 lg:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                'relative px-5 py-2 text-sm font-medium transition-all duration-300 hover:text-brand-secondary',
                                isActive 
                                    ? 'text-brand-primary'
                                    : 'text-gray-600',
                                isActive && "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-4 after:bg-brand-secondary after:rounded-full"
                            )}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center gap-6 lg:flex">
                    <a 
                        href={`tel:${contactPhone}`}
                        className={cn(
                            "flex items-center text-sm font-medium transition-colors duration-300",
                            "text-gray-600 hover:text-brand-secondary"
                        )}
                    >
                        <Phone className="me-2 h-4 w-4 opacity-50" />
                        {contactPhone}
                    </a>
                    
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                asChild
                                className={cn(
                                    "font-medium rounded-lg px-4",
                                    "text-gray-600 hover:text-brand-secondary hover:bg-brand-secondary-10"
                                )}
                            >
                                <Link to="/dashboard">
                                    لوحة التحكم
                                </Link>
                            </Button>
                        ) : (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                asChild
                                className={cn(
                                    "font-medium rounded-lg px-4",
                                    "text-gray-600 hover:text-brand-secondary hover:bg-brand-secondary-10"
                                )}
                            >
                                <Link to="/login">
                                    دخول
                                </Link>
                            </Button>
                        )}

                        <Button 
                            size="sm" 
                            asChild 
                            className="rounded-lg font-bold px-6 shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: secondaryColor }}
                        >
                            <Link to="/book">
                                احجز الآن
                            </Link>
                        </Button>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "lg:hidden rounded-xl",
                        "text-brand-secondary hover:bg-brand-secondary-10"
                    )}
                    onClick={() => setMobileOpen((open) => !open)}
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            <div
                className={cn(
                    'fixed inset-x-0 top-[72px] bottom-0 z-50 bg-white lg:hidden transition-all duration-300 ease-in-out',
                    mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
                )}
            >
                <nav className="flex flex-col gap-2 p-6 overflow-y-auto h-full">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center justify-between p-4 rounded-2xl text-lg font-black transition-all",
                                isActive 
                                    ? "bg-brand-secondary-10 text-brand-secondary" 
                                    : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {item.label}
                            <Monitor className="h-5 w-5 opacity-20" />
                        </NavLink>
                    ))}
                    
                    <div className="mt-8 grid grid-cols-2 gap-3">
                        {isAuthenticated ? (
                            <Button variant="outline" asChild className="rounded-2xl h-14 font-black border-2 border-brand-secondary-20 text-brand-secondary">
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                                    <LayoutDashboard className="me-2 h-5 w-5" />
                                    لوحة التحكم
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" asChild className="rounded-2xl h-14 font-black border-2 border-brand-secondary-20 text-brand-secondary">
                                <Link to="/login" onClick={() => setMobileOpen(false)}>
                                    <LogIn className="me-2 h-5 w-5" />
                                    دخول الموظفين
                                </Link>
                            </Button>
                        )}
                        <Button asChild className="rounded-2xl h-14 font-black shadow-xl" style={{ backgroundColor: secondaryColor }}>
                            <Link to="/book" onClick={() => setMobileOpen(false)}>
                                <CalendarDays className="me-2 h-5 w-5" />
                                احجز موعدك
                            </Link>
                        </Button>
                    </div>

                    <a 
                        href={`tel:${contactPhone}`}
                        className="mt-auto flex items-center justify-center gap-3 p-6 rounded-3xl bg-brand-secondary-10 text-brand-secondary font-black text-xl"
                    >
                        <Phone className="h-6 w-6" />
                        {contactPhone}
                    </a>
                </nav>
            </div>
        </header>
    );
}
