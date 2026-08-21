import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, ExternalLink, Eye, MoreHorizontal, PauseCircle, Pencil, PlayCircle, Plus, Trash2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { PaginatedResponse } from '@/types/api';
import type { LandlordTenantRow, TenantStatus } from '@/types/landlord';

export function statusLabel(status: string): string {
    return t(`landlord.tenants.statuses.${status as TenantStatus}`) || status;
}

export function LandlordTenantsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'suspend' | 'activate'; tenant: LandlordTenantRow } | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-tenants'],
        queryFn: () => api.get<PaginatedResponse<LandlordTenantRow>>(endpoints.landlord.tenants, { per_page: 100 }),
    });

    const actionMutation = useMutation({
        mutationFn: async (action: NonNullable<typeof confirmAction>) => {
            if (action.type === 'delete') {
                return api.delete(endpoints.landlord.tenant(action.tenant.id));
            }
            return api.patch(endpoints.landlord.tenant(action.tenant.id), {
                status: action.type === 'suspend' ? 'suspended' : 'active',
            });
        },
        onSuccess: (_, action) => {
            const message =
                action.type === 'delete' ? t('landlord.tenants.deleted')
                : action.type === 'suspend' ? t('landlord.tenants.suspended')
                : t('landlord.tenants.activated');
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ['landlord-tenants'] });
            setConfirmAction(null);
        },
        onError: (error) => showApiError(error),
    });

    const columns = useMemo<ColumnDef<LandlordTenantRow>[]>(() => [
        { accessorKey: 'name', header: t('landlord.tenants.name'), cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
        { accessorKey: 'slug', header: 'Slug', cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug}</span> },
        {
            accessorKey: 'plan',
            header: t('landlord.tenants.plan'),
            cell: ({ row }) => <Badge variant="secondary">{row.original.plan?.name ?? '—'}</Badge>,
        },
        {
            accessorKey: 'status',
            header: t('landlord.tenants.status'),
            cell: ({ row }) => (
                <Badge className={cn(row.original.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
                    {statusLabel(row.original.status)}
                </Badge>
            ),
        },
        {
            id: 'subscription',
            header: t('landlord.tenants.subscription'),
            cell: ({ row }) => (
                <div className="text-sm">
                    <div>{row.original.subscription_status ?? '—'}</div>
                    {row.original.subscription_ends_at && (
                        <div className="text-xs text-muted-foreground">
                            {new Date(row.original.subscription_ends_at).toLocaleDateString('ar-OM')}
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => {
                const tenant = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => navigate(`/landlord/tenants/${tenant.id}`)}>
                                <Eye className="me-2 h-4 w-4" />{t('landlord.tenants.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/landlord/tenants/${tenant.id}/edit`)}>
                                <Pencil className="me-2 h-4 w-4" />{t('common.edit')}
                            </DropdownMenuItem>
                            {tenant.status === 'active' && tenant.dashboard_url && (
                                <DropdownMenuItem asChild>
                                    <a href={tenant.dashboard_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="me-2 h-4 w-4" />{t('landlord.tenants.openDashboard')}
                                    </a>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {tenant.status === 'active' ? (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: 'suspend', tenant })}>
                                    <PauseCircle className="me-2 h-4 w-4" />{t('landlord.tenants.suspend')}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: 'activate', tenant })}>
                                    <PlayCircle className="me-2 h-4 w-4" />{t('landlord.tenants.activate')}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ type: 'delete', tenant })}>
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
                title={t('landlord.tenants.title')}
                description={t('landlord.tenants.subtitle')}
                actions={
                    <Button onClick={() => navigate('/landlord/tenants/create')}>
                        <Plus className="me-2 h-4 w-4" />{t('landlord.tenants.add')}
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('landlord.tenants.listTitle')}</CardTitle>
                    <CardDescription>{t('landlord.tenants.listHint')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (data?.data ?? []).length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Building2 className="mx-auto mb-4 h-12 w-12 opacity-30" />
                            <p className="font-bold">{t('landlord.tenants.emptyTitle')}</p>
                            <p className="text-sm">{t('landlord.tenants.emptyHint')}</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data?.data ?? []}
                            searchKey="name"
                            searchPlaceholder={t('landlord.tenants.searchPlaceholder')}
                        />
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={Boolean(confirmAction)}
                onOpenChange={(open) => !open && setConfirmAction(null)}
                title={
                    confirmAction?.type === 'delete' ? t('landlord.tenants.deleteTitle')
                    : confirmAction?.type === 'suspend' ? t('landlord.tenants.suspendTitle')
                    : t('landlord.tenants.activate')
                }
                description={
                    confirmAction?.type === 'delete' ? t('landlord.tenants.deleteHint')
                    : confirmAction?.type === 'suspend' ? t('landlord.tenants.suspendHint')
                    : ''
                }
                confirmLabel={
                    confirmAction?.type === 'delete' ? t('common.delete')
                    : confirmAction?.type === 'suspend' ? t('landlord.tenants.suspend')
                    : t('landlord.tenants.activate')
                }
                onConfirm={() => confirmAction && actionMutation.mutate(confirmAction)}
                loading={actionMutation.isPending}
                destructive={confirmAction?.type !== 'activate'}
            />
        </div>
    );
}
