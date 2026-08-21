import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { MarketingCredits } from '@/components/marketing/MarketingCredits';
import { t } from '@/lib/i18n';
import { getPlatformName } from '@/lib/branding';

const footerLinks = [
    { labelKey: 'marketing.nav.home', to: '/' },
    { labelKey: 'marketing.nav.features', to: '/#features' },
    { labelKey: 'marketing.nav.pricing', to: '/#pricing' },
    { labelKey: 'marketing.nav.vat', to: '/#vat' },
    { labelKey: 'marketing.footer.contact', to: '/#contact' },
] as const;

export function PlatformFooter() {
    const platformName = getPlatformName();
    const year = new Date().getFullYear();
    const brandI18n = { name: platformName, year };

    return (
        <footer className="bg-inst-teal text-white" dir="rtl">
            <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-md">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-lg bg-white/10">
                                <Droplets className="size-5 text-white" />
                            </div>
                            <div>
                                <p className="text-lg font-black">{platformName}</p>
                                <p className="mt-0.5 text-sm font-semibold text-white/70">
                                    {t('marketing.footer.tagline')}
                                </p>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex flex-wrap gap-x-5 gap-y-2">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-sm font-bold text-white/80 transition-colors hover:text-white"
                            >
                                {t(link.labelKey, brandI18n)}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/65 md:flex-row md:items-center">
                    <p>
                        {t('marketing.footer.oman')} · {t('marketing.footer.copyright', brandI18n)}
                    </p>
                    <MarketingCredits className="text-white/50" />
                </div>
            </div>
        </footer>
    );
}
