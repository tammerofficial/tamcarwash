import { useStorefrontProfile } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { BookingWidget } from '@/components/public/BookingWidget';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Info } from 'lucide-react';

export function BookingPage() {
    const { data: profile } = useStorefrontProfile();

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <PublicHeader profile={profile} />

            <main className="pt-40 pb-32">
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-16 items-start">
                        <div className="lg:col-span-1 space-y-10 lg:sticky lg:top-40">
                            <div className="space-y-6">
                                <Badge className="bg-teal-50 text-teal-700 border-none font-bold text-[10px] px-4 py-1 uppercase tracking-[0.2em]">
                                    Direct Booking
                                </Badge>
                                <h1 className="text-4xl md:text-5xl font-bold text-[#004d4d] leading-[1.2]">
                                    احجز موعد <br />
                                    <span className="text-teal-600 font-black">تألق سيارتك</span>
                                </h1>
                                <p className="text-gray-500 text-lg leading-relaxed opacity-80">
                                    نظام الحجز الذكي يضمن لك الأولوية في الخدمة وتوفير وقتك الثمين.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: ShieldCheck, title: 'تأكيد فوري', desc: 'ستصلك رسالة نصية فور تأكيد حجزك.' },
                                    { icon: Info, title: 'تعديل مرن', desc: 'يمكنك تعديل أو إلغاء حجزك قبل 3 ساعات.' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                        <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-teal-600">
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{item.desc}</p>
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
