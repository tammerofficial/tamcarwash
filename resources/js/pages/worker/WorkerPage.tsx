import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Clock, Loader2, Play, SquareCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import type { ApiResponse, Order, OrderStatus, PaginatedResponse } from '@/types/api';

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'جديد',
    checked_in: 'وصل',
    queued: 'في الطابور',
    in_service: 'قيد الخدمة',
    quality_check: 'فحص الجودة',
    ready: 'جاهز',
    completed: 'مكتمل',
    cancelled: 'ملغي',
};

const WORKER_ACTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
    queued: ['in_service'],
    in_service: ['quality_check', 'ready'],
    quality_check: ['ready', 'in_service'],
};

export function WorkerPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [startedAt, setStartedAt] = useState<Date | null>(null);

    const { data: orders = [], isLoading } = useAuthenticatedQuery({
        queryKey: ['worker-orders', user?.id],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Order>>(endpoints.orders, {
                worker_id: user!.id,
                per_page: 50,
            });
            return response.data.filter((order) => !['completed', 'cancelled'].includes(order.status));
        },
        enabled: Boolean(user?.id),
        retry: false,
        refetchInterval: 15_000,
    });

    const { data: selectedOrder, isLoading: detailLoading } = useAuthenticatedQuery({
        queryKey: ['orders', selectedOrderId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Order>>(endpoints.order(selectedOrderId!));
            return response.data;
        },
        enabled: selectedOrderId !== null,
        retry: false,
    });

    const activeOrder = selectedOrder ?? orders.find((order) => order.id === selectedOrderId) ?? null;

    const elapsedMinutes = useMemo(() => {
        if (!startedAt) {
            return 0;
        }
        return Math.floor((Date.now() - startedAt.getTime()) / 60_000);
    }, [startedAt, activeOrder?.status]);

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['worker-orders'] });
        if (selectedOrderId) {
            queryClient.invalidateQueries({ queryKey: ['orders', selectedOrderId] });
        }
    };

    const transitionOrder = useMutation({
        mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
            api.post<ApiResponse<Order>>(endpoints.orderTransition(orderId), {
                status,
                worker_id: user?.id,
            }),
        onSuccess: (response, variables) => {
            invalidate();
            if (variables.status === 'in_service') {
                setStartedAt(new Date());
            }
            if (variables.status === 'ready') {
                setStartedAt(null);
            }
            toast.success('تم تحديث حالة الطلب');
            setSelectedOrderId(response.data.id);
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر تحديث الحالة'),
    });

    const nextActions = activeOrder ? WORKER_ACTIONS[activeOrder.status] ?? [] : [];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`مهام ${user?.name ?? 'العامل'}`}
                description="الطلبات المعيّنة لك — ابدأ الخدمة، أضف ملاحظات، وأكمل فحص الجودة"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>طلباتي ({orders.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : orders.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">لا توجد طلبات معيّنة حالياً</p>
                        ) : (
                            orders.map((order) => (
                                <button
                                    key={order.id}
                                    type="button"
                                    className={`flex w-full items-center justify-between rounded-lg border p-4 text-start transition ${
                                        selectedOrderId === order.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                                    }`}
                                    onClick={() => setSelectedOrderId(order.id)}
                                >
                                    <div>
                                        <p className="font-semibold">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.vehicle?.plate_number ?? '—'} —{' '}
                                            {order.customer?.name ?? '—'}
                                        </p>
                                    </div>
                                    <Badge>{order.status_label ?? STATUS_LABELS[order.status]}</Badge>
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>تفاصيل الطلب</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {detailLoading && selectedOrderId ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : !activeOrder ? (
                            <p className="py-12 text-center text-muted-foreground">اختر طلباً من القائمة</p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-2xl font-bold">{activeOrder.order_number}</p>
                                    <p className="text-muted-foreground">
                                        {activeOrder.customer?.name} — {activeOrder.vehicle?.plate_number}
                                    </p>
                                    <Badge className="mt-2">
                                        {activeOrder.status_label ?? STATUS_LABELS[activeOrder.status]}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">الخدمات</span>
                                        <div className="mt-1 space-y-1">
                                            {(activeOrder.items ?? []).map((item) => (
                                                <p key={item.id} className="font-medium">
                                                    {item.name} — {formatCurrency(item.total_price)}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">الوقت</span>
                                        <p className="flex items-center gap-1 font-medium">
                                            <Clock className="h-4 w-4" />
                                            {activeOrder.status === 'in_service' && startedAt
                                                ? `${elapsedMinutes} دقيقة`
                                                : activeOrder.created_at
                                                  ? format(new Date(activeOrder.created_at), 'HH:mm', { locale: ar })
                                                  : '—'}
                                        </p>
                                    </div>
                                </div>

                                <Textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="ملاحظات العامل — مثلاً: بقع على الباب الخلفي"
                                    rows={3}
                                />

                                <div className="flex flex-wrap gap-2">
                                    {nextActions.map((status) => (
                                        <Button
                                            key={status}
                                            disabled={transitionOrder.isPending}
                                            onClick={() =>
                                                transitionOrder.mutate({
                                                    orderId: activeOrder.id,
                                                    status,
                                                })
                                            }
                                        >
                                            {status === 'in_service' && <Play className="h-4 w-4" />}
                                            {status === 'ready' && <SquareCheck className="h-4 w-4" />}
                                            {STATUS_LABELS[status]}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
