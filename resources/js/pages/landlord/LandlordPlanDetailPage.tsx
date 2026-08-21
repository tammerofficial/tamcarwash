import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { LandlordPlan } from '@/types/landlord';
import { PlanFormDialog } from '@/pages/landlord/LandlordPlansPage';

export function LandlordPlanDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formOpen, setFormOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-plan', id],
        queryFn: () => api.get<ApiResponse<LandlordPlan>>(endpoints.landlord.plan(id!)),
        enabled: Boolean(id),
    });

    const plan = data?.data;

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!plan) return <p className="text-muted-foreground">الباقة غير موجودة</p>;

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader
                title={plan.name}
                description={t('landlord.plans.details')}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/landlord/plans')}>رجوع</Button>
                        <Button onClick={() => setFormOpen(true)}><Pencil className="me-2 h-4 w-4" />{t('common.edit')}</Button>
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>{t('landlord.plans.details')}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">{t('landlord.plans.slug')}:</span> {plan.slug}</p>
                        <p><span className="text-muted-foreground">{t('common.status')}:</span>{' '}
                            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                                {plan.is_active ? t('common.active') : t('common.inactive')}
                            </Badge>
                        </p>
                        <p><span className="text-muted-foreground">{t('landlord.plans.priceMonthly')}:</span> {formatCurrency(plan.price_monthly, plan.currency)}</p>
                        <p><span className="text-muted-foreground">{t('landlord.plans.priceYearly')}:</span> {formatCurrency(plan.price_yearly, plan.currency)}</p>
                        <p><span className="text-muted-foreground">{t('landlord.plans.tenantsCount')}:</span> {plan.tenants_count ?? '—'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>الحدود</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">{t('landlord.plans.branches')}:</span> {plan.max_branches ?? t('landlord.plans.unlimited')}</p>
                        <p><span className="text-muted-foreground">{t('landlord.plans.users')}:</span> {plan.max_users ?? t('landlord.plans.unlimited')}</p>
                        <p><span className="text-muted-foreground">{t('landlord.plans.vehiclesPerDay')}:</span> {plan.max_vehicles_per_day ?? t('landlord.plans.unlimited')}</p>
                    </CardContent>
                </Card>
            </div>

            {plan.description && (
                <Card>
                    <CardHeader><CardTitle>{t('landlord.plans.description')}</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{plan.description}</p></CardContent>
                </Card>
            )}

            {(plan.features ?? []).length > 0 && (
                <Card>
                    <CardHeader><CardTitle>{t('landlord.plans.features')}</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="list-disc space-y-1 pe-4 text-sm">
                            {plan.features!.map((feature) => (
                                <li key={feature}>{feature}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <PlanFormDialog open={formOpen} onOpenChange={setFormOpen} plan={plan} />
        </div>
    );
}
