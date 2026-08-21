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
            <div className="border-b border-white/5 bg-slate-950 text-[11px] font-black text-slate-300">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <span className="flex size-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse" />
                        <span className="font-black text-slate-200 uppercase tracking-widest text-[10px]">
                            نظام إدارة مغاسل السيارات في عُمان
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300 shadow-sm">
                            <CheckCircle2 className="size-3 text-emerald-400" />
                            امتثال ضريبي كامل
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 font-black text-sky-400 shadow-sm">
                            <Shield className="size-3 text-sky-400" />
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
                        ? 'border-white/5 bg-[#020617]/90 py-3 shadow-2xl backdrop-blur-2xl'
                        : 'border-white/5 bg-transparent py-5 shadow-sm',
                )}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand Logo */}
                    <Link to="/" className="group flex items-center gap-4">
                        <div className="relative flex size-12 items-center justify-center rounded-[1rem] bg-brand-primary text-white shadow-2xl shadow-brand-primary/20 transition-all duration-500 group-hover:scale-105 group-hover:shadow-brand-primary/40">
                            <Droplets className="size-6 text-sky-200 transition-transform group-hover:rotate-6" />
                            <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand-secondary ring-2 ring-[#020617] shadow-md">
                                <Sparkles className="size-2.5 text-[#020617]" />
                            </div>
                        </div>
                        <div className="flex flex-col text-right">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black leading-none tracking-tight text-white uppercase sm:text-2xl">
                                    {platformName}
                                </span>
                                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-secondary border border-white/10">
                                    عُمان
                                </span>
                            </div>
                            <span className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-brand-primary transition-colors">
                                {brandTagline}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-1 shadow-inner lg:flex">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    'relative rounded-xl px-6 py-2 text-[12px] font-black transition-all duration-300 uppercase tracking-wide',
                                    isNavItemActive(item)
                                        ? 'bg-white/10 text-white shadow-md border border-white/10'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5',
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
                            className="rounded-xl px-6 font-black text-slate-400 transition-all hover:bg-white/5 hover:text-white text-sm"
                            asChild
                        >
                            <Link to="/login">{t('marketing.nav.login')}</Link>
                        </Button>
                        <Button
                            className="group relative overflow-hidden rounded-xl bg-white px-7 py-6 font-black text-[#020617] shadow-2xl transition-all duration-500 hover:scale-[1.05] hover:bg-slate-100 text-sm"
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
                        className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white shadow-sm transition-colors hover:bg-white/10 md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="border-b border-white/5 bg-[#020617]/98 p-6 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-top-3 duration-200 md:hidden">
                    <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white">
                                <Droplets className="size-5" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-white">{platformName}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{brandTagline}</p>
                            </div>
                        </div>
                        <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[9px] font-bold text-brand-secondary border border-brand-primary/20">
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
                                        ? 'bg-white/10 text-brand-secondary'
                                        : 'text-slate-400 hover:bg-white/5',
                                )}
                            >
                                <span>{t(`marketing.nav.${item.name}`)}</span>
                                {isNavItemActive(item) && <CheckCircle2 className="size-4 text-brand-secondary" />}
                            </button>
                        ))}
                    </div>

                    <Separator className="my-4 bg-white/5" />

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="h-12 w-full justify-center rounded-xl border-white/10 bg-white/5 font-bold text-white"
                            asChild
                        >
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                {t('marketing.nav.login')}
                            </Link>
                        </Button>
                        <Button
                            className="h-12 w-full justify-center rounded-xl bg-white font-bold text-[#020617] shadow-md"
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

