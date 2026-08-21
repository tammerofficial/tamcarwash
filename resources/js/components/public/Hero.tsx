import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    formatPrice,
    getTenantBranding,
    getTenantDisplayName,
    getTenantPhone,
} from '@/hooks/useStorefront';
import type { StorefrontProfile, StorefrontService } from '@/types/api';

interface PublicHeroProps {
    profile?: StorefrontProfile | null;
    featuredService?: StorefrontService | null;
}

export function PublicHero({ profile, featuredService }: PublicHeroProps) {
    const branding = getTenantBranding(profile);
    const businessName = getTenantDisplayName(profile);
    const contactPhone = getTenantPhone(profile);
    const currency = profile?.currency ?? 'OMR';
    const announcement = branding.tagline ?? 'حجز أونلاين وتتبع مباشر لحالة الطابور';
    const about =
        branding.about ??
        `${businessName} تقدّم عناية مؤسسية للسيارات: مواد معتمدة، مواعيد دقيقة، وفروع تُدار بمعايير تشغيل واضحة.`;
    const featuredName = featuredService?.name_ar || featuredService?.name || 'تلميع نانو سيراميك';
    const featuredPrice = featuredService ? Number(featuredService.base_price) : 45;

    return (
        <section className="sf-hero relative min-h-[88vh] flex items-center pt-24 overflow-hidden" dir="rtl">
            <div className="sf-hero-grid absolute inset-0 opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8 w-full py-16 lg:py-24">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    <div className="lg:col-span-7 space-y-8">
                        <div className="inline-flex items-center gap-2.5 rounded-md border border-white/15 bg-white/8 px-3.5 py-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />
                            <span className="text-[12px] font-semibold text-white/85">{announcement}</span>
                        </div>

                        <div className="space-y-5">
                            <p className="sf-kicker sf-kicker-light">{businessName}</p>
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.2] tracking-tight">
                                معايير مؤسسية
                                <br />
                                <span className="text-[var(--brand-secondary)]">لعناية سيارتك</span>
                            </h1>
                            <p className="text-base md:text-lg text-white/72 leading-relaxed max-w-xl">
                                {about}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                            <Button size="lg" asChild className="sf-cta-accent h-12 px-7 rounded-lg text-base font-bold shadow-none">
                                <Link to="/book">
                                    <CalendarDays className="me-2 h-5 w-5" />
                                    احجز موعدك
                                </Link>
                            </Button>
                            <Button size="lg" asChild className="sf-cta-solid h-12 px-7 rounded-lg text-base font-bold shadow-none">
                                <Link to="/track">
                                    <Search className="me-2 h-5 w-5" />
                                    تتبع طلبي
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                asChild
                                className="h-12 px-7 rounded-lg text-base font-bold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)] shadow-none"
                            >
                                <Link to="/queue">
                                    <Clock3 className="me-2 h-5 w-5" />
                                    حالة الطابور
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/12 bg-white/8 max-w-xl">
                            <div className="px-4 py-4 bg-black/15">
                                <p className="text-2xl font-bold text-white">
                                    {profile?.stats?.services ?? '—'}
                                </p>
                                <p className="text-[11px] font-semibold text-white/55 mt-1">خدمة معتمدة</p>
                            </div>
                            <div className="px-4 py-4 bg-black/15">
                                <p className="text-2xl font-bold text-white">
                                    {profile?.stats?.branches ?? '—'}
                                </p>
                                <p className="text-[11px] font-semibold text-white/55 mt-1">فرع تشغيل</p>
                            </div>
                            <div className="px-4 py-4 bg-black/15">
                                <a href={`tel:${contactPhone}`} className="block">
                                    <p className="text-sm font-bold text-white leading-snug">{contactPhone}</p>
                                    <p className="text-[11px] font-semibold text-white/55 mt-1">تواصل مباشر</p>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/20">
                            <img
                                src="/images/wash/hero-car-wash.jpg"
                                alt={businessName}
                                className="w-full aspect-[4/5] object-cover opacity-90"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--inst-teal)] via-transparent to-transparent" />

                            <div className="absolute bottom-5 inset-x-5 rounded-xl bg-white p-5 shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-white shrink-0">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[var(--inst-text)] truncate">{featuredName}</p>
                                        <p className="text-sm font-semibold text-[var(--brand-primary)] mt-0.5">
                                            يبدأ من {formatPrice(featuredPrice, currency)}
                                        </p>
                                    </div>
                                    <Link
                                        to="/book"
                                        className="shrink-0 text-[13px] font-bold text-[var(--inst-teal)] hover:text-[var(--brand-primary)]"
                                    >
                                        احجز
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-white/60 text-[12px] font-medium">
                            <MapPin className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />
                            شبكة فروع تُدار بمعايير تشغيل موحّدة
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
