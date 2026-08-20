import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
    Banknote,
    CreditCard,
    Loader2,
    Receipt,
    Search,
    UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useBranch, useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import type {
    ApiResponse,
    Booking,
    Invoice,
    Order,
    OrderStatus,
    PaginatedResponse,
    PaymentMethodOption,
    QueueEntry,
    Service,
} from '@/types/api';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'جديد',
    checked_in: 'وصل',
    queued: 'في الطابور',
    in_service: 'قيد الخدمة',
    quality_check: 'فحص الجودة',
    ready: 'جاهز',
    completed: 'مكتمل',
    cancelled: 'ملغي',
};

const ORDER_FLOW: OrderStatus[] = [
    'checked_in',
    'queued',
    'in_service',
    'quality_check',
    'ready',
    'completed',
];

export function CashierPage() {
    const queryClient = useQueryClient();
    const branchParams = useBranchQueryParams();
    const { selectedBranchId } = useBranch();
    const [search, setSearch] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
    const [workerId, setWorkerId] = useState('');
    const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'split'>('cash');
    const [splitCash, setSplitCash] = useState('');
    const [splitCard, setSplitCard] = useState('');

    const { data: searchResults = [], isFetching: searching } = useAuthenticatedQuery({
        queryKey: ['cashier-search', activeSearch, branchParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Booking>>(endpoints.bookings, {
                search: activeSearch,
                per_page: 10,
                ...branchParams,
            });
            return response.data;
        },
        enabled: activeSearch.length >= 2,
        retry: false,
    });

    const { data: services = [] } = useAuthenticatedQuery({
        queryKey: ['services', 'cashier'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const { data: paymentMethods = [] } = useAuthenticatedQuery({
        queryKey: ['payment-methods'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<PaymentMethodOption[]>>(endpoints.paymentMethods);
            return response.data;
        },
        retry: false,
    });

    const cashMethod = paymentMethods.find((method) => method.code === 'cash');
    const cardMethod = paymentMethods.find((method) => method.code === 'card');

    const serviceName = useMemo(() => {
        if (!selectedBooking?.service_ids?.length) {
            return '—';
        }
        return selectedBooking.service_ids
            .map((id) => services.find((service) => service.id === id)?.name_ar ?? services.find((s) => s.id === id)?.name)
            .filter(Boolean)
            .join('، ');
    }, [selectedBooking, services]);

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['cashier-search'] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
    };

    const addToQueue = useMutation({
        mutationFn: (bookingId: number) =>
            api.post<ApiResponse<QueueEntry>>(endpoints.queue.fromBooking(bookingId)),
        onSuccess: (response) => {
            setQueueEntry(response.data);
            invalidateAll();
            toast.success('تم تسجيل حضور العميل وإضافته للطابور');
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر إضافة الحجز للطابور'),
    });

    const markArrived = useMutation({
        mutationFn: (entryId: number) =>
            api.patch<ApiResponse<QueueEntry>>(endpoints.queue.entryStatus(entryId), { status: 'arrived' }),
        onSuccess: (response) => {
            setQueueEntry(response.data);
            invalidateAll();
            toast.success('تم تسجيل وصول العميل');
        },
        onError: () => toast.error('تعذّر تسجيل الوصول'),
    });

    const convertToOrder = useMutation({
        mutationFn: (bookingId: number) =>
            api.post<ApiResponse<Booking>>(endpoints.bookingConvert(bookingId)),
        onSuccess: async (response) => {
            setSelectedBooking(response.data);
            if (response.data.order_id) {
                const orderResponse = await api.get<ApiResponse<Order>>(endpoints.order(response.data.order_id));
                setSelectedOrder(orderResponse.data);
            }
            invalidateAll();
            toast.success('تم تحويل الحجز إلى طلب');
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر تحويل الحجز'),
    });

    const transitionOrder = useMutation({
        mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
            api.post<ApiResponse<Order>>(endpoints.orderTransition(orderId), {
                status,
                worker_id: status === 'in_service' && workerId ? Number(workerId) : undefined,
                queue_entry_id: queueEntry?.id,
            }),
        onSuccess: (response) => {
            setSelectedOrder(response.data);
            invalidateAll();
            toast.success('تم تحديث حالة الطلب');
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر تحديث الحالة'),
    });

    const assignWorker = useMutation({
        mutationFn: (orderId: number) =>
            api.post<ApiResponse<Order>>(endpoints.orderAssignWorker(orderId), {
                worker_id: Number(workerId),
            }),
        onSuccess: (response) => {
            setSelectedOrder(response.data);
            toast.success('تم تعيين العامل');
        },
        onError: () => toast.error('تعذّر تعيين العامل'),
    });

    const createInvoice = useMutation({
        mutationFn: (orderId: number) =>
            api.post<ApiResponse<Invoice>>(endpoints.orderInvoice(orderId)),
        onSuccess: (response) => {
            setSelectedInvoice(response.data);
            invalidateAll();
            toast.success('تم إصدار الفاتورة الضريبية');
        },
        onError: () => toast.error('تعذّر إصدار الفاتورة'),
    });

    const recordPayment = useMutation({
        mutationFn: async () => {
            if (!selectedInvoice || !selectedBranchId) {
                throw new Error('لا توجد فاتورة');
            }

            const total = selectedInvoice.total;

            if (paymentMode === 'split') {
                const cashAmount = Number(splitCash) || 0;
                const cardAmount = Number(splitCard) || 0;
                if (!cashMethod || !cardMethod) {
                    throw new Error('طرق الدفع غير متوفرة');
                }
                if (Math.abs(cashAmount + cardAmount - total) > 0.01) {
                    throw new Error('مجموع الدفعتين يجب أن يساوي إجمالي الفاتورة');
                }
                if (cashAmount > 0) {
                    await api.post(endpoints.payments, {
                        invoice_id: selectedInvoice.id,
                        order_id: selectedOrder?.id,
                        payment_method_id: cashMethod.id,
                        branch_id: selectedBranchId,
                        amount: cashAmount,
                    });
                }
                if (cardAmount > 0) {
                    await api.post(endpoints.payments, {
                        invoice_id: selectedInvoice.id,
                        order_id: selectedOrder?.id,
                        payment_method_id: cardMethod.id,
                        branch_id: selectedBranchId,
                        amount: cardAmount,
                    });
                }
                return;
            }

            const method = paymentMode === 'cash' ? cashMethod : cardMethod;
            if (!method) {
                throw new Error('طريقة الدفع غير متوفرة');
            }

            await api.post(endpoints.payments, {
                invoice_id: selectedInvoice.id,
                order_id: selectedOrder?.id,
                payment_method_id: method.id,
                branch_id: selectedBranchId,
                amount: total,
            });
        },
        onSuccess: async () => {
            if (selectedInvoice) {
                const refreshed = await api.get<ApiResponse<Invoice>>(endpoints.invoice(selectedInvoice.id));
                setSelectedInvoice(refreshed.data);
            }
            if (selectedOrder && selectedOrder.status === 'ready') {
                await transitionOrder.mutateAsync({ orderId: selectedOrder.id, status: 'completed' });
            }
            invalidateAll();
            toast.success('تم تسجيل الدفع');
        },
        onError: (error: Error) => toast.error(error.message || 'تعذّر تسجيل الدفع'),
    });

    function handleSearch(event: React.FormEvent) {
        event.preventDefault();
        setActiveSearch(search.trim());
        setSelectedBooking(null);
        setSelectedOrder(null);
        setSelectedInvoice(null);
        setQueueEntry(null);
    }

    async function loadBooking(booking: Booking) {
        setSelectedBooking(booking);
        setSelectedOrder(null);
        setSelectedInvoice(null);
        setQueueEntry(null);

        if (booking.order_id) {
            const orderResponse = await api.get<ApiResponse<Order>>(endpoints.order(booking.order_id));
            setSelectedOrder(orderResponse.data);
        }
    }

    function nextOrderStatus(order: Order): OrderStatus | null {
        if (order.status === 'pending') {
            return 'checked_in';
        }
        const index = ORDER_FLOW.indexOf(order.status as OrderStatus);
        if (index >= 0 && index < ORDER_FLOW.length - 1) {
            return ORDER_FLOW[index + 1];
        }
        return null;
    }

    const nextStatus = selectedOrder ? nextOrderStatus(selectedOrder) : null;

    return (
        <div className="space-y-6">
            <PageHeader
                title="الكاشير"
                description="ابحث عن الحجز برقم الحجز أو الهاتف أو اللوحة، ثم أكمل مسار الخدمة والدفع"
            />

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                        <div className="relative min-w-[240px] flex-1">
                            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="رقم الحجز، الهاتف، أو اللوحة — مثل BK- أو 96891234567 أو 1234"
                                className="ps-9"
                            />
                        </div>
                        <Button type="submit" disabled={search.trim().length < 2 || searching}>
                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'بحث'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {activeSearch && searchResults.length > 0 && !selectedBooking && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">نتائج البحث</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {searchResults.map((booking) => (
                            <button
                                key={booking.id}
                                type="button"
                                className="flex w-full items-center justify-between rounded-lg border p-4 text-start transition hover:bg-muted/40"
                                onClick={() => loadBooking(booking)}
                            >
                                <div>
                                    <p className="font-semibold">{booking.booking_number}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {booking.customer_name} — {booking.vehicle_plate}
                                    </p>
                                </div>
                                <Badge>{booking.status_label ?? booking.status}</Badge>
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}

            {selectedBooking && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5" />
                                {selectedBooking.booking_number}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">العميل</span>
                                    <p className="font-medium">{selectedBooking.customer_name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">اللوحة</span>
                                    <p className="font-medium">{selectedBooking.vehicle_plate}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">الخدمة</span>
                                    <p className="font-medium">{serviceName}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">الموعد</span>
                                    <p className="font-medium">
                                        {selectedBooking.scheduled_date &&
                                            format(
                                                new Date(`${selectedBooking.scheduled_date}T${selectedBooking.scheduled_start_time}`),
                                                'dd MMM HH:mm',
                                                { locale: ar },
                                            )}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-wrap gap-2">
                                {!queueEntry && (
                                    <Button
                                        size="sm"
                                        disabled={addToQueue.isPending}
                                        onClick={() => addToQueue.mutate(selectedBooking.id)}
                                    >
                                        تسجيل الحضور → الطابور
                                    </Button>
                                )}
                                {queueEntry && queueEntry.status === 'waiting' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={markArrived.isPending}
                                        onClick={() => markArrived.mutate(queueEntry.id)}
                                    >
                                        تأكيد الوصول
                                    </Button>
                                )}
                                {!selectedOrder && (
                                    <Button
                                        size="sm"
                                        disabled={convertToOrder.isPending}
                                        onClick={() => convertToOrder.mutate(selectedBooking.id)}
                                    >
                                        تحويل إلى طلب
                                    </Button>
                                )}
                            </div>

                            {queueEntry && (
                                <p className="text-sm text-muted-foreground">
                                    رقم الطابور: <strong>{queueEntry.queue_number}</strong> —{' '}
                                    {queueEntry.status_label ?? queueEntry.status}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {selectedOrder && (
                        <Card>
                            <CardHeader>
                                <CardTitle>الطلب {selectedOrder.order_number}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Badge variant="secondary">
                                    {selectedOrder.status_label ?? ORDER_STATUS_LABELS[selectedOrder.status]}
                                </Badge>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">قبل الضريبة</span>
                                        <p className="font-semibold">{formatCurrency(selectedOrder.subtotal)}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">ض.ق.م 5%</span>
                                        <p className="font-semibold">{formatCurrency(selectedOrder.tax_amount)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">الإجمالي</span>
                                        <p className="text-lg font-bold text-primary">
                                            {formatCurrency(selectedOrder.total_amount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {nextStatus && selectedOrder.status !== 'completed' && (
                                        <Button
                                            size="sm"
                                            disabled={transitionOrder.isPending}
                                            onClick={() =>
                                                transitionOrder.mutate({
                                                    orderId: selectedOrder.id,
                                                    status: nextStatus,
                                                })
                                            }
                                        >
                                            {ORDER_STATUS_LABELS[nextStatus]}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="رقم العامل (مثلاً 4)"
                                        value={workerId}
                                        onChange={(event) => setWorkerId(event.target.value)}
                                        dir="ltr"
                                        className="max-w-[160px]"
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={!workerId || assignWorker.isPending}
                                        onClick={() => assignWorker.mutate(selectedOrder.id)}
                                    >
                                        تعيين عامل
                                    </Button>
                                </div>

                                {selectedOrder.status === 'ready' && !selectedInvoice && (
                                    <Button
                                        className="w-full"
                                        disabled={createInvoice.isPending}
                                        onClick={() => createInvoice.mutate(selectedOrder.id)}
                                    >
                                        <Receipt className="h-4 w-4" />
                                        إصدار فاتورة ضريبية
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {selectedInvoice && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            فاتورة {selectedInvoice.invoice_number}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">العميل</span>
                                <p className="font-medium">{selectedInvoice.customer_name}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">اللوحة</span>
                                <p className="font-medium">{selectedBooking?.vehicle_plate ?? '—'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">VATIN</span>
                                <p className="font-medium" dir="ltr">
                                    {selectedInvoice.vatin ?? '—'}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">الحالة</span>
                                <p className="font-medium">{selectedInvoice.payment_status ?? selectedInvoice.status}</p>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4 text-sm">
                            <div className="flex justify-between">
                                <span>قبل الضريبة</span>
                                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ض.ق.م ({selectedInvoice.vat_rate ?? 5}%)</span>
                                <span>{formatCurrency(selectedInvoice.vat_amount)}</span>
                            </div>
                            <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                                <span>الإجمالي</span>
                                <span>{formatCurrency(selectedInvoice.total)}</span>
                            </div>
                        </div>

                        {selectedInvoice.qr_payload && (
                            <p className="break-all rounded bg-muted/40 p-3 text-xs" dir="ltr">
                                QR: {selectedInvoice.qr_payload}
                            </p>
                        )}

                        {selectedInvoice.payment_status !== 'paid' && (
                            <>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={paymentMode === 'cash' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPaymentMode('cash')}
                                    >
                                        <Banknote className="h-4 w-4" />
                                        نقداً
                                    </Button>
                                    <Button
                                        variant={paymentMode === 'card' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPaymentMode('card')}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        بطاقة
                                    </Button>
                                    <Button
                                        variant={paymentMode === 'split' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPaymentMode('split')}
                                    >
                                        دفع مقسّم
                                    </Button>
                                </div>

                                {paymentMode === 'split' && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <Label>نقداً</Label>
                                            <Input
                                                value={splitCash}
                                                onChange={(event) => setSplitCash(event.target.value)}
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>بطاقة</Label>
                                            <Input
                                                value={splitCard}
                                                onChange={(event) => setSplitCard(event.target.value)}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full"
                                    disabled={recordPayment.isPending}
                                    onClick={() => recordPayment.mutate()}
                                >
                                    {recordPayment.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'تسجيل الدفع وإكمال الطلب'
                                    )}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
