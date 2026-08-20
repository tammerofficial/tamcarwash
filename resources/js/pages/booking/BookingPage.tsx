import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarDays, Eye, Loader2, Plus, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useBranch, useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { t } from '@/lib/i18n';
import type {
    ApiResponse,
    Booking,
    BookingStatus,
    Customer,
    PaginatedResponse,
    Service,
    TimeSlot,
    Vehicle,
} from '@/types/api';

const STATUS_VARIANTS: Record<BookingStatus, 'warning' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'destructive',
    completed: 'secondary',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
    completed: 'مكتمل',
};

const createBookingSchema = z.object({
    customer_id: z.coerce.number().min(1, 'اختر العميل'),
    vehicle_id: z.coerce.number().min(1, 'اختر المركبة'),
    service_id: z.coerce.number().min(1, 'اختر الخدمة'),
    notes: z.string().optional(),
});

type CreateBookingValues = z.infer<typeof createBookingSchema>;

function formatBookingDateTime(booking: Booking): string {
    if (!booking.scheduled_date || !booking.scheduled_start_time) {
        return '—';
    }
    return format(new Date(`${booking.scheduled_date}T${booking.scheduled_start_time}`), 'dd MMM yyyy HH:mm', {
        locale: ar,
    });
}

function serviceNames(serviceIds: number[] | undefined, services: Service[]): string {
    if (!serviceIds?.length) {
        return '—';
    }
    return serviceIds
        .map((id) => services.find((service) => service.id === id)?.name)
        .filter(Boolean)
        .join('، ') || '—';
}

export function BookingPage() {
    const queryClient = useQueryClient();
    const branchParams = useBranchQueryParams();
    const { selectedBranchId } = useBranch();

    const [createOpen, setCreateOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [filterDate, setFilterDate] = useState('');
    const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [timeSlotId, setTimeSlotId] = useState('');
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleSlotId, setRescheduleSlotId] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    const listParams = {
        per_page: 50,
        ...branchParams,
        ...(filterDate ? { date: filterDate } : {}),
    };

    const { data, isLoading } = useAuthenticatedQuery({
        queryKey: ['bookings', listParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Booking>>(endpoints.bookings, listParams);
            return response.data;
        },
        retry: false,
    });

    const { data: customers = [] } = useAuthenticatedQuery({
        queryKey: ['customers', 'select'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const { data: vehicles = [] } = useAuthenticatedQuery({
        queryKey: ['vehicles', 'select'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Vehicle>>(endpoints.vehicles, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const { data: services = [] } = useAuthenticatedQuery({
        queryKey: ['services', 'select'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const { data: timeSlots = [], isLoading: slotsLoading } = useAuthenticatedQuery({
        queryKey: ['time-slots', selectedBranchId, scheduleDate],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TimeSlot[]>>(endpoints.timeSlots.available, {
                branch_id: selectedBranchId!,
                date: scheduleDate,
            });
            return response.data;
        },
        enabled: Boolean(selectedBranchId && scheduleDate && createOpen),
        retry: false,
    });

    const { data: rescheduleSlots = [], isLoading: rescheduleSlotsLoading } = useAuthenticatedQuery({
        queryKey: ['time-slots', selectedBranchId, rescheduleDate],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TimeSlot[]>>(endpoints.timeSlots.available, {
                branch_id: selectedBranchId!,
                date: rescheduleDate,
            });
            return response.data;
        },
        enabled: Boolean(selectedBranchId && rescheduleDate && selectedBookingId),
        retry: false,
    });

    const { data: selectedBooking, isLoading: detailLoading } = useAuthenticatedQuery({
        queryKey: ['bookings', selectedBookingId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Booking>>(endpoints.booking(selectedBookingId!));
            return response.data;
        },
        enabled: selectedBookingId !== null,
        retry: false,
    });

    const createForm = useForm<CreateBookingValues>({
        resolver: zodResolver(createBookingSchema),
        defaultValues: { customer_id: 0, vehicle_id: 0, service_id: 0, notes: '' },
    });

    const watchedCustomerId = createForm.watch('customer_id');
    const customerVehicles = useMemo(
        () => vehicles.filter((vehicle) => vehicle.customer_id === watchedCustomerId),
        [vehicles, watchedCustomerId],
    );

    const selectedSlot = useMemo(
        () => timeSlots.find((slot) => String(slot.id) === timeSlotId),
        [timeSlots, timeSlotId],
    );

    const rescheduleSlot = useMemo(
        () => rescheduleSlots.find((slot) => String(slot.id) === rescheduleSlotId),
        [rescheduleSlots, rescheduleSlotId],
    );

    const invalidateBookings = () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        if (selectedBookingId) {
            queryClient.invalidateQueries({ queryKey: ['bookings', selectedBookingId] });
        }
    };

    const createBooking = useMutation({
        mutationFn: async (values: CreateBookingValues) => {
            if (!selectedBranchId || !selectedSlot) {
                throw new Error('اختر الموعد والفرع');
            }
            return api.post<ApiResponse<Booking>>(endpoints.bookings, {
                branch_id: selectedBranchId,
                customer_id: values.customer_id,
                vehicle_id: values.vehicle_id,
                time_slot_id: selectedSlot.id,
                scheduled_date: scheduleDate,
                scheduled_start_time: selectedSlot.start_time,
                scheduled_end_time: selectedSlot.end_time,
                service_ids: [values.service_id],
                notes: values.notes || undefined,
            });
        },
        onSuccess: () => {
            invalidateBookings();
            setCreateOpen(false);
            createForm.reset();
            setTimeSlotId('');
            toast.success(t('booking.createSuccess'));
        },
        onError: (error: Error) => toast.error(error.message || t('booking.createError')),
    });

    const confirmBooking = useMutation({
        mutationFn: (bookingId: number) => api.post<ApiResponse<Booking>>(endpoints.bookingConfirm(bookingId)),
        onSuccess: () => {
            invalidateBookings();
            toast.success(t('booking.confirmSuccess'));
        },
        onError: () => toast.error(t('booking.confirmError')),
    });

    const cancelBooking = useMutation({
        mutationFn: ({ bookingId, reason }: { bookingId: number; reason?: string }) =>
            api.post<ApiResponse<Booking>>(endpoints.bookingCancel(bookingId), { reason }),
        onSuccess: () => {
            invalidateBookings();
            setCancelReason('');
            toast.success(t('booking.cancelSuccess'));
        },
        onError: () => toast.error(t('booking.cancelError')),
    });

    const rescheduleBooking = useMutation({
        mutationFn: ({ bookingId, slot }: { bookingId: number; slot: TimeSlot }) =>
            api.post<ApiResponse<Booking>>(endpoints.bookingReschedule(bookingId), {
                scheduled_date: rescheduleDate,
                scheduled_start_time: slot.start_time,
                scheduled_end_time: slot.end_time,
                time_slot_id: slot.id,
            }),
        onSuccess: () => {
            invalidateBookings();
            setRescheduleDate('');
            setRescheduleSlotId('');
            toast.success(t('booking.rescheduleSuccess'));
        },
        onError: () => toast.error(t('booking.rescheduleError')),
    });

    const columns: ColumnDef<Booking>[] = [
        { accessorKey: 'booking_number', header: t('booking.bookingNumber') },
        {
            id: 'customer_name',
            header: t('customers.name'),
            cell: ({ row }) => row.original.customer_name ?? '—',
        },
        {
            id: 'vehicle_plate',
            header: t('vehicles.plate'),
            cell: ({ row }) => row.original.vehicle_plate ?? '—',
        },
        {
            id: 'service',
            header: t('booking.service'),
            cell: ({ row }) => serviceNames(row.original.service_ids, services),
        },
        {
            id: 'scheduled_at',
            header: t('booking.scheduledAt'),
            cell: ({ row }) => formatBookingDateTime(row.original),
        },
        {
            accessorKey: 'status',
            header: t('common.status'),
            cell: ({ row }) => (
                <Badge variant={STATUS_VARIANTS[row.original.status]}>
                    {row.original.status_label ?? STATUS_LABELS[row.original.status]}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedBookingId(row.original.id)}>
                    <Eye className="h-4 w-4" />
                    {t('common.view')}
                </Button>
            ),
        },
    ];

    const canManage = selectedBooking && ['pending', 'confirmed'].includes(selectedBooking.status);

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('booking.title')}
                description={t('booking.subtitle')}
                actions={
                    <Button onClick={() => setCreateOpen(true)} disabled={!selectedBranchId}>
                        <Plus className="h-4 w-4" />
                        {t('booking.create')}
                    </Button>
                }
            />

            <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('booking.filterDate')}</label>
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(event) => setFilterDate(event.target.value)}
                            dir="ltr"
                            className="w-auto"
                        />
                        {filterDate && (
                            <Button variant="ghost" size="sm" onClick={() => setFilterDate('')}>
                                {t('common.clear')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <DataTable columns={columns} data={data ?? []} searchKey="booking_number" loading={isLoading} />

            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
                <SheetContent side="start" className="w-full overflow-y-auto sm:max-w-lg">
                    <h2 className="text-lg font-semibold">{t('booking.create')}</h2>
                    <p className="text-sm text-muted-foreground">{t('booking.createHint')}</p>
                    <Form {...createForm}>
                        <form
                            onSubmit={createForm.handleSubmit((values) => createBooking.mutate(values))}
                            className="mt-6 space-y-4"
                        >
                            <FormField
                                control={createForm.control}
                                name="customer_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('customers.name')}</FormLabel>
                                        <Select
                                            value={field.value ? String(field.value) : ''}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('booking.selectCustomer')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={String(customer.id)}>
                                                        {customer.name} — {customer.phone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={createForm.control}
                                name="vehicle_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('vehicles.plate')}</FormLabel>
                                        <Select
                                            value={field.value ? String(field.value) : ''}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('booking.selectVehicle')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customerVehicles.map((vehicle) => (
                                                    <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                                                        {vehicle.plate_number} — {vehicle.brand} {vehicle.model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={createForm.control}
                                name="service_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('booking.service')}</FormLabel>
                                        <Select
                                            value={field.value ? String(field.value) : ''}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('booking.selectService')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {services
                                                    .filter((service) => service.is_active)
                                                    .map((service) => (
                                                        <SelectItem key={service.id} value={String(service.id)}>
                                                            {service.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>{t('booking.selectDate')}</FormLabel>
                                <Input
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(event) => {
                                        setScheduleDate(event.target.value);
                                        setTimeSlotId('');
                                    }}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-2">
                                <FormLabel>{t('booking.selectSlot')}</FormLabel>
                                {slotsLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('booking.loadingSlots')}
                                    </div>
                                ) : timeSlots.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t('booking.noSlots')}</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {timeSlots
                                            .filter((slot) => slot.is_available)
                                            .map((slot) => (
                                                <Button
                                                    key={slot.id}
                                                    type="button"
                                                    variant={timeSlotId === String(slot.id) ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setTimeSlotId(String(slot.id))}
                                                >
                                                    {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                                                </Button>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <FormField
                                control={createForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('booking.notes')}</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={3} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={createBooking.isPending || !selectedSlot}
                                className="w-full"
                            >
                                {createBooking.isPending ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {t('common.saving')}
                                    </>
                                ) : (
                                    t('booking.create')
                                )}
                            </Button>
                        </form>
                    </Form>
                </SheetContent>
            </Sheet>

            <Sheet open={selectedBookingId !== null} onOpenChange={(open) => !open && setSelectedBookingId(null)}>
                <SheetContent side="start" className="w-full overflow-y-auto sm:max-w-xl">
                    {detailLoading || !selectedBooking ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold">{selectedBooking.booking_number}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {selectedBooking.customer_name} — {selectedBooking.vehicle_plate}
                                </p>
                                <Badge className="mt-2" variant={STATUS_VARIANTS[selectedBooking.status]}>
                                    {selectedBooking.status_label ?? STATUS_LABELS[selectedBooking.status]}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">{t('booking.scheduledAt')}</span>
                                    <p className="font-semibold">{formatBookingDateTime(selectedBooking)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t('booking.service')}</span>
                                    <p className="font-semibold">
                                        {serviceNames(selectedBooking.service_ids, services)}
                                    </p>
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <p className="rounded-md border p-3 text-sm">{selectedBooking.notes}</p>
                            )}

                            {canManage && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <h3 className="font-medium">{t('booking.actions')}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedBooking.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    disabled={confirmBooking.isPending}
                                                    onClick={() => confirmBooking.mutate(selectedBooking.id)}
                                                >
                                                    {t('booking.confirm')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-medium">{t('booking.reschedule')}</h3>
                                        <Input
                                            type="date"
                                            value={rescheduleDate}
                                            onChange={(event) => {
                                                setRescheduleDate(event.target.value);
                                                setRescheduleSlotId('');
                                            }}
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                            dir="ltr"
                                        />
                                        {rescheduleDate && (
                                            <>
                                                {rescheduleSlotsLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {rescheduleSlots
                                                            .filter((slot) => slot.is_available)
                                                            .map((slot) => (
                                                                <Button
                                                                    key={slot.id}
                                                                    type="button"
                                                                    variant={
                                                                        rescheduleSlotId === String(slot.id)
                                                                            ? 'default'
                                                                            : 'outline'
                                                                    }
                                                                    size="sm"
                                                                    onClick={() => setRescheduleSlotId(String(slot.id))}
                                                                >
                                                                    {slot.start_time.slice(0, 5)}
                                                                </Button>
                                                            ))}
                                                    </div>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    disabled={!rescheduleSlot || rescheduleBooking.isPending}
                                                    onClick={() =>
                                                        rescheduleBooking.mutate({
                                                            bookingId: selectedBooking.id,
                                                            slot: rescheduleSlot!,
                                                        })
                                                    }
                                                >
                                                    {t('booking.reschedule')}
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-medium">{t('booking.cancel')}</h3>
                                        <Textarea
                                            value={cancelReason}
                                            onChange={(event) => setCancelReason(event.target.value)}
                                            placeholder={t('booking.cancelReason')}
                                            rows={2}
                                        />
                                        <Button
                                            variant="destructive"
                                            disabled={cancelBooking.isPending}
                                            onClick={() =>
                                                cancelBooking.mutate({
                                                    bookingId: selectedBooking.id,
                                                    reason: cancelReason || undefined,
                                                })
                                            }
                                        >
                                            <XCircle className="h-4 w-4" />
                                            {t('booking.cancel')}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
