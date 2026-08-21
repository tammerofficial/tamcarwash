import type { ReactNode } from 'react';
import {
    BarChart3,
    Building2,
    CalendarDays,
    FileText,
    LayoutDashboard,
    Receipt,
    Users,
} from 'lucide-react';
import { getPlatformName } from '@/lib/branding';
import { t } from '@/lib/i18n';

const sparkline = [28, 36, 32, 48, 44, 62, 58, 74, 68, 86, 80, 94];

const queueItems = [
    { label: 'انتظار', value: '6', tone: 'muted' },
    { label: 'غسيل', value: '4', tone: 'aqua' },
    { label: 'جاهز', value: '3', tone: 'success' },
] as const;

const workers = [
    { name: 'خالد الراشدي', done: 18, width: '88%' },
    { name: 'سالم المقبالي', done: 14, width: '70%' },
    { name: 'يوسف الحارثي', done: 11, width: '56%' },
];

const branches = [
    { name: 'الخوير', status: 'نشط', cars: 22 },
    { name: 'الغبرة', status: 'نشط', cars: 17 },
    { name: 'صلالة', status: 'نشط', cars: 9 },
];

const sidebarItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', active: true },
    { icon: CalendarDays, label: 'الحجوزات' },
    { icon: BarChart3, label: 'الطابور' },
    { icon: Receipt, label: 'الفواتير' },
    { icon: FileText, label: 'التقارير' },
];

export function DashboardPreviewMockup() {
    const platformName = getPlatformName();

    return (
        <div
            className="overflow-hidden rounded-2xl border border-inst-border bg-white shadow-[0_18px_50px_rgba(6,63,73,0.12)]"
            aria-hidden="true"
        >
            <div className="flex items-center justify-between bg-inst-teal px-4 py-3 text-white">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-white/10">
                        <LayoutDashboard className="size-4" />
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-bold">{platformName}</p>
                        <p className="text-[11px] text-white/70">{t('marketing.mockup.dashboard')}</p>
                    </div>
                </div>
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold">
                    {t('marketing.mockup.live')}
                </span>
            </div>

            <div className="grid bg-inst-bg sm:grid-cols-[148px_1fr]">
                <aside className="hidden border-s border-inst-border bg-white p-3 sm:block">
                    <p className="mb-2 px-2 text-[10px] font-bold tracking-wide text-inst-muted">
                        {t('marketing.mockup.operations')}
                    </p>
                    <ul className="space-y-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li
                                    key={item.label}
                                    className={
                                        item.active
                                            ? 'flex items-center gap-2 rounded-lg bg-inst-silver px-2.5 py-2 text-[12px] font-bold text-inst-teal'
                                            : 'flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-inst-muted'
                                    }
                                >
                                    <Icon className="size-3.5 text-inst-teal" />
                                    {item.label}
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                <div className="space-y-3 p-3 sm:p-4">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <KpiCard
                            title={t('marketing.mockup.revenue')}
                            value="1,248"
                            unit="ر.ع"
                            hint="+12% اليوم"
                        >
                            <div className="mt-3 flex h-8 items-end gap-0.5">
                                {sparkline.map((h, i) => (
                                    <span
                                        key={i}
                                        className="flex-1 rounded-sm bg-inst-primary/25 last:bg-inst-primary"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </KpiCard>
                        <KpiCard title={t('marketing.mockup.bookings')} value="37" unit="حجز" hint="اليوم" />
                        <KpiCard title={t('marketing.mockup.invoices')} value="22" unit="فاتورة" hint="ضريبة 5%" />
                        <KpiCard title={t('marketing.mockup.branches')} value="3" unit="فروع" hint="تشغيل متزامن">
                            <div className="mt-3 flex items-center gap-1.5">
                                <Building2 className="size-3.5 text-inst-teal" />
                                <span className="text-[11px] font-semibold text-inst-muted">مسقط · صلالة</span>
                            </div>
                        </KpiCard>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                        <div className="rounded-xl border border-inst-border bg-white p-3.5">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-bold text-inst-text">{t('marketing.mockup.queue')}</p>
                                <span className="rounded-md bg-inst-silver px-2 py-0.5 text-[10px] font-bold text-inst-teal">
                                    {t('marketing.mockup.now')}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {queueItems.map((item) => (
                                    <div key={item.label} className="rounded-lg bg-inst-bg px-2 py-2.5 text-center">
                                        <p className="text-xl font-black text-inst-text">{item.value}</p>
                                        <p className="mt-0.5 text-[11px] font-bold text-inst-muted">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-inst-border bg-white p-3.5">
                            <div className="mb-3 flex items-center gap-2">
                                <Users className="size-4 text-inst-teal" />
                                <p className="text-sm font-bold text-inst-text">{t('marketing.mockup.workers')}</p>
                            </div>
                            <div className="space-y-2.5">
                                {workers.map((worker) => (
                                    <div key={worker.name}>
                                        <div className="mb-1 flex items-center justify-between text-[11px]">
                                            <span className="font-bold text-inst-text">{worker.name}</span>
                                            <span className="font-semibold text-inst-muted">{worker.done} مركبة</span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-inst-silver">
                                            <div className="h-full rounded-full bg-inst-primary" style={{ width: worker.width }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-inst-border bg-white p-3.5">
                        <p className="mb-2.5 text-sm font-bold text-inst-text">{t('marketing.mockup.branchStatus')}</p>
                        <div className="grid gap-2 sm:grid-cols-3">
                            {branches.map((branch) => (
                                <div key={branch.name} className="flex items-center justify-between rounded-lg bg-inst-bg px-3 py-2">
                                    <div>
                                        <p className="text-[13px] font-bold text-inst-text">{branch.name}</p>
                                        <p className="text-[11px] font-semibold text-inst-muted">{branch.cars} سيارة اليوم</p>
                                    </div>
                                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-inst-success">
                                        {branch.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({
    title,
    value,
    unit,
    hint,
    children,
}: {
    title: string;
    value: string;
    unit: string;
    hint: string;
    children?: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-inst-border bg-white p-3">
            <p className="text-[11px] font-bold text-inst-muted">{title}</p>
            <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-black text-inst-text">{value}</span>
                <span className="text-[11px] font-semibold text-inst-muted">{unit}</span>
            </div>
            <p className="mt-0.5 text-[10px] font-semibold text-inst-success">{hint}</p>
            {children}
        </div>
    );
}
