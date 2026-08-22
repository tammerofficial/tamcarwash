# Analytics Module - Quick Reference Guide

## 🚀 Quick Start

### For Managers/Owners
1. Navigate to **Sidebar → Finance → Analytics**
2. Select date range: Today, This Week, This Month
3. Filter by branch (optional)
4. View KPIs and charts

### For Developers

**Add new metric to AnalyticsService:**
```php
// In app/Modules/Analytics/Services/AnalyticsService.php
public function getNewMetric(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
{
    // Your calculation logic
    return [
        'metric_name' => $value,
    ];
}
```

**Expose in API:**
```php
// In app/Modules/Analytics/Http/Controllers/AnalyticsController.php
public function newMetric(Request $request): JsonResponse
{
    $data = $this->analyticsService->getNewMetric(...);
    return response()->json(['success' => true, 'data' => $data]);
}
```

**Add to Frontend:**
```tsx
// In resources/js/pages/analytics/AnalyticsPage.tsx
const newData = data.new_metric;

return (
    <Card>
        <CardHeader><CardTitle>{t('analytics.sections.newSection')}</CardTitle></CardHeader>
        <CardContent>
            {/* Your chart/visualization */}
        </CardContent>
    </Card>
);
```

---

## 📊 API Endpoints Reference

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/analytics/executive-summary` | GET | Top 5 KPIs | 5 metrics |
| `/analytics/revenue` | GET | Revenue analysis | 7 sub-sections |
| `/analytics/customers` | GET | Customer metrics | 6 sub-sections |
| `/analytics/operations` | GET | Queue & operations | 6 sub-sections |
| `/analytics/financial` | GET | Financial reports | 5 sub-sections |
| `/analytics/staff-performance` | GET | Staff metrics | 4 sub-sections |
| `/analytics/loyalty-retention` | GET | Loyalty metrics | 4 sub-sections |
| `/analytics/comprehensive-dashboard` | GET | All above | All 7 sections |

### Query Parameters (All Optional)
```
?start_date=2026-08-01&end_date=2026-08-31&branch_id=1
```

---

## 💾 Database Queries Used

### Most Common
```sql
-- Daily Revenue
SELECT DATE(paid_at) as date, SUM(amount) as total
FROM payments
WHERE DATE(paid_at) >= ? AND DATE(paid_at) <= ? AND status = 'completed'
GROUP BY DATE(paid_at);

-- Average Wait Time
SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, in_service_at)) as avg_wait
FROM queue_entries
WHERE in_service_at IS NOT NULL;

-- Repeat Customer Rate
SELECT COUNT(*) FROM customers c
WHERE (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) > 1;

-- Top Customers
SELECT customer_id, SUM(total_amount) as total_spent, COUNT(*) as order_count
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
ORDER BY total_spent DESC
LIMIT 10;
```

---

## 🎨 Chart Types Implemented

| Chart | Data Type | File | Component |
|-------|-----------|------|-----------|
| Line | Time series | Daily Revenue | LineChart |
| Bar | Categories | Services/Staff | BarChart |
| Progress | Percentage | Revenue vs Target | CSS Bar |
| KPI Card | Single value | Executive Summary | Card |

### Adding New Chart
```tsx
import { PieChart, Pie, Cell } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
    <PieChart>
        <Pie data={data} dataKey="value">
            {COLORS.map((color) => <Cell fill={color} />)}
        </Pie>
    </PieChart>
</ResponsiveContainer>
```

---

## 🔧 Configuration

### Tax Rate (5% for Oman)
```php
// app/Modules/Analytics/Services/AnalyticsService.php
$taxRate = 0.05; // Edit here
$taxAmount = $revenue * $taxRate;
```

### Date Range Default
```tsx
// resources/js/pages/analytics/AnalyticsPage.tsx
const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('month');
```

### Feature Gate
```php
// routes/tenant.php
Route::middleware('plan.feature:analytics,dashboard')->...
```

---

## 🐛 Debugging

### Check API Response
```typescript
// In AnalyticsPage.tsx console
console.log('API Response:', response);
```

### Verify Database Query
```sql
-- SSH to server, run direct query
SELECT * FROM payments WHERE DATE(paid_at) = CURDATE();
```

### Enable Query Logging
```php
// config/database.php
'log' => true,
```

---

## ⚠️ Common Issues & Fixes

**Issue:** Charts not rendering
```
→ Check if data.revenue_analytics is populated
→ Verify Recharts imported correctly
→ Check console for JavaScript errors
```

**Issue:** Numbers don't match
```
→ Verify date range (timezone?)
→ Check if filtering by branch correctly
→ Run manual SQL query to verify
```

**Issue:** Slow load times
```
→ Check query execution time (EXPLAIN)
→ Add indexes if missing
→ Verify date range not too large
```

---

## 🚀 Performance Tips

1. **Optimize Queries**
   - Always use indexed columns
   - Filter by date range
   - Use GROUP BY for aggregation

2. **Frontend Optimization**
   - Don't fetch on every render
   - Use date range change to trigger refetch
   - Lazy-load tabs if adding them

3. **Caching**
   - Future: Add Redis caching for 5-minute intervals
   - Future: Cache calculation results

---

## 📚 File Locations

```
Backend:
  app/Modules/Analytics/Services/AnalyticsService.php
  app/Modules/Analytics/Http/Controllers/AnalyticsController.php
  routes/tenant.php (analytics routes)

Frontend:
  resources/js/pages/analytics/AnalyticsPage.tsx
  resources/js/routes/index.tsx (analytics route)
  resources/js/lib/plan-features.ts (analytics feature)
  resources/js/lib/i18n/ar.ts (analytics translations)
  resources/js/components/layout/Sidebar.tsx (analytics nav)

Documentation:
  docs/ANALYTICS_SYSTEM.md
  docs/ANALYTICS_VERIFICATION.md
```

---

## 🧪 Testing Commands

```bash
# Build frontend
cd /path/to/project && npm run build

# Run analytics queries locally
php artisan tinker
> app('App\Modules\Analytics\Services\AnalyticsService')->getExecutiveSummary()

# Check database
mysql -u user -p database_name
> SELECT SUM(amount) FROM payments WHERE DATE(paid_at) = CURDATE();
```

---

## 📋 Checklist for New Feature

- [ ] Create calculation method in AnalyticsService
- [ ] Add API endpoint in AnalyticsController
- [ ] Add route to routes/tenant.php
- [ ] Create/update component in AnalyticsPage.tsx
- [ ] Add TypeScript interfaces for data
- [ ] Add i18n translations to ar.ts
- [ ] Add to plan-features if gated
- [ ] Test with real data
- [ ] Verify calculations match SQL
- [ ] Document in ANALYTICS_SYSTEM.md
- [ ] Commit with version increment

---

## 📞 Support Contacts

**For Questions:**
- Backend issues → Check app/Modules/Analytics/Services/
- Frontend issues → Check resources/js/pages/analytics/
- Routes issues → Check routes/tenant.php

**For Performance Issues:**
- Profile queries with `EXPLAIN`
- Check database indexes exist
- Monitor query execution time

---

## 🎯 Future Roadmap

**Phase 2 (Next Sprint)**
- [ ] Export to PDF report
- [ ] Export to Excel spreadsheet
- [ ] Scheduled email reports

**Phase 3**
- [ ] Custom date range picker
- [ ] Compare with previous period
- [ ] Drill-down details

**Phase 4**
- [ ] Real-time WebSocket updates
- [ ] Custom KPI creation
- [ ] Threshold alerts

**Phase 5**
- [ ] AI anomaly detection
- [ ] Revenue forecasting
- [ ] Smart recommendations

---

**Last Updated:** 2026-08-22  
**Maintained By:** Development Team  
**Status:** Ready for Use ✅
