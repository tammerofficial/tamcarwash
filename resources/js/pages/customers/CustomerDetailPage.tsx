import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { api, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { t } from '@/lib/i18n';
import type { ApiResponse, Customer } from '@/types/api';

const statusLabels: Record<Customer['status'], string> = {
    active: t('common.active'),
    inactive: t('common.inactive'),
    blacklisted: t('customers.blacklisted'),
};

export function CustomerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: customer, isLoading } = useAuthenticatedQuery({
        queryKey: ['customers', id],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Customer>>(`${endpoints.customers}/${id}`);
            return response.data;
        },
        enabled: Boolean(id),
        retry: false,
    });

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!customer) return <p className="text-muted-foreground">{t('common.noData')}</p>;

    return (
        <FormPage
            title={customer.name}
            backTo="/customers"
            actions={
                <Button onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                    <Pencil className="h-4 w-4" />
                    {t('common.edit')}
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <p><span className="text-muted-foreground">{t('customers.phone')}:</span> {customer.phone}</p>
                    <p><span className="text-muted-foreground">{t('customers.email')}:</span> {customer.email ?? '—'}</p>
                    <p><span className="text-muted-foreground">{t('customers.loyaltyPoints')}:</span> {customer.loyalty_points_balance ?? 0}</p>
                    <p>
                        <Badge variant={customer.status === 'active' ? 'success' : customer.status === 'blacklisted' ? 'destructive' : 'secondary'}>
                            {statusLabels[customer.status]}
                        </Badge>
                    </p>
                </div>
                <div className="space-y-2">
                    <h2 className="font-bold">{t('customers.notes')}</h2>
                    {(customer.notes ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('customers.noNotes')}</p>
                    ) : (
                        (customer.notes ?? []).map((note) => (
                            <div key={note.id} className="rounded-md border p-3 text-sm">{note.note}</div>
                        ))
                    )}
                </div>
            </div>
        </FormPage>
    );
}
