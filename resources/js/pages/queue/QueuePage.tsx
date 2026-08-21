import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { Clock, Megaphone, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useBranch, useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import type { ApiResponse, PaginatedResponse, QueueEntry, QueueEntryStatus } from '@/types/api';

const STATUS_LABELS: Record<QueueEntryStatus, string> = {
    waiting: t('queue.waiting'),
    arrived: t('queue.arrived'),
    in_service: t('queue.inService'),
    ready: t('queue.ready'),
    completed: t('queue.completed'),
    no_show: t('queue.noShow'),
};

const STATUS_VARIANTS: Record<QueueEntryStatus, 'warning' | 'success' | 'secondary' | 'destructive'> = {
    waiting: 'warning',
    arrived: 'secondary',
    in_service: 'success',
    ready: 'success',
    completed: 'secondary',
    no_show: 'destructive',
};

function sourceLabel(source: QueueEntry['source']): string {
    return source === 'walk_in' ? t('queue.sourceWalkIn') : t('queue.sourceBooking');
}

export function QueuePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const branchParams = useBranchQueryParams();
    const { selectedBranchId } = useBranch();

    const { data, isLoading, refetch, isFetching } = useAuthenticatedQuery({
        queryKey: ['queue', branchParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<QueueEntry>>(endpoints.queue.entries, {
                per_page: 50,
                ...branchParams,
            });
            return response.data;
        },
        retry: false,
        refetchInterval: 15_000,
    });

    const { data: estimatedWait } = useAuthenticatedQuery({
        queryKey: ['queue-estimated-wait', branchParams],
        queryFn: async () => {
            const response = await api.get<ApiResponse<{ estimated_wait_minutes: number }>>(
                endpoints.queue.estimatedWait,
                branchParams,
            );
            return response.data.estimated_wait_minutes;
        },
        enabled: Boolean(branchParams.branch_id),
        retry: false,
        refetchInterval: 15_000,
    });

    const callNext = useMutation({
        mutationFn: () => api.post<ApiResponse<QueueEntry | null>>(endpoints.queue.callNext, branchParams),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['queue'] });
            queryClient.invalidateQueries({ queryKey: ['queue-estimated-wait'] });
            queryClient.invalidateQueries({ queryKey: ['queue-screen'] });
            toast.success(response.message ?? t('queue.callNextSuccess'));
        },
        onError: () => toast.error(t('queue.callNextError')),
    });

    const waitingCount = data?.filter((entry) => entry.status === 'waiting').length ?? 0;
    const inServiceCount = data?.filter((entry) => entry.status === 'in_service').length ?? 0;
    const readyCount = data?.filter((entry) => entry.status === 'ready').length ?? 0;

    const columns: ColumnDef<QueueEntry>[] = [
        { accessorKey: 'queue_number', header: t('queue.queueNumber') },
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
            accessorKey: 'source',
            header: t('queue.source'),
            cell: ({ row }) => sourceLabel(row.original.source),
        },
        {
            accessorKey: 'estimated_wait_minutes',
            header: t('queue.estimatedWait'),
            cell: ({ row }) =>
                row.original.estimated_wait_minutes ? `${row.original.estimated_wait_minutes} ${t('queue.minutes')}` : '—',
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
                <Button variant="ghost" size="sm" onClick={() => navigate(`/queue/${row.original.id}`)}>
                    {t('queue.manage')}
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('queue.title')}
                description={t('queue.subtitle')}
                actions={
                    <>
                        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                            {t('common.refresh')}
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/queue/walk-in')} disabled={!selectedBranchId}>
                            <Plus className="h-4 w-4" />
                            {t('queue.addWalkIn')}
                        </Button>
                        <Button onClick={() => callNext.mutate()} disabled={callNext.isPending || !selectedBranchId}>
                            <Megaphone className="h-4 w-4" />
                            {t('queue.callNext')}
                        </Button>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('queue.waiting')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{waitingCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('queue.inService')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{inServiceCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('queue.ready')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{readyCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            {t('queue.estimatedWait')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {estimatedWait !== undefined ? `${estimatedWait} ${t('queue.minutes')}` : '—'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <DataTable columns={columns} data={data ?? []} searchKey="queue_number" loading={isLoading} />
        </div>
    );
}
