import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Compass, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PlatformHeader } from '@/components/marketing/PlatformHeader';
import { PlatformFooter } from '@/components/marketing/PlatformFooter';
import { getPlatformName } from '@/lib/branding';

export function AboutPage() {
    const platformName = getPlatformName();

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

    return (
        <div className="min-h-screen marketing-surface font-sans text-brand-primary/70" dir="rtl">
            <PlatformHeader />

            <main className="relative overflow-hidden pt-32 lg:pt-40">
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '96px 96px' }} />

                <section className="relative z-10 px-6 pb-20 lg:px-8 lg:pb-28">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div className="space-y-8 text-right">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="rounded-full bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-brand-primary-dark">
                                    {t('marketing.nav.about')}
                                </Badge>
                                <span className="rounded-full border border-brand-primary/15 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-brand-primary shadow-sm backdrop-blur-xl">
                                    عن تمير واش
                                </span>
                            </div>

                            <div className="space-y-5">
                                <h1 className="text-4xl font-black tracking-tight text-aquatic-gradient md:text-5xl lg:text-6xl">
                                    {t('marketing.about.title')}
                                </h1>
                                <p className="max-w-3xl text-lg leading-[1.95] text-brand-primary/70 md:text-2xl">
                                    {t('marketing.about.subtitle')}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    'تشغيل مركزي واضح',
                                    'امتثال ضريبي جاهز',
                                    'نمو متدرج منظم',
                                ].map((item) => (
                                    <div key={item} className="rounded-[1.5rem] border border-brand-secondary/20 bg-white/90 p-4 shadow-sm backdrop-blur-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                                <CheckCircle2 className="size-5" />
                                            </div>
                                            <p className="text-sm font-black text-brand-primary/90">{item}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-8 rounded-[3rem] bg-brand-primary/10 blur-[120px]" />
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-brand-secondary/20 bg-white p-6 shadow-[0_30px_90px_rgba(11,129,183,0.12)] md:p-8">
                                <div className="flex items-center justify-between border-b border-brand-primary/15 pb-5">
                                    <div className="text-right">
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary">نظرة عامة</p>
                                        <p className="mt-2 text-2xl font-black text-brand-primary">{platformName}</p>
                                    </div>
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-xl shadow-brand-primary/20">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4 rounded-[2rem] border border-brand-primary/10 bg-gradient-to-br from-brand-primary/6 via-white to-brand-secondary/10 p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                                            <Target className="size-5" />
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <p className="text-lg font-black text-brand-primary">رسالة واضحة</p>
                                            <p className="text-sm leading-7 text-brand-primary/70">تمكين أصحاب المغاسل من إدارة التشغيل والمراجعة والضريبة من لوحة واحدة، دون تشتت بين الأنظمة.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-secondary/15 text-brand-primary">
                                            <Compass className="size-5" />
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <p className="text-lg font-black text-brand-primary">رؤية عملية</p>
                                            <p className="text-sm leading-7 text-brand-primary/70">بناء منصة إدارية بسيطة في الاستخدام، قوية في الرقابة، وقابلة للتوسع مع نمو الفروع.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {[
                                        'تجربة إدارة أكثر وضوحاً',
                                        'اعتمادية في التفاصيل اليومية',
                                    ].map((item) => (
                                        <div key={item} className="rounded-[1.5rem] border border-brand-secondary/20 bg-brand-primary/5 p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                                    <CheckCircle2 className="size-5" />
                                                </div>
                                                <p className="text-sm font-black text-brand-primary/90">{item}</p>
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
                            <div className="rounded-[2.25rem] border border-brand-secondary/20 bg-white p-8 shadow-[0_20px_60px_rgba(11,129,183,0.08)] lg:p-10">
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-secondary/8 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-brand-primary">
                                    <Target className="size-4 text-brand-secondary" />
                                    {t('marketing.about.missionTitle')}
                                </div>
                                <h2 className="mt-6 text-3xl font-black tracking-tight text-brand-primary md:text-5xl">
                                    {t('marketing.about.missionTitle')}
                                </h2>
                                <p className="mt-6 text-base leading-8 text-brand-primary/70 md:text-lg">
                                    {t('marketing.about.missionText')}
                                </p>
                            </div>

                            <div className="rounded-[2.25rem] border border-brand-primary/10 bg-gradient-to-br from-white via-brand-primary/5 to-brand-secondary/10 p-6 shadow-[0_20px_60px_rgba(11,129,183,0.08)] md:p-8">
                                <div className="grid gap-4 md:grid-cols-3">
                                    {[
                                        { title: 'تشغيل منظم', description: 'ترابط بين الاستقبال والفوترة والإغلاق المالي.' },
                                        { title: 'وضوح إداري', description: 'رؤية لحظية للفروع والفرق والطلب اليومي.' },
                                        { title: 'نمو قابل للتوسع', description: 'إضافة فروع وصلاحيات من دون تعقيد.' },
                                    ].map((item) => (
                                        <div key={item.title} className="rounded-[1.75rem] border border-brand-secondary/20 bg-white p-5 shadow-sm">
                                            <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                                                <CheckCircle2 className="size-5" />
                                            </div>
                                            <h3 className="mt-5 text-xl font-black tracking-tight text-brand-primary">{item.title}</h3>
                                            <p className="mt-3 text-sm leading-7 text-brand-primary/70">{item.description}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-[2rem] border border-brand-secondary/20 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between gap-4 border-b border-brand-primary/15 pb-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-brand-primary/50">Why it matters</p>
                                        <Users className="size-5 text-brand-primary" />
                                    </div>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {[
                                            'الموارد تُرى بوضوح',
                                            'القرارات تصبح أسرع',
                                            'التجربة أكثر ثباتاً',
                                            'البيانات تصبح قابلة للمراجعة',
                                        ].map((item) => (
                                            <div key={item} className="flex items-center gap-3 rounded-[1.25rem] bg-brand-primary/5 px-4 py-3">
                                                <div className="flex size-9 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                                    <CheckCircle2 className="size-4" />
                                                </div>
                                                <span className="text-sm font-bold text-brand-primary/65">{item}</span>
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
                            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/6 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-brand-primary shadow-sm">
                                <Sparkles className="size-4 text-brand-secondary" />
                                {t('marketing.about.valuesTitle')}
                            </div>
                            <h2 className="mt-6 text-3xl font-black tracking-tight text-brand-primary md:text-5xl">
                                {t('marketing.about.valuesTitle')}
                            </h2>
                            <p className="mt-6 text-base leading-8 text-brand-primary/70 md:text-lg">
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
                                            'rounded-[1.75rem] border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl',
                                            index === 1 ? 'border-brand-primary/15 bg-brand-primary/6' : 'border-brand-secondary/20 bg-white/92',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                                                <Icon className="size-6" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-secondary/40">0{index + 1}</span>
                                        </div>
                                        <h3 className="mt-6 text-2xl font-black tracking-tight text-brand-primary">{value.title}</h3>
                                        <p className="mt-4 text-sm leading-7 text-brand-primary/70">{value.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl rounded-[3rem] border border-brand-secondary/20 bg-white/80 px-8 py-16 text-brand-primary shadow-xl backdrop-blur-xl md:px-14 md:py-20">
                        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                            <div className="space-y-6 text-right">
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-primary/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-brand-primary">
                                    <ShieldCheck className="size-4 text-brand-secondary" />
                                    {t('marketing.about.teamTitle')}
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-brand-primary md:text-5xl">
                                    {t('marketing.about.teamTitle')}
                                </h2>
                                <p className="max-w-2xl text-lg leading-8 text-brand-primary/70 md:text-xl">
                                    {t('marketing.about.teamText')}
                                </p>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[t('marketing.about.trust1'), t('marketing.about.trust2'), t('marketing.about.trust3')].map((item) => (
                                        <div key={item} className="rounded-[1.4rem] border border-brand-primary/15 bg-brand-primary/5 p-4 text-sm font-bold text-brand-primary/65 shadow-sm text-center">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-brand-secondary/20 bg-brand-primary/5 p-6">
                                <div className="grid gap-4">
                                    {[
                                        'فريق يفكر بعقلية تشغيلية',
                                        'قرارات تستند إلى بيانات حقيقية',
                                        'واجهة مستخدم احترافية',
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3 rounded-[1.25rem] border border-white bg-white/80 p-4 shadow-sm">
                                            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                                                <CheckCircle2 className="size-5" />
                                            </div>
                                            <p className="text-sm font-bold text-brand-primary/90">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-brand-secondary/20 bg-white p-8 text-center shadow-[0_24px_70px_rgba(11,129,183,0.1)] md:p-14">
                        <div className="mx-auto max-w-3xl space-y-6">
                            <h2 className="text-3xl font-black tracking-tight text-brand-primary md:text-5xl">
                                {t('marketing.cta.title')}
                            </h2>
                            <p className="text-lg leading-8 text-brand-primary/70 md:text-xl">
                                {t('marketing.cta.subtitle', { name: platformName, year: new Date().getFullYear() })}
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                            <Button size="lg" className="h-14 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary px-8 text-base font-black text-white shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all" asChild>
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
