import { useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';
import { PLAN_FEATURE_CATALOG, PLAN_FEATURE_KEYS, emptyFeatureMap, normalizeFeatureMap } from '@/lib/plan-features';
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
    features: z.record(z.boolean()),
    is_active: z.boolean(),
    sort_order: z.coerce.number().min(0).optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

function defaultValues(): PlanFormValues {
    return {
        slug: '',
        name: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        currency: 'OMR',
        is_active: true,
        sort_order: 0,
        features: emptyFeatureMap(),
    };
}

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
        features: normalizeFeatureMap(plan.features),
        is_active: plan.is_active ?? true,
        sort_order: plan.sort_order ?? 0,
    };
}

export function LandlordPlanFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-plan', id],
        queryFn: () => api.get<ApiResponse<LandlordPlan>>(endpoints.landlord.plan(id!)),
        enabled: isEdit,
    });

    const plan = data?.data;

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: defaultValues(),
    });

    useEffect(() => {
        if (plan) {
            form.reset(planToFormValues(plan));
        }
    }, [plan, form]);

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
                features: normalizeFeatureMap(values.features),
                is_active: values.is_active,
                sort_order: values.sort_order ?? 0,
            };

            if (isEdit && id) {
                return api.patch<ApiResponse<LandlordPlan>>(endpoints.landlord.plan(id), payload);
            }

            return api.post<ApiResponse<LandlordPlan>>(endpoints.landlord.plans, payload);
        },
        onSuccess: () => {
            toast.success(isEdit ? t('landlord.plans.updated') : t('landlord.plans.created'));
            queryClient.invalidateQueries({ queryKey: ['landlord-plans'] });
            queryClient.invalidateQueries({ queryKey: ['landlord-plan'] });
            navigate('/landlord/plans');
        },
        onError: (error) => {
            applyFieldErrors(error, form.setError);
            showApiError(error);
        },
    });

    if (isEdit && isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <FormPage
            title={isEdit ? t('landlord.plans.editTitle') : t('landlord.plans.createTitle')}
            description={t('landlord.plans.featuresHint')}
            backTo={isEdit && id ? `/landlord/plans/${id}` : '/landlord/plans'}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold">{t('landlord.plans.details')}</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="slug" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.slug')}</FormLabel><FormControl><Input {...field} dir="ltr" disabled={isEdit} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>{t('landlord.plans.description')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid gap-4 md:grid-cols-3">
                            <FormField control={form.control} name="price_monthly" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.priceMonthly')}</FormLabel><FormControl><Input {...field} type="number" step="0.01" dir="ltr" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="price_yearly" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.priceYearly')}</FormLabel><FormControl><Input {...field} type="number" step="0.01" dir="ltr" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="currency" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.currency')}</FormLabel><FormControl><Input {...field} dir="ltr" maxLength={3} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
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
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField control={form.control} name="sort_order" render={({ field }) => (
                                <FormItem><FormLabel>{t('landlord.plans.sortOrder')}</FormLabel><FormControl><Input {...field} type="number" dir="ltr" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="is_active" render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0 pt-8">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel>{t('landlord.plans.isActive')}</FormLabel>
                                </FormItem>
                            )} />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <h2 className="text-lg font-bold">{t('landlord.plans.features')}</h2>
                            <p className="text-sm text-muted-foreground">{t('landlord.plans.featuresHint')}</p>
                        </div>
                        <div className="divide-y rounded-xl border">
                            {PLAN_FEATURE_CATALOG.map((feature) => (
                                <FormField
                                    key={feature.key}
                                    control={form.control}
                                    name={`features.${feature.key}`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between gap-4 space-y-0 p-4">
                                            <div className="space-y-1 text-start">
                                                <FormLabel className="text-base">{feature.label}</FormLabel>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value === true}
                                                    onCheckedChange={(checked) => {
                                                        const next = { ...form.getValues('features') };
                                                        PLAN_FEATURE_KEYS.forEach((key) => {
                                                            next[key] = next[key] === true;
                                                        });
                                                        next[feature.key] = checked;
                                                        form.setValue('features', next, { shouldDirty: true });
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate('/landlord/plans')}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="animate-spin" /> : t('common.save')}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormPage>
    );
}
