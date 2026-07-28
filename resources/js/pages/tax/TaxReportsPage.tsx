import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, TaxReportSummary } from '@/types/api';
import { DollarSign, Receipt, TrendingDown, TrendingUp } from 'lucide-react';

type Period = 'daily' | 'monthly' | 'quarterly';

export function TaxReportsPage() {
    const [period, setPeriod] = useState<Period>('monthly');

    const { data, isLoading } = useQuery({
        queryKey: ['tax-reports', period],
        queryFn: async () => {
            const response = await api.get<ApiResponse<TaxReportSummary>>(endpoints.taxReports, { period });
            return response.data;
        },
        retry: false,
    });

    const report = data ?? {
        period: period,
        taxable_sales: 0,
        exempt_sales: 0,
        vat_collected: 0,
        vat_on_expenses: 0,
        net_vat_due: 0,
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('taxReports.title')}
                description={t('taxReports.subtitle')}
                actions={
                    <Button variant="outline">
                        <Download className="h-4 w-4" />
                        {t('common.export')}
                    </Button>
                }
            />

            <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
                <TabsList>
                    <TabsTrigger value="daily">{t('taxReports.daily')}</TabsTrigger>
                    <TabsTrigger value="monthly">{t('taxReports.monthly')}</TabsTrigger>
                    <TabsTrigger value="quarterly">{t('taxReports.quarterly')}</TabsTrigger>
                </TabsList>

                <TabsContent value={period} className="mt-6 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <StatsCard title={t('taxReports.taxableSales')} value={report.taxable_sales} icon={TrendingUp} format="currency" loading={isLoading} />
                        <StatsCard title={t('taxReports.exemptSales')} value={report.exempt_sales} icon={Receipt} format="currency" loading={isLoading} />
                        <StatsCard title={t('taxReports.vatCollected')} value={report.vat_collected} icon={DollarSign} format="currency" loading={isLoading} />
                        <StatsCard title={t('taxReports.vatOnExpenses')} value={report.vat_on_expenses} icon={TrendingDown} format="currency" loading={isLoading} />
                        <StatsCard title={t('taxReports.netVatDue')} value={report.net_vat_due} icon={DollarSign} format="currency" loading={isLoading} />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>ملخص الفترة — {report.period}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between border-b pb-2">
                                <span>{t('taxReports.taxableSales')}</span>
                                <span className="font-semibold">{formatCurrency(report.taxable_sales)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>{t('taxReports.exemptSales')}</span>
                                <span className="font-semibold">{formatCurrency(report.exempt_sales)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>{t('taxReports.vatCollected')}</span>
                                <span className="font-semibold">{formatCurrency(report.vat_collected)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span>{t('taxReports.vatOnExpenses')}</span>
                                <span className="font-semibold">{formatCurrency(report.vat_on_expenses)}</span>
                            </div>
                            <div className="flex justify-between pt-2 text-lg">
                                <span className="font-bold">{t('taxReports.netVatDue')}</span>
                                <span className="font-bold text-primary">{formatCurrency(report.net_vat_due)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
