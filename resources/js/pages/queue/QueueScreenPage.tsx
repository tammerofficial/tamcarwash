import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { api, appConfig, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, QueueEntry, QueueScreenData } from '@/types/api';

const STATUS_LABELS: Record<string, string> = {
    waiting: t('queue.waiting'),
    arrived: t('queue.arrived'),
    in_service: t('queue.inService'),
    ready: t('queue.ready'),
};

export function QueueScreenPage() {
    const branchParams = useBranchQueryParams();

    const { data, isLoading } = useQuery({
        queryKey: ['queue-screen', branchParams],
        queryFn: async () => {
            const response = await api.get<ApiResponse<QueueScreenData>>(endpoints.queue.screen, branchParams);
            return response.data;
        },
        retry: false,
        refetchInterval: 5_000,
        enabled: Boolean(branchParams.branch_id),
    });

    const currentEntry = useMemo(() => {
        if (!data?.entries?.length) {
            return null;
        }
        if (data.current_number) {
            return data.entries.find((entry) => entry.queue_number === data.current_number) ?? null;
        }
        return (
            data.entries.find((entry) => ['arrived', 'in_service', 'ready'].includes(entry.status)) ?? null
        );
    }, [data]);

    const upNext = useMemo(
        () =>
            (data?.entries ?? [])
                .filter((entry) => entry.status === 'waiting')
                .slice(0, 6),
        [data],
    );

    const readyForPickup = useMemo(
        () => (data?.entries ?? []).filter((entry) => entry.status === 'ready'),
        [data],
    );

    return (
        <div className="min-h-screen space-y-8 bg-sidebar p-8 text-sidebar-foreground">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-sidebar-border pb-6">
                <div>
                    <h1 className="text-4xl font-bold">{t('queue.screenTitle')}</h1>
                    <p className="mt-1 text-xl text-sidebar-foreground/70">
                        {appConfig.tenant?.name ?? appConfig.appName}
                    </p>
                </div>
                <div className="text-start">
                    <p className="text-lg text-sidebar-foreground/70">{format(new Date(), 'EEEE dd MMMM yyyy', { locale: ar })}</p>
                    <p className="text-3xl font-semibold tabular-nums" dir="ltr">
                        {format(new Date(), 'HH:mm')}
                    </p>
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="border-sidebar-border bg-sidebar-accent lg:col-span-2">
                    <CardContent className="py-16 text-center">
                        <p className="text-2xl text-sidebar-foreground/70">{t('queue.currentNumber')}</p>
                        {isLoading ? (
                            <Skeleton className="mx-auto mt-6 h-28 w-64" />
                        ) : (
                            <p className="mt-4 text-9xl font-black text-sidebar-primary">
                                {data?.current_number ?? currentEntry?.queue_number ?? '—'}
                            </p>
                        )}
                        {!isLoading && currentEntry && (
                            <div className="mt-6 space-y-2">
                                <p className="text-3xl">{currentEntry.vehicle_plate ?? '—'}</p>
                                <Badge variant="success" className="text-lg px-4 py-1">
                                    {currentEntry.status_label ??
                                        STATUS_LABELS[currentEntry.status] ??
                                        currentEntry.status}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="border-sidebar-border bg-sidebar-accent">
                        <CardContent className="p-6 text-center">
                            <p className="text-lg text-sidebar-foreground/70">{t('queue.waiting')}</p>
                            <p className="mt-2 text-6xl font-bold">{data?.waiting_count ?? 0}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border bg-sidebar-accent">
                        <CardContent className="flex items-center justify-center gap-3 p-6">
                            <Clock className="h-8 w-8 text-sidebar-primary" />
                            <div className="text-center">
                                <p className="text-lg text-sidebar-foreground/70">{t('queue.estimatedWait')}</p>
                                <p className="text-4xl font-bold">
                                    {data?.estimated_wait_minutes ?? 0} {t('queue.minutes')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <section>
                    <h2 className="mb-4 text-2xl font-semibold">{t('queue.upNext')}</h2>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, index) => (
                                  <Skeleton key={index} className="h-28" />
                              ))
                            : upNext.length === 0
                              ? (
                                    <p className="text-sidebar-foreground/60">{t('common.noData')}</p>
                                )
                              : upNext.map((entry: QueueEntry) => (
                                    <Card key={entry.id} className="border-sidebar-border bg-sidebar-accent">
                                        <CardContent className="flex items-center justify-between p-5">
                                            <span className="text-4xl font-bold">{entry.queue_number}</span>
                                            <Badge variant="warning">{entry.vehicle_plate ?? '—'}</Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold">{t('queue.readyForPickup')}</h2>
                    <div className="space-y-3">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, index) => (
                                  <Skeleton key={index} className="h-20" />
                              ))
                            : readyForPickup.length === 0
                              ? (
                                    <p className="text-sidebar-foreground/60">{t('common.noData')}</p>
                                )
                              : readyForPickup.map((entry: QueueEntry) => (
                                    <Card key={entry.id} className="border-sidebar-border bg-sidebar-accent">
                                        <CardContent className="flex items-center justify-between p-5">
                                            <span className="text-3xl font-bold">{entry.queue_number}</span>
                                            <span className="text-xl">{entry.vehicle_plate ?? '—'}</span>
                                        </CardContent>
                                    </Card>
                                ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
