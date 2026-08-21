import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PlatformHeader } from '@/components/marketing/PlatformHeader';
import { PlatformFooter } from '@/components/marketing/PlatformFooter';

const pricingPlans = ['starter', 'pro', 'enterprise'] as const;

function registerHref(plan?: (typeof pricingPlans)[number]): string {
    return plan ? `/register?plan=${plan}` : '/register';
}

export function PricingPage() {
    const trustPoints = [
        'لا رسوم خفية',
        'ترقية سلسة بين الباقات',
        'تجربة مناسبة للشركات متعددة الفروع',
    ];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(92,178,255,0.1),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(10,75,120,0.08),transparent_28%),linear-gradient(180deg,#f8fbfe_0%,#eef5fb_46%,#f8fbfe_100%)] font-sans text-slate-900" dir="rtl">
            <PlatformHeader />

            <main className="relative overflow-hidden pt-32 lg:pt-40">
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)', backgroundSize: '96px 96px' }} />

                <section className="relative z-10 px-6 pb-20 lg:px-8 lg:pb-28">
                    <div className="mx-auto max-w-5xl text-right">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="rounded-full bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-brand-primary-dark">
                                {t('marketing.nav.pricing')}
                            </Badge>
                            <span className="rounded-full border border-brand-primary/15 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-brand-primary shadow-sm backdrop-blur-xl">
                                رسوم الخدمة
                            </span>
                        </div>

                        <div className="mt-8 space-y-5">
                            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                                {t('marketing.pricingPage.title')}
                            </h1>
                            <p className="max-w-3xl text-lg leading-[1.95] text-slate-600 md:text-2xl">
                                {t('marketing.pricingPage.subtitle')}
                            </p>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            {trustPoints.map((item) => (
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
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-6 lg:grid-cols-3 lg:items-end">
                            {pricingPlans.map((plan) => {
                                const isPro = plan === 'pro';

                                return (
                                    <div
                                        key={plan}
                                        className={cn(
                                            'relative flex h-full flex-col rounded-[2rem] border p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300',
                                            isPro
                                                ? 'z-10 border-brand-primary/20 bg-white lg:scale-[1.03]'
                                                : 'border-slate-200/80 bg-white/92 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)]',
                                        )}
                                    >
                                        {isPro && (
                                            <div className="absolute -top-4 inset-x-0 flex justify-center">
                                                <Badge className="rounded-full bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.32em] text-white hover:bg-brand-primary-dark">
                                                    {t('marketing.pricing.pro.badge')}
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="mb-8 text-right">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="text-3xl font-black tracking-tight text-slate-950">
                                                    {t(`marketing.pricing.${plan}.name`)}
                                                </h3>
                                                <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                                    <Sparkles className="size-5" />
                                                </div>
                                            </div>
                                            <div className="mt-4 h-1 w-16 rounded-full bg-brand-secondary" />
                                            <p className="mt-5 text-sm leading-7 text-slate-600">
                                                {t(`marketing.pricing.${plan}.description`)}
                                            </p>
                                        </div>

                                        <div className="mb-8 border-b border-slate-100 pb-8 text-right">
                                            <div className="flex items-baseline justify-end gap-3">
                                                <span className={cn('text-5xl font-black tracking-tight md:text-6xl', isPro ? 'text-brand-primary' : 'text-slate-950')}>
                                                    {t(`marketing.pricing.${plan}.price`)}
                                                </span>
                                                <span className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                                                    {t(`marketing.pricing.${plan}.period`)}
                                                </span>
                                            </div>
                                        </div>

                                        <ul className="mb-10 flex-1 space-y-4 text-right">
                                            {[
                                                plan === 'starter' ? 'booking' : plan === 'pro' ? 'branches' : 'loyalty',
                                                'invoices',
                                                'reports',
                                                'workers',
                                                'customers',
                                            ].map((featureKey) => (
                                                <li key={featureKey} className="flex items-center justify-end gap-3">
                                                    <span className="text-sm font-black tracking-wide text-slate-700">
                                                        {t(`marketing.features.${featureKey}.title`)}
                                                    </span>
                                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-brand-primary/15 bg-brand-primary text-white">
                                                        <CheckCircle2 className="size-4" />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            size="lg"
                                            className={cn(
                                                'h-14 w-full rounded-full text-base font-black transition-transform hover:scale-[1.01]',
                                                isPro
                                                    ? 'bg-brand-primary text-white hover:bg-brand-primary-dark'
                                                    : 'border border-brand-primary/10 bg-slate-50 text-slate-900 hover:bg-brand-primary/5 hover:text-brand-primary',
                                            )}
                                            asChild
                                        >
                                            <Link to={registerHref(plan)}>{t(`marketing.pricing.${plan}.cta`)}</Link>
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.98fr_1.02fr] lg:items-stretch">
                        <div className="rounded-[2.25rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/6 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-brand-primary">
                                <HelpCircle className="size-4 text-brand-secondary" />
                                {t('marketing.pricingPage.faqTitle')}
                            </div>
                            <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                                {t('marketing.pricingPage.faqTitle')}
                            </h2>
                            <p className="mt-6 text-base leading-8 text-slate-600 md:text-lg">
                                إجابات قصيرة وواضحة تساعدك على اختيار الباقة المناسبة بسرعة، من دون التباس أو مفاجآت.
                            </p>
                        </div>

                        <Accordion type="single" collapsible className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <AccordionItem
                                    key={i}
                                    value={`q${i}`}
                                    className="rounded-[1.5rem] border border-slate-200/80 bg-white px-6 shadow-sm transition-all hover:shadow-md"
                                >
                                    <AccordionTrigger className="py-6 text-right text-lg font-black text-slate-950 hover:no-underline data-[state=open]:text-brand-primary md:text-xl">
                                        <div className="flex w-full items-center justify-end gap-3">
                                            <span>{t(`marketing.pricingPage.q${i}`)}</span>
                                            <HelpCircle className="size-5 text-brand-secondary" />
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6 text-right text-base leading-8 text-slate-600 md:text-lg">
                                        {t(`marketing.pricingPage.a${i}`)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
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
                                <Link to="/why-us">{t('marketing.nav.whyUs')}</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <PlatformFooter />
        </div>
    );
}
