import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEMO_STOREFRONT, INST_OUTLINE_BTN } from '@/components/marketing/constants';
import { getPlatformName } from '@/lib/branding';
import { t } from '@/lib/i18n';

export function FinalCTA() {
    const brand = { name: getPlatformName() };

    return (
        <section id="contact" className="scroll-mt-20 bg-inst-teal px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-[1280px] text-right">
                <h2 className="text-3xl font-black text-white sm:text-4xl">
                    {t('marketing.cta.title')}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                    {t('marketing.cta.subtitle', brand)}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Button
                        size="lg"
                        className="h-12 rounded-lg bg-inst-primary px-7 text-base font-bold text-white hover:bg-[#007A8A]"
                        asChild
                    >
                        <Link to="/register">
                            {t('marketing.cta.button')}
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className={INST_OUTLINE_BTN}
                        asChild
                    >
                        <a href={DEMO_STOREFRONT}>{t('marketing.cta.secondary')}</a>
                    </Button>
                </div>
            </div>
        </section>
    );
}
