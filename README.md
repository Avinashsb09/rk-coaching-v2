# RK Coaching Learning Management System (LMS)

A premium, full-featured Learning Management System designed specifically for students in **CBSE Classes 6-12** and competitive **NEET Exam Preparation**. Built with a focus on beautiful typography, fluid responsive design, robust state handling, and strict payment pathways.

## 🚀 Key Features

### 🎓 LMS Core Modules
- **Dynamic Subject & Lesson Syllabus**: Curated learning trees sorted by classes, chapters, video playlists, and revision notes.
- **Interactive Quizzes**: Chapter-specific quizzes with real-time feedback, timers, and automatic performance scoring.
- **Global & Class-wise Leaderboards**: Dynamic student rankings to drive healthy academic competition.
- **Study Progress Tracking**: Storing completed lessons, quizzes, and overall syllabus completion metrics.

### 💳 Commerce & Subscriptions
- **Premium Course Unlock**: Fully functional checkouts using the official Razorpay SDK.
- **UPI-Only Checkout**: Configured to show strictly Indian UPI payment apps (GPay, PhonePe, Paytm, BHIM) and hide credit cards/net banking to match operational goals.
- **High-Fidelity Simulator**: Embedded payment simulator for isolated preview environments, running complete signature and verification matches.
- **Ledger & Invoices**: Student dashboard for tracing order logs, receipts, and printing invoice receipts.

### 🔒 Roles & Access Control
- **Student Profile**: Custom study trackers, streak counters, bookmarks, and billing history.
- **Teacher Dashboard**: Syllabus editing controls, lesson management, and quiz creation interfaces.
- **Admin Command Center**: System setting management, database health tests, class creation, transaction history auditing, and refund processors.

---

## 🛠 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- **Programming Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (curated custom themes)
- **Database / Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security)
- **Payment Gateway**: [Official Razorpay SDK](https://razorpay.com/) (Dynamic script loader)
- **Animation**: [Motion](https://motion.dev/)

---

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Setup Instructions

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📝 Directory Structure

```
├── /public/               # Static assets (robots.txt, sitemap.xml)
├── /src/
│   ├── /components/       # UI (Buttons, Cards, Modals), Layout (Header, Sidebar), Shared
│   ├── /context/          # AppContext (global data syncing & mock fallback state)
│   ├── /hooks/            # Custom hooks
│   ├── /lib/              # Supabase Client definition and connectivity test
│   ├── /utils/            # Razorpay scripts
│   ├── /views/            # Views organized by roles (Admin, Teacher, Student, LMS, Home)
│   ├── App.tsx            # Main visual router & layout manager
│   ├── types.ts           # Unified TypeScript definitions (Course, Quiz, Order, etc.)
│   └── index.css          # Tailwind CSS configurations & Google Fonts
```

---

## ⚖️ License
Licensed under the Apache-2.0 License. See the LICENSE details.
