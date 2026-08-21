import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useBranch } from '@/providers/BranchProvider';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';
import type { ApiResponse, Booking, Customer, PaginatedResponse, Service, TimeSlot, Vehicle } from '@/types/api';

const createBookingSchema = z.object({
    customer_id: z.coerce.number().min(1, 'اختر العميل'),
    vehicle_id: z.coerce.number().min(1, 'اختر المركبة'),
    service_id: z.coerce.number().min(1, 'اختر الخدمة'),
    notes: z.string().optional(),
});

type CreateBookingValues = z.infer<typeof createBookingSchema>;

export function BookingCreatePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { selectedBranchId } = useBranch();
    const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [timeSlotId, setTimeSlotId] = useState('');

    const form = useForm<CreateBookingValues>({
        resolver: zodResolver(createBookingSchema),
        defaultValues: { customer_id: 0, vehicle_id: 0, service_id: 0, notes: '' },
    });

    const { data: customers = [] } = useAuthenticatedQuery({
        queryKey: ['customers', 'select'],
        queryFn: async () => (await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 100 })).data,
        retry: false,
    });
    const { data: vehicles = [] } = useAuthenticatedQuery({
        queryKey: ['vehicles', 'select'],
        queryFn: async () => (await api.get<PaginatedResponse<Vehicle>>(endpoints.vehicles, { per_page: 100 })).data,
        retry: false,
    });
    const { data: services = [] } = useAuthenticatedQuery({
        queryKey: ['services', 'select'],
        queryFn: async () => (await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 100 })).data,
        retry: false,
    });
    const { data: timeSlots = [], isLoading: slotsLoading } = useAuthenticatedQuery({
        queryKey: ['time-slots', selectedBranchId, scheduleDate],
        queryFn: async () => (await api.get<ApiResponse<TimeSlot[]>>(endpoints.timeSlots.available, { branch_id: selectedBranchId!, date: scheduleDate })).data,
        enabled: Boolean(selectedBranchId && scheduleDate),
        retry: false,
    });

    const watchedCustomerId = form.watch('customer_id');
    const customerVehicles = useMemo(
        () => vehicles.filter((vehicle) => vehicle.customer_id === watchedCustomerId),
        [vehicles, watchedCustomerId],
    );
    const selectedSlot = useMemo(
        () => timeSlots.find((slot) => String(slot.id) === timeSlotId),
        [timeSlots, timeSlotId],
    );

    const mutation = useMutation({
        mutationFn: async (values: CreateBookingValues) => {
            if (!selectedBranchId || !selectedSlot) throw new Error('اختر الموعد والفرع');
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
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success(t('booking.createSuccess'));
            navigate('/booking');
        },
        onError: (error: Error) => toast.error(error.message || t('booking.createError')),
    });

    return (
        <FormPage title={t('booking.create')} description={t('booking.createHint')} backTo="/booking">
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="customer_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('customers.name')}</FormLabel>
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('booking.selectCustomer')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={String(customer.id)}>{customer.name} — {customer.phone}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="vehicle_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('vehicles.plate')}</FormLabel>
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('booking.selectVehicle')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {customerVehicles.map((vehicle) => (
                                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>{vehicle.plate_number} — {vehicle.brand} {vehicle.model}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="service_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('booking.service')}</FormLabel>
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('booking.selectService')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {services.filter((service) => service.is_active).map((service) => (
                                        <SelectItem key={service.id} value={String(service.id)}>{service.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="space-y-2">
                        <FormLabel>{t('booking.selectDate')}</FormLabel>
                        <Input type="date" value={scheduleDate} onChange={(event) => { setScheduleDate(event.target.value); setTimeSlotId(''); }} min={format(new Date(), 'yyyy-MM-dd')} dir="ltr" />
                    </div>
                    <div className="space-y-2">
                        <FormLabel>{t('booking.selectSlot')}</FormLabel>
                        {slotsLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t('booking.loadingSlots')}</div>
                        ) : timeSlots.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('booking.noSlots')}</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.filter((slot) => slot.is_available).map((slot) => (
                                    <Button key={slot.id} type="button" variant={timeSlotId === String(slot.id) ? 'default' : 'outline'} size="sm" onClick={() => setTimeSlotId(String(slot.id))}>
                                        {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem><FormLabel>{t('booking.notes')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/booking')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending || !selectedSlot}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('booking.create')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
