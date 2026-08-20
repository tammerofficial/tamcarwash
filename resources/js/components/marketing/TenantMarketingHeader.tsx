import { Link } from 'react-router-dom';
import { CalendarDays, Droplets, LayoutDashboard, LogIn, Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getTenantBranding, getTenantDisplayName, getTenantPhone } from '@/hooks/useStorefront';
import type { StorefrontProfile } from '@/types/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

interface TenantMarketingHeaderProps {
    profile?: StorefrontProfile | null;
}

function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function TenantMarketingHeader({ profile }: TenantMarketingHeaderProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const branding = getTenantBranding(profile);
    const businessName = getTenantDisplayName(profile);
    const contactPhone = getTenantPhone(profile);

    const navItems = [
        { id: 'services', label: 'الخدمات' },
        { id: 'about', label: 'عن المغسلة' },
        { id: 'location', label: 'الموقع والساعات' },
    ];

    return (
        <header
            className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg"
            style={{ borderBottomColor: `${branding.primaryColor}22` }}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
                <Link to="/" className="flex items-center gap-3">
                    {branding.logoUrl ? (
                        <img
                            src={branding.logoUrl}
                            alt={businessName}
                            className="h-10 w-10 rounded-lg object-cover"
                        />
                    ) : (
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
                            <Droplets className="h-5 w-5" />
                        </div>
                    )}
                    <div>
                        <span className="text-lg font-bold tracking-tight">{businessName}</span>
                        {branding.tagline && (
                            <p className="hidden text-xs text-muted-foreground sm:block">{branding.tagline}</p>
                        )}
                    </div>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => scrollTo(item.id)}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={`tel:${contactPhone}`}>
                            <Phone className="me-2 h-4 w-4" />
                            {contactPhone}
                        </a>
                    </Button>
                    {isAuthenticated ? (
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/dashboard">
                                <LayoutDashboard className="me-2 h-4 w-4" />
                                لوحة التحكم
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/login">
                                <LogIn className="me-2 h-4 w-4" />
                                دخول الموظفين
                            </Link>
                        </Button>
                    )}
                    <Button size="sm" asChild style={{ backgroundColor: branding.primaryColor }}>
                        <Link to="/booking">
                            <CalendarDays className="me-2 h-4 w-4" />
                            احجز موعد غسيل سيارتك
                        </Link>
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileOpen((open) => !open)}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            <div
                className={cn(
                    'border-t bg-background px-4 pb-4 md:hidden',
                    mobileOpen ? 'block' : 'hidden',
                )}
            >
                <nav className="flex flex-col gap-2 pt-3">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="rounded-md px-3 py-2 text-start text-sm font-medium hover:bg-muted"
                            onClick={() => {
                                scrollTo(item.id);
                                setMobileOpen(false);
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                    {isAuthenticated ? (
                        <Button variant="outline" asChild className="mt-2">
                            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                                <LayoutDashboard className="me-2 h-4 w-4" />
                                لوحة التحكم
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" asChild className="mt-2">
                            <Link to="/login" onClick={() => setMobileOpen(false)}>
                                دخول الموظفين
                            </Link>
                        </Button>
                    )}
                    <Button asChild style={{ backgroundColor: branding.primaryColor }}>
                        <Link to="/booking" onClick={() => setMobileOpen(false)}>
                            احجز موعد غسيل سيارتك
                        </Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
