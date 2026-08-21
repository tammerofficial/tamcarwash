import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useBranch } from '@/providers/BranchProvider';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer, PaginatedResponse, QueueEntry, Vehicle } from '@/types/api';

const walkInSchema = z.object({
    customer_id: z.coerce.number().min(1, 'اختر العميل'),
    vehicle_id: z.coerce.number().min(1, 'اختر المركبة'),
    notes: z.string().optional(),
});

type WalkInValues = z.infer<typeof walkInSchema>;

export function QueueWalkInPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { selectedBranchId } = useBranch();

    const form = useForm<WalkInValues>({
        resolver: zodResolver(walkInSchema),
        defaultValues: { customer_id: 0, vehicle_id: 0, notes: '' },
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

    const watchedCustomerId = form.watch('customer_id');
    const customerVehicles = useMemo(
        () => vehicles.filter((vehicle) => vehicle.customer_id === watchedCustomerId),
        [vehicles, watchedCustomerId],
    );

    const mutation = useMutation({
        mutationFn: (values: WalkInValues) =>
            api.post<ApiResponse<QueueEntry>>(endpoints.queue.walkIn, {
                branch_id: selectedBranchId,
                customer_id: values.customer_id,
                vehicle_id: values.vehicle_id,
                notes: values.notes || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queue'] });
            toast.success(t('queue.walkInSuccess'));
            navigate('/queue');
        },
        onError: (error: Error) => toast.error(error.message || t('queue.walkInError')),
    });

    return (
        <FormPage title={t('queue.addWalkIn')} description={t('queue.walkInHint')} backTo="/queue">
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
                    <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem><FormLabel>{t('booking.notes')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/queue')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending || !selectedBranchId}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('queue.addWalkIn')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
