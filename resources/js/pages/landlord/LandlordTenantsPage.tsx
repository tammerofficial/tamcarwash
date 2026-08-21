import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, ExternalLink, Eye, Loader2, MoreHorizontal, PauseCircle, Pencil, PlayCircle, Plus, Trash2 } from 'lucide-react';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { LandlordPlan, LandlordTenantRow, TenantStatus } from '@/types/landlord';

const tenantSchema = z.object({
    name: z.string().min(2, 'اسم المغسلة مطلوب'),
    slug: z.string().regex(/^[a-z0-9-]*$/, 'أحرف إنجليزية صغيرة وأرقام وشرطات فقط').optional().or(z.literal('')),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    phone: z.string().optional(),
    plan_id: z.string().min(1, 'اختر الباقة'),
    status: z.enum(['active', 'suspended', 'pending', 'provisioning']),
    owner_name: z.string().optional(),
    owner_password: z.string().min(8, '8 أحرف على الأقل').optional().or(z.literal('')),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

const STATUS_OPTIONS: TenantStatus[] = ['active', 'suspended', 'pending', 'provisioning'];

export function statusLabel(status: string): string {
    return t(`landlord.tenants.statuses.${status as TenantStatus}`) || status;
}

export function TenantFormDialog({
    open,
    onOpenChange,
    tenant,
    plans,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant?: LandlordTenantRow | null;
    plans: LandlordPlan[];
}) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(tenant);
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    const form = useForm<TenantFormValues>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            name: '',
            slug: '',
            email: '',
            phone: '',
            plan_id: '',
            status: 'provisioning',
            owner_name: '',
            owner_password: '',
        },
    });

    useEffect(() => {
        if (open) {
            setTempPassword(null);
            form.reset(
                tenant
                    ? {
                          name: tenant.name,
                          slug: tenant.slug,
                          email: tenant.email ?? '',
                          phone: tenant.phone ?? '',
                          plan_id: tenant.plan_id ?? tenant.plan?.id ?? '',
                          status: (tenant.status as TenantStatus) ?? 'active',
                      }
                    : {
                          name: '',
                          slug: '',
                          email: '',
                          phone: '',
                          plan_id: plans[0]?.id ?? '',
                          status: 'provisioning',
                          owner_name: '',
                          owner_password: '',
                      },
            );
        }
    }, [open, tenant, plans, form]);

    const mutation = useMutation({
        mutationFn: async (values: TenantFormValues) => {
            if (isEdit && tenant) {
                return api.patch<ApiResponse<LandlordTenantRow>>(endpoints.landlord.tenant(tenant.id), {
                    name: values.name,
                    slug: values.slug || undefined,
                    email: values.email,
                    phone: values.phone || undefined,
                    plan_id: values.plan_id,
                    status: values.status,
                });
            }

            return api.post<ApiResponse<{ tenant: LandlordTenantRow; owner?: { temporary_password?: string } }>>(
                endpoints.landlord.tenants,
                {
                    name: values.name,
                    slug: values.slug || undefined,
                    email: values.email,
                    phone: values.phone || undefined,
                    plan_id: values.plan_id,
                    status: values.status,
                    owner_name: values.owner_name || undefined,
                    owner_password: values.owner_password || undefined,
                },
            );
        },
        onSuccess: (response) => {
            toast.success(isEdit ? t('landlord.tenants.updated') : t('landlord.tenants.created'));
            queryClient.invalidateQueries({ queryKey: ['landlord-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['landlord-tenant'] });
            if (!isEdit && response.data && 'owner' in response.data && response.data.owner?.temporary_password) {
                setTempPassword(response.data.owner.temporary_password);
                return;
            }
            onOpenChange(false);
        },
        onError: (error) => {
            applyFieldErrors(error, form.setError);
            showApiError(error);
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('landlord.tenants.edit') : t('landlord.tenants.add')}</DialogTitle>
                </DialogHeader>

                {tempPassword ? (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">{t('landlord.tenants.tempPasswordHint')}</p>
                        <div className="rounded-xl border bg-muted/30 p-4 font-mono text-lg">{tempPassword}</div>
                        <DialogFooter>
                            <Button onClick={() => { setTempPassword(null); onOpenChange(false); }}>{t('common.confirm')}</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.tenants.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="slug" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.tenants.slug')}</FormLabel><FormControl><Input {...field} dir="ltr" placeholder="my-wash" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.tenants.email')}</FormLabel><FormControl><Input {...field} type="email" dir="ltr" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.tenants.phone')}</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="plan_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('landlord.tenants.plan')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={t('landlord.tenants.plan')} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {plans.map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('landlord.tenants.status')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((status) => (
                                                <SelectItem key={status} value={status}>{statusLabel(status)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            {!isEdit && (
                                <>
                                    <FormField control={form.control} name="owner_name" render={({ field }) => (
                                        <FormItem><FormLabel>{t('landlord.tenants.ownerName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="owner_password" render={({ field }) => (
                                        <FormItem><FormLabel>{t('landlord.tenants.ownerPassword')}</FormLabel><FormControl><Input {...field} type="password" dir="ltr" /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </>
                            )}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function LandlordTenantsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<LandlordTenantRow | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'suspend' | 'activate'; tenant: LandlordTenantRow } | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-tenants'],
        queryFn: () => api.get<PaginatedResponse<LandlordTenantRow>>(endpoints.landlord.tenants, { per_page: 100 }),
    });

    const { data: plansData } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    const plans = plansData?.data ?? [];

    const actionMutation = useMutation({
        mutationFn: async (action: NonNullable<typeof confirmAction>) => {
            if (action.type === 'delete') {
                return api.delete(endpoints.landlord.tenant(action.tenant.id));
            }
            return api.patch(endpoints.landlord.tenant(action.tenant.id), {
                status: action.type === 'suspend' ? 'suspended' : 'active',
            });
        },
        onSuccess: (_, action) => {
            const message =
                action.type === 'delete' ? t('landlord.tenants.deleted')
                : action.type === 'suspend' ? t('landlord.tenants.suspended')
                : t('landlord.tenants.activated');
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ['landlord-tenants'] });
            setConfirmAction(null);
        },
        onError: (error) => showApiError(error),
    });

    const columns = useMemo<ColumnDef<LandlordTenantRow>[]>(() => [
        { accessorKey: 'name', header: t('landlord.tenants.name'), cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
        { accessorKey: 'slug', header: 'Slug', cell: ({ row }) => <span className="text-muted-foreground">{row.original.slug}</span> },
        {
            accessorKey: 'plan',
            header: t('landlord.tenants.plan'),
            cell: ({ row }) => <Badge variant="secondary">{row.original.plan?.name ?? '—'}</Badge>,
        },
        {
            accessorKey: 'status',
            header: t('landlord.tenants.status'),
            cell: ({ row }) => (
                <Badge className={cn(row.original.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
                    {statusLabel(row.original.status)}
                </Badge>
            ),
        },
        {
            id: 'subscription',
            header: t('landlord.tenants.subscription'),
            cell: ({ row }) => (
                <div className="text-sm">
                    <div>{row.original.subscription_status ?? '—'}</div>
                    {row.original.subscription_ends_at && (
                        <div className="text-xs text-muted-foreground">
                            {new Date(row.original.subscription_ends_at).toLocaleDateString('ar-OM')}
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => {
                const tenant = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => navigate(`/landlord/tenants/${tenant.id}`)}>
                                <Eye className="me-2 h-4 w-4" />{t('landlord.tenants.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditingTenant(tenant); setFormOpen(true); }}>
                                <Pencil className="me-2 h-4 w-4" />{t('common.edit')}
                            </DropdownMenuItem>
                            {tenant.status === 'active' && tenant.dashboard_url && (
                                <DropdownMenuItem asChild>
                                    <a href={tenant.dashboard_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="me-2 h-4 w-4" />{t('landlord.tenants.openDashboard')}
                                    </a>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {tenant.status === 'active' ? (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: 'suspend', tenant })}>
                                    <PauseCircle className="me-2 h-4 w-4" />{t('landlord.tenants.suspend')}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: 'activate', tenant })}>
                                    <PlayCircle className="me-2 h-4 w-4" />{t('landlord.tenants.activate')}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ type: 'delete', tenant })}>
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
                title={t('landlord.tenants.title')}
                description={t('landlord.tenants.subtitle')}
                actions={
                    <Button onClick={() => { setEditingTenant(null); setFormOpen(true); }}>
                        <Plus className="me-2 h-4 w-4" />{t('landlord.tenants.add')}
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('landlord.tenants.listTitle')}</CardTitle>
                    <CardDescription>{t('landlord.tenants.listHint')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (data?.data ?? []).length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Building2 className="mx-auto mb-4 h-12 w-12 opacity-30" />
                            <p className="font-bold">{t('landlord.tenants.emptyTitle')}</p>
                            <p className="text-sm">{t('landlord.tenants.emptyHint')}</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data?.data ?? []}
                            searchKey="name"
                            searchPlaceholder={t('landlord.tenants.searchPlaceholder')}
                        />
                    )}
                </CardContent>
            </Card>

            <TenantFormDialog open={formOpen} onOpenChange={setFormOpen} tenant={editingTenant} plans={plans} />

            <ConfirmDialog
                open={Boolean(confirmAction)}
                onOpenChange={(open) => !open && setConfirmAction(null)}
                title={
                    confirmAction?.type === 'delete' ? t('landlord.tenants.deleteTitle')
                    : confirmAction?.type === 'suspend' ? t('landlord.tenants.suspendTitle')
                    : t('landlord.tenants.activate')
                }
                description={
                    confirmAction?.type === 'delete' ? t('landlord.tenants.deleteHint')
                    : confirmAction?.type === 'suspend' ? t('landlord.tenants.suspendHint')
                    : ''
                }
                confirmLabel={
                    confirmAction?.type === 'delete' ? t('common.delete')
                    : confirmAction?.type === 'suspend' ? t('landlord.tenants.suspend')
                    : t('landlord.tenants.activate')
                }
                onConfirm={() => confirmAction && actionMutation.mutate(confirmAction)}
                loading={actionMutation.isPending}
                destructive={confirmAction?.type !== 'activate'}
            />
        </div>
    );
}
