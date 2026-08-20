import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { Clock, Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { t } from '@/lib/i18n';
import type { ApiResponse, Branch, PaginatedResponse, WorkingHour } from '@/types/api';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const workingHourSchema = z.object({
    day_of_week: z.number().min(0).max(6),
    opens_at: z.string().optional(),
    closes_at: z.string().optional(),
    is_closed: z.boolean(),
});

const branchSchema = z.object({
    name: z.string().min(2, t('branches.validation.nameRequired')),
    code: z.string().max(20).optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email(t('branches.validation.emailInvalid')).optional().or(z.literal('')),
    capacity_per_hour: z.coerce.number().min(1).max(100).optional(),
    is_active: z.boolean(),
    working_hours: z.array(workingHourSchema).optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

function defaultWorkingHours(): BranchFormValues['working_hours'] {
    return Array.from({ length: 7 }, (_, day) => ({
        day_of_week: day,
        opens_at: '08:00',
        closes_at: '22:00',
        is_closed: day === 5,
    }));
}

function formatTime(value?: string | null): string {
    if (!value) return '—';
    return value.slice(0, 5);
}

function branchToFormValues(branch: Branch): BranchFormValues {
    const hours = branch.working_hours?.length
        ? branch.working_hours.map((hour) => ({
              day_of_week: hour.day_of_week,
              opens_at: formatTime(hour.opens_at),
              closes_at: formatTime(hour.closes_at),
              is_closed: hour.is_closed,
          }))
        : defaultWorkingHours();

    return {
        name: branch.name,
        code: branch.code ?? '',
        city: branch.city ?? '',
        address: branch.address ?? '',
        phone: branch.phone ?? '',
        email: branch.email ?? '',
        capacity_per_hour: branch.capacity_per_hour ?? branch.capacity ?? 10,
        is_active: branch.is_active,
        working_hours: hours,
    };
}

function BranchFormDialog({
    open,
    onOpenChange,
    branch,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branch?: Branch | null;
}) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(branch);

    const form = useForm<BranchFormValues>({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            name: '',
            code: '',
            city: '',
            address: '',
            phone: '',
            email: '',
            capacity_per_hour: 10,
            is_active: true,
            working_hours: defaultWorkingHours(),
        },
    });

    useEffect(() => {
        if (open) {
            form.reset(branch ? branchToFormValues(branch) : {
                name: '',
                code: '',
                city: '',
                address: '',
                phone: '',
                email: '',
                capacity_per_hour: 10,
                is_active: true,
                working_hours: defaultWorkingHours(),
            });
        }
    }, [open, branch, form]);

    const mutation = useMutation({
        mutationFn: (values: BranchFormValues) => {
            const payload = {
                ...values,
                email: values.email || null,
                code: values.code || undefined,
            };

            if (isEdit && branch) {
                return api.put<ApiResponse<Branch>>(`${endpoints.branches}/${branch.id}`, payload);
            }

            return api.post<ApiResponse<Branch>>(endpoints.branches, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success(isEdit ? t('branches.updated') : t('branches.created'));
            onOpenChange(false);
        },
        onError: (error) => {
            applyFieldErrors<BranchFormValues>(error, form.setError);
            showApiError(error, isEdit ? t('branches.updateError') : t('branches.createError'));
        },
    });

    const workingHours = form.watch('working_hours') ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('branches.editTitle') : t('branches.createTitle')}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('branches.name')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('branches.code')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('branches.city')}</FormLabel>
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
                                        <FormLabel>{t('branches.phone')}</FormLabel>
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
                                        <FormLabel>{t('branches.email')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="capacity_per_hour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('branches.capacity')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} max={100} {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>{t('branches.address')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0 sm:col-span-2">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel>{t('branches.workingHours')}</FormLabel>
                            <div className="rounded-md border">
                                {workingHours.map((hour, index) => (
                                    <div key={hour.day_of_week} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b p-3 last:border-b-0">
                                        <span className="text-sm font-medium">{DAY_NAMES[hour.day_of_week]}</span>
                                        <FormField
                                            control={form.control}
                                            name={`working_hours.${index}.opens_at`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="time" {...field} disabled={workingHours[index]?.is_closed} dir="ltr" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`working_hours.${index}.closes_at`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="time" {...field} disabled={workingHours[index]?.is_closed} dir="ltr" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`working_hours.${index}.is_closed`}
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-1 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel className="!mt-0 text-xs">{t('branches.closed')}</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
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

function WorkingHoursDialog({
    branch,
    open,
    onOpenChange,
}: {
    branch: Branch | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const hours = branch?.working_hours ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {branch ? `${t('branches.workingHours')} — ${branch.name}` : t('branches.workingHours')}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    {hours.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                    ) : (
                        hours.map((hour: WorkingHour) => (
                            <div key={hour.id ?? hour.day_of_week} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                <span className="font-medium">{DAY_NAMES[hour.day_of_week]}</span>
                                <span className="text-muted-foreground">
                                    {hour.is_closed
                                        ? t('branches.closed')
                                        : `${formatTime(hour.opens_at)} — ${formatTime(hour.closes_at)}`}
                                </span>
                            </div>
                        ))
                    )}
                    {branch && (
                        <p className="text-sm text-muted-foreground">
                            {t('branches.bays')}: {branch.wash_bays?.length ?? 0}
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function BranchesPage() {
    const queryClient = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
    const [hoursBranch, setHoursBranch] = useState<Branch | null>(null);

    const { data, isLoading, isError, error } = useAuthenticatedQuery({
        queryKey: ['branches'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Branch>>(endpoints.branches, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            showApiError(error, t('branches.loadError'));
        }
    }, [isError, error]);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`${endpoints.branches}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            toast.success(t('branches.deleted'));
            setDeleteTarget(null);
        },
        onError: (err) => showApiError(err, t('branches.deleteError')),
    });

    const columns = useMemo<ColumnDef<Branch>[]>(
        () => [
            { accessorKey: 'name', header: t('branches.name') },
            { accessorKey: 'code', header: t('branches.code') },
            { accessorKey: 'city', header: t('branches.city') },
            {
                accessorKey: 'capacity',
                header: t('branches.capacity'),
                cell: ({ row }) => row.original.capacity_per_hour ?? row.original.capacity ?? '—',
            },
            {
                id: 'wash_bays_count',
                header: t('branches.bays'),
                cell: ({ row }) => row.original.wash_bays?.length ?? row.original.wash_bays_count ?? 0,
            },
            {
                accessorKey: 'is_active',
                header: t('common.status'),
                cell: ({ row }) => (
                    <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
                        {row.original.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                ),
            },
            {
                id: 'working_hours',
                header: t('branches.workingHours'),
                cell: ({ row }) => (
                    <Button variant="ghost" size="sm" onClick={() => setHoursBranch(row.original)}>
                        <Clock className="h-4 w-4" />
                        {t('common.view')}
                    </Button>
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
                                    setEditingBranch(row.original);
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
                title={t('branches.title')}
                description={t('branches.subtitle')}
                actions={
                    <Button
                        onClick={() => {
                            setEditingBranch(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />

            <DataTable columns={columns} data={data ?? []} searchKey="name" loading={isLoading} />

            <BranchFormDialog open={formOpen} onOpenChange={setFormOpen} branch={editingBranch} />

            <WorkingHoursDialog branch={hoursBranch} open={Boolean(hoursBranch)} onOpenChange={(open) => !open && setHoursBranch(null)} />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title={t('branches.deleteTitle')}
                description={`${t('branches.deleteConfirm')} "${deleteTarget?.name ?? ''}"؟`}
                confirmLabel={t('common.delete')}
                loading={deleteMutation.isPending}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            />
        </div>
    );
}
