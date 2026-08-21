import { Building2, CalendarDays, Receipt, TrendingUp } from 'lucide-react';
import { SectionFrame } from '@/components/marketing/SectionFrame';
import { t } from '@/lib/i18n';

const cards = [
    { key: 'booking', icon: CalendarDays },
    { key: 'cashier', icon: Receipt },
    { key: 'branches', icon: Building2 },
    { key: 'reports', icon: TrendingUp },
] as const;

export function ValueSection() {
    return (
        <SectionFrame id="features" tone="white">
            <div className="max-w-3xl">
                <h2 className="text-3xl font-black text-inst-text sm:text-4xl">
                    {t('marketing.value.title')}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-inst-muted sm:text-lg">
                    {t('marketing.value.subtitle')}
                </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article
                            key={card.key}
                            className="rounded-xl border border-inst-border bg-inst-bg p-6"
                        >
                            <span className="inst-icon-box size-12 rounded-lg">
                                <Icon className="size-6" />
                            </span>
                            <h3 className="mt-5 text-xl font-black text-inst-text">
                                {t(`marketing.value.${card.key}.title`)}
                            </h3>
                            <p className="mt-2 text-base leading-relaxed text-inst-muted">
                                {t(`marketing.value.${card.key}.description`)}
                            </p>
                        </article>
                    );
                })}
            </div>
        </SectionFrame>
    );
}
