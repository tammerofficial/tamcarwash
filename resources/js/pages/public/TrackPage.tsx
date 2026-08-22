import { FormEvent, useState } from 'react';
import { useStorefrontProfile, trackStorefrontOrder } from '@/hooks/useStorefront';
import { PublicHeader } from '@/components/public/Header';
import { PublicFooter } from '@/components/public/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Receipt,
    Car,
    Clock,
    CheckCircle2,
    AlertCircle,
    Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiClientError } from '@/lib/api';
import type { OrderTrackingResult } from '@/types/api';

const STATUS_BADGE_CLASS: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700 border-gray-200',
    checked_in: 'bg-blue-50 text-blue-700 border-blue-100',
    queued: 'bg-amber-50 text-amber-700 border-amber-100',
    in_service: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    quality_check: 'bg-purple-50 text-purple-700 border-purple-100',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    completed: 'bg-gray-100 text-gray-600 border-gray-200',
    cancelled: 'bg-red-50 text-red-700 border-red-100',
};

export function TrackPage() {
    const { data: profile } = useStorefrontProfile();
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<OrderTrackingResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleSearch(event?: FormEvent) {
        event?.preventDefault();

        const number = trackingNumber.trim();
        if (!number) {
            setErrorMessage('يرجى إدخال رقم الفاتورة.');
            setResult(null);
            return;
        }

        setIsSearching(true);
        setErrorMessage(null);
        setResult(null);

        try {
            const data = await trackStorefrontOrder(number);
            setResult(data);
        } catch (error) {
            if (error instanceof ApiClientError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setIsSearching(false);
        }
    }

    return (
        <div className="sf-shell min-h-screen" dir="rtl">
            <PublicHeader profile={profile} />

            <main className="pt-28 pb-20">
                <div className="mx-auto max-w-3xl px-4 lg:px-8">
                    <div className="mb-10 space-y-3">
                        <p className="sf-kicker">تتبع الطلب</p>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--inst-text)]">
                            تتبع <span className="text-[var(--brand-primary)]">طلبك</span>
                        </h1>
                        <p className="text-[var(--inst-muted)] leading-relaxed">
                            أدخل رقم الفاتورة المطبوع على إيصال الكاشير لمتابعة حالة سيارتك وموقعك في الطابور.
                        </p>
                    </div>

                    <Card className="sf-card p-2 rounded-xl shadow-none mb-10">
                        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSearch}>
                            <div className="relative flex-1">
                                <Receipt className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--inst-muted)]" />
                                <Input
                                    className="h-14 pr-12 pl-5 rounded-lg border-none bg-[var(--inst-silver)] text-base font-bold placeholder:text-[var(--inst-muted)]"
                                    placeholder="رقم الفاتورة"
                                    value={trackingNumber}
                                    onChange={(event) => setTrackingNumber(event.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="sf-cta h-14 px-8 rounded-lg font-bold text-base shadow-none"
                                disabled={isSearching}
                            >
                                <Search className="me-2 h-5 w-5" />
                                {isSearching ? 'جاري البحث…' : 'تتبع الآن'}
                            </Button>
                        </form>
                    </Card>

                    {errorMessage && (
                        <Card className="p-6 rounded-2xl border border-red-100 bg-red-50/80 mb-8 flex gap-4">
                            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-red-900 mb-1">لم يتم العثور على الطلب</p>
                                <p className="text-sm text-red-800 leading-relaxed">{errorMessage}</p>
                            </div>
                        </Card>
                    )}

                    {result ? (
                        <Card className="sf-card p-8 rounded-xl shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-[var(--inst-border)]">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-lg bg-[var(--inst-silver)] flex items-center justify-center text-[var(--brand-primary)] border border-[var(--inst-border)]">
                                        <Car className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-[var(--inst-muted)] mb-1 text-start">
                                            رقم اللوحة
                                        </p>
                                        <p className="text-2xl font-bold text-[var(--inst-text)] text-start tracking-wider">
                                            {result.vehicle_plate_masked ?? '—'}
                                        </p>
                                        {result.branch_name && (
                                            <p className="text-sm text-gray-500 mt-1">{result.branch_name}</p>
                                        )}
                                    </div>
                                </div>
                                <Badge
                                    className={cn(
                                        'font-bold text-[10px] px-5 py-2 rounded-lg uppercase tracking-widest border',
                                        STATUS_BADGE_CLASS[result.status] ?? STATUS_BADGE_CLASS.pending,
                                    )}
                                >
                                    {result.status_label}
                                </Badge>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 mb-10">
                                {result.queue_number != null && (
                                    <div className="rounded-xl border border-brand-primary/5 bg-brand-primary/[0.02] p-4 text-center">
                                        <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest mb-1">رقم الطابور</p>
                                        <p className="text-2xl font-black text-brand-primary">{result.queue_number}</p>
                                    </div>
                                )}
                                {result.queue_position != null && (
                                    <div className="rounded-xl border border-brand-primary/5 bg-brand-primary/[0.02] p-4 text-center">
                                        <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest mb-1">ترتيبك</p>
                                        <p className="text-2xl font-black text-brand-primary">{result.queue_position}</p>
                                    </div>
                                )}
                                {result.estimated_wait_minutes != null && (
                                    <div className="rounded-xl border border-brand-primary/5 bg-brand-primary/[0.02] p-4 text-center">
                                        <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-widest mb-1">الانتظار المتوقع</p>
                                        <p className="text-2xl font-black text-brand-primary">{result.estimated_wait_minutes} د</p>
                                    </div>
                                )}
                            </div>

                            {result.timeline.length > 0 && (
                                <div className="space-y-10 relative">
                                    <div className="absolute top-0 bottom-0 right-6 w-px bg-brand-primary/10" />

                                    {result.timeline.map((step, index) => (
                                        <div key={index} className="relative flex items-center gap-8 group">
                                            <div
                                                className={cn(
                                                    'h-12 w-12 rounded-xl border-4 border-white flex items-center justify-center z-10 shadow-sm transition-all duration-500',
                                                    step.state === 'completed'
                                                        ? 'bg-brand-primary text-white'
                                                        : step.state === 'current'
                                                          ? 'bg-brand-primary text-white animate-pulse'
                                                          : 'bg-brand-primary/5 text-brand-primary/20',
                                                )}
                                            >
                                                {step.state === 'completed' ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : step.state === 'current' ? (
                                                    <Clock className="h-5 w-5" />
                                                ) : (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-brand-primary/20" />
                                                )}
                                            </div>
                                            <div>
                                                <h4
                                                    className={cn(
                                                        'font-bold text-lg leading-none mb-2',
                                                        step.state === 'pending' ? 'text-brand-primary/30' : 'text-brand-primary-dark',
                                                    )}
                                                >
                                                    {step.title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-[0.2em]">
                                                    {step.time ?? '—'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-12 grid sm:grid-cols-2 gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    <span>رقم الطلب: {result.order_number}</span>
                                </div>
                                {result.invoice_number && (
                                    <div className="flex items-center gap-2">
                                        <Receipt className="h-4 w-4" />
                                        <span>رقم الفاتورة: {result.invoice_number}</span>
                                    </div>
                                )}
                            </div>

                            {result.status === 'ready' && (
                                <div className="mt-8 p-6 rounded-xl bg-amber-50/50 border border-amber-100/50 flex gap-5">
                                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[12px] font-bold text-amber-900 mb-1.5 text-start">
                                            تنبيه للعميل
                                        </p>
                                        <p className="text-sm text-amber-800 leading-relaxed font-medium text-start">
                                            سيارتك جاهزة للاستلام. يرجى التوجه إلى الفرع في أقرب وقت.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ) : !errorMessage && !isSearching ? (
                        <div className="text-center py-24 opacity-30">
                            <Receipt className="h-32 w-32 mx-auto mb-6 text-brand-primary" />
                            <p className="text-lg font-bold text-brand-primary-dark uppercase tracking-widest">
                                أدخل رقم الفاتورة للبدء
                            </p>
                        </div>
                    ) : null}
                </div>
            </main>

            <PublicFooter profile={profile} />
        </div>
    );
}
