import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowRight, CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TenantMarketingFooter } from '@/components/marketing/TenantMarketingFooter';
import { TenantMarketingHeader } from '@/components/marketing/TenantMarketingHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api, endpoints } from '@/lib/api';
import {
    formatPrice,
    getTenantBranding,
    getTenantDisplayName,
    useStorefrontBranches,
    useStorefrontProfile,
    useStorefrontServices,
} from '@/hooks/useStorefront';
import type { ApiResponse, PublicBookingPayload, StorefrontTimeSlot } from '@/types/api';

type Step = 'service' | 'schedule' | 'details' | 'done';

export function PublicBookingPage() {
    const { data: profile } = useStorefrontProfile();
    const { data: services } = useStorefrontServices(20);
    const { data: branches } = useStorefrontBranches();

    const branding = getTenantBranding(profile);
    const businessName = getTenantDisplayName(profile);
    const currency = profile?.currency ?? 'OMR';

    const [step, setStep] = useState<Step>('service');
    const [branchId, setBranchId] = useState<string>('');
    const [serviceId, setServiceId] = useState<string>('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [timeSlotId, setTimeSlotId] = useState<string>('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [vehicleBrand, setVehicleBrand] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [notes, setNotes] = useState('');
    const [bookingNumber, setBookingNumber] = useState('');

    const selectedBranchId = branchId ? Number(branchId) : undefined;

    const { data: timeSlots, isLoading: slotsLoading } = useQuery({
        queryKey: ['storefront', 'time-slots', selectedBranchId, date],
        queryFn: async () => {
            const response = await api.get<ApiResponse<StorefrontTimeSlot[]>>(endpoints.storefront.timeSlots, {
                branch_id: selectedBranchId!,
                date,
            });
            return response.data;
        },
        enabled: Boolean(selectedBranchId && date),
        retry: false,
    });

    const selectedService = useMemo(
        () => services?.find((service) => String(service.id) === serviceId),
        [services, serviceId],
    );

    const selectedSlot = useMemo(
        () => timeSlots?.find((slot) => String(slot.id) === timeSlotId),
        [timeSlots, timeSlotId],
    );

    const bookingMutation = useMutation({
        mutationFn: (payload: PublicBookingPayload) =>
            api.post<ApiResponse<{ booking_number: string }>>(endpoints.storefront.bookings, payload),
        onSuccess: (response) => {
            setBookingNumber(response.data.booking_number);
            setStep('done');
        },
    });

    function handleSubmitDetails() {
        if (!selectedBranchId || !selectedSlot) {
            return;
        }

        bookingMutation.mutate({
            branch_id: selectedBranchId,
            time_slot_id: selectedSlot.id,
            scheduled_date: date,
            scheduled_start_time: selectedSlot.start_time,
            scheduled_end_time: selectedSlot.end_time,
            service_ids: serviceId ? [Number(serviceId)] : [],
            notes: notes || undefined,
            customer: {
                name: customerName,
                phone: customerPhone,
                email: customerEmail || undefined,
            },
            vehicle: {
                plate_number: plateNumber,
                brand: vehicleBrand || undefined,
                model: vehicleModel || undefined,
            },
        });
    }

    return (
        <div className="min-h-screen bg-background">
            <TenantMarketingHeader profile={profile} />

            <main className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
                <div className="mb-8">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/">← العودة للرئيسية</Link>
                    </Button>
                    <h1 className="mt-4 text-3xl font-bold">حجز موعد — {businessName}</h1>
                    <p className="mt-2 text-muted-foreground">اختر الخدمة والموعد وأدخل بياناتك لإتمام الحجز.</p>
                </div>

                {step === 'done' ? (
                    <Card className="border-green-200 bg-green-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-6 w-6" />
                                تم إرسال طلب الحجز
                            </CardTitle>
                            <CardDescription>
                                رقم الحجز: <strong>{bookingNumber}</strong> — سنتواصل معك للتأكيد.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild style={{ backgroundColor: branding.primaryColor }}>
                                <Link to="/">العودة للرئيسية</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" style={{ color: branding.primaryColor }} />
                                {step === 'service' && '1. اختر الفرع والخدمة'}
                                {step === 'schedule' && '2. اختر التاريخ والوقت'}
                                {step === 'details' && '3. بياناتك'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {step === 'service' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>الفرع</Label>
                                        <Select value={branchId} onValueChange={setBranchId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر الفرع" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches?.map((branch) => (
                                                    <SelectItem key={branch.id} value={String(branch.id)}>
                                                        {branch.name} — {branch.city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>الخدمة</Label>
                                        <Select value={serviceId} onValueChange={setServiceId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر الخدمة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services?.map((service) => (
                                                    <SelectItem key={service.id} value={String(service.id)}>
                                                        {service.name_ar || service.name} —{' '}
                                                        {formatPrice(Number(service.base_price), currency)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedService && (
                                        <p className="text-sm text-muted-foreground">
                                            المدة التقريبية: {selectedService.duration_minutes} دقيقة
                                        </p>
                                    )}

                                    <Button
                                        className="w-full"
                                        style={{ backgroundColor: branding.primaryColor }}
                                        disabled={!branchId || !serviceId}
                                        onClick={() => setStep('schedule')}
                                    >
                                        التالي
                                        <ArrowRight className="me-2 h-4 w-4" />
                                    </Button>
                                </>
                            )}

                            {step === 'schedule' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="booking-date">التاريخ</Label>
                                        <Input
                                            id="booking-date"
                                            type="date"
                                            value={date}
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                            onChange={(event) => {
                                                setDate(event.target.value);
                                                setTimeSlotId('');
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>الوقت المتاح</Label>
                                        {slotsLoading ? (
                                            <p className="text-sm text-muted-foreground">جاري تحميل المواعيد...</p>
                                        ) : timeSlots && timeSlots.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {timeSlots
                                                    .filter((slot) => slot.is_available && slot.remaining_capacity > 0)
                                                    .map((slot) => (
                                                        <Button
                                                            key={slot.id}
                                                            type="button"
                                                            variant={timeSlotId === String(slot.id) ? 'default' : 'outline'}
                                                            style={
                                                                timeSlotId === String(slot.id)
                                                                    ? { backgroundColor: branding.primaryColor }
                                                                    : undefined
                                                            }
                                                            onClick={() => setTimeSlotId(String(slot.id))}
                                                        >
                                                            {slot.start_time?.slice(0, 5)}
                                                        </Button>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                لا توجد مواعيد متاحة في هذا التاريخ. جرّب تاريخاً آخر.
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setStep('service')}>
                                            رجوع
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            style={{ backgroundColor: branding.primaryColor }}
                                            disabled={!timeSlotId}
                                            onClick={() => setStep('details')}
                                        >
                                            التالي
                                        </Button>
                                    </div>
                                </>
                            )}

                            {step === 'details' && (
                                <>
                                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                                        <p>
                                            {selectedService?.name_ar || selectedService?.name} —{' '}
                                            {format(new Date(`${date}T00:00:00`), 'EEEE d MMMM', { locale: ar })}
                                        </p>
                                        <p className="text-muted-foreground">
                                            الساعة {selectedSlot?.start_time?.slice(0, 5)}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer-name">الاسم</Label>
                                            <Input
                                                id="customer-name"
                                                value={customerName}
                                                onChange={(event) => setCustomerName(event.target.value)}
                                                placeholder="محمد المعمري"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customer-phone">الهاتف</Label>
                                            <Input
                                                id="customer-phone"
                                                value={customerPhone}
                                                onChange={(event) => setCustomerPhone(event.target.value)}
                                                placeholder="+965 18XXXXXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer-email">البريد (اختياري)</Label>
                                        <Input
                                            id="customer-email"
                                            type="email"
                                            value={customerEmail}
                                            onChange={(event) => setCustomerEmail(event.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-2 sm:col-span-1">
                                            <Label htmlFor="plate">رقم اللوحة</Label>
                                            <Input
                                                id="plate"
                                                value={plateNumber}
                                                onChange={(event) => setPlateNumber(event.target.value)}
                                                placeholder="12345"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand">الماركة</Label>
                                            <Input
                                                id="brand"
                                                value={vehicleBrand}
                                                onChange={(event) => setVehicleBrand(event.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="model">الموديل</Label>
                                            <Input
                                                id="model"
                                                value={vehicleModel}
                                                onChange={(event) => setVehicleModel(event.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                                        <Textarea
                                            id="notes"
                                            value={notes}
                                            onChange={(event) => setNotes(event.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    {bookingMutation.isError && (
                                        <p className="text-sm text-destructive">
                                            {(bookingMutation.error as Error)?.message ?? 'حدث خطأ أثناء الحجز.'}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setStep('schedule')}>
                                            رجوع
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            style={{ backgroundColor: branding.primaryColor }}
                                            disabled={
                                                !customerName ||
                                                !customerPhone ||
                                                !plateNumber ||
                                                bookingMutation.isPending
                                            }
                                            onClick={handleSubmitDetails}
                                        >
                                            {bookingMutation.isPending ? (
                                                <>
                                                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                                    جاري الإرسال...
                                                </>
                                            ) : (
                                                'تأكيد الحجز'
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>

            <TenantMarketingFooter profile={profile} branches={branches} />
        </div>
    );
}
