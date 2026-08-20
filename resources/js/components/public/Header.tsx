import { Link, NavLink } from 'react-router-dom';
import { CalendarDays, Droplets, LogIn, Menu, Phone, X, LayoutDashboard, Monitor } from 'lucide-react';
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

    const primaryColor = '#006666'; 

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
                    : 'bg-transparent py-6'
            )}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <div
                            className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-300 group-hover:shadow-teal-900/20"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <Droplets className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className={cn(
                            "text-xl font-bold tracking-tight transition-colors duration-300",
                            isScrolled ? "text-[#004d4d]" : "text-white"
                        )}>
                            {businessName}
                        </span>
                        <span className={cn(
                            "text-[10px] font-medium uppercase tracking-[0.2em]",
                            isScrolled ? "text-teal-600/60" : "text-teal-100/60"
                        )}>
                            Professional Car Care
                        </span>
                    </div>
                </Link>

                <nav className="hidden items-center gap-2 lg:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                'relative px-5 py-2 text-sm font-medium transition-all duration-300 hover:text-teal-600',
                                isActive 
                                    ? (isScrolled ? 'text-teal-700' : 'text-teal-400')
                                    : (isScrolled ? 'text-gray-600' : 'text-white/80'),
                                isActive && "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-4 after:bg-teal-500 after:rounded-full"
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
                            isScrolled ? "text-gray-600 hover:text-teal-600" : "text-white/80 hover:text-white"
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
                                    isScrolled 
                                        ? "text-gray-600 hover:text-teal-700 hover:bg-teal-50" 
                                        : "text-white hover:bg-white/10"
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
                                    isScrolled 
                                        ? "text-gray-600 hover:text-teal-700 hover:bg-teal-50" 
                                        : "text-white hover:bg-white/10"
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
                            className="rounded-lg font-bold px-6 shadow-md shadow-teal-900/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: primaryColor }}
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
                        isScrolled ? "text-teal-700 hover:bg-teal-50" : "text-white hover:bg-white/10"
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
                                    ? "bg-teal-50 text-teal-700" 
                                    : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {item.label}
                            <Monitor className="h-5 w-5 opacity-20" />
                        </NavLink>
                    ))}
                    
                    <div className="mt-8 grid grid-cols-2 gap-3">
                        {isAuthenticated ? (
                            <Button variant="outline" asChild className="rounded-2xl h-14 font-black border-2 border-teal-100 text-teal-700">
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                                    <LayoutDashboard className="me-2 h-5 w-5" />
                                    لوحة التحكم
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" asChild className="rounded-2xl h-14 font-black border-2 border-teal-100 text-teal-700">
                                <Link to="/login" onClick={() => setMobileOpen(false)}>
                                    <LogIn className="me-2 h-5 w-5" />
                                    دخول الموظفين
                                </Link>
                            </Button>
                        )}
                        <Button asChild className="rounded-2xl h-14 font-black shadow-xl shadow-teal-900/20" style={{ backgroundColor: primaryColor }}>
                            <Link to="/book" onClick={() => setMobileOpen(false)}>
                                <CalendarDays className="me-2 h-5 w-5" />
                                احجز موعدك
                            </Link>
                        </Button>
                    </div>

                    <a 
                        href={`tel:${contactPhone}`}
                        className="mt-auto flex items-center justify-center gap-3 p-6 rounded-3xl bg-teal-50 text-teal-700 font-black text-xl"
                    >
                        <Phone className="h-6 w-6" />
                        {contactPhone}
                    </a>
                </nav>
            </div>
        </header>
    );
}
