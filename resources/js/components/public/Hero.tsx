import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Search, Sparkles, Droplets, Award } from 'lucide-react';
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
    const announcement = branding.tagline ?? 'حجز أونلاين + تتبع فوري + حالة طابور مباشرة';
    const about =
        branding.about ??
        `${businessName}: عناية سيارات فاخرة بجودة عالمية. تلميع احترافي، معدات حديثة، فريق متخصص.`;
    const featuredName = featuredService?.name_ar || featuredService?.name || 'تلميع نانو سيراميك';
    const featuredPrice = featuredService ? Number(featuredService.base_price) : 45;

    return (
        <section className="relative overflow-hidden bg-brand-primary/[0.02]" dir="rtl">
            <div className="relative min-h-screen flex items-center pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-4 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 order-2 lg:order-1">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-primary/10 bg-brand-primary/5 px-4 py-2 shadow-sm">
                                <Sparkles className="h-4 w-4 text-brand-primary" />
                                <span className="text-sm font-bold text-brand-primary">{announcement}</span>
                            </div>

                            {/* Headline */}
                            <div className="space-y-4">
                                <p className="text-brand-primary/60 font-bold text-sm tracking-widest uppercase">
                                    خدمة تلميع فاخرة
                                </p>
                                <h1 className="text-5xl md:text-7xl font-black text-brand-primary-dark leading-[1.1] tracking-tight">
                                    عناية
                                    <br />
                                    <span className="text-brand-primary/30">
                                        سيارتك
                                    </span>
                                    <br />
                                    الأفضل
                                </h1>
                                <p className="text-lg text-brand-primary/70 leading-relaxed max-w-md">
                                    {about}
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Button size="lg" asChild className="h-14 px-8 rounded-xl text-base font-bold bg-brand-primary text-white hover:bg-brand-primary-dark transition-all shadow-md shadow-brand-primary/20">
                                    <Link to="/book">
                                        <CalendarDays className="me-2 h-5 w-5" />
                                        احجز الآن
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-xl text-base font-bold border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 transition-all shadow-sm bg-white">
                                    <Link to="/queue">
                                        <Clock3 className="me-2 h-5 w-5" />
                                        حالة الطابور
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-xl text-base font-bold border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 transition-all shadow-sm bg-white">
                                    <Link to="/track">
                                        <Search className="me-2 h-5 w-5" />
                                        تتبع
                                    </Link>
                                </Button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 pt-8">
                                <div className="p-4 rounded-xl bg-white border border-brand-primary/10 shadow-sm">
                                    <p className="text-3xl font-black text-brand-primary-dark">
                                        {profile?.stats?.services ?? '—'}
                                    </p>
                                    <p className="text-xs font-semibold text-brand-primary/50 mt-2">خدمة متنوعة</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white border border-brand-primary/10 shadow-sm">
                                    <p className="text-3xl font-black text-brand-primary-dark">
                                        {profile?.stats?.branches ?? '—'}
                                    </p>
                                    <p className="text-xs font-semibold text-brand-primary/50 mt-2">فروع موزعة</p>
                                </div>
                                <a href={`tel:${contactPhone}`} className="p-4 rounded-xl bg-white border border-brand-primary/10 shadow-sm hover:bg-brand-primary/5 transition-colors group">
                                    <p className="text-lg font-black text-brand-primary-dark leading-tight group-hover:text-brand-primary">{contactPhone}</p>
                                    <p className="text-xs font-semibold text-brand-primary/50 mt-2">تواصل</p>
                                </a>
                            </div>
                        </div>

                        {/* Right Visual - Hero Image Card */}
                        <div className="order-1 lg:order-2">
                            <div className="relative group">
                                {/* Main card */}
                                <div className="relative overflow-hidden rounded-3xl border border-brand-primary/10 bg-white p-2 shadow-xl shadow-brand-primary/5">
                                    <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                                        <img
                                            src="/images/wash/hero-car-wash.jpg"
                                            alt={businessName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop';
                                            }}
                                        />
                                        
                                        {/* Image overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary-dark/40 via-transparent to-transparent" />
                                        
                                        {/* Featured Service Card - Bottom */}
                                        <div className="absolute bottom-6 inset-x-6 rounded-xl bg-white/95 p-5 shadow-lg backdrop-blur-sm border border-brand-primary/10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                                                    <Sparkles className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-brand-primary-dark truncate text-sm">{featuredName}</p>
                                                    <p className="text-xs font-semibold text-brand-primary/60 mt-1">
                                                        يبدأ من {formatPrice(featuredPrice, currency)}
                                                    </p>
                                                </div>
                                                <Button size="sm" asChild className="bg-brand-primary text-white hover:bg-brand-primary-dark h-10 px-5 rounded-lg shadow-sm font-bold text-xs">
                                                    <Link to="/book">احجز</Link>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Trust badges */}
                                        <div className="absolute top-6 inset-x-6 flex gap-2 justify-end">
                                            <div className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-brand-primary/10 flex items-center gap-1.5 text-xs font-bold text-brand-primary-dark shadow-sm">
                                                <Award className="h-3.5 w-3.5 text-brand-primary" />
                                                معتمدة
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info badge below image */}
                            <div className="mt-6 flex items-center justify-center gap-2 text-brand-primary/60 text-sm font-medium">
                                <Droplets className="h-4 w-4 text-brand-primary" />
                                جودة فاخرة مع ضمان كامل
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
