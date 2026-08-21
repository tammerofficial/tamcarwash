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
    in_service: 'bg-brand-secondary-10 text-brand-primary border-brand-secondary-20',
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
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <PublicHeader profile={profile} />

            <main className="pt-48 pb-24">
                <div className="mx-auto max-w-3xl px-4 lg:px-8">
                    <div className="text-center mb-16 space-y-5 max-w-2xl mx-auto">
                        <Badge className="bg-brand-secondary-10 text-brand-primary border-none font-bold text-[10px] px-4 py-1 tracking-widest uppercase">
                            Track Status
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold text-brand-primary">
                            تتبع <span className="text-brand-secondary font-black">طلبك</span>
                        </h1>
                        <p className="text-gray-500 text-lg opacity-80 leading-relaxed">
                            أدخل رقم الفاتورة المطبوع على إيصال الكاشير (POS) لمتابعة حالة سيارتك وموقعك في الطابور.
                        </p>
                    </div>

                    <Card className="p-2 rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/50 bg-white mb-12">
                        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSearch}>
                            <div className="relative flex-1">
                                <Receipt className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    className="h-16 pr-14 pl-6 rounded-xl border-none bg-gray-50/50 text-lg font-bold placeholder:text-gray-400 focus-visible:ring-brand-secondary"
                                    placeholder="رقم الفاتورة (مثال: WASH-INV-LIVE-001)"
                                    value={trackingNumber}
                                    onChange={(event) => setTrackingNumber(event.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="h-16 px-10 rounded-xl font-bold text-lg bg-brand-primary hover:opacity-90 shadow-xl transition-all active:scale-[0.98]"
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
                        <Card className="p-10 rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/50 bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 pb-10 border-b border-gray-100">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 rounded-xl bg-brand-secondary-10 flex items-center justify-center text-brand-secondary border border-brand-secondary-20">
                                        <Car className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 text-start">
                                            License Plate
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 text-start tracking-wider">
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
                                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">رقم الطابور</p>
                                        <p className="text-2xl font-black text-brand-primary">{result.queue_number}</p>
                                    </div>
                                )}
                                {result.queue_position != null && (
                                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ترتيبك</p>
                                        <p className="text-2xl font-black text-brand-primary">{result.queue_position}</p>
                                    </div>
                                )}
                                {result.estimated_wait_minutes != null && (
                                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">الانتظار المتوقع</p>
                                        <p className="text-2xl font-black text-brand-primary">{result.estimated_wait_minutes} د</p>
                                    </div>
                                )}
                            </div>

                            {result.timeline.length > 0 && (
                                <div className="space-y-10 relative">
                                    <div className="absolute top-0 bottom-0 right-6 w-px bg-gray-100" />

                                    {result.timeline.map((step, index) => (
                                        <div key={index} className="relative flex items-center gap-8 group">
                                            <div
                                                className={cn(
                                                    'h-12 w-12 rounded-xl border-4 border-white flex items-center justify-center z-10 shadow-sm transition-all duration-500',
                                                    step.state === 'completed'
                                                        ? 'bg-brand-secondary text-white'
                                                        : step.state === 'current'
                                                          ? 'bg-brand-primary text-white animate-pulse'
                                                          : 'bg-gray-100 text-gray-400',
                                                )}
                                            >
                                                {step.state === 'completed' ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : step.state === 'current' ? (
                                                    <Clock className="h-5 w-5" />
                                                ) : (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                                )}
                                            </div>
                                            <div>
                                                <h4
                                                    className={cn(
                                                        'font-bold text-lg leading-none mb-2',
                                                        step.state === 'pending' ? 'text-gray-300' : 'text-gray-900',
                                                    )}
                                                >
                                                    {step.title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
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
                                        <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-1.5 text-start">
                                            Note to Customer
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
                            <Receipt className="h-32 w-32 mx-auto mb-6 text-gray-400" />
                            <p className="text-lg font-bold text-gray-900 uppercase tracking-widest">
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
