# RK Coaching LMS - Deployment Guide

This document outlines the steps to deploy the RK Coaching LMS to a production environment.

---

## 💾 Part 1: Database Setup (Supabase)

The LMS uses Supabase as its database engine. Follow these steps to prepare your production database:

1. **Create a Supabase Project**:
   - Go to [Supabase Console](https://supabase.com) and create a new project.
   - Note down your project **API URL** and **Anon Public Key** from the **Project Settings -> API** page.

2. **Execute Database Schemas**:
   - Go to the **SQL Editor** tab in your Supabase dashboard.
   - Copy and run the queries inside `/supabase/schema.sql` to initialize the core tables (`classes`, `subjects`, `chapters`, `lessons`, `videos`, `notes`, `quizzes`, etc.).
   - Copy and run `/supabase/migration_loop3.sql` to apply bookmarks, study progress tables, and RLS policies.

3. **Verify Row-Level Security (RLS)**:
   - Run a test to ensure that student profiles, progress markers, and payment logs are locked and readable only by their respective owners.

---

## 💳 Part 2: Payment Gateway Setup (Razorpay)

The billing module uses the official Razorpay script directly on the client side:

1. **Obtain API Credentials**:
   - Sign up/Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
   - Go to **Settings -> API Keys** and generate either `Test Key` or `Live Key` credentials.
   - Note your `Key ID` (usually starts with `rzp_test_` or `rzp_live_`).

2. **Configure Keys inside LMS**:
   - Log in to your deployed RK Coaching LMS application using your **Admin** account.
   - Navigate to the **Admin Panel -> Settings** view.
   - Input your **Razorpay Key ID**, **Business Name**, and support details under the **Payment Settings** form and click **Save**. These parameters are stored securely inside the database and synchronized instantly across checkout processes.

---

## 🌐 Part 3: Frontend Hosting

The application is a standard static React SPA built using Vite. It can be deployed to any static host:

### Option A: Vercel / Netlify
1. Connect your GitHub repository to Vercel/Netlify.
2. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Define the Environment Secrets:
   - `VITE_SUPABASE_URL` = (your production Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = (your production Supabase public key)
4. Trigger deployment.

### Option B: Docker / Cloud Run
If deploying inside containers (e.g. Google Cloud Run or AWS ECS):
1. Build the production bundle: `npm run build`.
2. Configure a static file server (such as Nginx) to serve the `dist/` directory on port `3000`.
3. Set the respective environment variables during container launching.

---

## 📈 Part 4: Post-Deployment Verification

1. **SEO Check**:
   - Confirm that `https://yourdomain.com/robots.txt` and `https://yourdomain.com/sitemap.xml` are accessible.
   - Inspect meta titles in social sharing links.

2. **Supabase Contact Test**:
   - Log in as Admin and run the **Supabase Connection Self-Test** under the dashboard diagnostic tab to confirm live contact.

3. **Purchase Sandbox Run**:
   - Put Razorpay in Test mode, open a premium course, trigger checkout, and run an end-to-end UPI validation transaction.
