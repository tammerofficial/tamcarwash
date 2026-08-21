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
                        ? 'border-slate-200 bg-white/95 py-3 shadow-[0_20px_50px_rgba(10,75,120,0.12)] backdrop-blur-2xl'
                        : 'border-slate-200/60 bg-white/90 py-5 shadow-sm backdrop-blur-xl',
                )}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand Logo */}
                    <Link to="/" className="group flex items-center gap-4">
                        <div className="relative flex size-13 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-[#0A4B78] to-[#0284c7] text-white shadow-2xl shadow-sky-950/40 transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 group-hover:shadow-sky-600/50">
                            <Droplets className="size-7 text-sky-200 transition-transform group-hover:rotate-6" />
                            <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow-md">
                                <Sparkles className="size-3 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col text-right">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black leading-none tracking-tighter text-slate-950 uppercase">
                                    {platformName}
                                </span>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">
                                    عُمان
                                </span>
                            </div>
                            <span className="mt-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-[#0A4B78] opacity-80">
                                {brandTagline}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden items-center gap-2 rounded-full border-2 border-slate-100 bg-slate-50/50 p-1.5 shadow-inner lg:flex">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    'relative rounded-full px-6 py-2.5 text-[13px] font-black transition-all duration-300 uppercase tracking-wide',
                                    isNavItemActive(item)
                                        ? 'bg-white text-slate-950 shadow-md ring-1 ring-slate-200'
                                        : 'text-slate-500 hover:text-slate-950 hover:bg-white/80',
                                )}
                            >
                                {t(`marketing.nav.${item.name}`)}
                                {isNavItemActive(item) && (
                                    <span className="absolute inset-x-6 -bottom-1 h-0.5 rounded-full bg-[#0A4B78] shadow-[0_0_10px_rgba(10,75,120,0.5)]" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden items-center gap-4 md:flex">
                        <Button
                            variant="ghost"
                            className="rounded-xl px-6 font-black text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 text-sm"
                            asChild
                        >
                            <Link to="/login">{t('marketing.nav.login')}</Link>
                        </Button>
                        <Button
                            className="group relative overflow-hidden rounded-xl bg-slate-950 px-7 py-6 font-black text-white shadow-2xl shadow-slate-950/20 transition-all duration-500 hover:shadow-sky-900/40 hover:scale-[1.05] hover:bg-[#0A4B78] text-sm"
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
                        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="border-b border-slate-200 bg-white/98 p-6 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-3 duration-200 md:hidden">
                    <div className="mb-4 flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#0A4B78] text-white">
                                <Droplets className="size-5" />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-950">{platformName}</p>
                                <p className="text-[11px] font-bold text-sky-800">{brandTagline}</p>
                            </div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            سحابي • عُمان
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    'flex items-center justify-between rounded-xl px-4 py-3 text-right text-base font-bold transition-colors',
                                    isNavItemActive(item)
                                        ? 'bg-sky-50 text-[#0A4B78]'
                                        : 'text-slate-700 hover:bg-slate-50',
                                )}
                            >
                                <span>{t(`marketing.nav.${item.name}`)}</span>
                                {isNavItemActive(item) && <CheckCircle2 className="size-4 text-[#0A4B78]" />}
                            </button>
                        ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="h-12 w-full justify-center rounded-xl border-slate-300 font-bold text-slate-800"
                            asChild
                        >
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                {t('marketing.nav.login')}
                            </Link>
                        </Button>
                        <Button
                            className="h-12 w-full justify-center rounded-xl bg-gradient-to-r from-[#0A4B78] to-[#0284c7] font-bold text-white shadow-md"
                            asChild
                        >
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                <span>{t('marketing.nav.getStarted')}</span>
                                <ArrowLeft className="me-2 size-4" />
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-4 text-center text-[11px] font-bold text-slate-400">
                        {platformName} • النظام السحابي المعتمد لمغاسل سلطنة عُمان
                    </p>
                </div>
            )}
        </header>
    );
}

