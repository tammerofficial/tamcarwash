import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, HelpCircle, ShieldCheck } from 'lucide-react';
import { t } from '@/lib/i18n';
import { PlatformHeader } from '@/components/marketing/PlatformHeader';
import { PlatformFooter } from '@/components/marketing/PlatformFooter';

export function PricingPage() {
    const trustPoints = [
        'مجاني بالكامل للأبد',
        'لا رسوم خفية أو عمولات',
        'دعم فني متميز ومجاني',
    ];

    return (
        <div className="min-h-screen marketing-surface font-sans text-brand-primary/70 selection:bg-brand-primary selection:text-white" dir="rtl">
            <PlatformHeader />

            <main className="relative overflow-hidden pt-32 lg:pt-40">
                {/* Background effects */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 size-[600px] rounded-full bg-brand-primary/10 blur-[120px]" />
                    <div className="absolute bottom-0 left-0 size-[500px] rounded-full bg-brand-secondary/10 blur-[100px]" />
                </div>

                <section className="relative z-10 px-6 pb-20 lg:px-8 lg:pb-28">
                    <div className="mx-auto max-w-5xl text-right">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-white shadow-lg shadow-brand-primary/20">
                                {t('marketing.nav.pricing')}
                            </Badge>
                            <span className="rounded-full border border-brand-primary/20 bg-white/70 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-brand-primary shadow-sm backdrop-blur-xl">
                                استثمارك صفر
                            </span>
                        </div>

                        <div className="mt-8 space-y-5">
                            <h1 className="text-5xl font-black tracking-tight text-aquatic-gradient md:text-6xl lg:text-7xl">
                                {t('marketing.pricingPage.title')}
                            </h1>
                            <p className="max-w-3xl text-lg leading-relaxed text-brand-primary/70 md:text-2xl">
                                {t('marketing.pricingPage.subtitle')}
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 sm:grid-cols-3">
                            {trustPoints.map((item) => (
                                <div key={item} className="rounded-[1.5rem] border border-brand-secondary/20 bg-white/70 p-6 shadow-sm backdrop-blur-xl hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/5 text-brand-primary border border-brand-primary/10 shadow-sm">
                                            <ShieldCheck className="size-6" />
                                        </div>
                                        <p className="text-base font-black text-brand-primary">{item}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-[3rem] border border-brand-primary/10 bg-white/80 p-12 text-center shadow-3xl backdrop-blur-2xl sm:p-20">
                            <div className="absolute top-0 right-0 p-8">
                                <Badge className="rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary px-4 py-2 text-[10px] font-black uppercase tracking-[0.32em] text-white shadow-lg shadow-brand-primary/20">
                                    متاح الآن
                                </Badge>
                            </div>

                            <div className="mb-12">
                                <h3 className="text-5xl font-black tracking-tight text-brand-primary sm:text-6xl">
                                    باقة النخبة
                                </h3>
                                <p className="mx-auto mt-6 max-w-xl text-lg text-brand-primary/70 leading-relaxed">
                                    نظام متكامل، فروع لا محدودة، وكل المميزات الاحترافية متاحة لك مجاناً للأبد.
                                </p>
                            </div>

                            <div className="mb-12 border-y border-brand-primary/15 py-12">
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <span className="text-[120px] font-black leading-none bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-tighter sm:text-[180px]">
                                        0
                                    </span>
                                    <span className="text-2xl font-black text-brand-secondary uppercase tracking-[0.3em]">
                                        ر.ع / للأبد
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 text-right mb-12">
                                {[
                                    'booking', 'queue', 'invoices', 'branches', 
                                    'reports', 'workers', 'customers', 'loyalty'
                                ].map((featureKey) => (
                                    <div key={featureKey} className="flex items-center justify-end gap-4 p-4 rounded-2xl bg-white border border-brand-primary/15 shadow-sm hover:border-brand-primary/30 transition-colors">
                                        <span className="text-base font-bold text-brand-primary/65">
                                            {t(`marketing.features.${featureKey}.title`)}
                                        </span>
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-sm shadow-brand-primary/20">
                                            <CheckCircle2 className="size-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                size="lg"
                                className="h-20 w-full max-w-md rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-secondary text-xl font-black text-white transition-all hover:bg-brand-primary/90 hover:scale-[1.02] shadow-2xl shadow-brand-primary/20"
                                asChild
                            >
                                <Link to="/register">{t('marketing.pricing.free.cta')}</Link>
                            </Button>
                            
                            <p className="mt-8 text-sm font-bold text-brand-primary/50 uppercase tracking-widest">
                                لا يلزم وجود بطاقة ائتمان — ابدأ فوراً
                            </p>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 px-6 py-20 lg:px-8 lg:py-32">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                        <div className="rounded-[2.5rem] border border-brand-secondary/20 bg-white/70 p-10 shadow-sm backdrop-blur-xl lg:p-14">
                            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-brand-primary shadow-sm">
                                <HelpCircle className="size-4" />
                                الأسئلة الشائعة
                            </div>
                            <h2 className="mt-8 text-4xl font-black tracking-tight text-brand-primary md:text-5xl">
                                {t('marketing.pricingPage.faqTitle')}
                            </h2>
                            <p className="mt-6 text-lg leading-relaxed text-brand-primary/70">
                                إجابات واضحة تساعدك على فهم كيف نقدم نظاماً احترافياً مجاناً بالكامل.
                            </p>
                        </div>

                        <Accordion type="single" collapsible className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <AccordionItem
                                    key={i}
                                    value={`q${i}`}
                                    className="rounded-[2rem] border border-brand-primary/10 bg-white/80 px-8 shadow-sm transition-all hover:bg-brand-primary/5"
                                >
                                    <AccordionTrigger className="py-8 text-right text-xl font-black text-brand-primary hover:no-underline data-[state=open]:text-brand-secondary">
                                        <div className="flex w-full items-center justify-end gap-4">
                                            <span>{t(`marketing.pricingPage.q${i}`)}</span>
                                            <HelpCircle className="size-6 text-brand-primary" />
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-8 text-right text-lg leading-relaxed text-brand-primary/70">
                                        {t(`marketing.pricingPage.a${i}`)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
            </main>

            <PlatformFooter />
        </div>
    );
}
