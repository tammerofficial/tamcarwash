<?php

namespace App\Modules\Branches\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Branches\Models\BranchHoliday */
class BranchHolidayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date?->toDateString(),
            'name' => $this->name,
            'is_closed' => $this->is_closed,
        ];
    }
}
