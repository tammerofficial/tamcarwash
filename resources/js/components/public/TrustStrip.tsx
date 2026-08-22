import { Award, Clock, CreditCard, ShieldCheck } from 'lucide-react';

const ITEMS = [
    { icon: ShieldCheck, label: 'ضمان الجودة', sub: 'مواد فائقة وعناية دقيقة' },
    { icon: CreditCard, label: 'دفع آمن', sub: 'خيارات دفع رقمية ونقدية' },
    { icon: Clock, label: 'دقة المواعيد', sub: 'حجز مسبق وتتبع للطابور' },
    { icon: Award, label: 'خبرة واحترافية', sub: 'فريق متخصص في عناية السيارات' },
];

export function TrustStrip() {
    return (
        <section className="bg-white border-y border-slate-200 py-12" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {ITEMS.map((item) => (
                        <div key={item.label} className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-[15px]">{item.label}</h3>
                                <p className="text-[13px] font-medium text-slate-500 mt-1 leading-relaxed">
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
