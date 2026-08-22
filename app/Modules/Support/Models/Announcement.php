<?php

namespace App\Modules\Support\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    use SoftDeletes;

    protected $table = 'announcements';

    protected $fillable = [
        'title_ar',
        'title_en',
        'content_ar',
        'content_en',
        'type',
        'priority',
        'published_at',
        'expires_at',
        'target_role',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Types
     */
    const TYPES = [
        'update' => 'تحديث | Update',
        'maintenance' => 'صيانة | Maintenance',
        'feature' => 'ميزة جديدة | New Feature',
        'important' => 'مهم | Important',
        'warning' => 'تحذير | Warning',
    ];

    /**
     * Priorities
     */
    const PRIORITIES = [
        'low' => 'منخفضة | Low',
        'medium' => 'متوسطة | Medium',
        'high' => 'عالية | High',
    ];

    /**
     * Target roles
     */
    const TARGET_ROLES = [
        'all' => 'الجميع | Everyone',
        'manager' => 'المديرين | Managers',
        'staff' => 'الموظفين | Staff',
        'customer' => 'العملاء | Customers',
    ];

    /**
     * Get title
     */
    public function getTitleAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->title_ar : $this->title_en;
    }

    /**
     * Get content
     */
    public function getContentAttribute()
    {
        return app()->getLocale() === 'ar' ? $this->content_ar : $this->content_en;
    }

    /**
     * Get type label
     */
    public function getTypeLabelAttribute()
    {
        return self::TYPES[$this->type] ?? 'Unknown';
    }

    /**
     * Get priority label
     */
    public function getPriorityLabelAttribute()
    {
        return self::PRIORITIES[$this->priority] ?? 'Unknown';
    }

    /**
     * Is active and not expired
     */
    public function isVisible()
    {
        return $this->is_active 
            && ($this->published_at === null || $this->published_at <= now())
            && ($this->expires_at === null || $this->expires_at >= now());
    }

    /**
     * Scope: active
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('published_at')
                  ->orWhere('published_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>=', now());
            });
    }

    /**
     * Scope: by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where(function ($q) use ($role) {
            $q->where('target_role', 'all')
              ->orWhere('target_role', $role);
        });
    }

    /**
     * Scope: ordered
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('published_at', 'desc');
    }
}
