import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { api, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Service } from '@/types/api';

export function ServiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: service, isLoading } = useAuthenticatedQuery({
        queryKey: ['services', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Service>>(endpoints.service(Number(id)));
            return response.data;
        },
        enabled: Boolean(id),
        retry: false,
    });

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!service) return <p className="text-muted-foreground">{t('common.noData')}</p>;

    return (
        <FormPage
            title={service.name}
            backTo="/services"
            actions={
                <Button onClick={() => navigate(`/services/${service.id}/edit`)}>
                    <Pencil className="h-4 w-4" />
                    {t('common.edit')}
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <p><span className="text-muted-foreground">{t('services.category')}:</span> {service.category?.name ?? '—'}</p>
                    <p><span className="text-muted-foreground">{t('services.duration')}:</span> {service.duration_minutes}</p>
                    <p><span className="text-muted-foreground">{t('services.price')}:</span> {formatCurrency(service.base_price)}</p>
                    <p><span className="text-muted-foreground">{t('services.vat')}:</span> {service.vat_included ? t('services.vatIncludedLabel') : t('services.vatExcluded')}</p>
                    <p>
                        <Badge variant={service.is_active ? 'success' : 'secondary'}>
                            {service.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                    </p>
                </div>
                <div>
                    <h2 className="mb-2 font-bold">{t('services.addons')}</h2>
                    {service.addons?.length ? (
                        <ul className="space-y-2 text-sm">
                            {service.addons.map((addon) => (
                                <li key={addon.id} className="flex justify-between rounded-md border px-3 py-2">
                                    <span>{addon.name}</span>
                                    <span>{formatCurrency(addon.price)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('services.addonsEmpty')}</p>
                    )}
                </div>
            </div>
        </FormPage>
    );
}
