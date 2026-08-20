import { useState } from 'react';
import { useStorefrontProfile } from '@/hooks/useStorefront';
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
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrackPage() {
    const { data: profile } = useStorefrontProfile();
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <PublicHeader profile={profile} />

            <main className="pt-48 pb-24">
                <div className="mx-auto max-w-3xl px-4 lg:px-8">
                    <div className="text-center mb-16 space-y-5 max-w-2xl mx-auto">
                        <Badge className="bg-brand-secondary-10 text-brand-primary border-none font-bold text-[10px] px-4 py-1 tracking-widest uppercase">
                            Track Status
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold text-brand-primary">تتبع <span className="text-brand-secondary font-black">طلبك</span></h1>
                        <p className="text-gray-500 text-lg opacity-80 leading-relaxed">أدخل رقم الفاتورة لمتابعة حالة سيارتك مباشرة عبر نظامنا التقني المتكامل.</p>
                    </div>

                    <Card className="p-2 rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/50 bg-white mb-12">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Receipt className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input 
                                    className="h-16 pr-14 pl-6 rounded-xl border-none bg-gray-50/50 text-lg font-bold placeholder:text-gray-400 focus-visible:ring-brand-secondary" 
                                    placeholder="رقم الفاتورة (مثال: INV-1234)"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                />
                            </div>
                            <Button 
                                className="h-16 px-10 rounded-xl font-bold text-lg bg-brand-primary hover:opacity-90 shadow-xl transition-all active:scale-[0.98]"
                                onClick={() => setIsSearching(true)}
                            >
                                <Search className="me-2 h-5 w-5" />
                                تتبع الآن
                            </Button>
                        </div>
                    </Card>

                    {isSearching ? (
                        <Card className="p-10 rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/50 bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 pb-10 border-b border-gray-100">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 rounded-xl bg-brand-secondary-10 flex items-center justify-center text-brand-secondary border border-brand-secondary-20">
                                        <Car className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5 text-start">License Plate</p>
                                        <p className="text-2xl font-bold text-gray-900 text-start tracking-wider">أ ب 1234</p>
                                    </div>
                                </div>
                                <Badge className="bg-brand-secondary-10 text-brand-primary border border-brand-secondary-20 font-bold text-[10px] px-5 py-2 rounded-lg uppercase tracking-widest">
                                    In Progress
                                </Badge>
                            </div>

                            <div className="space-y-10 relative">
                                <div className="absolute top-0 bottom-0 right-6 w-px bg-gray-100" />
                                
                                {[
                                    { title: 'تم استلام السيارة', time: '10:30 ص', status: 'completed' },
                                    { title: 'بدء عملية الغسيل', time: '10:45 ص', status: 'completed' },
                                    { title: 'التنشيف والتعطير', time: 'قيد التنفيذ', status: 'current' },
                                    { title: 'جاهزة للاستلام', time: '--:--', status: 'pending' },
                                ].map((step, i) => (
                                    <div key={i} className="relative flex items-center gap-8 group">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl border-4 border-white flex items-center justify-center z-10 shadow-sm transition-all duration-500",
                                            step.status === 'completed' ? "bg-brand-secondary text-white" : 
                                            step.status === 'current' ? "bg-brand-primary text-white animate-pulse" : 
                                            "bg-gray-100 text-gray-400"
                                        )}>
                                            {step.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : 
                                             step.status === 'current' ? <Clock className="h-5 w-5" /> : 
                                             <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />}
                                        </div>
                                        <div>
                                            <h4 className={cn(
                                                "font-bold text-lg leading-none mb-2",
                                                step.status === 'pending' ? "text-gray-300" : "text-gray-900"
                                            )}>{step.title}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{step.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 rounded-xl bg-amber-50/50 border border-amber-100/50 flex gap-5">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-1.5 text-start">Note to Customer</p>
                                    <p className="text-sm text-amber-800 leading-relaxed font-medium text-start">
                                        يُرجى التواجد في الفرع خلال 10 دقائق لاستلام سيارتك وضمان جودة الخدمة النهائية.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="text-center py-24 opacity-20">
                            <Receipt className="h-32 w-32 mx-auto mb-6 text-gray-400" />
                            <p className="text-lg font-bold text-gray-900 uppercase tracking-widest">Waiting for Invoice ID</p>
                        </div>
                    )}
                </div>
            </main>

            <PublicFooter profile={profile} />
        </div>
    );
}
