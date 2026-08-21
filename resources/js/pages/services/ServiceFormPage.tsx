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
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, PaginatedResponse, Service, ServiceCategory } from '@/types/api';

const serviceSchema = z.object({
    category_id: z.coerce.number().min(1, t('services.categoryRequired')),
    name: z.string().min(2, t('services.nameRequired')),
    duration_minutes: z.coerce.number().min(1).max(480),
    base_price: z.coerce.number().min(0),
    vat_included: z.boolean(),
    is_active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export function ServiceFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: categories } = useAuthenticatedQuery({
        queryKey: ['service-categories'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<ServiceCategory>>(endpoints.serviceCategories, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const { data: service, isLoading } = useAuthenticatedQuery({
        queryKey: ['services', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Service>>(endpoints.service(Number(id)));
            return response.data;
        },
        enabled: isEdit,
        retry: false,
    });

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: { category_id: 0, name: '', duration_minutes: 30, base_price: 0, vat_included: false, is_active: true },
    });

    useEffect(() => {
        if (service) {
            form.reset({
                category_id: service.category_id,
                name: service.name,
                duration_minutes: service.duration_minutes,
                base_price: service.base_price,
                vat_included: service.vat_included,
                is_active: service.is_active,
            });
        }
    }, [service, form]);

    const mutation = useMutation({
        mutationFn: (values: ServiceFormValues) =>
            isEdit && id
                ? api.put<ApiResponse<Service>>(endpoints.service(Number(id)), values)
                : api.post<ApiResponse<Service>>(endpoints.services, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success(isEdit ? t('services.updated') : t('services.created'));
            navigate('/services');
        },
        onError: () => toast.error('تعذّر حفظ الخدمة'),
    });

    if (isEdit && isLoading) return <Skeleton className="h-64 w-full" />;

    return (
        <FormPage title={isEdit ? t('services.editService') : t('services.addService')} backTo={isEdit ? `/services/${id}` : '/services'}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="category_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('services.category')}</FormLabel>
                            <Select value={field.value ? String(field.value) : undefined} onValueChange={(value) => field.onChange(Number(value))}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('services.selectCategory')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {(categories ?? []).map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('services.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="duration_minutes" render={({ field }) => (
                            <FormItem><FormLabel>{t('services.duration')}</FormLabel><FormControl><Input type="number" min={1} {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="base_price" render={({ field }) => (
                            <FormItem><FormLabel>{t('services.price')}</FormLabel><FormControl><Input type="number" step="0.001" min={0} {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="vat_included" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="!mt-0">{t('services.vatIncluded')}</FormLabel>
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="is_active" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                        </FormItem>
                    )} />
                    {isEdit && service && (
                        <div className="rounded-md border p-4">
                            <p className="mb-2 text-sm font-medium">{t('services.addons')}</p>
                            {service.addons?.length ? (
                                <ul className="space-y-2 text-sm">
                                    {service.addons.map((addon) => (
                                        <li key={addon.id} className="flex justify-between rounded bg-muted/50 px-3 py-2">
                                            <span>{addon.name}</span>
                                            <span>{formatCurrency(addon.price)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('services.addonsEmpty')}</p>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/services')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
