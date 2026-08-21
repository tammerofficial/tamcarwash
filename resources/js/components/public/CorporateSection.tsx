import { Link } from 'react-router-dom';
import { Building2, FileText, Handshake, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function CorporateSection() {
    return (
        <section className="sf-hero py-20 relative overflow-hidden" dir="rtl">
            <div className="sf-hero-grid absolute inset-0 opacity-30" />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-14 items-center">
                    <div className="space-y-8">
                        <p className="sf-kicker sf-kicker-light">حلول الأساطيل</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.25]">
                            عقود تشغيل واضحة
                            <br />
                            <span className="text-[var(--brand-secondary)]">لأساطيل الشركات</span>
                        </h2>
                        <p className="text-base text-white/70 leading-relaxed max-w-xl">
                            خدمة مؤسسية للشركات والجهات الحكومية: مواعيد ثابتة، تقارير استهلاك، وفواتير ضريبية جاهزة للمحاسبة.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-5">
                            {[
                                { icon: Handshake, title: 'عقود مرنة', desc: 'باقات شهرية وسنوية حسب حجم الأسطول.' },
                                { icon: TrendingUp, title: 'تقارير دورية', desc: 'متابعة الاستهلاك والمصروف التشغيلي.' },
                                { icon: Users, title: 'فريق متخصص', desc: 'فنيون مدرَّبون على مختلف أنواع المركبات.' },
                                { icon: FileText, title: 'فواتير ضريبية', desc: 'مستندات محاسبية تدعم ضريبة القيمة المضافة.' },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-3.5">
                                    <div className="h-11 w-11 rounded-lg bg-white/8 flex items-center justify-center shrink-0 border border-white/10">
                                        <item.icon className="h-5 w-5 text-[var(--brand-secondary)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                        <p className="text-white/50 text-[13px] leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button size="lg" asChild className="sf-cta-accent h-12 px-8 rounded-lg font-bold shadow-none">
                                <Link to="/book">اطلب عرض سعر</Link>
                            </Button>
                            <Button size="lg" asChild className="sf-cta-solid h-12 px-7 rounded-lg font-bold shadow-none">
                                <Link to="/services">استعرض الخدمات</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative overflow-hidden rounded-2xl border border-white/12">
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

                        <Card className="absolute -bottom-5 start-5 p-5 rounded-xl bg-white border border-[var(--inst-border)] shadow-xl hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-[var(--inst-silver)] flex items-center justify-center text-[var(--brand-primary)]">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[var(--inst-text)]">عقود أساطيل</p>
                                    <p className="text-[12px] font-semibold text-[var(--inst-muted)]">فوترة مؤسسية منتظمة</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
