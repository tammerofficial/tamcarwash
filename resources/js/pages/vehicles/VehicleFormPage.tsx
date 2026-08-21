import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer, PaginatedResponse, Vehicle, VehicleType } from '@/types/api';

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
    { value: 'sedan', label: 'سيدان' },
    { value: 'suv', label: 'دفع رباعي' },
    { value: 'truck', label: 'شاحنة' },
    { value: 'motorcycle', label: 'دراجة نارية' },
    { value: 'van', label: 'فان' },
    { value: 'bus', label: 'حافلة' },
    { value: 'other', label: 'أخرى' },
];

const vehicleSchema = z.object({
    plate_number: z.string().min(2, t('vehicles.validation.plateRequired')),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    vehicle_type: z.enum(['sedan', 'suv', 'truck', 'motorcycle', 'van', 'bus', 'other']).optional(),
    customer_id: z.coerce.number().min(1, t('vehicles.validation.customerRequired')),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export function VehicleFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: vehicle, isLoading } = useAuthenticatedQuery({
        queryKey: ['vehicles', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Vehicle>>(`${endpoints.vehicles}/${id}`);
            return response.data;
        },
        enabled: isEdit,
        retry: false,
    });

    const { data: customers = [] } = useAuthenticatedQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: { plate_number: '', brand: '', model: '', color: '', vehicle_type: 'sedan', customer_id: 0 },
    });

    useEffect(() => {
        if (vehicle) {
            form.reset({
                plate_number: vehicle.plate_number,
                brand: vehicle.brand ?? '',
                model: vehicle.model ?? '',
                color: vehicle.color ?? '',
                vehicle_type: vehicle.vehicle_type ?? 'sedan',
                customer_id: vehicle.customer_id,
            });
        }
    }, [vehicle, form]);

    const mutation = useMutation({
        mutationFn: (values: VehicleFormValues) =>
            isEdit && id
                ? api.put<ApiResponse<Vehicle>>(`${endpoints.vehicles}/${id}`, values)
                : api.post<ApiResponse<Vehicle>>(endpoints.vehicles, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            toast.success(isEdit ? t('vehicles.updated') : t('vehicles.created'));
            navigate('/vehicles');
        },
        onError: (error) => {
            applyFieldErrors<VehicleFormValues>(error, form.setError);
            showApiError(error, isEdit ? t('vehicles.updateError') : t('vehicles.createError'));
        },
    });

    if (isEdit && isLoading) return <Skeleton className="h-64 w-full" />;

    return (
        <FormPage title={isEdit ? t('vehicles.editTitle') : t('vehicles.createTitle')} backTo={isEdit ? `/vehicles/${id}` : '/vehicles'}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="plate_number" render={({ field }) => (
                        <FormItem><FormLabel>{t('vehicles.plate')}</FormLabel><FormControl><Input {...field} dir="ltr" className="uppercase" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="customer_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('vehicles.owner')}</FormLabel>
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('vehicles.selectCustomer')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={String(customer.id)}>{customer.name} — {customer.phone}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField control={form.control} name="brand" render={({ field }) => (
                            <FormItem><FormLabel>{t('vehicles.brand')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="model" render={({ field }) => (
                            <FormItem><FormLabel>{t('vehicles.model')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="color" render={({ field }) => (
                            <FormItem><FormLabel>{t('vehicles.color')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="vehicle_type" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('vehicles.type')}</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {VEHICLE_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
