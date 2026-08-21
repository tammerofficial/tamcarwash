import { Award, Clock, CreditCard, ShieldCheck } from 'lucide-react';

const ITEMS = [
    { icon: ShieldCheck, label: 'ضمان الجودة', sub: 'مواد معتمدة ومعايير تشغيل واضحة' },
    { icon: CreditCard, label: 'دفع آمن', sub: 'خيارات دفع رقمية ونقدية' },
    { icon: Clock, label: 'دقة المواعيد', sub: 'حجز مسبق وتتبع للطابور' },
    { icon: Award, label: 'خبرة تشغيل', sub: 'فريق متخصص في عناية السيارات' },
];

export function TrustStrip() {
    return (
        <section className="bg-white border-y border-[var(--inst-border)] py-10" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {ITEMS.map((item) => (
                        <div key={item.label} className="flex items-start gap-3.5">
                            <div className="h-11 w-11 rounded-lg bg-[var(--inst-silver)] border border-[var(--inst-border)] flex items-center justify-center text-[var(--brand-primary)] shrink-0">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[var(--inst-text)] text-[15px]">{item.label}</h3>
                                <p className="text-[12px] font-medium text-[var(--inst-muted)] mt-0.5 leading-relaxed">
                                    {item.sub}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
