import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, QueueEntry } from '@/types/api';
import { appConfig } from '@/lib/api';

interface QueueScreenData {
    now_serving?: QueueEntry | null;
    up_next: QueueEntry[];
    recently_completed: QueueEntry[];
}

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
    });

    return (
        <div className="min-h-[calc(100vh-8rem)] space-y-6 rounded-2xl bg-sidebar p-6 text-sidebar-foreground">
            <div className="text-center">
                <h1 className="text-3xl font-bold">{t('queue.screenTitle')}</h1>
                <p className="text-sidebar-foreground/70">{appConfig.tenant?.name ?? appConfig.appName}</p>
            </div>

            <Card className="border-sidebar-border bg-sidebar-accent">
                <CardContent className="py-12 text-center">
                    <p className="text-lg text-sidebar-foreground/70">الرقم الحالي</p>
                    {isLoading ? (
                        <Skeleton className="mx-auto mt-4 h-20 w-48" />
                    ) : (
                        <p className="mt-2 text-7xl font-black text-sidebar-primary">
                            {data?.now_serving?.queue_number ?? '—'}
                        </p>
                    )}
                    {!isLoading && data?.now_serving && (
                        <p className="mt-4 text-xl">{data.now_serving.vehicle_plate}</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <section>
                    <h2 className="mb-4 text-xl font-semibold">التالي</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
                            : (data?.up_next ?? []).map((entry) => (
                                  <Card key={entry.id} className="border-sidebar-border bg-sidebar-accent">
                                      <CardContent className="flex items-center justify-between p-4">
                                          <span className="text-3xl font-bold">{entry.queue_number}</span>
                                          <Badge variant="warning">{entry.vehicle_plate}</Badge>
                                      </CardContent>
                                  </Card>
                              ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-4 text-xl font-semibold">جاهز للاستلام</h2>
                    <div className="space-y-3">
                        {isLoading
                            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
                            : (data?.recently_completed ?? []).map((entry) => (
                                  <Card key={entry.id} className="border-sidebar-border bg-sidebar-accent">
                                      <CardContent className="flex items-center justify-between p-4">
                                          <span className="text-2xl font-bold">{entry.queue_number}</span>
                                          <span>{entry.vehicle_plate}</span>
                                      </CardContent>
                                  </Card>
                              ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
