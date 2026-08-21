import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { showApiError } from '@/lib/api-errors';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { t } from '@/lib/i18n';
import type { Customer, PaginatedResponse } from '@/types/api';

const statusLabels: Record<Customer['status'], string> = {
    active: t('common.active'),
    inactive: t('common.inactive'),
    blacklisted: t('customers.blacklisted'),
};

export function CustomersPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

    const { data, isLoading, isError, error } = useAuthenticatedQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            showApiError(error, t('customers.loadError'));
        }
    }, [isError, error]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`${endpoints.customers}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success(t('customers.deleted'));
            setDeleteTarget(null);
        },
        onError: (err) => showApiError(err, t('customers.deleteError')),
    });

    const columns = useMemo<ColumnDef<Customer>[]>(
        () => [
            { accessorKey: 'name', header: t('customers.name') },
            { accessorKey: 'phone', header: t('customers.phone') },
            { accessorKey: 'email', header: t('customers.email') },
            {
                id: 'loyalty_points',
                header: t('customers.loyaltyPoints'),
                cell: ({ row }) => row.original.loyalty_points_balance ?? row.original.loyalty_points ?? 0,
            },
            {
                accessorKey: 'status',
                header: t('common.status'),
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.original.status === 'active'
                                ? 'success'
                                : row.original.status === 'blacklisted'
                                  ? 'destructive'
                                  : 'secondary'
                        }
                    >
                        {statusLabels[row.original.status]}
                    </Badge>
                ),
            },
            {
                id: 'actions',
                header: t('common.actions'),
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/customers/${row.original.id}`)}>
                                <Eye className="h-4 w-4" />
                                {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/customers/${row.original.id}/edit`)}>
                                <Pencil className="h-4 w-4" />
                                {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(row.original)}
                            >
                                <Trash2 className="h-4 w-4" />
                                {t('common.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [navigate],
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('customers.title')}
                description={t('customers.subtitle')}
                actions={
                    <Button onClick={() => navigate('/customers/create')}>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />

            <DataTable columns={columns} data={data ?? []} searchKey="name" loading={isLoading} />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={t('customers.deleteTitle')}
                description={`${t('customers.deleteConfirm')} "${deleteTarget?.name ?? ''}"؟`}
                confirmLabel={t('common.delete')}
                loading={deleteMutation.isPending}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            />
        </div>
    );
}
