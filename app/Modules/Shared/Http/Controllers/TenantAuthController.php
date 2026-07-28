<?php

namespace App\Modules\Shared\Http\Controllers;

use App\Modules\Shared\Http\Resources\TenantUserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class TenantAuthController extends ApiController
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        if (! Auth::guard('tenant')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            throw ValidationException::withMessages([
                'email' => ['بيانات الدخول غير صحيحة.'],
            ]);
        }

        $request->session()->regenerate();

        return $this->success([
            'user' => TenantUserResource::make(Auth::guard('tenant')->user()),
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

        return $this->success(TenantUserResource::make($user));
    }
}
