<?php

namespace App\Modules\Finance\Services;

class VatCalculatorService
{
    public function calculateLine(
        float $unitPrice,
        float $quantity,
        float $discountAmount,
        float $vatRate,
        bool $taxInclusive,
        bool $vatEnabled,
        bool $isTaxExempt = false,
    ): array {
        $gross = round($unitPrice * $quantity, 3);
        $netBeforeDiscount = $gross;

        if ($taxInclusive && $vatEnabled && ! $isTaxExempt && $vatRate > 0) {
            $netBeforeDiscount = round($gross / (1 + ($vatRate / 100)), 3);
        }

        $subtotal = round(max(0, $netBeforeDiscount - $discountAmount), 3);
        $vatAmount = 0.0;

        if ($vatEnabled && ! $isTaxExempt && $vatRate > 0) {
            $vatAmount = $taxInclusive
                ? round($subtotal * ($vatRate / 100), 3)
                : round($subtotal * ($vatRate / 100), 3);
        }

        $total = $taxInclusive || ! $vatEnabled || $isTaxExempt
            ? round($subtotal + ($taxInclusive ? 0 : $vatAmount), 3)
            : round($subtotal + $vatAmount, 3);

        if ($taxInclusive && $vatEnabled && ! $isTaxExempt) {
            $total = round($subtotal + $vatAmount, 3);
        }

        return [
            'subtotal' => $subtotal,
            'vat_amount' => $vatAmount,
            'total' => $total,
        ];
    }

    public function calculateTotals(array $lines, bool $taxInclusive, bool $vatEnabled): array
    {
        $subtotal = round(array_sum(array_column($lines, 'subtotal')), 3);
        $vatAmount = round(array_sum(array_column($lines, 'vat_amount')), 3);
        $total = round(array_sum(array_column($lines, 'total')), 3);

        return compact('subtotal', 'vatAmount', 'total') + [
            'subtotal' => $subtotal,
            'vat_amount' => $vatAmount,
            'total' => $total,
        ];
    }

    public function extractVatFromInclusive(float $inclusiveAmount, float $vatRate): array
    {
        if ($vatRate <= 0) {
            return ['subtotal' => $inclusiveAmount, 'vat_amount' => 0.0];
        }

        $subtotal = round($inclusiveAmount / (1 + ($vatRate / 100)), 3);

        return [
            'subtotal' => $subtotal,
            'vat_amount' => round($inclusiveAmount - $subtotal, 3),
        ];
    }
}
