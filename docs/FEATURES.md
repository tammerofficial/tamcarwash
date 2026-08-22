# 📖 دليل الميزات المتقدمة | Advanced Features Guide

**النسخة | Version:** 2.0  
**آخر تحديث | Last Updated:** August 2026

---

## العربية

### 📑 جدول المحتويات

1. [إدارة الحجوزات](#إدارة-الحجوزات)
2. [التقارير والإحصائيات](#التقارير-والإحصائيات)
3. [إدارة الموظفين](#إدارة-الموظفين)
4. [إدارة العملاء](#إدارة-العملاء)
5. [الفواتير والدفع](#الفواتير-والدفع)
6. [الخدمات المتقدمة](#الخدمات-المتقدمة)
7. [الإعدادات](#الإعدادات)

---

### 🗓️ إدارة الحجوزات

#### إنشاء حجز متقدم

**خطوات التفصيل:**

```
القائمة الرئيسية → الحجوزات → إضافة حجز جديد
```

**الخيارات المتقدمة:**

| الخيار | الشرح |
|--------|--------|
| **اختيار عملاء متكررين** | اختر من قائمة العملاء السابقين |
| **حجوزات دورية** | اضبط حجز متكرر (مثال: كل يوم جمعة) |
| **ملاحظات خاصة** | أضف تعليمات خاصة للموظف |
| **أولويات الخدمة** | حدد أولويات إذا طلب أكثر من خدمة |
| **السعر المخصص** | غير السعر الأساسي لظروف خاصة |

#### إدارة حالات الحجزات

**الحالات المتاحة:**

- 🔵 **جديد**: تم إنشاء الحجز للتو
- 🟠 **قيد الانتظار**: في قائمة الانتظار
- 🟡 **قيد التنفيذ**: بدأ الموظف العمل
- 🟢 **مكتمل**: انتهت الخدمة بنجاح
- 🔴 **ملغى**: تم إلغاء الحجز
- ⚫ **معلق**: في انتظار شيء ما (مثل توفر موظف)

**كيفية تغيير الحالة:**
1. اضغط على الحجز
2. اختر الحالة الجديدة من القائمة
3. أضف ملاحظة (اختياري)
4. اضغط "حفظ"

#### إعادة جدولة الحجوزات

إذا أراد العميل تأجيل موعده:

1. اضغط على الحجز
2. اختر **"إعادة جدولة"**
3. اختر التاريخ والوقت الجديد
4. اختر الموظف الجديد (إن لزم)
5. أرسل الإشعار للعميل

#### إلغاء أو حذف حجز

- **الإلغاء**: يُبقي السجل (للتقارير)
- **الحذف**: يزيل الحجز نهائياً (لا يُنصح به)

---

### 📊 التقارير والإحصائيات

#### 1. تقرير الدخل

**الوصول:**
```
القائمة → التقارير → تقرير الدخل
```

**المعلومات المتضمنة:**
- إجمالي الدخل (يومي، أسبوعي، شهري)
- الدخل حسب الخدمة
- الدخل حسب الموظف
- الدخل حسب الفرع
- مقارنة مع نفس الفترة من السنة الماضية

**كيفية التصدير:**
- اضغط **"تحميل PDF"** أو **"تحميل Excel"**
- استخدمه للمحاسب أو البنك

#### 2. تقرير أداء الموظفين

**البيانات:**
- عدد الحجوزات المكتملة
- معدل الإنجاز الزمني
- جودة الخدمة (تقييمات العملاء)
- الحضور والغياب

**استخدامات:**
- تقييم الموظفين
- تحديد أفضل الموظفين
- التخطيط للمكافآت
- تحديد من يحتاج تدريب

#### 3. تقرير رضا العملاء

**معايير القياس:**
- التقييمات النجومية (1-5 نجوم)
- التعليقات الإيجابية والسلبية
- معدل الإرجاع (العملاء المتكررين)

**الفائدة:**
- فهم نقاط الضعف
- تحسين الخدمات
- معرفة رغبات العملاء

#### 4. تقرير الحضور

**يشمل:**
- الحضور اليومي لكل موظف
- التأخيرات
- الغياب بعذر/بدون عذر
- ساعات العمل الإضافية

---

### 👥 إدارة الموظفين

#### بيانات الموظف الشاملة

**البيانات الأساسية:**
- الاسم الكامل
- رقم الهاتف
- رقم الهوية الوطنية
- البريد الإلكتروني

**البيانات المالية:**
- الراتب الشهري الأساسي
- العمولات والمكافآت
- الخصومات
- صافي الراتب

**البيانات الوظيفية:**
- الوظيفة (عامل، فني، مشرف)
- الخدمات التي يقدمها
- تاريخ البدء
- الكفاءات والمهارات

#### تقييم الموظفين

```
الموظفين → اختر الموظف → التقييمات
```

**معايير التقييم:**
- جودة العمل
- الانضباط والحضور
- التعامل مع العملاء
- الالتزام بوقت الخدمة

#### رواتب وحسابات الموظفين

**الحسابات المتاحة:**
- الراتب الأساسي
- العمولات من الحجوزات
- المكافآت الإضافية
- الخصومات والغرامات
- صافي الراتب

**إنشاء كشف الرواتب:**
1. من الموارد البشرية → **"كشف الرواتب"**
2. اختر الشهر والسنة
3. راجع الحسابات
4. أضف ملاحظات إن وجدت
5. أنشئ الفاتورة

---

### 👨‍💼 إدارة العملاء

#### إضافة عميل جديد

**البيانات المطلوبة:**
- الاسم الكامل
- رقم الهاتف
- البريد الإلكتروني (اختياري)
- النوع: شخص/شركة
- الموقع/العنوان

**البيانات الإضافية:**
- السيارات المفضلة لديه
- تاريخ آخر حجز
- معدل التقييم

#### تتبع سجل العميل

**ماذا تجد:**
- كل الحجوزات السابقة
- الخدمات المستخدمة أكثر
- آخر حجز
- إجمالي المنفق
- التقييمات والآراء

#### برنامج الولاء (اختياري)

**نظام النقاط:**
- كل حجز = نقاط معينة
- يمكن تحويل النقاط لخصم
- عروض خاصة للعملاء المخلصين

---

### 💳 الفواتير والدفع

#### إنشاء فاتورة

```
الفواتير → فاتورة جديدة
```

**خطوات الإنشاء:**
1. اختر العميل
2. أضف الخدمات
3. أدخل الأسعار (تملأ تلقائياً)
4. أضف خصم إن وجد
5. أضف الضريبة (إن وجدت)
6. اعرض الإجمالي
7. اختر طريقة الدفع

#### طرق الدفع المتاحة

- 💵 **نقداً**: دفع مباشر
- 💳 **بطاقة ائتمان**: عبر الجهاز
- 📱 **التحويل البنكي**: معرفة بيانات البنك
- 🏦 **تحويل فوري**: STCPay, Payfort, إلخ

#### الفواتير المتكررة

للعملاء الدائمين:
1. أنشئ فاتورة نموذج
2. اجعلها "فاتورة دورية"
3. حدد التكرار (أسبوعي، شهري)
4. ستُنشأ تلقائياً في الموعد المحدد

---

### 🔧 الخدمات المتقدمة

#### إدارة الفروع

**للشركات متعددة الفروع:**

1. من الإعدادات → **"الفروع"**
2. أضف فرع جديد
3. أدخل البيانات:
   - الاسم
   - الموقع
   - رقم الهاتف
   - المدير المسؤول

**مميزات:**
- تقارير منفصلة لكل فرع
- إدارة موظفي كل فرع
- مقارنة الأداء بين الفروع

#### جدولة الموظفين

```
الموارد البشرية → الجدول الزمني
```

**الإمكانيات:**
- تحديد أيام العمل والعطل
- تحديد ساعات العمل (6 صباحاً - 6 مساءً)
- الإجازات المرضية والسنوية
- الإجازات الطارئة

#### المخزون والصيانة

**تتبع المنتجات:**
- الشامبو والصابون
- منظفات
- أدوات وأجهزة
- قطع غيار

**سجل الصيانة:**
- تاريخ الصيانة الدورية
- الأعطال والإصلاحات
- تكاليف الصيانة

---

### ⚙️ الإعدادات

#### إعدادات عامة

- **اسم المغسل**: اسم عملك
- **العنوان**: موقع المغسل
- **رقم الهاتف**: للعملاء
- **ساعات العمل**: من-إلى
- **العملة**: ريال، درهم، إلخ

#### إعدادات الخدمات

- **الخدمات الافتراضية**: الخدمات الأساسية
- **وقت الخدمة الافتراضي**: المدة الافتراضية
- **هل تسمح بالخدمات المخصصة؟**: نعم/لا

#### إعدادات الموظفين

- **جدول العمل الافتراضي**
- **الراتب الأساسي الافتراضي**
- **نسبة العمولة**

#### إعدادات الإشعارات

- إشعارات للمدير عند حجز جديد
- إشعارات للموظف عند تعيينه
- إشعارات للعميل قبل الموعد

---

## English

### 📑 Table of Contents

1. [Booking Management](#booking-management)
2. [Reports and Analytics](#reports-and-analytics)
3. [Staff Management](#staff-management)
4. [Customer Management](#customer-management)
5. [Invoicing and Payments](#invoicing-and-payments)
6. [Advanced Services](#advanced-services)
7. [Settings](#settings)

---

### 🗓️ Booking Management

#### Create Advanced Booking

**Steps:**

```
Main Menu → Bookings → Add New Booking
```

**Advanced Options:**

| Option | Description |
|--------|-------------|
| **Recurring Customers** | Select from list of previous customers |
| **Recurring Bookings** | Set up repeating booking (e.g., Every Friday) |
| **Special Notes** | Add instructions for staff |
| **Service Priorities** | Set priorities for multiple services |
| **Custom Price** | Override default price for special cases |

#### Manage Booking States

**Available States:**

- 🔵 **New**: Booking just created
- 🟠 **Pending**: In queue
- 🟡 **In Progress**: Staff member started work
- 🟢 **Completed**: Service finished successfully
- 🔴 **Cancelled**: Booking cancelled
- ⚫ **On Hold**: Waiting for something (e.g., staff availability)

**How to Change State:**
1. Click on booking
2. Select new state from dropdown
3. Add note (optional)
4. Click "Save"

#### Reschedule Bookings

If customer wants to postpone:

1. Click on booking
2. Select **"Reschedule"**
3. Choose new date and time
4. Select new staff member (if needed)
5. Send notification to customer

#### Cancel or Delete Booking

- **Cancel**: Keeps record (for reports)
- **Delete**: Permanently removes (not recommended)

---

### 📊 Reports and Analytics

#### 1. Income Report

**Access:**
```
Menu → Reports → Income Report
```

**Information Included:**
- Total income (daily, weekly, monthly)
- Income by service
- Income by staff member
- Income by branch
- Comparison with same period last year

**How to Export:**
- Click **"Download PDF"** or **"Download Excel"**
- Use for accountant or bank

#### 2. Staff Performance Report

**Data:**
- Number of completed bookings
- On-time completion rate
- Service quality (customer ratings)
- Attendance and absences

**Uses:**
- Evaluate staff
- Identify top performers
- Plan bonuses
- Identify training needs

#### 3. Customer Satisfaction Report

**Measurement Criteria:**
- Star ratings (1-5 stars)
- Positive and negative comments
- Return rate (repeat customers)

**Benefits:**
- Identify weak points
- Improve services
- Understand customer preferences

#### 4. Attendance Report

**Includes:**
- Daily attendance for each employee
- Lateness
- Absences (excused/unexcused)
- Overtime hours

---

### 👥 Staff Management

#### Comprehensive Staff Data

**Basic Information:**
- Full name
- Phone number
- National ID
- Email address

**Financial Data:**
- Monthly salary
- Commissions and bonuses
- Deductions
- Net salary

**Job Data:**
- Position (worker, technician, supervisor)
- Services provided
- Start date
- Skills and competencies

#### Staff Evaluations

```
Staff → Select Staff → Evaluations
```

**Evaluation Criteria:**
- Work quality
- Discipline and attendance
- Customer interaction
- Service time commitment

#### Staff Salaries and Accounting

**Available Calculations:**
- Base salary
- Commissions from bookings
- Additional bonuses
- Deductions and fines
- Net salary

**Create Payroll:**
1. From HR → **"Payroll"**
2. Select month and year
3. Review calculations
4. Add notes if needed
5. Generate payroll

---

### 👨‍💼 Customer Management

#### Add New Customer

**Required Information:**
- Full name
- Phone number
- Email (optional)
- Type: Individual/Company
- Location/Address

**Additional Data:**
- Preferred vehicles
- Last booking date
- Rating average

#### Track Customer History

**Available Information:**
- All previous bookings
- Most used services
- Last booking
- Total spent
- Ratings and comments

#### Loyalty Program (Optional)

**Points System:**
- Each booking = certain points
- Points convertible to discounts
- Special offers for loyal customers

---

### 💳 Invoicing and Payments

#### Create Invoice

```
Invoices → New Invoice
```

**Creation Steps:**
1. Select customer
2. Add services
3. Enter prices (auto-filled)
4. Add discount if applicable
5. Add tax if applicable
6. View total
7. Select payment method

#### Available Payment Methods

- 💵 **Cash**: Direct payment
- 💳 **Credit Card**: Via card reader
- 📱 **Bank Transfer**: With bank details
- 🏦 **Instant Transfer**: STCPay, Payfort, etc.

#### Recurring Invoices

For regular customers:
1. Create template invoice
2. Mark as "Recurring Invoice"
3. Set frequency (weekly, monthly)
4. Auto-generated at scheduled time

---

### 🔧 Advanced Services

#### Branch Management

**For Multi-Branch Companies:**

1. From Settings → **"Branches"**
2. Add new branch
3. Enter information:
   - Name
   - Location
   - Phone number
   - Responsible manager

**Features:**
- Separate reports for each branch
- Manage staff for each branch
- Compare branch performance

#### Staff Scheduling

```
Human Resources → Schedule
```

**Capabilities:**
- Set work days and holidays
- Set work hours (6 AM - 6 PM)
- Medical and annual leave
- Emergency leave

#### Inventory and Maintenance

**Track Products:**
- Shampoo and soap
- Cleaning solutions
- Tools and equipment
- Spare parts

**Maintenance Log:**
- Periodic maintenance dates
- Failures and repairs
- Maintenance costs

---

### ⚙️ Settings

#### General Settings

- **Car Wash Name**: Your business name
- **Address**: Car wash location
- **Phone Number**: For customers
- **Working Hours**: From-to
- **Currency**: Riyal, Dirham, etc.

#### Service Settings

- **Default Services**: Basic services
- **Default Service Time**: Duration
- **Allow Custom Services?**: Yes/No

#### Staff Settings

- **Default Work Schedule**
- **Default Base Salary**
- **Commission Rate**

#### Notification Settings

- Notify manager on new booking
- Notify staff when assigned
- Notify customer before appointment

---

**Last Updated:** August 2026  
**Version:** 2.0  
**Support Email:** support@tamcarwash.com
