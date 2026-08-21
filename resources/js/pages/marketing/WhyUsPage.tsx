import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Building2, Car, CheckCircle2, Clock, ShieldCheck, Smartphone, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PlatformHeader } from '@/components/marketing/PlatformHeader';
import { PlatformFooter } from '@/components/marketing/PlatformFooter';

export function WhyUsPage() {
    const proofPoints = [
        {
            icon: Clock,
            title: t('marketing.whyUsPage.efficiencyTitle'),
            description: t('marketing.whyUsPage.efficiencyText'),
        },
        {
            icon: TrendingUp,
            title: t('marketing.whyUsPage.roiTitle'),
            description: t('marketing.whyUsPage.roiText'),
        },
        {
            icon: BarChart3,
            title: t('marketing.whyUsPage.reportsTitle'),
            description: t('marketing.whyUsPage.reportsText'),
        },
        {
            icon: Smartphone,
            title: t('marketing.whyUsPage.integrationTitle'),
            description: t('marketing.whyUsPage.integrationText'),
        },
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(92,178,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(10,75,120,0.08),transparent_28%),linear-gradient(180deg,#f8fbfe_0%,#eef5fb_46%,#f8fbfe_100%)] font-sans text-slate-900" dir="rtl">
            <PlatformHeader />

            <main className="relative overflow-hidden pt-32 lg:pt-40">
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '96px 96px' }} />

                <section className="relative z-10 px-6 pb-20 lg:px-8 lg:pb-28">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div className="space-y-8 text-right">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="rounded-full bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-brand-primary-dark">
                                    {t('marketing.nav.whyUs')}
                                </Badge>
                                <span className="rounded-full border border-brand-primary/15 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-brand-primary shadow-sm backdrop-blur-xl">
                                    مصممة للنمو
                                </span>
                            </div>

                            <div className="space-y-5">
                                <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                                    {t('marketing.whyUsPage.title')}
                                </h1>
                                <p className="max-w-3xl text-lg leading-[1.95] text-slate-600 md:text-2xl">
                                    {t('marketing.whyUsPage.subtitle')}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    'قابلية تشغيل أعلى',
                                    'رؤية مالية أوضح',
                                    'انطلاقة أسرع للفِرق',
                                ].map((item) => (
                                    <div key={item} className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                                <ShieldCheck className="size-5" />
                                            </div>
                                            <p className="text-sm font-black text-slate-800">{item}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-10 rounded-[3rem] bg-brand-secondary/10 blur-[120px]" />
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] md:p-8">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                                    <div className="text-right">
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary">عرض القرار</p>
                                        <p className="mt-2 text-2xl font-black text-slate-950">لوحة الثقة التشغيلية</p>
                                    </div>
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/10">
                                        <Sparkles className="size-6" />
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {[
                                        { label: 'الحجوزات', value: 'منسّقة ومترابطة' },
                                        { label: 'الطوابير', value: 'أوضح للعميل والفريق' },
                                        { label: 'الفواتير', value: 'أقرب للمراجعة السريعة' },
                                        { label: 'التقارير', value: 'جاهزة لاتخاذ القرار' },
                                    ].map((item, index) => {
                                        const Icon = [Clock, Car, BarChart3, TrendingUp][index];

                                        return (
                                            <div key={item.label} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-5 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary text-white">
                                                        <Icon className="size-5" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                                                        <p className="mt-1 text-sm font-bold text-slate-700">{item.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 rounded-[2rem] border border-brand-primary/10 bg-gradient-to-br from-brand-primary/6 via-white to-brand-secondary/10 p-6">
                                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">ما الذي تحصل عليه</p>
                                        <Zap className="size-5 text-brand-primary" />
                                    </div>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {[
                                            'قرار أسرع تحت ضغط العمل',
                                            'تجربة موحدة للفريق كله',
                                            'امتثال أسهل وأوضح',
                                            'نمو بدون فوضى تشغيلية',
                                        ].map((item) => (
                                            <div key={item} className="rounded-[1.25rem] border border-slate-200/80 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {proofPoints.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className={cn(
                                            'rounded-[1.75rem] border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl',
                                            index % 2 === 0 ? 'border-slate-200/80 bg-white/92' : 'border-brand-primary/15 bg-brand-primary/6',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                                                <Icon className="size-6" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-300">0{index + 1}</span>
                                        </div>
                                        <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-950">{item.title}</h3>
                                        <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-slate-950 px-8 py-16 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)] md:px-14 md:py-20">
                        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-white/60">
                                    <Building2 className="size-4 text-brand-secondary" />
                                    أثر عملي على العمل اليومي
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                                    قرارات أوضح، فريق أهدأ، ومراجعة أسهل
                                </h2>
                                <p className="max-w-2xl text-lg leading-8 text-white/60 md:text-xl">
                                    عندما تكون اللوحة واضحة، يصبح تشغيل المغسلة أكثر ثباتاً، وتتراجع الأخطاء الصغيرة التي تستهلك الوقت والجهد.
                                </p>
                            </div>

                            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                                <div className="grid gap-4">
                                    {[
                                        'إدارة منطقية للفروع والفرق',
                                        'مؤشرات مركزة على الأهم',
                                        'تجربة إدارة متكاملة للفروع',
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                                            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary text-white">
                                                <CheckCircle2 className="size-5" />
                                            </div>
                                            <p className="text-sm font-bold text-white/80">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-slate-200/80 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)] md:p-14">
                        <div className="mx-auto max-w-3xl space-y-6">
                            <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                                {t('marketing.cta.title')}
                            </h2>
                            <p className="text-lg leading-8 text-slate-600 md:text-xl">
                                {t('marketing.cta.subtitle', { name: 'تمير واش', year: new Date().getFullYear() })}
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                            <Button size="lg" className="h-14 rounded-full bg-brand-primary px-8 text-base font-black text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-dark" asChild>
                                <Link to="/register">{t('marketing.cta.button')}</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 rounded-full border-brand-primary/15 bg-white px-8 text-base font-black text-brand-primary hover:bg-brand-primary/5" asChild>
                                <Link to="/pricing">{t('marketing.nav.pricing')}</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <PlatformFooter />
        </div>
    );
}
