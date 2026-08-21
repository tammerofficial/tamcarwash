import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    Building2,
    Car,
    CheckCircle2,
    Clock,
    Eye,
    Gauge,
    HeartHandshake,
    LineChart,
    MapPin,
    Receipt,
    Rocket,
    ShieldCheck,
    Smartphone,
    Sparkles,
    TrendingUp,
    Zap,
} from 'lucide-react';
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
            description: t('marketing.whyUsPage.roiText', brand),
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

    const heroHighlights = [
        { text: 'قابلية تشغيل استثنائية', icon: Gauge },
        { text: 'رؤية استراتيجية دقيقة', icon: Eye },
        { text: 'انطلاقة فورية ومجانية', icon: Rocket },
    ];

    const impactItems = [
        { text: 'إدارة مركزية لجميع الفروع', icon: MapPin },
        { text: 'تحليلات دقيقة لحظة بلحظة', icon: LineChart },
        { text: 'تجربة عميل استثنائية وعصرية', icon: HeartHandshake },
    ];

    return (
        <div className="min-h-screen marketing-surface font-sans text-brand-primary/70 selection:bg-brand-primary selection:text-white" dir="rtl">
            <PlatformHeader />

            <main className="relative overflow-hidden pt-32 lg:pt-44">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-[10%] left-[10%] size-[500px] rounded-full bg-brand-primary/10 blur-[120px]" />
                    <div className="absolute top-[20%] -right-[5%] size-[400px] rounded-full bg-brand-secondary/10 blur-[100px]" />
                </div>

                <section className="relative z-10 px-6 pb-20 lg:px-8 lg:pb-32">
                    <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div className="space-y-10 text-right">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-white shadow-lg shadow-brand-primary/20">
                                    {t('marketing.nav.whyUs')}
                                </Badge>
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-brand-primary shadow-sm backdrop-blur-xl">
                                    <Sparkles className="size-3.5 text-icon-dark" />
                                    مصممة للنخبة
                                </span>
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-4xl font-black tracking-tight text-aquatic-gradient sm:text-5xl lg:text-6xl">
                                    {t('marketing.whyUsPage.title', brand)}
                                </h1>
                                <p className="max-w-3xl text-base leading-relaxed text-brand-primary/70">
                                    {t('marketing.whyUsPage.subtitle')}
                                </p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-3">
                                {heroHighlights.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.text} className="rounded-[1.5rem] border border-brand-secondary/20 bg-white/70 p-6 shadow-sm backdrop-blur-xl hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="marketing-icon-box-sm">
                                                    <Icon className="size-6" />
                                                </div>
                                                <p className="text-base font-black text-brand-primary">{item.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-10 rounded-[3rem] bg-brand-primary/10 blur-[120px] opacity-50" />
                            <div className="relative overflow-hidden rounded-[3rem] border border-brand-primary/15 bg-white/80 p-8 shadow-3xl backdrop-blur-xl md:p-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-white -z-10" />
                                <div className="flex items-center justify-between border-b border-brand-primary/15 pb-8">
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-secondary">Premium OS</p>
                                        <p className="mt-2 text-lg font-black text-brand-primary sm:text-xl">لوحة الثقة التشغيلية</p>
                                    </div>
                                    <div className="marketing-icon-box-md">
                                        <Sparkles className="size-8" />
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                                    {[
                                        { label: 'الحجوزات', value: 'ذكية ومترابطة', icon: Clock },
                                        { label: 'الطوابير', value: 'انسيابية عصرية', icon: Car },
                                        { label: 'الفواتير', value: 'أنيقة وقانونية', icon: Receipt },
                                        { label: 'التقارير', value: 'رؤية استباقية', icon: BarChart3 },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-[2rem] border border-brand-primary/15 bg-white p-6 shadow-sm hover:border-brand-primary/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="marketing-icon-box-sm">
                                                    <item.icon className="size-6" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary/50">{item.label}</p>
                                                    <p className="mt-1 text-base font-bold text-brand-primary/65">{item.value}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 rounded-[2.5rem] border border-brand-primary/10 bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 p-8 shadow-inner">
                                    <div className="flex items-center justify-between gap-4 border-b border-brand-primary/15 pb-6">
                                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-primary/50">القيمة المضافة</p>
                                        <div className="marketing-icon-box-sm !size-10">
                                            <Zap className="size-5" />
                                        </div>
                                    </div>
                                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                        {[
                                            'قرار استراتيجي أسرع',
                                            'تجربة نخبوية للفريق',
                                            'امتثال ضريبي ذكي',
                                            'نمو بلا حدود تشغيلية',
                                        ].map((item) => (
                                            <div key={item} className="flex items-center gap-3 rounded-2xl border border-brand-primary/15 bg-white px-5 py-4 text-sm font-bold text-brand-primary/70 shadow-sm">
                                                <CheckCircle2 className="size-4 shrink-0 text-icon-dark" />
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
                        <div className="mb-12 text-center">
                            <div className="mx-auto mb-4 marketing-icon-box-md">
                                <ShieldCheck className="size-7" />
                            </div>
                            <h2 className="text-3xl font-black text-brand-primary sm:text-4xl">لماذا نحن الخيار الأفضل</h2>
                            <p className="mt-4 text-base text-brand-primary/70">أدلة تشغيلية واضحة تدعم قرارك</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                            {proofPoints.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.title}
                                        className={cn(
                                            'rounded-[2.5rem] border p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl',
                                            index % 2 === 0 ? 'border-brand-secondary/20 bg-white/70' : 'border-brand-primary/15 bg-brand-primary/5',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="marketing-icon-box-md">
                                                <Icon className="size-7" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-primary/50">0{index + 1}</span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-black tracking-tight text-brand-primary sm:text-xl">{item.title}</h3>
                                        <p className="mt-4 text-base leading-relaxed text-brand-primary/70">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-24 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-7xl rounded-[3.5rem] border border-brand-primary/15 bg-white/80 px-8 py-20 text-brand-primary shadow-xl backdrop-blur-xl md:px-20 md:py-24 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-white -z-10" />
                        <div className="absolute top-0 right-0 size-[400px] bg-brand-primary/10 blur-[100px] -z-10" />
                        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                            <div className="space-y-8 text-right">
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-brand-primary shadow-sm">
                                    <Building2 className="size-5 text-icon-dark" />
                                    أثر التميز على عملك
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-aquatic-gradient sm:text-4xl">
                                    رؤية واضحة، إدارة هادئة، وننمو مستدام
                                </h2>
                                <p className="max-w-2xl text-base leading-relaxed text-brand-primary/70">
                                    عندما تختار النظام الأفضل، فإنك لا تحصل فقط على برنامج، بل تحصل على شريك استراتيجي يساعدك على تحويل مغسلتك إلى أيقونة في عالم العناية بالمركبات.
                                </p>
                            </div>

                            <div className="rounded-[2.5rem] border border-brand-primary/5 bg-brand-primary/5 p-8 shadow-sm backdrop-blur-md">
                                <div className="grid gap-6">
                                    {impactItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.text} className="flex items-center gap-4 rounded-2xl border border-white bg-white/90 p-5 shadow-sm">
                                                <div className="marketing-icon-box-sm">
                                                    <Icon className="size-6" />
                                                </div>
                                                <p className="text-base font-bold text-brand-primary/90">{item.text}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-24 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-5xl rounded-[3rem] border border-brand-primary/15 bg-white/80 p-12 text-center shadow-3xl backdrop-blur-2xl md:p-20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-white -z-10" />
                        <div className="mx-auto max-w-3xl space-y-6">
                            <h2 className="text-3xl font-black tracking-tight text-brand-primary sm:text-4xl">
                                {t('marketing.cta.title')}
                            </h2>
                            <p className="text-base leading-relaxed text-brand-primary/70">
                                {t('marketing.cta.subtitle', brand)}
                            </p>
                        </div>
                        <div className="mt-12 flex flex-col justify-center gap-6 sm:flex-row">
                            <Button size="lg" className="h-16 rounded-2xl bg-aquatic-gradient px-12 text-base font-black text-white shadow-2xl shadow-brand-primary/20 hover:opacity-90 hover:scale-[1.05] transition-all" asChild>
                                <Link to="/register">{t('marketing.cta.button')}</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 rounded-2xl border-brand-primary/25 !bg-white px-12 text-base font-bold text-brand-primary shadow-sm hover:!bg-brand-primary/5 hover:border-brand-primary/50 transition-all" asChild>
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
