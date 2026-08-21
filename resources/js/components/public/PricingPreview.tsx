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
        <section className="py-20 bg-white" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
                    <p className="sf-kicker">باقات الأسعار</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--inst-text)]">
                        أسعار واضحة <span className="text-[var(--brand-primary)]">بالريال العماني</span>
                    </h2>
                    <p className="text-[var(--inst-muted)] leading-relaxed">
                        اختر الباقة المناسبة ثم أكمل الحجز في أقل من دقيقتين.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="h-[28rem] rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.name}
                                className={cn(
                                    'relative p-7 rounded-xl shadow-none transition-transform duration-300',
                                    plan.recommended
                                        ? 'bg-[var(--inst-teal)] text-white border-transparent lg:scale-[1.03] z-10'
                                        : 'sf-card text-[var(--inst-text)]',
                                )}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                                        <span className="px-3.5 py-1 rounded-md bg-[var(--brand-secondary)] text-white font-bold text-[11px]">
                                            الأكثر طلباً
                                        </span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div
                                        className={cn(
                                            'h-12 w-12 rounded-lg flex items-center justify-center mb-5',
                                            plan.recommended
                                                ? 'bg-white/10 text-[var(--brand-secondary)] border border-white/10'
                                                : 'bg-[var(--inst-silver)] text-[var(--brand-primary)] border border-[var(--inst-border)]',
                                        )}
                                    >
                                        <plan.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <p
                                        className={cn(
                                            'text-[13px] leading-relaxed',
                                            plan.recommended ? 'text-white/60' : 'text-[var(--inst-muted)]',
                                        )}
                                    >
                                        {plan.desc}
                                    </p>
                                </div>

                                <div className="mb-8 flex items-end gap-2">
                                    <span className="text-5xl font-bold tracking-tight leading-none">{plan.price}</span>
                                    <span
                                        className={cn(
                                            'mb-1 text-sm font-bold',
                                            plan.recommended ? 'text-[var(--brand-secondary)]' : 'text-[var(--brand-primary)]',
                                        )}
                                    >
                                        {currencyLabel}
                                    </span>
                                </div>
                                <p
                                    className={cn(
                                        'text-[11px] font-semibold mb-8 -mt-6',
                                        plan.recommended ? 'text-white/45' : 'text-[var(--inst-muted)]',
                                    )}
                                >
                                    {formatPrice(plan.price, currency)}
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-center gap-3 text-[13px] font-medium">
                                            <Check
                                                className={cn(
                                                    'h-4 w-4 shrink-0',
                                                    plan.recommended ? 'text-[var(--brand-secondary)]' : 'text-[var(--brand-primary)]',
                                                )}
                                            />
                                            <span className={plan.recommended ? 'text-white/80' : 'text-[var(--inst-text)]'}>
                                                {feat}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    asChild
                                    className={cn(
                                        'w-full h-12 rounded-lg font-bold shadow-none',
                                        plan.recommended ? 'sf-cta-accent' : 'sf-cta',
                                    )}
                                >
                                    <Link to="/book">احجز هذه الباقة</Link>
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
