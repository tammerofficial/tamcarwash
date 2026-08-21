import {
    Building2,
    CalendarClock,
    FileSpreadsheet,
    Gauge,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { SectionFrame } from '@/components/marketing/SectionFrame';
import { t } from '@/lib/i18n';

const blocks = [
    { key: 'daily', icon: Gauge },
    { key: 'cashier', icon: ShieldCheck },
    { key: 'revenue', icon: Wallet },
    { key: 'time', icon: CalendarClock },
    { key: 'branches', icon: Building2 },
    { key: 'accountant', icon: FileSpreadsheet },
] as const;

export function TrustSection() {
    return (
        <SectionFrame tone="soft">
            <div className="max-w-3xl">
                <h2 className="text-3xl font-black text-inst-text sm:text-4xl">
                    {t('marketing.trust.title')}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-inst-muted sm:text-lg">
                    {t('marketing.trust.subtitle')}
                </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {blocks.map((block) => {
                    const Icon = block.icon;
                    return (
                        <article key={block.key} className="rounded-xl border border-inst-border bg-white p-5">
                            <span className="inst-icon-box size-11 rounded-lg">
                                <Icon className="size-5" />
                            </span>
                            <h3 className="mt-4 text-lg font-black text-inst-text">
                                {t(`marketing.trust.${block.key}.title`)}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-inst-muted">
                                {t(`marketing.trust.${block.key}.description`)}
                            </p>
                        </article>
                    );
                })}
            </div>
        </SectionFrame>
    );
}
