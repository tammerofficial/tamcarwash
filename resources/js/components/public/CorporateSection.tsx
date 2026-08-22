import { Link } from 'react-router-dom';
import { Building2, FileText, Handshake, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function CorporateSection() {
    return (
        <section className="py-24 bg-slate-900" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <p className="text-sm font-bold tracking-widest uppercase text-slate-400">حلول الأساطيل</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.25] tracking-tight">
                            عقود تشغيل واضحة
                            <br />
                            <span className="text-slate-400">لأساطيل الشركات</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                            خدمات مخصصة للشركات والجهات الحكومية: مواعيد ثابتة، تقارير استهلاك، وفواتير ضريبية جاهزة للمحاسبة.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                { icon: Handshake, title: 'عقود مرنة', desc: 'باقات شهرية وسنوية حسب حجم الأسطول.' },
                                { icon: TrendingUp, title: 'تقارير دورية', desc: 'متابعة الاستهلاك والمصروف التشغيلي.' },
                                { icon: Users, title: 'فريق متخصص', desc: 'فنيون مدرَّبون على مختلف أنواع المركبات.' },
                                { icon: FileText, title: 'فواتير ضريبية', desc: 'مستندات محاسبية تدعم ضريبة القيمة المضافة.' },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                        <item.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                        <p className="text-slate-400 text-[13px] leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-8 rounded-xl font-bold shadow-sm transition-all">
                                <Link to="/book">اطلب عرض سعر</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="border-slate-700 text-white hover:bg-slate-800 hover:text-white h-14 px-8 rounded-xl font-bold transition-all bg-transparent">
                                <Link to="/services">استعرض الخدمات</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
                            <img
                                src="/images/wash/premium-car.jpg"
                                alt="عناية أساطيل الشركات"
                                className="w-full aspect-[4/3] object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=1000&auto=format&fit=crop';
                                }}
                            />
                        </div>

                        <Card className="absolute -bottom-6 start-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-xl hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900">عقود أساطيل</p>
                                    <p className="text-sm font-semibold text-slate-500">فوترة مؤسسية منتظمة</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
