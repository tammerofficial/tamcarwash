<?php

namespace App\Modules\Support\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Support\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Get all active announcements
     */
    public function index(Request $request)
    {
        try {
            $query = Announcement::active();

            // Filter by type
            if ($request->has('type') && $request->type) {
                $query->byType($request->type);
            }

            // Filter by role
            if ($request->has('role') && $request->role) {
                $query->byRole($request->role);
            }

            $announcements = $query->ordered()
                ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $announcements,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching announcements',
            ], 500);
        }
    }

    /**
     * Get latest announcements
     */
    public function latest($limit = 5)
    {
        try {
            $announcements = Announcement::active()
                ->ordered()
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $announcements,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching announcements',
            ], 500);
        }
    }

    /**
     * Get announcements by role
     */
    public function byRole($role, Request $request)
    {
        try {
            $announcements = Announcement::active()
                ->byRole($role)
                ->ordered()
                ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $announcements,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching announcements',
            ], 500);
        }
    }

    /**
     * Get announcements by type
     */
    public function byType($type, Request $request)
    {
        try {
            $announcements = Announcement::active()
                ->byType($type)
                ->ordered()
                ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $announcements,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching announcements',
            ], 500);
        }
    }

    /**
     * Get single announcement
     */
    public function show(Announcement $announcement)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $announcement,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching announcement',
            ], 500);
        }
    }

    /**
     * Get types
     */
    public function types()
    {
        return response()->json([
            'success' => true,
            'data' => Announcement::TYPES,
        ]);
    }

    /**
     * Get priorities
     */
    public function priorities()
    {
        return response()->json([
            'success' => true,
            'data' => Announcement::PRIORITIES,
        ]);
    }

    /**
     * Get roles
     */
    public function roles()
    {
        return response()->json([
            'success' => true,
            'data' => Announcement::TARGET_ROLES,
        ]);
    }

    /**
     * Statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_announcements' => Announcement::active()->count(),
                'by_type' => Announcement::active()
                    ->groupBy('type')
                    ->selectRaw('type, count(*) as count')
                    ->get(),
                'by_priority' => Announcement::active()
                    ->groupBy('priority')
                    ->selectRaw('priority, count(*) as count')
                    ->get(),
                'by_role' => Announcement::active()
                    ->groupBy('target_role')
                    ->selectRaw('target_role, count(*) as count')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics',
            ], 500);
        }
    }
}
