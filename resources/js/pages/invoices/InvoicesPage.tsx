import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Ban, Eye, FileText, Loader2 } from 'lucide-react';
import { api, buildApiUrl, endpoints } from '@/lib/api';
import { useBranchQueryParams } from '@/providers/BranchProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Invoice, InvoiceStatus, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

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
    const queryClient = useQueryClient();
    const branchParams = useBranchQueryParams();
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

    const { data, isLoading } = useQuery({
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

    const { data: selectedInvoice, isLoading: detailLoading } = useQuery({
        queryKey: ['invoices', selectedInvoiceId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Invoice>>(endpoints.invoice(selectedInvoiceId!));
            return response.data;
        },
        enabled: selectedInvoiceId !== null,
        retry: false,
    });

    const voidInvoice = useMutation({
        mutationFn: (invoiceId: number) => api.post<ApiResponse<Invoice>>(endpoints.invoiceVoid(invoiceId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast.success(t('invoices.voidSuccess'));
        },
        onError: () => toast.error(t('invoices.voidError')),
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
                <Badge variant={statusVariants[row.original.status]}>
                    {statusLabels[row.original.status]}
                </Badge>
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
                <Button variant="ghost" size="sm" onClick={() => setSelectedInvoiceId(row.original.id)}>
                    <Eye className="h-4 w-4" />
                    {t('common.view')}
                </Button>
            ),
        },
    ];

    const canVoid = selectedInvoice && selectedInvoice.status !== 'void';

    return (
        <div className="space-y-6">
            <PageHeader title={t('invoices.title')} description={t('invoices.subtitle')} />

            <DataTable columns={columns} data={data ?? []} searchKey="invoice_number" loading={isLoading} />

            <Sheet open={selectedInvoiceId !== null} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
                <SheetContent side="start" className="w-full overflow-y-auto sm:max-w-xl">
                    {detailLoading || !selectedInvoice ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">{selectedInvoice.invoice_number}</h2>
                                    <p className="text-sm text-muted-foreground">{selectedInvoice.customer_name}</p>
                                    {selectedInvoice.customer_phone && (
                                        <p className="text-sm text-muted-foreground" dir="ltr">
                                            {selectedInvoice.customer_phone}
                                        </p>
                                    )}
                                    <Badge className="mt-2" variant={statusVariants[selectedInvoice.status]}>
                                        {statusLabels[selectedInvoice.status]}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={buildApiUrl(endpoints.invoicePdf(selectedInvoice.id))}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <FileText className="h-4 w-4" />
                                            {t('invoices.downloadPdf')}
                                        </a>
                                    </Button>
                                    {canVoid && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={voidInvoice.isPending}
                                            onClick={() => voidInvoice.mutate(selectedInvoice.id)}
                                        >
                                            <Ban className="h-4 w-4" />
                                            {t('invoices.void')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">{t('invoices.subtotal')}</span>
                                    <p className="font-semibold">{formatCurrency(selectedInvoice.subtotal)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t('invoices.vatAmount')}</span>
                                    <p className="font-semibold">{formatCurrency(selectedInvoice.vat_amount)}</p>
                                </div>
                                <div className="col-span-2 border-t pt-3">
                                    <span className="text-muted-foreground">{t('common.total')}</span>
                                    <p className="text-lg font-bold text-primary">{formatCurrency(selectedInvoice.total)}</p>
                                </div>
                            </div>

                            {(selectedInvoice.vatin || selectedInvoice.cr_number) && (
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {selectedInvoice.vatin && (
                                        <div>
                                            <span className="text-muted-foreground">{t('settings.vatin')}</span>
                                            <p className="font-semibold" dir="ltr">
                                                {selectedInvoice.vatin}
                                            </p>
                                        </div>
                                    )}
                                    {selectedInvoice.cr_number && (
                                        <div>
                                            <span className="text-muted-foreground">{t('settings.crNumber')}</span>
                                            <p className="font-semibold" dir="ltr">
                                                {selectedInvoice.cr_number}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-3">
                                <h3 className="font-medium">{t('invoices.lineItems')}</h3>
                                {(selectedInvoice.items ?? []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(selectedInvoice.items ?? []).map((item) => (
                                            <div key={item.id} className="rounded-md border p-3 text-sm">
                                                <div className="flex justify-between">
                                                    <p className="font-medium">{item.description}</p>
                                                    <p className="font-semibold">{formatCurrency(item.total)}</p>
                                                </div>
                                                <div className="mt-1 flex justify-between text-muted-foreground">
                                                    <span>
                                                        {item.quantity} × {formatCurrency(item.unit_price)}
                                                    </span>
                                                    <span>
                                                        {t('invoices.vatAmount')}: {formatCurrency(item.vat_amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
