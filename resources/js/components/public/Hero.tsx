import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Search, Sparkles, Zap, Droplets, Award } from 'lucide-react';
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
        `${businessName}: عناية سيارات فاخرة بمعايير دولية. تلميع احترافي، معدات حديثة، فريق متخصص.`;
    const featuredName = featuredService?.name_ar || featuredService?.name || 'تلميع نانو سيراميك';
    const featuredPrice = featuredService ? Number(featuredService.base_price) : 45;

    return (
        <section className="sf-hero relative overflow-hidden" dir="rtl">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1428] via-[#063f49] to-[#0b5f6e]" />
            
            {/* Dynamic gradient overlay */}
            <div className="absolute inset-0 opacity-60">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--brand-primary)]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[var(--brand-secondary)]/25 rounded-full blur-3xl" />
            </div>

            {/* Premium grid texture */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <div className="relative min-h-screen flex items-center pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-4 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 order-2 lg:order-1">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--brand-secondary)]/30 bg-[var(--brand-secondary)]/5 px-4 py-2 backdrop-blur-sm">
                                <Zap className="h-4 w-4 text-[var(--brand-secondary)]" />
                                <span className="text-sm font-bold text-white">{announcement}</span>
                            </div>

                            {/* Headline */}
                            <div className="space-y-4">
                                <p className="text-[var(--brand-secondary)] font-bold text-sm tracking-widest uppercase">
                                    خدمة تلميع فاخرة
                                </p>
                                <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                                    عناية
                                    <br />
                                    <span className="bg-gradient-to-r from-[var(--brand-secondary)] to-[#00d4ff] bg-clip-text text-transparent">
                                        سيارتك
                                    </span>
                                    <br />
                                    الأفضل
                                </h1>
                                <p className="text-lg text-white/70 leading-relaxed max-w-md">
                                    {about}
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Button size="lg" asChild className="sf-cta-accent h-14 px-8 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all">
                                    <Link to="/book">
                                        <CalendarDays className="me-2 h-5 w-5" />
                                        احجز الآن
                                    </Link>
                                </Button>
                                <Button size="lg" asChild className="h-14 px-8 rounded-xl text-base font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all shadow-none">
                                    <Link to="/queue">
                                        <Clock3 className="me-2 h-5 w-5" />
                                        حالة الطابور
                                    </Link>
                                </Button>
                                <Button size="lg" asChild className="h-14 px-8 rounded-xl text-base font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all shadow-none">
                                    <Link to="/track">
                                        <Search className="me-2 h-5 w-5" />
                                        تتبع
                                    </Link>
                                </Button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 pt-8">
                                <div className="p-4 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm hover:bg-white/12 transition-all">
                                    <p className="text-3xl font-black text-[var(--brand-secondary)]">
                                        {profile?.stats?.services ?? '—'}
                                    </p>
                                    <p className="text-xs font-semibold text-white/60 mt-2">خدمة متنوعة</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm hover:bg-white/12 transition-all">
                                    <p className="text-3xl font-black text-[var(--brand-secondary)]">
                                        {profile?.stats?.branches ?? '—'}
                                    </p>
                                    <p className="text-xs font-semibold text-white/60 mt-2">فروع موزعة</p>
                                </div>
                                <a href={`tel:${contactPhone}`} className="p-4 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm hover:bg-white/12 transition-all">
                                    <p className="text-lg font-black text-[var(--brand-secondary)] leading-tight">{contactPhone}</p>
                                    <p className="text-xs font-semibold text-white/60 mt-2">تواصل</p>
                                </a>
                            </div>
                        </div>

                        {/* Right Visual - Hero Image Card */}
                        <div className="order-1 lg:order-2">
                            <div className="relative group">
                                {/* Glow effect background */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-[var(--brand-secondary)]/50 to-[var(--brand-primary)]/50 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                                
                                {/* Main card */}
                                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/8 backdrop-blur-md p-1">
                                    <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
                                        <img
                                            src="/images/wash/hero-car-wash.jpg"
                                            alt={businessName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop';
                                            }}
                                        />
                                        
                                        {/* Image overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                        
                                        {/* Featured Service Card - Bottom */}
                                        <div className="absolute bottom-6 inset-x-6 rounded-xl bg-white/95 p-5 shadow-2xl backdrop-blur-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] flex items-center justify-center text-white shrink-0 shadow-lg">
                                                    <Sparkles className="h-7 w-7" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-[var(--inst-text)] truncate text-sm">{featuredName}</p>
                                                    <p className="text-xs font-semibold text-[var(--brand-secondary)] mt-1">
                                                        يبدأ من {formatPrice(featuredPrice, currency)}
                                                    </p>
                                                </div>
                                                <Button size="sm" asChild className="sf-cta-accent h-10 px-4 rounded-lg shadow-md font-bold text-xs">
                                                    <Link to="/book">احجز</Link>
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Trust badges */}
                                        <div className="absolute top-6 inset-x-6 flex gap-2 justify-end">
                                            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-1.5 text-xs font-bold text-white">
                                                <Award className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />
                                                معتمدة
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info badge below image */}
                            <div className="mt-6 flex items-center justify-center gap-2 text-white/70 text-sm font-medium">
                                <Droplets className="h-4 w-4 text-[var(--brand-secondary)]" />
                                جودة فاخرة مع ضمان كامل
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
