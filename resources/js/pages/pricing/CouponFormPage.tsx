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
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Coupon, Discount, PaginatedResponse } from '@/types/api';

const couponSchema = z.object({
    discount_id: z.coerce.number().min(1, t('pricing.discountRequired')),
    code: z.string().min(2, t('pricing.codeRequired')).max(50),
    max_uses: z.coerce.number().min(1).optional(),
    is_active: z.boolean(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export function CouponFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: discounts } = useAuthenticatedQuery({
        queryKey: ['pricing-discounts'],
        queryFn: async () => (await api.get<PaginatedResponse<Discount>>(endpoints.pricing.discounts, { per_page: 50 })).data,
        retry: false,
    });

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: { discount_id: 0, code: '', is_active: true },
    });

    const mutation = useMutation({
        mutationFn: (values: CouponFormValues) =>
            api.post<ApiResponse<Coupon>>(endpoints.pricing.coupons, { ...values, code: values.code.toUpperCase() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-coupons'] });
            toast.success(t('pricing.couponCreated'));
            navigate('/pricing');
        },
        onError: () => toast.error('تعذّر إنشاء الكوبون'),
    });

    return (
        <FormPage title={t('pricing.addCoupon')} backTo="/pricing">
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="discount_id" render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>{t('pricing.selectDiscount')}</FormLabel>
                                <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => navigate('/pricing/discounts/create')}>
                                    {t('pricing.createDiscount')}
                                </Button>
                            </div>
                            <Select value={field.value ? String(field.value) : undefined} onValueChange={(value) => field.onChange(Number(value))}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('pricing.selectDiscount')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {(discounts ?? []).map((discount) => (
                                        <SelectItem key={discount.id} value={String(discount.id)}>
                                            {discount.name} ({discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="code" render={({ field }) => (
                        <FormItem><FormLabel>{t('pricing.couponCode')}</FormLabel><FormControl><Input {...field} dir="ltr" className="uppercase" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="max_uses" render={({ field }) => (
                        <FormItem><FormLabel>{t('pricing.maxUses')}</FormLabel><FormControl><Input type="number" min={1} {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                    )} />
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
