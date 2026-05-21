# Life-OS Dashboard

A personal, gamified productivity dashboard built with React, Vite, Tailwind CSS v3, and Supabase.

## Features

- **Task Management**: A clean to-do list. Completing tasks earns you XP and coins.
- **Gamification**: A virtual pet companion that loses health over time. Completing tasks feeds the pet, keeping its health bar full.
- **Level & Shop**: Gain levels based on your XP. Use earned coins in the shop to unlock new pet sprites or UI themes.
- **Themes**: Multiple beautiful dark-mode themes (Default, Cyberpunk, Forest).
- **Weekly Journal**: Reflect every week with repeating prompts, a 1-5 mood rating, and mood history analytics.
- **Supabase Backend**: Fully integrated with Supabase for Auth (Email/Password) and PostgreSQL database, including Row Level Security (RLS) so your data is private.

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard and run the entire contents of the `supabase/schema.sql` file. This sets up the necessary tables (`profiles`, `tasks`, `pets`, `user_pets`), RLS policies, triggers, and RPC functions.
3. Get your **Project URL** and **anon public key** from your project settings (Settings -> API).

### 2. Environment Variables

Copy the `.env.local` template (if available) or create a new `.env.local` file in the root of the project:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Local Development

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Visit the local URL (usually `http://localhost:5173`) to view your app. Create an account, and your default pet will be waiting for you!
