import { Link } from 'react-router-dom';
import {
    Monitor,
    Activity,
    Timer,
    AlertCircle,
    Car,
    RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStorefrontQueueStatus } from '@/hooks/useStorefront';
import { cn } from '@/lib/utils';

function formatWaitTime(minutes: number): string {
    if (minutes <= 0) {
        return 'بدون انتظار';
    }

    if (minutes < 60) {
        return `${minutes} دقيقة`;
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    return remainder > 0 ? `${hours} س ${remainder} د` : `${hours} ساعة`;
}

export function QueueStatus() {
    const { data, isLoading, isFetching, refetch, isError } = useStorefrontQueueStatus();
    const branches = data?.branches ?? [];

    return (
        <section className="py-32 bg-gray-50/50 relative overflow-hidden" dir="rtl" id="queue-status">
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-secondary-10 rounded-full blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-20">
                    <div className="space-y-6 text-center lg:text-start max-w-2xl mx-auto lg:mx-0">
                        <Badge className="bg-brand-secondary-10 text-brand-primary hover:bg-brand-secondary-20 border-none font-bold text-[10px] px-4 py-1 uppercase tracking-widest">
                            Live Status
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold text-brand-primary">
                            حالة الطابور <span className="text-brand-secondary font-black">مباشرة</span>
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed opacity-80">
                            تابع حالة الفروع مباشرة ووفّر وقتك باختيار الفرع الأقل ازدحاماً عبر نظامنا الذكي.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 mx-auto lg:mx-0">
                        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100/50">
                            <div className={cn('h-2.5 w-2.5 rounded-full bg-brand-secondary', isFetching && 'animate-pulse')} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                {isFetching ? 'Updating…' : 'Real-time Updates'}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl border-gray-200"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            aria-label="تحديث حالة الطابور"
                        >
                            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    <Card className="lg:col-span-2 p-10 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 bg-white overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)]" />

                        {isLoading ? (
                            <div className="grid sm:grid-cols-2 gap-10">
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <Skeleton key={index} className="h-56 rounded-xl" />
                                ))}
                            </div>
                        ) : isError || branches.length === 0 ? (
                            <div className="py-16 text-center space-y-4">
                                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                                <p className="text-gray-600 font-medium">تعذّر تحميل حالة الطابور حالياً.</p>
                                <Button variant="outline" onClick={() => refetch()}>
                                    إعادة المحاولة
                                </Button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-10">
                                {branches.map((branch) => (
                                    <div
                                        key={branch.branch_id}
                                        className="space-y-8 p-6 rounded-xl bg-gray-50/50 border border-gray-100 transition-all hover:bg-white hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{branch.branch_name}</h3>
                                                {branch.city && (
                                                    <p className="text-xs text-gray-400 mb-2">{branch.city}</p>
                                                )}
                                                <Badge
                                                    className={cn(
                                                        'font-bold text-[9px] uppercase tracking-wider',
                                                        branch.load_percent > 50
                                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                            : 'bg-brand-secondary-10 text-brand-primary border-brand-secondary-20',
                                                    )}
                                                >
                                                    {branch.status_label}
                                                </Badge>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-secondary border border-gray-50">
                                                <Monitor className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                                <span>Current Load</span>
                                                <span>{branch.load_percent}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        'h-full transition-all duration-1000',
                                                        branch.load_percent > 70 ? 'bg-amber-500' : 'bg-brand-secondary',
                                                    )}
                                                    style={{ width: `${branch.load_percent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                                    Wait Time
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Timer className="h-4 w-4 text-brand-secondary opacity-60" />
                                                    <span className="text-base font-bold text-gray-900">
                                                        {formatWaitTime(branch.estimated_wait_minutes)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                                    In Queue
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Car className="h-4 w-4 text-brand-secondary opacity-60" />
                                                    <span className="text-base font-bold text-gray-900">
                                                        {branch.waiting_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {branch.current_number != null && (
                                            <p className="text-xs text-gray-500 font-medium">
                                                الرقم الحالي: <span className="font-bold text-brand-primary">{branch.current_number}</span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-10 rounded-2xl border border-brand-primary-20 shadow-xl bg-brand-primary text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary-10 rounded-full blur-2xl" />
                        <h3 className="text-2xl font-bold mb-10 relative z-10">نظام إدارة الوقت</h3>
                        <div className="space-y-10 relative z-10">
                            {[
                                { icon: Activity, title: 'رصد فوري', desc: 'نظام ذكي يرصد عدد السيارات وحالة كل منصة غسيل.' },
                                { icon: Timer, title: 'توقع دقيق', desc: 'خوارزميات متقدمة لحساب وقت الانتظار بناءً على الخدمات.' },
                                { icon: AlertCircle, title: 'تتبع طلبك', desc: 'أدخل رقم الفاتورة من إيصال الكاشير لمتابعة سيارتك.' },
                            ].map((item, index) => (
                                <div key={index} className="flex gap-5">
                                    <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                                        <item.icon className="h-5 w-5 text-brand-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1.5 text-white/95">{item.title}</h4>
                                        <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            asChild
                            className="mt-10 w-full rounded-xl bg-brand-secondary text-white hover:opacity-90 relative z-10"
                        >
                            <Link to="/track">تتبع طلبي</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        </section>
    );
}
