import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Droplets,
    FileCheck2,
    Globe,
    LayoutDashboard,
    Shield,
    ShieldCheck,
    Smartphone,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingCredits } from '@/components/marketing/MarketingCredits';
import { t } from '@/lib/i18n';
import { getAppTagline, getPlatformName } from '@/lib/branding';

export function PlatformFooter() {
    const platformName = getPlatformName();
    const brandTagline = getAppTagline() ?? 'Enterprise SaaS';
    const year = new Date().getFullYear();
    const brandI18n = { name: platformName, year };

    return (
        <footer className="relative overflow-hidden bg-white pt-20 pb-12 text-brand-primary/80 border-t border-brand-secondary/20" dir="rtl">
            {/* Subtle background glow & grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, var(--brand-primary) 1px, transparent 0)',
                    backgroundSize: '36px 36px',
                }}
            />
            <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-brand-primary/10 blur-[160px]" />
            <div className="pointer-events-none absolute left-0 bottom-0 h-[450px] w-[450px] rounded-full bg-brand-secondary/10 blur-[160px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 text-right sm:px-6 lg:px-8">
                {/* Executive Institutional Top Banner */}
                <div className="mb-20 rounded-[3rem] border border-brand-secondary/20 bg-white/80 p-10 shadow-xl backdrop-blur-xl lg:p-14">
                    <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                        <div className="space-y-8">
                            <Link to="/" className="inline-flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-xl shadow-brand-primary/20">
                                    <Droplets className="size-9 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black tracking-tighter text-brand-primary uppercase sm:text-3xl">{platformName}</span>
                                        <span className="rounded-lg bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary border border-brand-primary/20">
                                            سلطنة عُمان
                                        </span>
                                    </div>
                                    <span className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-brand-secondary">
                                        {brandTagline}
                                    </span>
                                </div>
                            </Link>

                            <p className="max-w-2xl text-base leading-relaxed text-brand-primary/70 font-medium">
                                المنصة السحابية المعتمدة لإدارة مغاسل السيارات في سلطنة عُمان. صُممت لمساعدة أصحاب المغاسل على تنظيم الحجوزات، تحسين تدفق الطوابير، وتوليد فواتير ضريبية فورية متوافقة 100% مع جهاز الضرائب العُماني.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-primary/5 px-4 py-2 text-xs font-bold text-brand-primary shadow-sm">
                                    <Smartphone className="size-4 text-icon-dark" />
                                    تطبيق جوال وويب متزامن
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-primary/5 px-4 py-2 text-xs font-bold text-brand-primary shadow-sm">
                                    <Globe className="size-4 text-icon-dark" />
                                    إدارة مركزية متعددة الفروع
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-brand-secondary/10 px-4 py-2 text-xs font-bold text-brand-primary shadow-sm">
                                    <FileCheck2 className="size-4 text-icon-dark" />
                                    جاهز لض.ق.م 5%
                                </div>
                            </div>
                        </div>

                        {/* Quick Start Card */}
                        <div className="rounded-[2.5rem] border border-brand-primary/15 bg-gradient-to-br from-white via-brand-primary/5 to-brand-secondary/10 p-8 sm:p-10 shadow-xl">
                            <div className="flex items-center justify-between border-b border-brand-primary/15 pb-8">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-secondary">
                                        ابدأ الآن
                                    </span>
                                    <h3 className="mt-2 text-lg font-black text-brand-primary sm:text-xl">ابدأ رحلتك مجاناً للأبد</h3>
                                </div>
                                <div className="marketing-icon-box-md">
                                    <Sparkles className="size-8" />
                                </div>
                            </div>

                            <p className="mt-8 text-base leading-relaxed text-brand-primary/70 font-bold">
                                سجل منشأتك الآن واحصل على كل الميزات الاحترافية مجاناً بالكامل وبدون أي عوائق.
                            </p>

                            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="h-16 flex-1 rounded-2xl bg-aquatic-gradient text-base font-black text-white shadow-xl shadow-brand-primary/20 hover:opacity-90 hover:scale-[1.03] transition-all"
                                    asChild
                                >
                                    <Link to="/register">
                                        <span>ابدأ الآن مجاناً</span>
                                        <ArrowLeft className="me-2 size-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-16 rounded-2xl border-brand-primary/25 !bg-white text-base font-bold text-brand-primary hover:!bg-brand-primary/5 transition-all"
                                    asChild
                                >
                                    <Link to="/pricing">تفاصيل الباقة</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Link Columns */}
                <div className="mb-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Column 1: Product */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <div className="marketing-icon-box-sm !size-8">
                                <LayoutDashboard className="size-4" />
                            </div>
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-primary">
                                {t('marketing.footer.product')}
                            </h4>
                        </div>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/#features" className="text-sm font-medium text-brand-primary/60 transition-colors hover:text-brand-primary">
                                    المميزات والمواصفات
                                </Link>
                            </li>
                            <li>
                                <Link to="/why-us" className="text-sm font-medium text-brand-primary/60 transition-colors hover:text-brand-primary">
                                    {t('marketing.footer.whyUsLink', brandI18n)}
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-sm font-medium text-brand-primary/60 transition-colors hover:text-brand-primary">
                                    باقات الأسعار
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-sm font-medium text-brand-primary/60 transition-colors hover:text-brand-primary">
                                    عن المنصة
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: System Capabilities */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <div className="marketing-icon-box-sm !size-8">
                                <Clock className="size-4" />
                            </div>
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-primary">
                                الحلول التشغيلية
                            </h4>
                        </div>
                        <ul className="space-y-2.5 text-sm text-brand-primary/60">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="size-3.5 text-icon-dark" />
                                إدارة الحجوزات والمواعيد
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="size-3.5 text-icon-dark" />
                                شاشة طابور ذكية للعملاء
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="size-3.5 text-icon-dark" />
                                فواتير ض.ق.م 5% معتمدة
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="size-3.5 text-icon-dark" />
                                إدارة الكاشير ومهام العمال
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Customer Portal */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <div className="marketing-icon-box-sm !size-8">
                                <Shield className="size-4" />
                            </div>
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-primary">
                                بوابات الدخول
                            </h4>
                        </div>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/login" className="text-sm font-medium text-brand-primary/60 transition-colors hover:text-brand-primary">
                                    تسجيل الدخول للمغسلة
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-sm font-medium text-brand-primary/60 transition-colors hover:text-brand-primary">
                                    تسجيل مغسلة جديدة
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-sm font-medium text-brand-primary/60 transition-colors hover:text-brand-primary">
                                    بوابة الإدارة المركزية (Landlord)
                                </Link>
                            </li>
                        </ul>
                    </div>

                        {/* Column 4: Compliance & Trust */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <div className="marketing-icon-box-sm !size-8">
                                <ShieldCheck className="size-4" />
                            </div>
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-primary">
                                الامتثال والأمان
                            </h4>
                        </div>
                        <div className="rounded-2xl border border-brand-primary/15 bg-brand-primary/5 p-4 shadow-sm">
                            <p className="text-xs font-semibold leading-relaxed text-brand-primary/70">
                                {t('marketing.footer.vatNote')}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-brand-primary">
                                <CheckCircle2 className="size-3.5 text-icon-dark" />
                                بنية سحابية مشفرة ومحمية
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright and Credits Bar */}
                <div className="flex flex-col items-center justify-between gap-6 border-t border-brand-primary/15 pt-8 text-xs font-medium text-brand-primary/50 md:flex-row">
                    <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                        <span>سلطنة عُمان • رؤية عُمان 2040</span>
                        <span className="text-brand-secondary/40">•</span>
                        <span>{t('marketing.footer.copyright', brandI18n)}</span>
                    </div>

                    <div>
                        <MarketingCredits className="text-brand-primary/40" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
