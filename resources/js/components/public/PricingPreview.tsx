import { Link } from 'react-router-dom';
import { Check, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    formatCurrencyLabel,
    formatPrice,
    useStorefrontProfile,
    useStorefrontServices,
} from '@/hooks/useStorefront';

const FALLBACK_PLANS = [
    {
        name: 'العناية الأساسية',
        price: 5,
        desc: 'غسيل دوري يحافظ على نظافة السيارة اليومية.',
        features: ['غسيل خارجي شامبو', 'تنظيف إطارات', 'شفط أتربة داخلي', 'تعطير خفيف'],
        recommended: false,
        icon: Zap,
    },
    {
        name: 'الحماية الفائقة',
        price: 15,
        desc: 'باقة متكاملة للحماية واللمعان الممتد.',
        features: ['كل مميزات الأساسية', 'تلميع واكس سريع', 'تنظيف محرك', 'تعقيم مكيف', 'حماية زجاج'],
        recommended: true,
        icon: Sparkles,
    },
    {
        name: 'تلميع خاص',
        price: 45,
        desc: 'عناية دقيقة للمركبات التي تتطلب تلميعاً عميقاً.',
        features: ['كل مميزات الفائقة', 'تلميع متعدد المراحل', 'نانو سيراميك', 'تنظيف عميق للمقاعد'],
        recommended: false,
        icon: Star,
    },
];

export function PricingPreview() {
    const { data: profile } = useStorefrontProfile();
    const { data: services, isLoading } = useStorefrontServices(6);
    const currency = profile?.currency ?? 'OMR';
    const currencyLabel = formatCurrencyLabel(currency);

    const plans =
        services && services.length > 0
            ? services.slice(0, 3).map((service, index) => ({
                  name: service.name_ar || service.name,
                  price: Number(service.base_price),
                  desc:
                      service.description ||
                      `مدة الخدمة ${service.duration_minutes} دقيقة — شاملة معايير التشغيل المعتمدة.`,
                  features: [
                      `المدة: ${service.duration_minutes} دقيقة`,
                      service.vat_included ? 'السعر شامل الضريبة' : 'يُضاف عليه الضريبة',
                      service.category?.name ? `التصنيف: ${service.category.name}` : 'خدمة معتمدة',
                      'حجز مسبق عبر الموقع',
                  ],
                  recommended: index === Math.min(1, services.length - 1),
                  icon: index === 1 ? Sparkles : index === 2 ? Star : Zap,
              }))
            : FALLBACK_PLANS;

    return (
        <section className="py-24 relative overflow-hidden bg-white" dir="rtl">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/3 w-96 h-96 bg-[var(--brand-primary)]/8 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[var(--brand-secondary)]/8 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header */}
                <div className="mb-16 max-w-3xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-secondary)]/10 border border-[var(--brand-secondary)]/20">
                        <Sparkles className="h-4 w-4 text-[var(--brand-secondary)]" />
                        <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">باقات فاخرة</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-[var(--inst-text)]">
                        أسعار واضحة وشفافة
                        <br />
                        <span className="bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] bg-clip-text text-transparent">بلا مفاجآت</span>
                    </h2>
                    <p className="text-lg text-[var(--inst-muted)] leading-relaxed max-w-2xl mx-auto">
                        اختر الباقة المناسبة لسيارتك وأكمل الحجز في أقل من دقيقتين. دفع آمن وموثوق.
                    </p>
                </div>

                {/* Pricing Cards */}
                {isLoading ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="h-[32rem] rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={cn(
                                    'relative rounded-2xl transition-all duration-500 group',
                                    plan.recommended ? 'lg:scale-[1.06] z-10' : ''
                                )}
                            >
                                {/* Glow effect for recommended */}
                                {plan.recommended && (
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--brand-secondary)]/50 to-[var(--brand-primary)]/50 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                )}

                                <Card
                                    className={cn(
                                        'relative p-8 rounded-2xl shadow-none transition-all duration-300',
                                        plan.recommended
                                            ? 'bg-gradient-to-br from-[var(--inst-teal)] to-[#064a5a] text-white border-0'
                                            : 'bg-white border border-[var(--inst-border)] hover:shadow-xl hover:border-[var(--brand-primary)]/30',
                                    )}
                                >
                                    {/* Recommended badge */}
                                    {plan.recommended && (
                                        <div className="absolute -top-4 inset-x-0 flex justify-center">
                                            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--brand-secondary)] to-[#00d4ff] text-white font-black text-xs uppercase tracking-wider shadow-lg">
                                                الأكثر شهرة
                                            </span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            'h-14 w-14 rounded-xl flex items-center justify-center mb-6 transition-all',
                                            plan.recommended
                                                ? 'bg-white/10 text-[var(--brand-secondary)] border border-white/20 backdrop-blur-sm'
                                                : 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20',
                                        )}
                                    >
                                        <plan.icon className="h-7 w-7" />
                                    </div>

                                    {/* Title and Description */}
                                    <div className="mb-8">
                                        <h3 className={cn('text-2xl font-black mb-3', plan.recommended ? 'text-white' : 'text-[var(--inst-text)]')}>
                                            {plan.name}
                                        </h3>
                                        <p
                                            className={cn(
                                                'text-sm leading-relaxed',
                                                plan.recommended ? 'text-white/70' : 'text-[var(--inst-muted)]',
                                            )}
                                        >
                                            {plan.desc}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-8 pb-8 border-b" style={{
                                        borderColor: plan.recommended ? 'rgba(255,255,255,0.1)' : 'var(--inst-border)'
                                    }}>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black tracking-tight leading-none">{plan.price}</span>
                                            <span
                                                className={cn(
                                                    'text-lg font-bold',
                                                    plan.recommended ? 'text-[var(--brand-secondary)]' : 'text-[var(--brand-primary)]',
                                                )}
                                            >
                                                {currencyLabel}
                                            </span>
                                        </div>
                                        <p
                                            className={cn(
                                                'text-xs font-semibold mt-2',
                                                plan.recommended ? 'text-white/50' : 'text-[var(--inst-muted)]',
                                            )}
                                        >
                                            {formatPrice(plan.price, currency)}
                                        </p>
                                    </div>

                                    {/* Features List */}
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feat) => (
                                            <li key={feat} className="flex items-start gap-3">
                                                <Check
                                                    className={cn(
                                                        'h-5 w-5 shrink-0 mt-0.5',
                                                        plan.recommended ? 'text-[var(--brand-secondary)]' : 'text-[var(--brand-secondary)]',
                                                    )}
                                                />
                                                <span className={cn(
                                                    'text-sm font-medium leading-relaxed',
                                                    plan.recommended ? 'text-white/90' : 'text-[var(--inst-text)]'
                                                )}>
                                                    {feat}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <Button
                                        asChild
                                        className={cn(
                                            'w-full h-12 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base',
                                            plan.recommended
                                                ? 'sf-cta-accent bg-gradient-to-r from-[var(--brand-secondary)] to-[#00d4ff]'
                                                : 'sf-cta bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)]',
                                        )}
                                    >
                                        <Link to="/book">احجز الآن</Link>
                                    </Button>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info section below */}
                <div className="mt-16 grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'سهولة الحجز', desc: 'احجز عبر الموقع في ثوان معدودة' },
                        { title: 'دفع آمن', desc: 'جميع طرق الدفع محمية وموثوقة' },
                        { title: 'ضمان الجودة', desc: 'رضا العميل هو أولويتنا الأولى' },
                    ].map((item) => (
                        <div key={item.title} className="p-6 rounded-xl bg-[var(--inst-silver)] border border-[var(--inst-border)] hover:shadow-md transition-all text-center">
                            <h4 className="font-black text-[var(--inst-text)] mb-2">{item.title}</h4>
                            <p className="text-sm text-[var(--inst-muted)]">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
