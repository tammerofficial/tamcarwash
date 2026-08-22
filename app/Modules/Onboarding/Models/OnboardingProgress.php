<?php

namespace App\Modules\Onboarding\Models;

use App\Models\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class OnboardingProgress extends TenantModel
{
    protected $fillable = [
        'user_id',
        'current_step',
        'total_steps',
        'status',
        'completed_steps',
        'step_data',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_steps' => 'array',
            'step_data' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isStepCompleted(int $stepNumber): bool
    {
        return in_array($stepNumber, $this->completed_steps ?? []);
    }

    public function markStepCompleted(int $stepNumber, array $data = []): void
    {
        $completedSteps = $this->completed_steps ?? [];
        if (!in_array($stepNumber, $completedSteps)) {
            $completedSteps[] = $stepNumber;
        }

        $stepData = $this->step_data ?? [];
        $stepData[$stepNumber] = $data;

        $this->update([
            'completed_steps' => $completedSteps,
            'step_data' => $stepData,
            'current_step' => $stepNumber + 1,
        ]);
    }

    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'current_step' => $this->total_steps,
        ]);
    }

    public function getProgress(): int
    {
        return count($this->completed_steps ?? []);
    }

    public function getProgressPercentage(): float
    {
        return round((count($this->completed_steps ?? []) / $this->total_steps) * 100, 2);
    }
}
