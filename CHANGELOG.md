# Changelog - RK Coaching LMS

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-06-29
### Added
- Integrated **Official Razorpay Checkout SDK** (`v1/checkout.js`) with dynamic script loader on client mount.
- Implemented **Strict UPI-Only Layout Preference filters** (`config.display`) in Razorpay options to hide Cards/Netbanking/Wallets, exposing only GPay, PhonePe, Paytm, BHIM, and UPI ID as requested.
- Implemented `/public/robots.txt` and `/public/sitemap.xml` for production crawling.
- Added comprehensive SEO optimizations in `/index.html`, including custom Meta tags, OpenGraph properties, Twitter Cards, and schema.org structure (EducationalOrganization).
- Created production documentation: `DEPLOYMENT.md`, `ADMIN_GUIDE.md`, `TEACHER_GUIDE.md`.

### Fixed
- Fixed typescript types in `src/views/admin/Dashboard.tsx` specifically around `Button` sizes (`sm` instead of invalid `xs`) and imported missing `Printer` icon.
- Enhanced layout responsiveness across extreme viewport breakpoints (320px up to 1440px), safeguarding grid views, modals, splitscreen dividers, and overflow containers.

---

## [1.1.0] - 2026-06-25
### Added
- Created **Interactive Quiz Module**: supports timed attempts, automatic grade/score cards, and progress synchronization.
- Created **Live Student Leaderboard**: Global and Class ranking cards, tracking total completed lessons and current daily study streaks.
- Created **Admin Settings Panel**: configured to manage business details, support parameters, Razorpay Keys, database checkups, and course transaction refund routers.
- Created **Invoices and PDF Receipts Drawer**: allows student billing search, receipt compilation, and instant hardcopy prints.

---

## [1.0.0] - 2026-06-18
### Added
- Established core LMS layout: Class catalog views, subject summary tracks, lesson player splitscreen docks.
- Built synchronized Supabase database clients with auto fallback to offline reactive state-store.
- Created multi-role routing structures (Visitor, Student, Teacher, Admin).
