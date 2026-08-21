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
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer, Order, PaginatedResponse, Service, Vehicle } from '@/types/api';

const createOrderSchema = z.object({
    customer_id: z.coerce.number().min(1, 'اختر العميل'),
    vehicle_id: z.coerce.number().optional(),
    notes: z.string().optional(),
    service_id: z.coerce.number().min(1, 'اختر الخدمة'),
});

type CreateOrderValues = z.infer<typeof createOrderSchema>;

export function OrderCreatePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { selectedBranchId } = useBranch();

    const form = useForm<CreateOrderValues>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: { customer_id: 0, vehicle_id: undefined, notes: '', service_id: 0 },
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

    const watchedCustomerId = form.watch('customer_id');
    const customerVehicles = useMemo(
        () => vehicles.filter((vehicle) => vehicle.customer_id === watchedCustomerId),
        [vehicles, watchedCustomerId],
    );

    const mutation = useMutation({
        mutationFn: async (values: CreateOrderValues) => {
            if (!selectedBranchId) throw new Error('اختر فرعاً أولاً');
            const service = services.find((item) => item.id === values.service_id);
            if (!service) throw new Error('الخدمة غير موجودة');
            return api.post<ApiResponse<Order>>(endpoints.orders, {
                branch_id: selectedBranchId,
                customer_id: values.customer_id,
                vehicle_id: values.vehicle_id || undefined,
                source: 'walk_in',
                notes: values.notes,
                items: [{ item_type: 'service', name: service.name, service_id: service.id, quantity: 1, unit_price: service.base_price }],
            });
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('تم إنشاء الطلب');
            navigate(`/orders/${response.data.id}`);
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر إنشاء الطلب'),
    });

    return (
        <FormPage title={t('orders.createWalkIn')} description={t('orders.createWalkInHint')} backTo="/orders">
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="customer_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('customers.name')}</FormLabel>
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('orders.selectCustomer')} /></SelectTrigger></FormControl>
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
                                <FormControl><SelectTrigger><SelectValue placeholder={t('orders.selectVehicle')} /></SelectTrigger></FormControl>
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
                            <FormLabel>{t('services.name')}</FormLabel>
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('orders.selectService')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {services.filter((service) => service.is_active).map((service) => (
                                        <SelectItem key={service.id} value={String(service.id)}>{service.name} — {formatCurrency(service.base_price)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem><FormLabel>{t('orders.notes')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/orders')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending || !selectedBranchId}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('orders.createWalkIn')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
