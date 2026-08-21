import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useBranch } from '@/providers/BranchProvider';
import { FormPage } from '@/components/common/FormPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, Booking, BookingStatus, PaginatedResponse, Service, TimeSlot } from '@/types/api';

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

function formatBookingDateTime(booking: Booking): string {
    if (!booking.scheduled_date || !booking.scheduled_start_time) return '—';
    return format(new Date(`${booking.scheduled_date}T${booking.scheduled_start_time}`), 'dd MMM yyyy HH:mm', { locale: ar });
}

export function BookingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { selectedBranchId } = useBranch();
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleSlotId, setRescheduleSlotId] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    const { data: booking, isLoading } = useAuthenticatedQuery({
        queryKey: ['bookings', id],
        queryFn: async () => (await api.get<ApiResponse<Booking>>(endpoints.booking(Number(id)))).data,
        enabled: Boolean(id),
        retry: false,
    });

    const { data: services = [] } = useAuthenticatedQuery({
        queryKey: ['services', 'select'],
        queryFn: async () => (await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 100 })).data,
        retry: false,
    });

    const { data: rescheduleSlots = [], isLoading: rescheduleSlotsLoading } = useAuthenticatedQuery({
        queryKey: ['time-slots', selectedBranchId, rescheduleDate],
        queryFn: async () => (await api.get<ApiResponse<TimeSlot[]>>(endpoints.timeSlots.available, { branch_id: selectedBranchId!, date: rescheduleDate })).data,
        enabled: Boolean(selectedBranchId && rescheduleDate),
        retry: false,
    });

    const rescheduleSlot = useMemo(
        () => rescheduleSlots.find((slot) => String(slot.id) === rescheduleSlotId),
        [rescheduleSlots, rescheduleSlotId],
    );

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['bookings', id] });
    };

    const confirmBooking = useMutation({
        mutationFn: () => api.post<ApiResponse<Booking>>(endpoints.bookingConfirm(Number(id))),
        onSuccess: () => { invalidate(); toast.success(t('booking.confirmSuccess')); },
        onError: () => toast.error(t('booking.confirmError')),
    });

    const cancelBooking = useMutation({
        mutationFn: (reason?: string) => api.post<ApiResponse<Booking>>(endpoints.bookingCancel(Number(id)), { reason }),
        onSuccess: () => { invalidate(); toast.success(t('booking.cancelSuccess')); },
        onError: () => toast.error(t('booking.cancelError')),
    });

    const rescheduleBooking = useMutation({
        mutationFn: (slot: TimeSlot) => api.post<ApiResponse<Booking>>(endpoints.bookingReschedule(Number(id)), {
            scheduled_date: rescheduleDate,
            scheduled_start_time: slot.start_time,
            scheduled_end_time: slot.end_time,
            time_slot_id: slot.id,
        }),
        onSuccess: () => { invalidate(); toast.success(t('booking.rescheduleSuccess')); },
        onError: () => toast.error(t('booking.rescheduleError')),
    });

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!booking) return <p className="text-muted-foreground">{t('common.noData')}</p>;

    const canManage = ['pending', 'confirmed'].includes(booking.status);
    const serviceNames = (booking.service_ids ?? []).map((serviceId) => services.find((service) => service.id === serviceId)?.name).filter(Boolean).join('، ') || '—';

    return (
        <FormPage title={booking.booking_number} description={`${booking.customer_name} — ${booking.vehicle_plate}`} backTo="/booking">
            <div className="space-y-6">
                <Badge variant={STATUS_VARIANTS[booking.status]}>{booking.status_label ?? STATUS_LABELS[booking.status]}</Badge>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">{t('booking.scheduledAt')}</span><p className="font-semibold">{formatBookingDateTime(booking)}</p></div>
                    <div><span className="text-muted-foreground">{t('booking.service')}</span><p className="font-semibold">{serviceNames}</p></div>
                </div>
                {booking.notes && <p className="rounded-md border p-3 text-sm">{booking.notes}</p>}
                {canManage && (
                    <>
                        <Separator />
                        {booking.status === 'pending' && (
                            <Button size="sm" disabled={confirmBooking.isPending} onClick={() => confirmBooking.mutate()}>{t('booking.confirm')}</Button>
                        )}
                        <div className="space-y-3">
                            <h3 className="font-medium">{t('booking.reschedule')}</h3>
                            <Input type="date" value={rescheduleDate} onChange={(event) => { setRescheduleDate(event.target.value); setRescheduleSlotId(''); }} min={format(new Date(), 'yyyy-MM-dd')} dir="ltr" />
                            {rescheduleDate && (
                                <>
                                    {rescheduleSlotsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {rescheduleSlots.filter((slot) => slot.is_available).map((slot) => (
                                                <Button key={slot.id} type="button" variant={rescheduleSlotId === String(slot.id) ? 'default' : 'outline'} size="sm" onClick={() => setRescheduleSlotId(String(slot.id))}>
                                                    {slot.start_time.slice(0, 5)}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                    <Button variant="outline" disabled={!rescheduleSlot || rescheduleBooking.isPending} onClick={() => rescheduleBooking.mutate(rescheduleSlot!)}>
                                        {t('booking.reschedule')}
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-medium">{t('booking.cancel')}</h3>
                            <Textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder={t('booking.cancelReason')} rows={2} />
                            <Button variant="destructive" disabled={cancelBooking.isPending} onClick={() => cancelBooking.mutate(cancelReason || undefined)}>
                                <XCircle className="h-4 w-4" />{t('booking.cancel')}
                            </Button>
                        </div>
                    </>
                )}
                <Button variant="outline" onClick={() => navigate('/booking')}>{t('common.back')}</Button>
            </div>
        </FormPage>
    );
}
