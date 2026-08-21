import {
    Building2,
    CalendarDays,
    Car,
    Clock3,
    LayoutDashboard,
    Receipt,
    Settings,
    ShoppingBag,
    Tag,
    Users,
    FileSpreadsheet,
    ClipboardList,
} from 'lucide-react';
import { SectionFrame } from '@/components/marketing/SectionFrame';
import { t } from '@/lib/i18n';

const modules = [
    { key: 'dashboard', icon: LayoutDashboard },
    { key: 'branches', icon: Building2 },
    { key: 'customers', icon: Users },
    { key: 'vehicles', icon: Car },
    { key: 'services', icon: ClipboardList },
    { key: 'pricing', icon: Tag },
    { key: 'bookings', icon: CalendarDays },
    { key: 'queue', icon: Clock3 },
    { key: 'orders', icon: ShoppingBag },
    { key: 'invoices', icon: Receipt },
    { key: 'vatReports', icon: FileSpreadsheet },
    { key: 'settings', icon: Settings },
] as const;

export function ModulesSection() {
    return (
        <SectionFrame tone="soft">
            <div className="max-w-3xl">
                <h2 className="text-3xl font-black text-inst-text sm:text-4xl">
                    {t('marketing.modules.title')}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-inst-muted sm:text-lg">
                    {t('marketing.modules.subtitle')}
                </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                        <div
                            key={module.key}
                            className="group flex items-center gap-3 rounded-xl border border-inst-border bg-white px-4 py-3.5 transition-colors hover:border-inst-primary"
                        >
                            <span className="inst-icon-box size-10 shrink-0 rounded-md">
                                <Icon className="size-5" />
                            </span>
                            <span className="text-sm font-bold text-inst-text">
                                {t(`marketing.modules.${module.key}`)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </SectionFrame>
    );
}
