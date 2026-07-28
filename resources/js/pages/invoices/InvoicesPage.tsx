import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { api, endpoints } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Invoice, PaginatedResponse } from '@/types/api';

const statusLabels: Record<Invoice['status'], string> = {
    draft: 'مسودة',
    issued: 'صادرة',
    paid: 'مدفوعة',
    cancelled: 'ملغاة',
};

const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoice_number', header: t('invoices.invoiceNumber') },
    { accessorKey: 'customer_name', header: t('customers.name') },
    {
        accessorKey: 'subtotal',
        header: t('invoices.subtotal'),
        cell: ({ row }) => formatCurrency(row.original.subtotal),
    },
    {
        accessorKey: 'vat_amount',
        header: t('invoices.vatAmount'),
        cell: ({ row }) => formatCurrency(row.original.vat_amount),
    },
    {
        accessorKey: 'total',
        header: t('common.total'),
        cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
        accessorKey: 'status',
        header: t('common.status'),
        cell: ({ row }) => (
            <Badge variant={row.original.status === 'paid' ? 'success' : 'secondary'}>
                {statusLabels[row.original.status]}
            </Badge>
        ),
    },
    {
        accessorKey: 'issued_at',
        header: t('invoices.issuedAt'),
        cell: ({ row }) =>
            row.original.issued_at ? format(new Date(row.original.issued_at), 'dd MMM yyyy', { locale: ar }) : '—',
    },
];

export function InvoicesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Invoice>>(endpoints.invoices, { per_page: 50 });
            return response.data;
        },
        retry: false,
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('invoices.title')}
                description={t('invoices.subtitle')}
                actions={
                    <Button>
                        <Plus className="h-4 w-4" />
                        {t('common.add')}
                    </Button>
                }
            />
            <DataTable columns={columns} data={data ?? []} searchKey="invoice_number" loading={isLoading} />
        </div>
    );
}
