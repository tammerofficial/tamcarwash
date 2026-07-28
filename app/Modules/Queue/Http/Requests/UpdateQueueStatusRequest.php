<?php

namespace App\Modules\Queue\Http\Requests;

use App\Modules\Queue\Enums\QueueEntryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQueueStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $entry = $this->route('queueEntry');

        return $this->user()?->can('update', $entry) ?? true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(QueueEntryStatus::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'الحالة مطلوبة.',
        ];
    }
}
