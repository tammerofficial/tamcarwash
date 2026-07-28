<?php

namespace App\Modules\Shared\Http\Concerns;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

trait PaginatesApiResources
{
    protected function paginatedResourceResponse(
        LengthAwarePaginator $paginator,
        string $resourceClass,
    ): JsonResponse {
        /** @var class-string<JsonResource> $resourceClass */
        return $this->paginatedList($paginator, $resourceClass);
    }
}
