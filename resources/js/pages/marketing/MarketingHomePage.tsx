import { Link } from 'react-router-dom';
import {
    BarChart3,
    Building2,
    CalendarDays,
    Car,
    Check,
    Droplets,
    ListOrdered,
    Receipt,
    Shield,
    Sparkles,
    Star,
    Users,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const featureIcons = {
    booking: CalendarDays,
    queue: ListOrdered,
    invoices: Receipt,
    branches: Building2,
    customers: Users,
    reports: BarChart3,
    workers: Shield,
    multiTenant: Zap,
} as const;

const featureKeys = [
    'booking',
    'queue',
    'invoices',
    'branches',
    'customers',
    'reports',
    'workers',
    'multiTenant',
] as const;

const stepNumbers = ['1', '2', '3'] as const;

const pricingPlans = ['starter', 'pro', 'enterprise'] as const;

const testimonialKeys = ['t1', 't2', 't3'] as const;

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function MarketingHomePage() {
    const year = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                            <Droplets className="size-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">{t('marketing.brand')}</span>
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        <button
                            type="button"
                            onClick={() => scrollTo('features')}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {t('marketing.nav.features')}
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('pricing')}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {t('marketing.nav.pricing')}
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollTo('about')}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {t('marketing.nav.about')}
                        </button>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/login">{t('marketing.nav.login')}</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link to="/login">{t('marketing.nav.getStarted')}</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(var(--primary) / 0.18), transparent), radial-gradient(ellipse 50% 40% at 90% 20%, hsl(var(--chart-2) / 0.12), transparent)',
                        }}
                    />
                    <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
                        <div className="space-y-8">
                            <Badge
                                variant="secondary"
                                className="border border-primary/20 bg-accent px-3 py-1 text-accent-foreground"
                            >
                                <Sparkles className="me-1.5 size-3.5" />
                                {t('marketing.hero.badge')}
                            </Badge>

                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
                                    {t('marketing.hero.title')}
                                </h1>
                                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                                    {t('marketing.hero.subtitle')}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button size="lg" className="shadow-lg shadow-primary/20" asChild>
                                    <Link to="/login">{t('marketing.hero.ctaPrimary')}</Link>
                                </Button>
                                <Button size="lg" variant="outline" onClick={() => scrollTo('features')}>
                                    {t('marketing.hero.ctaSecondary')}
                                </Button>
                            </div>
                        </div>

                        {/* Hero visual */}
                        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-chart-2/20 blur-2xl" />
                            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl">
                                <div className="border-b border-border bg-muted/50 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2.5 rounded-full bg-destructive/70" />
                                        <div className="size-2.5 rounded-full bg-chart-3/70" />
                                        <div className="size-2.5 rounded-full bg-chart-2/70" />
                                        <span className="ms-2 text-xs text-muted-foreground">
                                            {t('marketing.brand')} — لوحة التحكم
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4 p-6">
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'طلبات اليوم', value: '127' },
                                            { label: 'في الطابور', value: '8' },
                                            { label: 'الإيرادات', value: '1,240 ر.ع' },
                                        ].map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="rounded-xl border border-border bg-background p-3 text-center"
                                            >
                                                <p className="text-lg font-bold text-primary">{stat.value}</p>
                                                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                                            >
                                                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Car className="size-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-2 w-24 rounded bg-muted" />
                                                    <div className="mt-1.5 h-1.5 w-16 rounded bg-muted/70" />
                                                </div>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    #{100 + i}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats bar */}
                <section className="border-y border-border bg-muted/40">
                    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
                        {[
                            { value: t('marketing.stats.orders'), label: t('marketing.stats.ordersLabel') },
                            { value: t('marketing.stats.vat'), label: t('marketing.stats.vatLabel') },
                            { value: t('marketing.stats.branches'), label: t('marketing.stats.branchesLabel') },
                            { value: t('marketing.stats.tenants'), label: t('marketing.stats.tenantsLabel') },
                        ].map((stat) => (
                            <div key={stat.value} className="text-center">
                                <p className="text-xl font-bold text-primary sm:text-2xl">{stat.value}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                    <div className="mx-auto mb-14 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {t('marketing.features.title')}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">{t('marketing.features.subtitle')}</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featureKeys.map((key) => {
                            const Icon = featureIcons[key];
                            return (
                                <Card
                                    key={key}
                                    className="group border-border/80 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                            <Icon className="size-5" />
                                        </div>
                                        <CardTitle className="text-base">
                                            {t(`marketing.features.${key}.title`)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-sm leading-relaxed">
                                            {t(`marketing.features.${key}.description`)}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* How it works */}
                <section id="about" className="bg-muted/30 py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="mx-auto mb-14 max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                {t('marketing.howItWorks.title')}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                {t('marketing.howItWorks.subtitle')}
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {stepNumbers.map((step, index) => (
                                <div key={step} className="relative text-center">
                                    {index < 2 && (
                                        <div className="absolute top-8 hidden h-0.5 w-full bg-gradient-to-l from-primary/40 to-transparent md:block md:w-[calc(100%+2rem)] md:-start-[calc(50%+2rem)]" />
                                    )}
                                    <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
                                        {step}
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">
                                        {t(`marketing.howItWorks.step${step}.title`)}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {t(`marketing.howItWorks.step${step}.description`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                    <div className="mx-auto mb-14 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {t('marketing.pricing.title')}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">{t('marketing.pricing.subtitle')}</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {pricingPlans.map((plan) => {
                            const isPro = plan === 'pro';
                            return (
                                <Card
                                    key={plan}
                                    className={cn(
                                        'relative flex flex-col',
                                        isPro && 'border-primary shadow-xl shadow-primary/10 lg:scale-105',
                                    )}
                                >
                                    {isPro && (
                                        <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 px-3">
                                            {t('marketing.pricing.pro.badge')}
                                        </Badge>
                                    )}
                                    <CardHeader>
                                        <CardTitle>{t(`marketing.pricing.${plan}.name`)}</CardTitle>
                                        <CardDescription>{t(`marketing.pricing.${plan}.description`)}</CardDescription>
                                        <div className="pt-4">
                                            <span className="text-4xl font-bold">
                                                {t(`marketing.pricing.${plan}.price`)}
                                            </span>
                                            <span className="ms-1 text-sm text-muted-foreground">
                                                {t(`marketing.pricing.${plan}.period`)}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                {t(`marketing.features.${plan === 'starter' ? 'booking' : plan === 'pro' ? 'branches' : 'multiTenant'}.title`)}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                {t('marketing.features.invoices.title')}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="size-4 text-primary" />
                                                {t('marketing.features.reports.title')}
                                            </li>
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" variant={isPro ? 'default' : 'outline'} asChild>
                                            <Link to="/login">{t(`marketing.pricing.${plan}.cta`)}</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* Testimonials */}
                <section className="bg-muted/30 py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="mx-auto mb-14 max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                {t('marketing.testimonials.title')}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                {t('marketing.testimonials.subtitle')}
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {testimonialKeys.map((key) => (
                                <Card key={key} className="border-border/80">
                                    <CardContent className="pt-6">
                                        <div className="mb-4 flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className="size-4 fill-chart-3 text-chart-3" />
                                            ))}
                                        </div>
                                        <p className="mb-6 text-sm leading-relaxed">
                                            &ldquo;{t(`marketing.testimonials.${key}.quote`)}&rdquo;
                                        </p>
                                        <div>
                                            <p className="font-semibold">{t(`marketing.testimonials.${key}.author`)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {t(`marketing.testimonials.${key}.business`)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('marketing.faq.title')}</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        {faqKeys.map((key) => (
                            <AccordionItem key={key} value={key}>
                                <AccordionTrigger className="text-base">
                                    {t(`marketing.faq.${key}.question`)}
                                </AccordionTrigger>
                                <AccordionContent>{t(`marketing.faq.${key}.answer`)}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </section>

                {/* CTA banner */}
                <section className="mx-4 mb-20 sm:mx-6">
                    <div
                        className="mx-auto max-w-6xl overflow-hidden rounded-2xl px-6 py-16 text-center shadow-2xl sm:px-12"
                        style={{
                            background:
                                'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 50%, hsl(var(--chart-2)) 100%)',
                        }}
                    >
                        <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                            {t('marketing.cta.title')}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
                            {t('marketing.cta.subtitle')}
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="mt-8 shadow-lg"
                            asChild
                        >
                            <Link to="/login">{t('marketing.cta.button')}</Link>
                        </Button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-muted/20">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-1">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Droplets className="size-4" />
                                </div>
                                <span className="font-bold">{t('marketing.brand')}</span>
                            </Link>
                            <p className="mt-3 text-sm text-muted-foreground">{t('marketing.footer.tagline')}</p>
                        </div>

                        <div>
                            <h4 className="mb-3 text-sm font-semibold">{t('marketing.footer.product')}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <button type="button" onClick={() => scrollTo('features')} className="hover:text-foreground">
                                        {t('marketing.nav.features')}
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => scrollTo('pricing')} className="hover:text-foreground">
                                        {t('marketing.nav.pricing')}
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-3 text-sm font-semibold">{t('marketing.footer.company')}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <button type="button" onClick={() => scrollTo('about')} className="hover:text-foreground">
                                        {t('marketing.nav.about')}
                                    </button>
                                </li>
                                <li>
                                    <Link to="/login" className="hover:text-foreground">
                                        {t('marketing.nav.login')}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-3 text-sm font-semibold">{t('marketing.footer.legal')}</h4>
                            <p className="text-sm text-muted-foreground">{t('marketing.footer.vatNote')}</p>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    <p className="text-center text-sm text-muted-foreground">
                        {t('marketing.footer.copyright').replace('{year}', String(year))}
                    </p>
                </div>
            </footer>
        </div>
    );
}
