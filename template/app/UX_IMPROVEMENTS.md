# Depaxiom SaaS - UX Improvements

**Created:** January 17, 2026
**Status:** In Progress

---

## Critical Priority

### 1. [x] Fix Login Page Dark Mode
**File:** `src/auth/AuthPageLayout.tsx`

**Issue:** Login form has hardcoded white background in dark mode:
```tsx
<div className="bg-white ... dark:bg-white dark:text-gray-900">
```

**Fix:** Replace with design tokens:
```tsx
<div className="bg-background border border-border px-4 py-8 shadow-xl sm:rounded-lg sm:px-10">
```

---

### 2. [x] Replace Native confirm() with AlertDialog
**File:** `src/user/AccountPage.tsx` (line 132)

**Issue:** Native browser `confirm()` doesn't match design system and provides poor mobile UX.

**Fix:** Use shadcn AlertDialog component for revoke confirmation.

---

### 3. [x] Add API Key Usage Documentation
**File:** `src/user/AccountPage.tsx`

**Issue:** Users don't know what API keys are for or how to use them.

**Fix:** Update CardDescription:
```tsx
<CardDescription>
  Create and manage API keys to access the Depaxiom API programmatically.
  Use keys in GitHub Actions, CI/CD pipelines, or direct API calls.
  <a href="/docs/api" className="text-primary hover:underline ml-1">
    View API Documentation →
  </a>
</CardDescription>
```

---

## High Priority

### 4. [x] Standardize Footer Colors
**File:** `src/landing-page/components/Footer.tsx`

**Issue:** Uses hardcoded colors instead of design tokens:
- `dark:bg-boxdark-2` (undefined)
- `border-gray-900/10 ... dark:border-gray-200/10`
- `text-gray-900 dark:text-white`

**Fix:** Replace with `bg-background`, `border-border`, `text-foreground`.

---

### 5. [x] Security Docs - URL Hash Support
**File:** `src/docs/SecurityTerminologyPage.tsx`

**Issue:** Can't bookmark specific sections, URL doesn't update.

**Fix:** Add hash routing:
```tsx
useEffect(() => {
  const hash = window.location.hash.slice(1);
  if (hash) setExpandedSection(hash);
}, []);

useEffect(() => {
  if (expandedSection) {
    window.history.replaceState(null, '', `#${expandedSection}`);
  }
}, [expandedSection]);
```

---

### 6. [ ] Security Docs - Syntax Highlighting
**File:** `src/docs/SecurityTerminologyPage.tsx`

**Issue:** Code examples are plain text, no syntax highlighting.

**Fix:** Add syntax highlighting library (react-syntax-highlighter or similar).

---

### 7. [x] Security Docs - Collapse All by Default
**File:** `src/docs/SecurityTerminologyPage.tsx` (line 427)

**Issue:** First section starts expanded, overwhelming users.

**Fix:** Change default state:
```tsx
const [expandedSection, setExpandedSection] = useState<string | null>(null);
```

---

### 8. [x] Pricing Page - Add Trial Details
**File:** `src/payment/PricingPage.tsx`

**Issue:** "Start Pro Trial" CTA doesn't explain trial length or terms.

**Fix:** Add trial info below CTA:
```tsx
<p className="text-xs text-muted-foreground mt-2">
  14-day free trial. No credit card required.
</p>
```

---

## Medium Priority

### 9. [x] API Key Name Validation
**File:** `src/user/AccountPage.tsx`

**Issue:** No character limits or validation on key names.

**Fix:** Add validation (max 50 chars, alphanumeric + spaces/hyphens/underscores).

---

### 10. [ ] API Keys - Mobile Layout
**File:** `src/user/AccountPage.tsx`

**Issue:** Metadata stacks vertically on mobile, creating tall cards.

**Fix:** Use responsive grid for metadata.

---

### 11. [x] API Keys - Loading Skeletons
**File:** `src/user/AccountPage.tsx`

**Issue:** Only shows "Loading API keys..." text, no visual skeleton.

**Fix:** Add skeleton loaders for better perceived performance.

---

### 12. [ ] Add Breadcrumb Navigation
**File:** `src/docs/SecurityTerminologyPage.tsx`

**Issue:** No wayfinding on deep pages.

**Fix:** Add breadcrumbs: Home > Docs > Security Terminology

---

### 13. [ ] Pricing - Contact Form for Business Tier
**File:** `src/payment/PricingPage.tsx`

**Issue:** Business tier uses `mailto:` which fails without email client.

**Fix:** Create contact form modal or dedicated page.

---

### 14. [ ] Pricing - Feature Comparison Table
**File:** `src/payment/PricingPage.tsx`

**Issue:** Users must mentally compare features across tiers.

**Fix:** Add expandable comparison table.

---

### 15. [x] Credits Tooltip
**File:** `src/user/AccountPage.tsx`

**Issue:** No explanation of what credits are or how they work.

**Fix:** Add info tooltip explaining credit usage and reset schedule.

---

### 16. [x] API Keys - ARIA Labels
**File:** `src/user/AccountPage.tsx`

**Issue:** Warning banner lacks proper accessibility attributes.

**Fix:** Add `role="alert"` and `aria-live="polite"` to new key warning.

---

## Low Priority

### 17. [x] Empty State Illustration
**File:** `src/user/AccountPage.tsx`

**Issue:** Plain text empty state is uninspiring.

**Fix:** Add Key icon above empty state text.

---

### 18. [ ] Hero Stats Mobile Layout
**File:** `src/landing-page/components/Hero.tsx`

**Issue:** 2x2 grid on mobile may be hard to scan.

**Fix:** Consider 1-column layout on smallest screens.

---

### 19. [ ] Security Docs - Mobile Navigation
**File:** `src/docs/SecurityTerminologyPage.tsx`

**Issue:** 6 navigation buttons stack vertically on mobile.

**Fix:** Consider dropdown selector on mobile.

---

### 20. [ ] Lazy Load Docs Content
**File:** `src/docs/SecurityTerminologyPage.tsx`

**Issue:** 550+ line data object bloats bundle for all users.

**Fix:** Extract to separate file and lazy load.

---

## Completed

_Items will be moved here as they are finished._

---

## Notes

- Design system uses HSL color tokens in `src/client/Main.css`
- UI components from shadcn/ui in `src/client/components/ui/`
- Mobile breakpoints: sm (640px), md (768px), lg (1024px)
