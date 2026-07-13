# Database Reconnection and Frontend-First Mode Plan

This document outlines the transition to Frontend-First mode and provides a guide for reconnecting the Supabase database.

## 1. Why Local Frontend Mode Was Introduced
To stabilize the user interface, eliminate connection storms (`net::ERR_CONNECTION_CLOSED` / `ERR_HTTP2_PROTOCOL_ERROR`), and bypass server-side rate limits, we isolated the application database layer at the runtime level. The application now runs in a stable frontend-only sandbox using high-fidelity local demo data.

## 2. Isolated Database Integrations
All database communication channels have been bypassed:
* **Academic Catalog**: `classes`, `subjects`, `courses`, `chapters`, `lessons`, `videos`, `notes`, `faqs` are loaded from `src/lib/mockData.ts`.
* **Authentication**: Credentials authentication now runs a simulation layer checking email keywords to set demo role permissions (`student`, `teacher`, `admin`, `super_admin`).
* **Live Quiz Arena**: Traverses lessons, quizzes, and questions using centralized mock files.
* **Relation Data**: Bookmarks, user progress, order/payment records, and notification histories are stored in and retrieved from the browser's `localStorage` and `sessionStorage`.

## 3. Existing Supabase Tables
The production Supabase schema includes the following tables:
* `classes`: Class listings and details.
* `subjects`: Topics corresponding to classes.
* `profiles`: Global user profile definitions.
* `teacher_profiles`: Credentials, review levels, and verification tags.
* `chapters`: Sub-units for curriculum organization.
* `courses`: Course purchase descriptions and metadata.
* `lessons`: Main page content assets.
* `notes` & `videos`: Study guides and video streaming indexes.
* `enrollments`: Access lists for premium course seats.
* `quizzes` & `quiz_questions` & `quiz_options`: Interactive CBT modules.
* `quiz_attempts`: Logs of student quiz scores and time taken.
* `leaderboard`: Global rank calculations.
* `announcements` & `notifications`: News tickers and push triggers.
* `orders` & `payments`: Commercial transactions.
* `admin_settings`: Home-page customization sliders and settings.
* `faq` & `banners` & `contact_messages`: Operational pages.

## 4. Existing Authentication Integration
Located in [src/context/AuthContext.tsx](file:///c:/Users/ac805/.gemini/antigravity/scratch/rk-coaching-v2/src/context/AuthContext.tsx). Uses `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()` to capture user sessions and synchronize them with the `profiles` table.

## 5. Existing RLS Files
Found in the `supabase/` directory:
* `schema.sql`: Main database layout and RLS triggers.
* `migration_notes_purchase.sql`: Row-Level Security for notes purchases.

## 6. Existing Environment Variables
Configured in `.env` and `.env.example`:
* `VITE_SUPABASE_URL`: The API URL endpoint.
* `VITE_SUPABASE_ANON_KEY`: Public anonymous key.
* `VITE_APP_DATA_MODE`: Set to `local` (default) or `supabase`.

## 7. Data-Provider Architecture
Centralized boundary defined in:
* `isSupabaseConfigured()` in [src/lib/supabase.ts](file:///c:/Users/ac805/.gemini/antigravity/scratch/rk-coaching-v2/src/lib/supabase.ts). When `VITE_APP_DATA_MODE` is not `'supabase'`, it returns `false`, gracefully routing all contexts to local mock data.

## 8. How to Switch from Local to Supabase Mode
Change the environment variable in your hosting dashboard or local `.env` file:
```env
VITE_APP_DATA_MODE=supabase
```

## 9. Module-by-Module Reconnection Order
To ensure connection stability, reconnect modules in this exact order:
1. **Authentication**: Verify session synchronization.
2. **User Profiles**: Test reading/writing to `profiles`.
3. **Academic Catalog**: Verify `classes`, `subjects`, `courses`, `chapters`, `lessons`, `videos`, `notes`.
4. **Enrollment & Purchases**: Connect `enrollments`, `orders`, `payments`, `subject_notes_purchases`.
5. **Quiz Arena**: Connect `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`.
6. **Social Features**: Reconnect `leaderboard`, `announcements`, `notifications`.
7. **Portals**: Enable Teacher and Admin dashboard syncing.

## 10. Testing Requirements Before Production
* Ensure no REST requests trigger infinite render loops.
* Validate empty states on all catalog items.
* Confirm that no raw database errors leak into user-facing panels.
