import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    BadgePercent,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    HelpCircle,
    Receipt,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { PlatformHeader } from '@/components/marketing/PlatformHeader';
import { PlatformFooter } from '@/components/marketing/PlatformFooter';
import { t } from '@/lib/i18n';
import { getPlatformName } from '@/lib/branding';
import { cn } from '@/lib/utils';

const DEMO_STOREFRONT = '/alwadi-wash2df/';

const featureKeys = ['booking', 'queue', 'invoices', 'branches', 'reports', 'loyalty'] as const;

const featureIcons = {
    booking: CalendarDays,
    queue: Clock3,
    invoices: Receipt,
    branches: Building2,
    reports: TrendingUp,
    loyalty: Sparkles,
} as const;

const trustKeys = ['vat', 'activation', 'omann', 'security'] as const;

const trustIcons = {
    vat: BadgePercent,
    activation: Sparkles,
    omann: ShieldCheck,
    security: CheckCircle2,
} as const;

const stepKeys = ['step1', 'step2', 'step3'] as const;

const testimonialKeys = ['t1', 't2', 't3'] as const;

const faqKeys = ['q1', 'q2', 'q3', 'q4'] as const;

export function MarketingHomePage() {
    const platformName = getPlatformName();
    const brand = { name: platformName };

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-600 selection:bg-brand-primary selection:text-white" dir="rtl">
            <PlatformHeader />

            <main className="relative z-10 pt-28 sm:pt-36 lg:pt-44">
                {/* Background effects */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-[10%] left-[10%] size-[500px] rounded-full bg-brand-primary/10 blur-[120px]" />
                    <div className="absolute top-[20%] -right-[5%] size-[400px] rounded-full bg-brand-secondary/10 blur-[100px]" />
                    <div className="absolute bottom-[10%] left-[20%] size-[600px] rounded-full bg-brand-primary/5 blur-[150px]" />
                </div>

                {/* Hero */}
                <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-32">
                    <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
                        <div className="space-y-10 text-right">
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-primary backdrop-blur-md">
                                <Sparkles className="size-3.5" />
                                {t('marketing.hero.badge')}
                            </span>

                            <div className="space-y-6">
                                <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                                    {t('marketing.hero.title')}
                                </h1>
                                <p className="max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                                    {t('marketing.hero.subtitle')}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <Button
                                    size="lg"
                                    className="h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary px-10 text-base font-black text-white shadow-2xl shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-[1.02] transition-transform"
                                    asChild
                                >
                                    <Link to="/register">
                                        {t('marketing.hero.ctaPrimary')}
                                        <ArrowLeft className="me-2 size-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 rounded-2xl border-slate-200 bg-white px-10 text-base font-bold text-slate-900 shadow-sm hover:bg-slate-50 hover:border-brand-primary/50 hover:text-brand-primary transition-all"
                                    onClick={() => scrollToSection('features')}
                                >
                                    {t('marketing.hero.ctaSecondary')}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="h-14 rounded-2xl font-bold text-slate-500 hover:text-brand-primary hover:bg-sky-50"
                                    asChild
                                >
                                    <a href={DEMO_STOREFRONT}>
                                        جرّب العرض التجريبي
                                    </a>
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {[
                                    { value: t('marketing.stats.orders'), label: t('marketing.stats.ordersLabel') },
                                    { value: t('marketing.stats.vat'), label: t('marketing.stats.vatLabel'), highlight: true },
                                    { value: t('marketing.stats.branches'), label: t('marketing.stats.branchesLabel') },
                                    { value: t('marketing.stats.loyalty'), label: t('marketing.stats.loyaltyLabel') },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className={cn(
                                            "rounded-2xl border p-5 backdrop-blur-sm transition-all hover:border-brand-primary/30 shadow-sm",
                                            stat.highlight ? "border-brand-primary/20 bg-brand-primary/5" : "border-slate-200 bg-white/70"
                                        )}
                                    >
                                        <p className="text-lg font-black text-slate-900 sm:text-xl">{stat.value}</p>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero visual — simplified dashboard preview */}
                        <div className="relative lg:block">
                            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 blur-3xl opacity-50" />
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/80 shadow-2xl backdrop-blur-xl">
                                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="size-2.5 rounded-full bg-red-400/40" />
                                            <div className="size-2.5 rounded-full bg-amber-400/40" />
                                            <div className="size-2.5 rounded-full bg-emerald-400/40" />
                                        </div>
                                        <span className="text-xs font-black text-slate-400">{platformName} OS</span>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                        Active Now
                                    </span>
                                </div>
                                <div className="space-y-6 p-8">
                                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">عمليات اليوم</p>
                                        <p className="mt-2 text-4xl font-black text-slate-900">548 <span className="text-sm font-medium text-slate-500">مركبة</span></p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: 'انتظار', value: '6', color: 'amber' },
                                            { label: 'غسيل', value: '4', color: 'sky' },
                                            { label: 'مكتمل', value: '42', color: 'emerald' },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl bg-white border border-slate-100 p-4 text-center shadow-sm"
                                            >
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                                                <p className={cn(
                                                    "text-2xl font-black mt-1",
                                                    item.color === 'amber' && 'text-amber-600',
                                                    item.color === 'sky' && 'text-sky-600',
                                                    item.color === 'emerald' && 'text-emerald-600',
                                                )}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 px-5 py-4 text-xs font-bold text-brand-primary shadow-sm">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                                            <BadgePercent className="size-4" />
                                        </div>
                                        فواتير ضريبية فورية بنسبة 5% — امتثال تام
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust strip */}
                <section className="border-y border-slate-200 bg-white/50 py-12">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
                        {trustKeys.map((key) => {
                            const Icon = trustIcons[key];
                            return (
                                <div key={key} className="flex items-start gap-5 text-right">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/5 text-brand-primary border border-brand-primary/10 shadow-sm">
                                        <Icon className="size-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            {t(`marketing.trust.${key}.title`)}
                                        </h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                                            {t(`marketing.trust.${key}.description`)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-4xl font-black text-slate-900 sm:text-5xl">
                                {t('marketing.features.title')}
                            </h2>
                            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                                {t('marketing.features.subtitle')}
                            </p>
                        </div>

                        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {featureKeys.map((key) => {
                                const Icon = featureIcons[key];
                                return (
                                    <div
                                        key={key}
                                        className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/70 p-8 transition-all hover:-translate-y-2 hover:border-brand-primary/30 hover:bg-white shadow-sm hover:shadow-xl"
                                    >
                                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-xl shadow-brand-primary/20 group-hover:scale-110 transition-transform">
                                            <Icon className="size-7" />
                                        </div>
                                        <h3 className="mt-8 text-xl font-black text-slate-900">
                                            {t(`marketing.features.${key}.title`)}
                                        </h3>
                                        <p className="mt-3 text-base leading-relaxed text-slate-600">
                                            {t(`marketing.features.${key}.description`)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Pricing / Free Proposition */}
                <section className="px-4 py-24 sm:px-6 lg:px-8 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-brand-primary/10 blur-[150px] -z-10" />
                    <div className="mx-auto max-w-5xl rounded-[3rem] border border-brand-primary/10 bg-white/80 p-12 text-center shadow-2xl backdrop-blur-xl sm:p-20">
                        <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-2xl shadow-brand-primary/20">
                            <BadgePercent className="size-10" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 sm:text-5xl">
                            {t('marketing.pricing.title')}
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
                            {t('marketing.pricing.subtitle')}
                        </p>
                        
                        <div className="mt-12 inline-flex flex-col items-center">
                            <span className="text-[120px] font-black leading-none text-brand-primary tracking-tighter sm:text-[160px]">
                                0
                            </span>
                            <span className="text-2xl font-black text-brand-secondary -mt-4 uppercase tracking-[0.2em]">
                                OMR / FOREVER
                            </span>
                        </div>

                        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
                            <Button size="lg" className="h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary px-12 text-lg font-black text-white hover:bg-brand-primary/90 hover:scale-[1.05] transition-all shadow-xl shadow-brand-primary/20" asChild>
                                <Link to="/register">{t('marketing.pricing.free.cta')}</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 rounded-2xl border-slate-200 bg-white px-12 text-lg font-bold text-slate-900 shadow-sm hover:bg-slate-50" asChild>
                                <a href={DEMO_STOREFRONT}>جرّب العرض التجريبي</a>
                            </Button>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-slate-500">
                            {['لا حدود للفروع', 'دعم فني متميز', 'تحديثات مجانية للأبد', 'فواتير ضريبية قانونية'].map((item) => (
                                <span key={item} className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-emerald-500" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="bg-slate-100/50 border-y border-slate-200 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-4xl font-black text-slate-900 sm:text-5xl">{t('marketing.howItWorks.title')}</h2>
                            <p className="mt-4 text-lg text-slate-600">{t('marketing.howItWorks.subtitle')}</p>
                        </div>
                        <div className="mt-20 grid gap-8 md:grid-cols-3">
                            {stepKeys.map((key, index) => (
                                <div
                                    key={key}
                                    className="relative rounded-[2rem] border border-slate-200 bg-white/70 p-10 backdrop-blur-sm shadow-sm"
                                >
                                    <span className="absolute -top-6 right-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-xl font-black shadow-xl shadow-brand-primary/20">
                                        0{index + 1}
                                    </span>
                                    <h3 className="mt-4 text-2xl font-black text-slate-900">{t(`marketing.howItWorks.${key}.title`)}</h3>
                                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                                        {t(`marketing.howItWorks.${key}.description`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="px-4 py-24 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-4xl font-black text-slate-900 sm:text-5xl">
                                {t('marketing.testimonials.title', brand)}
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">{t('marketing.testimonials.subtitle')}</p>
                        </div>
                        <div className="mt-20 grid gap-8 md:grid-cols-3">
                            {testimonialKeys.map((key) => (
                                <div key={key} className="rounded-[2rem] border border-slate-200 bg-white/70 p-8 shadow-sm hover:shadow-lg transition-all">
                                    <div className="flex gap-1.5 text-brand-secondary">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className="size-4 fill-brand-secondary" />
                                        ))}
                                    </div>
                                    <p className="mt-6 text-lg leading-relaxed text-slate-700 italic">
                                        &ldquo;{t(`marketing.testimonials.${key}.quote`)}&rdquo;
                                    </p>
                                    <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
                                        <div className="size-12 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-xl font-black border border-brand-primary/10">
                                            {t(`marketing.testimonials.${key}.author`).charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-900">
                                                {t(`marketing.testimonials.${key}.author`)}
                                            </p>
                                            <p className="text-sm font-bold text-brand-primary">
                                                {t(`marketing.testimonials.${key}.business`)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-4 py-24 sm:px-6 lg:px-8 border-t border-slate-200">
                    <div className="mx-auto max-w-3xl">
                        <div className="text-center">
                            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                                <HelpCircle className="size-8" />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900">{t('marketing.faq.title')}</h2>
                        </div>
                        <Accordion type="single" collapsible className="mt-16 space-y-4">
                            {faqKeys.map((key) => (
                                <AccordionItem
                                    key={key}
                                    value={key}
                                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white px-6 transition-all hover:bg-slate-50 shadow-sm"
                                >
                                    <AccordionTrigger className="py-6 text-right text-lg font-black text-slate-900 hover:no-underline hover:text-brand-primary">
                                        {t(`marketing.faq.${key}.question`)}
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 text-right text-base leading-relaxed text-slate-600">
                                        {t(`marketing.faq.${key}.answer`, brand)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-4 pb-32 pt-24 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-5xl overflow-hidden rounded-[3.5rem] border border-brand-primary/10 bg-white/80 relative p-12 text-center shadow-3xl backdrop-blur-xl sm:p-20">
                        {/* Decorative background for CTA */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-white -z-10" />
                        <div className="absolute -top-24 -right-24 size-[300px] rounded-full bg-brand-primary/10 blur-3xl -z-10" />
                        
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black text-slate-950 sm:text-6xl">{t('marketing.cta.title')}</h2>
                            <p className="mx-auto mt-6 max-w-xl text-xl text-slate-600 font-medium leading-relaxed">
                                {t('marketing.cta.subtitle', brand)}
                            </p>
                            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary px-12 text-lg font-black text-white hover:bg-brand-primary/90 hover:scale-[1.05] transition-all shadow-2xl shadow-brand-primary/20"
                                    asChild
                                >
                                    <Link to="/register">
                                        {t('marketing.cta.button')}
                                        <ArrowLeft className="me-2 size-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-16 rounded-2xl border-slate-200 bg-white px-12 text-lg font-bold text-slate-900 shadow-sm hover:bg-slate-50 transition-all"
                                    asChild
                                >
                                    <a href={DEMO_STOREFRONT}>جرّب العرض التجريبي</a>
                                </Button>
                            </div>
                            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                {['امتثال ض.ق.م 5%', 'تفعيل فوري', 'دعم محلي', 'فروع لا محدودة'].map((item) => (
                                    <span key={item} className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-100 px-4 py-2 text-slate-600">
                                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <PlatformFooter />
        </div>
    );
}

