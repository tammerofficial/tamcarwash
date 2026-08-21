import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Invoice, InvoiceStatus, PaginatedResponse } from '@/types/api';

const statusLabels: Record<InvoiceStatus, string> = {
    draft: 'مسودة',
    issued: 'صادرة',
    paid: 'مدفوعة',
    void: 'ملغاة',
    refunded: 'مستردة',
};

const statusVariants: Record<InvoiceStatus, 'success' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'outline',
    issued: 'secondary',
    paid: 'success',
    void: 'destructive',
    refunded: 'secondary',
};

export function InvoicesPage() {
    const navigate = useNavigate();
    const branchParams = useBranchQueryParams();

    const { data, isLoading } = useAuthenticatedQuery({
        queryKey: ['invoices', branchParams],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Invoice>>(endpoints.invoices, {
                per_page: 50,
                ...branchParams,
            });
            return response.data;
        },
        retry: false,
    });

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
                <Badge variant={statusVariants[row.original.status]}>{statusLabels[row.original.status]}</Badge>
            ),
        },
        {
            accessorKey: 'issue_date',
            header: t('invoices.issuedAt'),
            cell: ({ row }) =>
                row.original.issue_date
                    ? format(new Date(row.original.issue_date), 'dd MMM yyyy', { locale: ar })
                    : '—',
        },
        {
            id: 'actions',
            header: t('common.actions'),
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${row.original.id}`)}>
                    <Eye className="h-4 w-4" />
                    {t('common.view')}
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title={t('invoices.title')} description={t('invoices.subtitle')} />
            <DataTable columns={columns} data={data ?? []} searchKey="invoice_number" loading={isLoading} />
        </div>
    );
}
