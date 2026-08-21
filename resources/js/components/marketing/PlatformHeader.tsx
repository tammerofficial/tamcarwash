import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Droplets, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { INST_GRADIENT_BTN, INST_OUTLINE_BTN } from '@/components/marketing/constants';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getAppTagline, getPlatformName } from '@/lib/branding';

type NavItem = {
    name: 'home' | 'features' | 'pricing' | 'vat' | 'contact';
    path: string;
    sectionId?: string;
};

const navItems: NavItem[] = [
    { name: 'home', path: '/' },
    { name: 'features', path: '/#features', sectionId: 'features' },
    { name: 'pricing', path: '/#pricing', sectionId: 'pricing' },
    { name: 'vat', path: '/#vat', sectionId: 'vat' },
    { name: 'contact', path: '/#contact', sectionId: 'contact' },
];

export function PlatformHeader() {
    const platformName = getPlatformName();
    const brand = { name: platformName };
    const brandTagline = getAppTagline() ?? t('marketing.footer.tagline');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 12);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (item: NavItem) => {
        setMobileMenuOpen(false);

        if (item.name === 'home') {
            if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            navigate('/');
            return;
        }

        const sectionId = item.sectionId;
        if (sectionId) {
            if (location.pathname === '/') {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            navigate({ pathname: '/', hash: `#${sectionId}` });
        }
    };

    const isNavItemActive = (item: NavItem) => {
        if (item.name === 'home') {
            return location.pathname === '/' && !location.hash;
        }

        return location.pathname === '/' && location.hash === `#${item.sectionId}`;
    };

    return (
        <header className="fixed left-0 right-0 top-0 z-50" dir="rtl">
            <div
                className={cn(
                    'border-b bg-white transition-shadow',
                    scrolled || location.pathname !== '/'
                        ? 'border-inst-border shadow-sm'
                        : 'border-inst-border',
                )}
            >
                <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-inst-teal text-white">
                            <Droplets className="size-5" />
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-base font-black leading-none text-inst-text sm:text-lg">
                                {platformName}
                            </span>
                            <span className="mt-1 text-[11px] font-semibold text-inst-muted">
                                {brandTagline}
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    'rounded-md px-3 py-2 text-sm font-bold transition-colors',
                                    isNavItemActive(item)
                                        ? 'bg-inst-silver text-inst-teal'
                                        : 'text-inst-text hover:bg-inst-bg',
                                )}
                            >
                                {t(`marketing.nav.${item.name}`, brand)}
                            </button>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        <Button variant="outline" className={cn(INST_OUTLINE_BTN, 'h-10 px-4 text-sm')} asChild>
                            <Link to="/login">{t('marketing.nav.login')}</Link>
                        </Button>
                        <Button className={cn(INST_GRADIENT_BTN, 'h-10 px-5 text-sm')} asChild>
                            <Link to="/register">{t('marketing.nav.getStarted')}</Link>
                        </Button>
                    </div>

                    <button
                        className="flex size-10 items-center justify-center rounded-lg border border-inst-border bg-white text-inst-text md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="border-b border-inst-border bg-white p-4 shadow-lg md:hidden">
                    <div className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    'rounded-lg px-3 py-2.5 text-right text-sm font-bold',
                                    isNavItemActive(item)
                                        ? 'bg-inst-silver text-inst-teal'
                                        : 'text-inst-text hover:bg-inst-bg',
                                )}
                            >
                                {t(`marketing.nav.${item.name}`, brand)}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        <Button variant="outline" className={cn(INST_OUTLINE_BTN, 'w-full')} asChild>
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                {t('marketing.nav.login')}
                            </Link>
                        </Button>
                        <Button className={cn(INST_GRADIENT_BTN, 'w-full')} asChild>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                {t('marketing.nav.getStarted')}
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
