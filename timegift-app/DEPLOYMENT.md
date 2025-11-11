# TimeGift Deployment Guide

## Prerequisites

1. **Supabase Account** (free tier works)
2. **Vercel Account** (recommended for deployment)
3. **API Keys** (optional, configurable later):
   - Vonage API (SMS)
   - WhatsApp Business API
   - Groq AI API

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

### 1.2 Run Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run it in the SQL Editor

### 1.3 Set Up Storage

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `gift-cards`
3. Set it to **Public** access
4. Add policy: Allow authenticated users to upload

### 1.4 Create Test User

1. Go to **Authentication > Users**
2. Click "Add User" (manual)
3. Email: `test@timegift.app`
4. Password: `123456`
5. After creation, go to SQL Editor and run:

```sql
-- Link auth user to users table
INSERT INTO users (id, email, username, display_name, is_admin, privacy_level)
VALUES (
  '<USER_ID_FROM_AUTH>',
  'test@timegift.app',
  'test',
  'Test User',
  true,
  'public'
);
```

Replace `<USER_ID_FROM_AUTH>` with the actual user ID from the auth.users table.

### 1.5 Get API Credentials

1. Go to **Settings > API**
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

## Step 2: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional API keys (can be configured later in admin panel)
VONAGE_API_KEY=
VONAGE_API_SECRET=
GROQ_API_KEY=
WHATSAPP_API_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

Test the app:
1. Sign in with test user (test / 123456)
2. Explore all features
3. Create test gifts
4. Check admin panel at `/admin`

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 4.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables from `.env.local`
5. Click "Deploy"

### 4.3 Configure Production URL

After deployment:
1. Go to Vercel project settings
2. Copy your production URL (e.g., `https://timegift.vercel.app`)
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Redeploy

### 4.4 Update Supabase OAuth Redirect

1. Go to Supabase **Authentication > URL Configuration**
2. Add your Vercel URL to:
   - Site URL: `https://timegift.vercel.app`
   - Redirect URLs: 
     - `https://timegift.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local dev)

## Step 5: Set Up Cron Jobs (Optional)

For automated time decay and random matching:

### Option A: Vercel Cron (Recommended)

1. Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/decay",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/random-exchange",
      "schedule": "0 12 * * *"
    }
  ]
}
```

2. Add `CRON_SECRET` to environment variables (optional security)

### Option B: GitHub Actions

Create `.github/workflows/cron.yml`:

```yaml
name: Scheduled Tasks
on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
  workflow_dispatch:

jobs:
  time-decay:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger time decay
        run: |
          curl -X POST https://timegift.vercel.app/api/decay \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Step 6: Configure APIs in Admin Panel

1. Sign in as admin user
2. Go to `/admin`
3. Navigate to "API Keys" tab
4. Enter your API credentials:
   - **Vonage SMS**: Get keys from [vonage.com](https://dashboard.nexmo.com)
   - **Groq AI**: Get key from [groq.com](https://console.groq.com/keys)
   - **WhatsApp**: Set up WhatsApp Business API

## Step 7: Enable OAuth Providers (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://<your-project>.supabase.co/auth/v1/callback`
4. In Supabase **Authentication > Providers**, enable Google
5. Add Client ID and Secret

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create an app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. In Supabase, enable Facebook provider

## Production Checklist

- [ ] Supabase project created and schema deployed
- [ ] Test user created and verified
- [ ] Environment variables configured
- [ ] App deployed to Vercel
- [ ] OAuth redirect URLs updated
- [ ] Cron jobs configured (optional)
- [ ] API keys added in admin panel (optional)
- [ ] Storage bucket created and configured
- [ ] Test all core features in production
- [ ] Security: RLS policies enabled
- [ ] Monitoring: Set up error tracking (optional)

## Troubleshooting

### Build Errors

If you get build errors on Vercel:
- Make sure all environment variables are set
- Check that Supabase credentials are correct
- Verify Node.js version compatibility

### Authentication Issues

- Verify Supabase URL and keys are correct
- Check OAuth redirect URLs match your domain
- Ensure test user exists in both `auth.users` and `users` tables

### Database Issues

- Verify RLS policies are enabled
- Check that admin user has `is_admin = true`
- Run `supabase-schema.sql` if tables are missing

## Support

For issues or questions:
1. Check Supabase logs (Database > Logs)
2. Check Vercel deployment logs
3. Review browser console for errors
4. Verify all environment variables are set correctly

---

Made with ❤️ for gifting time!
