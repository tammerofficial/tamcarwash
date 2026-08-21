import { useMutation, useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowRight, CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicFooter } from '@/components/public/Footer';
import { PublicHeader } from '@/components/public/Header';
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
import type {
    ApiResponse,
    PublicBookingConfirmation,
    PublicBookingPayload,
    StorefrontTimeSlot,
    VehicleType,
} from '@/types/api';

type Step = 'service' | 'schedule' | 'details' | 'done';

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
    { value: 'sedan', label: 'سيدان' },
    { value: 'suv', label: 'دفع رباعي (SUV)' },
    { value: 'truck', label: 'بيك أب / شاحنة' },
    { value: 'van', label: 'فان' },
    { value: 'motorcycle', label: 'دراجة نارية' },
];

function tomorrowIso(): string {
    return format(addDays(new Date(), 1), 'yyyy-MM-dd');
}

export function PublicBookingPage() {
    const { data: profile } = useStorefrontProfile();
    const { data: services } = useStorefrontServices(20);
    const { data: branches } = useStorefrontBranches();

    const branding = getTenantBranding(profile);
    const businessName = getTenantDisplayName(profile);
    const currency = profile?.currency ?? 'OMR';
    const vatRate = profile?.vat_rate ?? 5;

    const [step, setStep] = useState<Step>('service');
    const [branchId, setBranchId] = useState<string>('');
    const [serviceId, setServiceId] = useState<string>('');
    const [vehicleType, setVehicleType] = useState<VehicleType>('suv');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [timeSlotId, setTimeSlotId] = useState<string>('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [vehicleBrand, setVehicleBrand] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehicleColor, setVehicleColor] = useState('');
    const [notes, setNotes] = useState('');
    const [confirmation, setConfirmation] = useState<PublicBookingConfirmation | null>(null);

    const selectedBranchId = branchId ? Number(branchId) : undefined;
    const todayIso = format(new Date(), 'yyyy-MM-dd');

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

    const selectedBranch = useMemo(
        () => branches?.find((branch) => String(branch.id) === branchId),
        [branches, branchId],
    );

    const selectedService = useMemo(
        () => services?.find((service) => String(service.id) === serviceId),
        [services, serviceId],
    );

    const selectedSlot = useMemo(
        () => timeSlots?.find((slot) => String(slot.id) === timeSlotId),
        [timeSlots, timeSlotId],
    );

    const previewPricing = useMemo(() => {
        if (!selectedService) {
            return null;
        }
        const subtotal = Number(selectedService.base_price);
        const vatAmount = Math.round(subtotal * (vatRate / 100) * 1000) / 1000;
        return {
            subtotal,
            vat_rate: vatRate,
            vat_amount: vatAmount,
            total: Math.round((subtotal + vatAmount) * 1000) / 1000,
            currency,
        };
    }, [selectedService, vatRate, currency]);

    const bookingMutation = useMutation({
        mutationFn: (payload: PublicBookingPayload) =>
            api.post<ApiResponse<PublicBookingConfirmation>>(endpoints.storefront.bookings, payload),
        onSuccess: (response) => {
            setConfirmation(response.data);
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
                color: vehicleColor || undefined,
                vehicle_type: vehicleType,
            },
        });
    }

    const pricing = confirmation?.pricing ?? previewPricing;

    return (
        <div className="sf-shell min-h-screen" dir="rtl">
            <PublicHeader profile={profile} />

            <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 lg:px-6">
                <div className="mb-8">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/">العودة للرئيسية</Link>
                    </Button>
                    <p className="sf-kicker mt-5">الحجز</p>
                    <h1 className="mt-2 text-3xl font-bold text-[var(--inst-text)]">احجز موعدك — {businessName}</h1>
                    <p className="mt-2 text-[var(--inst-muted)]">
                        اختر الفرع والخدمة والموعد، ثم أدخل بياناتك. العملية بسيطة ولا تحتاج أكثر من دقيقتين.
                    </p>
                </div>

                {step !== 'done' && (
                    <div className="mb-6 flex gap-2 text-sm">
                        {(['service', 'schedule', 'details'] as Step[]).map((item, index) => (
                            <span
                                key={item}
                                className={
                                    step === item
                                        ? 'font-semibold text-primary'
                                        : 'text-muted-foreground'
                                }
                            >
                                {index + 1}.{' '}
                                {item === 'service' ? 'الفرع والخدمة' : item === 'schedule' ? 'الموعد' : 'بياناتك'}
                            </span>
                        ))}
                    </div>
                )}

                {step === 'done' && confirmation ? (
                    <Card className="border-green-200 bg-green-50/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <CheckCircle2 className="h-7 w-7" />
                                تم تأكيد حجزك
                            </CardTitle>
                            <CardDescription className="text-base text-green-900/80">
                                احتفظ برقم الحجز — ستحتاجه عند وصولك للمغسلة.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-xl border border-green-200 bg-white p-6 text-center">
                                <p className="text-sm text-muted-foreground">رقم الحجز</p>
                                <p className="mt-1 text-3xl font-black tracking-wide text-primary" dir="ltr">
                                    {confirmation.booking_number}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-sm text-muted-foreground">الفرع</p>
                                    <p className="font-semibold">
                                        {confirmation.branch?.name ?? selectedBranch?.name ?? '—'}
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-sm text-muted-foreground">الموعد</p>
                                    <p className="font-semibold">
                                        {format(new Date(`${confirmation.scheduled_date}T00:00:00`), 'EEEE d MMMM', {
                                            locale: ar,
                                        })}
                                    </p>
                                    <p className="text-muted-foreground">
                                        الساعة {confirmation.scheduled_start_time?.slice(0, 5)}
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-sm text-muted-foreground">الخدمة</p>
                                    <p className="font-semibold">
                                        {selectedService?.name_ar || selectedService?.name || '—'}
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-sm text-muted-foreground">وقت الانتظار المتوقع</p>
                                    <p className="font-semibold">
                                        {confirmation.estimated_wait_minutes ?? 0} دقيقة تقريباً
                                    </p>
                                </div>
                            </div>

                            {pricing && (
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="mb-3 font-semibold">ملخص السعر</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">قبل الضريبة</span>
                                            <span>{formatPrice(pricing.subtotal, pricing.currency ?? currency)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                ضريبة القيمة المضافة ({pricing.vat_rate}%)
                                            </span>
                                            <span>{formatPrice(pricing.vat_amount, pricing.currency ?? currency)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-base font-bold">
                                            <span>الإجمالي</span>
                                            <span className="text-primary">
                                                {formatPrice(pricing.total, pricing.currency ?? currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-center text-sm text-muted-foreground">
                                عند وصولك، أظهر رقم الحجز أو رقم لوحتك ({plateNumber || confirmation.vehicle_plate}) في
                                الكاشير.
                            </p>

                            <Button asChild className="w-full" style={{ backgroundColor: branding.primaryColor }}>
                                <Link to="/">العودة للرئيسية</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" style={{ color: branding.primaryColor }} />
                                {step === 'service' && 'اختر الفرع والخدمة'}
                                {step === 'schedule' && 'اختر يوم الموعد والوقت'}
                                {step === 'details' && 'بياناتك وبيانات المركبة'}
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

                                    <div className="space-y-2">
                                        <Label>نوع المركبة</Label>
                                        <Select
                                            value={vehicleType}
                                            onValueChange={(value) => setVehicleType(value as VehicleType)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {VEHICLE_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedService && previewPricing && (
                                        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                                            <p>
                                                {selectedService.name_ar || selectedService.name} — المدة تقريباً{' '}
                                                {selectedService.duration_minutes} دقيقة
                                            </p>
                                            <p className="mt-1 text-muted-foreground">
                                                يبدأ من {formatPrice(previewPricing.total, currency)} شامل الضريبة
                                            </p>
                                        </div>
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
                                    <div className="space-y-3">
                                        <Label>متى تريد الحجز؟</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                type="button"
                                                variant={date === todayIso ? 'default' : 'outline'}
                                                style={
                                                    date === todayIso
                                                        ? { backgroundColor: branding.primaryColor }
                                                        : undefined
                                                }
                                                onClick={() => {
                                                    setDate(todayIso);
                                                    setTimeSlotId('');
                                                }}
                                            >
                                                اليوم
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={date === tomorrowIso() ? 'default' : 'outline'}
                                                style={
                                                    date === tomorrowIso()
                                                        ? { backgroundColor: branding.primaryColor }
                                                        : undefined
                                                }
                                                onClick={() => {
                                                    setDate(tomorrowIso());
                                                    setTimeSlotId('');
                                                }}
                                            >
                                                غداً
                                            </Button>
                                        </div>
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
                                                            variant={
                                                                timeSlotId === String(slot.id) ? 'default' : 'outline'
                                                            }
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
                                                لا توجد مواعيد متاحة في هذا اليوم. جرّب يوماً آخر.
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
                                        <p className="font-medium">
                                            {selectedService?.name_ar || selectedService?.name} —{' '}
                                            {selectedBranch?.name}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {format(new Date(`${date}T00:00:00`), 'EEEE d MMMM', { locale: ar })} — الساعة{' '}
                                            {selectedSlot?.start_time?.slice(0, 5)}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer-name">الاسم الكامل</Label>
                                            <Input
                                                id="customer-name"
                                                value={customerName}
                                                onChange={(event) => setCustomerName(event.target.value)}
                                                placeholder="علي البلوشي"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customer-phone">رقم الهاتف</Label>
                                            <Input
                                                id="customer-phone"
                                                value={customerPhone}
                                                onChange={(event) => setCustomerPhone(event.target.value)}
                                                placeholder="96891234567"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer-email">البريد الإلكتروني (اختياري)</Label>
                                        <Input
                                            id="customer-email"
                                            type="email"
                                            value={customerEmail}
                                            onChange={(event) => setCustomerEmail(event.target.value)}
                                            placeholder="ali.customer@example.com"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="plate">رقم اللوحة</Label>
                                            <Input
                                                id="plate"
                                                value={plateNumber}
                                                onChange={(event) => setPlateNumber(event.target.value)}
                                                placeholder="1234 ب"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="color">لون المركبة</Label>
                                            <Input
                                                id="color"
                                                value={vehicleColor}
                                                onChange={(event) => setVehicleColor(event.target.value)}
                                                placeholder="أبيض"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="brand">الماركة</Label>
                                            <Input
                                                id="brand"
                                                value={vehicleBrand}
                                                onChange={(event) => setVehicleBrand(event.target.value)}
                                                placeholder="Toyota"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="model">الموديل</Label>
                                            <Input
                                                id="model"
                                                value={vehicleModel}
                                                onChange={(event) => setVehicleModel(event.target.value)}
                                                placeholder="Land Cruiser"
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
                                            placeholder="مثلاً: يرجى التركيز على المقاعد الخلفية"
                                        />
                                    </div>

                                    {bookingMutation.isError && (
                                        <p className="text-sm text-destructive">
                                            {(bookingMutation.error as Error)?.message ?? 'تعذّر إتمام الحجز. حاول مرة أخرى.'}
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
                                                    جاري تأكيد الحجز...
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

            <PublicFooter profile={profile} branches={branches} />
        </div>
    );
}
