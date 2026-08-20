import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Eye, Loader2, Plus, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, endpoints } from '@/lib/api';
import { useBranch, useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer, Order, OrderStatus, PaginatedResponse, Service, Vehicle } from '@/types/api';
import { toast } from 'sonner';

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

const createOrderSchema = z.object({
    customer_id: z.coerce.number().min(1, 'اختر العميل'),
    vehicle_id: z.coerce.number().optional(),
    notes: z.string().optional(),
    service_id: z.coerce.number().min(1, 'اختر الخدمة'),
});

type CreateOrderValues = z.infer<typeof createOrderSchema>;

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

export function OrdersPage() {
    const queryClient = useQueryClient();
    const branchParams = useBranchQueryParams();
    const { selectedBranchId } = useBranch();
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [workerId, setWorkerId] = useState('');

    const { data, isLoading } = useAuthenticatedQuery({
        queryKey: ['orders', branchParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Order>>(endpoints.orders, {
                per_page: 50,
                ...branchParams,
            });
            return response.data;
        },
        retry: false,
    });

    const { data: customers = [] } = useAuthenticatedQuery({
        queryKey: ['customers', 'select'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const { data: vehicles = [] } = useAuthenticatedQuery({
        queryKey: ['vehicles', 'select'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Vehicle>>(endpoints.vehicles, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const { data: services = [] } = useAuthenticatedQuery({
        queryKey: ['services', 'select'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 100 });
            return response.data;
        },
        retry: false,
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

    const createForm = useForm<CreateOrderValues>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: { customer_id: 0, vehicle_id: undefined, notes: '', service_id: 0 },
    });

    const addItemForm = useForm<AddItemValues>({
        resolver: zodResolver(addItemSchema),
        defaultValues: { service_id: 0, quantity: 1 },
    });

    const watchedCustomerId = createForm.watch('customer_id');
    const customerVehicles = useMemo(
        () => vehicles.filter((vehicle) => vehicle.customer_id === watchedCustomerId),
        [vehicles, watchedCustomerId],
    );

    const invalidateOrders = () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        if (selectedOrderId) {
            queryClient.invalidateQueries({ queryKey: ['orders', selectedOrderId] });
        }
    };

    const createOrder = useMutation({
        mutationFn: async (values: CreateOrderValues) => {
            if (!selectedBranchId) {
                throw new Error('اختر فرعاً أولاً');
            }
            const service = services.find((item) => item.id === values.service_id);
            if (!service) {
                throw new Error('الخدمة غير موجودة');
            }
            return api.post<ApiResponse<Order>>(endpoints.orders, {
                branch_id: selectedBranchId,
                customer_id: values.customer_id,
                vehicle_id: values.vehicle_id || undefined,
                source: 'walk_in',
                notes: values.notes,
                items: [
                    {
                        item_type: 'service',
                        name: service.name,
                        service_id: service.id,
                        quantity: 1,
                        unit_price: service.base_price,
                    },
                ],
            });
        },
        onSuccess: () => {
            invalidateOrders();
            setCreateOpen(false);
            createForm.reset();
            toast.success('تم إنشاء الطلب');
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر إنشاء الطلب'),
    });

    const transitionOrder = useMutation({
        mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
            api.post<ApiResponse<Order>>(endpoints.orderTransition(orderId), {
                status,
                worker_id: status === 'in_service' && workerId ? Number(workerId) : undefined,
            }),
        onSuccess: () => {
            invalidateOrders();
            toast.success('تم تحديث حالة الطلب');
        },
        onError: () => toast.error('تعذّر تحديث الحالة'),
    });

    const assignWorker = useMutation({
        mutationFn: (orderId: number) =>
            api.post<ApiResponse<Order>>(endpoints.orderAssignWorker(orderId), {
                worker_id: Number(workerId),
            }),
        onSuccess: () => {
            invalidateOrders();
            toast.success('تم تعيين العامل');
        },
        onError: () => toast.error('تعذّر تعيين العامل'),
    });

    const addItem = useMutation({
        mutationFn: ({ orderId, values }: { orderId: number; values: AddItemValues }) => {
            const service = services.find((item) => item.id === values.service_id);
            if (!service) {
                throw new Error('الخدمة غير موجودة');
            }
            return api.post(endpoints.orderAddItem(orderId), {
                item_type: 'service',
                name: service.name,
                service_id: service.id,
                quantity: values.quantity,
                unit_price: service.base_price,
            });
        },
        onSuccess: () => {
            invalidateOrders();
            addItemForm.reset({ service_id: 0, quantity: 1 });
            toast.success('تم إضافة البند');
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر إضافة البند'),
    });

    const columns: ColumnDef<Order>[] = [
        { accessorKey: 'order_number', header: t('orders.orderNumber') },
        {
            id: 'customer_name',
            header: t('customers.name'),
            cell: ({ row }) => orderCustomerName(row.original),
        },
        {
            id: 'vehicle_plate',
            header: t('vehicles.plate'),
            cell: ({ row }) => orderVehiclePlate(row.original),
        },
        {
            accessorKey: 'total_amount',
            header: t('common.total'),
            cell: ({ row }) => formatCurrency(row.original.total_amount),
        },
        {
            accessorKey: 'status',
            header: t('common.status'),
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'completed' ? 'success' : 'secondary'}>
                    {row.original.status_label ?? STATUS_LABELS[row.original.status]}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: t('orders.createdAt'),
            cell: ({ row }) => format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm', { locale: ar }),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(row.original.id)}>
                    <Eye className="h-4 w-4" />
                    {t('common.view')}
                </Button>
            ),
        },
    ];

    const nextStatuses = selectedOrder ? NEXT_STATUSES[selectedOrder.status] ?? [] : [];

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('orders.title')}
                description={t('orders.subtitle')}
                actions={
                    <Button onClick={() => setCreateOpen(true)} disabled={!selectedBranchId}>
                        <Plus className="h-4 w-4" />
                        {t('orders.createWalkIn')}
                    </Button>
                }
            />

            <DataTable columns={columns} data={data ?? []} searchKey="order_number" loading={isLoading} />

            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
                <SheetContent side="start" className="w-full overflow-y-auto sm:max-w-lg">
                    <h2 className="text-lg font-semibold">{t('orders.createWalkIn')}</h2>
                    <p className="text-sm text-muted-foreground">{t('orders.createWalkInHint')}</p>
                    <Form {...createForm}>
                        <form
                            onSubmit={createForm.handleSubmit((values) => createOrder.mutate(values))}
                            className="mt-6 space-y-4"
                        >
                            <FormField
                                control={createForm.control}
                                name="customer_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('customers.name')}</FormLabel>
                                        <Select
                                            value={field.value ? String(field.value) : ''}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('orders.selectCustomer')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={String(customer.id)}>
                                                        {customer.name} — {customer.phone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={createForm.control}
                                name="vehicle_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('vehicles.plate')}</FormLabel>
                                        <Select
                                            value={field.value ? String(field.value) : ''}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('orders.selectVehicle')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {customerVehicles.map((vehicle) => (
                                                    <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                                                        {vehicle.plate_number} — {vehicle.brand} {vehicle.model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={createForm.control}
                                name="service_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.name')}</FormLabel>
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
                                                            {service.name} — {formatCurrency(service.base_price)}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={createForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('orders.notes')}</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={3} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={createOrder.isPending} className="w-full">
                                {createOrder.isPending ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {t('common.saving')}
                                    </>
                                ) : (
                                    t('orders.createWalkIn')
                                )}
                            </Button>
                        </form>
                    </Form>
                </SheetContent>
            </Sheet>

            <Sheet open={selectedOrderId !== null} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
                <SheetContent side="start" className="w-full overflow-y-auto sm:max-w-xl">
                    {detailLoading || !selectedOrder ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold">{selectedOrder.order_number}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {orderCustomerName(selectedOrder)} — {orderVehiclePlate(selectedOrder)}
                                </p>
                                <Badge className="mt-2" variant={selectedOrder.status === 'completed' ? 'success' : 'secondary'}>
                                    {selectedOrder.status_label ?? STATUS_LABELS[selectedOrder.status]}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">{t('invoices.subtotal')}</span>
                                    <p className="font-semibold">{formatCurrency(selectedOrder.subtotal)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t('invoices.vatAmount')}</span>
                                    <p className="font-semibold">{formatCurrency(selectedOrder.tax_amount)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t('common.total')}</span>
                                    <p className="font-semibold text-primary">{formatCurrency(selectedOrder.total_amount)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t('orders.worker')}</span>
                                    <p className="font-semibold">{selectedOrder.worker?.name ?? '—'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h3 className="font-medium">{t('orders.items')}</h3>
                                {(selectedOrder.items ?? []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(selectedOrder.items ?? []).map((item) => (
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

                            {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
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
                                                    onClick={() =>
                                                        transitionOrder.mutate({
                                                            orderId: selectedOrder.id,
                                                            status,
                                                        })
                                                    }
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
                                                onClick={() => assignWorker.mutate(selectedOrder.id)}
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                {t('orders.assignWorker')}
                                            </Button>
                                        </div>
                                    </div>

                                    <Form {...addItemForm}>
                                        <form
                                            onSubmit={addItemForm.handleSubmit((values) =>
                                                addItem.mutate({ orderId: selectedOrder.id, values }),
                                            )}
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
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
