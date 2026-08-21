import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { LandlordPlan, LandlordSubscriptionRow } from '@/types/landlord';
import { SubscriptionFormDialog, subscriptionStatusLabel } from '@/pages/landlord/LandlordSubscriptionsPage';

export function LandlordSubscriptionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formOpen, setFormOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-subscription', id],
        queryFn: () => api.get<ApiResponse<LandlordSubscriptionRow>>(endpoints.landlord.subscription(id!)),
        enabled: Boolean(id),
    });

    const { data: plansData } = useQuery({
        queryKey: ['landlord-plans'],
        queryFn: () => api.get<ApiResponse<LandlordPlan[]>>(endpoints.landlord.plans),
    });

    const subscription = data?.data;

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!subscription) return <p className="text-muted-foreground">الاشتراك غير موجود</p>;

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader
                title={`${subscription.tenant?.name ?? '—'} — ${subscription.plan?.name ?? '—'}`}
                description={t('landlord.subscriptions.details')}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/landlord/subscriptions')}>رجوع</Button>
                        <Button onClick={() => setFormOpen(true)}><Pencil className="me-2 h-4 w-4" />{t('common.edit')}</Button>
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>{t('landlord.subscriptions.details')}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">{t('landlord.subscriptions.status')}:</span> <Badge>{subscriptionStatusLabel(subscription.status)}</Badge></p>
                        <p><span className="text-muted-foreground">{t('landlord.subscriptions.amount')}:</span> {formatCurrency(subscription.amount, subscription.currency)}</p>
                        <p><span className="text-muted-foreground">{t('landlord.subscriptions.billingCycle')}:</span> {t(`landlord.subscriptions.cycles.${subscription.billing_cycle as 'monthly' | 'yearly'}`)}</p>
                        <p><span className="text-muted-foreground">{t('landlord.subscriptions.startsAt')}:</span> {subscription.starts_at ? new Date(subscription.starts_at).toLocaleDateString('ar-OM') : '—'}</p>
                        <p><span className="text-muted-foreground">{t('landlord.subscriptions.endsAt')}:</span> {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString('ar-OM') : '—'}</p>
                        {subscription.cancelled_at && (
                            <p><span className="text-muted-foreground">{t('landlord.subscriptions.cancelledAt')}:</span> {new Date(subscription.cancelled_at).toLocaleDateString('ar-OM')}</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>{t('landlord.subscriptions.tenant')}</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p className="font-bold">{subscription.tenant?.name ?? '—'}</p>
                        <p><span className="text-muted-foreground">Slug:</span> {subscription.tenant?.slug ?? '—'}</p>
                        {subscription.tenant?.email && <p><span className="text-muted-foreground">{t('landlord.tenants.email')}:</span> {subscription.tenant.email}</p>}
                        {subscription.tenant?.id && (
                            <Button variant="link" className="px-0" asChild>
                                <Link to={`/landlord/tenants/${subscription.tenant.id}`}>{t('landlord.tenants.view')}</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <SubscriptionFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                subscription={subscription}
                plans={plansData?.data ?? []}
            />
        </div>
    );
}
