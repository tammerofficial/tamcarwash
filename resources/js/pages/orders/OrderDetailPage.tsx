import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { UserPlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Order, OrderStatus, PaginatedResponse, Service } from '@/types/api';

const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'جديد',
    checked_in: 'تم التسجيل',
    queued: 'في الطابور',
    in_service: 'قيد الخدمة',
    quality_check: 'فحص الجودة',
    ready: 'جاهز',
    completed: 'مكتمل',
    cancelled: 'ملغي',
};

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
    pending: ['checked_in', 'cancelled'],
    checked_in: ['queued', 'in_service', 'cancelled'],
    queued: ['in_service', 'cancelled'],
    in_service: ['quality_check', 'ready', 'cancelled'],
    quality_check: ['ready', 'in_service', 'cancelled'],
    ready: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

const addItemSchema = z.object({
    service_id: z.coerce.number().min(1, 'اختر الخدمة'),
    quantity: z.coerce.number().min(1),
});

type AddItemValues = z.infer<typeof addItemSchema>;

function orderCustomerName(order: Order): string {
    return order.customer?.name ?? '—';
}

function orderVehiclePlate(order: Order): string {
    return order.vehicle?.plate_number ?? '—';
}

export function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [workerId, setWorkerId] = useState('');

    const { data: order, isLoading } = useAuthenticatedQuery({
        queryKey: ['orders', id],
        queryFn: async () => (await api.get<ApiResponse<Order>>(endpoints.order(Number(id)))).data,
        enabled: Boolean(id),
        retry: false,
    });

    const { data: services = [] } = useAuthenticatedQuery({
        queryKey: ['services', 'select'],
        queryFn: async () => (await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 100 })).data,
        retry: false,
    });

    const addItemForm = useForm<AddItemValues>({
        resolver: zodResolver(addItemSchema),
        defaultValues: { service_id: 0, quantity: 1 },
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['orders', id] });
    };

    const transitionOrder = useMutation({
        mutationFn: (status: OrderStatus) =>
            api.post<ApiResponse<Order>>(endpoints.orderTransition(Number(id)), {
                status,
                worker_id: status === 'in_service' && workerId ? Number(workerId) : undefined,
            }),
        onSuccess: () => {
            invalidate();
            toast.success('تم تحديث حالة الطلب');
        },
        onError: () => toast.error('تعذّر تحديث الحالة'),
    });

    const assignWorker = useMutation({
        mutationFn: () =>
            api.post<ApiResponse<Order>>(endpoints.orderAssignWorker(Number(id)), {
                worker_id: Number(workerId),
            }),
        onSuccess: () => {
            invalidate();
            toast.success('تم تعيين العامل');
        },
        onError: () => toast.error('تعذّر تعيين العامل'),
    });

    const addItem = useMutation({
        mutationFn: (values: AddItemValues) => {
            const service = services.find((item) => item.id === values.service_id);
            if (!service) {
                throw new Error('الخدمة غير موجودة');
            }
            return api.post(endpoints.orderAddItem(Number(id)), {
                item_type: 'service',
                name: service.name,
                service_id: service.id,
                quantity: values.quantity,
                unit_price: service.base_price,
            });
        },
        onSuccess: () => {
            invalidate();
            addItemForm.reset({ service_id: 0, quantity: 1 });
            toast.success('تم إضافة البند');
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر إضافة البند'),
    });

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (!order) {
        return <p className="text-muted-foreground">{t('common.noData')}</p>;
    }

    const nextStatuses = NEXT_STATUSES[order.status] ?? [];
    const canManage = order.status !== 'completed' && order.status !== 'cancelled';

    return (
        <FormPage
            title={order.order_number}
            description={`${orderCustomerName(order)} — ${orderVehiclePlate(order)}`}
            backTo="/orders"
        >
            <div className="space-y-6">
                <Badge variant={order.status === 'completed' ? 'success' : 'secondary'}>
                    {order.status_label ?? STATUS_LABELS[order.status]}
                </Badge>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-muted-foreground">{t('invoices.subtotal')}</span>
                        <p className="font-semibold">{formatCurrency(order.subtotal)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">{t('invoices.vatAmount')}</span>
                        <p className="font-semibold">{formatCurrency(order.tax_amount)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">{t('common.total')}</span>
                        <p className="font-semibold text-primary">{formatCurrency(order.total_amount)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">{t('orders.worker')}</span>
                        <p className="font-semibold">{order.worker?.name ?? '—'}</p>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <h3 className="font-medium">{t('orders.items')}</h3>
                    {(order.items ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                    ) : (
                        <div className="space-y-2">
                            {(order.items ?? []).map((item) => (
                                <div key={item.id} className="flex justify-between rounded-md border p-3 text-sm">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-muted-foreground">
                                            {item.quantity} × {formatCurrency(item.unit_price)}
                                        </p>
                                    </div>
                                    <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {canManage && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <h3 className="font-medium">{t('orders.transition')}</h3>
                            <div className="flex flex-wrap gap-2">
                                {nextStatuses.map((status) => (
                                    <Button
                                        key={status}
                                        size="sm"
                                        variant={status === 'cancelled' ? 'destructive' : 'default'}
                                        disabled={transitionOrder.isPending}
                                        onClick={() => transitionOrder.mutate(status)}
                                    >
                                        {STATUS_LABELS[status]}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-medium">{t('orders.assignWorker')}</h3>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder={t('orders.workerId')}
                                    value={workerId}
                                    onChange={(event) => setWorkerId(event.target.value)}
                                    dir="ltr"
                                />
                                <Button
                                    variant="outline"
                                    disabled={!workerId || assignWorker.isPending}
                                    onClick={() => assignWorker.mutate()}
                                >
                                    <UserPlus className="h-4 w-4" />
                                    {t('orders.assignWorker')}
                                </Button>
                            </div>
                        </div>

                        <Form {...addItemForm}>
                            <form
                                onSubmit={addItemForm.handleSubmit((values) => addItem.mutate(values))}
                                className="space-y-3"
                            >
                                <h3 className="font-medium">{t('orders.addItem')}</h3>
                                <FormField
                                    control={addItemForm.control}
                                    name="service_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select
                                                value={field.value ? String(field.value) : ''}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('orders.selectService')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {services
                                                        .filter((service) => service.is_active)
                                                        .map((service) => (
                                                            <SelectItem key={service.id} value={String(service.id)}>
                                                                {service.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addItemForm.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('orders.quantity')}</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} {...field} dir="ltr" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" variant="outline" disabled={addItem.isPending}>
                                    {t('orders.addItem')}
                                </Button>
                            </form>
                        </Form>
                    </>
                )}

                <Button variant="outline" onClick={() => navigate('/orders')}>
                    {t('common.back')}
                </Button>
            </div>
        </FormPage>
    );
}
