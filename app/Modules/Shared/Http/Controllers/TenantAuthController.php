<?php

namespace App\Modules\Shared\Http\Controllers;

use App\Modules\Shared\Http\Resources\TenantUserResource;
use App\Services\Landlord\TenantPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\TenantUser;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TenantAuthController extends ApiController
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = TenantUser::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->getAuthPassword())) {
            throw ValidationException::withMessages([
                'email' => ['بيانات الدخول غير صحيحة.'],
            ]);
        }

        Auth::guard('tenant')->login($user, $request->boolean('remember'));

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return $this->success([
            'user' => $this->userPayload(Auth::guard('tenant')->user()),
        ], 'تم تسجيل الدخول بنجاح.');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('tenant')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->success(null, 'تم تسجيل الخروج.');
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user('tenant');

        if (! $user) {
            return $this->error('غير مصرح.', 401, 'unauthenticated');
        }

        return $this->success($this->userPayload($user));
    }

    /**
     * @return array<string, mixed>
     */
    protected function userPayload(mixed $user): array
    {
        $planService = app(TenantPlanService::class);

        return [
            ...TenantUserResource::make($user)->resolve(),
            'features' => $planService->enabledFeatures(),
            'plan' => $planService->getPlanMeta(),
        ];
    }
}
