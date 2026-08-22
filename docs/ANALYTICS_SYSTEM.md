# Comprehensive Analytics & Reporting System

## Overview

The Analytics Dashboard provides real-time business intelligence and KPIs for car wash management. It includes 7 major sections with interactive charts, trend analysis, and export capabilities.

---

## 🎯 System Architecture

### Backend Components

#### 1. **AnalyticsService** (`app/Modules/Analytics/Services/AnalyticsService.php`)

Core service containing all calculation logic:

- **getExecutiveSummary()** - Today's key metrics
- **getRevenueAnalytics()** - Revenue trends and breakdown
- **getCustomerAnalytics()** - Customer behavior analysis
- **getOperationsAnalytics()** - Queue and service metrics
- **getFinancialReports()** - Tax and profit calculations
- **getStaffPerformance()** - Employee productivity
- **getLoyaltyRetention()** - Customer retention metrics

#### 2. **AnalyticsController** (`app/Modules/Analytics/Http/Controllers/AnalyticsController.php`)

REST API endpoints for each analytics section:

```php
// Routes
GET /api/analytics/executive-summary
GET /api/analytics/revenue
GET /api/analytics/customers
GET /api/analytics/operations
GET /api/analytics/financial
GET /api/analytics/staff-performance
GET /api/analytics/loyalty-retention
GET /api/analytics/comprehensive-dashboard
```

#### 3. **Routes** (`routes/tenant.php`)

All analytics routes are protected with:
- `auth:tenant` middleware (requires login)
- `plan.feature:analytics,dashboard` middleware (feature gate)

### Frontend Components

#### **AnalyticsPage** (`resources/js/pages/analytics/AnalyticsPage.tsx`)

React component featuring:
- 7 major dashboard sections
- Interactive Recharts visualizations
- Date range selector (Today, Week, Month, Custom)
- Branch filtering
- Real-time data loading

---

## 📊 Dashboard Sections

### 1. Executive Summary
**Top metrics at a glance:**
- Today's Revenue (OMR)
- Active Customers Today
- Queue Depth (customers waiting)
- Staff On Duty
- Revenue Growth % vs last day

**Data Refresh:** Real-time

### 2. Revenue Analytics
**Visualizations:**
- Daily Revenue Chart (line chart, 30 days)
- Revenue by Service Type (breakdown)
- Revenue by Branch (if multi-branch)
- Revenue vs Target (progress bar)
- Trend Analysis:
  - 7-day trend
  - 30-day trend
  - 90-day trend

**Calculations:**
```php
Daily Revenue = SUM(payments.amount) WHERE status='completed' 
                GROUP BY date

Revenue Growth = ((Current Period - Previous Period) / Previous Period) * 100

Trend = ((Current 7 days - Previous 7 days) / Previous 7 days) * 100
```

### 3. Customer Analytics
**Metrics:**
- Total Customers
- New Customers This Month
- Repeat Customer Rate (%)
- Customer Satisfaction (1-5)
- Top 10 Customers by Spend
- Customer Growth Trend Chart

**Calculations:**
```php
Repeat Rate = (Customers with 2+ orders / Total customers) * 100

Top Customers = ORDER BY SUM(total_amount) DESC LIMIT 10

Customer Growth = CUMULATIVE COUNT GROUP BY date
```

### 4. Operations Analytics
**Metrics:**
- Average Wait Time (minutes)
- Queue Efficiency (customers/hour)
- Service Completion Rate (%)
- Peak Hours Analysis
- Busiest Day of Week
- Daily Operations Trend

**Calculations:**
```php
Avg Wait Time = AVG(TIMESTAMPDIFF(MINUTE, queued_at, in_service_at))

Queue Efficiency = Total Orders / Number of Days

Completion Rate = (Completed Orders / Total Orders) * 100

Peak Hours = ORDER BY COUNT(*) DESC LIMIT 5
```

### 5. Financial Reports
**Sections:**
- **Tax Report:**
  - Total Revenue
  - Tax Rate (5% VAT)
  - Tax Amount Collected
  - Net Amount (Revenue - Tax)

- **Payment Methods:** Breakdown by method (Cash, Card, etc.)
- **Outstanding Payments:** Unpaid invoices total
- **Profit Analysis:**
  - Gross Profit
  - Net Profit (after expenses)
  - Profit Margin %

**Calculations:**
```php
Tax Amount = SUM(orders.tax_amount)
Gross Profit = Total Revenue - Tax
Net Profit = Gross Profit - Expenses
Profit Margin = (Net Profit / Total Revenue) * 100
```

### 6. Staff Performance
**Metrics:**
- Services Completed per Staff
- Average Rating per Staff
- Staff Efficiency (services/hour)
- Attendance Tracking

**Visualizations:**
- Bar chart of services per staff
- Efficiency ranking
- Attendance calendar

### 7. Loyalty & Retention
**Metrics:**
- Loyalty Points Distributed
- Repeat Visit Rate (%)
- Customer Churn Rate (%)
- Redemption Rate (%)

**Calculations:**
```php
Repeat Visit Rate = (Customers with multiple visits / Total active) * 100

Churn Rate = (Customers inactive 90+ days / Total customers) * 100

Redemption Rate = (Points redeemed / Points distributed) * 100
```

---

## 🔌 API Endpoints

### Request/Response Format

**Request Parameters (all optional):**
```json
{
  "start_date": "2026-08-01",
  "end_date": "2026-08-31",
  "branch_id": 1
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "executive_summary": { ... },
    "revenue_analytics": { ... },
    "customer_analytics": { ... },
    ...
  }
}
```

### Comprehensive Dashboard Endpoint

**GET /api/analytics/comprehensive-dashboard**

Returns all 7 sections at once for initial page load:

```php
// Controller Method
public function comprehensiveDashboard(Request $request): JsonResponse
{
    // Fetches all analytics in parallel for performance
    return [
        'executive_summary' => ...,
        'revenue_analytics' => ...,
        'customer_analytics' => ...,
        'operations_analytics' => ...,
        'financial_reports' => ...,
        'staff_performance' => ...,
        'loyalty_retention' => ...,
    ];
}
```

---

## 📈 Charts & Visualizations

### Using Recharts

All charts built with **Recharts** (already in dependencies):

**Line Chart - Daily Revenue:**
```tsx
<ResponsiveContainer width="100%" height={300}>
    <LineChart data={revenue.daily_revenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
    </LineChart>
</ResponsiveContainer>
```

**Bar Chart - Services per Staff:**
```tsx
<ResponsiveContainer width="100%" height={300}>
    <BarChart data={staff.services_per_staff}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="staff_name" angle={-45} />
        <YAxis />
        <Bar dataKey="services_count" fill="#f59e0b" />
    </BarChart>
</ResponsiveContainer>
```

**Pie Chart - Revenue by Service (extendable):**
```tsx
<ResponsiveContainer width="100%" height={300}>
    <PieChart>
        <Pie data={revenue.revenue_by_service} dataKey="revenue">
            {COLORS.map((color) => <Cell fill={color} />)}
        </Pie>
        <Tooltip />
    </PieChart>
</ResponsiveContainer>
```

---

## 🌐 Frontend Integration

### Navigation
Added to Finance section of sidebar:
```tsx
{ to: '/analytics', label: t('nav.analytics'), icon: BarChart3, 
  roles: ['owner', 'manager'], feature: 'analytics' }
```

### Date Range Selector
```tsx
// Frontend
const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('month');

// Converts to start_date and end_date parameters
```

### Feature Gating
Analytics feature added to plan features:
```typescript
// resources/js/lib/plan-features.ts
export const PLAN_FEATURE_KEYS = [
    ...
    'analytics',
    ...
]
```

---

## 🔄 Data Flow

```
Frontend (AnalyticsPage.tsx)
    ↓
API Request (/api/analytics/comprehensive-dashboard)
    ↓
Controller (AnalyticsController.php)
    ↓ (validates + filters by branch/date)
Service (AnalyticsService.php)
    ↓
Database Queries (optimized with grouping/aggregation)
    ↓
Formatted Response (JSON)
    ↓
Frontend Charts (Recharts components)
```

---

## ⚡ Performance Optimizations

### 1. Database Indexes
All queries use indexes:
```sql
INDEX [branch_id, status]
INDEX [branch_id, created_at]
INDEX [branch_id, paid_at]
INDEX [worker_id, status]
```

### 2. Aggregation Queries
Uses SQL GROUP BY and aggregates instead of processing in PHP:
```php
$query = Payment::query()
    ->select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(amount) as total'))
    ->groupBy(DB::raw('DATE(paid_at)'));
```

### 3. Date Range Filtering
All queries filtered by date range to limit result sets:
```php
whereBetween('paid_at', [$startDate, $endDate])
```

### 4. Frontend Caching
Date range state to avoid refetch on component re-render:
```tsx
useEffect(() => {
    fetchAnalytics();
}, [dateRange]); // Only refetch when date range changes
```

---

## 🔐 Security & Permissions

### Authentication
All endpoints require `auth:tenant` middleware:
```php
Route::middleware('auth:tenant')->prefix('analytics')->group(...)
```

### Authorization
Feature-gated via plan features:
```php
Route::middleware('plan.feature:analytics,dashboard')->group(...)
```

### Data Isolation
Automatically filtered by tenant via tenant context:
```php
// Tenant context applied globally in routes
```

### Input Validation
All parameters validated:
```php
$request->validate([
    'start_date' => 'nullable|date',
    'end_date' => 'nullable|date',
    'branch_id' => 'nullable|integer|exists:branches,id',
]);
```

---

## 📱 Mobile Responsiveness

All charts are mobile-friendly using Tailwind CSS grid:
```tsx
// Desktop: 2 columns, Mobile: 1 column
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>...</Card>
    <Card>...</Card>
</div>
```

Charts use ResponsiveContainer for automatic scaling:
```tsx
<ResponsiveContainer width="100%" height={300}>
    {/* Charts automatically scale to container width */}
</ResponsiveContainer>
```

---

## 🚀 Future Enhancements

### Phase 2: Export & Scheduling
- [ ] Export to PDF/Excel
- [ ] Email scheduled reports
- [ ] Email scheduling (daily/weekly/monthly)

### Phase 3: Advanced Features
- [ ] Real-time WebSocket updates
- [ ] Custom date ranges
- [ ] Drill-down analytics
- [ ] Comparison analytics (this month vs last month)
- [ ] Custom KPI creation

### Phase 4: AI Insights
- [ ] Anomaly detection
- [ ] Forecasting
- [ ] Recommendations
- [ ] Alerts on thresholds

---

## 📋 API Response Examples

### Executive Summary
```json
{
  "today_revenue": 450.500,
  "active_customers_today": 15,
  "queue_depth": 3,
  "staff_on_duty": 4,
  "revenue_growth_percent": 12.5,
  "last_day_revenue": 400.250
}
```

### Revenue Analytics
```json
{
  "daily_revenue": [
    { "date": "2026-08-22", "revenue": 450.500, "day_name": "Friday" },
    { "date": "2026-08-21", "revenue": 425.750, "day_name": "Thursday" }
  ],
  "revenue_by_service": [
    { "service_id": 1, "revenue": 200.000 },
    { "service_id": 2, "revenue": 150.500 }
  ],
  "revenue_vs_target": {
    "actual_revenue": 13500.000,
    "target_revenue": 15000.000,
    "percentage_of_target": 90.0,
    "variance": -1500.000
  },
  "trend_7day": 5.25,
  "trend_30day": 8.50,
  "trend_90day": 12.75
}
```

---

## 🔧 Configuration

### Feature Flag
Enable analytics in plan:
```php
// In plan configuration
'features' => ['analytics', 'dashboard', ...]
```

### Tax Rate
Currently hardcoded at 5% (Oman VAT):
```php
'tax_rate' => 5.0,
'tax_amount' => round($totalRevenue * 0.05, 3)
```

### Default Target Revenue
Currently $500/day (customizable per tenant):
```php
$targetPerDay = 500; // Should be in tenant settings
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Load analytics page
- [ ] Change date ranges (Today, Week, Month)
- [ ] Filter by branch
- [ ] Verify all charts render
- [ ] Check calculations match database
- [ ] Test on mobile devices
- [ ] Verify data with raw SQL queries

### Sample SQL Verification
```sql
-- Verify today's revenue
SELECT SUM(amount) FROM payments 
WHERE DATE(paid_at) = CURDATE() AND status = 'completed';

-- Verify repeat customer rate
SELECT COUNT(*) FROM customers c 
WHERE (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) > 1;

-- Verify average wait time
SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, in_service_at)) 
FROM queue_entries 
WHERE in_service_at IS NOT NULL;
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: Charts not loading**
- A: Check browser console for API errors
- A: Verify analytics middleware not blocked
- A: Check date range doesn't exceed 90 days

**Q: Numbers don't match**
- A: Verify filter (branch_id) is correct
- A: Check date range (timezone differences)
- A: Verify all orders have completed status

**Q: Slow page load**
- A: Check database query performance (EXPLAIN)
- A: Verify indexes exist on filtered columns
- A: Consider paginating large datasets

---

## 📝 Analytics Configuration File

Create `config/analytics.php` for future customization:
```php
return [
    'tax_rate' => 5.0, // Oman VAT
    'default_target_revenue_per_day' => 500,
    'cache_minutes' => 5,
    'max_date_range_days' => 90,
    'export_formats' => ['pdf', 'excel'],
];
```

---

## 🎨 UI/UX Details

### Color Scheme (Tailwind)
- Primary: Blue (#3b82f6) - Revenue
- Success: Green (#10b981) - Profit/Completion
- Warning: Amber (#f59e0b) - Efficiency
- Danger: Red (#ec4899) - Issues/Churn
- Secondary: Purple (#8b5cf6) - Trends
- Info: Cyan (#06b6d4) - Operations

### Loading States
- Skeleton loading for initial page
- Smooth transitions between date ranges
- Toast notifications for errors

### Empty States
- Clear message when no data available
- CTA to create first order

---

## 📚 References

- [Recharts Documentation](https://recharts.org)
- [Laravel Query Builder](https://laravel.com/docs/eloquent)
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)
- [Carbon PHP Date Library](https://carbon.nesbot.com)

---

**Last Updated:** 2026-08-22  
**Version:** 1.0  
**Status:** Ready for Testing
