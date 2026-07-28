<?php

namespace App\Http\Controllers\Landlord;

use App\Models\Landlord\PlatformUser;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PlatformAuthController extends ApiController
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $user = PlatformUser::query()
            ->where('email', $credentials['email'])
            ->where('is_active', true)
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['بيانات الدخول غير صحيحة.'],
            ]);
        }

        Auth::guard('platform')->login($user, $request->boolean('remember'));
        $user->update(['last_login_at' => now()]);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return $this->success([
            'user' => $this->transformUser($user),
        ], 'تم تسجيل الدخول بنجاح.');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('platform')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return $this->success(null, 'تم تسجيل الخروج.');
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user('platform');

        if (! $user) {
            return $this->error('غير مصرح.', 401, 'unauthenticated');
        }

        return $this->success($this->transformUser($user));
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformUser(PlatformUser $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }
}
