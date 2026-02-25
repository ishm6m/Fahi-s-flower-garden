<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js, a Supabase project.

1. Copy `.env.example` to `.env` and fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
2. In Supabase SQL editor, create the table:
   ```sql
   create table if not exists public.flowers (
     id uuid primary key default gen_random_uuid(),
     type text not null,
     color text not null,
     x double precision not null,
     y double precision not null,
     message text not null,
     author text default 'Anonymous',
     created_at timestamp with time zone default now()
   );
   ```
   Then enable Realtime for the `flowers` table (table -> Realtime -> Enable). No RLS rules are required since the app uses the public anon key.
3. Install dependencies: `npm install`
4. Run the app: `npm run dev`

Optional: keep `GEMINI_API_KEY`/`APP_URL` set if you use other features in this repo.

If Row Level Security is enabled on your project, add policies to allow anon select and insert on the flowers table.
