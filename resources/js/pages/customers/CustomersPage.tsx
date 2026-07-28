import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { Customer, PaginatedResponse } from '@/types/api';

const statusLabels: Record<Customer['status'], string> = {
    active: t('common.active'),
    inactive: t('common.inactive'),
    blacklisted: 'محظور',
};

const columns: ColumnDef<Customer>[] = [
    { accessorKey: 'name', header: t('customers.name') },
    { accessorKey: 'phone', header: t('customers.phone') },
    { accessorKey: 'email', header: t('customers.email') },
    { accessorKey: 'loyalty_points', header: t('customers.loyaltyPoints') },
    { accessorKey: 'vehicles_count', header: t('customers.vehicles') },
    {
        accessorKey: 'status',
        header: t('common.status'),
        cell: ({ row }) => (
            <Badge variant={row.original.status === 'active' ? 'success' : row.original.status === 'blacklisted' ? 'destructive' : 'secondary'}>
                {statusLabels[row.original.status]}
            </Badge>
        ),
    },
];

export function CustomersPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(endpoints.customers, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('customers.title')}
                description={t('customers.subtitle')}
                actions={
                    <Button>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />
            <DataTable columns={columns} data={data ?? []} searchKey="name" loading={isLoading} />
        </div>
    );
}
