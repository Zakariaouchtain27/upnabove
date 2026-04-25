# UpnAbove 🚀

UpnAbove is the next-generation hiring platform designed to bypass the traditional résumé black hole. It connects top-tier candidates with forward-thinking employers through direct action, verified proof of work, and radical transparency.

## ⚔️ The Forge

**The Forge** is the world's first public hiring arena and the core engine of UpnAbove. 
Instead of submitting a standard CV and waiting for a response, candidates enter **The Forge** to compete in live, high-stakes challenges dropped by employers.

- **Prove Your Skills:** Tackle real-world problems in Engineering, Design, Data, and Strategy.
- **Win In Public:** Submissions are initially anonymous (codenames only), scored by an AI engine (Claude) and peer voting.
- **Get Hired:** The top entries are revealed. Winners earn badges, build their "Streak", and secure direct interviews or offers from sponsoring employers.

## 💻 Tech Stack

UpnAbove is built with a modern, high-performance web stack:

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Realtime, Storage)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom design system & modern aesthetics (Glassmorphism, Dark Mode)
* **Payments & Subscriptions:** [Lemon Squeezy](https://www.lemonsqueezy.com/) (For Employer sponsorships & premium features)
* **AI Engine:** Anthropic Claude API (For automated Forge challenge scoring)

## 🏗️ Architecture Diagram

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

## 🚀 Setup Guide

### 1. Clone the repository
```bash
git clone https://github.com/Zakariaouchtain27/upnabove.git
cd upnabove
```

### 2. Install Dependencies
Make sure you have Node.js installed (v18+ recommended).
```bash
npm install
```

### 3. Environment Configuration
Copy the sample environment file and fill in your keys.
```bash
cp .env.example .env.local
```
*(See the `.env.example` file for the exact variables required).*

### 4. Database Setup (Supabase)
Ensure you have the Supabase CLI installed, or run the provided SQL scripts in your remote Supabase SQL Editor to set up the database tables:
- `base_tables.sql`
- `forge_tables.sql`
- `forge_functions.sql`
- `migrate_skills.sql`

### 5. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## 🔐 Environment Variables

The application requires several third-party API keys to function fully. Refer to `.env.example` in the repository root for the full list of required variables, which includes keys for Supabase, Lemon Squeezy (Payments), Anthropic (AI), and other integrations.
