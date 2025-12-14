# TimeGift - Quick Setup Guide

Welcome to TimeGift! This guide will help you get the app running in minutes.

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd timegift-app
npm install
```

### 2. Set Up Supabase

#### Create Account & Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (choose any name, region, and password)
3. Wait 1-2 minutes for project to be ready

#### Run Database Schema
1. Click **SQL Editor** in left sidebar
2. Open `supabase-schema.sql` from this project
3. Copy ALL contents and paste into SQL Editor
4. Click **Run** (green play button)
5. You should see "Success. No rows returned"

#### Get API Keys
1. Click **Settings** (gear icon) → **API**
2. Copy these three values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Project API keys** → `anon public` key
   - **Project API keys** → `service_role` key (click "Reveal")

### 3. Configure Environment

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=paste-service-role-key-here
   ```

### 4. Create Storage Bucket

1. In Supabase, go to **Storage** in left sidebar
2. Click **New bucket**
3. Name: `gift-cards`
4. Make it **Public**
5. Click **Create bucket**

### 5. Create Test User

#### Via Supabase UI:
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Email: `test@timegift.app`
4. Password: `123456`
5. Click **Create user**
6. Copy the user ID shown

#### Link to Database:
1. Go to **SQL Editor**
2. Paste and run (replace `USER_ID_HERE` with actual ID):

```sql
INSERT INTO users (id, email, username, display_name, is_admin, privacy_level)
VALUES (
  'USER_ID_HERE',
  'test@timegift.app',
  'test',
  'Test User',
  true,
  'public'
);
```

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Test Login

- **Username:** test
- **Password:** 123456

You should see the dashboard! 🎉

## 📋 What You Can Do Now

### As a User:
- ✅ Create time gifts
- ✅ Send to email/phone (non-members)
- ✅ Add friends
- ✅ View received gifts
- ✅ Customize profile & privacy
- ✅ Toggle dark/light mode

### As Admin (test user):
- ✅ Access admin panel at `/admin`
- ✅ Configure time decay settings
- ✅ Set notification preferences
- ✅ Add API keys (Vonage, Groq, WhatsApp)
- ✅ Enable/disable features

## 🔧 Optional: Configure APIs

These are optional and can be added later in the admin panel:

### Vonage SMS
1. Sign up at [vonage.com](https://dashboard.nexmo.com)
2. Get API Key and Secret
3. Add API key, secret, and the sender ID/phone number you want to appear in `/admin` → API Keys tab

### Groq AI (for image enhancement)
1. Sign up at [groq.com](https://console.groq.com)
2. Generate API key
3. Add in `/admin` → API Keys tab

### WhatsApp Business
1. Set up via Meta Business
2. Get API credentials (key + secret) and the approved WhatsApp-enabled sender number
3. Add credentials in `/admin` → API Keys tab to enable WhatsApp notifications

## 🚨 Common Issues

### "Invalid API key" error
- Double-check you copied the entire keys from Supabase
- Make sure you used the `anon` key (not service_role) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Test user can't log in
- Verify user was created in Authentication → Users
- Make sure you ran the INSERT query to add user to `users` table
- Try email login: `test@timegift.app` / `123456`

### Build errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database errors
- Re-run the entire `supabase-schema.sql` file
- It's safe to run multiple times (uses IF NOT EXISTS)

## 📚 Next Steps

1. **Deploy to Production** - See `DEPLOYMENT.md`
2. **Customize Branding** - Edit colors in `app/globals.css`
3. **Add More Features** - Check the codebase structure
4. **Set Up Monitoring** - Configure error tracking

## 🎯 Project Structure

```
timegift-app/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profile
│   ├── friends/           # Friends management
│   ├── admin/             # Admin panel
│   ├── about/             # About page
│   ├── auth/              # Authentication pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Core utilities (Supabase)
├── utils/                 # Helper functions
├── types/                 # TypeScript types
├── supabase-schema.sql   # Database schema
└── README.md             # Project overview
```

## 💡 Tips

- **Admin Panel**: Only users with `is_admin = true` can access `/admin`
- **Guest Mode**: Add `?guest=true` to dashboard URL for read-only access
- **Dark Mode**: Toggle in navbar (persists in localStorage)
- **Privacy Settings**: Control who can see your profile in Profile page
- **Random Exchange**: Enable in Profile → opt into random matching

## 🆘 Need Help?

1. Check browser console for errors (F12)
2. Check Supabase logs: **Logs** → **Error Logs**
3. Verify all environment variables are set
4. Make sure Supabase project is running (not paused)

---

**Ready to gift time?** Sign in and create your first time gift! 🎁
