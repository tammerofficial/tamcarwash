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
import { t } from '@/lib/i18n';
import type { Booking, PaginatedResponse } from '@/types/api';

const statusVariants: Record<Booking['status'], 'warning' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'destructive',
    completed: 'secondary',
};

const statusLabels: Record<Booking['status'], string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
    completed: 'مكتمل',
};

const columns: ColumnDef<Booking>[] = [
    { accessorKey: 'booking_number', header: t('booking.bookingNumber') },
    { accessorKey: 'customer_name', header: t('customers.name') },
    { accessorKey: 'vehicle_plate', header: t('vehicles.plate') },
    { accessorKey: 'service_name', header: t('booking.service') },
    {
        accessorKey: 'scheduled_at',
        header: t('booking.scheduledAt'),
        cell: ({ row }) => format(new Date(row.original.scheduled_at), 'dd MMM yyyy HH:mm', { locale: ar }),
    },
    {
        accessorKey: 'status',
        header: t('common.status'),
        cell: ({ row }) => (
            <Badge variant={statusVariants[row.original.status]}>{statusLabels[row.original.status]}</Badge>
        ),
    },
];

export function BookingPage() {
    const branchParams = useBranchQueryParams();

    const { data, isLoading } = useQuery({
        queryKey: ['bookings', branchParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Booking>>(endpoints.bookings, {
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
                title={t('booking.title')}
                description={t('booking.subtitle')}
                actions={
                    <Button>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />
            <DataTable columns={columns} data={data ?? []} searchKey="booking_number" loading={isLoading} />
        </div>
    );
}
