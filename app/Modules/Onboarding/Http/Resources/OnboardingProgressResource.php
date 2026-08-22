<?php

namespace App\Modules\Onboarding\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OnboardingProgressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'current_step' => $this->current_step,
            'total_steps' => $this->total_steps,
            'status' => $this->status,
            'completed_steps' => $this->completed_steps ?? [],
            'progress' => $this->getProgress(),
            'progress_percentage' => $this->getProgressPercentage(),
            'step_data' => $this->step_data ?? [],
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
