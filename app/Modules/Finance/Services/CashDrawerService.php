<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Enums\CashDrawerStatus;
use App\Modules\Finance\Models\CashDrawerSession;
use App\Modules\Finance\Models\Payment;
use Illuminate\Support\Facades\DB;

class CashDrawerService
{
    public function open(int $branchId, int $userId, float $openingBalance = 0, ?string $notes = null): CashDrawerSession
    {
        $existing = CashDrawerSession::query()
            ->where('branch_id', $branchId)
            ->where('user_id', $userId)
            ->where('status', CashDrawerStatus::Open->value)
            ->first();

        if ($existing) {
            return $existing;
        }

        return CashDrawerSession::query()->create([
            'branch_id' => $branchId,
            'user_id' => $userId,
            'opened_at' => now(),
            'opening_balance' => $openingBalance,
            'status' => CashDrawerStatus::Open,
            'notes' => $notes,
        ]);
    }

    public function close(CashDrawerSession $session, float $closingBalance, ?string $notes = null): CashDrawerSession
    {
        return DB::transaction(function () use ($session, $closingBalance, $notes) {
            $cashPayments = Payment::query()
                ->where('cash_drawer_session_id', $session->id)
                ->whereHas('paymentMethod', fn ($q) => $q->where('code', 'cash'))
                ->sum('amount');

            $expected = (float) $session->opening_balance + (float) $cashPayments;
            $difference = round($closingBalance - $expected, 3);

            $session->update([
                'closed_at' => now(),
                'closing_balance' => $closingBalance,
                'expected_balance' => $expected,
                'difference' => $difference,
                'status' => CashDrawerStatus::Closed,
                'notes' => $notes ?? $session->notes,
            ]);

            return $session->fresh();
        });
    }
}
