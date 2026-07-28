<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <title>فاتورة {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; }
        .header { width: 100%; margin-bottom: 24px; }
        .header td { vertical-align: top; }
        .company { font-size: 18px; font-weight: bold; }
        .meta { text-align: left; direction: ltr; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 16px; }
        table.items th, table.items td { border: 1px solid #ddd; padding: 8px; }
        table.items th { background: #f5f5f5; }
        .totals { width: 45%; margin-top: 16px; margin-right: 0; margin-left: auto; }
        .totals td { padding: 6px 8px; }
        .totals .label { text-align: right; }
        .totals .value { text-align: left; direction: ltr; font-weight: bold; }
        .footer { margin-top: 24px; font-size: 11px; color: #555; }
        .qr { text-align: center; margin-top: 16px; }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td>
                <div class="company">{{ $taxSettings?->legal_name_ar ?? config('app.name') }}</div>
                <div>{{ $taxSettings?->address }}</div>
                @if($invoice->cr_number)
                    <div>السجل التجاري: {{ $invoice->cr_number }}</div>
                @endif
                @if($invoice->vatin)
                    <div>الرقم الضريبي (VATIN): {{ $invoice->vatin }}</div>
                @endif
            </td>
            <td class="meta">
                <div><strong>Invoice:</strong> {{ $invoice->invoice_number }}</div>
                <div><strong>Date:</strong> {{ $invoice->issue_date?->format('Y-m-d') }}</div>
                <div><strong>Status:</strong> {{ $invoice->status->value }}</div>
            </td>
        </tr>
    </table>

    <div>
        <strong>العميل:</strong>
        {{ $invoice->customer_name ?? 'عميل نقدي' }}
        @if($invoice->customer_phone) — {{ $invoice->customer_phone }} @endif
    </div>

    <table class="items">
        <thead>
            <tr>
                <th>#</th>
                <th>الوصف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الخصم</th>
                <th>المجموع قبل الضريبة</th>
                <th>ض.ق.م {{ number_format((float) $invoice->vat_rate, 2) }}%</th>
                <th>الإجمالي</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item->description }}</td>
                    <td>{{ number_format((float) $item->quantity, 2) }}</td>
                    <td>{{ number_format((float) $item->unit_price, 3) }}</td>
                    <td>{{ number_format((float) $item->discount_amount, 3) }}</td>
                    <td>{{ number_format((float) $item->subtotal, 3) }}</td>
                    <td>{{ number_format((float) $item->vat_amount, 3) }}</td>
                    <td>{{ number_format((float) $item->total, 3) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="label">المجموع قبل الضريبة</td>
            <td class="value">{{ number_format((float) $invoice->subtotal, 3) }} {{ config('tammer.vat.currency') }}</td>
        </tr>
        <tr>
            <td class="label">ضريبة القيمة المضافة ({{ number_format((float) $invoice->vat_rate, 2) }}%)</td>
            <td class="value">{{ number_format((float) $invoice->vat_amount, 3) }} {{ config('tammer.vat.currency') }}</td>
        </tr>
        <tr>
            <td class="label">الإجمالي شامل الضريبة</td>
            <td class="value">{{ number_format((float) $invoice->total, 3) }} {{ config('tammer.vat.currency') }}</td>
        </tr>
    </table>

    @if(!empty($qrDataUri))
        <div class="qr">
            <img src="{{ $qrDataUri }}" alt="QR Code" width="120" height="120">
        </div>
    @endif

    <div class="footer">
        {{ $taxSettings?->footer_text_ar ?? 'شكراً لتعاملكم معنا' }}
    </div>
</body>
</html>
