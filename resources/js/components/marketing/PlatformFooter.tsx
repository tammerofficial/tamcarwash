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
        <footer className="relative overflow-hidden bg-slate-950 pt-20 pb-12 text-white" dir="rtl">
            {/* Subtle background glow & grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '36px 36px',
                }}
            />
            <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#0A4B78]/30 blur-[160px]" />
            <div className="pointer-events-none absolute left-0 bottom-0 h-[450px] w-[450px] rounded-full bg-sky-500/15 blur-[160px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 text-right sm:px-6 lg:px-8">
                {/* Executive Institutional Top Banner */}
                <div className="mb-20 rounded-[3rem] border-2 border-slate-800 bg-slate-900/90 p-10 shadow-2xl backdrop-blur-2xl lg:p-14">
                    <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                        <div className="space-y-8">
                            <Link to="/" className="inline-flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#0A4B78] to-[#0284c7] text-white shadow-2xl shadow-sky-950/50">
                                    <Droplets className="size-9 text-sky-200" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-black tracking-tighter text-white uppercase">{platformName}</span>
                                        <span className="rounded-lg bg-sky-500/20 px-3 py-1 text-[11px] font-black text-sky-300 border border-sky-500/30">
                                            سلطنة عُمان
                                        </span>
                                    </div>
                                    <span className="mt-1 text-[12px] font-black uppercase tracking-[0.3em] text-sky-400 opacity-80">
                                        {brandTagline}
                                    </span>
                                </div>
                            </Link>

                            <p className="max-w-2xl text-lg leading-relaxed text-slate-300 font-medium">
                                المنصة السحابية المعتمدة لإدارة مغاسل السيارات في سلطنة عُمان. صُممت لمساعدة أصحاب المغاسل على تنظيم الحجوزات، تحسين تدفق الطوابير، وتوليد فواتير ضريبية فورية متوافقة 100% مع جهاز الضرائب العُماني.
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-[12px] font-black text-slate-200 shadow-sm">
                                    <Smartphone className="size-4 text-sky-400" />
                                    تطبيق جوال وويب متزامن
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-[12px] font-black text-slate-200 shadow-sm">
                                    <Globe className="size-4 text-sky-400" />
                                    إدارة مركزية متعددة الفروع
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-[12px] font-black text-slate-200 shadow-sm">
                                    <FileCheck2 className="size-4 text-emerald-400" />
                                    جاهز لض.ق.م 5%
                                </div>
                            </div>
                        </div>

                        {/* Quick Start Card */}
                        <div className="rounded-[2.5rem] border-2 border-sky-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-8 sm:p-10 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                                <div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-400">
                                        ابدأ الآن
                                    </span>
                                    <h3 className="mt-2 text-2xl font-black text-white">ابدأ تجربة الـ 14 يوماً مجاناً</h3>
                                </div>
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-inner">
                                    <Sparkles className="size-7 animate-pulse" />
                                </div>
                            </div>

                            <p className="mt-6 text-sm leading-relaxed text-slate-400 font-bold">
                                حسابك يُفعَّل فوراً مع جميع الميزات: الطابور المباشر، الفواتير، ونظام الولاء المتقدم.
                            </p>

                            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="h-14 flex-1 rounded-[1.25rem] bg-gradient-to-r from-sky-500 to-[#0284c7] font-black text-white shadow-2xl shadow-sky-950/40 hover:from-sky-400 hover:to-sky-600 hover:scale-[1.03] transition-all text-base"
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
                                    className="h-14 rounded-[1.25rem] border-2 border-slate-700 bg-slate-800/50 text-base font-black text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
                                    asChild
                                >
                                    <Link to="/pricing">الباقات</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Link Columns */}
                <div className="mb-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Column 1: Product */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sky-400">
                            <LayoutDashboard className="size-4" />
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                                {t('marketing.footer.product')}
                            </h4>
                        </div>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/#features" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                                    المميزات والمواصفات
                                </Link>
                            </li>
                            <li>
                                <Link to="/why-us" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                                    لماذا تمير واش؟
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                                    باقات الأسعار
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                                    عن المنصة
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: System Capabilities */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sky-400">
                            <Clock className="size-4" />
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                                الحلول التشغيلية
                            </h4>
                        </div>
                        <ul className="space-y-2.5 text-sm text-slate-400">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="size-3.5 text-sky-500" />
                                إدارة الحجوزات والمواعيد
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="size-3.5 text-sky-500" />
                                شاشة طابور ذكية للعملاء
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="size-3.5 text-sky-500" />
                                فواتير ض.ق.م 5% معتمدة
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="size-3.5 text-sky-500" />
                                إدارة الكاشير ومهام العمال
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Customer Portal */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sky-400">
                            <Shield className="size-4" />
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                                بوابات الدخول
                            </h4>
                        </div>
                        <ul className="space-y-2.5">
                            <li>
                                <Link to="/login" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                                    تسجيل الدخول للمغسلة
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                                    تسجيل مغسلة جديدة
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                                    بوابة الإدارة المركزية (Landlord)
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Compliance & Trust */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <ShieldCheck className="size-4" />
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                                الامتثال والأمان
                            </h4>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                            <p className="text-xs font-semibold leading-relaxed text-slate-300">
                                {t('marketing.footer.vatNote')}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-400">
                                <CheckCircle2 className="size-3.5" />
                                بنية سحابية مشفرة ومحمية
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright and Credits Bar */}
                <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-800/80 pt-8 text-xs font-medium text-slate-400 md:flex-row">
                    <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                        <span>سلطنة عُمان • رؤية عُمان 2040</span>
                        <span className="text-slate-700">•</span>
                        <span>{t('marketing.footer.copyright', brandI18n)}</span>
                    </div>

                    <div>
                        <MarketingCredits className="text-slate-400" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

