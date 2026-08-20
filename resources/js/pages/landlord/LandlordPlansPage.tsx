import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse } from '@/types/api';

interface LandlordPlan {
    id: string;
    slug: string;
    name: string;
    description?: string;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    max_branches?: number;
    max_users?: number;
    features?: string[];
}

export function LandlordPlansPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    const plans = data?.data ?? [];

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold">{t('landlord.plans.title')}</h2>
                <p className="text-muted-foreground">{t('landlord.plans.subtitle')}</p>
            </div>

            {isLoading ? (
                <Skeleton className="h-64 w-full" />
            ) : plans.length === 0 ? (
                <EmptyState
                    icon={CreditCard}
                    title={t('landlord.plans.emptyTitle')}
                    description={t('landlord.plans.emptyHint')}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map((plan) => (
                        <Card key={plan.id}>
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(plan.price_monthly, plan.currency)}
                                    <span className="text-sm font-normal text-muted-foreground"> / شهر</span>
                                </p>
                                <p className="text-sm text-muted-foreground">Slug: {plan.slug}</p>
                                <p className="text-sm">
                                    {t('landlord.plans.branches')}: {plan.max_branches ?? t('landlord.plans.unlimited')}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
