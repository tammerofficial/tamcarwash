import { 
    Handshake, 
    ArrowRight,
    Users,
    FileText,
    TrendingUp,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CorporateSection() {
    return (
        <section className="py-32 relative overflow-hidden bg-brand-primary" dir="rtl">
            <div className="absolute inset-0 bg-[url('/images/dots.svg')] opacity-[0.03] shadow-inner" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-secondary-10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-10">
                        <Badge className="bg-white/5 text-brand-secondary border border-white/10 font-bold text-[10px] px-4 py-1 uppercase tracking-[0.2em]">
                            Corporate Solutions
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.2]">
                            حلول متكاملة <br />
                            <span className="text-brand-secondary font-black">لأساطيل الشركات</span>
                        </h2>
                        <p className="text-lg text-white/50 leading-relaxed max-w-xl">
                            نقدم خدماتنا الاحترافية للشركات والجهات الحكومية بعقود مرنة وأسعار تنافسية تضمن نظافة أسطول مركباتكم طوال العام بأعلى معايير الجودة.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {[
                                { icon: Handshake, title: 'عقود مرنة', desc: 'باقات شهرية وسنوية تناسب حجم شركتك.' },
                                { icon: TrendingUp, title: 'إدارة ذكية', desc: 'تقارير دورية لاستهلاك الأسطول والمصاريف.' },
                                { icon: Users, title: 'فريق متخصص', desc: 'فنيون محترفون للتعامل مع مختلف أنواع الأساطيل.' },
                                { icon: FileText, title: 'فواتير ضريبية', desc: 'نظام فواتير متكامل يدعم ضريبة القيمة المضافة.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 shadow-sm">
                                        <item.icon className="h-5 w-5 text-brand-secondary opacity-80" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1.5">{item.title}</h4>
                                        <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-10 flex flex-col sm:flex-row gap-5">
                            <Button size="lg" className="h-14 px-10 rounded-xl text-base font-bold bg-brand-secondary text-white hover:opacity-90 shadow-xl transition-all">
                                اطلب عرض سعر
                                <ArrowRight className="ms-2 h-5 w-5 rotate-180" />
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl text-base font-bold border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm transition-all">
                                تحميل الملف التعريفي
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative z-10 p-5 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-sm shadow-2xl">
                            <img 
                                src="/images/wash/premium-car.jpg" 
                                alt="Corporate Fleet Wash" 
                                className="w-full rounded-[2rem] shadow-3xl opacity-90"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=1000&auto=format&fit=crop';
                                }}
                            />
                        </div>
                        
                        <Card className="absolute -bottom-10 -right-10 p-8 rounded-2xl bg-white shadow-3xl border border-gray-100 z-20 hidden md:block">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-xl bg-brand-secondary-10 flex items-center justify-center text-brand-secondary shadow-sm">
                                    <Building2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 mb-0.5">+150</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Partner Company</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
