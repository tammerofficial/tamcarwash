import { 
    Monitor,
    Activity,
    Timer,
    AlertCircle,
    Car
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function QueueStatus() {
    const branches = [
        { name: 'فرع المعبيلة', status: 'مزدحم قليلاً', waitTime: '45 دقيقة', load: 65, cars: 8 },
        { name: 'فرع الخوير', status: 'متاح الآن', waitTime: '5 دقائق', load: 15, cars: 2 },
    ];

    return (
        <section className="py-32 bg-gray-50/50 relative overflow-hidden" dir="rtl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
            
            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-20">
                    <div className="space-y-6 text-center lg:text-start max-w-2xl mx-auto lg:mx-0">
                        <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-none font-bold text-[10px] px-4 py-1 uppercase tracking-widest">
                            Live Status
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#004d4d]">
                            حالة الطابور <span className="text-teal-600 font-black">مباشرة</span>
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed opacity-80">
                            تابع حالة الفروع مباشرة ووفّر وقتك باختيار الفرع الأقل ازدحاماً عبر نظامنا الذكي.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100/50 mx-auto lg:mx-0">
                        <div className="h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Real-time Updates</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    <Card className="lg:col-span-2 p-10 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 bg-white overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-700" />
                        
                        <div className="grid sm:grid-cols-2 gap-10">
                            {branches.map((branch, i) => (
                                <div key={i} className="space-y-8 p-6 rounded-xl bg-gray-50/50 border border-gray-100 transition-all hover:bg-white hover:shadow-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h3>
                                            <Badge className={cn(
                                                "font-bold text-[9px] uppercase tracking-wider",
                                                branch.load > 50 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-teal-50 text-teal-700 border-teal-100"
                                            )}>
                                                {branch.status}
                                            </Badge>
                                        </div>
                                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-600 border border-gray-50">
                                            <Monitor className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                            <span>Current Load</span>
                                            <span>{branch.load}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    branch.load > 70 ? "bg-amber-500" : "bg-teal-500"
                                                )}
                                                style={{ width: `${branch.load}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Wait Time</p>
                                            <div className="flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-teal-600 opacity-60" />
                                                <span className="text-base font-bold text-gray-900">{branch.waitTime}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">In Queue</p>
                                            <div className="flex items-center gap-2">
                                                <Car className="h-4 w-4 text-teal-600 opacity-60" />
                                                <span className="text-base font-bold text-gray-900">{branch.cars}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-10 rounded-2xl border border-teal-900/10 shadow-xl shadow-teal-900/5 bg-[#004d4d] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />
                        <h3 className="text-2xl font-bold mb-10 relative z-10">نظام إدارة الوقت</h3>
                        <div className="space-y-10 relative z-10">
                            {[
                                { icon: Activity, title: 'رصد فوري', desc: 'نظام ذكي يرصد عدد السيارات وحالة كل منصة غسيل.' },
                                { icon: Timer, title: 'توقع دقيق', desc: 'خوارزميات متقدمة لحساب وقت الانتظار بناءً على الخدمات.' },
                                { icon: AlertCircle, title: 'تنبيهات ذكية', desc: 'نرسل لك تنبيهاً قبل موعدك بـ 15 دقيقة لتجنب التأخير.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                                        <item.icon className="h-5 w-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1.5 text-white/95">{item.title}</h4>
                                        <p className="text-teal-50/40 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
