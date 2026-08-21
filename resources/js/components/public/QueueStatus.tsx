import { Link } from 'react-router-dom';
import { Activity, AlertCircle, Building2, Car, RefreshCw, Search, Timer } from 'lucide-react';
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
        <section className="sf-section-muted py-20 relative overflow-hidden" dir="rtl" id="queue-status">
            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-10">
                    <div className="max-w-2xl space-y-3">
                        <p className="sf-kicker">الطابور المباشر</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--inst-text)]">
                            حالة الفروع <span className="text-[var(--brand-primary)]">الآن</span>
                        </h2>
                        <p className="text-[var(--inst-muted)] leading-relaxed">
                            اختر الفرع الأقل ازدحاماً قبل التحرك. البيانات تُحدَّث تلقائياً من نظام التشغيل.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-lg border border-[var(--inst-border)]">
                            <div className={cn('h-2 w-2 rounded-full bg-[var(--brand-secondary)]', isFetching && 'animate-pulse')} />
                            <span className="text-[12px] font-semibold text-[var(--inst-muted)]">
                                {isFetching ? 'جاري التحديث…' : 'تحديث مباشر'}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-lg border-[var(--inst-border)]"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            aria-label="تحديث حالة الطابور"
                        >
                            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <Card className="sf-card lg:col-span-2 p-6 md:p-8 rounded-xl shadow-none overflow-hidden">
                        {isLoading ? (
                            <div className="grid sm:grid-cols-2 gap-5">
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <Skeleton key={index} className="h-52 rounded-xl" />
                                ))}
                            </div>
                        ) : isError || branches.length === 0 ? (
                            <div className="py-14 text-center space-y-3">
                                <AlertCircle className="h-9 w-9 text-amber-600 mx-auto" />
                                <p className="text-[var(--inst-text)] font-semibold">تعذّر تحميل حالة الطابور حالياً.</p>
                                <Button variant="outline" onClick={() => refetch()}>
                                    إعادة المحاولة
                                </Button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-5">
                                {branches.map((branch) => (
                                    <div
                                        key={branch.branch_id}
                                        className="sf-card-accent space-y-5 p-5 rounded-xl bg-[var(--inst-silver)] border border-[var(--inst-border)]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-[var(--inst-text)]">{branch.branch_name}</h3>
                                                {branch.city && (
                                                    <p className="text-[12px] text-[var(--inst-muted)] mt-1">{branch.city}</p>
                                                )}
                                                <Badge
                                                    className={cn(
                                                        'mt-2 font-bold text-[11px] border',
                                                        branch.load_percent > 50
                                                            ? 'bg-amber-50 text-amber-800 border-amber-100'
                                                            : 'bg-brand-secondary-10 text-brand-primary border-transparent',
                                                    )}
                                                >
                                                    {branch.status_label}
                                                </Badge>
                                            </div>
                                            <div className="h-10 w-10 rounded-lg bg-white border border-[var(--inst-border)] flex items-center justify-center text-[var(--brand-primary)]">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[12px] font-semibold text-[var(--inst-muted)]">
                                                <span>نسبة الإشغال</span>
                                                <span>{branch.load_percent}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-[var(--inst-border)]">
                                                <div
                                                    className={cn(
                                                        'h-full transition-all duration-700',
                                                        branch.load_percent > 70 ? 'bg-amber-500' : 'bg-[var(--brand-secondary)]',
                                                    )}
                                                    style={{ width: `${branch.load_percent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-3 rounded-lg border border-[var(--inst-border)]">
                                                <p className="text-[11px] font-semibold text-[var(--inst-muted)] mb-1">الانتظار</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Timer className="h-4 w-4 text-[var(--brand-primary)]" />
                                                    <span className="text-sm font-bold text-[var(--inst-text)]">
                                                        {formatWaitTime(branch.estimated_wait_minutes)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-[var(--inst-border)]">
                                                <p className="text-[11px] font-semibold text-[var(--inst-muted)] mb-1">في الطابور</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Car className="h-4 w-4 text-[var(--brand-primary)]" />
                                                    <span className="text-sm font-bold text-[var(--inst-text)]">
                                                        {branch.waiting_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {branch.current_number != null && (
                                            <p className="text-[12px] text-[var(--inst-muted)] font-medium">
                                                الرقم الحالي:{' '}
                                                <span className="font-bold text-[var(--brand-primary)]">{branch.current_number}</span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-7 rounded-xl border-0 shadow-none text-white relative overflow-hidden bg-[var(--inst-teal)]">
                        <h3 className="text-xl font-bold mb-8">نظام إدارة الوقت</h3>
                        <div className="space-y-7">
                            {[
                                { icon: Activity, title: 'رصد فوري', desc: 'يتابع النظام عدد السيارات وحالة كل منصة غسيل.' },
                                { icon: Timer, title: 'توقع دقيق', desc: 'حساب الانتظار حسب الخدمة والحمل التشغيلي.' },
                                { icon: Search, title: 'تتبع الطلب', desc: 'أدخل رقم الفاتورة من إيصال الكاشير لمتابعة سيارتك.' },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-3.5">
                                    <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                                        <item.icon className="h-4 w-4 text-[var(--brand-secondary)]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-white/55 text-[13px] leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button asChild className="sf-cta-accent mt-8 w-full rounded-lg shadow-none font-bold">
                            <Link to="/track">تتبع طلبي</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        </section>
    );
}
