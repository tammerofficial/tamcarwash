import { 
    Check, 
    ArrowRight, 
    Star, 
    Sparkles,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PricingPreview() {
    const plans = [
        {
            name: 'العناية الأساسية',
            price: '5',
            desc: 'مثالية للغسيل الدوري والحفاظ على نظافة السيارة اليومية.',
            features: ['غسيل خارجي شامبو', 'تنظيف إطارات', 'شفط أتربة داخلي', 'تعطير خفيف'],
            recommended: false,
            icon: Zap
        },
        {
            name: 'الحماية الفائقة',
            price: '15',
            desc: 'باقة متكاملة لحماية السيارة ولمعان يدوم طويلاً.',
            features: ['كل مميزات الأساسية', 'تلميع واكس سريع', 'تنظيف محرك', 'تعقيم مكيف', 'حماية زجاج'],
            recommended: true,
            icon: Sparkles
        },
        {
            name: 'تلميع VIP',
            price: '45',
            desc: 'خدمة فاخرة للمركبات التي تتطلب عناية فائقة وتلميع مجهري.',
            features: ['كل مميزات الفائقة', 'تلميع مجهري 3 مراحل', 'نانو سيراميك (سنة)', 'تنظيف عميق للمقاعد'],
            recommended: false,
            icon: Star
        },
    ];

    return (
        <section className="py-24 bg-white overflow-hidden" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="mb-20 text-center max-w-3xl mx-auto space-y-5">
                    <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-none font-bold text-[10px] px-4 py-1 uppercase tracking-widest">
                        Pricing Plans
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#004d4d]">
                        اختر الباقة <span className="text-teal-600">المناسبة</span>
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed opacity-80">
                        باقات متنوعة مصممة لتلبية احتياجاتك، من الغسيل السريع إلى العناية الاحترافية الشاملة.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {plans.map((plan, i) => (
                        <Card 
                            key={i} 
                            className={cn(
                                "relative p-10 rounded-2xl border transition-all duration-500 hover:-translate-y-2",
                                plan.recommended 
                                    ? "bg-[#004d4d] border-teal-800 text-white shadow-3xl lg:scale-105 z-10" 
                                    : "bg-white border-gray-100 text-gray-900 shadow-xl shadow-gray-200/50"
                            )}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-teal-500 text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-teal-900/40">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-12 text-center">
                                <div className={cn(
                                    "h-16 w-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm",
                                    plan.recommended ? "bg-white/5 text-teal-400 border border-white/10" : "bg-teal-50 text-teal-600"
                                )}>
                                    <plan.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                                <p className={cn(
                                    "text-sm leading-relaxed px-2 font-medium",
                                    plan.recommended ? "text-teal-50/40" : "text-gray-400"
                                )}>
                                    {plan.desc}
                                </p>
                            </div>

                            <div className="mb-12 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                    <span className={cn(
                                        "text-sm font-bold opacity-60",
                                        plan.recommended ? "text-teal-400" : "text-gray-400"
                                    )}>OMR</span>
                                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                                </div>
                                <p className={cn(
                                    "text-[9px] font-bold uppercase tracking-[0.2em] opacity-40",
                                    plan.recommended ? "text-teal-100/40" : "text-gray-400"
                                )}>Tax Included</p>
                            </div>

                            <ul className="space-y-4 mb-12">
                                {plan.features.map((feat, j) => (
                                    <li key={j} className="flex items-center gap-4 text-sm font-medium">
                                        <div className={cn(
                                            "h-5 w-5 rounded-lg flex items-center justify-center shrink-0 border",
                                            plan.recommended 
                                                ? "bg-teal-500/10 border-teal-500/20 text-teal-400" 
                                                : "bg-teal-50 border-teal-100 text-teal-600"
                                        )}>
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <span className={plan.recommended ? "text-teal-50/80" : "text-gray-600"}>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button 
                                className={cn(
                                    "w-full h-14 rounded-xl font-bold text-base transition-all",
                                    plan.recommended 
                                        ? "bg-teal-500 text-white hover:bg-teal-400 shadow-xl shadow-teal-900/40" 
                                        : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200"
                                )}
                            >
                                اشترك الآن
                                <ArrowRight className="ms-2 h-4 w-4 rotate-180" />
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
