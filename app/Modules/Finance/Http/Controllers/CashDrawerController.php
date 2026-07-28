<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Models\CashDrawerSession;
use App\Modules\Finance\Services\CashDrawerService;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashDrawerController extends ApiController
{
    public function __construct(protected CashDrawerService $cashDrawerService) {}

    public function open(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
            'opening_balance' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $session = $this->cashDrawerService->open(
            $validated['branch_id'],
            $request->user()->id,
            (float) ($validated['opening_balance'] ?? 0),
            $validated['notes'] ?? null,
        );

        return $this->success($session, 'تم فتح الصندوق', 201);
    }

    public function close(Request $request, CashDrawerSession $session): JsonResponse
    {
        $validated = $request->validate([
            'closing_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $session = $this->cashDrawerService->close(
            $session,
            (float) $validated['closing_balance'],
            $validated['notes'] ?? null,
        );

        return $this->success($session, 'تم إغلاق الصندوق');
    }

    public function current(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
        ]);

        $session = CashDrawerSession::query()
            ->where('branch_id', $validated['branch_id'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        return $this->success($session);
    }
}
