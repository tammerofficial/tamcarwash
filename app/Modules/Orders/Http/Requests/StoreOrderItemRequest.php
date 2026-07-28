<?php

namespace App\Modules\Orders\Http\Requests;

use App\Modules\Orders\Enums\OrderItemType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');

        return $this->user()?->can('update', $order) ?? true;
    }

    public function rules(): array
    {
        return [
            'item_type' => ['required', Rule::enum(OrderItemType::class)],
            'name' => ['required', 'string', 'max:255'],
            'service_id' => ['nullable', 'integer'],
            'addon_id' => ['nullable', 'integer'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'worker_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
