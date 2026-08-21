import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import type { ApiResponse } from '@/types/api';
import type { LandlordPlan, LandlordSubscriptionRow, SubscriptionStatus } from '@/types/landlord';
import { subscriptionStatusLabel } from '@/pages/landlord/LandlordSubscriptionsPage';

const subscriptionSchema = z.object({
    status: z.enum(['active', 'trial', 'past_due', 'cancelled', 'expired']),
    plan_id: z.string().min(1),
    billing_cycle: z.enum(['monthly', 'yearly']),
    starts_at: z.string().optional(),
    ends_at: z.string().optional(),
    amount: z.coerce.number().min(0).optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

const STATUS_OPTIONS: SubscriptionStatus[] = ['active', 'trial', 'past_due', 'cancelled', 'expired'];

export function LandlordSubscriptionFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-subscription', id],
        queryFn: () => api.get<ApiResponse<LandlordSubscriptionRow>>(endpoints.landlord.subscription(id!)),
        enabled: Boolean(id),
    });

    const { data: plansData } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    const subscription = data?.data;
    const plans = plansData?.data ?? [];

    const form = useForm<SubscriptionFormValues>({
        resolver: zodResolver(subscriptionSchema),
        defaultValues: {
            status: 'active',
            plan_id: '',
            billing_cycle: 'monthly',
            starts_at: '',
            ends_at: '',
            amount: 0,
        },
    });

    useEffect(() => {
        if (subscription) {
            form.reset({
                status: (subscription.status as SubscriptionStatus) ?? 'active',
                plan_id: subscription.plan_id ?? subscription.plan?.id ?? '',
                billing_cycle: (subscription.billing_cycle as 'monthly' | 'yearly') ?? 'monthly',
                starts_at: subscription.starts_at?.slice(0, 10) ?? '',
                ends_at: subscription.ends_at?.slice(0, 10) ?? '',
                amount: subscription.amount,
            });
        }
    }, [subscription, form]);

    const mutation = useMutation({
        mutationFn: (values: SubscriptionFormValues) =>
            api.patch<ApiResponse<LandlordSubscriptionRow>>(endpoints.landlord.subscription(id!), {
                ...values,
                starts_at: values.starts_at || undefined,
                ends_at: values.ends_at || undefined,
            }),
        onSuccess: () => {
            toast.success(t('landlord.subscriptions.updated'));
            queryClient.invalidateQueries({ queryKey: ['landlord-subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['landlord-subscription'] });
            navigate(`/landlord/subscriptions/${id}`);
        },
        onError: (error) => {
            applyFieldErrors(error, form.setError);
            showApiError(error);
        },
    });

    if (isLoading || !subscription) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <FormPage title={t('landlord.subscriptions.edit')} backTo={`/landlord/subscriptions/${id}`}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('landlord.subscriptions.status')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>{subscriptionStatusLabel(status)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="plan_id" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('landlord.subscriptions.plan')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {plans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="billing_cycle" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('landlord.subscriptions.billingCycle')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="monthly">{t('landlord.subscriptions.cycles.monthly')}</SelectItem>
                                    <SelectItem value="yearly">{t('landlord.subscriptions.cycles.yearly')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="amount" render={({ field }) => (
                        <FormItem><FormLabel>{t('landlord.subscriptions.amount')}</FormLabel><FormControl><Input {...field} type="number" step="0.01" dir="ltr" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="starts_at" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.subscriptions.startsAt')}</FormLabel><FormControl><Input {...field} type="date" dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="ends_at" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.subscriptions.endsAt')}</FormLabel><FormControl><Input {...field} type="date" dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate(`/landlord/subscriptions/${id}`)}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
