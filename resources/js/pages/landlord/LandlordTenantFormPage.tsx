import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { applyFieldErrors, showApiError } from '@/lib/api-errors';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse } from '@/types/api';
import type { LandlordPlan, LandlordTenantRow, TenantStatus } from '@/types/landlord';
import { statusLabel } from '@/pages/landlord/LandlordTenantsPage';

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

export function LandlordTenantFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-tenant', id],
        queryFn: () => api.get<ApiResponse<LandlordTenantRow>>(endpoints.landlord.tenant(id!)),
        enabled: isEdit,
    });

    const { data: plansData } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    const tenant = data?.data;
    const plans = plansData?.data ?? [];

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
        if (tenant) {
            form.reset({
                name: tenant.name,
                slug: tenant.slug,
                email: tenant.email ?? '',
                phone: tenant.phone ?? '',
                plan_id: tenant.plan_id ?? tenant.plan?.id ?? '',
                status: (tenant.status as TenantStatus) ?? 'active',
            });
        } else if (!isEdit && plans[0]?.id && !form.getValues('plan_id')) {
            form.setValue('plan_id', plans[0].id);
        }
    }, [tenant, isEdit, plans, form]);

    const mutation = useMutation({
        mutationFn: async (values: TenantFormValues) => {
            if (isEdit && id) {
                return api.patch<ApiResponse<LandlordTenantRow>>(endpoints.landlord.tenant(id), {
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
            navigate(isEdit && id ? `/landlord/tenants/${id}` : '/landlord/tenants');
        },
        onError: (error) => {
            applyFieldErrors(error, form.setError);
            showApiError(error);
        },
    });

    if (isEdit && isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (tempPassword) {
        return (
            <FormPage title={t('landlord.tenants.add')} backTo="/landlord/tenants">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{t('landlord.tenants.tempPasswordHint')}</p>
                    <div className="rounded-xl border bg-muted/30 p-4 font-mono text-lg">{tempPassword}</div>
                    <Button onClick={() => navigate('/landlord/tenants')}>{t('common.confirm')}</Button>
                </div>
            </FormPage>
        );
    }

    return (
        <FormPage
            title={isEdit ? t('landlord.tenants.edit') : t('landlord.tenants.add')}
            backTo={isEdit && id ? `/landlord/tenants/${id}` : '/landlord/tenants'}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{t('landlord.tenants.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="slug" render={({ field }) => (
                        <FormItem><FormLabel>{t('landlord.tenants.slug')}</FormLabel><FormControl><Input {...field} dir="ltr" placeholder="my-wash" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.tenants.email')}</FormLabel><FormControl><Input {...field} type="email" dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.tenants.phone')}</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
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
                    </div>
                    {!isEdit && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="owner_name" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.tenants.ownerName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="owner_password" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.tenants.ownerPassword')}</FormLabel><FormControl><Input {...field} type="password" dir="ltr" /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/landlord/tenants')}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
