import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Eye, Loader2, MoreHorizontal, PauseCircle, Pencil, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { LandlordPlan, LandlordSubscriptionRow, SubscriptionStatus } from '@/types/landlord';

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

export function subscriptionStatusLabel(status: string): string {
    return t(`landlord.subscriptions.statuses.${status as SubscriptionStatus}`) || status;
}

export function SubscriptionFormDialog({
    open,
    onOpenChange,
    subscription,
    plans,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription: LandlordSubscriptionRow;
    plans: LandlordPlan[];
}) {
    const queryClient = useQueryClient();

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
        if (open && subscription) {
            form.reset({
                status: (subscription.status as SubscriptionStatus) ?? 'active',
                plan_id: subscription.plan_id ?? subscription.plan?.id ?? '',
                billing_cycle: (subscription.billing_cycle as 'monthly' | 'yearly') ?? 'monthly',
                starts_at: subscription.starts_at?.slice(0, 10) ?? '',
                ends_at: subscription.ends_at?.slice(0, 10) ?? '',
                amount: subscription.amount,
            });
        }
    }, [open, subscription, form]);

    const mutation = useMutation({
        mutationFn: (values: SubscriptionFormValues) =>
            api.patch<ApiResponse<LandlordSubscriptionRow>>(endpoints.landlord.subscription(subscription.id), {
                ...values,
                starts_at: values.starts_at || undefined,
                ends_at: values.ends_at || undefined,
            }),
        onSuccess: () => {
            toast.success(t('landlord.subscriptions.updated'));
            queryClient.invalidateQueries({ queryKey: ['landlord-subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['landlord-subscription'] });
            onOpenChange(false);
        },
        onError: (error) => {
            applyFieldErrors(error, form.setError);
            showApiError(error);
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{t('landlord.subscriptions.edit')}</DialogTitle>
                </DialogHeader>
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
                        <FormField control={form.control} name="starts_at" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.subscriptions.startsAt')}</FormLabel><FormControl><Input {...field} type="date" dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="ends_at" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.subscriptions.endsAt')}</FormLabel><FormControl><Input {...field} type="date" dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function LandlordSubscriptionsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editingSubscription, setEditingSubscription] = useState<LandlordSubscriptionRow | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'reactivate'; subscription: LandlordSubscriptionRow } | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-subscriptions'],
        queryFn: () => api.get<PaginatedResponse<LandlordSubscriptionRow>>(endpoints.landlord.subscriptions, { per_page: 100 }),
    });

    const { data: plansData } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    const actionMutation = useMutation({
        mutationFn: (action: NonNullable<typeof confirmAction>) =>
            action.type === 'cancel'
                ? api.post(endpoints.landlord.subscriptionCancel(action.subscription.id))
                : api.post(endpoints.landlord.subscriptionReactivate(action.subscription.id)),
        onSuccess: (_, action) => {
            toast.success(action.type === 'cancel' ? t('landlord.subscriptions.cancelled') : t('landlord.subscriptions.reactivated'));
            queryClient.invalidateQueries({ queryKey: ['landlord-subscriptions'] });
            setConfirmAction(null);
        },
        onError: (error) => showApiError(error),
    });

    const columns = useMemo<ColumnDef<LandlordSubscriptionRow>[]>(() => [
        {
            id: 'tenant',
            accessorFn: (row) => row.tenant?.name ?? '',
            header: t('landlord.subscriptions.tenant'),
            cell: ({ row }) => <span className="font-bold">{row.original.tenant?.name ?? '—'}</span>,
        },
        {
            accessorKey: 'plan',
            header: t('landlord.subscriptions.plan'),
            cell: ({ row }) => row.original.plan?.name ?? '—',
        },
        {
            accessorKey: 'status',
            header: t('landlord.subscriptions.status'),
            cell: ({ row }) => <Badge>{subscriptionStatusLabel(row.original.status)}</Badge>,
        },
        {
            id: 'amount',
            header: t('landlord.subscriptions.amount'),
            cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
        },
        {
            id: 'ends_at',
            header: t('landlord.subscriptions.endsAt'),
            cell: ({ row }) => row.original.ends_at ? new Date(row.original.ends_at).toLocaleDateString('ar-OM') : '—',
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => {
                const subscription = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => navigate(`/landlord/subscriptions/${subscription.id}`)}>
                                <Eye className="me-2 h-4 w-4" />{t('landlord.subscriptions.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingSubscription(subscription)}>
                                <Pencil className="me-2 h-4 w-4" />{t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {subscription.status === 'cancelled' ? (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: 'reactivate', subscription })}>
                                    <PlayCircle className="me-2 h-4 w-4" />{t('landlord.subscriptions.reactivate')}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ type: 'cancel', subscription })}>
                                    <PauseCircle className="me-2 h-4 w-4" />{t('landlord.subscriptions.cancel')}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [navigate]);

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader title={t('landlord.subscriptions.title')} description={t('landlord.subscriptions.subtitle')} />

            <Card>
                <CardHeader>
                    <CardTitle>{t('landlord.subscriptions.listTitle')}</CardTitle>
                    <CardDescription>{t('landlord.subscriptions.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (data?.data ?? []).length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-30" />
                            <p className="font-bold">{t('landlord.subscriptions.emptyTitle')}</p>
                            <p className="text-sm">{t('landlord.subscriptions.emptyHint')}</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data?.data ?? []}
                            searchKey="tenant"
                            searchPlaceholder={t('landlord.subscriptions.searchPlaceholder')}
                        />
                    )}
                </CardContent>
            </Card>

            {editingSubscription && (
                <SubscriptionFormDialog
                    open={Boolean(editingSubscription)}
                    onOpenChange={(open) => !open && setEditingSubscription(null)}
                    subscription={editingSubscription}
                    plans={plansData?.data ?? []}
                />
            )}

            <ConfirmDialog
                open={Boolean(confirmAction)}
                onOpenChange={(open) => !open && setConfirmAction(null)}
                title={confirmAction?.type === 'cancel' ? t('landlord.subscriptions.cancelTitle') : t('landlord.subscriptions.reactivateTitle')}
                description={confirmAction?.type === 'cancel' ? t('landlord.subscriptions.cancelHint') : t('landlord.subscriptions.reactivateHint')}
                confirmLabel={confirmAction?.type === 'cancel' ? t('landlord.subscriptions.cancel') : t('landlord.subscriptions.reactivate')}
                onConfirm={() => confirmAction && actionMutation.mutate(confirmAction)}
                loading={actionMutation.isPending}
                destructive={confirmAction?.type === 'cancel'}
            />
        </div>
    );
}
