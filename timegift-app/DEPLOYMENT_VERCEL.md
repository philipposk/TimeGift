# Deploy TimeGift to Vercel

## Prerequisites

1. GitHub account with TimeGift repository
2. Vercel account (free at vercel.com)
3. Firebase project set up (see FIREBASE_MIGRATION.md)
4. Domain: timegift.6x7.gr

## Step 1: Push to GitHub

```bash
cd "/Users/phktistakis/Devoloper Projects/TimeGift"
git add .
git commit -m "Migrate from Supabase to Firebase"
git push origin main
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **Add New Project**
4. Import your `philipposk/TimeGift` repository
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `timegift-app`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
6. Add Environment Variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_APP_URL` = `https://timegift.6x7.gr`
7. Click **Deploy**

## Step 3: Configure Custom Domain

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add domain: `timegift.6x7.gr`
4. Vercel will show DNS records to add:
   - **CNAME**: `timegift` → `cname.vercel-dns.com`
   - OR **A Record**: `timegift` → Vercel's IP addresses

## Step 4: Update DNS

Go to your domain registrar (where you manage 6x7.gr) and add:

**Option A: CNAME (Recommended)**
- Type: `CNAME`
- Name: `timegift`
- Value: `cname.vercel-dns.com`

**Option B: A Records**
- Type: `A`
- Name: `timegift`
- Value: `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IPs)

## Step 5: Update Firebase Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Add authorized domain: `timegift.6x7.gr`
3. Also add: `your-project.vercel.app` (your Vercel deployment URL)

## Step 6: SSL Certificate

Vercel automatically provisions SSL certificates. Wait 5-10 minutes after DNS propagation, then:
1. Go to Vercel → Settings → Domains
2. SSL certificate should show as "Valid"
3. Enable "Force HTTPS" if available

## Step 7: Verify Deployment

1. Visit https://timegift.6x7.gr
2. Test sign up
3. Test sign in
4. Test creating a gift

## Continuous Deployment

Vercel automatically deploys on every push to `main` branch. Just:
```bash
git push origin main
```

## Environment Variables

All environment variables are set in Vercel dashboard. They're automatically injected at build time.

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all environment variables are set
- Check that `package.json` has correct dependencies

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check Vercel domain settings

### Firebase Auth Not Working
- Verify authorized domains in Firebase
- Check environment variables in Vercel
- Check browser console for errors

## Vercel Free Tier Limits

- 100GB bandwidth/month
- Unlimited deployments
- Automatic SSL
- Custom domains
- Perfect for TimeGift!
