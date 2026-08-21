import { Link } from 'react-router-dom';
import { ArrowLeft, BadgePercent, Building2, CheckCircle2, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPreviewMockup } from '@/components/marketing/DashboardPreviewMockup';
import { DEMO_STOREFRONT, INST_GRADIENT_BTN, INST_OUTLINE_BTN } from '@/components/marketing/constants';
import { t } from '@/lib/i18n';

const trustBadges = [
    { icon: Building2, key: 'trust1' },
    { icon: BadgePercent, key: 'trust2' },
    { icon: LayoutDashboard, key: 'trust3' },
    { icon: ShieldCheck, key: 'trust4' },
] as const;

export function HeroSaasSection() {
    return (
        <section className="inst-hero-surface px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
            <div className="mx-auto grid max-w-[1280px] items-center gap-8 lg:grid-cols-2 lg:gap-10">
                <div className="space-y-6 text-right">
                    <span className="inline-flex items-center gap-2 rounded-md border border-inst-border bg-white px-3 py-1.5 text-sm font-bold text-inst-teal">
                        <CheckCircle2 className="size-4 text-inst-teal" />
                        {t('marketing.hero.badge')}
                    </span>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-inst-text sm:text-5xl lg:text-6xl">
                            {t('marketing.hero.title')}
                        </h1>
                        <p className="max-w-xl text-base leading-relaxed text-inst-muted sm:text-lg">
                            {t('marketing.hero.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {trustBadges.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.key}
                                    className="flex items-center gap-2.5 rounded-lg border border-inst-border bg-white px-3 py-2.5"
                                >
                                    <span className="inst-icon-box size-8 rounded-md">
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="text-sm font-bold text-inst-text">
                                        {t(`marketing.hero.${item.key}`)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button size="lg" className={INST_GRADIENT_BTN} asChild>
                            <Link to="/register">
                                {t('marketing.hero.ctaPrimary')}
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className={INST_OUTLINE_BTN} asChild>
                            <a href={DEMO_STOREFRONT}>{t('marketing.hero.ctaSecondary')}</a>
                        </Button>
                    </div>
                </div>

                <DashboardPreviewMockup />
            </div>
        </section>
    );
}
