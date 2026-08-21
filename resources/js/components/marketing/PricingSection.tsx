import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionFrame } from '@/components/marketing/SectionFrame';
import { INST_GRADIENT_BTN, INST_OUTLINE_BTN } from '@/components/marketing/constants';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const plans = [
    {
        key: 'free',
        featured: true,
        href: '/register',
        ctaClass: INST_GRADIENT_BTN,
    },
    {
        key: 'professional',
        featured: false,
        href: '/register',
        ctaClass: INST_OUTLINE_BTN,
    },
    {
        key: 'enterprise',
        featured: false,
        href: '/#contact',
        ctaClass: INST_OUTLINE_BTN,
    },
] as const;

const featureCounts = {
    free: 5,
    professional: 5,
    enterprise: 4,
} as const;

export function PricingSection() {
    return (
        <SectionFrame id="pricing" tone="soft">
            <div className="max-w-3xl">
                <h2 className="text-3xl font-black text-inst-text sm:text-4xl">
                    {t('marketing.pricing.title')}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-inst-muted sm:text-lg">
                    {t('marketing.pricing.subtitle')}
                </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {plans.map((plan) => (
                    <article
                        key={plan.key}
                        className={cn(
                            'flex flex-col rounded-xl border bg-white p-6',
                            plan.featured
                                ? 'border-inst-primary shadow-[0_12px_32px_rgba(0,140,158,0.12)]'
                                : 'border-inst-border',
                        )}
                    >
                        {plan.featured && (
                            <span className="mb-3 inline-flex w-fit rounded-md bg-inst-teal px-2.5 py-1 text-xs font-bold text-white">
                                {t('marketing.pricing.free.badge')}
                            </span>
                        )}
                        <h3 className="text-xl font-black text-inst-text">
                            {t(`marketing.pricing.${plan.key}.name`)}
                        </h3>
                        <div className="mt-3 flex items-baseline gap-1.5">
                            <span className="text-4xl font-black text-inst-text">
                                {t(`marketing.pricing.${plan.key}.price`)}
                            </span>
                            {t(`marketing.pricing.${plan.key}.period`) ? (
                                <span className="text-sm font-bold text-inst-muted">
                                    {t(`marketing.pricing.${plan.key}.period`)}
                                </span>
                            ) : null}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-inst-muted">
                            {t(`marketing.pricing.${plan.key}.description`)}
                        </p>
                        <ul className="mt-5 flex-1 space-y-2.5">
                            {Array.from({ length: featureCounts[plan.key] }).map((_, index) => (
                                <li key={index} className="flex items-start gap-2.5 text-sm font-semibold text-inst-text">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-inst-teal" />
                                    {t(`marketing.pricing.${plan.key}.f${index + 1}`)}
                                </li>
                            ))}
                        </ul>
                        <Button
                            size="lg"
                            variant={plan.featured ? 'default' : 'outline'}
                            className={cn('mt-6 w-full', plan.ctaClass)}
                            asChild
                        >
                            <Link to={plan.href}>{t(`marketing.pricing.${plan.key}.cta`)}</Link>
                        </Button>
                    </article>
                ))}
            </div>
        </SectionFrame>
    );
}
