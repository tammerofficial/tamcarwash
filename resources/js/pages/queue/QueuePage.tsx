import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Megaphone, RefreshCw } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import type { ApiResponse, PaginatedResponse, QueueEntry } from '@/types/api';

const statusLabels: Record<QueueEntry['status'], string> = {
    waiting: t('queue.waiting'),
    arrived: 'وصل',
    in_service: t('queue.inService'),
    ready: t('queue.ready'),
    completed: 'مكتمل',
    no_show: 'لم يحضر',
};

const statusVariants: Record<QueueEntry['status'], 'warning' | 'success' | 'secondary' | 'destructive'> = {
    waiting: 'warning',
    arrived: 'secondary',
    in_service: 'success',
    ready: 'success',
    completed: 'secondary',
    no_show: 'destructive',
};

const columns: ColumnDef<QueueEntry>[] = [
    { accessorKey: 'queue_number', header: t('queue.queueNumber') },
    { accessorKey: 'customer_name', header: t('customers.name') },
    { accessorKey: 'vehicle_plate', header: t('vehicles.plate') },
    {
        accessorKey: 'source',
        header: 'المصدر',
        cell: ({ row }) => (row.original.source === 'walk_in' ? 'مباشر' : 'حجز'),
    },
    {
        accessorKey: 'estimated_wait_minutes',
        header: t('queue.estimatedWait'),
        cell: ({ row }) => (row.original.estimated_wait_minutes ? `${row.original.estimated_wait_minutes} د` : '—'),
    },
    {
        accessorKey: 'status',
        header: t('common.status'),
        cell: ({ row }) => (
            <Badge variant={statusVariants[row.original.status]}>{statusLabels[row.original.status]}</Badge>
        ),
    },
];

export function QueuePage() {
    const queryClient = useQueryClient();
    const branchParams = useBranchQueryParams();

    const { data, isLoading, refetch, isFetching } = useQuery({
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

    const callNext = useMutation({
        mutationFn: () => api.post<ApiResponse<QueueEntry>>(endpoints.queue.callNext, branchParams),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['queue'] }),
    });

    const waitingCount = data?.filter((entry) => entry.status === 'waiting').length ?? 0;
    const inServiceCount = data?.filter((entry) => entry.status === 'in_service').length ?? 0;

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
                        <Button onClick={() => callNext.mutate()} disabled={callNext.isPending}>
                            <Megaphone className="h-4 w-4" />
                            {t('queue.callNext')}
                        </Button>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

            <DataTable columns={columns} data={data ?? []} searchKey="queue_number" loading={isLoading} />
        </div>
    );
}
