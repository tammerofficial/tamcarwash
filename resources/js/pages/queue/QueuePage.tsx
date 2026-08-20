import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Clock, Loader2, Megaphone, Plus, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { useBranch, useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer, PaginatedResponse, QueueEntry, QueueEntryStatus, Vehicle } from '@/types/api';

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

const walkInSchema = z.object({
    customer_id: z.coerce.number().min(1, 'اختر العميل'),
    vehicle_id: z.coerce.number().min(1, 'اختر المركبة'),
    notes: z.string().optional(),
});

type WalkInValues = z.infer<typeof walkInSchema>;

function sourceLabel(source: QueueEntry['source']): string {
    return source === 'walk_in' ? t('queue.sourceWalkIn') : t('queue.sourceBooking');
}

export function QueuePage() {
    const queryClient = useQueryClient();
    const branchParams = useBranchQueryParams();
    const { selectedBranchId } = useBranch();
    const [walkInOpen, setWalkInOpen] = useState(false);
    const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['queue', branchParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<QueueEntry>>(endpoints.queue.entries, {
                per_page: 50,
                ...branchParams,
            });
            return response.data;
        },
        retry: false,
        refetchInterval: 15_000,
    });

    const { data: estimatedWait } = useQuery({
        queryKey: ['queue-estimated-wait', branchParams],
        queryFn: async () => {
            const response = await api.get<ApiResponse<{ estimated_wait_minutes: number }>>(
                endpoints.queue.estimatedWait,
                branchParams,
            );
            return response.data.estimated_wait_minutes;
        },
        enabled: Boolean(branchParams.branch_id),
        retry: false,
        refetchInterval: 15_000,
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers', 'select'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ['vehicles', 'select'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Vehicle>>(endpoints.vehicles, { per_page: 100 });
            return response.data;
        },
        retry: false,
    });

    const walkInForm = useForm<WalkInValues>({
        resolver: zodResolver(walkInSchema),
        defaultValues: { customer_id: 0, vehicle_id: 0, notes: '' },
    });

    const watchedCustomerId = walkInForm.watch('customer_id');
    const customerVehicles = useMemo(
        () => vehicles.filter((vehicle) => vehicle.customer_id === watchedCustomerId),
        [vehicles, watchedCustomerId],
    );

    const selectedEntry = useMemo(
        () => data?.find((entry) => entry.id === selectedEntryId) ?? null,
        [data, selectedEntryId],
    );

    const invalidateQueue = () => {
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['queue-estimated-wait'] });
        queryClient.invalidateQueries({ queryKey: ['queue-screen'] });
    };

    const callNext = useMutation({
        mutationFn: () => api.post<ApiResponse<QueueEntry | null>>(endpoints.queue.callNext, branchParams),
        onSuccess: (response) => {
            invalidateQueue();
            toast.success(response.message ?? t('queue.callNextSuccess'));
        },
        onError: () => toast.error(t('queue.callNextError')),
    });

    const addWalkIn = useMutation({
        mutationFn: (values: WalkInValues) =>
            api.post<ApiResponse<QueueEntry>>(endpoints.queue.walkIn, {
                branch_id: selectedBranchId,
                customer_id: values.customer_id,
                vehicle_id: values.vehicle_id,
                notes: values.notes || undefined,
            }),
        onSuccess: () => {
            invalidateQueue();
            setWalkInOpen(false);
            walkInForm.reset();
            toast.success(t('queue.walkInSuccess'));
        },
        onError: (error: Error) => toast.error(error.message || t('queue.walkInError')),
    });

    const updateStatus = useMutation({
        mutationFn: ({ entryId, status }: { entryId: number; status: QueueEntryStatus }) =>
            api.patch<ApiResponse<QueueEntry>>(endpoints.queue.entryStatus(entryId), { status }),
        onSuccess: () => {
            invalidateQueue();
            toast.success(t('queue.statusUpdated'));
        },
        onError: () => toast.error(t('queue.statusError')),
    });

    const waitingCount = data?.filter((entry) => entry.status === 'waiting').length ?? 0;
    const inServiceCount = data?.filter((entry) => entry.status === 'in_service').length ?? 0;
    const readyCount = data?.filter((entry) => entry.status === 'ready').length ?? 0;

    const columns: ColumnDef<QueueEntry>[] = [
        { accessorKey: 'queue_number', header: t('queue.queueNumber') },
        {
            id: 'customer_name',
            header: t('customers.name'),
            cell: ({ row }) => row.original.customer_name ?? '—',
        },
        {
            id: 'vehicle_plate',
            header: t('vehicles.plate'),
            cell: ({ row }) => row.original.vehicle_plate ?? '—',
        },
        {
            accessorKey: 'source',
            header: t('queue.source'),
            cell: ({ row }) => sourceLabel(row.original.source),
        },
        {
            accessorKey: 'estimated_wait_minutes',
            header: t('queue.estimatedWait'),
            cell: ({ row }) =>
                row.original.estimated_wait_minutes ? `${row.original.estimated_wait_minutes} ${t('queue.minutes')}` : '—',
        },
        {
            accessorKey: 'status',
            header: t('common.status'),
            cell: ({ row }) => (
                <Badge variant={STATUS_VARIANTS[row.original.status]}>
                    {row.original.status_label ?? STATUS_LABELS[row.original.status]}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedEntryId(row.original.id)}>
                    {t('queue.manage')}
                </Button>
            ),
        },
    ];

    const nextStatuses = selectedEntry ? NEXT_STATUSES[selectedEntry.status] ?? [] : [];

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('queue.title')}
                description={t('queue.subtitle')}
                actions={
                    <>
                        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                            {t('common.refresh')}
                        </Button>
                        <Button variant="outline" onClick={() => setWalkInOpen(true)} disabled={!selectedBranchId}>
                            <Plus className="h-4 w-4" />
                            {t('queue.addWalkIn')}
                        </Button>
                        <Button onClick={() => callNext.mutate()} disabled={callNext.isPending || !selectedBranchId}>
                            <Megaphone className="h-4 w-4" />
                            {t('queue.callNext')}
                        </Button>
                    </>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('queue.waiting')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{waitingCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('queue.inService')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{inServiceCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('queue.ready')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{readyCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            {t('queue.estimatedWait')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {estimatedWait !== undefined ? `${estimatedWait} ${t('queue.minutes')}` : '—'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <DataTable columns={columns} data={data ?? []} searchKey="queue_number" loading={isLoading} />

            <Sheet open={walkInOpen} onOpenChange={setWalkInOpen}>
                <SheetContent side="start" className="w-full overflow-y-auto sm:max-w-lg">
                    <h2 className="text-lg font-semibold">{t('queue.addWalkIn')}</h2>
                    <p className="text-sm text-muted-foreground">{t('queue.walkInHint')}</p>
                    <Form {...walkInForm}>
                        <form
                            onSubmit={walkInForm.handleSubmit((values) => addWalkIn.mutate(values))}
                            className="mt-6 space-y-4"
                        >
                            <FormField
                                control={walkInForm.control}
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
                                                    <SelectValue placeholder={t('booking.selectCustomer')} />
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
                                control={walkInForm.control}
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
                                                    <SelectValue placeholder={t('booking.selectVehicle')} />
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
                                control={walkInForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('booking.notes')}</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={3} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={addWalkIn.isPending} className="w-full">
                                {addWalkIn.isPending ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {t('common.saving')}
                                    </>
                                ) : (
                                    t('queue.addWalkIn')
                                )}
                            </Button>
                        </form>
                    </Form>
                </SheetContent>
            </Sheet>

            <Sheet open={selectedEntryId !== null} onOpenChange={(open) => !open && setSelectedEntryId(null)}>
                <SheetContent side="start" className="w-full overflow-y-auto sm:max-w-md">
                    {selectedEntry ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold">{selectedEntry.queue_number}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {selectedEntry.customer_name} — {selectedEntry.vehicle_plate}
                                </p>
                                <Badge className="mt-2" variant={STATUS_VARIANTS[selectedEntry.status]}>
                                    {selectedEntry.status_label ?? STATUS_LABELS[selectedEntry.status]}
                                </Badge>
                            </div>

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
                                                onClick={() =>
                                                    updateStatus.mutate({ entryId: selectedEntry.id, status })
                                                }
                                            >
                                                {STATUS_LABELS[status]}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </div>
    );
}
