<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\TaxSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class InvoicePdfService
{
    public function generate(Invoice $invoice): Response
    {
        $invoice->loadMissing(['items', 'branch', 'payments.paymentMethod']);
        $taxSettings = TaxSetting::query()->first();
        $qrDataUri = $this->buildQrDataUri($invoice->qr_payload ?? $invoice->invoice_number);

        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice,
            'taxSettings' => $taxSettings,
            'qrDataUri' => $qrDataUri,
        ])->setPaper('a4');

        $filename = Str::slug($invoice->invoice_number).'.pdf';

        return $pdf->download($filename);
    }

    public function stream(Invoice $invoice): Response
    {
        $invoice->loadMissing(['items', 'branch', 'payments.paymentMethod']);
        $taxSettings = TaxSetting::query()->first();
        $qrDataUri = $this->buildQrDataUri($invoice->qr_payload ?? $invoice->invoice_number);

        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice,
            'taxSettings' => $taxSettings,
            'qrDataUri' => $qrDataUri,
        ])->setPaper('a4');

        return $pdf->stream($invoice->invoice_number.'.pdf');
    }

    protected function buildQrDataUri(string $payload): string
    {
        $result = Builder::create()
            ->writer(new PngWriter)
            ->data($payload)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::Medium)
            ->size(160)
            ->margin(8)
            ->build();

        return $result->getDataUri();
    }
}
