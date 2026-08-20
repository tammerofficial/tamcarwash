import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer, PaginatedResponse, Vehicle, VehicleType } from '@/types/api';

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
    { value: 'sedan', label: 'سيدان' },
    { value: 'suv', label: 'دفع رباعي' },
    { value: 'truck', label: 'شاحنة' },
    { value: 'motorcycle', label: 'دراجة نارية' },
    { value: 'van', label: 'فان' },
    { value: 'bus', label: 'حافلة' },
    { value: 'other', label: 'أخرى' },
];

const vehicleSchema = z.object({
    plate_number: z.string().min(2, t('vehicles.validation.plateRequired')),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    vehicle_type: z.enum(['sedan', 'suv', 'truck', 'motorcycle', 'van', 'bus', 'other']).optional(),
    customer_id: z.coerce.number().min(1, t('vehicles.validation.customerRequired')),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

function VehicleFormDialog({
    open,
    onOpenChange,
    vehicle,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle?: Vehicle | null;
}) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(vehicle);

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 100 });
            return response.data;
        },
        enabled: open,
        retry: false,
    });

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            plate_number: '',
            brand: '',
            model: '',
            color: '',
            vehicle_type: 'sedan',
            customer_id: 0,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset(
                vehicle
                    ? {
                          plate_number: vehicle.plate_number,
                          brand: vehicle.brand ?? '',
                          model: vehicle.model ?? '',
                          color: vehicle.color ?? '',
                          vehicle_type: vehicle.vehicle_type ?? 'sedan',
                          customer_id: vehicle.customer_id,
                      }
                    : {
                          plate_number: '',
                          brand: '',
                          model: '',
                          color: '',
                          vehicle_type: 'sedan',
                          customer_id: customers[0]?.id ?? 0,
                      },
            );
        }
    }, [open, vehicle, form, customers]);

    const mutation = useMutation({
        mutationFn: (values: VehicleFormValues) => {
            if (isEdit && vehicle) {
                return api.put<ApiResponse<Vehicle>>(`${endpoints.vehicles}/${vehicle.id}`, values);
            }

            return api.post<ApiResponse<Vehicle>>(endpoints.vehicles, values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            toast.success(isEdit ? t('vehicles.updated') : t('vehicles.created'));
            onOpenChange(false);
        },
        onError: (error) => {
            applyFieldErrors(error, form.setError);
            showApiError(error, isEdit ? t('vehicles.updateError') : t('vehicles.createError'));
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('vehicles.editTitle') : t('vehicles.createTitle')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="plate_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('vehicles.plate')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} dir="ltr" className="uppercase" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="customer_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('vehicles.owner')}</FormLabel>
                                    <Select
                                        value={field.value ? String(field.value) : ''}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('vehicles.selectCustomer')} />
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
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('vehicles.brand')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('vehicles.model')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('vehicles.color')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vehicle_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('vehicles.type')}</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {VEHICLE_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function VehiclesPage() {
    const queryClient = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['vehicles'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Vehicle>>(endpoints.vehicles, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            showApiError(error, t('vehicles.loadError'));
        }
    }, [isError, error]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`${endpoints.vehicles}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            toast.success(t('vehicles.deleted'));
            setDeleteTarget(null);
        },
        onError: (err) => showApiError(err, t('vehicles.deleteError')),
    });

    const columns = useMemo<ColumnDef<Vehicle>[]>(
        () => [
            { accessorKey: 'plate_number', header: t('vehicles.plate') },
            { accessorKey: 'brand', header: t('vehicles.brand') },
            { accessorKey: 'model', header: t('vehicles.model') },
            { accessorKey: 'color', header: t('vehicles.color') },
            {
                id: 'vehicle_type',
                header: t('vehicles.type'),
                cell: ({ row }) =>
                    row.original.vehicle_type_label ??
                    VEHICLE_TYPES.find((t) => t.value === row.original.vehicle_type)?.label ??
                    row.original.type ??
                    '—',
            },
            {
                accessorKey: 'customer.name',
                header: t('vehicles.owner'),
                cell: ({ row }) => row.original.customer?.name ?? '—',
            },
            {
                id: 'actions',
                header: t('common.actions'),
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    setEditingVehicle(row.original);
                                    setFormOpen(true);
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                                {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(row.original)}
                            >
                                <Trash2 className="h-4 w-4" />
                                {t('common.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('vehicles.title')}
                description={t('vehicles.subtitle')}
                actions={
                    <Button
                        onClick={() => {
                            setEditingVehicle(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />

            <DataTable columns={columns} data={data ?? []} searchKey="plate_number" loading={isLoading} />

            <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} vehicle={editingVehicle} />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={t('vehicles.deleteTitle')}
                description={`${t('vehicles.deleteConfirm')} "${deleteTarget?.plate_number ?? ''}"؟`}
                confirmLabel={t('common.delete')}
                loading={deleteMutation.isPending}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            />
        </div>
    );
}
