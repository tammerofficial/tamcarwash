import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t } from '@/lib/i18n';
import type { ApiResponse, Branch, PaginatedResponse, PriceRule, Service } from '@/types/api';

const priceRuleSchema = z.object({
    name: z.string().min(2, t('pricing.nameRequired')),
    rule_type: z.enum(['vehicle_type', 'branch', 'service']),
    branch_id: z.coerce.number().optional(),
    service_id: z.coerce.number().optional(),
    vehicle_type: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    is_active: z.boolean(),
});

type PriceRuleFormValues = z.infer<typeof priceRuleSchema>;

const ruleTypes = [
    { value: 'vehicle_type', label: 'نوع المركبة' },
    { value: 'branch', label: 'الفرع' },
    { value: 'service', label: 'الخدمة' },
];

const vehicleTypes = [
    { value: 'sedan', label: 'سيدان' },
    { value: 'suv', label: 'دفع رباعي' },
    { value: 'truck', label: 'شاحنة' },
    { value: 'motorcycle', label: 'دراجة نارية' },
    { value: 'van', label: 'فان' },
    { value: 'bus', label: 'حافلة' },
    { value: 'other', label: 'أخرى' },
];

export function PriceRuleFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<PriceRuleFormValues>({
        resolver: zodResolver(priceRuleSchema),
        defaultValues: { name: '', rule_type: 'vehicle_type', is_active: true },
    });

    const ruleType = form.watch('rule_type');

    const { data: branches } = useAuthenticatedQuery({
        queryKey: ['branches'],
        queryFn: async () => (await api.get<PaginatedResponse<Branch>>(endpoints.branches, { per_page: 50 })).data,
        retry: false,
    });

    const { data: services } = useAuthenticatedQuery({
        queryKey: ['services'],
        queryFn: async () => (await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 50 })).data,
        retry: false,
    });

    const mutation = useMutation({
        mutationFn: (values: PriceRuleFormValues) => {
            const payload: Record<string, unknown> = {
                name: values.name,
                rule_type: values.rule_type,
                is_active: values.is_active,
            };
            if (values.branch_id) payload.branch_id = values.branch_id;
            if (values.service_id) payload.service_id = values.service_id;
            if (values.vehicle_type) payload.vehicle_type = values.vehicle_type;
            if (values.price !== undefined) payload.price = values.price;
            if (values.discount_percent !== undefined) payload.discount_percent = values.discount_percent;
            return api.post<ApiResponse<PriceRule>>(endpoints.pricing.rules, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
            toast.success(t('pricing.ruleCreated'));
            navigate('/pricing');
        },
        onError: () => toast.error('تعذّر إنشاء قاعدة التسعير'),
    });

    return (
        <FormPage title={t('pricing.addRule')} backTo="/pricing">
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('pricing.ruleName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rule_type" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('pricing.ruleType')}</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ruleTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {ruleType === 'branch' && (
                        <FormField control={form.control} name="branch_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('pricing.branch')}</FormLabel>
                                <Select value={field.value ? String(field.value) : undefined} onValueChange={(value) => field.onChange(Number(value))}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={t('pricing.selectBranch')} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {(branches ?? []).map((branch) => (
                                            <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                    {ruleType === 'service' && (
                        <FormField control={form.control} name="service_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('pricing.service')}</FormLabel>
                                <Select value={field.value ? String(field.value) : undefined} onValueChange={(value) => field.onChange(Number(value))}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={t('pricing.selectService')} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {(services ?? []).map((service) => (
                                            <SelectItem key={service.id} value={String(service.id)}>{service.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                    {ruleType === 'vehicle_type' && (
                        <FormField control={form.control} name="vehicle_type" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('pricing.vehicleType')}</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={t('pricing.selectVehicleType')} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {vehicleTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>{t('pricing.price')}</FormLabel><FormControl><Input type="number" step="0.001" min={0} {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="discount_percent" render={({ field }) => (
                            <FormItem><FormLabel>{t('pricing.discountPercent')}</FormLabel><FormControl><Input type="number" min={0} max={100} {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="is_active" render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                        </FormItem>
                    )} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/pricing')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
