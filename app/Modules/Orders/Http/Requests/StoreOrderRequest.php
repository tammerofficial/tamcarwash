<?php

namespace App\Modules\Orders\Http\Requests;

use App\Modules\Orders\Enums\OrderItemType;
use App\Modules\Orders\Enums\OrderSource;
use App\Modules\Orders\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Order::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'vehicle_id' => ['nullable', 'integer', 'exists:vehicles,id'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'queue_entry_id' => ['nullable', 'integer', 'exists:queue_entries,id'],
            'worker_id' => ['nullable', 'integer', 'exists:users,id'],
            'source' => ['nullable', Rule::enum(OrderSource::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['nullable', 'array'],
            'items.*.item_type' => ['required_with:items', Rule::enum(OrderItemType::class)],
            'items.*.name' => ['required_with:items', 'string', 'max:255'],
            'items.*.service_id' => ['nullable', 'integer'],
            'items.*.addon_id' => ['nullable', 'integer'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.worker_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'الفرع مطلوب.',
            'items.*.name.required_with' => 'اسم البند مطلوب.',
        ];
    }
}
