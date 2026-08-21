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
        <div className="marketing-surface min-h-screen font-sans text-slate-900" dir="rtl">
            <PlatformHeader />

            <main className="relative z-10 pt-28 sm:pt-36 lg:pt-40">
                {/* Hero */}
                <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
                        <div className="space-y-8 text-right">
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-white/90 px-4 py-2 text-xs font-black text-brand-primary shadow-sm">
                                <ShieldCheck className="size-4" />
                                {t('marketing.hero.badge')}
                            </span>

                            <div className="space-y-5">
                                <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                    {t('marketing.hero.title')}
                                </h1>
                                <p className="max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                                    {t('marketing.hero.subtitle')}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Button
                                    size="lg"
                                    className="h-13 rounded-2xl bg-brand-primary px-8 text-base font-black text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary-dark"
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
                                    className="h-13 rounded-2xl border-slate-200 bg-white px-8 text-base font-bold text-slate-700 hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary"
                                    onClick={() => scrollToSection('features')}
                                >
                                    {t('marketing.hero.ctaSecondary')}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="h-13 rounded-2xl font-bold text-brand-primary hover:bg-brand-primary/10"
                                    asChild
                                >
                                    <a href={DEMO_STOREFRONT}>
                                        جرّب العرض التجريبي
                                    </a>
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { value: t('marketing.stats.orders'), label: t('marketing.stats.ordersLabel') },
                                    { value: t('marketing.stats.vat'), label: t('marketing.stats.vatLabel') },
                                    { value: t('marketing.stats.branches'), label: t('marketing.stats.branchesLabel') },
                                    { value: t('marketing.stats.loyalty'), label: t('marketing.stats.loyaltyLabel') },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm"
                                    >
                                        <p className="text-base font-black text-brand-primary sm:text-lg">{stat.value}</p>
                                        <p className="mt-1 text-[11px] font-bold text-slate-500">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero visual — simplified dashboard preview */}
                        <div className="relative">
                            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 blur-2xl" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
                                <div className="flex items-center justify-between border-b border-slate-800 bg-brand-primary-dark px-5 py-3 text-white">
                                    <span className="text-xs font-black">{platformName}</span>
                                    <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-bold text-emerald-300">
                                        بث مباشر
                                    </span>
                                </div>
                                <div className="space-y-4 p-6">
                                    <div className="rounded-2xl border border-brand-primary/10 bg-brand-primary/5 p-5">
                                        <p className="text-xs font-bold text-brand-primary">عمليات اليوم</p>
                                        <p className="mt-1 text-3xl font-black text-slate-950">548 <span className="text-sm text-slate-400">سيارة</span></p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'انتظار', value: '6', tone: 'amber' },
                                            { label: 'غسيل', value: '4', tone: 'sky' },
                                            { label: 'مكتمل', value: '42', tone: 'emerald' },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className={cn(
                                                    'rounded-xl p-3 text-center',
                                                    item.tone === 'amber' && 'bg-amber-50 text-amber-700',
                                                    item.tone === 'sky' && 'bg-sky-50 text-sky-700',
                                                    item.tone === 'emerald' && 'bg-emerald-50 text-emerald-700',
                                                )}
                                            >
                                                <p className="text-[10px] font-bold">{item.label}</p>
                                                <p className="text-xl font-black">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
                                        <BadgePercent className="size-4" />
                                        ض.ق.م 5% — فواتير جاهزة للامتثال
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust strip */}
                <section className="border-y border-slate-200/80 bg-white py-10">
                    <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
                        {trustKeys.map((key) => {
                            const Icon = trustIcons[key];
                            return (
                                <div key={key} className="flex items-start gap-4 text-right">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                                        <Icon className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900">
                                            {t(`marketing.trust.${key}.title`)}
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                            {t(`marketing.trust.${key}.description`)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">
                                {t('marketing.features.title')}
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">
                                {t('marketing.features.subtitle')}
                            </p>
                        </div>

                        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featureKeys.map((key) => {
                                const Icon = featureIcons[key];
                                return (
                                    <div
                                        key={key}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-md"
                                    >
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary text-white">
                                            <Icon className="size-6" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-black text-slate-950">
                                            {t(`marketing.features.${key}.title`)}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                            {t(`marketing.features.${key}.description`)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="bg-brand-primary-dark px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-black sm:text-4xl">{t('marketing.howItWorks.title')}</h2>
                            <p className="mt-3 text-slate-300">{t('marketing.howItWorks.subtitle')}</p>
                        </div>
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {stepKeys.map((key, index) => (
                                <div
                                    key={key}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-secondary text-brand-primary-dark text-sm font-black">
                                        0{index + 1}
                                    </span>
                                    <h3 className="mt-4 text-lg font-black">{t(`marketing.howItWorks.${key}.title`)}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                        {t(`marketing.howItWorks.${key}.description`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing teaser */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl rounded-[2rem] border border-brand-primary/15 bg-white p-8 text-center shadow-lg sm:p-12">
                        <BadgePercent className="mx-auto size-10 text-brand-primary" />
                        <h2 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">
                            {t('marketing.pricing.title')}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-slate-600">
                            {t('marketing.pricing.subtitle')}
                        </p>
                        <p className="mt-4 text-sm font-bold text-brand-primary">
                            {t('marketing.footer.vatNote')} — {platformName}
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button size="lg" className="rounded-2xl bg-brand-primary font-black hover:bg-brand-primary-dark" asChild>
                                <Link to="/pricing">استعراض الباقات</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-2xl font-bold" asChild>
                                <Link to="/register">{t('marketing.nav.getStarted')}</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="border-y border-slate-200/80 bg-slate-50/70 px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">
                                {t('marketing.testimonials.title', brand)}
                            </h2>
                            <p className="mt-3 text-slate-600">{t('marketing.testimonials.subtitle')}</p>
                        </div>
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {testimonialKeys.map((key) => (
                                <div key={key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex gap-1 text-amber-400">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className="size-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="mt-4 text-sm leading-relaxed text-slate-700 italic">
                                        &ldquo;{t(`marketing.testimonials.${key}.quote`)}&rdquo;
                                    </p>
                                    <div className="mt-5 border-t border-slate-100 pt-4">
                                        <p className="text-sm font-black text-slate-950">
                                            {t(`marketing.testimonials.${key}.author`)}
                                        </p>
                                        <p className="text-xs font-bold text-brand-primary">
                                            {t(`marketing.testimonials.${key}.business`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <div className="text-center">
                            <HelpCircle className="mx-auto size-8 text-brand-primary" />
                            <h2 className="mt-3 text-3xl font-black text-slate-950">{t('marketing.faq.title')}</h2>
                        </div>
                        <Accordion type="single" collapsible className="mt-10 space-y-3">
                            {faqKeys.map((key) => (
                                <AccordionItem
                                    key={key}
                                    value={key}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5"
                                >
                                    <AccordionTrigger className="py-4 text-right text-base font-black text-slate-950 hover:no-underline hover:text-brand-primary">
                                        {t(`marketing.faq.${key}.question`)}
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 text-right text-sm leading-relaxed text-slate-600">
                                        {t(`marketing.faq.${key}.answer`, brand)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-4 pb-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-brand-primary to-brand-primary-dark p-10 text-center text-white shadow-2xl sm:p-14">
                        <h2 className="text-3xl font-black sm:text-4xl">{t('marketing.cta.title')}</h2>
                        <p className="mx-auto mt-4 max-w-xl text-slate-200">
                            {t('marketing.cta.subtitle', brand)}
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button
                                size="lg"
                                className="h-13 rounded-2xl bg-white px-8 font-black text-brand-primary hover:bg-slate-100"
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
                                className="h-13 rounded-2xl border-white/30 bg-white/10 px-8 font-bold text-white hover:bg-white/20"
                                asChild
                            >
                                <a href={DEMO_STOREFRONT}>جرّب العرض التجريبي</a>
                            </Button>
                        </div>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-300">
                            {['امتثال ض.ق.م 5%', 'تفعيل فوري', 'دعم محلي', 'فروع متعددة'].map((item) => (
                                <span key={item} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <PlatformFooter />
        </div>
    );
}
