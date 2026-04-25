# UpnAbove 🚀

## 1. Project Overview

UpnAbove is the next-generation hiring platform designed to bypass the traditional résumé black hole. It solves the problem of friction and bias in traditional recruitment by connecting top-tier candidates with forward-thinking employers through direct action, verified proof of work, and radical transparency. Say goodbye to the endless cycle of applying and waiting—UpnAbove focuses on what candidates can actually *do*.

## 2. The Forge

**The Forge** is the world's first public hiring arena and the core engine of UpnAbove. 
Instead of submitting a standard CV, candidates enter **The Forge** to compete in live, high-stakes challenges dropped by employers.

- **Prove Your Skills:** Tackle real-world problems in Engineering, Design, Data, and Strategy.
- **Win In Public:** Submissions are initially anonymous (codenames only), scored by an AI engine and peer voting.
- **Get Hired:** The top entries are revealed. Winners earn badges, build their "Streak", and secure direct interviews or offers from sponsoring employers.

## 3. Tech Stack

UpnAbove is built with a modern, high-performance web stack:

* **Next.js 15:** App Router, React Server Components, and Server Actions for a lightning-fast UI.
* **Supabase:** PostgreSQL database, Auth, Row Level Security, and Realtime data sync.
* **Tailwind CSS:** For the sleek, glassmorphic, and dynamic design system.
* **Lemon Squeezy:** Handling payments, premium subscriptions, and employer sponsorships.
* **Vercel:** Optimized, edge-ready hosting and seamless CI/CD.

## 4. Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                 Client (Browser / User)                │
       │    Next.js 15 (React Server Components + Client UI)    │
       └──────┬─────────────────────────────┬─────────────┬─────┘
              │                             │             │
        (User Auth &               (App logic &        (Checkout &
         Realtime Sync)              Data fetch)       Billing UI)
              │                             │             │
              ▼                             ▼             ▼
       ┌───────────────┐           ┌────────────────┐   ┌───────────────┐
       │   Supabase    │           │ Next.js API    │   │ Lemon Squeezy │
       │   (Auth)      │           │ Routes (Edge)  │   │   (Payments)  │
       └──────┬────────┘           └──────┬─────────┘   └──────┬────────┘
              │                           │                    │
              │                           │ (DB Read/Write     │ (Webhooks)
              │                           │  & Server Actions) │
              ▼                           ▼                    ▼
       ┌───────────────────────────────────────────────────────────────┐
       │                     Supabase (PostgreSQL)                     │
       │                                                               │
       │  • Profiles (Candidates/Employers)   • Jobs                   │
       │  • Forge Challenges                  • Forge Entries & Votes  │
       │  • Squads                            • Skills Schema          │
       └───────────────────────────────────────────────────────────────┘
```

## 5. Features List

### Standard Job Board
- Discover high-quality roles worldwide.
- Rich employer profiles.
- Seamless, direct-to-employer application processes.

### The Forge
- **Live Challenges:** Real-world problem solving for different roles.
- **Anonymized Submissions:** Combat bias through codenamed entries.
- **AI Scoring:** Automated, instant feedback on entries.
- **Community Voting:** Peer validation for the best work.
- **Global Leaderboard:** Track top performers, rising stars, and multiplayer squads.
- **Candidate Badges & Streaks:** Publicly verified achievements based on performance.

## 6. Setup Guide

### Clone the repository
```bash
git clone https://github.com/Zakariaouchtain27/upnabove.git
cd upnabove
```

### Install Dependencies
Make sure you have Node.js installed (v18+ recommended).
```bash
npm install
```

### Environment Configuration
Copy the sample environment file.
```bash
cp .env.example .env.local
```
*(Open `.env.local` and fill in your keys. See the section below for details).*

### Database Setup (Supabase)
Run the following SQL scripts in your remote Supabase SQL Editor (or via Supabase CLI) to set up the database schema and functions:
- `base_tables.sql`
- `forge_tables.sql`
- `forge_functions.sql`
- `migrate_skills.sql`

### Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## 7. Environment Variables

Below is a breakdown of what each required variable in `.env.example` does:

- **`NEXT_PUBLIC_SUPABASE_URL`**: Your Supabase project URL used for connecting to the database and Auth.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: The public, safe-to-expose anonymous key for Supabase client-side requests.
- **`SUPABASE_SERVICE_ROLE_KEY`**: The private, server-side-only key for bypassing Row Level Security (RLS) when performing admin operations.
- **`LEMON_SQUEEZY_API_KEY`**: Your private Lemon Squeezy key used to create checkouts and manage subscriptions.
- **`RESEND_API_KEY`**: Your API key for Resend, used to send transactional emails (e.g. notifications, invites).
- **`CRON_SECRET`**: A secret token used to authenticate and secure your scheduled cron jobs (like closing expired challenges).
- **`NEXT_PUBLIC_APP_URL`**: The base URL of your application (e.g., `http://localhost:3000` or `https://upnabove.work`), used for callbacks and absolute routing.
