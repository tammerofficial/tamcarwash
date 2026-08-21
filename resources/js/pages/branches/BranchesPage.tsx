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
import type { Branch, PaginatedResponse } from '@/types/api';

export function BranchesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

    const { data, isLoading, isError, error } = useAuthenticatedQuery({
        queryKey: ['branches'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Branch>>(endpoints.branches, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            showApiError(error, t('branches.loadError'));
        }
    }, [isError, error]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`${endpoints.branches}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success(t('branches.deleted'));
            setDeleteTarget(null);
        },
        onError: (err) => showApiError(err, t('branches.deleteError')),
    });

    const columns = useMemo<ColumnDef<Branch>[]>(
        () => [
            { accessorKey: 'name', header: t('branches.name') },
            { accessorKey: 'code', header: t('branches.code') },
            { accessorKey: 'city', header: t('branches.city') },
            {
                accessorKey: 'capacity',
                header: t('branches.capacity'),
                cell: ({ row }) => row.original.capacity_per_hour ?? row.original.capacity ?? '—',
            },
            {
                id: 'wash_bays_count',
                header: t('branches.bays'),
                cell: ({ row }) => row.original.wash_bays?.length ?? row.original.wash_bays_count ?? 0,
            },
            {
                accessorKey: 'is_active',
                header: t('common.status'),
                cell: ({ row }) => (
                    <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
                        {row.original.is_active ? t('common.active') : t('common.inactive')}
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
                            <DropdownMenuItem onClick={() => navigate(`/branches/${row.original.id}`)}>
                                <Eye className="h-4 w-4" />
                                {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/branches/${row.original.id}/edit`)}>
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
                title={t('branches.title')}
                description={t('branches.subtitle')}
                actions={
                    <Button onClick={() => navigate('/branches/create')}>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />

            <DataTable columns={columns} data={data ?? []} searchKey="name" loading={isLoading} />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={t('branches.deleteTitle')}
                description={`${t('branches.deleteConfirm')} "${deleteTarget?.name ?? ''}"؟`}
                confirmLabel={t('common.delete')}
                loading={deleteMutation.isPending}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            />
        </div>
    );
}
