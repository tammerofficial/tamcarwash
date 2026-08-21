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
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { t } from '@/lib/i18n';
import type { PaginatedResponse, Vehicle, VehicleType } from '@/types/api';

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
    { value: 'sedan', label: 'سيدان' },
    { value: 'suv', label: 'دفع رباعي' },
    { value: 'truck', label: 'شاحنة' },
    { value: 'motorcycle', label: 'دراجة نارية' },
    { value: 'van', label: 'فان' },
    { value: 'bus', label: 'حافلة' },
    { value: 'other', label: 'أخرى' },
];

export function VehiclesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

    const { data, isLoading, isError, error } = useAuthenticatedQuery({
        queryKey: ['vehicles'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Vehicle>>(endpoints.vehicles, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            showApiError(error, t('vehicles.loadError'));
        }
    }, [isError, error]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`${endpoints.vehicles}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            toast.success(t('vehicles.deleted'));
            setDeleteTarget(null);
        },
        onError: (err) => showApiError(err, t('vehicles.deleteError')),
    });

    const columns = useMemo<ColumnDef<Vehicle>[]>(
        () => [
            { accessorKey: 'plate_number', header: t('vehicles.plate') },
            { accessorKey: 'brand', header: t('vehicles.brand') },
            { accessorKey: 'model', header: t('vehicles.model') },
            { accessorKey: 'color', header: t('vehicles.color') },
            {
                id: 'vehicle_type',
                header: t('vehicles.type'),
                cell: ({ row }) =>
                    row.original.vehicle_type_label ??
                    VEHICLE_TYPES.find((item) => item.value === row.original.vehicle_type)?.label ??
                    row.original.type ??
                    '—',
            },
            {
                accessorKey: 'customer.name',
                header: t('vehicles.owner'),
                cell: ({ row }) => row.original.customer?.name ?? '—',
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
                            <DropdownMenuItem onClick={() => navigate(`/vehicles/${row.original.id}`)}>
                                <Eye className="h-4 w-4" />
                                {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/vehicles/${row.original.id}/edit`)}>
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
                title={t('vehicles.title')}
                description={t('vehicles.subtitle')}
                actions={
                    <Button onClick={() => navigate('/vehicles/create')}>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />

            <DataTable columns={columns} data={data ?? []} searchKey="plate_number" loading={isLoading} />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={t('vehicles.deleteTitle')}
                description={`${t('vehicles.deleteConfirm')} "${deleteTarget?.plate_number ?? ''}"؟`}
                confirmLabel={t('common.delete')}
                loading={deleteMutation.isPending}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            />
        </div>
    );
}
