<?php

namespace App\Modules\Support\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\AsCollection;

class Faq extends Model
{
    use SoftDeletes;

    protected $table = 'faqs';

    protected $fillable = [
        'question_ar',
        'question_en',
        'answer_ar',
        'answer_en',
        'category',
        'order',
        'helpful_count',
        'not_helpful_count',
        'views',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'helpful_count' => 'integer',
        'not_helpful_count' => 'integer',
        'views' => 'integer',
    ];

    /**
     * Categories
     */
    const CATEGORIES = [
        'getting_started' => 'البدء السريع | Getting Started',
        'operations' => 'العمليات | Operations',
        'billing' => 'الفواتير والدفع | Billing & Payments',
        'troubleshooting' => 'حل المشاكل | Troubleshooting',
        'staff' => 'الموظفين | Staff Management',
        'reports' => 'التقارير | Reports',
        'branches' => 'الفروع | Branches',
        'account' => 'الحساب | Account',
        'security' => 'الأمان | Security',
        'other' => 'أخرى | Other',
    ];

    /**
     * Get localized question
     */
    public function getQuestionAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->question_ar : $this->question_en;
    }

    /**
     * Get localized answer
     */
    public function getAnswerAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->answer_ar : $this->answer_en;
    }

    /**
     * Mark as helpful
     */
    public function markHelpful()
    {
        $this->increment('helpful_count');
    }

    /**
     * Mark as not helpful
     */
    public function markNotHelpful()
    {
        $this->increment('not_helpful_count');
    }

    /**
     * Increment views
     */
    public function incrementViews()
    {
        $this->increment('views');
    }

    /**
     * Get helpful percentage
     */
    public function getHelpfulPercentageAttribute()
    {
        $total = $this->helpful_count + $this->not_helpful_count;
        
        if ($total === 0) {
            return 0;
        }

        return round(($this->helpful_count / $total) * 100);
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute()
    {
        return self::CATEGORIES[$this->category] ?? 'Other';
    }

    /**
     * Scope: active
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: ordered
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('created_at', 'desc');
    }
}
