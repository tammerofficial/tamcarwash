import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { t } from '@/lib/i18n';
import type { PaginatedResponse, PriceRule } from '@/types/api';

const columns: ColumnDef<PriceRule>[] = [
    { accessorKey: 'name', header: t('pricing.ruleName') },
    { accessorKey: 'rule_type', header: t('pricing.ruleType') },
    {
        accessorKey: 'discount_value',
        header: t('pricing.discount'),
        cell: ({ row }) =>
            row.original.discount_type === 'percentage'
                ? `${row.original.discount_value}%`
                : `${row.original.discount_value} ر.ع`,
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
];

export function PricingPage() {
    const { data: rules, isLoading: rulesLoading } = useQuery({
        queryKey: ['pricing-rules'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<PriceRule>>(endpoints.pricing.rules, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const { data: coupons, isLoading: couponsLoading } = useQuery({
        queryKey: ['pricing-coupons'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<PriceRule>>(endpoints.pricing.coupons, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('pricing.title')}
                description={t('pricing.subtitle')}
                actions={
                    <Button>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />

            <Tabs defaultValue="rules">
                <TabsList>
                    <TabsTrigger value="rules">قواعد التسعير</TabsTrigger>
                    <TabsTrigger value="coupons">{t('pricing.coupons')}</TabsTrigger>
                </TabsList>
                <TabsContent value="rules" className="mt-4">
                    <DataTable columns={columns} data={rules ?? []} searchKey="name" loading={rulesLoading} />
                </TabsContent>
                <TabsContent value="coupons" className="mt-4">
                    <DataTable columns={columns} data={coupons ?? []} searchKey="name" loading={couponsLoading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
