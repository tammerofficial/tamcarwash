<?php

namespace App\Modules\Booking\Http\Controllers;

use App\Modules\Booking\Http\Requests\GenerateTimeSlotsRequest;
use App\Modules\Booking\Http\Resources\TimeSlotResource;
use App\Modules\Booking\Services\TimeSlotService;
use App\Modules\Shared\Http\Controllers\ApiController;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeSlotController extends ApiController
{
    public function __construct(
        protected TimeSlotService $timeSlotService,
    ) {}

    public function available(Request $request): JsonResponse
    {
        $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'date' => ['required', 'date'],
        ], [
            'branch_id.required' => 'الفرع مطلوب.',
            'date.required' => 'التاريخ مطلوب.',
        ]);

        $slots = $this->timeSlotService->getAvailableSlots(
            $request->integer('branch_id'),
            Carbon::parse($request->string('date'))
        );

        return $this->success(TimeSlotResource::collection($slots));
    }

    public function generate(GenerateTimeSlotsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $count = $this->timeSlotService->generateSlots(
            (int) $data['branch_id'],
            Carbon::parse($data['date']),
            $data['slots']
        );

        return $this->success(['created' => $count], "تم إنشاء {$count} موعد.");
    }
}
