# RK Coaching LMS - Admin Operations Guide

This handbook covers all administrative features built into the RK Coaching LMS Command Center.

---

## 🔐 Part 1: Initial Login

To access administrative tools:
1. Navigate to the **Auth** page.
2. Log in with an email configured as an `admin` role in your Supabase `users` table, or use standard local admin accounts.
3. The sidebar will expose the **Admin Panel** tab.

---

## 🛠 Part 2: Platform Settings Management

Administrators control crucial global merchant details directly from the frontend without modifying source files.

1. **Merchant Settings**:
   - Navigate to the **Admin Dashboard -> Settings** section.
   - **Razorpay Key ID**: Enter your production Razorpay Key ID (`rzp_live_...` or `rzp_test_...`).
   - **Business Name**: Enter the legal merchant entity (e.g. `RK Coaching Pvt Ltd`) displayed on checkouts.
   - **Business Logo**: Enter a publicly accessible URL for the checkout brand image.
   - **Support Phone/Email**: Configured for students who require assistance during checkout fails.

---

## 📡 Part 3: Database & Diagnostics Audits

The platform includes automated live telemetry tools to audit the cloud database health:

1. **Supabase Connectivity Audit**:
   - Click **Run Connectivity Diagnostic** in the Admin dashboard.
   - The platform will query the PostgreSQL tables, verifying API accessibility, credentials length, and latency.
   - Green signals verify active synchronization; Amber indicates fallback mock states are active due to missing variables.

2. **Schema Integrity Check**:
   - Confirms that critical relational profiles (`lessons`, `bookmarks`, `progress`) are structured and synchronized securely.

---

## 📊 Part 4: Financial Operations & Refunds

1. **Transaction Ledger**:
   - The **Transaction Audits** tab lists all student enrollments, purchase logs, order IDs, and payment statuses synced from Razorpay.
   - Filter transactions by date or status (e.g., Success, Failed, Refunding).

2. **Processing Refunds**:
   - If a student requests a refund for a premium class:
     - Locate the transaction ID under the ledger.
     - Click **Refund**.
     - Confirm the action. This immediately flags the purchase as refunded, locks the student's access to the premium class materials, and logs the refund event into the ledger.

---

## 📝 Part 5: Curriculum Orchestration

While Teachers manage day-to-day lesson outlines, Admins hold root access to create and delete:
- **Classes**: Configure standard titles, NEET streams, or science streams.
- **Subjects**: Design custom themes, add coordinators, and link to classes.
- **Courses**: Create Premium vs Free modules, define prices, and assign syllabi.
