# RK Coaching LMS - Project Memory

## Completed Features
* **Dynamic Student Catalog Landing**: Connected home/landing page with Supabase queries for automated class-syllabus extraction and direct course enrollment/exploration.
* **Class Dashboard View**: Class 6, 7, 8, 9, 10, Class 11 (Science/Commerce/Arts), Class 12 (Science/Commerce/Arts), and NEET dashboard with subject guides, active student metrics, and learning modules count.
* **Subject Chapter Syllabus**: Displays available chapters, free lectures count, premium indicators, specific curriculum notes, and coordinator teacher biography.
* **Course Structure Details**: Real-time progress bar tracked dynamically, syllabus hierarchy of chapters & lessons, enrollment call-to-action (Secured free registration and official Razorpay checkout).
* **Responsive Study Player Deck**: Splitscreen double-deck with YouTube/Vimeo/Google Drive video lecture viewer, handwritten revision PDF preview with separate tab popout, previous/next lesson navigation, and manual mark-as-completed indicators.
* **Synchronized Bookmarks & Progress Engines**: Keeps bookmarks and watch percentages securely saved under real Supabase databases (with a clean localStorage fallback for guests).
* **Interactive Quizzes & Assessments**: Full chapter-wise interactive quiz module with timer controls, feedback indicators, automatic score calculation, and performance summaries.
* **Leaderboards & Streak Tracking**: Live interactive Global/Class leaderboards displaying student rankings, completed lessons, and study streak visualizers.
* **Official Razorpay UPI Checkout Gateway**: Official Razorpay SDK (`v1/checkout.js`) dynamic loading on client side with strict UPI-only layout block filters, paired with a resilient Sandbox simulator for isolated local environments.
* **Billing, Order Logs & Invoices Ledger**: Tracing billing order histories, verifying transactions, and compiling downloadable printable PDF receipts for unlocked classes.
* **Role-Based Admin Command Center**: Management panel supporting system variable settings (merchant keys, business profiles), database health diagnostics, class/subject/lesson creations, transactions log analytics, and instant refund systems.

## Key Core Components
* `/src/views/lms/ClassView.tsx` - Displays syllabus classes, core subject counts, and learning modules.
* `/src/views/lms/SubjectView.tsx` - Chapter-by-chapter curriculum list with lesson preview locks.
* `/src/views/lms/CourseView.tsx` - Detailed course timeline and enrollment checkout trigger.
* `/src/views/lms/LessonView.tsx` - Full splitscreen double-deck study viewer with video speed toggles & PDF printer.
* `/src/components/commerce/RazorpayGatewayModal.tsx` - Official Razorpay dynamic script launcher with strict UPI layout block.
* `/src/views/student/PurchasesInvoices.tsx` - Student payment ledgers and receipt compiler.
* `/src/views/admin/Dashboard.tsx` - System health checker, settings configurator, creation forms, transactions, and refunds dashboard.

## Database & Persistence Architecture
* **Tables Synced**: `classes`, `subjects`, `chapters`, `lessons`, `videos`, `notes`, `orders`, `payments`, `bookmarks`, `user_progress`, `quizzes`, `quiz_attempts`, `system_settings`.
* **RLS Policies**: Secure row-level-security configurations safeguarding billing tables, progress meters, and teacher access profiles under Supabase PostgreSQL rules.

---
**Production Verification Completed - 100% Core Coverage**

