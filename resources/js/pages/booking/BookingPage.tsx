import { useMemo, useState } from 'react';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarDays, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/lib/api';
import { useBranch, useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import type { Booking, BookingStatus, PaginatedResponse, Service } from '@/types/api';

const STATUS_VARIANTS: Record<BookingStatus, 'warning' | 'success' | 'destructive' | 'secondary'> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'destructive',
    completed: 'secondary',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
    completed: 'مكتمل',
};

function formatBookingDateTime(booking: Booking): string {
    if (!booking.scheduled_date || !booking.scheduled_start_time) {
        return '—';
    }
    return format(new Date(`${booking.scheduled_date}T${booking.scheduled_start_time}`), 'dd MMM yyyy HH:mm', {
        locale: ar,
    });
}

function serviceNames(serviceIds: number[] | undefined, services: Service[]): string {
    if (!serviceIds?.length) {
        return '—';
    }
    return (
        serviceIds
            .map((id) => services.find((service) => service.id === id)?.name)
            .filter(Boolean)
            .join('، ') || '—'
    );
}

export function BookingPage() {
    const navigate = useNavigate();
    const branchParams = useBranchQueryParams();
    const { selectedBranchId } = useBranch();
    const [filterDate, setFilterDate] = useState('');

    const queryParams = useMemo(
        () => ({
            per_page: 50,
            ...branchParams,
            ...(filterDate ? { date: filterDate } : {}),
        }),
        [branchParams, filterDate],
    );

    const { data, isLoading } = useAuthenticatedQuery({
        queryKey: ['bookings', queryParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Booking>>(endpoints.bookings, queryParams);
            return response.data;
        },
        retry: false,
    });

    const { data: services = [] } = useAuthenticatedQuery({
        queryKey: ['services', 'select'],
        queryFn: async () => (await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 100 })).data,
        retry: false,
    });

    const columns: ColumnDef<Booking>[] = [
        { accessorKey: 'booking_number', header: t('booking.bookingNumber') },
        {
            id: 'customer_name',
            header: t('customers.name'),
            cell: ({ row }) => row.original.customer_name ?? '—',
        },
        {
            id: 'vehicle_plate',
            header: t('vehicles.plate'),
            cell: ({ row }) => row.original.vehicle_plate ?? '—',
        },
        {
            id: 'service',
            header: t('booking.service'),
            cell: ({ row }) => serviceNames(row.original.service_ids, services),
        },
        {
            id: 'scheduled_at',
            header: t('booking.scheduledAt'),
            cell: ({ row }) => formatBookingDateTime(row.original),
        },
        {
            accessorKey: 'status',
            header: t('common.status'),
            cell: ({ row }) => (
                <Badge variant={STATUS_VARIANTS[row.original.status]}>
                    {row.original.status_label ?? STATUS_LABELS[row.original.status]}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/booking/${row.original.id}`)}>
                    <Eye className="h-4 w-4" />
                    {t('common.view')}
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('booking.title')}
                description={t('booking.subtitle')}
                actions={
                    <Button onClick={() => navigate('/booking/create')} disabled={!selectedBranchId}>
                        <Plus className="h-4 w-4" />
                        {t('booking.create')}
                    </Button>
                }
            />

            <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('booking.filterDate')}</label>
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(event) => setFilterDate(event.target.value)}
                            dir="ltr"
                            className="w-auto"
                        />
                        {filterDate && (
                            <Button variant="ghost" size="sm" onClick={() => setFilterDate('')}>
                                {t('common.clear')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <DataTable columns={columns} data={data ?? []} searchKey="booking_number" loading={isLoading} />
        </div>
    );
}
