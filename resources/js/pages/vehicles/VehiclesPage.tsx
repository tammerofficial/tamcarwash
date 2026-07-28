import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { PaginatedResponse, Vehicle } from '@/types/api';

const columns: ColumnDef<Vehicle>[] = [
    { accessorKey: 'plate_number', header: t('vehicles.plate') },
    { accessorKey: 'brand', header: t('vehicles.brand') },
    { accessorKey: 'model', header: t('vehicles.model') },
    { accessorKey: 'color', header: t('vehicles.color') },
    { accessorKey: 'type', header: t('vehicles.type') },
    {
        accessorKey: 'customer.name',
        header: t('vehicles.owner'),
        cell: ({ row }) => row.original.customer?.name ?? '—',
    },
];

export function VehiclesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['vehicles'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Vehicle>>(endpoints.vehicles, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('vehicles.title')}
                description={t('vehicles.subtitle')}
                actions={
                    <Button>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />
            <DataTable columns={columns} data={data ?? []} searchKey="plate_number" loading={isLoading} />
        </div>
    );
}
