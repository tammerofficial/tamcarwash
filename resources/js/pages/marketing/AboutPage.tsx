import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    Compass,
    Eye,
    GitBranchPlus,
    LayoutDashboard,
    Receipt,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Workflow,
} from 'lucide-react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PlatformHeader } from '@/components/marketing/PlatformHeader';
import { PlatformFooter } from '@/components/marketing/PlatformFooter';
import { getPlatformName } from '@/lib/branding';

export function AboutPage() {
    const platformName = getPlatformName();
    const brand = { name: platformName };

    const coreValues = [
        {
            icon: Sparkles,
            title: t('marketing.about.value1Title'),
            description: t('marketing.about.value1Text'),
        },
        {
            icon: ShieldCheck,
            title: t('marketing.about.value2Title'),
            description: t('marketing.about.value2Text'),
        },
        {
            icon: Users,
            title: t('marketing.about.value3Title'),
            description: t('marketing.about.value3Text'),
        },
    ];

    const heroHighlights = [
        { text: 'تشغيل مركزي واضح', icon: LayoutDashboard },
        { text: 'امتثال ضريبي جاهز', icon: Receipt },
        { text: 'نمو متدرج منظم', icon: TrendingUp },
    ];

    const missionPillars = [
        { title: 'تشغيل منظم', description: 'ترابط بين الاستقبال والفوترة والإغلاق المالي.', icon: Workflow },
        { title: 'وضوح إداري', description: 'رؤية لحظية للفروع والفرق والطلب اليومي.', icon: Eye },
        { title: 'نمو قابل للتوسع', description: 'إضافة فروع وصلاحيات من دون تعقيد.', icon: GitBranchPlus },
    ];

    return (
        <div className="min-h-screen marketing-surface font-sans text-brand-primary/70 selection:bg-brand-primary selection:text-white" dir="rtl">
            <PlatformHeader />

            <main className="relative overflow-hidden pt-32 lg:pt-40">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 size-[600px] rounded-full bg-brand-primary/10 blur-[120px]" />
                    <div className="absolute bottom-0 left-0 size-[500px] rounded-full bg-brand-secondary/10 blur-[100px]" />
                </div>

                <section className="relative z-10 px-6 pb-20 lg:px-8 lg:pb-28">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div className="space-y-8 text-right">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-white shadow-lg shadow-brand-primary/20">
                                    {t('marketing.nav.about', brand)}
                                </Badge>
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-brand-primary shadow-sm backdrop-blur-xl">
                                    <Sparkles className="size-3.5 text-icon-dark" />
                                    {t('marketing.about.badge', brand)}
                                </span>
                            </div>

                            <div className="space-y-5">
                                <h1 className="text-4xl font-black tracking-tight text-aquatic-gradient sm:text-5xl lg:text-6xl">
                                    {t('marketing.about.title')}
                                </h1>
                                <p className="max-w-3xl text-base leading-relaxed text-brand-primary/70">
                                    {t('marketing.about.subtitle', brand)}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {heroHighlights.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.text} className="rounded-[1.5rem] border border-brand-secondary/20 bg-white/90 p-4 shadow-sm backdrop-blur-xl hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="marketing-icon-box-sm !size-10">
                                                    <Icon className="size-5" />
                                                </div>
                                                <p className="text-sm font-black text-brand-primary">{item.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-8 rounded-[3rem] bg-brand-primary/10 blur-[120px]" />
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-brand-primary/15 bg-white p-6 shadow-3xl backdrop-blur-xl md:p-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-white -z-10" />
                                <div className="flex items-center justify-between border-b border-brand-primary/15 pb-5">
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-secondary">نظرة عامة</p>
                                        <p className="mt-2 text-lg font-black text-brand-primary sm:text-xl">{platformName}</p>
                                    </div>
                                    <div className="marketing-icon-box-sm">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4 rounded-[2rem] border border-brand-primary/10 bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5 p-6 shadow-inner">
                                    <div className="flex items-start gap-3">
                                        <div className="marketing-icon-box-sm !size-11">
                                            <Target className="size-5" />
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <p className="text-lg font-black text-brand-primary sm:text-xl">رسالة واضحة</p>
                                            <p className="text-sm leading-7 text-brand-primary/70">تمكين أصحاب المغاسل من إدارة التشغيل والمراجعة والضريبة من لوحة واحدة، دون تشتت بين الأنظمة.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="marketing-icon-box-sm !size-11">
                                            <Compass className="size-5" />
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <p className="text-lg font-black text-brand-primary sm:text-xl">رؤية عملية</p>
                                            <p className="text-sm leading-7 text-brand-primary/70">بناء منصة إدارية بسيطة في الاستخدام، قوية في الرقابة، وقابلة للتوسع مع نمو الفروع.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {[
                                        { text: 'تجربة إدارة أكثر وضوحاً', icon: Eye },
                                        { text: 'اعتمادية في التفاصيل اليومية', icon: CheckCircle2 },
                                    ].map((item) => (
                                        <div key={item.text} className="rounded-[1.5rem] border border-brand-secondary/20 bg-brand-primary/5 p-4 shadow-sm hover:border-brand-primary/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="marketing-icon-box-sm !size-10">
                                                    <item.icon className="size-5" />
                                                </div>
                                                <p className="text-sm font-black text-brand-primary">{item.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
                            <div className="rounded-[2.25rem] border border-brand-primary/15 bg-white p-8 shadow-3xl backdrop-blur-xl lg:p-10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-white -z-10" />
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-brand-primary shadow-sm">
                                    <Target className="size-4 text-icon-dark" />
                                    {t('marketing.about.missionTitle')}
                                </div>
                                <h2 className="mt-6 text-3xl font-black tracking-tight text-aquatic-gradient sm:text-4xl">
                                    {t('marketing.about.missionTitle')}
                                </h2>
                                <p className="mt-6 text-base leading-relaxed text-brand-primary/70">
                                    {t('marketing.about.missionText')}
                                </p>
                            </div>

                            <div className="rounded-[2.25rem] border border-brand-primary/10 bg-gradient-to-br from-white via-brand-primary/5 to-brand-secondary/5 p-6 shadow-3xl backdrop-blur-xl md:p-8">
                                <div className="grid gap-4 md:grid-cols-3">
                                    {missionPillars.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.title} className="rounded-[1.75rem] border border-brand-secondary/20 bg-white p-5 shadow-sm hover:border-brand-primary/30 transition-colors">
                                                <div className="marketing-icon-box-sm !size-11">
                                                    <Icon className="size-5" />
                                                </div>
                                                <h3 className="mt-5 text-lg font-black tracking-tight text-brand-primary sm:text-xl">{item.title}</h3>
                                                <p className="mt-3 text-sm leading-7 text-brand-primary/70">{item.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 rounded-[2rem] border border-brand-secondary/20 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between gap-4 border-b border-brand-primary/15 pb-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-primary/50">لماذا يهمنا؟</p>
                                        <div className="marketing-icon-box-sm !size-10">
                                            <Users className="size-5" />
                                        </div>
                                    </div>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {[
                                            'الموارد تُرى بوضوح',
                                            'القرارات تصبح أسرع',
                                            'التجربة أكثر ثباتاً',
                                            'البيانات تصبح قابلة للمراجعة',
                                        ].map((item) => (
                                            <div key={item} className="flex items-center gap-3 rounded-[1.25rem] bg-brand-primary/5 px-4 py-3 border border-brand-primary/10 hover:border-brand-primary/20 transition-colors">
                                                <CheckCircle2 className="size-4 shrink-0 text-icon-dark" />
                                                <span className="text-sm font-bold text-brand-primary/80">{item}</span>
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
                        <div className="mx-auto max-w-3xl text-right">
                            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-brand-primary shadow-sm">
                                <Sparkles className="size-4 text-icon-dark" />
                                {t('marketing.about.valuesTitle')}
                            </div>
                            <h2 className="mt-6 text-3xl font-black tracking-tight text-aquatic-gradient sm:text-4xl">
                                {t('marketing.about.valuesTitle')}
                            </h2>
                            <p className="mt-6 text-base leading-relaxed text-brand-primary/70">
                                قيمنا ليست شعارات، بل طريقة في بناء المنتج وخدمة العملاء والتعامل مع البيانات.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-4 md:grid-cols-3">
                            {coreValues.map((value, index) => {
                                const Icon = value.icon;

                                return (
                                    <div
                                        key={value.title}
                                        className={cn(
                                            'rounded-[1.75rem] border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl backdrop-blur-md',
                                            index === 1 ? 'border-brand-primary/20 bg-brand-primary/5' : 'border-brand-secondary/20 bg-white/80',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="marketing-icon-box-sm">
                                                <Icon className="size-6" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-primary/30">0{index + 1}</span>
                                        </div>
                                        <h3 className="mt-6 text-lg font-black tracking-tight text-brand-primary sm:text-xl">{value.title}</h3>
                                        <p className="mt-4 text-sm leading-7 text-brand-primary/70">{value.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl rounded-[3rem] border border-brand-primary/10 bg-white/80 px-8 py-16 text-brand-primary shadow-3xl backdrop-blur-xl md:px-14 md:py-20">
                        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                            <div className="space-y-6 text-right">
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-brand-primary">
                                    <ShieldCheck className="size-4 text-icon-dark" />
                                    {t('marketing.about.teamTitle')}
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-aquatic-gradient sm:text-4xl">
                                    {t('marketing.about.teamTitle')}
                                </h2>
                                <p className="max-w-2xl text-base leading-relaxed text-brand-primary/70">
                                    {t('marketing.about.teamText')}
                                </p>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[t('marketing.about.trust1'), t('marketing.about.trust2'), t('marketing.about.trust3')].map((item) => (
                                        <div key={item} className="rounded-[1.4rem] border border-brand-primary/10 bg-white/50 p-4 text-sm font-bold text-brand-primary/80 shadow-sm text-center">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-brand-primary/5 bg-brand-primary/5 p-6">
                                <div className="grid gap-4">
                                    {[
                                        { text: 'فريق يفكر بعقلية تشغيلية', icon: Workflow },
                                        { text: 'قرارات تستند إلى بيانات حقيقية', icon: TrendingUp },
                                        { text: 'واجهة مستخدم احترافية', icon: Sparkles },
                                    ].map((item) => (
                                        <div key={item.text} className="flex items-center gap-3 rounded-[1.25rem] border border-white bg-white/80 p-4 shadow-sm hover:border-brand-primary/20 transition-colors">
                                            <div className="marketing-icon-box-sm !size-10">
                                                <item.icon className="size-5" />
                                            </div>
                                            <p className="text-sm font-bold text-brand-primary/90">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-5xl rounded-[3rem] border border-brand-primary/15 bg-white/80 p-8 text-center shadow-3xl backdrop-blur-xl md:p-14 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-white -z-10" />
                        <div className="mx-auto max-w-3xl space-y-6">
                            <h2 className="text-3xl font-black tracking-tight text-aquatic-gradient sm:text-4xl">
                                {t('marketing.cta.title')}
                            </h2>
                            <p className="text-base leading-relaxed text-brand-primary/70">
                                {t('marketing.cta.subtitle', { name: platformName, year: new Date().getFullYear() })}
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
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
