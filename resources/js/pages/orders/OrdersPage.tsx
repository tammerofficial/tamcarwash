import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { api, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Order, PaginatedResponse } from '@/types/api';

const columns: ColumnDef<Order>[] = [
    { accessorKey: 'order_number', header: t('orders.orderNumber') },
    { accessorKey: 'customer_name', header: t('customers.name') },
    { accessorKey: 'vehicle_plate', header: t('vehicles.plate') },
    {
        accessorKey: 'total',
        header: t('common.total'),
        cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
        accessorKey: 'status',
        header: t('common.status'),
        cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
    },
    {
        accessorKey: 'created_at',
        header: t('orders.createdAt'),
        cell: ({ row }) => format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm', { locale: ar }),
    },
];

export function OrdersPage() {
    const branchParams = useBranchQueryParams();

    const { data, isLoading } = useQuery({
        queryKey: ['orders', branchParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Order>>(endpoints.orders, {
                per_page: 50,
                ...branchParams,
            });
            return response.data;
        },
        retry: false,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('orders.title')}
                description={t('orders.subtitle')}
                actions={
                    <Button>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />
            <DataTable columns={columns} data={data ?? []} searchKey="order_number" loading={isLoading} />
        </div>
    );
}
