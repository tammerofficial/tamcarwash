import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { TvLayout } from '@/components/tv/TvLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTvBranchId, useTvBranchName } from '@/hooks/useTvBranchId';
import { api, appConfig, endpoints } from '@/lib/api';
import { t } from '@/lib/i18n';
import type { ApiResponse, QueueEntry, QueueScreenData } from '@/types/api';

const REFRESH_INTERVAL_MS = 5_000;

const STATUS_LABELS: Record<string, string> = {
    waiting: t('queue.waiting'),
    arrived: t('queue.arrived'),
    in_service: t('queue.inService'),
    ready: t('queue.ready'),
};

export function TvQueuePage() {
    const branchId = useTvBranchId();
    const branchName = useTvBranchName(branchId);

    const { data, isLoading } = useQuery({
        queryKey: ['tv-queue', branchId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<QueueScreenData>>(endpoints.queue.screenPublic, {
                branch_id: branchId!,
            });
            return response.data;
        },
        enabled: Boolean(branchId),
        refetchInterval: REFRESH_INTERVAL_MS,
        retry: false,
    });

    const upNext = useMemo(
        () => (data?.entries ?? []).filter((entry) => entry.status === 'waiting').slice(0, 12),
        [data],
    );

    const inProgress = useMemo(
        () =>
            (data?.entries ?? []).filter((entry) =>
                ['arrived', 'in_service', 'ready'].includes(entry.status),
            ),
        [data],
    );

    return (
        <TvLayout
            title={t('tv.queueTitle')}
            subtitle={branchName ?? appConfig.tenant?.name ?? appConfig.appName}
        >
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="border-sidebar-border bg-sidebar-accent lg:col-span-2">
                    <CardContent className="py-12 text-center lg:py-16">
                        <p className="text-2xl text-sidebar-foreground/70">{t('queue.currentNumber')}</p>
                        {isLoading ? (
                            <Skeleton className="mx-auto mt-6 h-32 w-72 bg-sidebar-border" />
                        ) : (
                            <p className="mt-4 text-[7rem] font-black leading-none text-sidebar-primary lg:text-[9rem]">
                                {data?.current_number ?? '—'}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    <Card className="border-sidebar-border bg-sidebar-accent">
                        <CardContent className="p-8 text-center">
                            <p className="text-lg text-sidebar-foreground/70">{t('queue.waiting')}</p>
                            <p className="mt-2 text-7xl font-black">{data?.waiting_count ?? 0}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border bg-sidebar-accent">
                        <CardContent className="flex items-center justify-center gap-4 p-8">
                            <Clock className="h-10 w-10 text-sidebar-primary" />
                            <div>
                                <p className="text-lg text-sidebar-foreground/70">{t('queue.estimatedWait')}</p>
                                <p className="text-4xl font-bold">
                                    {data?.estimated_wait_minutes ?? 0} {t('queue.minutes')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <section className="mt-10">
                <h2 className="mb-4 text-3xl font-bold">{t('queue.upNext')}</h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, index) => (
                              <Skeleton key={index} className="h-28 bg-sidebar-border" />
                          ))
                        : upNext.length === 0
                          ? (
                                <p className="text-sidebar-foreground/60">{t('common.noData')}</p>
                            )
                          : upNext.map((entry: QueueEntry) => (
                                <Card key={entry.id} className="border-sidebar-border bg-sidebar-accent">
                                    <CardContent className="flex items-center justify-between p-6">
                                        <span className="text-5xl font-black">{entry.queue_number}</span>
                                        <Badge variant="warning" className="text-base">
                                            {entry.vehicle_plate ?? '—'}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                </div>
            </section>

            {inProgress.length > 0 && (
                <section className="mt-10">
                    <h2 className="mb-4 text-3xl font-bold">{t('tv.inProgressSection')}</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {inProgress.map((entry) => (
                            <Card key={entry.id} className="border-sidebar-primary/30 bg-sidebar-primary/10">
                                <CardContent className="flex items-center justify-between p-6">
                                    <span className="text-4xl font-bold">{entry.queue_number}</span>
                                    <div className="text-start">
                                        <p className="text-xl">{entry.vehicle_plate ?? '—'}</p>
                                        <p className="text-sm text-sidebar-foreground/70">
                                            {entry.status_label ?? STATUS_LABELS[entry.status] ?? entry.status}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </TvLayout>
    );
}
