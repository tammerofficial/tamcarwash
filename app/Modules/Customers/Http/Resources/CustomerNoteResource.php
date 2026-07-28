<?php

namespace App\Modules\Customers\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Customers\Models\CustomerNote */
class CustomerNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'note' => $this->note,
            'is_pinned' => $this->is_pinned,
            'user_id' => $this->user_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
