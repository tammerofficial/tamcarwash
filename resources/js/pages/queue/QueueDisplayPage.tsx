import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api, appConfig, endpoints } from '@/lib/api';
import { getAppName } from '@/lib/branding';
import { useStorefrontBranches } from '@/hooks/useStorefront';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApiResponse, QueueEntry, QueueScreenData } from '@/types/api';

const STATUS_LABELS: Record<string, string> = {
    waiting: 'انتظار',
    arrived: 'وصل',
    in_service: 'قيد الغسيل',
    ready: 'جاهز',
};

const SOURCE_LABELS: Record<string, string> = {
    walk_in: 'حضور مباشر',
    booked: 'حجز',
    booking: 'حجز',
};

export function QueueDisplayPage() {
    const [searchParams] = useSearchParams();
    const branchParam = searchParams.get('branch_id');
    const { data: branches } = useStorefrontBranches();

    const branchId = branchParam ? Number(branchParam) : branches?.[0]?.id;

    const { data, isLoading } = useQuery({
        queryKey: ['queue-display', branchId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<QueueScreenData>>(endpoints.queue.screenPublic, {
                branch_id: branchId!,
            });
            return response.data;
        },
        enabled: Boolean(branchId),
        refetchInterval: 5_000,
        retry: false,
    });

    const branchName = branches?.find((branch) => branch.id === branchId)?.name ?? appConfig.tenant?.name;

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
        <div className="min-h-screen bg-[#0b1220] p-6 text-white lg:p-10" dir="rtl">
            <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-black lg:text-5xl">طابور {branchName}</h1>
                    <p className="mt-2 text-xl text-white/60">{getAppName()} — سلطنة عُمان</p>
                </div>
                <div className="text-start">
                    <p className="text-lg text-white/60">{format(new Date(), 'EEEE dd MMMM yyyy', { locale: ar })}</p>
                    <p className="text-4xl font-bold tabular-nums" dir="ltr">
                        {format(new Date(), 'HH:mm')}
                    </p>
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="border-white/10 bg-white/5 lg:col-span-2">
                    <CardContent className="py-12 text-center">
                        <p className="text-2xl text-white/70">الرقم الحالي</p>
                        {isLoading ? (
                            <Skeleton className="mx-auto mt-6 h-32 w-72 bg-white/10" />
                        ) : (
                            <p className="mt-4 text-[8rem] font-black leading-none text-sky-400 lg:text-[10rem]">
                                {data?.current_number ?? '—'}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    <Card className="border-white/10 bg-white/5">
                        <CardContent className="p-8 text-center">
                            <p className="text-lg text-white/60">في الانتظار</p>
                            <p className="mt-2 text-7xl font-black">{data?.waiting_count ?? 0}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-white/5">
                        <CardContent className="flex items-center justify-center gap-4 p-8">
                            <Clock className="h-10 w-10 text-sky-400" />
                            <div>
                                <p className="text-lg text-white/60">الانتظار المتوقع</p>
                                <p className="text-4xl font-bold">{data?.estimated_wait_minutes ?? 0} د</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <section className="mt-10">
                <h2 className="mb-4 text-3xl font-bold">التالي</h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, index) => (
                              <Skeleton key={index} className="h-28 bg-white/10" />
                          ))
                        : upNext.map((entry: QueueEntry) => (
                              <Card key={entry.id} className="border-white/10 bg-white/5">
                                  <CardContent className="flex items-center justify-between p-6">
                                      <span className="text-5xl font-black">{entry.queue_number}</span>
                                      <div className="text-start">
                                          <Badge variant="warning" className="mb-1 text-base">
                                              {entry.vehicle_plate ?? '—'}
                                          </Badge>
                                          <p className="text-xs text-white/50">
                                              {SOURCE_LABELS[entry.source] ?? entry.source}
                                          </p>
                                      </div>
                                  </CardContent>
                              </Card>
                          ))}
                </div>
            </section>

            {inProgress.length > 0 && (
                <section className="mt-10">
                    <h2 className="mb-4 text-3xl font-bold">قيد التنفيذ / جاهز</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {inProgress.map((entry) => (
                            <Card key={entry.id} className="border-emerald-500/30 bg-emerald-500/10">
                                <CardContent className="flex items-center justify-between p-6">
                                    <span className="text-4xl font-bold">{entry.queue_number}</span>
                                    <div className="text-start">
                                        <p className="text-xl">{entry.vehicle_plate}</p>
                                        <p className="text-sm text-white/70">
                                            {STATUS_LABELS[entry.status] ?? entry.status}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
