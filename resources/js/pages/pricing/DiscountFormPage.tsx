import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t } from '@/lib/i18n';
import type { ApiResponse, Discount } from '@/types/api';

const discountSchema = z.object({
    name: z.string().min(2, t('pricing.discountName')),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().min(0),
    is_active: z.boolean(),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

export function DiscountFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<DiscountFormValues>({
        resolver: zodResolver(discountSchema),
        defaultValues: { name: '', type: 'percentage', value: 10, is_active: true },
    });

    const mutation = useMutation({
        mutationFn: (values: DiscountFormValues) => api.post<ApiResponse<Discount>>(endpoints.pricing.discounts, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-discounts'] });
            toast.success(t('pricing.discountCreated'));
            navigate('/pricing/coupons/create');
        },
        onError: () => toast.error('تعذّر إنشاء الخصم'),
    });

    return (
        <FormPage title={t('pricing.createDiscount')} backTo="/pricing/coupons/create">
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('pricing.discountName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('pricing.ruleType')}</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="percentage">نسبة مئوية</SelectItem>
                                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="value" render={({ field }) => (
                        <FormItem><FormLabel>{t('pricing.discount')}</FormLabel><FormControl><Input type="number" min={0} {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/pricing/coupons/create')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
