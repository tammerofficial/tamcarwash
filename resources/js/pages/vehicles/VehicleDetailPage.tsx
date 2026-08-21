import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { api, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, Vehicle } from '@/types/api';

export function VehicleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: vehicle, isLoading } = useAuthenticatedQuery({
        queryKey: ['vehicles', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Vehicle>>(`${endpoints.vehicles}/${id}`);
            return response.data;
        },
        enabled: Boolean(id),
        retry: false,
    });

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!vehicle) return <p className="text-muted-foreground">{t('common.noData')}</p>;

    return (
        <FormPage
            title={vehicle.plate_number}
            backTo="/vehicles"
            actions={
                <Button onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}>
                    <Pencil className="h-4 w-4" />
                    {t('common.edit')}
                </Button>
            }
        >
            <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">{t('vehicles.brand')}:</span> {vehicle.brand ?? '—'}</p>
                <p><span className="text-muted-foreground">{t('vehicles.model')}:</span> {vehicle.model ?? '—'}</p>
                <p><span className="text-muted-foreground">{t('vehicles.color')}:</span> {vehicle.color ?? '—'}</p>
                <p><span className="text-muted-foreground">{t('vehicles.type')}:</span> {vehicle.vehicle_type_label ?? vehicle.vehicle_type ?? '—'}</p>
                <p><span className="text-muted-foreground">{t('vehicles.owner')}:</span> {vehicle.customer?.name ?? '—'}</p>
            </div>
        </FormPage>
    );
}
