import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, PaginatedResponse, Service, ServiceCategory } from '@/types/api';

export function ServicesPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('services');
    const [deletingService, setDeletingService] = useState<Service | null>(null);

    const { data: categories, isLoading: categoriesLoading } = useAuthenticatedQuery({
        queryKey: ['service-categories'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<ServiceCategory>>(endpoints.serviceCategories, {
                per_page: 50,
            });
            return response.data;
        },
        retry: false,
    });

    const { data: services, isLoading: servicesLoading } = useAuthenticatedQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Service>>(endpoints.services, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    const deleteServiceMutation = useMutation({
        mutationFn: (id: number) => api.delete<ApiResponse<null>>(endpoints.service(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            toast.success(t('services.deleted'));
            setDeletingService(null);
        },
        onError: () => toast.error('تعذّر حذف الخدمة'),
    });

    const categoryColumns: ColumnDef<ServiceCategory>[] = useMemo(
        () => [
            { accessorKey: 'name', header: t('services.categoryName') },
            {
                accessorKey: 'is_active',
                header: t('common.status'),
                cell: ({ row }) => (
                    <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
                        {row.original.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                ),
            },
        ],
        [],
    );

    const serviceColumns: ColumnDef<Service>[] = useMemo(
        () => [
            { accessorKey: 'name', header: t('services.name') },
            {
                accessorKey: 'category',
                header: t('services.category'),
                cell: ({ row }) => row.original.category?.name ?? '—',
            },
            { accessorKey: 'duration_minutes', header: t('services.duration') },
            {
                accessorKey: 'base_price',
                header: t('services.price'),
                cell: ({ row }) => formatCurrency(row.original.base_price),
            },
            {
                accessorKey: 'vat_included',
                header: t('services.vat'),
                cell: ({ row }) =>
                    row.original.vat_included ? t('services.vatIncludedLabel') : t('services.vatExcluded'),
            },
            {
                accessorKey: 'is_active',
                header: t('common.status'),
                cell: ({ row }) => (
                    <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
                        {row.original.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                ),
            },
            {
                id: 'actions',
                header: t('common.actions'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/services/${row.original.id}`)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/services/${row.original.id}/edit`)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeletingService(row.original)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ),
            },
        ],
        [navigate],
    );

    return (
        <div className="space-y-6">
            <PageHeader title={t('services.title')} description={t('services.subtitle')} />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="services">{t('services.tabServices')}</TabsTrigger>
                        <TabsTrigger value="categories">{t('services.tabCategories')}</TabsTrigger>
                    </TabsList>
                    <Button
                        onClick={() =>
                            navigate(activeTab === 'categories' ? '/services/categories/create' : '/services/create')
                        }
                    >
                        <Plus className="h-4 w-4" />
                        {activeTab === 'categories' ? t('services.addCategory') : t('services.addService')}
                    </Button>
                </div>

                <TabsContent value="services" className="mt-4">
                    <DataTable columns={serviceColumns} data={services ?? []} searchKey="name" loading={servicesLoading} />
                </TabsContent>

                <TabsContent value="categories" className="mt-4">
                    <DataTable
                        columns={categoryColumns}
                        data={categories ?? []}
                        searchKey="name"
                        loading={categoriesLoading}
                    />
                </TabsContent>
            </Tabs>

            <ConfirmDialog
                open={Boolean(deletingService)}
                onOpenChange={(open) => !open && setDeletingService(null)}
                title={t('common.delete')}
                description={t('services.deleteConfirm')}
                confirmLabel={t('common.delete')}
                loading={deleteServiceMutation.isPending}
                onConfirm={() => deletingService && deleteServiceMutation.mutate(deletingService.id)}
            />
        </div>
    );
}
