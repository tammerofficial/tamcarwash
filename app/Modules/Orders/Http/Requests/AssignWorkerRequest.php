<?php

namespace App\Modules\Orders\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignWorkerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');

        return $this->user()?->can('assignWorker', $order) ?? true;
    }

    public function rules(): array
    {
        return [
            'worker_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'worker_id.required' => 'العامل مطلوب.',
        ];
    }
}
