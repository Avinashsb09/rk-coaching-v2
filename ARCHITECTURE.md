# RK Coaching LMS - Production Architecture & Database Blueprint

Welcome to the comprehensive, production-ready system architecture and database design for **RK Coaching LMS**. This blueprint has been updated to support a 100% serverless, free-tier-aligned model, structuring all schemas, layouts, routes, and components for Class 6-12 & NEET preparation.

---

## 1. Production Architecture (React 19 + Supabase Serverless)

To achieve maximum performance and stability under Vercel / Cloud Run and Supabase free tiers, we utilize a unified, high-performance single-page application (SPA) architecture.

```
       +-------------------------------------------------------------+
       |                         USER CLIENT                         |
       |  Optimized for breakpoints: 320px, 360px, 375px, 390px,     |
       |  412px (Mobile), 768px (Tablet), 1024px, 1280px, 1440px     |
       +-------------------------------------------------------------+
                                      |
                        HTTPS (Direct Supabase API / SDK)
                                      |
                                      v
       +-------------------------------------------------------------+
       |                  REACT SPA / NEXT-LIKE STRUCTURE            |
       |  - UI State: React Context + Custom Hooks                  |
       |  - Router: Layout-based Multi-Role State Switcher          |
       |  - Animation: Motion (from 'motion/react')                  |
       |  - Typography: Inter & JetBrains Mono Fonts                 |
       +-------------------------------------------------------------+
                                      |
            +-------------------------+-------------------------+
            |                                                   |
            v                                                   v
+-----------------------+                               +---------------+
|     SUPABASE FREE     |                               |   RAZORPAY    |
| - Auth (JWT & Email)  |                               | - Test Mode   |
| - PostgreSQL Database |                               | - Payment     |
| - Storage (1GB Free)  |                               |   Gateway     |
+-----------------------+                               +---------------+
```

### Free-Tier Optimization Matrix
- **Supabase PostgreSQL**: Managed directly without custom backend API servers. All relational queries, foreign keys, and indexes are defined strictly in PostgreSQL.
- **Supabase Authentication**: Standard JWT flow. Custom user roles (`'student' | 'teacher' | 'admin'`) are mapped via the `profiles` table.
- **Supabase Storage**: Free 1GB allocation. Used strictly for PDF notes, syllabus attachments, and avatars.
- **Video Delivery Strategy**: Videos are hosted on free platforms (**YouTube Unlisted, Google Drive, or Vimeo**) and rendered via our provider-independent Player Component.
- **Razorpay Payments**: Integrated via client-side checkout scripts, triggering automatic webhooks or success confirmation handlers to instantly unlock course contents.

---

## 2. Relational Database Schema (Supabase PostgreSQL)

A robust, normalized relational schema featuring 22 core tables, fully indexing search keywords, academic hierarchy relationships, quiz submissions, and payment states.

```
+---------------------------------------------------------------------------------+
|                                 ACADEMIC CORE                                   |
+---------------------------------------------------------------------------------+

  [classes]
    - id: uuid (PK)
    - name: text (e.g., "Class 10", "NEET")
    - slug: text (unique)
    - priority: integer

  [subjects]
    - id: uuid (PK)
    - class_id: uuid (FK -> classes.id ON DELETE CASCADE)
    - name: text (e.g., "Physics")
    - icon: text
    - description: text

  [chapters]
    - id: uuid (PK)
    - subject_id: uuid (FK -> subjects.id ON DELETE CASCADE)
    - name: text (e.g., "Electrostatics")
    - description: text
    - order_index: integer

  [courses]
    - id: uuid (PK)
    - class_id: uuid (FK -> classes.id)
    - subject_id: uuid (FK -> subjects.id)
    - title: text
    - subtitle: text
    - description: text
    - thumbnail_url: text
    - is_premium: boolean (default: false)
    - price: numeric (default: 0.00)
    - discount_price: numeric

  [lessons]
    - id: uuid (PK)
    - chapter_id: uuid (FK -> chapters.id ON DELETE CASCADE)
    - course_id: uuid (FK -> courses.id ON DELETE CASCADE)
    - title: text
    - description: text
    - order_index: integer
    - is_premium: boolean (default: false)

  [videos]
    - id: uuid (PK)
    - lesson_id: uuid (FK -> lessons.id ON DELETE CASCADE)
    - title: text
    - provider: text (e.g., 'youtube' | 'gdrive' | 'vimeo' | 'supabase' | 'r2')
    - video_id_or_url: text
    - duration_seconds: integer

  [notes]
    - id: uuid (PK)
    - lesson_id: uuid (FK -> lessons.id ON DELETE CASCADE)
    - title: text
    - pdf_url: text
    - size_bytes: integer
    - is_premium: boolean (default: false)

+---------------------------------------------------------------------------------+
|                             USER PROFILES & PORTALS                             |
+---------------------------------------------------------------------------------+

  [profiles]
    - id: uuid (PK -> auth.users.id ON DELETE CASCADE)
    - email: text (unique)
    - full_name: text
    - role: text (default: 'student' check in ('student', 'teacher', 'admin'))
    - avatar_url: text
    - daily_streak: integer (default: 0)
    - last_active_date: date
    - total_xp: integer (default: 0)
    - badges: jsonb (array of earned badge ids)
    - created_at: timestamp

  [teacher_profiles]
    - id: uuid (PK)
    - user_id: uuid (FK -> profiles.id ON DELETE CASCADE)
    - bio: text
    - qualifications: text
    - subjects_specialty: text[]
    - rating: numeric

  [enrollments]
    - id: uuid (PK)
    - user_id: uuid (FK -> profiles.id ON DELETE CASCADE)
    - course_id: uuid (FK -> courses.id ON DELETE CASCADE)
    - progress_percentage: numeric (default: 0.0)
    - completed_lessons: uuid[] (array of lesson IDs)
    - last_accessed_at: timestamp

+---------------------------------------------------------------------------------+
|                                QUIZ SUB-SYSTEM                                  |
+---------------------------------------------------------------------------------+

  [quizzes]
    - id: uuid (PK)
    - lesson_id: uuid (FK -> lessons.id ON DELETE CASCADE)
    - title: text
    - passing_score_pct: integer (default: 60)
    - timer_seconds: integer (0 for no limit)

  [quiz_questions]
    - id: uuid (PK)
    - quiz_id: uuid (FK -> quizzes.id ON DELETE CASCADE)
    - question_text: text
    - order_index: integer

  [quiz_options]
    - id: uuid (PK)
    - question_id: uuid (FK -> quiz_questions.id ON DELETE CASCADE)
    - option_text: text
    - is_correct: boolean (default: false)

  [quiz_attempts]
    - id: uuid (PK)
    - user_id: uuid (FK -> profiles.id ON DELETE CASCADE)
    - quiz_id: uuid (FK -> quizzes.id ON DELETE CASCADE)
    - score_obtained: integer
    - total_questions: integer
    - is_passed: boolean
    - attempted_at: timestamp

  [leaderboard]
    - id: uuid (PK)
    - user_id: uuid (FK -> profiles.id ON DELETE CASCADE)
    - rank: integer
    - points_xp: integer
    - updated_at: timestamp

+---------------------------------------------------------------------------------+
|                        PAYMENTS & E-COMMERCE STRUCTURE                          |
+---------------------------------------------------------------------------------+

  [orders]
    - id: uuid (PK)
    - user_id: uuid (FK -> profiles.id ON DELETE CASCADE)
    - course_id: uuid (FK -> courses.id)
    - amount: numeric
    - status: text (e.g., 'pending' | 'completed' | 'failed')
    - coupon_applied: text
    - created_at: timestamp

  [payments]
    - id: uuid (PK)
    - order_id: uuid (FK -> orders.id ON DELETE CASCADE)
    - razorpay_payment_id: text
    - razorpay_order_id: text
    - razorpay_signature: text
    - method: text
    - status: text
    - paid_at: timestamp

+---------------------------------------------------------------------------------+
|                          CMS, UTILITIES & COMMUNICATION                         |
+---------------------------------------------------------------------------------+

  [banners]
    - id: uuid (PK)
    - title: text
    - subtitle: text
    - image_url: text
    - action_url: text
    - is_active: boolean (default: true)

  [announcements]
    - id: uuid (PK)
    - title: text
    - content: text
    - target_roles: text[] (e.g. ['student', 'teacher', 'admin'])
    - is_pinned: boolean (default: false)
    - created_at: timestamp

  [notifications]
    - id: uuid (PK)
    - user_id: uuid (FK -> profiles.id ON DELETE CASCADE)
    - title: text
    - message: text
    - is_read: boolean (default: false)
    - created_at: timestamp

  [faq]
    - id: uuid (PK)
    - category: text (e.g., 'admission' | 'payment' | 'technical')
    - question: text
    - answer: text
    - order_index: integer

  [contact_messages]
    - id: uuid (PK)
    - name: text
    - email: text
    - subject: text
    - message: text
    - status: text (default: 'unread')
    - created_at: timestamp

  [admin_settings]
    - key: text (PK)
    - value: jsonb
```

---

## 3. Comprehensive Academic Hierarchy
Content queries flow perfectly from high-level categories to micro-assessments:
```
Class (e.g. Class 10 / NEET)
  └── Subject (e.g. Physics)
        └── Chapter (e.g. Electricity)
              └── Course (e.g. Complete Class 10 Physics)
                    └── Lesson (e.g. Ohm's Law)
                          ├── Video (YouTube/Drive Embed Player)
                          ├── Notes (High-Quality PDF Sheets)
                          └── Quiz (Relational Questionnaire)
                                └── Progress Tracker & Badge Awards
```

---

## 4. Feature Matrices by User Role

### Admin CMS Control Panel
- **Homepage Engine**: Manage Hero slides, coupon definitions, featured subject cards, and social links dynamically.
- **Academic Manager**: Add classes, assign subjects, upload chapters, and publish master lessons.
- **Audit Trails**: Oversee Razorpay transaction status logs, user role privileges, and support query pipelines.

### Teacher Dashboard
- **Syllabus Operations**: Fast file upload selectors (PDFs, Notes) and embed links for lectures.
- **Scalable Quiz Creator**: Step-by-step form to declare questions, alternatives, and specify answer matrices.
- **Student Performance Hub**: Interactive charts tracking student course coverage and average quiz scores.

### Student Portal
- **Dashboard Hub**: Resume learning banner, daily streak widget, progress gauges, and visual badges.
- **Class Viewer**: Interactive split-screen video player with tabbed PDF reader, discussion, and coupon unlock flows.
- **Gamified Center**: Practice quizzes to boost XP, increase daily study streaks, and secure top rank on the Leaderboard.

---

## 5. Mobile-First Fluid break-points
The entire design framework is engineered to render cleanly across these absolute widths:
- **320px - 412px**: Slim mobile view. Compact icons, full-width headers, sticky overlay drawer overlays, large button bounds (>=44px), zero horizontal scrolling.
- **768px**: Tablet view. Collapsible dashboard layouts, side-by-side grids, responsive card sliders.
- **1024px - 1440px**: Dual-pane dashboards, structured side navigation widgets, persistent progress rails.

---

## 6. Development Roadmap

We are executing **Phase 2** of our 6-step blueprint:

1. **Phase 1: Architecture, Database Schema, and User Flow Planning** (Completed & Approved)
2. **Phase 2: Core Design System, Routing & Layouts** (Current Implementation)
   - Setup Tailwind 4 color systems, dark/light utility overrides, and typography.
   - Build complete UI kit (Buttons, Inputs, Badges, Modals, Breadcrumbs, Empty States, Paginations).
   - Code multi-role responsive layouts (Visitor, Student, Teacher, Admin structures) with simulated auth state guards.
3. **Phase 3: High-Converting Homepage, FAQ, and Contact Portals**
4. **Phase 4: Student Portal (Dashboards, Video Player, PDF Note Reader, Relational Quizzes, and Gamified Leaderboard)**
5. **Phase 5: Teacher Management Systems & Admin CMS Dashboards**
6. **Phase 6: Live Supabase Adapters, Razorpay Checkouts, SEO Optimization & Production Audit**

---

## How to Proceed

With the blueprint updated, let us move directly into constructing **Phase 2 (Design System, Core Layouts & Multi-Role Router)**, building clean components and views step-by-step to compile successfully in the AI Studio container environment.
