import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TvLayout } from '@/components/tv/TvLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTvBranchId, useTvBranchName } from '@/hooks/useTvBranchId';
import { api, appConfig, endpoints } from '@/lib/api';
import { t } from '@/lib/i18n';
import type { ApiResponse, OrderScreenData, OrderScreenEntry, OrderStatus } from '@/types/api';

const REFRESH_INTERVAL_MS = 5_000;

const WASH_STAGES = [
    { key: 'entered', label: t('tv.stageEntered') },
    { key: 'washing', label: t('tv.stageWashing') },
    { key: 'quality', label: t('tv.stageQuality') },
    { key: 'ready', label: t('tv.stageReady') },
] as const;

function stageIndex(status: OrderStatus): number {
    switch (status) {
        case 'pending':
        case 'checked_in':
        case 'queued':
            return 0;
        case 'in_service':
            return 1;
        case 'quality_check':
            return 2;
        case 'ready':
            return 3;
        default:
            return 0;
    }
}

function StatusCard({ order }: { order: OrderScreenEntry }) {
    const currentStage = stageIndex(order.status);
    const isReady = order.status === 'ready';

    return (
        <Card
            className={cn(
                'border-sidebar-border bg-sidebar-accent',
                isReady && 'border-emerald-500/40 bg-emerald-500/10',
            )}
        >
            <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-3xl font-black tracking-wide">{order.vehicle_plate ?? '—'}</p>
                        {order.queue_number && (
                            <p className="mt-1 text-sm text-sidebar-foreground/60">
                                {t('queue.queueNumber')}: {order.queue_number}
                            </p>
                        )}
                    </div>
                    <Badge variant={isReady ? 'success' : 'secondary'} className="text-sm">
                        {order.status_label ?? order.status}
                    </Badge>
                </div>

                {order.service_name && (
                    <p className="mb-4 text-lg text-sidebar-foreground/80">{order.service_name}</p>
                )}

                <div className="grid grid-cols-4 gap-2">
                    {WASH_STAGES.map((stage, index) => {
                        const active = index <= currentStage;
                        const current = index === currentStage;

                        return (
                            <div key={stage.key} className="text-center">
                                <div
                                    className={cn(
                                        'mx-auto mb-2 h-3 rounded-full transition-colors',
                                        active ? 'bg-sidebar-primary' : 'bg-sidebar-border',
                                        current && !isReady && 'animate-pulse',
                                    )}
                                />
                                <p
                                    className={cn(
                                        'text-[10px] font-bold leading-tight lg:text-xs',
                                        active ? 'text-sidebar-foreground' : 'text-sidebar-foreground/40',
                                    )}
                                >
                                    {stage.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export function TvStatusPage() {
    const branchId = useTvBranchId();
    const branchName = useTvBranchName(branchId);

    const { data, isLoading } = useQuery({
        queryKey: ['tv-status', branchId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<OrderScreenData>>(endpoints.ordersScreenPublic, {
                branch_id: branchId!,
            });
            return response.data;
        },
        enabled: Boolean(branchId),
        refetchInterval: REFRESH_INTERVAL_MS,
        retry: false,
    });

    const readyOrders = useMemo(
        () => (data?.orders ?? []).filter((order) => order.status === 'ready'),
        [data],
    );

    const activeOrders = useMemo(
        () => (data?.orders ?? []).filter((order) => order.status !== 'ready'),
        [data],
    );

    return (
        <TvLayout
            title={t('tv.statusTitle')}
            subtitle={branchName ?? appConfig.tenant?.name ?? appConfig.appName}
        >
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <Card className="border-sidebar-border bg-sidebar-accent">
                    <CardContent className="p-6 text-center">
                        <p className="text-lg text-sidebar-foreground/70">{t('tv.inProgressCount')}</p>
                        <p className="mt-2 text-6xl font-black">{data?.in_progress_count ?? 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-500/30 bg-emerald-500/10">
                    <CardContent className="p-6 text-center">
                        <p className="text-lg text-sidebar-foreground/70">{t('tv.readyCount')}</p>
                        <p className="mt-2 text-6xl font-black text-emerald-400">{data?.ready_count ?? 0}</p>
                    </CardContent>
                </Card>
            </div>

            {readyOrders.length > 0 && (
                <section className="mb-10">
                    <h2 className="mb-4 text-3xl font-bold text-emerald-400">{t('queue.readyForPickup')}</h2>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {readyOrders.map((order) => (
                            <StatusCard key={order.id} order={order} />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="mb-4 text-3xl font-bold">{t('tv.activeOrders')}</h2>
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="h-40 bg-sidebar-border" />
                        ))}
                    </div>
                ) : activeOrders.length === 0 && readyOrders.length === 0 ? (
                    <p className="text-xl text-sidebar-foreground/60">{t('tv.noActiveOrders')}</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {activeOrders.map((order) => (
                            <StatusCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </section>
        </TvLayout>
    );
}
