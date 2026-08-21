import { BadgePercent, Building2, Clock3, Wallet } from 'lucide-react';
import { t } from '@/lib/i18n';

const stats = [
    { icon: Building2, value: 'washes', label: 'washesLabel' },
    { icon: Wallet, value: 'price', label: 'priceLabel' },
    { icon: BadgePercent, value: 'vat', label: 'vatLabel' },
    { icon: Clock3, value: 'uptime', label: 'uptimeLabel' },
] as const;

export function StatsStrip() {
    return (
        <section className="border-y border-inst-border bg-inst-teal">
            <div className="mx-auto grid max-w-[1280px] gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.value} className="flex items-center gap-4 bg-inst-teal px-6 py-5">
                            <span className="flex size-11 items-center justify-center rounded-lg bg-white/10 text-white">
                                <Icon className="size-5" />
                            </span>
                            <div>
                                <p className="text-2xl font-black text-white">{t(`marketing.stats.${stat.value}`)}</p>
                                <p className="mt-0.5 text-sm font-semibold text-white/75">
                                    {t(`marketing.stats.${stat.label}`)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
