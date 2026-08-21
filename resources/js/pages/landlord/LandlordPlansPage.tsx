import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { LandlordPlan } from '@/types/landlord';

export function LandlordPlansPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deletingPlan, setDeletingPlan] = useState<LandlordPlan | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    const deleteMutation = useMutation({
        mutationFn: (plan: LandlordPlan) => api.delete(endpoints.landlord.plan(plan.id)),
        onSuccess: () => {
            toast.success(t('landlord.plans.deleted'));
            queryClient.invalidateQueries({ queryKey: ['landlord-plans'] });
            setDeletingPlan(null);
        },
        onError: (error) => showApiError(error),
    });

    const plans = data?.data ?? [];

    const columns = useMemo<ColumnDef<LandlordPlan>[]>(() => [
        { accessorKey: 'name', header: t('landlord.plans.name'), cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
        { accessorKey: 'slug', header: t('landlord.plans.slug'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug}</span> },
        {
            id: 'price',
            header: t('landlord.plans.priceMonthly'),
            cell: ({ row }) => formatCurrency(row.original.price_monthly, row.original.currency),
        },
        {
            accessorKey: 'max_branches',
            header: t('landlord.plans.branches'),
            cell: ({ row }) => row.original.max_branches ?? t('landlord.plans.unlimited'),
        },
        {
            accessorKey: 'is_active',
            header: t('common.status'),
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => {
                const plan = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => navigate(`/landlord/plans/${plan.id}`)}>
                                <Eye className="me-2 h-4 w-4" />{t('landlord.plans.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/landlord/plans/${plan.id}/edit`)}>
                                <Pencil className="me-2 h-4 w-4" />{t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeletingPlan(plan)}>
                                <Trash2 className="me-2 h-4 w-4" />{t('common.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [navigate]);

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader
                title={t('landlord.plans.title')}
                description={t('landlord.plans.subtitle')}
                actions={
                    <Button onClick={() => navigate('/landlord/plans/create')}>
                        <Plus className="me-2 h-4 w-4" />{t('landlord.plans.add')}
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('landlord.plans.title')}</CardTitle>
                    <CardDescription>{t('landlord.plans.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : plans.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-30" />
                            <p className="font-bold">{t('landlord.plans.emptyTitle')}</p>
                            <p className="text-sm">{t('landlord.plans.emptyHint')}</p>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={plans} searchKey="name" searchPlaceholder={t('common.search')} />
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={Boolean(deletingPlan)}
                onOpenChange={(open) => !open && setDeletingPlan(null)}
                title={t('landlord.plans.deleteTitle')}
                description={t('landlord.plans.deleteHint')}
                confirmLabel={t('common.delete')}
                onConfirm={() => deletingPlan && deleteMutation.mutate(deletingPlan)}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
