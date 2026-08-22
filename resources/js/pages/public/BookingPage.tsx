import { useStorefrontProfile } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { BookingWidget } from '@/components/public/BookingWidget';
import { ShieldCheck, Info } from 'lucide-react';

export function BookingPage() {
    const { data: profile } = useStorefrontProfile();

    return (
        <div className="sf-shell min-h-screen" dir="rtl">
            <PublicHeader profile={profile} />

            <main className="pt-28 pb-20">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
                            <div className="space-y-4">
                                <p className="sf-kicker">الحجز المباشر</p>
                                <h1 className="text-3xl md:text-4xl font-bold text-[var(--inst-text)] leading-[1.25]">
                                    احجز موعد
                                    <br />
                                    <span className="text-[var(--brand-primary)]">عناية سيارتك</span>
                                </h1>
                                <p className="text-[var(--inst-muted)] leading-relaxed">
                                    أكمل الحجز في خطوات واضحة: الفرع، الخدمة، ثم الموعد.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: ShieldCheck, title: 'تأكيد فوري', desc: 'ستصلك رسالة نصية فور تأكيد حجزك.' },
                                    { icon: Info, title: 'تعديل مرن', desc: 'يمكنك تعديل أو إلغاء حجزك قبل 3 ساعات.' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white shadow-sm border border-brand-primary/5 transition-all hover:shadow-md">
                                        <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-primary-dark mb-1">{item.title}</h4>
                                            <p className="text-[11px] text-brand-primary/40 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <BookingWidget />
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter profile={profile} />
        </div>
    );
}
