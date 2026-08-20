import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Car, 
    Calendar, 
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useStorefrontBranches, useStorefrontServices } from '@/hooks/useStorefront';

const bookingSchema = z.object({
    branch_id: z.string().min(1, 'يرجى اختيار الفرع'),
    service_id: z.string().min(1, 'يرجى اختيار الخدمة'),
    vehicle_type: z.enum(['sedan', 'suv']),
    customer_name: z.string().min(3, 'الاسم يجب أن يكون 3 حروف على الأقل'),
    customer_phone: z.string().min(8, 'رقم الهاتف غير صحيح'),
    plate_number: z.string().min(1, 'رقم اللوحة مطلوب'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingWidget() {
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { data: branches } = useStorefrontBranches();
    const { data: services } = useStorefrontServices(20);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            branch_id: '',
            service_id: '',
            vehicle_type: 'sedan',
            customer_name: '',
            customer_phone: '',
            plate_number: '',
        },
    });

    const steps = [
        { id: 1, label: 'الخدمة', icon: Car },
        { id: 2, label: 'البيانات', icon: Calendar },
    ];

    async function onSubmit(data: BookingFormValues) {
        console.log('Booking data:', data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitted(true);
    }

    if (isSubmitted) {
        return (
            <Card className="p-16 text-center rounded-2xl border border-gray-100 shadow-2xl bg-white">
                <div className="h-20 w-20 rounded-2xl bg-brand-secondary-10 text-brand-secondary flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-bold text-brand-primary mb-4">تم استلام طلبك!</h3>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto">سنتواصل معك قريباً لتأكيد الموعد النهائي وتفاصيل الخدمة.</p>
                <Button 
                    className="h-14 px-10 rounded-xl font-bold transition-all shadow-lg bg-brand-secondary text-white hover:opacity-90"
                    onClick={() => setIsSubmitted(false)}
                >
                    حجز موعد آخر
                </Button>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-2xl bg-white" dir="rtl">
            <div className="bg-brand-primary p-10 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-bold mb-1">حجز موعد سريع</h3>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Secure Online Booking</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Calendar className="h-6 w-6 text-brand-secondary" />
                    </div>
                </div>

                <div className="relative flex items-center justify-between px-4">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
                    {steps.map((s) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div 
                                className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 border",
                                    step >= s.id 
                                        ? "bg-brand-secondary border-brand-secondary text-white shadow-lg" 
                                        : "bg-brand-primary border-white/20 text-white/40"
                                )}
                            >
                                <s.icon className="h-5 w-5" />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                step >= s.id ? "text-brand-secondary" : "text-white/40"
                            )}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-10">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                            <FormField
                                control={form.control}
                                name="branch_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">1. اختر الفرع</FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {branches?.map((branch) => (
                                                <button
                                                    key={branch.id}
                                                    type="button"
                                                    onClick={() => field.onChange(String(branch.id))}
                                                    className={cn(
                                                        "p-5 rounded-xl border-2 transition-all text-start group relative overflow-hidden",
                                                        field.value === String(branch.id) 
                                                            ? "border-brand-secondary bg-brand-secondary-10" 
                                                            : "border-gray-50 hover:border-brand-secondary-20 bg-gray-50/30"
                                                    )}
                                                >
                                                    <p className="font-bold text-gray-900 mb-0.5">{branch.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{branch.city}</p>
                                                    {field.value === String(branch.id) && (
                                                        <div className="absolute top-2 left-2">
                                                            <CheckCircle2 className="h-4 w-4 text-brand-secondary" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="service_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">2. نوع الخدمة</FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {services?.slice(0, 4).map((service) => (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => field.onChange(String(service.id))}
                                                    className={cn(
                                                        "p-5 rounded-xl border-2 transition-all text-start group relative overflow-hidden",
                                                        field.value === String(service.id) 
                                                            ? "border-brand-secondary bg-brand-secondary-10" 
                                                            : "border-gray-50 hover:border-brand-secondary-20 bg-gray-50/30"
                                                    )}
                                                >
                                                    <p className="font-bold text-gray-900 mb-0.5">{service.name_ar || service.name}</p>
                                                    <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider">{service.base_price} ر.ع</p>
                                                    {field.value === String(service.id) && (
                                                        <div className="absolute top-2 left-2">
                                                            <CheckCircle2 className="h-4 w-4 text-brand-secondary" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vehicle_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">3. حجم المركبة</FormLabel>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'sedan', label: 'صالون' },
                                                { id: 'suv', label: 'دفع رباعي' },
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => field.onChange(type.id)}
                                                    className={cn(
                                                        "p-5 rounded-xl border-2 transition-all text-center",
                                                        field.value === type.id 
                                                            ? "border-brand-secondary bg-brand-secondary-10" 
                                                            : "border-gray-50 hover:border-brand-secondary-20 bg-gray-50/30"
                                                    )}
                                                >
                                                    <span className="font-bold text-gray-900">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            <FormField
                                control={form.control}
                                name="customer_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-900 mb-2 block">الاسم الثلاثي</FormLabel>
                                        <FormControl>
                                            <Input className="h-14 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-brand-secondary transition-all font-medium" placeholder="أدخل اسمك الكامل" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="customer_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-900 mb-2 block">رقم الهاتف</FormLabel>
                                            <FormControl>
                                                <Input className="h-14 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-brand-secondary transition-all font-medium" placeholder="9xxxxxxx" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="plate_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-900 mb-2 block">رقم اللوحة</FormLabel>
                                            <FormControl>
                                                <Input className="h-14 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-brand-secondary transition-all font-medium text-center tracking-widest" placeholder="أ ب 1234" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-10 flex items-center gap-4">
                        {step > 1 ? (
                            <Button 
                                type="button"
                                variant="ghost" 
                                className="flex-1 h-14 rounded-xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => setStep(s => s - 1)}
                            >
                                <ChevronRight className="me-2 h-5 w-5" />
                                السابق
                            </Button>
                        ) : null}
                        
                        {step < 2 ? (
                            <Button 
                                type="button"
                                className="flex-[2] h-14 rounded-xl font-bold text-lg shadow-lg bg-brand-secondary text-white hover:opacity-90 transition-all"
                                onClick={() => setStep(2)}
                                disabled={!form.getValues('branch_id') || !form.getValues('service_id')}
                            >
                                التالي
                                <ChevronLeft className="ms-2 h-5 w-5" />
                            </Button>
                        ) : (
                            <Button 
                                type="submit"
                                className="flex-[2] h-14 rounded-xl font-bold text-lg shadow-lg bg-brand-secondary text-white hover:opacity-90 transition-all"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    'تأكيد الحجز'
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </Card>
    );
}
