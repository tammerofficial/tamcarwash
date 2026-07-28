import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { PaginatedResponse, Service } from '@/types/api';

const columns: ColumnDef<Service>[] = [
    { accessorKey: 'name', header: t('services.name') },
    { accessorKey: 'category', header: t('services.category') },
    { accessorKey: 'duration_minutes', header: t('services.duration') },
    {
        accessorKey: 'base_price',
        header: t('services.price'),
        cell: ({ row }) => formatCurrency(row.original.base_price),
    },
    {
        accessorKey: 'vat_inclusive',
        header: t('services.vat'),
        cell: ({ row }) => (row.original.vat_inclusive ? 'شامل' : 'غير شامل'),
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
];

export function ServicesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('services.title')}
                description={t('services.subtitle')}
                actions={
                    <Button>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />
            <DataTable columns={columns} data={data ?? []} searchKey="name" loading={isLoading} />
        </div>
    );
}
