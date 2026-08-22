import { Link } from 'react-router-dom';
import { Activity, AlertCircle, Car, RefreshCw, Search, Timer, TrendingDown, Zap } from 'lucide-react';
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
        <section className="py-24 relative overflow-hidden bg-brand-primary/[0.02]" dir="rtl" id="queue-status">
            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 shadow-sm">
                            <Zap className="h-4 w-4 text-brand-primary" />
                            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">رصد مباشر</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-brand-primary-dark tracking-tight">
                            حالة الفروع
                            <br />
                            <span className="text-brand-primary/30">الآن مباشرة</span>
                        </h2>
                        <p className="text-lg text-brand-primary/70 leading-relaxed max-w-md">
                            اختر الفرع الأقل اشتغالاً وتابع الطابور بدقة. بيانات مُحدَّثة لحظة بلحظة.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5 bg-brand-primary/5 px-4 py-3 rounded-xl border border-brand-primary/10 shadow-sm">
                            <div className={cn('h-2.5 w-2.5 rounded-full bg-brand-primary', isFetching && 'animate-pulse')} />
                            <span className="text-sm font-bold text-brand-primary/80">
                                {isFetching ? 'جاري التحديث…' : 'تحديث مباشر'}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-xl border-brand-primary/20 h-12 px-5 font-bold hover:bg-brand-primary/5 text-brand-primary-dark transition-all bg-white shadow-sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            aria-label="تحديث حالة الطابور"
                        >
                            <RefreshCw className={cn('h-4 w-4 me-2', isFetching && 'animate-spin')} />
                            تحديث
                        </Button>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Branches Grid - Large area */}
                    <div className="lg:col-span-2">
                        <Card className="p-8 rounded-3xl shadow-sm border border-brand-primary/10 bg-white overflow-hidden">
                            {isLoading ? (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {Array.from({ length: 2 }).map((_, index) => (
                                        <Skeleton key={index} className="h-64 rounded-2xl" />
                                    ))}
                                </div>
                            ) : isError || branches.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <AlertCircle className="h-12 w-12 text-brand-primary/40 mx-auto opacity-60" />
                                    <p className="text-lg font-bold text-brand-primary-dark">تعذّر تحميل حالة الطابور.</p>
                                    <Button variant="outline" onClick={() => refetch()} className="rounded-xl border-brand-primary/20 text-brand-primary">
                                        إعادة المحاولة
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {branches.map((branch) => {
                                        const isHighLoad = branch.load_percent > 70;
                                        const isMediumLoad = branch.load_percent > 50;

                                        return (
                                            <div
                                                key={branch.branch_id}
                                                className="relative p-6 rounded-2xl bg-brand-primary/[0.03] border border-brand-primary/5 hover:shadow-md transition-all duration-300 group"
                                            >
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-3 mb-6">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-black text-brand-primary-dark mb-1">{branch.branch_name}</h3>
                                                        {branch.city && (
                                                            <p className="text-xs text-brand-primary/60 font-semibold">{branch.city}</p>
                                                        )}
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            'font-bold text-xs uppercase tracking-wider py-2 px-3 rounded-lg border shadow-sm',
                                                            isHighLoad
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : isMediumLoad
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                                        )}
                                                    >
                                                        {branch.status_label}
                                                    </Badge>
                                                </div>

                                                {/* Load percentage */}
                                                <div className="mb-6">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-brand-primary/50 uppercase tracking-wider">نسبة الإشغال</span>
                                                        <span className="text-2xl font-black text-brand-primary-dark">{branch.load_percent}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-brand-primary/10 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn(
                                                                    'h-full transition-all duration-700 rounded-full',
                                                                    isHighLoad ? 'bg-red-500' : 'bg-brand-primary',
                                                                )}
                                                                style={{ width: `${branch.load_percent}%` }}
                                                            />
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <div className="p-4 rounded-xl bg-white border border-brand-primary/5 group-hover:border-brand-primary/20 transition-colors shadow-sm">
                                                        <p className="text-[11px] font-bold text-brand-primary/40 uppercase mb-1.5 tracking-wider">وقت الانتظار</p>
                                                        <div className="flex items-center gap-2">
                                                            <Timer className="h-5 w-5 text-brand-primary" />
                                                            <span className="text-lg font-black text-brand-primary-dark">
                                                                {formatWaitTime(branch.estimated_wait_minutes)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-white border border-brand-primary/5 group-hover:border-brand-primary/20 transition-colors shadow-sm">
                                                        <p className="text-[11px] font-bold text-brand-primary/40 uppercase mb-1.5 tracking-wider">بالطابور</p>
                                                        <div className="flex items-center gap-2">
                                                            <Car className="h-5 w-5 text-brand-primary" />
                                                            <span className="text-lg font-black text-brand-primary-dark">
                                                                {branch.waiting_count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Current number */}
                                                {branch.current_number != null && (
                                                    <p className="text-xs font-bold text-brand-primary-dark bg-brand-primary/5 px-4 py-3 rounded-xl">
                                                        الرقم الحالي: <span className="font-black text-brand-primary">{branch.current_number}</span>
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Info Card - Right sidebar */}
                    <Card className="p-8 rounded-3xl border border-brand-primary/10 shadow-sm bg-white h-fit">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-brand-primary-dark mb-2">نظام الوقت</h3>
                                <p className="text-brand-primary/60 text-sm">إدارة ذكية للطابور</p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: Activity, title: 'رصد فوري', desc: 'تتبع حي لكل سيارة ومنصة عمل' },
                                    { icon: TrendingDown, title: 'توقع دقيق', desc: 'حساب انتظار واقعي ومحدّث' },
                                    { icon: Search, title: 'تتبع الطلب', desc: 'ابحث برقم الفاتورة من الإيصال' },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center shrink-0">
                                            <item.icon className="h-5 w-5 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-primary-dark mb-1">{item.title}</h4>
                                            <p className="text-brand-primary/60 text-xs leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary-dark mt-8 w-full rounded-xl shadow-md shadow-brand-primary/20 font-bold text-base h-12 transition-all">
                                <Link to="/track">تتبع طلبي الآن</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
