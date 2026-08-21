import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { Ban, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api, buildApiUrl, endpoints } from '@/lib/api';
import { FormPage } from '@/components/common/FormPage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ApiResponse, Invoice, InvoiceStatus } from '@/types/api';

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

export function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const { data: invoice, isLoading } = useAuthenticatedQuery({
        queryKey: ['invoices', id],
        queryFn: async () => (await api.get<ApiResponse<Invoice>>(endpoints.invoice(Number(id)))).data,
        enabled: Boolean(id),
        retry: false,
    });

    const voidInvoice = useMutation({
        mutationFn: () => api.post<ApiResponse<Invoice>>(endpoints.invoiceVoid(Number(id))),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoices', id] });
            toast.success(t('invoices.voidSuccess'));
        },
        onError: () => toast.error(t('invoices.voidError')),
    });

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (!invoice) {
        return <p className="text-muted-foreground">{t('common.noData')}</p>;
    }

    const canVoid = invoice.status !== 'void';

    return (
        <FormPage title={invoice.invoice_number} description={invoice.customer_name} backTo="/invoices">
            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        {invoice.customer_phone && (
                            <p className="text-sm text-muted-foreground" dir="ltr">
                                {invoice.customer_phone}
                            </p>
                        )}
                        <Badge className="mt-2" variant={statusVariants[invoice.status]}>
                            {statusLabels[invoice.status]}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={buildApiUrl(endpoints.invoicePdf(invoice.id))} target="_blank" rel="noreferrer">
                                <FileText className="h-4 w-4" />
                                {t('invoices.downloadPdf')}
                            </a>
                        </Button>
                        {canVoid && (
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={voidInvoice.isPending}
                                onClick={() => voidInvoice.mutate()}
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
                        <p className="font-semibold">{formatCurrency(invoice.subtotal)}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">{t('invoices.vatAmount')}</span>
                        <p className="font-semibold">{formatCurrency(invoice.vat_amount)}</p>
                    </div>
                    <div className="col-span-2 border-t pt-3">
                        <span className="text-muted-foreground">{t('common.total')}</span>
                        <p className="text-lg font-bold text-primary">{formatCurrency(invoice.total)}</p>
                    </div>
                </div>

                {(invoice.vatin || invoice.cr_number) && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {invoice.vatin && (
                            <div>
                                <span className="text-muted-foreground">{t('settings.vatin')}</span>
                                <p className="font-semibold" dir="ltr">
                                    {invoice.vatin}
                                </p>
                            </div>
                        )}
                        {invoice.cr_number && (
                            <div>
                                <span className="text-muted-foreground">{t('settings.crNumber')}</span>
                                <p className="font-semibold" dir="ltr">
                                    {invoice.cr_number}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <Separator />

                <div className="space-y-3">
                    <h3 className="font-medium">{t('invoices.lineItems')}</h3>
                    {(invoice.items ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                    ) : (
                        <div className="space-y-2">
                            {(invoice.items ?? []).map((item) => (
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
        </FormPage>
    );
}
