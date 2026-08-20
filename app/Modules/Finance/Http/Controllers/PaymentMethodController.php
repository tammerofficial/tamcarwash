<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Models\Payment;
use App\Modules\Finance\Models\PaymentMethod;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;

class PaymentMethodController extends ApiController
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $methods = PaymentMethod::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'code', 'name_ar', 'name_en', 'requires_reference', 'sort_order']);

        return $this->success($methods);
    }
}
