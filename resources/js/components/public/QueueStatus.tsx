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
        <section className="py-24 relative overflow-hidden" dir="rtl" id="queue-status">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--inst-bg)] via-white to-[var(--inst-silver)]" />

            {/* Decorative elements */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--brand-primary)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[var(--brand-secondary)]/5 rounded-full blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-12">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-secondary)]/10 border border-[var(--brand-secondary)]/20">
                            <Zap className="h-4 w-4 text-[var(--brand-secondary)]" />
                            <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">رصد مباشر</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--inst-text)]">
                            حالة الفروع
                            <br />
                            <span className="bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] bg-clip-text text-transparent">الآن مباشرة</span>
                        </h2>
                        <p className="text-lg text-[var(--inst-muted)] leading-relaxed max-w-md">
                            اختر الفرع الأقل اشتغالاً وتابع الطابور بدقة. بيانات مُحدَّثة لحظة بلحظة من نظام التشغيل.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-lg border border-[var(--inst-border)] shadow-sm">
                            <div className={cn('h-2.5 w-2.5 rounded-full bg-[var(--brand-secondary)]', isFetching && 'animate-pulse')} />
                            <span className="text-sm font-bold text-[var(--inst-muted)]">
                                {isFetching ? 'جاري التحديث…' : 'تحديث مباشر'}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-lg border-[var(--inst-border)] h-11 px-4 font-bold hover:bg-[var(--brand-primary)]/10 transition-all"
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
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Branches Grid - Large area */}
                    <div className="lg:col-span-2">
                        <Card className="sf-card p-8 rounded-2xl shadow-none overflow-hidden">
                            {isLoading ? (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {Array.from({ length: 2 }).map((_, index) => (
                                        <Skeleton key={index} className="h-64 rounded-xl" />
                                    ))}
                                </div>
                            ) : isError || branches.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto opacity-60" />
                                    <p className="text-lg font-bold text-[var(--inst-text)]">تعذّر تحميل حالة الطابور.</p>
                                    <Button variant="outline" onClick={() => refetch()} className="rounded-lg border-[var(--inst-border)]">
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
                                                className="relative p-6 rounded-xl bg-gradient-to-br from-white to-[var(--inst-silver)] border border-[var(--inst-border)] hover:shadow-lg transition-all duration-300 group"
                                            >
                                                {/* Top accent bar */}
                                                <div className={cn(
                                                    'absolute top-0 inset-x-0 h-1 rounded-t-xl',
                                                    isHighLoad ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)]'
                                                )} />

                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-3 mb-6">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-black text-[var(--inst-text)] mb-1">{branch.branch_name}</h3>
                                                        {branch.city && (
                                                            <p className="text-xs text-[var(--inst-muted)] font-semibold">{branch.city}</p>
                                                        )}
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            'font-bold text-xs uppercase tracking-wider py-2 px-3 rounded-lg border',
                                                            isHighLoad
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : isMediumLoad
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-green-50 text-green-700 border-green-200',
                                                        )}
                                                    >
                                                        {branch.status_label}
                                                    </Badge>
                                                </div>

                                                {/* Load percentage */}
                                                <div className="mb-6">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-[var(--inst-muted)] uppercase tracking-wider">نسبة الإشغال</span>
                                                        <span className="text-2xl font-black text-[var(--brand-primary)]">{branch.load_percent}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-[var(--inst-border)] rounded-full overflow-hidden border border-[var(--inst-border)]">
                                                        <div
                                                            className={cn(
                                                                'h-full transition-all duration-700 rounded-full',
                                                                isHighLoad ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)]',
                                                            )}
                                                            style={{ width: `${branch.load_percent}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <div className="p-4 rounded-lg bg-white border border-[var(--inst-border)] group-hover:border-[var(--brand-primary)] transition-colors">
                                                        <p className="text-[11px] font-bold text-[var(--inst-muted)] uppercase mb-1.5 tracking-wider">وقت الانتظار</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <Timer className="h-5 w-5 text-[var(--brand-primary)]" />
                                                            <span className="text-lg font-black text-[var(--inst-text)]">
                                                                {formatWaitTime(branch.estimated_wait_minutes)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-white border border-[var(--inst-border)] group-hover:border-[var(--brand-primary)] transition-colors">
                                                        <p className="text-[11px] font-bold text-[var(--inst-muted)] uppercase mb-1.5 tracking-wider">بالطابور</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <Car className="h-5 w-5 text-[var(--brand-primary)]" />
                                                            <span className="text-lg font-black text-[var(--inst-text)]">
                                                                {branch.waiting_count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Current number */}
                                                {branch.current_number != null && (
                                                    <p className="text-xs font-bold text-[var(--inst-text)] bg-[var(--brand-primary)]/10 px-3 py-2 rounded-lg">
                                                        الرقم الحالي: <span className="font-black text-[var(--brand-primary)]">{branch.current_number}</span>
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
                    <Card className="p-8 rounded-2xl border-0 shadow-none text-white relative overflow-hidden bg-gradient-to-br from-[var(--inst-teal)] to-[#084f5a] h-fit">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-secondary)]/20 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--brand-primary)]/20 rounded-full blur-2xl" />

                        <div className="relative space-y-8">
                            <div>
                                <h3 className="text-2xl font-black mb-1">نظام الوقت</h3>
                                <p className="text-white/60 text-sm">إدارة ذكية للطابور</p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: Activity, title: 'رصد فوري', desc: 'تتبع حي لكل سيارة ومنصة عمل' },
                                    { icon: TrendingDown, title: 'توقع دقيق', desc: 'حساب انتظار واقعي ومحدّث' },
                                    { icon: Search, title: 'تتبع الطلب', desc: 'ابحث برقم الفاتورة من الإيصال' },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm group hover:bg-white/20 transition-all">
                                            <item.icon className="h-5 w-5 text-[var(--brand-secondary)]" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white mb-1">{item.title}</h4>
                                            <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button asChild className="sf-cta-accent mt-8 w-full rounded-xl shadow-lg font-bold text-base h-12 hover:shadow-xl transition-all">
                                <Link to="/track">تتبع طلبي الآن</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
