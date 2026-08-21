import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Eye, MoreHorizontal, PauseCircle, Pencil, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { showApiError } from '@/lib/api-errors';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { PaginatedResponse } from '@/types/api';
import type { LandlordSubscriptionRow, SubscriptionStatus } from '@/types/landlord';

export function subscriptionStatusLabel(status: string): string {
    return t(`landlord.subscriptions.statuses.${status as SubscriptionStatus}`) || status;
}

export function LandlordSubscriptionsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'reactivate'; subscription: LandlordSubscriptionRow } | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-subscriptions'],
        queryFn: () => api.get<PaginatedResponse<LandlordSubscriptionRow>>(endpoints.landlord.subscriptions, { per_page: 100 }),
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
                            <DropdownMenuItem onClick={() => navigate(`/landlord/subscriptions/${subscription.id}/edit`)}>
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
