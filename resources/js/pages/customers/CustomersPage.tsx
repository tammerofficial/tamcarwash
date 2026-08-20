import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { Ban, Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer, CustomerNote, PaginatedResponse } from '@/types/api';

const statusLabels: Record<Customer['status'], string> = {
    active: t('common.active'),
    inactive: t('common.inactive'),
    blacklisted: t('customers.blacklisted'),
};

const customerSchema = z.object({
    name: z.string().min(2, t('customers.validation.nameRequired')),
    phone: z.string().min(5, t('customers.validation.phoneRequired')),
    email: z.string().email(t('customers.validation.emailInvalid')).optional().or(z.literal('')),
    status: z.enum(['active', 'inactive', 'blacklisted']),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

function CustomerFormDialog({
    open,
    onOpenChange,
    customer,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Customer | null;
}) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(customer);
    const [noteText, setNoteText] = useState('');

    const { data: customerDetail, isLoading: detailLoading } = useAuthenticatedQuery({
        queryKey: ['customers', customer?.id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Customer>>(`${endpoints.customers}/${customer!.id}`);
            return response.data;
        },
        enabled: open && isEdit && Boolean(customer?.id),
        retry: false,
    });

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            status: 'active',
        },
    });

    useEffect(() => {
        if (open && !isEdit) {
            form.reset({ name: '', phone: '', email: '', status: 'active' });
            setNoteText('');
        }
    }, [open, isEdit, form]);

    useEffect(() => {
        if (customerDetail) {
            form.reset({
                name: customerDetail.name,
                phone: customerDetail.phone,
                email: customerDetail.email ?? '',
                status: customerDetail.status,
            });
        }
    }, [customerDetail, form]);

    const saveMutation = useMutation({
        mutationFn: (values: CustomerFormValues) => {
            const payload = { ...values, email: values.email || null };

            if (isEdit && customer) {
                return api.put<ApiResponse<Customer>>(`${endpoints.customers}/${customer.id}`, payload);
            }

            return api.post<ApiResponse<Customer>>(endpoints.customers, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            if (customer) {
                queryClient.invalidateQueries({ queryKey: ['customers', customer.id] });
            }
            toast.success(isEdit ? t('customers.updated') : t('customers.created'));
            if (!isEdit) {
                onOpenChange(false);
            }
        },
        onError: (error) => {
            applyFieldErrors<CustomerFormValues>(error, form.setError);
            showApiError(error, isEdit ? t('customers.updateError') : t('customers.createError'));
        },
    });

    const addNoteMutation = useMutation({
        mutationFn: (note: string) =>
            api.post<ApiResponse<CustomerNote>>(`${endpoints.customers}/${customer!.id}/notes`, { note }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers', customer!.id] });
            setNoteText('');
            toast.success(t('customers.noteAdded'));
        },
        onError: (error) => showApiError(error, t('customers.noteError')),
    });

    const blacklistMutation = useMutation({
        mutationFn: () => api.post<ApiResponse<Customer>>(`${endpoints.customers}/${customer!.id}/blacklist`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customers', customer!.id] });
            form.setValue('status', 'blacklisted');
            toast.success(t('customers.blacklistedSuccess'));
        },
        onError: (error) => showApiError(error, t('customers.blacklistError')),
    });

    const activateMutation = useMutation({
        mutationFn: () => api.post<ApiResponse<Customer>>(`${endpoints.customers}/${customer!.id}/activate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customers', customer!.id] });
            form.setValue('status', 'active');
            toast.success(t('customers.activated'));
        },
        onError: (error) => showApiError(error, t('customers.activateError')),
    });

    const statusTogglePending = blacklistMutation.isPending || activateMutation.isPending;
    const notes = customerDetail?.notes ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('customers.editTitle') : t('customers.createTitle')}</DialogTitle>
                </DialogHeader>

                {isEdit && detailLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('customers.name')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('customers.phone')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('customers.email')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('common.status')}</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">{t('common.active')}</SelectItem>
                                                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                                                <SelectItem value="blacklisted">{t('customers.blacklisted')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isEdit && (
                                <>
                                    <div className="rounded-md border bg-muted/30 p-3">
                                        <p className="text-sm font-medium">{t('customers.loyaltyPoints')}</p>
                                        <p className="text-2xl font-bold">
                                            {customerDetail?.loyalty_points_balance ?? customer?.loyalty_points_balance ?? 0}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">{t('customers.blacklistToggle')}</p>
                                            <p className="text-xs text-muted-foreground">{t('customers.blacklistHint')}</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant={form.watch('status') === 'blacklisted' ? 'secondary' : 'destructive'}
                                            size="sm"
                                            disabled={statusTogglePending}
                                            onClick={() => {
                                                if (form.watch('status') === 'blacklisted') {
                                                    activateMutation.mutate();
                                                } else {
                                                    blacklistMutation.mutate();
                                                }
                                            }}
                                        >
                                            {statusTogglePending ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Ban className="h-4 w-4" />
                                                    {form.watch('status') === 'blacklisted'
                                                        ? t('customers.removeBlacklist')
                                                        : t('customers.addBlacklist')}
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <FormLabel>{t('customers.notes')}</FormLabel>
                                        {notes.length > 0 ? (
                                            <div className="max-h-32 space-y-2 overflow-y-auto rounded-md border p-2">
                                                {notes.map((note) => (
                                                    <div key={note.id} className="rounded bg-muted/50 p-2 text-sm">
                                                        <p>{note.note}</p>
                                                        {note.created_at && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {new Date(note.created_at).toLocaleDateString('ar-OM')}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">{t('customers.noNotes')}</p>
                                        )}
                                        <Textarea
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder={t('customers.notePlaceholder')}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!noteText.trim() || addNoteMutation.isPending}
                                            onClick={() => addNoteMutation.mutate(noteText.trim())}
                                        >
                                            {addNoteMutation.isPending ? <Loader2 className="animate-spin" /> : t('customers.addNote')}
                                        </Button>
                                    </div>
                                </>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function CustomersPage() {
    const queryClient = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

    const { data, isLoading, isError, error } = useAuthenticatedQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            showApiError(error, t('customers.loadError'));
        }
    }, [isError, error]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`${endpoints.customers}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success(t('customers.deleted'));
            setDeleteTarget(null);
        },
        onError: (err) => showApiError(err, t('customers.deleteError')),
    });

    const columns = useMemo<ColumnDef<Customer>[]>(
        () => [
            { accessorKey: 'name', header: t('customers.name') },
            { accessorKey: 'phone', header: t('customers.phone') },
            { accessorKey: 'email', header: t('customers.email') },
            {
                id: 'loyalty_points',
                header: t('customers.loyaltyPoints'),
                cell: ({ row }) => row.original.loyalty_points_balance ?? row.original.loyalty_points ?? 0,
            },
            {
                accessorKey: 'status',
                header: t('common.status'),
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.original.status === 'active'
                                ? 'success'
                                : row.original.status === 'blacklisted'
                                  ? 'destructive'
                                  : 'secondary'
                        }
                    >
                        {statusLabels[row.original.status]}
                    </Badge>
                ),
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
                                    setEditingCustomer(row.original);
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
                title={t('customers.title')}
                description={t('customers.subtitle')}
                actions={
                    <Button
                        onClick={() => {
                            setEditingCustomer(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />

            <DataTable columns={columns} data={data ?? []} searchKey="name" loading={isLoading} />

            <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editingCustomer} />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={t('customers.deleteTitle')}
                description={`${t('customers.deleteConfirm')} "${deleteTarget?.name ?? ''}"؟`}
                confirmLabel={t('common.delete')}
                loading={deleteMutation.isPending}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            />
        </div>
    );
}
