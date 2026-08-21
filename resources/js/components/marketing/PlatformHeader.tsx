import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    Droplets,
    Menu,
    Shield,
    Sparkles,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getAppTagline, getPlatformName } from '@/lib/branding';

export function PlatformHeader() {
    const platformName = getPlatformName();
    const brandTagline = getAppTagline() ?? 'Enterprise SaaS';
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    type NavItem = {
        name: 'features' | 'whyUs' | 'pricing' | 'about';
        path: string;
        sectionId?: string;
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems: NavItem[] = [
        { name: 'features', path: '/#features', sectionId: 'features' },
        { name: 'whyUs', path: '/why-us' },
        { name: 'pricing', path: '/pricing' },
        { name: 'about', path: '/about' },
    ];

    const handleNavClick = (item: NavItem) => {
        setMobileMenuOpen(false);
        const sectionId = item.sectionId;
        if (sectionId) {
            if (location.pathname === '/') {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            navigate({ pathname: '/', hash: `#${sectionId}` });
            return;
        }

        navigate(item.path);
    };

    const isNavItemActive = (item: NavItem) => {
        const sectionId = item.sectionId;
        if (sectionId) {
            return location.pathname === '/' && location.hash === `#${sectionId}`;
        }

        return location.pathname === item.path;
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-50 transition-all duration-300" dir="rtl">
            {/* Top Bar / Announcement */}
            <div className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-600">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <span className="flex size-2 rounded-full bg-brand-primary ring-4 ring-brand-primary/20 animate-pulse" />
                        <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">
                            نظام إدارة مغاسل السيارات في عُمان
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 shadow-sm">
                            <CheckCircle2 className="size-3 text-brand-primary" />
                            امتثال ضريبي كامل
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1 font-black text-brand-primary shadow-sm">
                            <Shield className="size-3 text-brand-primary" />
                            أمان وموثوقية
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <div
                className={cn(
                    'transition-all duration-500 border-b',
                    scrolled || location.pathname !== '/'
                        ? 'border-white/20 bg-white/70 py-3 shadow-lg backdrop-blur-md'
                        : 'border-transparent bg-transparent py-5',
                )}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand Logo */}
                    <Link to="/" className="group flex items-center gap-4">
                        <div className="relative flex size-12 items-center justify-center rounded-[1rem] bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-xl shadow-brand-primary/20 transition-all duration-500 group-hover:scale-105 group-hover:shadow-brand-primary/40">
                            <Droplets className="size-6 text-white transition-transform group-hover:rotate-6" />
                            <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white ring-2 ring-brand-primary/20 shadow-md">
                                <Sparkles className="size-2.5 text-brand-primary" />
                            </div>
                        </div>
                        <div className="flex flex-col text-right">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black leading-none tracking-tight text-slate-900 uppercase sm:text-2xl">
                                    {platformName}
                                </span>
                                <span className="rounded-md bg-brand-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/20">
                                    عُمان
                                </span>
                            </div>
                            <span className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-brand-primary transition-colors">
                                {brandTagline}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/50 p-1 shadow-sm lg:flex">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    'relative rounded-xl px-6 py-2 text-[12px] font-black transition-all duration-300 uppercase tracking-wide',
                                    isNavItemActive(item)
                                        ? 'bg-white text-brand-primary shadow-sm border border-slate-200'
                                        : 'text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5',
                                )}
                            >
                                {t(`marketing.nav.${item.name}`)}
                            </button>
                        ))}
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden items-center gap-4 md:flex">
                        <Button
                            variant="ghost"
                            className="rounded-xl px-6 font-black text-slate-600 transition-all hover:bg-slate-100 hover:text-brand-primary text-sm"
                            asChild
                        >
                            <Link to="/login">{t('marketing.nav.login')}</Link>
                        </Button>
                        <Button
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary px-7 py-6 font-black text-white shadow-xl shadow-brand-primary/20 transition-all duration-500 hover:scale-[1.05] hover:shadow-brand-primary/40 text-sm"
                            asChild
                        >
                            <Link to="/register">
                                <span>ابدأ الآن مجاناً</span>
                                <ArrowLeft className="me-2 size-5 transition-transform group-hover:-translate-x-1.5" />
                            </Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="border-b border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-3 duration-200 md:hidden">
                    <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white">
                                <Droplets className="size-5" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900">{platformName}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{brandTagline}</p>
                            </div>
                        </div>
                        <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[9px] font-bold text-brand-primary border border-brand-primary/20">
                            سحابي • عُمان
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5 text-right">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    'flex items-center justify-between rounded-xl px-4 py-3 text-right text-base font-bold transition-colors',
                                    isNavItemActive(item)
                                        ? 'bg-slate-100 text-brand-primary'
                                        : 'text-slate-600 hover:bg-slate-50',
                                )}
                            >
                                <span>{t(`marketing.nav.${item.name}`)}</span>
                                {isNavItemActive(item) && <CheckCircle2 className="size-4 text-brand-primary" />}
                            </button>
                        ))}
                    </div>

                    <Separator className="my-4 bg-slate-100" />

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="h-12 w-full justify-center rounded-xl border-slate-200 bg-white font-bold text-slate-900 hover:bg-slate-50"
                            asChild
                        >
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                {t('marketing.nav.login')}
                            </Link>
                        </Button>
                        <Button
                            className="h-12 w-full justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary font-bold text-white shadow-lg shadow-brand-primary/20"
                            asChild
                        >
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                <span>ابدأ الآن مجاناً</span>
                                <ArrowLeft className="me-2 size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}

