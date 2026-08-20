import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Loader2, Plus, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiClientError, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Branch, Coupon, Discount, PaginatedResponse, PriceRule, Service } from '@/types/api';

const ruleTypes = [
    { value: 'vehicle_type', label: 'نوع المركبة' },
    { value: 'branch', label: 'الفرع' },
    { value: 'service', label: 'الخدمة' },
];

const vehicleTypes = [
    { value: 'sedan', label: 'سيدان' },
    { value: 'suv', label: 'دفع رباعي' },
    { value: 'truck', label: 'شاحنة' },
    { value: 'motorcycle', label: 'دراجة نارية' },
    { value: 'van', label: 'فان' },
    { value: 'bus', label: 'حافلة' },
    { value: 'other', label: 'أخرى' },
];

const priceRuleSchema = z.object({
    name: z.string().min(2, t('pricing.nameRequired')),
    rule_type: z.enum(['vehicle_type', 'branch', 'service']),
    branch_id: z.coerce.number().optional(),
    service_id: z.coerce.number().optional(),
    vehicle_type: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    discount_percent: z.coerce.number().min(0).max(100).optional(),
    is_active: z.boolean(),
});

const couponSchema = z.object({
    discount_id: z.coerce.number().min(1, t('pricing.discountRequired')),
    code: z.string().min(2, t('pricing.codeRequired')).max(50),
    max_uses: z.coerce.number().min(1).optional(),
    is_active: z.boolean(),
});

const discountSchema = z.object({
    name: z.string().min(2, t('pricing.discountName')),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().min(0),
    is_active: z.boolean(),
});

type PriceRuleFormValues = z.infer<typeof priceRuleSchema>;
type CouponFormValues = z.infer<typeof couponSchema>;
type DiscountFormValues = z.infer<typeof discountSchema>;

export function PricingPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('rules');
    const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
    const [couponDialogOpen, setCouponDialogOpen] = useState(false);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [validateCode, setValidateCode] = useState('');
    const [validateResult, setValidateResult] = useState<Coupon | null>(null);
    const [validateError, setValidateError] = useState<string | null>(null);

    const { data: rules, isLoading: rulesLoading } = useAuthenticatedQuery({
        queryKey: ['pricing-rules'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<PriceRule>>(endpoints.pricing.rules, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const { data: coupons, isLoading: couponsLoading } = useAuthenticatedQuery({
        queryKey: ['pricing-coupons'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Coupon>>(endpoints.pricing.coupons, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const { data: discounts } = useAuthenticatedQuery({
        queryKey: ['pricing-discounts'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Discount>>(endpoints.pricing.discounts, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const { data: branches } = useAuthenticatedQuery({
        queryKey: ['branches'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Branch>>(endpoints.branches, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const { data: services } = useAuthenticatedQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const ruleForm = useForm<PriceRuleFormValues>({
        resolver: zodResolver(priceRuleSchema),
        defaultValues: {
            name: '',
            rule_type: 'vehicle_type',
            is_active: true,
        },
    });

    const couponForm = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            discount_id: 0,
            code: '',
            is_active: true,
        },
    });

    const discountForm = useForm<DiscountFormValues>({
        resolver: zodResolver(discountSchema),
        defaultValues: {
            name: '',
            type: 'percentage',
            value: 10,
            is_active: true,
        },
    });

    const ruleType = ruleForm.watch('rule_type');

    const createRuleMutation = useMutation({
        mutationFn: (values: PriceRuleFormValues) => {
            const payload: Record<string, unknown> = {
                name: values.name,
                rule_type: values.rule_type,
                is_active: values.is_active,
            };
            if (values.branch_id) payload.branch_id = values.branch_id;
            if (values.service_id) payload.service_id = values.service_id;
            if (values.vehicle_type) payload.vehicle_type = values.vehicle_type;
            if (values.price !== undefined) payload.price = values.price;
            if (values.discount_percent !== undefined) payload.discount_percent = values.discount_percent;
            return api.post<ApiResponse<PriceRule>>(endpoints.pricing.rules, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
            toast.success(t('pricing.ruleCreated'));
            setRuleDialogOpen(false);
            ruleForm.reset({ name: '', rule_type: 'vehicle_type', is_active: true });
        },
        onError: () => toast.error('تعذّر إنشاء قاعدة التسعير'),
    });

    const createCouponMutation = useMutation({
        mutationFn: (values: CouponFormValues) =>
            api.post<ApiResponse<Coupon>>(endpoints.pricing.coupons, {
                ...values,
                code: values.code.toUpperCase(),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-coupons'] });
            toast.success(t('pricing.couponCreated'));
            setCouponDialogOpen(false);
            couponForm.reset({ discount_id: discounts?.[0]?.id ?? 0, code: '', is_active: true });
        },
        onError: () => toast.error('تعذّر إنشاء الكوبون'),
    });

    const createDiscountMutation = useMutation({
        mutationFn: (values: DiscountFormValues) =>
            api.post<ApiResponse<Discount>>(endpoints.pricing.discounts, values),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['pricing-discounts'] });
            toast.success(t('pricing.discountCreated'));
            setDiscountDialogOpen(false);
            discountForm.reset({ name: '', type: 'percentage', value: 10, is_active: true });
            if (response.data?.id) {
                couponForm.setValue('discount_id', response.data.id);
            }
        },
        onError: () => toast.error('تعذّر إنشاء الخصم'),
    });

    const validateMutation = useMutation({
        mutationFn: (code: string) =>
            api.post<ApiResponse<Coupon>>(endpoints.pricing.couponsValidate, { code: code.toUpperCase() }),
        onSuccess: (response) => {
            setValidateResult(response.data);
            setValidateError(null);
            toast.success(t('pricing.couponValid'));
        },
        onError: (error: unknown) => {
            setValidateResult(null);
            const message = error instanceof ApiClientError ? error.message : t('pricing.couponInvalid');
            setValidateError(message);
        },
    });

    const ruleColumns: ColumnDef<PriceRule>[] = useMemo(
        () => [
            { accessorKey: 'name', header: t('pricing.ruleName') },
            {
                accessorKey: 'rule_type',
                header: t('pricing.ruleType'),
                cell: ({ row }) => row.original.rule_type_label ?? row.original.rule_type,
            },
            {
                id: 'target',
                header: t('pricing.service'),
                cell: ({ row }) => {
                    const rule = row.original;
                    if (rule.vehicle_type) {
                        return vehicleTypes.find((v) => v.value === rule.vehicle_type)?.label ?? rule.vehicle_type;
                    }
                    if (rule.branch_id) {
                        return branches?.find((b) => b.id === rule.branch_id)?.name ?? `#${rule.branch_id}`;
                    }
                    if (rule.service_id) {
                        return services?.find((s) => s.id === rule.service_id)?.name ?? `#${rule.service_id}`;
                    }
                    return '—';
                },
            },
            {
                accessorKey: 'price',
                header: t('pricing.price'),
                cell: ({ row }) =>
                    row.original.price != null ? formatCurrency(row.original.price) : '—',
            },
            {
                accessorKey: 'discount_percent',
                header: t('pricing.discountPercent'),
                cell: ({ row }) =>
                    row.original.discount_percent != null ? `${row.original.discount_percent}%` : '—',
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
        ],
        [branches, services],
    );

    const couponColumns: ColumnDef<Coupon>[] = useMemo(
        () => [
            { accessorKey: 'code', header: t('pricing.couponCode') },
            {
                id: 'discount',
                header: t('pricing.discount'),
                cell: ({ row }) => {
                    const discount = row.original.discount;
                    if (!discount) return '—';
                    return discount.type === 'percentage'
                        ? `${discount.name} (${discount.value}%)`
                        : `${discount.name} (${formatCurrency(discount.value)})`;
                },
            },
            {
                accessorKey: 'used_count',
                header: t('pricing.usedCount'),
                cell: ({ row }) => row.original.used_count ?? 0,
            },
            {
                accessorKey: 'max_uses',
                header: t('pricing.maxUses'),
                cell: ({ row }) => row.original.max_uses ?? '∞',
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
        ],
        [],
    );

    const openCouponDialog = () => {
        couponForm.reset({
            discount_id: discounts?.[0]?.id ?? 0,
            code: '',
            is_active: true,
        });
        setCouponDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <PageHeader title={t('pricing.title')} description={t('pricing.subtitle')} />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="rules">{t('pricing.tabRules')}</TabsTrigger>
                        <TabsTrigger value="coupons">{t('pricing.coupons')}</TabsTrigger>
                    </TabsList>
                    <Button
                        onClick={() => {
                            if (activeTab === 'rules') {
                                ruleForm.reset({ name: '', rule_type: 'vehicle_type', is_active: true });
                                setRuleDialogOpen(true);
                            } else {
                                openCouponDialog();
                            }
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {activeTab === 'rules' ? t('pricing.addRule') : t('pricing.addCoupon')}
                    </Button>
                </div>

                <TabsContent value="rules" className="mt-4">
                    <DataTable columns={ruleColumns} data={rules ?? []} searchKey="name" loading={rulesLoading} />
                </TabsContent>

                <TabsContent value="coupons" className="mt-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('pricing.validateCoupon')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="min-w-[200px] flex-1">
                                    <Input
                                        placeholder={t('pricing.couponCode')}
                                        value={validateCode}
                                        onChange={(e) => setValidateCode(e.target.value.toUpperCase())}
                                        dir="ltr"
                                    />
                                </div>
                                <Button
                                    disabled={!validateCode || validateMutation.isPending}
                                    onClick={() => validateMutation.mutate(validateCode)}
                                >
                                    {validateMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t('pricing.validating')}
                                        </>
                                    ) : (
                                        t('pricing.validate')
                                    )}
                                </Button>
                            </div>
                            {validateResult && (
                                <div className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-green-800">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <div>
                                        <p className="font-medium">
                                            {t('pricing.couponValid')}: {validateResult.code}
                                        </p>
                                        {validateResult.discount && (
                                            <p className="text-sm">
                                                {validateResult.discount.name} —{' '}
                                                {validateResult.discount.type === 'percentage'
                                                    ? `${validateResult.discount.value}%`
                                                    : formatCurrency(validateResult.discount.value)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {validateError && (
                                <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
                                    <XCircle className="h-5 w-5" />
                                    <p>{validateError}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <DataTable
                        columns={couponColumns}
                        data={coupons ?? []}
                        searchKey="code"
                        loading={couponsLoading}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
                <DialogContent className="sm:max-w-lg" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{t('pricing.addRule')}</DialogTitle>
                    </DialogHeader>
                    <Form {...ruleForm}>
                        <form
                            onSubmit={ruleForm.handleSubmit((values) => createRuleMutation.mutate(values))}
                            className="space-y-4"
                        >
                            <FormField
                                control={ruleForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pricing.ruleName')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={ruleForm.control}
                                name="rule_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pricing.ruleType')}</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('pricing.selectRuleType')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ruleTypes.map((type) => (
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

                            {ruleType === 'branch' && (
                                <FormField
                                    control={ruleForm.control}
                                    name="branch_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('pricing.branch')}</FormLabel>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('pricing.selectBranch')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(branches ?? []).map((branch) => (
                                                        <SelectItem key={branch.id} value={String(branch.id)}>
                                                            {branch.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {ruleType === 'service' && (
                                <FormField
                                    control={ruleForm.control}
                                    name="service_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('pricing.service')}</FormLabel>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(value) => field.onChange(Number(value))}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('pricing.selectService')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(services ?? []).map((service) => (
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
                            )}

                            {ruleType === 'vehicle_type' && (
                                <FormField
                                    control={ruleForm.control}
                                    name="vehicle_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('pricing.vehicleType')}</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('pricing.selectVehicleType')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {vehicleTypes.map((type) => (
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
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={ruleForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('pricing.price')}</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.001" min={0} {...field} dir="ltr" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={ruleForm.control}
                                    name="discount_percent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('pricing.discountPercent')}</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} max={100} {...field} dir="ltr" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={ruleForm.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setRuleDialogOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={createRuleMutation.isPending}>
                                    {createRuleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('common.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{t('pricing.addCoupon')}</DialogTitle>
                    </DialogHeader>
                    <Form {...couponForm}>
                        <form
                            onSubmit={couponForm.handleSubmit((values) => createCouponMutation.mutate(values))}
                            className="space-y-4"
                        >
                            <FormField
                                control={couponForm.control}
                                name="discount_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>{t('pricing.selectDiscount')}</FormLabel>
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                className="h-auto p-0"
                                                onClick={() => setDiscountDialogOpen(true)}
                                            >
                                                {t('pricing.createDiscount')}
                                            </Button>
                                        </div>
                                        <Select
                                            value={field.value ? String(field.value) : undefined}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('pricing.selectDiscount')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(discounts ?? []).map((discount) => (
                                                    <SelectItem key={discount.id} value={String(discount.id)}>
                                                        {discount.name} (
                                                        {discount.type === 'percentage'
                                                            ? `${discount.value}%`
                                                            : formatCurrency(discount.value)}
                                                        )
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={couponForm.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pricing.couponCode')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir="ltr" className="uppercase" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={couponForm.control}
                                name="max_uses"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pricing.maxUses')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={couponForm.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className="!mt-0">{t('common.active')}</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setCouponDialogOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={createCouponMutation.isPending}>
                                    {createCouponMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('common.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>{t('pricing.createDiscount')}</DialogTitle>
                    </DialogHeader>
                    <Form {...discountForm}>
                        <form
                            onSubmit={discountForm.handleSubmit((values) => createDiscountMutation.mutate(values))}
                            className="space-y-4"
                        >
                            <FormField
                                control={discountForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pricing.discountName')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={discountForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pricing.ruleType')}</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">نسبة مئوية</SelectItem>
                                                <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={discountForm.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('pricing.discount')}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDiscountDialogOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={createDiscountMutation.isPending}>
                                    {createDiscountMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('common.save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
