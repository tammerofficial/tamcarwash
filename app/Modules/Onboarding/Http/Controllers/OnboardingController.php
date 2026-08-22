<?php

namespace App\Modules\Onboarding\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Onboarding\Http\Resources\OnboardingProgressResource;
use App\Modules\Onboarding\Models\OnboardingProgress;
use App\Modules\Onboarding\Services\OnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    /**
     * Initialize onboarding for current user
     */
    public function initialize(): JsonResponse
    {
        $service = new OnboardingService(auth('tenant')->user());
        $progress = $service->initialize();

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Onboarding initialized successfully',
        ]);
    }

    /**
     * Get current onboarding progress
     */
    public function getProgress(): JsonResponse
    {
        $user = auth('tenant')->user();
        $progress = OnboardingProgress::where('user_id', $user->id)->first();

        if (!$progress) {
            $service = new OnboardingService($user);
            $progress = $service->initialize();
        }

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
        ]);
    }

    /**
     * Save Step 1: Business Info
     */
    public function saveBusinessInfo(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
        ]);

        $service = new OnboardingService(auth('tenant')->user());
        $progress = $service->saveBusinessInfo($validated);

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Business information saved successfully',
        ]);
    }

    /**
     * Save Step 2: First Branch
     */
    public function saveFirstBranch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'working_hours' => 'required|array',
            'working_hours.*.day' => 'sometimes|in:saturday,sunday,monday,tuesday,wednesday,thursday,friday',
            'working_hours.*.start_time' => 'sometimes|date_format:H:i',
            'working_hours.*.end_time' => 'sometimes|date_format:H:i',
            'working_hours.*.is_open' => 'sometimes|boolean',
        ]);

        $service = new OnboardingService(auth('tenant')->user());
        $progress = $service->saveFirstBranch($validated);

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Branch information saved successfully',
        ]);
    }

    /**
     * Save Step 3: Services Setup
     */
    public function saveServices(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'services' => 'required|array|min:1',
            'services.*.name' => 'required|string|max:255',
            'services.*.name_ar' => 'nullable|string|max:255',
            'services.*.description' => 'nullable|string|max:500',
            'services.*.duration_minutes' => 'required|integer|min:5|max:480',
            'services.*.base_price' => 'required|numeric|min:0.01',
            'services.*.vat_included' => 'sometimes|boolean',
        ]);

        $service = new OnboardingService(auth('tenant')->user());
        $progress = $service->saveServices($validated);

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Services saved successfully',
        ]);
    }

    /**
     * Save Step 4: Staff Setup
     */
    public function saveStaff(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'owner' => 'nullable|array',
            'owner.name' => 'nullable|string|max:255',
            'owner.email' => 'nullable|email|max:255',
            'staff_count' => 'nullable|integer|min:0',
            'staff_members' => 'nullable|array',
            'staff_members.*.name' => 'sometimes|string|max:255',
            'staff_members.*.role' => 'sometimes|in:cashier,worker,supervisor',
            'staff_members.*.email' => 'sometimes|email|max:255',
        ]);

        $service = new OnboardingService(auth('tenant')->user());
        $progress = $service->saveStaff($validated);

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Staff information saved successfully',
        ]);
    }

    /**
     * Save Step 5: Payment Methods
     */
    public function savePaymentMethods(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_methods' => 'required|array|min:1',
            'payment_methods.*.name' => 'required|string|max:255',
            'payment_methods.*.type' => 'required|in:cash,card,bank_transfer,mobile_wallet',
            'payment_methods.*.is_active' => 'sometimes|boolean',
        ]);

        $service = new OnboardingService(auth('tenant')->user());
        $progress = $service->savePaymentMethods($validated);

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Payment methods saved successfully',
        ]);
    }

    /**
     * Save Step 6: Tax Setup
     */
    public function saveTaxSetup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vat_enabled' => 'sometimes|boolean',
            'tax_id' => 'nullable|string|max:100',
        ]);

        $service = new OnboardingService(auth('tenant')->user());
        $progress = $service->saveTaxSetup($validated);

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Tax settings saved successfully',
        ]);
    }

    /**
     * Complete onboarding (Step 7 + activation)
     */
    public function complete(Request $request): JsonResponse
    {
        $service = new OnboardingService(auth('tenant')->user());
        $progress = $service->completeOnboarding($request->all());

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Onboarding completed successfully! Your business is now live.',
        ]);
    }

    /**
     * Get review data before completion
     */
    public function getReview(): JsonResponse
    {
        $service = new OnboardingService(auth('tenant')->user());
        $reviewData = $service->getReviewData();

        return response()->json([
            'success' => true,
            'data' => $reviewData,
        ]);
    }

    /**
     * Get suggested actions after onboarding
     */
    public function suggestedActions(): JsonResponse
    {
        $service = new OnboardingService(auth('tenant')->user());
        $suggestions = $service->getSuggestedActions();

        return response()->json([
            'success' => true,
            'data' => $suggestions,
        ]);
    }

    /**
     * Skip a step
     */
    public function skipStep(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'step' => 'required|integer|min:1|max:7',
        ]);

        $user = auth('tenant')->user();
        $progress = OnboardingProgress::where('user_id', $user->id)->firstOrFail();

        // Move to next step
        $nextStep = $validated['step'] + 1;
        if ($nextStep <= $progress->total_steps) {
            $progress->update(['current_step' => $nextStep]);
        }

        return response()->json([
            'success' => true,
            'data' => new OnboardingProgressResource($progress),
            'message' => 'Step skipped',
        ]);
    }
}
