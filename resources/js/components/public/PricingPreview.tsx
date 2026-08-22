import { Link } from 'react-router-dom';
import { Check, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    formatCurrencyLabel,
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
                      `مدة الخدمة ${service.duration_minutes} دقيقة — شاملة العناية الفائقة.`,
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
        <section className="py-24 bg-white" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header */}
                <div className="mb-20 max-w-3xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 shadow-sm">
                        <Sparkles className="h-4 w-4 text-slate-900" />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">باقات فاخرة</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        أسعار واضحة وشفافة
                        <br />
                        <span className="text-slate-400">بلا مفاجآت</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        اختر الباقة المناسبة لسيارتك وأكمل الحجز في أقل من دقيقتين. دفع آمن وموثوق.
                    </p>
                </div>

                {/* Pricing Cards */}
                {isLoading ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="h-[32rem] rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 items-center">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={cn(
                                    'relative transition-all duration-500',
                                    plan.recommended ? 'lg:scale-[1.05] z-10' : ''
                                )}
                            >
                                <Card
                                    className={cn(
                                        'relative p-8 rounded-3xl shadow-sm transition-all duration-300',
                                        plan.recommended
                                            ? 'bg-slate-900 text-white border-0 shadow-xl'
                                            : 'bg-white border border-slate-200 hover:shadow-md',
                                    )}
                                >
                                    {/* Recommended badge */}
                                    {plan.recommended && (
                                        <div className="absolute -top-4 inset-x-0 flex justify-center">
                                            <span className="px-4 py-1.5 rounded-full bg-white text-slate-900 font-bold text-xs uppercase tracking-wider shadow-sm border border-slate-100">
                                                الأكثر طلباً
                                            </span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            'h-14 w-14 rounded-2xl flex items-center justify-center mb-8',
                                            plan.recommended
                                                ? 'bg-white/10 text-white'
                                                : 'bg-slate-50 text-slate-900 border border-slate-100',
                                        )}
                                    >
                                        <plan.icon className="h-7 w-7" />
                                    </div>

                                    {/* Title and Description */}
                                    <div className="mb-8">
                                        <h3 className={cn('text-2xl font-black mb-3 tracking-tight', plan.recommended ? 'text-white' : 'text-slate-900')}>
                                            {plan.name}
                                        </h3>
                                        <p
                                            className={cn(
                                                'text-sm leading-relaxed',
                                                plan.recommended ? 'text-white/70' : 'text-slate-500',
                                            )}
                                        >
                                            {plan.desc}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-8 pb-8 border-b" style={{
                                        borderColor: plan.recommended ? 'rgba(255,255,255,0.1)' : 'var(--tw-colors-slate-100)'
                                    }}>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black tracking-tight leading-none">{plan.price}</span>
                                            <span
                                                className={cn(
                                                    'text-lg font-bold',
                                                    plan.recommended ? 'text-white/80' : 'text-slate-900',
                                                )}
                                            >
                                                {currencyLabel}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <ul className="space-y-4 mb-10">
                                        {plan.features.map((feat) => (
                                            <li key={feat} className="flex items-start gap-3">
                                                <Check
                                                    className={cn(
                                                        'h-5 w-5 shrink-0 mt-0.5',
                                                        plan.recommended ? 'text-white' : 'text-slate-900',
                                                    )}
                                                />
                                                <span className={cn(
                                                    'text-sm font-medium leading-relaxed',
                                                    plan.recommended ? 'text-white/90' : 'text-slate-700'
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
                                            'w-full h-14 rounded-xl font-bold transition-all text-base shadow-sm',
                                            plan.recommended
                                                ? 'bg-white text-slate-900 hover:bg-slate-100'
                                                : 'bg-slate-900 text-white hover:bg-slate-800',
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
                <div className="mt-20 grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'سهولة الحجز', desc: 'احجز عبر الموقع في ثوان معدودة' },
                        { title: 'دفع آمن', desc: 'جميع طرق الدفع محمية وموثوقة' },
                        { title: 'ضمان الجودة', desc: 'رضا العميل هو أولويتنا الأولى' },
                    ].map((item) => (
                        <div key={item.title} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-all text-center">
                            <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
