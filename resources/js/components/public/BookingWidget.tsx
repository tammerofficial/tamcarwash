import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import * as z from 'zod';
import {
    Car,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Clock,
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
    FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useStorefrontBranches, useStorefrontServices } from '@/hooks/useStorefront';
import { api, endpoints } from '@/lib/api';
import type { ApiResponse, PublicBookingConfirmation, StorefrontTimeSlot } from '@/types/api';

const bookingSchema = z.object({
    branch_id: z.string().min(1, 'يرجى اختيار الفرع'),
    service_id: z.string().min(1, 'يرجى اختيار الخدمة'),
    vehicle_type: z.enum(['sedan', 'suv']),
    time_slot_id: z.string().min(1, 'يرجى اختيار وقت الموعد'),
    scheduled_date: z.string().min(1),
    customer_name: z.string().min(3, 'الاسم يجب أن يكون 3 حروف على الأقل'),
    customer_phone: z.string().min(8, 'رقم الهاتف غير صحيح'),
    plate_number: z.string().min(1, 'رقم اللوحة مطلوب'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function tomorrowIso(): string {
    return format(addDays(new Date(), 1), 'yyyy-MM-dd');
}

export function BookingWidget() {
    const [step, setStep] = useState(1);
    const [confirmation, setConfirmation] = useState<PublicBookingConfirmation | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { data: branches } = useStorefrontBranches();
    const { data: services } = useStorefrontServices(20);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            branch_id: '',
            service_id: '',
            vehicle_type: 'sedan',
            time_slot_id: '',
            scheduled_date: format(new Date(), 'yyyy-MM-dd'),
            customer_name: '',
            customer_phone: '',
            plate_number: '',
        },
    });

    const branchId = form.watch('branch_id');
    const scheduledDate = form.watch('scheduled_date');
    const todayIso = format(new Date(), 'yyyy-MM-dd');

    const { data: timeSlots, isLoading: slotsLoading } = useQuery({
        queryKey: ['storefront', 'time-slots', branchId, scheduledDate],
        queryFn: async () => {
            const response = await api.get<ApiResponse<StorefrontTimeSlot[]>>(endpoints.storefront.timeSlots, {
                branch_id: Number(branchId),
                date: scheduledDate,
            });
            return response.data;
        },
        enabled: Boolean(branchId && scheduledDate),
        retry: false,
    });

    const selectedSlot = timeSlots?.find((slot) => String(slot.id) === form.watch('time_slot_id'));

    const steps = [
        { id: 1, label: 'الخدمة', icon: Car },
        { id: 2, label: 'الموعد', icon: Clock },
        { id: 3, label: 'البيانات', icon: Calendar },
    ];

    async function onSubmit(data: BookingFormValues) {
        if (!selectedSlot) {
            setSubmitError('يرجى اختيار وقت الموعد.');
            return;
        }

        setSubmitError(null);

        try {
            const response = await api.post<ApiResponse<PublicBookingConfirmation>>(
                endpoints.storefront.bookings,
                {
                    branch_id: Number(data.branch_id),
                    time_slot_id: selectedSlot.id,
                    scheduled_date: data.scheduled_date,
                    scheduled_start_time: selectedSlot.start_time.slice(0, 5),
                    scheduled_end_time: selectedSlot.end_time.slice(0, 5),
                    service_ids: [Number(data.service_id)],
                    customer: {
                        name: data.customer_name,
                        phone: data.customer_phone,
                    },
                    vehicle: {
                        plate_number: data.plate_number,
                        vehicle_type: data.vehicle_type,
                    },
                },
            );

            setConfirmation(response.data);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'تعذّر إتمام الحجز. حاول مرة أخرى.');
        }
    }

    function resetBooking() {
        setConfirmation(null);
        setStep(1);
        setSubmitError(null);
        form.reset();
    }

    if (confirmation) {
        return (
            <Card className="p-16 text-center rounded-2xl border border-gray-100 shadow-2xl bg-white" dir="rtl">
                <div className="h-20 w-20 rounded-2xl bg-brand-secondary-10 text-brand-secondary flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-3xl font-bold text-brand-primary mb-4">تم تأكيد حجزك!</h3>
                <p className="text-gray-500 mb-4">احتفظ برقم الحجز — ستحتاجه عند وصولك للمغسلة.</p>
                <p className="text-3xl font-black tracking-wide text-brand-secondary mb-10" dir="ltr">
                    {confirmation.booking_number}
                </p>
                <Button
                    className="h-14 px-10 rounded-xl font-bold transition-all shadow-lg bg-brand-secondary text-white hover:opacity-90"
                    onClick={resetBooking}
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
                                    'h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 border',
                                    step >= s.id
                                        ? 'bg-brand-secondary border-brand-secondary text-white shadow-lg'
                                        : 'bg-brand-primary border-white/20 text-white/40',
                                )}
                            >
                                <s.icon className="h-5 w-5" />
                            </div>
                            <span
                                className={cn(
                                    'text-[10px] font-bold uppercase tracking-widest',
                                    step >= s.id ? 'text-brand-secondary' : 'text-white/40',
                                )}
                            >
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
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                                            1. اختر الفرع
                                        </FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {branches?.map((branch) => (
                                                <button
                                                    key={branch.id}
                                                    type="button"
                                                    onClick={() => {
                                                        field.onChange(String(branch.id));
                                                        form.setValue('time_slot_id', '');
                                                    }}
                                                    className={cn(
                                                        'p-5 rounded-xl border-2 transition-all text-start group relative overflow-hidden',
                                                        field.value === String(branch.id)
                                                            ? 'border-brand-secondary bg-brand-secondary-10'
                                                            : 'border-gray-50 hover:border-brand-secondary-20 bg-gray-50/30',
                                                    )}
                                                >
                                                    <p className="font-bold text-gray-900 mb-0.5">{branch.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                        {branch.city}
                                                    </p>
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
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                                            2. نوع الخدمة
                                        </FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {services?.slice(0, 4).map((service) => (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => field.onChange(String(service.id))}
                                                    className={cn(
                                                        'p-5 rounded-xl border-2 transition-all text-start group relative overflow-hidden',
                                                        field.value === String(service.id)
                                                            ? 'border-brand-secondary bg-brand-secondary-10'
                                                            : 'border-gray-50 hover:border-brand-secondary-20 bg-gray-50/30',
                                                    )}
                                                >
                                                    <p className="font-bold text-gray-900 mb-0.5">
                                                        {service.name_ar || service.name}
                                                    </p>
                                                    <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider">
                                                        {service.base_price} ر.ع
                                                    </p>
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
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                                            3. حجم المركبة
                                        </FormLabel>
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
                                                        'p-5 rounded-xl border-2 transition-all text-center',
                                                        field.value === type.id
                                                            ? 'border-brand-secondary bg-brand-secondary-10'
                                                            : 'border-gray-50 hover:border-brand-secondary-20 bg-gray-50/30',
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
                            <div className="space-y-3">
                                <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                    متى تريد الحجز؟
                                </FormLabel>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        variant={scheduledDate === todayIso ? 'default' : 'outline'}
                                        className={scheduledDate === todayIso ? 'bg-brand-secondary' : ''}
                                        onClick={() => {
                                            form.setValue('scheduled_date', todayIso);
                                            form.setValue('time_slot_id', '');
                                        }}
                                    >
                                        اليوم
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={scheduledDate === tomorrowIso() ? 'default' : 'outline'}
                                        className={scheduledDate === tomorrowIso() ? 'bg-brand-secondary' : ''}
                                        onClick={() => {
                                            form.setValue('scheduled_date', tomorrowIso());
                                            form.setValue('time_slot_id', '');
                                        }}
                                    >
                                        غداً
                                    </Button>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="time_slot_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                            الوقت المتاح
                                        </FormLabel>
                                        {slotsLoading ? (
                                            <p className="text-sm text-gray-400">جاري تحميل المواعيد...</p>
                                        ) : timeSlots && timeSlots.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {timeSlots
                                                    .filter((slot) => slot.is_available && slot.remaining_capacity > 0)
                                                    .map((slot) => (
                                                        <button
                                                            key={slot.id}
                                                            type="button"
                                                            onClick={() => field.onChange(String(slot.id))}
                                                            className={cn(
                                                                'p-4 rounded-xl border-2 font-bold transition-all',
                                                                field.value === String(slot.id)
                                                                    ? 'border-brand-secondary bg-brand-secondary-10 text-brand-primary'
                                                                    : 'border-gray-50 bg-gray-50/30 text-gray-700 hover:border-brand-secondary-20',
                                                            )}
                                                        >
                                                            {slot.start_time.slice(0, 5)}
                                                        </button>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">
                                                لا توجد مواعيد متاحة في هذا اليوم. جرّب يوماً آخر.
                                            </p>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                            {selectedSlot && (
                                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-600">
                                    الموعد: {scheduledDate} — الساعة {selectedSlot.start_time.slice(0, 5)}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="customer_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-900 mb-2 block">الاسم الثلاثي</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-14 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-brand-secondary transition-all font-medium"
                                                placeholder="أدخل اسمك الكامل"
                                                {...field}
                                            />
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
                                                <Input
                                                    className="h-14 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-brand-secondary transition-all font-medium"
                                                    placeholder="96891234567"
                                                    dir="ltr"
                                                    {...field}
                                                />
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
                                                <Input
                                                    className="h-14 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-brand-secondary transition-all font-medium text-center tracking-widest"
                                                    placeholder="أ ب 1234"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                        </div>
                    )}

                    <div className="mt-10 flex items-center gap-4">
                        {step > 1 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 h-14 rounded-xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => setStep((s) => s - 1)}
                            >
                                <ChevronRight className="me-2 h-5 w-5" />
                                السابق
                            </Button>
                        ) : null}

                        {step < 3 ? (
                            <Button
                                type="button"
                                className="flex-[2] h-14 rounded-xl font-bold text-lg shadow-lg bg-brand-secondary text-white hover:opacity-90 transition-all"
                                onClick={() => setStep((s) => s + 1)}
                                disabled={
                                    (step === 1 && (!form.getValues('branch_id') || !form.getValues('service_id'))) ||
                                    (step === 2 && !form.getValues('time_slot_id'))
                                }
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
