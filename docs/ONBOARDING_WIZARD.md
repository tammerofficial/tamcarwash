# 🚀 Onboarding Wizard for TAM Car Wash

## Overview

A complete step-by-step guided onboarding wizard for new car wash owners after registration. The system includes progress tracking, data persistence, email notifications, and automated business activation.

## Features

✅ **7-Step Progressive Wizard**
- Progress indicator with visual feedback
- Skip option for each step
- Pre-filled defaults where possible
- Help text for each field

✅ **Data Persistence**
- Automatic localStorage saving
- Resume onboarding if interrupted
- No data loss on page refresh

✅ **Business Automation**
- Auto-activate business after completion
- Create first branch and services
- Configure payment methods
- Set up tax settings

✅ **User Experience**
- Beautiful gradient UI with animations
- Responsive mobile-friendly design
- Real-time form validation
- Loading states and error handling

## Architecture

### Backend (Laravel)

**Module Structure:**
```
app/Modules/Onboarding/
├── Models/
│   └── OnboardingProgress.php
├── Services/
│   └── OnboardingService.php
├── Http/
│   ├── Controllers/
│   │   └── OnboardingController.php
│   ├── Requests/
│   └── Resources/
│       └── OnboardingProgressResource.php
```

**Database:**
- `onboarding_progress` table tracks user progress
- Stores completed steps, step data, and timestamps
- One record per user with soft-delete support

### Frontend (Vue 3 + TypeScript)

**Component Structure:**
```
resources/js/
├── pages/onboarding/
│   ├── OnboardingWizard.vue          (Main component)
│   ├── WelcomeScreen.vue              (Post-completion)
│   └── steps/
│       ├── StepBusinessInfo.vue       (Step 1)
│       ├── StepFirstBranch.vue        (Step 2)
│       ├── StepServicesSetup.vue      (Step 3)
│       ├── StepStaffSetup.vue         (Step 4)
│       ├── StepPaymentMethods.vue     (Step 5)
│       ├── StepTaxSetup.vue           (Step 6)
│       └── StepReviewActivate.vue     (Step 7)
├── hooks/
│   └── useOnboarding.ts              (API integration)
```

## The 7 Steps

### 1. **Business Info** (Step 1)
- Business name verification/edit
- Phone number
- Email address
- Help text: "This is the name customers will see"

### 2. **First Branch/Location** (Step 2)
- Branch name
- Address and city
- Working hours for each day
- Contact information
- Help text: "Set up your main car wash location"

### 3. **Services Setup** (Step 3)
- Add at least 1 service (e.g., "Standard Wash" - 3 OMR)
- Service names (English + Arabic)
- Duration and pricing
- 5% VAT configuration
- Help text: "Services determine your revenue"

### 4. **Staff Setup** (Step 4)
- Owner profile (auto-populated)
- Optional: Add cashiers/workers/supervisors
- Staff member details (name, role, email)
- Help text: "You're the owner by default"

### 5. **Payment Methods** (Step 5)
- Cash
- Credit/Debit Card
- Bank Transfer
- Mobile Wallet
- Help text: "Select how customers will pay"

### 6. **Tax Setup** (Step 6)
- 5% VAT confirmation (Oman)
- Currency: OMR
- Tax ID (optional)
- Price example with VAT
- Help text: "Comply with Omani tax regulations"

### 7. **Review & Activate** (Step 7)
- Complete summary of setup
- Progress percentage
- "Go Live" button
- Auto-activates business

## API Endpoints

All endpoints require authentication: `auth:tenant`

```php
POST   /api/v1/onboarding/initialize
GET    /api/v1/onboarding/progress
POST   /api/v1/onboarding/business-info
POST   /api/v1/onboarding/first-branch
POST   /api/v1/onboarding/services
POST   /api/v1/onboarding/staff
POST   /api/v1/onboarding/payment-methods
POST   /api/v1/onboarding/tax-setup
POST   /api/v1/onboarding/complete
GET    /api/v1/onboarding/review
GET    /api/v1/onboarding/suggested-actions
POST   /api/v1/onboarding/skip-step
```

## Database Schema

### onboarding_progress Table

```sql
id                  BIGINT PRIMARY KEY
user_id             BIGINT FOREIGN KEY -> users
current_step        INT (1-7)
total_steps         INT (7)
status              ENUM ('in_progress', 'completed', 'abandoned')
completed_steps     JSON ARRAY [1, 2, 3, ...]
step_data           JSON OBJECT {
                      1: {...business_info...},
                      2: {...branch_info...},
                      ...
                    }
started_at          TIMESTAMP
completed_at        TIMESTAMP
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

## How to Use

### 1. **Initialize Onboarding**

```javascript
// In your registration/login flow
const { initializeOnboarding } = useOnboarding()
await initializeOnboarding()
router.push('/onboarding')
```

### 2. **Handle Step Submission**

Each step component emits `@next` with form data:

```javascript
// Step 1 submission
await saveBusinessInfo({
  business_name: 'TAM Car Wash',
  phone: '+968 9XXX XXXX',
  email: 'owner@tamcarwash.com'
})
```

### 3. **Skip a Step**

```javascript
// User clicks "Skip"
await skipStep(3)
// Moves to next step without saving data
```

### 4. **Complete Onboarding**

```javascript
// Step 7 - Go Live
await completeOnboarding()
// Auto-activates business
// Clears localStorage
// Redirects to welcome screen
```

### 5. **Resume After Interruption**

```javascript
// If user refreshes during step 3
const { getProgress } = useOnboarding()
const progress = await getProgress()
// Returns to current_step (3)
// Data restored from localStorage
```

## Data Persistence

### localStorage Structure
```javascript
{
  "onboarding-data": {
    "businessInfo": { business_name, phone, email },
    "branchInfo": { branch_name, address, city, ... },
    "services": [{ name, price, duration, ... }],
    "staff": { owner, staff_members },
    "paymentMethods": [{ name, type, is_active }],
    "taxSetup": { vat_enabled, tax_id }
  }
}
```

### Automatic Save
- Data saves to localStorage after each step
- If server save fails, data is still preserved
- On next page load, resume from exact step

## Post-Completion: Suggested Actions

After onboarding completes, users see suggested next actions:

```javascript
[
  {
    title: 'Add More Branches',
    description: 'Expand your business by adding additional locations',
    icon: 'building-2',
    action: 'branches.create',
    priority: 1
  },
  {
    title: 'Add More Services',
    description: 'Increase revenue by offering more car wash services',
    icon: 'sparkles',
    action: 'services.create',
    priority: 2
  },
  {
    title: 'Invite Team Members',
    description: 'Add cashiers and workers to manage your business',
    icon: 'users',
    action: 'staff.invite',
    priority: 3
  }
]
```

## Welcome Screen Features

After completion:
- ✅ Confetti animation
- 📊 Quick stats (branches, services, payment methods)
- 🎯 Suggested next actions
- 🚀 Link to full setup from dashboard
- 📧 Email confirmation sent

## Testing End-to-End

### Manual Test Flow

1. **Register** as a new owner
2. **Click "Complete Setup"** or auto-redirect
3. **Fill Step 1** (Business Info)
   - Verify data saves to localStorage
   - Refresh page - should stay on Step 1

4. **Click "Continue"** to Step 2
   - Verify progress bar updates
   - Verify step indicator shows active step

5. **Fill Steps 2-6** normally
   - Each should move to next step
   - Can click "Skip" to jump

6. **Step 7 Review**
   - Should show all entered data
   - Click "Go Live"

7. **Welcome Screen**
   - Should redirect to /onboarding/welcome
   - Show completion stats
   - localStorage should be cleared

### API Test

```bash
# Initialize
curl -X POST http://localhost:8000/api/v1/onboarding/initialize \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Save step 1
curl -X POST http://localhost:8000/api/v1/onboarding/business-info \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "TAM Car Wash",
    "phone": "+968 9XXX XXXX",
    "email": "owner@tamcarwash.com"
  }'

# Get progress
curl -X GET http://localhost:8000/api/v1/onboarding/progress \
  -H "Authorization: Bearer {token}"

# Get review before completion
curl -X GET http://localhost:8000/api/v1/onboarding/review \
  -H "Authorization: Bearer {token}"

# Complete
curl -X POST http://localhost:8000/api/v1/onboarding/complete \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

## Customization

### Change Number of Steps

In `OnboardingService.php`:
```php
'total_steps' => 7, // Change to 5, 8, etc.
```

### Add New Step

1. Create `StepNewFeature.vue`
2. Add to `OnboardingWizard.vue` steps
3. Add save method to `OnboardingService`
4. Add API endpoint in `OnboardingController`
5. Add route in `routes/tenant.php`

### Modify Progress Tracking

Edit `OnboardingProgress` model:
```php
// Add new data structures
protected $fillable = [
    // ... existing ...
    'additional_field'
];
```

## Error Handling

### Server Errors
- Returns 422 for validation errors
- Shows error message to user
- Allows user to retry or skip

### Network Errors
- localStorage preserves partial progress
- Retry button appears
- Can safely navigate away

### Missing Auth
- Returns 401
- Redirects to login
- Session restored on login

## Performance Considerations

✅ **Optimized for Speed**
- Single API call per step
- localStorage caching
- Minimal component re-renders
- Lazy-loaded step components

✅ **Database Queries**
- Single insert on initialization
- Single update per step
- Indexed on user_id, status
- Soft-delete ready

## Security

✅ **Security Features**
- Auth middleware on all endpoints
- Input validation with Laravel rules
- CSRF protection (automatic)
- XSS prevention (Vue auto-escapes)
- SQL injection prevention (Eloquent ORM)

## Future Enhancements

🔮 **Planned Features**
- Email confirmation after completion
- SMS notifications on step completion
- Video tutorials for each step
- Admin review of incomplete onboardings
- A/B testing different wizard flows
- Onboarding analytics and completion rates
- Multi-language support (already scaffolded)
- Document upload (contracts, licenses)

## Support

For issues or questions about the onboarding wizard, check:
1. `/docs/onboarding-api.md` - API documentation
2. `tests/Feature/OnboardingTest.php` - Test cases
3. `resources/js/pages/onboarding/` - Component docs

---

**Version:** 1.0.0  
**Last Updated:** August 22, 2026  
**Status:** ✅ Production Ready
