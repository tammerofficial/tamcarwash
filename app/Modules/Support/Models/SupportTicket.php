<?php

namespace App\Modules\Support\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SupportTicket extends Model
{
    use SoftDeletes;

    protected $table = 'support_tickets';

    protected $fillable = [
        'ticket_number',
        'user_id',
        'user_name',
        'user_email',
        'user_phone',
        'subject',
        'description',
        'category',
        'priority',
        'status',
        'assigned_to',
        'resolution_notes',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Statuses
     */
    const STATUSES = [
        'open' => 'مفتوح | Open',
        'in_progress' => 'قيد المعالجة | In Progress',
        'waiting' => 'في انتظار العميل | Waiting Customer',
        'resolved' => 'محلول | Resolved',
        'closed' => 'مغلق | Closed',
    ];

    /**
     * Priorities
     */
    const PRIORITIES = [
        'low' => 'منخفضة | Low',
        'medium' => 'متوسطة | Medium',
        'high' => 'عالية | High',
        'urgent' => 'عاجلة | Urgent',
    ];

    /**
     * Categories
     */
    const CATEGORIES = [
        'bug' => 'خلل تقني | Bug',
        'feature' => 'طلب ميزة | Feature Request',
        'billing' => 'الفواتير | Billing',
        'account' => 'الحساب | Account',
        'performance' => 'الأداء | Performance',
        'other' => 'أخرى | Other',
    ];

    /**
     * Generate ticket number
     */
    public static function generateTicketNumber()
    {
        $lastTicket = self::latest('id')->first();
        $number = ($lastTicket ? intval(substr($lastTicket->ticket_number, 3)) + 1 : 1001);
        return 'TKT' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    /**
     * Get priority label
     */
    public function getPriorityLabelAttribute()
    {
        return self::PRIORITIES[$this->priority] ?? 'Unknown';
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute()
    {
        return self::CATEGORIES[$this->category] ?? 'Unknown';
    }

    /**
     * Is open
     */
    public function isOpen()
    {
        return in_array($this->status, ['open', 'in_progress', 'waiting']);
    }

    /**
     * Is resolved
     */
    public function isResolved()
    {
        return $this->status === 'resolved' || $this->status === 'closed';
    }

    /**
     * Mark as resolved
     */
    public function markResolved($notes)
    {
        $this->update([
            'status' => 'resolved',
            'resolution_notes' => $notes,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Scope: open
     */
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'in_progress', 'waiting']);
    }

    /**
     * Scope: resolved
     */
    public function scopeResolved($query)
    {
        return $query->whereIn('status', ['resolved', 'closed']);
    }

    /**
     * Scope: by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope: by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: recent
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
