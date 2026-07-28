<?php

namespace App\Modules\Shared\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

abstract class ApiController extends Controller
{
    protected function success(mixed $data = null, string $message = '', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function error(string $message, int $status = 400, ?string $code = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'code' => $code,
        ], $status);
    }

    protected function paginatedList(LengthAwarePaginator $paginator, string $resourceClass): JsonResponse
    {
        /** @var class-string<JsonResource> $resourceClass */
        return response()->json([
            'data' => $resourceClass::collection($paginator->items())->resolve(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
