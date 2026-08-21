import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/lib/api';
import { useBranch, useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Order, OrderStatus, PaginatedResponse } from '@/types/api';

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'جديد',
    checked_in: 'تم التسجيل',
    queued: 'في الطابور',
    in_service: 'قيد الخدمة',
    quality_check: 'فحص الجودة',
    ready: 'جاهز',
    completed: 'مكتمل',
    cancelled: 'ملغي',
};

function orderCustomerName(order: Order): string {
    return order.customer?.name ?? '—';
}

function orderVehiclePlate(order: Order): string {
    return order.vehicle?.plate_number ?? '—';
}

export function OrdersPage() {
    const navigate = useNavigate();
    const branchParams = useBranchQueryParams();
    const { selectedBranchId } = useBranch();

    const { data, isLoading } = useAuthenticatedQuery({
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

    const columns: ColumnDef<Order>[] = [
        { accessorKey: 'order_number', header: t('orders.orderNumber') },
        {
            id: 'customer_name',
            header: t('customers.name'),
            cell: ({ row }) => orderCustomerName(row.original),
        },
        {
            id: 'vehicle_plate',
            header: t('vehicles.plate'),
            cell: ({ row }) => orderVehiclePlate(row.original),
        },
        {
            accessorKey: 'total_amount',
            header: t('common.total'),
            cell: ({ row }) => formatCurrency(row.original.total_amount),
        },
        {
            accessorKey: 'status',
            header: t('common.status'),
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'completed' ? 'success' : 'secondary'}>
                    {row.original.status_label ?? STATUS_LABELS[row.original.status]}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: t('orders.createdAt'),
            cell: ({ row }) => format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm', { locale: ar }),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${row.original.id}`)}>
                    <Eye className="h-4 w-4" />
                    {t('common.view')}
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('orders.title')}
                description={t('orders.subtitle')}
                actions={
                    <Button onClick={() => navigate('/orders/create')} disabled={!selectedBranchId}>
                        <Plus className="h-4 w-4" />
                        {t('orders.createWalkIn')}
                    </Button>
                }
            />

            <DataTable columns={columns} data={data ?? []} searchKey="order_number" loading={isLoading} />
        </div>
    );
}
