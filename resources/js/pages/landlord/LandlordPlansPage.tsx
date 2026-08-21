import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard, Eye, Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { LandlordPlan } from '@/types/landlord';

const planSchema = z.object({
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
    name: z.string().min(2),
    description: z.string().optional(),
    price_monthly: z.coerce.number().min(0),
    price_yearly: z.coerce.number().min(0),
    currency: z.string().length(3),
    max_branches: z.coerce.number().min(1).optional().nullable(),
    max_users: z.coerce.number().min(1).optional().nullable(),
    max_vehicles_per_day: z.coerce.number().min(1).optional().nullable(),
    featuresText: z.string().optional(),
    is_active: z.boolean(),
    sort_order: z.coerce.number().min(0).optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

function planToFormValues(plan: LandlordPlan): PlanFormValues {
    return {
        slug: plan.slug,
        name: plan.name,
        description: plan.description ?? '',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        currency: plan.currency ?? 'OMR',
        max_branches: plan.max_branches ?? undefined,
        max_users: plan.max_users ?? undefined,
        max_vehicles_per_day: plan.max_vehicles_per_day ?? undefined,
        featuresText: (plan.features ?? []).join('\n'),
        is_active: plan.is_active ?? true,
        sort_order: plan.sort_order ?? 0,
    };
}

export function PlanFormDialog({
    open,
    onOpenChange,
    plan,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan?: LandlordPlan | null;
}) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(plan);

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            slug: '',
            name: '',
            description: '',
            price_monthly: 0,
            price_yearly: 0,
            currency: 'OMR',
            is_active: true,
            sort_order: 0,
            featuresText: '',
        },
    });

    useEffect(() => {
        if (open) {
            form.reset(plan ? planToFormValues(plan) : {
                slug: '',
                name: '',
                description: '',
                price_monthly: 0,
                price_yearly: 0,
                currency: 'OMR',
                is_active: true,
                sort_order: 0,
                featuresText: '',
            });
        }
    }, [open, plan, form]);

    const mutation = useMutation({
        mutationFn: (values: PlanFormValues) => {
            const payload = {
                slug: values.slug,
                name: values.name,
                description: values.description || null,
                price_monthly: values.price_monthly,
                price_yearly: values.price_yearly,
                currency: values.currency,
                max_branches: values.max_branches ?? null,
                max_users: values.max_users ?? null,
                max_vehicles_per_day: values.max_vehicles_per_day ?? null,
                features: values.featuresText
                    ? values.featuresText.split('\n').map((f) => f.trim()).filter(Boolean)
                    : [],
                is_active: values.is_active,
                sort_order: values.sort_order ?? 0,
            };

            if (isEdit && plan) {
                return api.patch<ApiResponse<LandlordPlan>>(endpoints.landlord.plan(plan.id), payload);
            }

            return api.post<ApiResponse<LandlordPlan>>(endpoints.landlord.plans, payload);
        },
        onSuccess: () => {
            toast.success(isEdit ? t('landlord.plans.updated') : t('landlord.plans.created'));
            queryClient.invalidateQueries({ queryKey: ['landlord-plans'] });
            queryClient.invalidateQueries({ queryKey: ['landlord-plan'] });
            onOpenChange(false);
        },
        onError: (error) => {
            applyFieldErrors(error, form.setError);
            showApiError(error);
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('landlord.plans.edit') : t('landlord.plans.add')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.plans.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="slug" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.plans.slug')}</FormLabel><FormControl><Input {...field} dir="ltr" disabled={isEdit} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.plans.description')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="price_monthly" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.priceMonthly')}</FormLabel><FormControl><Input {...field} type="number" step="0.01" dir="ltr" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="price_yearly" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.priceYearly')}</FormLabel><FormControl><Input {...field} type="number" step="0.01" dir="ltr" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="currency" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.plans.currency')}</FormLabel><FormControl><Input {...field} dir="ltr" maxLength={3} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="max_branches" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.branches')}</FormLabel><FormControl><Input {...field} type="number" dir="ltr" onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="max_users" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.users')}</FormLabel><FormControl><Input {...field} type="number" dir="ltr" onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="max_vehicles_per_day" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.vehiclesPerDay')}</FormLabel><FormControl><Input {...field} type="number" dir="ltr" onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="featuresText" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.plans.features')}</FormLabel><FormControl><Textarea {...field} rows={4} placeholder={t('landlord.plans.featuresHint')} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="sort_order" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.plans.sortOrder')}</FormLabel><FormControl><Input {...field} type="number" dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="is_active" render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel>{t('landlord.plans.isActive')}</FormLabel>
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
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

export function LandlordPlansPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<LandlordPlan | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<LandlordPlan | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    const deleteMutation = useMutation({
        mutationFn: (plan: LandlordPlan) => api.delete(endpoints.landlord.plan(plan.id)),
        onSuccess: () => {
            toast.success(t('landlord.plans.deleted'));
            queryClient.invalidateQueries({ queryKey: ['landlord-plans'] });
            setDeletingPlan(null);
        },
        onError: (error) => showApiError(error),
    });

    const plans = data?.data ?? [];

    const columns = useMemo<ColumnDef<LandlordPlan>[]>(() => [
        { accessorKey: 'name', header: t('landlord.plans.name'), cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
        { accessorKey: 'slug', header: t('landlord.plans.slug'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug}</span> },
        {
            id: 'price',
            header: t('landlord.plans.priceMonthly'),
            cell: ({ row }) => formatCurrency(row.original.price_monthly, row.original.currency),
        },
        {
            accessorKey: 'max_branches',
            header: t('landlord.plans.branches'),
            cell: ({ row }) => row.original.max_branches ?? t('landlord.plans.unlimited'),
        },
        {
            accessorKey: 'is_active',
            header: t('common.status'),
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => {
                const plan = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => navigate(`/landlord/plans/${plan.id}`)}>
                                <Eye className="me-2 h-4 w-4" />{t('landlord.plans.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditingPlan(plan); setFormOpen(true); }}>
                                <Pencil className="me-2 h-4 w-4" />{t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeletingPlan(plan)}>
                                <Trash2 className="me-2 h-4 w-4" />{t('common.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [navigate]);

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader
                title={t('landlord.plans.title')}
                description={t('landlord.plans.subtitle')}
                actions={
                    <Button onClick={() => { setEditingPlan(null); setFormOpen(true); }}>
                        <Plus className="me-2 h-4 w-4" />{t('landlord.plans.add')}
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('landlord.plans.title')}</CardTitle>
                    <CardDescription>{t('landlord.plans.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : plans.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <CreditCard className="mx-auto mb-4 h-12 w-12 opacity-30" />
                            <p className="font-bold">{t('landlord.plans.emptyTitle')}</p>
                            <p className="text-sm">{t('landlord.plans.emptyHint')}</p>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={plans} searchKey="name" searchPlaceholder={t('common.search')} />
                    )}
                </CardContent>
            </Card>

            <PlanFormDialog open={formOpen} onOpenChange={setFormOpen} plan={editingPlan} />

            <ConfirmDialog
                open={Boolean(deletingPlan)}
                onOpenChange={(open) => !open && setDeletingPlan(null)}
                title={t('landlord.plans.deleteTitle')}
                description={t('landlord.plans.deleteHint')}
                confirmLabel={t('common.delete')}
                onConfirm={() => deletingPlan && deleteMutation.mutate(deletingPlan)}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
