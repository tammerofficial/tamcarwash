import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { FormPage } from '@/components/common/FormPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

const NEXT_STATUSES: Record<QueueEntryStatus, QueueEntryStatus[]> = {
    waiting: ['arrived', 'in_service', 'no_show'],
    arrived: ['in_service', 'no_show'],
    in_service: ['ready', 'completed'],
    ready: ['completed'],
    completed: [],
    no_show: [],
};

export function QueueEntryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const branchParams = useBranchQueryParams();

    const { data, isLoading } = useAuthenticatedQuery({
        queryKey: ['queue', branchParams],
        queryFn: async () => (await api.get<PaginatedResponse<QueueEntry>>(endpoints.queue.entries, { per_page: 50, ...branchParams })).data,
        retry: false,
    });

    const entry = data?.find((item) => String(item.id) === id) ?? null;

    const updateStatus = useMutation({
        mutationFn: (status: QueueEntryStatus) => api.patch<ApiResponse<QueueEntry>>(endpoints.queue.entryStatus(Number(id)), { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queue'] });
            toast.success(t('queue.statusUpdated'));
        },
        onError: () => toast.error(t('queue.statusError')),
    });

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!entry) return <p className="text-muted-foreground">{t('common.noData')}</p>;

    const nextStatuses = NEXT_STATUSES[entry.status] ?? [];

    return (
        <FormPage title={entry.queue_number} description={`${entry.customer_name} — ${entry.vehicle_plate}`} backTo="/queue">
            <div className="space-y-6">
                <Badge variant={STATUS_VARIANTS[entry.status]}>{entry.status_label ?? STATUS_LABELS[entry.status]}</Badge>
                {nextStatuses.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-medium">{t('queue.transition')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {nextStatuses.map((status) => (
                                <Button
                                    key={status}
                                    size="sm"
                                    variant={status === 'no_show' ? 'destructive' : 'default'}
                                    disabled={updateStatus.isPending}
                                    onClick={() => updateStatus.mutate(status)}
                                >
                                    {STATUS_LABELS[status]}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                <Button variant="outline" onClick={() => navigate('/queue')}>{t('common.back')}</Button>
            </div>
        </FormPage>
    );
}
