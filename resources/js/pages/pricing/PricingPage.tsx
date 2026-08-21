import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Loader2, Plus, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, ApiClientError, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Branch, Coupon, PaginatedResponse, PriceRule, Service } from '@/types/api';

const vehicleTypes = [
    { value: 'sedan', label: 'سيدان' },
    { value: 'suv', label: 'دفع رباعي' },
    { value: 'truck', label: 'شاحنة' },
    { value: 'motorcycle', label: 'دراجة نارية' },
    { value: 'van', label: 'فان' },
    { value: 'bus', label: 'حافلة' },
    { value: 'other', label: 'أخرى' },
];

export function PricingPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('rules');
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
                        return vehicleTypes.find((item) => item.value === rule.vehicle_type)?.label ?? rule.vehicle_type;
                    }
                    if (rule.branch_id) {
                        return branches?.find((item) => item.id === rule.branch_id)?.name ?? `#${rule.branch_id}`;
                    }
                    if (rule.service_id) {
                        return services?.find((item) => item.id === rule.service_id)?.name ?? `#${rule.service_id}`;
                    }
                    return '—';
                },
            },
            {
                accessorKey: 'price',
                header: t('pricing.price'),
                cell: ({ row }) => (row.original.price != null ? formatCurrency(row.original.price) : '—'),
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

    const createPath =
        activeTab === 'rules'
            ? '/pricing/rules/create'
            : activeTab === 'coupons'
              ? '/pricing/coupons/create'
              : '/pricing/discounts/create';

    const createLabel =
        activeTab === 'rules'
            ? t('pricing.addRule')
            : activeTab === 'coupons'
              ? t('pricing.addCoupon')
              : t('pricing.createDiscount');

    return (
        <div className="space-y-6">
            <PageHeader title={t('pricing.title')} description={t('pricing.subtitle')} />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="rules">{t('pricing.tabRules')}</TabsTrigger>
                        <TabsTrigger value="coupons">{t('pricing.coupons')}</TabsTrigger>
                    </TabsList>
                    <div className="flex flex-wrap gap-2">
                        {activeTab === 'coupons' && (
                            <Button variant="outline" onClick={() => navigate('/pricing/discounts/create')}>
                                <Plus className="h-4 w-4" />
                                {t('pricing.createDiscount')}
                            </Button>
                        )}
                        <Button onClick={() => navigate(createPath)}>
                            <Plus className="h-4 w-4" />
                            {createLabel}
                        </Button>
                    </div>
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
                                        onChange={(event) => setValidateCode(event.target.value.toUpperCase())}
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

                    <DataTable columns={couponColumns} data={coupons ?? []} searchKey="code" loading={couponsLoading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
