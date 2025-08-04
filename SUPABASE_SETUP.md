# 🗄️ Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose organization, name your project "project-graveyard"
4. Set a strong database password
5. Select a region close to you

### 2. Get Your API Keys
1. In your Supabase dashboard, go to Settings → API
2. Copy your `Project URL` and `anon public` key

### 3. Set Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4. Run Database Migration
1. In your Supabase dashboard, go to SQL Editor
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL Editor and click "Run"
4. This creates all tables, policies, and security rules

### 5. Test the Setup
1. Restart your dev server: `npm run dev`
2. Try creating a project - it should now save to the database!
3. Check the Supabase Table Editor to see your data

## Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables set in `.env.local`
- [ ] Database schema applied via SQL Editor
- [ ] Dev server restarted
- [ ] Project creation works (no "Database not configured" error)

## Troubleshooting

**"Invalid API key" error:**
- Double-check your environment variables
- Make sure you copied the `anon public` key, not the `service_role` key
- Restart your dev server after changing `.env.local`

**"Row Level Security" errors:**
- Make sure you ran the complete schema from `supabase-schema.sql`
- The RLS policies should allow users to manage their own data

**Projects not showing:**
- Check the browser console for errors
- Verify the database tables were created in Supabase Table Editor

## Next Steps

Once Supabase is working:
1. ✅ Project creation will save to database
2. ✅ Graveyard will show real data
3. ✅ Each user will have their own projects (when auth is added)

The app is fully functional with mock authentication - real Supabase auth comes next!