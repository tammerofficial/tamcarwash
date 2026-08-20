import { 
    ShieldCheck, 
    CreditCard, 
    Clock, 
    Award
} from 'lucide-react';

export function TrustStrip() {
    return (
        <section className="bg-white py-16 border-y border-gray-100" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { icon: ShieldCheck, label: 'ضمان الجودة', sub: 'German Standard Materials' },
                        { icon: CreditCard, label: 'دفع آمن', sub: 'Secure Digital Payments' },
                        { icon: Clock, label: 'دقة المواعيد', sub: 'On-time Every Time' },
                        { icon: Award, label: 'خبرة واسعة', sub: 'Over 10 Years Experience' },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center md:flex-row md:items-start gap-5 text-center md:text-start group">
                            <div className="h-14 w-14 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 transition-all duration-500 group-hover:bg-teal-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-teal-900/20 border border-teal-100/50">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-base mb-1 group-hover:text-teal-600 transition-colors">{item.label}</h4>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
