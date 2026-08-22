<?php

namespace App\Modules\Support\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Support\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Get all FAQs
     */
    public function index(Request $request)
    {
        try {
            $query = Faq::active()->ordered();

            // Filter by category
            if ($request->has('category') && $request->category) {
                $query->byCategory($request->category);
            }

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $locale = app()->getLocale();
                $questionField = $locale === 'ar' ? 'question_ar' : 'question_en';
                $answerField = $locale === 'ar' ? 'answer_ar' : 'answer_en';

                $query->where(function ($q) use ($search, $questionField, $answerField) {
                    $q->where($questionField, 'like', "%{$search}%")
                      ->orWhere($answerField, 'like', "%{$search}%");
                });
            }

            $faqs = $query->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $faqs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching FAQs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get FAQ by category
     */
    public function byCategory($category)
    {
        try {
            $faqs = Faq::active()
                ->byCategory($category)
                ->ordered()
                ->get();

            return response()->json([
                'success' => true,
                'category' => $category,
                'data' => $faqs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching FAQs',
            ], 500);
        }
    }

    /**
     * Get single FAQ
     */
    public function show(Faq $faq)
    {
        try {
            // Increment views
            $faq->incrementViews();

            return response()->json([
                'success' => true,
                'data' => $faq,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching FAQ',
            ], 500);
        }
    }

    /**
     * Mark as helpful
     */
    public function markHelpful(Faq $faq)
    {
        try {
            $faq->markHelpful();

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your feedback!',
                'data' => [
                    'helpful_count' => $faq->helpful_count,
                    'not_helpful_count' => $faq->not_helpful_count,
                    'helpful_percentage' => $faq->helpful_percentage,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error recording feedback',
            ], 500);
        }
    }

    /**
     * Mark as not helpful
     */
    public function markNotHelpful(Faq $faq)
    {
        try {
            $faq->markNotHelpful();

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your feedback. We\'ll improve this.',
                'data' => [
                    'helpful_count' => $faq->helpful_count,
                    'not_helpful_count' => $faq->not_helpful_count,
                    'helpful_percentage' => $faq->helpful_percentage,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error recording feedback',
            ], 500);
        }
    }

    /**
     * Get categories
     */
    public function categories()
    {
        return response()->json([
            'success' => true,
            'data' => Faq::CATEGORIES,
        ]);
    }

    /**
     * Get popular FAQs
     */
    public function popular($limit = 10)
    {
        try {
            $faqs = Faq::active()
                ->orderBy('views', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $faqs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching popular FAQs',
            ], 500);
        }
    }

    /**
     * Get most helpful FAQs
     */
    public function mostHelpful($limit = 10)
    {
        try {
            $faqs = Faq::active()
                ->where('helpful_count', '>', 0)
                ->orderBy('helpful_count', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $faqs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching FAQs',
            ], 500);
        }
    }

    /**
     * Statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_faqs' => Faq::active()->count(),
                'total_views' => Faq::active()->sum('views'),
                'total_helpful' => Faq::active()->sum('helpful_count'),
                'total_not_helpful' => Faq::active()->sum('not_helpful_count'),
                'by_category' => Faq::active()
                    ->groupBy('category')
                    ->selectRaw('category, count(*) as count')
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
