import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { Branch, PaginatedResponse } from '@/types/api';

const columns: ColumnDef<Branch>[] = [
    { accessorKey: 'name', header: t('branches.name') },
    { accessorKey: 'code', header: t('branches.code') },
    { accessorKey: 'city', header: t('branches.city') },
    { accessorKey: 'capacity', header: t('branches.capacity') },
    { accessorKey: 'wash_bays_count', header: t('branches.bays') },
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

export function BranchesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['branches'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Branch>>(endpoints.branches, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('branches.title')}
                description={t('branches.subtitle')}
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
