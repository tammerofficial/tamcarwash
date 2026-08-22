# 📚 Support and Documentation System

**Version:** 1.0  
**Last Updated:** August 2026

---

## 🎯 Overview

The Support and Documentation System provides a comprehensive support infrastructure for Tammer Wash customers and staff. It includes:

- ✅ **FAQ Management System** - Searchable FAQs in Arabic & English
- ✅ **Support Ticket System** - Customer support requests
- ✅ **Announcements System** - In-app notifications
- ✅ **Help Center** - Searchable help articles
- ✅ **Video Tutorials** - Step-by-step guides
- ✅ **Documentation** - Complete guides (GETTING_STARTED, FEATURES, TROUBLESHOOTING, FAQ)
- ✅ **In-App Help** - Context-sensitive help on every page

---

## 📁 File Structure

```
support-system/
├── app/Modules/Support/
│   ├── Models/
│   │   ├── Faq.php                 # FAQ model
│   │   ├── SupportTicket.php       # Support ticket model
│   │   └── Announcement.php        # Announcement model
│   ├── Controllers/
│   │   ├── FaqController.php       # FAQ API endpoints
│   │   ├── SupportTicketController.php
│   │   └── AnnouncementController.php
│   ├── Routes/
│   │   └── api.php                 # API routes
│   └── SupportServiceProvider.php
├── database/migrations/
│   └── 2026_08_22_183225_create_support_system_tables.php
├── docs/
│   ├── GETTING_STARTED.md          # Quick start guide
│   ├── FEATURES.md                 # Feature explanations
│   ├── TROUBLESHOOTING.md          # Common issues & solutions
│   └── FAQ.md                       # FAQ document
├── assets/src/
│   ├── components/Support/
│   │   └── HelpSection.vue         # Help button & sidebar
│   ├── views/Support/
│   │   └── HelpCenter.vue          # Help center page
│   ├── composables/
│   │   └── useHelp.js              # Help composable
│   └── utils/
│       └── helpContent.js          # Help content data
└── README.md                        # This file
```

---

## 🚀 Getting Started

### 1. Install

The support system is built into Tammer Wash. No additional installation needed.

### 2. Run Migrations

```bash
php artisan migrate
```

This creates three tables:
- `faqs` - FAQ entries
- `support_tickets` - Customer support tickets
- `announcements` - System announcements

### 3. Register Service Provider

The `SupportServiceProvider` is auto-registered in `config/app.php`.

### 4. Build Assets

```bash
cd assets && npm run build
```

---

## 📖 Usage

### Adding FAQs

#### Via API (Admin)

```php
POST /api/faqs

{
  "question_ar": "كيف أضيف خدمة جديدة؟",
  "question_en": "How do I add a new service?",
  "answer_ar": "انتقل إلى الخدمات > إضافة خدمة جديدة",
  "answer_en": "Go to Services > Add New Service",
  "category": "getting_started",
  "order": 1,
  "is_active": true
}
```

#### In Code

```php
use App\Modules\Support\Models\Faq;

Faq::create([
    'question_ar' => 'كيف أضيف خدمة جديدة؟',
    'question_en' => 'How do I add a new service?',
    'answer_ar' => 'انتقل إلى الخدمات > إضافة خدمة جديدة',
    'answer_en' => 'Go to Services > Add New Service',
    'category' => 'getting_started',
    'order' => 1,
    'is_active' => true,
]);
```

### Using Help in Vue Components

```vue
<template>
  <div class="my-page">
    <!-- Your content -->
    <HelpSection page-key="bookings" />
  </div>
</template>

<script setup>
import HelpSection from '@/components/Support/HelpSection.vue'
</script>
```

### Accessing FAQs via API

#### Get All FAQs

```bash
GET /api/faqs
GET /api/faqs?category=getting_started
GET /api/faqs?search=how
```

#### Get FAQ by ID

```bash
GET /api/faqs/{id}
```

#### Mark as Helpful

```bash
POST /api/faqs/{id}/helpful
POST /api/faqs/{id}/not-helpful
```

#### Get Statistics

```bash
GET /api/faqs/meta/statistics
GET /api/faqs/meta/categories
GET /api/faqs/meta/popular
GET /api/faqs/meta/most-helpful
```

---

## 🎫 Support Tickets

### Creating a Ticket

#### Via API

```php
POST /api/support-tickets

{
  "user_name": "محمد أحمد",
  "user_email": "muhammad@example.com",
  "user_phone": "0501234567",
  "subject": "لا يمكن إضافة حجز",
  "description": "عندما أحاول إضافة حجز جديد أحصل على خطأ",
  "category": "bug",
  "priority": "high"
}
```

#### In Vue

```vue
<template>
  <form @submit.prevent="submitTicket">
    <!-- Form fields -->
    <button type="submit">Submit Ticket</button>
  </form>
</template>

<script setup>
import api from '@/core/api'

const submitTicket = async (data) => {
  const response = await api.post('/support-tickets', data)
  console.log(response.data)
}
</script>
```

### Ticket Status Flow

```
open → in_progress → (waiting or) → resolved → closed
```

### API Endpoints

```bash
# Get all tickets
GET /api/support-tickets

# Get ticket by ID
GET /api/support-tickets/{id}

# Update ticket
PUT /api/support-tickets/{id}

# Resolve ticket
POST /api/support-tickets/{id}/resolve

# Close ticket
POST /api/support-tickets/{id}/close

# Get customer's tickets
GET /api/support-tickets/user/my-tickets

# Statistics
GET /api/support-tickets/meta/statistics
```

---

## 📢 Announcements

### Creating Announcements

```php
use App\Modules\Support\Models\Announcement;

Announcement::create([
    'title_ar' => 'صيانة النظام',
    'title_en' => 'System Maintenance',
    'content_ar' => 'سيتم إجراء صيانة دورية يوم الجمعة...',
    'content_en' => 'System maintenance will be performed on Friday...',
    'type' => 'maintenance',
    'priority' => 'high',
    'target_role' => 'all',
    'published_at' => now(),
    'expires_at' => now()->addDays(7),
    'is_active' => true,
]);
```

### Announcement Types

- `update` - System updates
- `maintenance` - Maintenance windows
- `feature` - New features
- `important` - Important notices
- `warning` - Warnings

### API Endpoints

```bash
# Get all announcements
GET /api/announcements

# Get by role
GET /api/announcements/by-role/{role}

# Get by type
GET /api/announcements/by-type/{type}

# Get latest
GET /api/announcements/latest?limit=5

# Statistics
GET /api/announcements/meta/statistics
```

---

## 📱 Components

### HelpSection Component

Context-sensitive help panel for pages.

```vue
<HelpSection page-key="bookings" />
```

**Props:**
- `pageKey` (required) - Key from helpContent.js

**Features:**
- Toggleable sidebar
- Video embedding
- Tips and sections
- Learn more links

### HelpCenter Page

Full-page help center with search and categorization.

**Route:** `/support/help-center`

**Features:**
- Category filtering
- Full-text search
- Expandable Q&A
- Helpful rating
- Pagination
- Video links
- Support contact form

---

## 🎬 Video Tutorials

### Adding Videos

Edit `assets/src/utils/helpContent.js`:

```javascript
export const videoTutorials = [
  {
    id: 'my-video',
    title: { ar: 'عنوان بالعربية', en: 'English Title' },
    description: { ar: 'وصف', en: 'Description' },
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    duration: '3:45',
    category: 'bookings',
  },
]
```

### Embedding Videos

The HelpSection component automatically embeds videos from YouTube using the embed URL.

---

## 📝 Documentation Files

### GETTING_STARTED.md

Quick start guide for new users.

**Contents:**
- Account creation
- Adding services
- Adding staff
- Creating bookings
- Dashboard overview

### FEATURES.md

Comprehensive feature guide.

**Contents:**
- Booking management
- Reports
- Staff management
- Customer management
- Invoicing
- Branches
- Settings

### TROUBLESHOOTING.md

Common issues and solutions.

**Contents:**
- Login problems
- Booking errors
- Staff issues
- Report problems
- Invoice errors
- Performance issues
- Connection problems

### FAQ.md

Frequently asked questions.

**Contents:**
- Account & registration
- Bookings
- Staff & payroll
- Invoicing
- Reports
- Branches
- Data & privacy
- Support

---

## 🔌 API Reference

### FAQ Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/faqs` | Get all FAQs |
| GET | `/faqs/{id}` | Get FAQ by ID |
| GET | `/faqs/category/{category}` | Get by category |
| POST | `/faqs/{id}/helpful` | Mark helpful |
| POST | `/faqs/{id}/not-helpful` | Mark not helpful |
| GET | `/faqs/meta/categories` | Get categories |
| GET | `/faqs/meta/popular` | Get popular FAQs |
| GET | `/faqs/meta/most-helpful` | Get most helpful |
| GET | `/faqs/meta/statistics` | Get statistics |

### Ticket Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/support-tickets` | Get all tickets |
| POST | `/support-tickets` | Create ticket |
| GET | `/support-tickets/{id}` | Get ticket |
| PUT | `/support-tickets/{id}` | Update ticket |
| POST | `/support-tickets/{id}/resolve` | Resolve ticket |
| POST | `/support-tickets/{id}/close` | Close ticket |
| GET | `/support-tickets/user/my-tickets` | Get customer's tickets |
| GET | `/support-tickets/meta/statistics` | Get statistics |

### Announcement Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/announcements` | Get all |
| GET | `/announcements/latest` | Get latest |
| GET | `/announcements/by-role/{role}` | Get by role |
| GET | `/announcements/by-type/{type}` | Get by type |
| GET | `/announcements/{id}` | Get one |
| GET | `/announcements/meta/types` | Get types |
| GET | `/announcements/meta/statistics` | Get statistics |

---

## 🗂️ FAQ Categories

```php
'getting_started' => 'Getting Started | البدء السريع',
'operations' => 'Operations | العمليات',
'billing' => 'Billing & Payments | الفواتير والدفع',
'troubleshooting' => 'Troubleshooting | حل المشاكل',
'staff' => 'Staff Management | إدارة الموظفين',
'reports' => 'Reports | التقارير',
'branches' => 'Branches | الفروع',
'account' => 'Account | الحساب',
'security' => 'Security | الأمان',
'other' => 'Other | أخرى',
```

---

## 🎯 Help Content Keys

Use these keys in `<HelpSection page-key="..."/>`:

- `getting-started` - Getting started guide
- `dashboard` - Dashboard overview
- `bookings` - Booking management
- `staff` - Staff management
- `services` - Service management
- `reports` - Reports & analytics
- `customers` - Customer management
- `invoices` - Invoicing & payments
- `branches` - Branch management
- `settings` - Settings

---

## 🌐 Languages

All components support Arabic and English based on app locale.

### Switching Language

```javascript
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
locale.value = 'ar' // Arabic
locale.value = 'en' // English
```

### Translation Keys

Add to your locale files:

```json
{
  "support": {
    "helpCenter": "مركز المساعدة",
    "helpCenterDesc": "ابحث عن الإجابات والدعم",
    "searchFaq": "ابحث عن الأسئلة الشائعة",
    "categories": "الفئات",
    "videoTutorials": "فيديوهات تعليمية",
    "contactSupport": "تواصل مع الدعم"
  }
}
```

---

## 🔐 Permissions

### Public Endpoints (No Auth Required)
- GET `/faqs` and related
- GET `/announcements` and related

### Private Endpoints (Auth Required)
- POST `/support-tickets` - Create ticket
- GET `/support-tickets/user/my-tickets` - View own tickets
- All other ticket operations (admin only)

---

## 💾 Database Schema

### FAQs Table

```sql
id (Primary Key)
question_ar (Text)
question_en (Text)
answer_ar (Long Text)
answer_en (Long Text)
category (String)
order (Integer)
helpful_count (Integer)
not_helpful_count (Integer)
views (Integer)
is_active (Boolean)
created_at, updated_at, deleted_at
```

### Support Tickets Table

```sql
id (Primary Key)
ticket_number (String, Unique)
user_id (Foreign Key)
user_name (String)
user_email (String)
user_phone (String)
subject (String)
description (Long Text)
category (String)
priority (String)
status (String)
assigned_to (String)
resolution_notes (Long Text)
resolved_at (DateTime)
created_at, updated_at, deleted_at
```

### Announcements Table

```sql
id (Primary Key)
title_ar (String)
title_en (String)
content_ar (Long Text)
content_en (Long Text)
type (String)
priority (String)
published_at (DateTime)
expires_at (DateTime)
target_role (String)
is_active (Boolean)
created_at, updated_at, deleted_at
```

---

## 🧪 Testing

### Test FAQ Creation

```php
test('can create faq', function () {
    $faq = Faq::create([
        'question_ar' => 'Test Question',
        'question_en' => 'Test Question',
        'answer_ar' => 'Test Answer',
        'answer_en' => 'Test Answer',
        'category' => 'other',
        'is_active' => true,
    ]);

    expect($faq->id)->toBeGreaterThan(0);
});
```

### Test API Endpoints

```php
test('can get faqs', function () {
    $response = $this->getJson('/api/faqs');
    $response->assertStatus(200);
});
```

---

## 🚨 Troubleshooting

### FAQs Not Showing

1. Check `is_active` is `true`
2. Verify category exists
3. Check database connection
4. Clear cache: `php artisan cache:clear`

### API 404 Errors

1. Check routes are loaded
2. Verify service provider is registered
3. Check middleware configuration

### Search Not Working

1. Ensure full-text search is enabled
2. Check locale is set correctly
3. Verify search terms match question or answer

---

## 📊 Analytics

### FAQ Statistics

```php
$stats = [
    'total_faqs' => Faq::active()->count(),
    'total_views' => Faq::active()->sum('views'),
    'total_helpful' => Faq::active()->sum('helpful_count'),
    'total_not_helpful' => Faq::active()->sum('not_helpful_count'),
];
```

### Ticket Statistics

```php
$stats = [
    'open_tickets' => SupportTicket::open()->count(),
    'resolved_tickets' => SupportTicket::resolved()->count(),
    'total_tickets' => SupportTicket::count(),
];
```

---

## 🔄 Maintenance

### Backup Data

```bash
php artisan backup:run
```

### Clear Old Tickets

```bash
php artisan support:cleanup-tickets --days=30
```

### Generate Reports

```bash
php artisan support:generate-reports
```

---

## 📞 Support

For questions or issues with the support system:

1. Check documentation files
2. Review API endpoints
3. Check database schema
4. Verify permissions
5. Check browser console for errors

---

**Last Updated:** August 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
