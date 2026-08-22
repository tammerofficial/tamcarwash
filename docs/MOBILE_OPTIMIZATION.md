# Mobile Optimization Guide

## Overview
This document outlines the mobile-first responsive design approach for the Tam Car Wash system across all platforms:
- **Staff Dashboard** - Workers, cashiers, managers on iPhones/Android
- **Tenant Dashboard** - Business owners checking on mobile
- **Customer Portal** - End-users viewing bookings, queue status
- **Booking Interface** - Mobile booking experience
- **Queue Display** - Real-time queue on mobile screens

## Responsive Breakpoints

All layouts follow Tailwind CSS mobile-first approach:

```
xs:  320px   - Extra small phones (iPhone SE, older Android)
sm:  640px   - Standard phones (iPhone 12/13/14, modern Android)
md:  768px   - Tablets (iPad, large phones)
lg:  1024px  - Small laptops, landscape tablets
xl:  1280px  - Standard desktops
2xl: 1536px  - Large monitors
```

### Mobile Strategy

1. **Design Mobile First**: Start with `mobile` (no breakpoint prefix) then enhance
2. **Test Sizes**: Specifically test at `320px`, `480px`, `640px`, `768px`, `1024px+`
3. **Touch First**: Assume touch input on mobile - minimum 48x48px targets

## Touch Target Sizing

All interactive elements must meet Apple & Android guidelines:

- **Minimum Safe**: 44x44px (11mm)
- **Recommended**: 48x48px (12mm)
- **Comfortable**: 56x56px (14mm) for high-use elements

Example using Tailwind utilities:
```tsx
// Using touch-target class (48x48px minimum)
<Button className="touch-target">Action</Button>

// Using touch-target-sm (44x44px minimum)
<Button className="touch-target-sm">Secondary</Button>

// Using min-h and min-w utilities
<button className="min-h-12 min-w-12 px-4 py-3">Flexible size</button>
```

## Layout Patterns

### Main Container
```tsx
<main className="flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-7 lg:py-6">
  <div className="mx-auto w-full max-w-[1600px]">
    {/* Content */}
  </div>
</main>
```

Mobile padding: `12px` (px-3)
Tablet padding: `16px` (sm:px-4)
Desktop padding: `28px` (lg:px-7)

### Form Grid (Responsive Columns)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
  {/* Form fields */}
</div>
```

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

### Tables (Scrollable on Mobile)
```tsx
<div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-7">
  <div className="inline-block min-w-full px-3 sm:px-4 lg:px-7">
    <table>{/* Content */}</table>
  </div>
</div>
```

## Component Responsive Sizes

### Buttons & Links
```
Mobile:   min-h-11 to min-h-12 (44-48px)
Tablet:   min-h-10 to min-h-11 (40-44px)
Desktop:  min-h-10 (40px)
```

### Font Sizes
```
Mobile headings:   text-xl to text-2xl (20-24px)
Mobile body:       text-base to text-lg (16-18px)
Mobile labels:     text-sm (14px)
Mobile captions:   text-xs (12px)

Tablet headings:   text-2xl to text-3xl
Tablet body:       text-lg
Tablet labels:     text-base
```

### Icons
```
Mobile action icons:    h-5 w-5 (20px)
Mobile decorative:      h-4 w-4 (16px)
Tablet/Desktop:         h-5 w-5 to h-6 w-6
```

### Spacing (Gaps & Padding)
```
Mobile:   gap-2 to gap-3, px-3 py-3
Tablet:   gap-3 to gap-4, px-4 py-4
Desktop:  gap-4 to gap-6, px-6 py-6+
```

## Navigation

### Header (Fixed)
- Mobile height: `3.75rem` (60px)
- Tablet/Desktop: `4.25rem` (68px)
- Always includes hamburger menu on mobile (hidden on lg:)

### Sidebar (Mobile Drawer)
- Mobile: Full-screen overlay drawer from right (RTL)
- Tablet/Desktop (lg:): Fixed sidebar `w-72` (288px)
- Collapsible state on desktop

### Mobile Navigation Drawer
```tsx
// Structure in AppShell
<div className="lg:hidden">
  {/* Mobile sidebar overlay */}
  <Sidebar collapsed={false} />
</div>
```

## Specific Page Optimizations

### Dashboard Page
- **Mobile**: Stacked stat cards, single-column layout
- **Tablet**: 2-column grid for stat cards
- **Desktop**: 4-column grid for stat cards
- Charts: Responsive with `<ResponsiveContainer width="100%">`

### Queue Display
- **Mobile**: Full-width numbers, easy-to-tap buttons
- **Tablet**: Side-by-side queue + actions
- **Desktop**: Multi-panel layout with details

### Booking Interface
- **Mobile**: Single-column form, large inputs (min-h-11)
- **Tablet**: 2-column form where logical
- **Desktop**: 3-column with sidebars

### Data Tables
- **Mobile**: 
  - Horizontal scroll for tables
  - Card view alternative (stacked rows)
  - Collapsible rows with details
- **Tablet**: Scrollable table, start showing more columns
- **Desktop**: Full table display

## Mobile Testing Checklist

### Device Sizes
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12 mini)
- [ ] 390px (iPhone 14)
- [ ] 480px (Android phones)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro / Laptop)

### Visual Tests
- [ ] No horizontal scrolling on mobile
- [ ] Text is readable (minimum 14px on mobile)
- [ ] All buttons/taps are at least 44x44px
- [ ] Images scale properly (not stretched/cut off)
- [ ] Spacing is consistent
- [ ] Alignment works in RTL

### Functional Tests
- [ ] Forms submit on mobile
- [ ] Touch gestures work (swipe, tap)
- [ ] Modals don't overflow screen
- [ ] Keyboard doesn't hide inputs (iOS)
- [ ] All navigation is accessible
- [ ] Performance is acceptable (<3s load)

### Browser Testing
- [ ] Chrome mobile DevTools
- [ ] Firefox mobile DevTools
- [ ] Safari (iOS) in Simulator
- [ ] Real devices when possible

## Accessibility on Mobile

- Touch targets: minimum 48x48px
- Color contrast: still WCAG AA minimum
- Text: no tiny fonts (<12px)
- Spacing: adequate padding for thumb reach
- Keyboard: still accessible for those using keyboard + AT
- Screen readers: still functional

## Image Optimization for Mobile

### Guidelines
- Use `next-gen` formats: WebP, AVIF
- Serve different sizes: `srcset` attribute
- Lazy load off-screen images
- Optimize PNG/JPG at upload

Example:
```tsx
<img
  src="/image-mobile.jpg"
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
  srcSet="
    /image-mobile-320w.jpg 320w,
    /image-mobile-640w.jpg 640w,
    /image-full.jpg 1200w
  "
/>
```

### Responsive Image Sizes
```css
/* Mobile */
@media (max-width: 640px) {
  .hero-image { max-width: 100%; height: auto; }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .hero-image { max-width: 100%; height: auto; }
}

/* Desktop */
@media (min-width: 1025px) {
  .hero-image { max-width: 1000px; }
}
```

## Common Pitfalls

❌ **Don't:**
- Use fixed widths (e.g., `w-[400px]`)
- Set font sizes smaller than 12px on mobile
- Assume hover state (no hover on touch devices)
- Create touch targets smaller than 44x44px
- Hide essential features on mobile
- Overflow content beyond viewport width

✅ **Do:**
- Use responsive utilities (`sm:`, `md:`, `lg:`)
- Scale down gracefully on small screens
- Use active/focus states instead of hover
- Test on actual mobile devices
- Stack content vertically on mobile
- Use `overflow-x-auto` for unavoidable horizontal content

## Implementation Checklist

After adding/modifying any page or component:

- [ ] Mobile breakpoints added (xs, sm, md, lg, xl)
- [ ] Touch targets are at least 44x44px
- [ ] Font sizes are readable on mobile (12px minimum)
- [ ] No horizontal scrolling at 320px
- [ ] Forms are single-column on mobile
- [ ] Padding adjusts per breakpoint
- [ ] Images scale responsively
- [ ] Navigation is accessible on mobile
- [ ] Tested in DevTools at 320px and 768px
- [ ] All buttons/links work with touch
- [ ] No layout shifts when zoomed in

## Component Usage Examples

### Using MobileOptimized Components
```tsx
import {
  ResponsiveTable,
  ResponsiveFormGrid,
  TouchButton,
  ResponsiveCard,
  CollapsibleSection,
  MobileHorizontalScroll,
} from '@/components/mobile/MobileOptimized';

// Responsive table
<ResponsiveTable>
  <tbody>{/* Rows */}</tbody>
</ResponsiveTable>

// Responsive form
<ResponsiveFormGrid cols={2}>
  <input type="text" />
  <input type="email" />
</ResponsiveFormGrid>

// Touch-friendly button
<TouchButton>Submit</TouchButton>

// Collapsible section (mobile-friendly)
<CollapsibleSection title="Advanced Filters">
  {/* Filters */}
</CollapsibleSection>
```

## Performance Considerations

Mobile optimization also means performance:

1. **Code Splitting**: Load features on demand
2. **Lazy Loading**: Images, components below fold
3. **Minimize CSS**: Unused styles removed in production
4. **Cache**: Browser cache for static assets
5. **Network**: Reduce API calls, optimize payloads
6. **Bundle Size**: Tree-shake unused utilities

Run build check:
```bash
npm run build
# Verify no errors and check bundle size
```

## Deployment & Monitoring

After mobile optimization:

1. Deploy to production
2. Test on real mobile devices
3. Monitor:
   - Core Web Vitals (LCP, CLS, FID)
   - Mobile viewport conversion rates
   - Error rates on mobile
4. Iterate based on user feedback

## Questions?

Refer to:
- Tailwind CSS docs: https://tailwindcss.com/docs/responsive-design
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- WebAIM: https://webaim.org/articles/screenreader/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Material Design: https://material.io/design/platform-guidance/android-bars.html
