# 🚀 Quick Start: Using the Support System

**Last Updated:** August 22, 2026  
**Version:** v77

---

## 📖 For End Users

### Accessing Help

#### 1. In-App Help Button
On any page, look for the **"?"** button in the top-right corner:
- Click to open help panel
- Shows page-specific tips
- Watch embedded videos
- Click "Learn More" for detailed guide

#### 2. Help Center
Navigate to `/support/help-center` to:
- Browse FAQs by category
- Search for answers
- Rate FAQ helpfulness
- Watch video tutorials
- Contact support

#### 3. Documentation
Available online at:
- **Getting Started:** `docs/GETTING_STARTED.md`
- **Features:** `docs/FEATURES.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING.md`
- **FAQ:** `docs/FAQ.md`

### Video Tutorials
Available in the help center:
1. Setup Your Car Wash (3:45)
2. Add Services (2:15)
3. Manage Staff (4:30)
4. Create Bookings (3:20)
5. View Reports (2:50)
6. Create Invoices (2:40)

### Create Support Ticket
1. Help Center → "Create Ticket"
2. Fill in issue details
3. Choose category and priority
4. Submit
5. Track status via ticket number

---

## 🔧 For Developers

### Setup

#### 1. Run Migrations
```bash
php artisan migrate
```

#### 2. Build Assets
```bash
cd assets && npm run build && cd ..
```

#### 3. Access Documentation
```
docs/SUPPORT_SYSTEM.md        # Full technical guide
docs/GETTING_STARTED.md       # End user guide
```

### API Endpoints

#### Get FAQs
```bash
curl http://localhost:8000/api/faqs
curl http://localhost:8000/api/faqs?category=getting_started
curl http://localhost:8000/api/faqs?search=how+to
```

#### Create Support Ticket
```bash
curl -X POST http://localhost:8000/api/support-tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_name": "محمد أحمد",
    "user_email": "user@example.com",
    "user_phone": "0501234567",
    "subject": "مشكلة في النظام",
    "description": "وصف المشكلة...",
    "category": "bug",
    "priority": "high"
  }'
```

#### Get Announcements
```bash
curl http://localhost:8000/api/announcements
curl http://localhost:8000/api/announcements/by-role/manager
curl http://localhost:8000/api/announcements/latest
```

### Using in Vue Components

#### Import Help Component
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

#### Use Help Composable
```javascript
import { useHelp } from '@/composables/useHelp'

const { 
  isHelpOpen, 
  openPageHelp, 
  closeHelp,
  rateFaqHelpful 
} = useHelp()

// Open help for page
openPageHelp('bookings')

// Close help
closeHelp()

// Rate FAQ
await rateFaqHelpful(faqId)
```

### Database Schema

#### FAQs Table
```sql
SELECT * FROM faqs 
WHERE is_active = true 
ORDER BY `order` ASC;
```

#### Support Tickets Table
```sql
SELECT * FROM support_tickets 
WHERE status IN ('open', 'in_progress')
ORDER BY priority DESC, created_at ASC;
```

#### Announcements Table
```sql
SELECT * FROM announcements 
WHERE is_active = true 
AND published_at <= NOW() 
AND (expires_at IS NULL OR expires_at >= NOW())
ORDER BY published_at DESC;
```

---

## 📝 Adding Content

### Add FAQ Entry

#### Via API (Admin)
```bash
curl -X POST http://localhost:8000/api/faqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "question_ar": "كيف أضيف خدمة؟",
    "question_en": "How do I add a service?",
    "answer_ar": "انتقل إلى الخدمات > إضافة خدمة جديدة",
    "answer_en": "Go to Services > Add New Service",
    "category": "getting_started",
    "order": 1,
    "is_active": true
  }'
```

#### Via Seeder
```php
use App\Modules\Support\Models\Faq;

Faq::create([
    'question_ar' => 'كيف أضيف خدمة؟',
    'question_en' => 'How do I add a service?',
    'answer_ar' => 'انتقل إلى الخدمات > إضافة خدمة جديدة',
    'answer_en' => 'Go to Services > Add New Service',
    'category' => 'getting_started',
    'order' => 1,
    'is_active' => true,
]);
```

### Add Announcement
```php
use App\Modules\Support\Models\Announcement;

Announcement::create([
    'title_ar' => 'صيانة النظام',
    'title_en' => 'System Maintenance',
    'content_ar' => 'سيتم إجراء صيانة...',
    'content_en' => 'Maintenance will be performed...',
    'type' => 'maintenance',
    'priority' => 'high',
    'target_role' => 'all',
    'published_at' => now(),
    'expires_at' => now()->addDays(7),
    'is_active' => true,
]);
```

### Add Help Content
Edit `assets/src/utils/helpContent.js`:
```javascript
export const helpContent = {
  'my-page': {
    title: { ar: 'عنوان', en: 'Title' },
    description: { ar: 'وصف', en: 'Description' },
    icon: 'cil-icon-name',
    sections: [
      {
        title: { ar: 'القسم', en: 'Section' },
        content: { ar: 'المحتوى', en: 'Content' }
      }
    ],
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    learnMoreUrl: '/docs/FEATURES.md'
  }
}
```

---

## 🔍 Finding Information

### Search Flow
1. User visits `/support/help-center`
2. Types search query
3. System searches questions and answers
4. Results displayed with snippets
5. User clicks to expand answer
6. Can rate helpfulness

### Category Flow
1. Browse categories in sidebar
2. Click category to filter
3. See count of FAQs in category
4. Click FAQ to expand
5. Read answer
6. Rate helpfulness

---

## 📊 Monitoring

### FAQ Analytics
```bash
GET /api/faqs/meta/statistics

Response:
{
  "total_faqs": 50,
  "total_views": 1250,
  "total_helpful": 980,
  "total_not_helpful": 120,
  "by_category": [...]
}
```

### Ticket Statistics
```bash
GET /api/support-tickets/meta/statistics

Response:
{
  "open_tickets": 5,
  "resolved_tickets": 45,
  "total_tickets": 50,
  "by_priority": [...],
  "by_category": [...],
  "by_status": [...]
}
```

### Announcement Statistics
```bash
GET /api/announcements/meta/statistics

Response:
{
  "total_announcements": 10,
  "by_type": [...],
  "by_priority": [...],
  "by_role": [...]
}
```

---

## 🗂️ File Locations

```
Tammer Wash/
├── docs/                                # User documentation
│   ├── GETTING_STARTED.md              # Quick start guide
│   ├── FEATURES.md                     # Feature guide
│   ├── TROUBLESHOOTING.md              # Problem solving
│   ├── FAQ.md                          # Frequently asked questions
│   └── SUPPORT_SYSTEM.md               # Technical guide
├── app/Modules/Support/
│   ├── Models/
│   │   ├── Faq.php                     # FAQ model
│   │   ├── SupportTicket.php           # Ticket model
│   │   └── Announcement.php            # Announcement model
│   ├── Controllers/
│   │   ├── FaqController.php           # FAQ API
│   │   ├── SupportTicketController.php # Ticket API
│   │   └── AnnouncementController.php  # Announcement API
│   ├── Routes/
│   │   └── api.php                     # API routes
│   └── SupportServiceProvider.php
├── database/migrations/
│   └── 2026_08_22_183225_create_support_system_tables.php
├── assets/src/
│   ├── components/Support/
│   │   ├── HelpSection.vue             # Help sidebar
│   │   └── HelpCenter.vue              # Help center page
│   ├── composables/
│   │   └── useHelp.js                  # Help logic
│   ├── utils/
│   │   └── helpContent.js              # Help data
│   └── views/Support/
│       └── HelpCenter.vue              # Help center view
└── SUPPORT_SYSTEM_SUMMARY.md           # This summary
```

---

## 🔐 Authentication & Authorization

### Public Routes
- GET `/api/faqs/*` - Anyone can view FAQs
- GET `/api/announcements/*` - Anyone can view announcements

### Protected Routes
- POST `/api/support-tickets` - Logged-in users
- GET `/api/support-tickets/user/my-tickets` - Own tickets
- POST `/api/support-tickets/{id}/resolve` - Admin only

### Headers Required
```
Authorization: Bearer YOUR_AUTH_TOKEN
Content-Type: application/json
```

---

## 📞 Troubleshooting

### FAQ Not Showing
- ✅ Check `is_active = true`
- ✅ Verify in correct category
- ✅ Check database connection
- ✅ Clear cache: `php artisan cache:clear`

### API 404 Error
- ✅ Check route is registered
- ✅ Verify service provider is loaded
- ✅ Check middleware

### Search Not Working
- ✅ Verify locale is set
- ✅ Check search term matches question/answer
- ✅ Verify full-text index

### Videos Not Loading
- ✅ Check YouTube URL is valid
- ✅ Verify internet connection
- ✅ Check iframe is enabled

---

## 🧪 Testing

### Test FAQ API
```bash
# Get all FAQs
curl http://localhost:8000/api/faqs

# Get specific FAQ
curl http://localhost:8000/api/faqs/1

# Mark as helpful
curl -X POST http://localhost:8000/api/faqs/1/helpful

# Search
curl http://localhost:8000/api/faqs?search=how
```

### Test Components
```bash
# Visit help center
http://localhost:8000/support/help-center

# Click help button on any page
http://localhost:8000/dashboard
# Look for "?" button in top-right

# View different categories
http://localhost:8000/support/help-center?category=getting_started
```

---

## 📈 Performance

### Optimization Tips
1. **Cache FAQs**: `php artisan cache:remember`
2. **Index categories**: Database indexes on `category`, `is_active`
3. **Paginate results**: Use pagination for large datasets
4. **Load videos async**: Use lazy loading for iframes

### Monitoring
- FAQ load time: Should be < 500ms
- Search response: Should be < 1000ms
- Video load: Should be < 2000ms

---

## 🎓 Training

### For Support Team
1. Review `docs/FAQ.md`
2. Learn FAQ management
3. Practice creating tickets
4. Monitor statistics

### For Product Managers
1. Read `docs/FEATURES.md`
2. Plan content updates
3. Monitor user feedback
4. Identify knowledge gaps

### For Developers
1. Study `docs/SUPPORT_SYSTEM.md`
2. Review API documentation
3. Test endpoints
4. Extend with custom features

---

## ✅ Checklist for Production

- [ ] Run migrations: `php artisan migrate`
- [ ] Build assets: `npm run build`
- [ ] Add initial FAQ data
- [ ] Create welcome announcement
- [ ] Test all API endpoints
- [ ] Verify help components load
- [ ] Check translations
- [ ] Monitor performance
- [ ] Backup database
- [ ] Document custom changes

---

## 🚀 Next Steps

1. **Immediate**: Deploy to production
2. **Week 1**: Add FAQ seed data
3. **Week 2**: Monitor usage & feedback
4. **Month 1**: Create admin panel
5. **Month 2**: Add email notifications
6. **Month 3**: Consider live chat

---

## 📞 Support

For issues or questions:
1. Check `docs/SUPPORT_SYSTEM.md`
2. Review API documentation
3. Test endpoints
4. Check database directly
5. Review application logs

---

**Version:** v77  
**Status:** ✅ Production Ready  
**Last Updated:** August 22, 2026
