import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Building2, Car, CheckCircle2, Clock, ShieldCheck, Smartphone, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PlatformHeader } from '@/components/marketing/PlatformHeader';
import { PlatformFooter } from '@/components/marketing/PlatformFooter';
import { getPlatformName } from '@/lib/branding';

export function WhyUsPage() {
    const platformName = getPlatformName();
    const brand = { name: platformName };
    
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-600 selection:bg-brand-primary selection:text-white" dir="rtl">
            <PlatformHeader />

            <main className="relative overflow-hidden pt-32 lg:pt-44">
                {/* Background effects */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-[10%] left-[10%] size-[500px] rounded-full bg-cyan-100/30 blur-[120px]" />
                    <div className="absolute top-[20%] -right-[5%] size-[400px] rounded-full bg-sky-100/20 blur-[100px]" />
                </div>

                <section className="relative z-10 px-6 pb-20 lg:px-8 lg:pb-32">
                    <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div className="space-y-10 text-right">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="rounded-full bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white shadow-lg shadow-brand-primary/20">
                                    {t('marketing.nav.whyUs')}
                                </Badge>
                                <span className="rounded-full border border-sky-100 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-brand-primary shadow-sm backdrop-blur-xl">
                                    مصممة للنخبة
                                </span>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-5xl font-black tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
                                    {t('marketing.whyUsPage.title')}
                                </h1>
                                <p className="max-w-3xl text-lg leading-relaxed text-slate-600 md:text-2xl">
                                    {t('marketing.whyUsPage.subtitle')}
                                </p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-3">
                                {[
                                    'قابلية تشغيل استثنائية',
                                    'رؤية استراتيجية دقيقة',
                                    'انطلاقة فورية ومجانية',
                                ].map((item) => (
                                    <div key={item} className="rounded-[1.5rem] border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-brand-primary border border-sky-100 shadow-sm">
                                                <ShieldCheck className="size-6" />
                                            </div>
                                            <p className="text-base font-black text-slate-900">{item}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-10 rounded-[3rem] bg-cyan-100/30 blur-[120px] opacity-50" />
                            <div className="relative overflow-hidden rounded-[3rem] border border-white/40 bg-white/80 p-8 shadow-3xl backdrop-blur-xl md:p-10">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary">Premium OS</p>
                                        <p className="mt-2 text-3xl font-black text-slate-900">لوحة الثقة التشغيلية</p>
                                    </div>
                                    <div className="flex size-16 items-center justify-center rounded-3xl bg-brand-primary text-white shadow-2xl shadow-brand-primary/30">
                                        <Sparkles className="size-8" />
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                                    {[
                                        { label: 'الحجوزات', value: 'ذكية ومترابطة' },
                                        { label: 'الطوابير', value: 'انسيابية عصرية' },
                                        { label: 'الفواتير', value: 'أنيقة وقانونية' },
                                        { label: 'التقارير', value: 'رؤية استباقية' },
                                    ].map((item, index) => {
                                        const Icon = [Clock, Car, BarChart3, TrendingUp][index];

                                        return (
                                            <div key={item.label} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary text-white">
                                                        <Icon className="size-6" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                                                        <p className="mt-1 text-base font-bold text-slate-700">{item.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 shadow-inner">
                                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">القيمة المضافة</p>
                                        <Zap className="size-6 text-brand-secondary" />
                                    </div>
                                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                        {[
                                            'قرار استراتيجي أسرع',
                                            'تجربة نخبوية للفريق',
                                            'امتثال ضريبي ذكي',
                                            'نمو بلا حدود تشغيلية',
                                        ].map((item) => (
                                            <div key={item} className="rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-24 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                            {proofPoints.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className={cn(
                                            'rounded-[2.5rem] border p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl',
                                            index % 2 === 0 ? 'border-slate-200 bg-white/70' : 'border-sky-100 bg-sky-50',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
                                                <Icon className="size-7" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">0{index + 1}</span>
                                        </div>
                                        <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-900">{item.title}</h3>
                                        <p className="mt-4 text-base leading-relaxed text-slate-600">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-24 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-7xl rounded-[3.5rem] bg-slate-900 border border-slate-800 px-8 py-20 text-white shadow-3xl md:px-20 md:py-24 overflow-hidden relative">
                        <div className="absolute top-0 right-0 size-[400px] bg-brand-primary/20 blur-[100px] -z-10" />
                        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-brand-secondary">
                                    <Building2 className="size-5" />
                                    أثر التميز على عملك
                                </div>
                                <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                                    رؤية واضحة، إدارة هادئة، ونمو مستدام
                                </h2>
                                <p className="max-w-2xl text-xl leading-relaxed text-slate-300">
                                    عندما تختار النظام الأفضل، فإنك لا تحصل فقط على برنامج، بل تحصل على شريك استراتيجي يساعدك على تحويل مغسلتك إلى أيقونة في عالم العناية بالمركبات.
                                </p>
                            </div>

                            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md">
                                <div className="grid gap-6">
                                    {[
                                        'إدارة مركزية لجميع الفروع',
                                        'تحليلات دقيقة لحظة بلحظة',
                                        'تجربة عميل استثنائية وعصرية',
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
                                                <CheckCircle2 className="size-6" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-200">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-24 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-5xl rounded-[3rem] border border-sky-100 bg-white/80 p-12 text-center shadow-3xl backdrop-blur-2xl md:p-20">
                        <div className="mx-auto max-w-3xl space-y-8">
                            <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
                                {t('marketing.cta.title')}
                            </h2>
                            <p className="text-xl leading-relaxed text-slate-600">
                                {t('marketing.cta.subtitle', brand)}
                            </p>
                        </div>
                        <div className="mt-12 flex flex-col justify-center gap-6 sm:flex-row">
                            <Button size="lg" className="h-16 rounded-2xl bg-brand-primary px-12 text-lg font-black text-white shadow-2xl shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-[1.05] transition-all" asChild>
                                <Link to="/register">{t('marketing.cta.button')}</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 rounded-2xl border-slate-200 bg-white px-12 text-lg font-bold text-slate-900 shadow-sm hover:bg-slate-50" asChild>
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
