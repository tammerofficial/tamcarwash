# تقرير محاكاة الأعمال — Tammer Wash

**التاريخ:** 20 أغسطس 2026  
**البيئة:** `http://127.0.0.1:8000` — مستأجر تجريبي `demo`  
**الوكيل:** Agent 4/4 — صلاحيات الأدوار، E2E، التقرير النهائي  
**أمر المحاكاة:** `php artisan tammer:wash-demo-scenario` **غير موجود** — تم استخدام `app:demo-simulation-test` و `DemoSimulationSeeder`

---

## 1. ملخص المحاكاة

تم تشغيل محاكاة «مغسلة الوادي» على المستأجر `demo` مع بيانات Omani واقعية (5 عملاء، 8 مركبات، 3 حجوزات اليوم، طابور 901–903، فاتورتان بضريبة 5%).

| الاختبار | النتيجة |
|----------|---------|
| `php artisan app:demo-simulation-test --tenant=demo` | ✅ نجح (بيانات + مصفوفة صلاحيات 4 أدوار) |
| `bash scripts/smoke-test-api.sh` | ✅ 0 فشل (22 endpoint كمالك) |
| `bash scripts/role-access-test.sh` | ⚠️ 25/27 نجح — تسريب `/settings` للكاشير والعامل |
| Playwright E2E | ❌ غير مثبت — اختبار يدوي بالمتصفح + API |
| اختبار يدوي 127.0.0.1:8000 | ⚠️ جزئي — انظر القسم 11 |

**الخلاصة:** البنية التحتية للمحاكاة سليمة، لكن **الواجهة الأمامية لا تطبّق RBAC**، و**دورا المحاسب والعميل غير مُنفّذين**. النظام **غير جاهز بالكامل** لعرض تجاري شامل.

---

## 2. بيانات المستأجرين والباقات

### مستأجر Demo (`demo`)
| الحقل | القيمة |
|-------|--------|
| الاسم | مغسلة تجريبية / مغسلة الوادي |
| الفرع | main — الخوير، مسقط |
| الخطة | Starter (الباقة الأساسية) — 29 OMR/شهر |
| حالة الاشتراك | none (لا اشتراك نشط على demo) |
| حد الفروع | 1/1 (ممتلئ) |

### باقات SaaS (Landlord)
| Slug | الاسم | شهري (OMR) | Max فروع |
|------|-------|------------|----------|
| starter | الباقة الأساسية | 29 | 1 |
| professional | الباقة الاحترافية | 59 | 3 |
| enterprise | باقة المؤسسات | 99 | 10 |

### حسابات تجريبية (كلمة المرور: `password`)
| الدور | البريد |
|-------|--------|
| مالك | owner@demo.test |
| مدير فرع | manager@demo.test |
| كاشير | cashier@demo.test |
| عامل | worker@demo.test |
| مدير المنصة | admin@tammer.test |

**ملاحظة:** لا يوجد `accountant@demo.test` ولا بوابة عميل بصلاحيات dashboard.

---

## 3. سيناريو العميل

| خطوة | الحالة | التفاصيل |
|------|--------|----------|
| زيارة `/demo/booking` | ✅ | صفحة الحجز العامة تُحمّل (اختيار فرع + خدمة) |
| GET `/api/v1/storefront/services` | ✅ | غسيل أساسي 2.500 OMR + VAT 5% |
| POST حجز عبر API بدون CSRF | ❌ | CSRF token mismatch (متوقع لـ Sanctum SPA) |
| إكمال حجز E2E من المتصفح | ⏸️ | لم يُختبر حتى النهاية — الواجهة جاهزة |
| تتبع حجز العميل فقط | ❌ | لا يوجد دور/بوابة عميل — `/track` عام فقط |

**البيانات المزروعة:** 3 حجوزات اليوم (مؤكد، معلق، مكتمل) + 5 عملاء Omani.

---

## 4. سيناريو الكاشير

| الصلاحية | Backend API | Frontend UI |
|----------|-------------|-------------|
| لوحة التحكم | ✅ 200 | ✅ يعرض إيراد 7.350 OMR |
| الطابور / الطلبات / الفواتير | ✅ 200 | ✅ |
| الحجوزات | ✅ 403 | ⚠️ رابط «الحجوزات» ظاهر في Sidebar |
| التسعير | ✅ 403 | ⚠️ رابط «التسعير» ظاهر |
| تقارير الضريبة | ✅ 403 | ⚠️ رابط ظاهر |
| الإعدادات | ❌ **200** | ⚠️ رابط ظاهر + API بدون `authorize` |

**تسجيل دخول سريع:** ✅ من `/demo/login` → Dashboard خلال ثوانٍ.

---

## 5. سيناريو الطابور

| العنصر | القيمة |
|--------|--------|
| #901 | waiting — مريم / Honda Accord |
| #902 | waiting — يوسف / Mercedes C200 |
| #903 | in_service — سالم / Nissan Patrol (Bay 2) |
| API `queue/entries` | ✅ للكاشير والعامل |
| شاشة الطابور `/demo/queue/screen` | ✅ route موجود |

---

## 6. سيناريo العامل

| الصلاحية | Backend | Frontend |
|----------|---------|----------|
| عرض الطلبات | ✅ | ✅ |
| عرض الطابور | ✅ | ✅ |
| تغيير حالة الطلب (transition) | ✅ 403 | ⚠️ قد يرى صفحة الطلبات |
| الفواتير / المالية | ✅ 403 | ⚠️ Sidebar كامل |
| الإعدادات | ❌ 200 | ⚠️ |

**طلب قيد الخدمة:** `DEMO-ORD-INSERVICE` — عامل مُعيَّن (`worker@demo.test`).

---

## 7. سيناريo صاحب المغسلة (Tenant Owner)

| القدرة | الحالة |
|--------|--------|
| كل الفروع | ✅ (فرع واحد في demo) |
| المالية والتقارير | ✅ tax-reports, invoices, dashboard |
| الإعدادات | ✅ |
| التسعير والخدمات | ✅ |
| إدارة المستخدمين | ✅ صلاحية `users.manage` |

**Smoke test** يمر باسم المالك على 22 endpoint.

---

## 8. سيناريo صاحب منصة SaaS (Landlord)

| الاختبار | الحالة |
|----------|--------|
| `GET /api/landlord/v1/health` | ✅ |
| Login `admin@tammer.test` | ✅ |
| `GET /api/landlord/v1/plans` | ✅ 3 باقات |
| إنشاء باقة جديدة E2E | ⏸️ لم يُختبر (CRUD موجود في routes) |
| إنشاء مستأجر E2E | ⏸️ `POST /api/landlord/v1/tenants/register` موجود |
| واجهة `/landlord/dashboard` | ⏸️ لم تُختبر بالمتصفح في هذه الجلسة |

---

## 9. الإيرادات والاشتراكات

### إيرادات المغسلة (Dashboard — اليوم)
| المؤشر | القيمة |
|--------|--------|
| طلبات اليوم | 2 |
| إيرادات اليوم | **7.350 OMR** |
| في الانتظار (طابور) | 2 |
| حجوزات نشطة | 2 |

### MRR المنصة (`landlord:report-subscriptions --json`)
| المؤشر | القيمة |
|--------|--------|
| إجمالي المستأجرين | 16 |
| نشطون | 16 |
| اشتراكات trial | 7 |
| **MRR تقديري** | **203 OMR** |

---

## 10. الفواتير والضريبة

| الفاتورة | VAT | المبلغ | الحالة |
|----------|-----|--------|--------|
| DEMO-INV-PAID | 5% → 0.225 | 4.725 OMR | paid (نقدي) |
| DEMO-INV-UNPAID | 5% → 0.125 | 2.625 OMR | unpaid (طلب قيد الخدمة) |

**تقرير VAT اليومي:** `payments_received: 4.725` — لكن `invoice_count: 0` (⚠️ احتمال عدم تطابق منطق التقرير مع `issue_date`).

**إعدادات VAT:** مفعّلة — 5% — `prices_tax_inclusive: false` — VATIN: OM-VAT-DEMO-001.

---

## 11. المشاكل المكتشفة

| # | الأولوية | المشكلة |
|---|----------|---------|
| 1 | 🔴 عالية | **Frontend بدون RBAC:** Sidebar يعرض 13 رابطاً لجميع الأدوار — لا `RoleRoute` ولا تصفية حسب `permissions` |
| 2 | 🔴 عالية | **`SettingsController::show/update` بدون `authorize`** — الكاشير والعامل يصلون للإعدادات (API 200) |
| 3 | 🟠 متوسطة | **دور المحاسب (Accountant) غير موجود** في `config/tammer.php` ولا seeder |
| 4 | 🟠 متوسطة | **دور العميل (Customer) غير موجود** — لا dashboard للعميل، لا عزل «حجزي فقط» |
| 5 | 🟠 متوسطة | **لا scoping للمدير على فرع مُعيَّن** — يرى كل الفروع |
| 6 | 🟡 منخفضة | `app:demo-simulation-test` HTTP flow يفشل — يتوقع Bearer token بينما Auth يستخدم Session |
| 7 | 🟡 منخفضة | Spatie permission cache قد يُظهر نتائج خاطئة حتى `forgetCachedPermissions()` |
| 8 | 🟡 منخفضة | Playwright غير مثبت — لا E2E آلية |
| 9 | 🟡 منخفضة | تقرير VAT اليومي: `invoice_count=0` رغم فواتير demo |
| 10 | 🟡 منخفضة | `OrderService.php` كان يحتوي import مكرر لـ `Booking` (FatalError مؤقت على storefront) |

---

## 12. المشاكل المُصلحة

| المشكلة | الإجراء |
|---------|---------|
| import مكرر `Booking` في `OrderService.php` | ✅ أُزيل (أو أصلحه وكيل سابق) — storefront يعمل |
| `scripts/role-access-test.sh` | ✅ أُنشئ لاختبار RBAC عبر API |
| Spatie cache stale | ✅ يُحل بـ `forgetCachedPermissions()` قبل الاختبار |

---

## 13. المشاكل المتبقية

1. **تطبيق RBAC في React:** guards.tsx + Sidebar.tsx + صفحات حساسة  
2. **إضافة `authorize` لـ SettingsController** (`settings.view` / `settings.manage`)  
3. **تعريف دور `accountant`** — invoices, payments, expenses, reports — بدون ops  
4. **بوابة عميل** — حجز + تتبع فقط، بدون `/dashboard`  
5. **Branch scoping للمدير** — `branch_id` على TenantUser  
6. **تثبيت Playwright** + 12 سيناريو E2E  
7. **إصلاح HTTP flow** في `DemoSimulationTestCommand` (session cookies)  
8. **محاذاة تقرير VAT** مع فواتير DEMO  

---

## 14. هل النظام جاهز لعرض تجاري؟

### الحكم: ⚠️ **جاهز جزئياً — Demo Backend فقط**

| جاهز ✅ | غير جاهز ❌ |
|---------|-------------|
| بيانات محاكاة Omani واقعية | RBAC في الواجهة |
| 4 أدوار backend (owner/manager/cashier/worker) | دور المحاسب والعميل |
| فواتير VAT 5% + دفع | إعدادات مفتوحة للكاشير/العامل |
| طابور + طلبات + dashboard revenue | E2E Playwright |
| Landlord plans + MRR report | Branch scoping للمدير |
| Smoke test CI | عرض Landlord UI كامل |

**التوصية:**  
- ✅ **عرض Backend/API** للمستثمر التقني — البيانات والصلاحيات الأساسية تعمل.  
- ❌ **عرض تجاري للعميل النهائي** — يحتاج 1–2 sprint لإغلاق RBAC frontend + أدوار accountant/customer.

---

## ملحق: نتائج اختبار الأدوار (API)

```
Owner:   7/7 ✅
Manager: 5/5 ✅
Cashier: 6/8 ⚠️ (settings → 200 بدل 403)
Worker:  6/7 ⚠️ (settings → 200 بدل 403)
Accountant: N/A — غير مُنفّذ
Customer:   N/A — غير مُنفّذ
```

## ملحق: E2E Manual (بدون Playwright)

| # | السيناريو | Pass/Fail |
|---|-----------|-----------|
| 1 | SaaS plan create | ⏸️ Plans seeded — create not tested |
| 2 | Tenant create | ⏸️ API exists — not tested |
| 3 | Branch/service config | ✅ Seeded + owner API |
| 4 | Customer books | ⚠️ UI loads — full flow not completed |
| 5 | Cashier check-in | ✅ Queue API accessible |
| 6 | Queue number | ✅ 901–903 seeded |
| 7 | Worker completes | ❌ Worker lacks orders.manage |
| 8 | Payment | ✅ DEMO-INV-PAID + payment record |
| 9 | Invoice VAT 5% | ✅ Verified |
| 10 | Dashboard revenue | ✅ 7.350 OMR |
| 11 | VAT report | ⚠️ Accessible — invoice_count mismatch |
| 12 | Landlord MRR | ✅ 203 OMR |

---

*تم إنشاء هذا التقرير آلياً بواسطة Agent 4 — Tammer Wash Business Simulation.*
