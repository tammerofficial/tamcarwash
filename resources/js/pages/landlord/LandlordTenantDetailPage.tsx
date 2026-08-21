import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Pencil } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse } from '@/types/api';
import type { LandlordTenantRow } from '@/types/landlord';
import { statusLabel } from '@/pages/landlord/LandlordTenantsPage';

export function LandlordTenantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['landlord-tenant', id],
        queryFn: () => api.get<ApiResponse<LandlordTenantRow>>(endpoints.landlord.tenant(id!)),
        enabled: Boolean(id),
    });

    const tenant = data?.data;

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!tenant) return <p className="text-muted-foreground">المستأجر غير موجود</p>;

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader
                title={tenant.name}
                description={t('landlord.tenants.details')}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate('/landlord/tenants')}>{t('common.back')}</Button>
                        <Button onClick={() => navigate(`/landlord/tenants/${tenant.id}/edit`)}><Pencil className="me-2 h-4 w-4" />{t('common.edit')}</Button>
                        {tenant.dashboard_url && tenant.status === 'active' && (
                            <Button asChild variant="secondary">
                                <a href={tenant.dashboard_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="me-2 h-4 w-4" />{t('landlord.tenants.openDashboard')}
                                </a>
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>البيانات الأساسية</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Slug:</span> {tenant.slug}</p>
                        <p><span className="text-muted-foreground">{t('landlord.tenants.email')}:</span> {tenant.email ?? '—'}</p>
                        <p><span className="text-muted-foreground">{t('landlord.tenants.phone')}:</span> {tenant.phone ?? '—'}</p>
                        <p><span className="text-muted-foreground">{t('landlord.tenants.status')}:</span> {statusLabel(tenant.status)}</p>
                        <p><span className="text-muted-foreground">{t('landlord.tenants.plan')}:</span> {tenant.plan?.name ?? '—'}</p>
                        <p><span className="text-muted-foreground">{t('landlord.tenants.databaseStatus')}:</span> {tenant.database_status ?? '—'}</p>
                    </CardContent>
                </Card>

                {tenant.domains && tenant.domains.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>{t('landlord.tenants.domains')}</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {tenant.domains.map((domain) => (
                                <div key={domain.domain} className="text-sm" dir="ltr">
                                    {domain.domain} {domain.is_primary && <Badge className="ms-2">Primary</Badge>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {tenant.subscriptions && tenant.subscriptions.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>{t('landlord.tenants.subscriptionHistory')}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {tenant.subscriptions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="font-bold">{sub.plan?.name ?? '—'}</p>
                                    <p className="text-sm text-muted-foreground">{sub.status} · {sub.amount} {sub.currency}</p>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to={`/landlord/subscriptions/${sub.id}`}>{t('common.view')}</Link>
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
