# 🚀 TimeGift Deployment on Fly.io

This guide will help you deploy TimeGift to Fly.io instead of Vercel.

## Prerequisites

1. **Fly.io Account** - Sign up at [fly.io](https://fly.io)
2. **Fly CLI** - Install the Fly.io CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
3. **Supabase Account** - For database and authentication
4. **GitHub Repository** - Your TimeGift repo

## Step 1: Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Or via Homebrew (macOS)
brew install flyctl

# Verify installation
flyctl version
```

## Step 2: Login to Fly.io

```bash
flyctl auth login
```

This will open your browser to authenticate.

## Step 3: Initialize Fly.io App

From the `timegift-app` directory:

```bash
cd timegift-app
flyctl launch
```

This will:
- Detect your app (Next.js)
- Ask for app name (or use `timegift`)
- Ask for region (choose closest to your users)
- Create `fly.toml` configuration

**Note:** The `fly.toml` file is already created, so you can skip this step if you prefer.

## Step 4: Set Environment Variables

Set your Supabase and API keys:

```bash
# Supabase (Required)
flyctl secrets set NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
flyctl secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App URL (Update after first deployment)
flyctl secrets set NEXT_PUBLIC_APP_URL="https://timegift.fly.dev"

# Optional APIs (can be set later)
flyctl secrets set VONAGE_API_KEY="your-vonage-key"
flyctl secrets set VONAGE_API_SECRET="your-vonage-secret"
flyctl secrets set GROQ_API_KEY="your-groq-key"
flyctl secrets set WHATSAPP_API_KEY="your-whatsapp-key"
```

Or set them all at once:

```bash
flyctl secrets set \
  NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  NEXT_PUBLIC_APP_URL="https://timegift.fly.dev"
```

## Step 5: Deploy

```bash
flyctl deploy
```

This will:
1. Build your Docker image
2. Push it to Fly.io
3. Deploy your app
4. Show you the deployment URL

## Step 6: Update App URL

After first deployment, update the app URL:

```bash
# Get your app URL
flyctl status

# Update the secret
flyctl secrets set NEXT_PUBLIC_APP_URL="https://your-app-name.fly.dev"
```

## Step 7: Configure Custom Domain (Optional)

### 7.1 Add Domain

```bash
flyctl certs add timegift.6x7.gr
```

### 7.2 Update DNS

Fly.io will provide DNS records. Add them to your domain provider:

- **Type:** CNAME
- **Name:** timegift (or @ for root)
- **Value:** `timegift.fly.dev`

### 7.3 Update App URL

```bash
flyctl secrets set NEXT_PUBLIC_APP_URL="https://timegift.6x7.gr"
```

## Step 8: Configure Supabase OAuth

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Fly.io URL:
   - **Site URL:** `https://timegift.fly.dev` (or your custom domain)
   - **Redirect URLs:**
     - `https://timegift.fly.dev/auth/callback`
     - `http://localhost:3000/auth/callback` (for local dev)

## Step 9: Set Up Cron Jobs (Optional)

Fly.io doesn't have built-in cron, but you can use:

### Option A: Fly.io Machines (Recommended)

Create a separate machine for cron jobs:

```bash
# Create a cron machine
flyctl machines create \
  --name timegift-cron \
  --region iad \
  --vm-size shared-cpu-1x \
  --env "CRON_MODE=true" \
  --schedule daily
```

Then create a cron script in your app that runs these endpoints.

### Option B: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

Set up webhooks to call:
- `https://timegift.fly.dev/api/decay` (daily)
- `https://timegift.fly.dev/api/random-exchange` (daily)

## Step 10: Monitor Your App

```bash
# View logs
flyctl logs

# Check status
flyctl status

# View metrics
flyctl metrics
```

## Useful Fly.io Commands

```bash
# Deploy
flyctl deploy

# View logs
flyctl logs

# SSH into machine
flyctl ssh console

# Scale app
flyctl scale count 2

# View secrets
flyctl secrets list

# Update secrets
flyctl secrets set KEY="value"

# Remove secret
flyctl secrets unset KEY

# Open app in browser
flyctl open

# Check app status
flyctl status
```

## Troubleshooting

### Build Fails

```bash
# Check build logs
flyctl logs

# Try building locally first
docker build -t timegift .
docker run -p 3000:3000 timegift
```

### App Won't Start

```bash
# Check runtime logs
flyctl logs

# SSH into machine to debug
flyctl ssh console
```

### Environment Variables Not Working

```bash
# Verify secrets are set
flyctl secrets list

# Check if app can access them
flyctl ssh console
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure RLS policies allow connections

## Cost Considerations

Fly.io pricing:
- **Free tier:** 3 shared-cpu-1x VMs with 256MB RAM
- **Paid:** Starts at ~$2/month per VM

For TimeGift:
- **Development:** Free tier is sufficient
- **Production:** 1-2 VMs should handle moderate traffic

## Comparison: Fly.io vs Vercel

| Feature | Fly.io | Vercel |
|---------|--------|--------|
| **Deployment** | Docker-based | Git-based |
| **Customization** | Full control | Limited |
| **Cron Jobs** | Manual setup | Built-in |
| **Cost** | Pay per VM | Free tier + usage |
| **Scaling** | Manual | Automatic |
| **Regions** | Choose region | Auto-distributed |

## Next Steps

1. ✅ Deploy to Fly.io
2. ✅ Set up custom domain (optional)
3. ✅ Configure Supabase OAuth
4. ✅ Set up cron jobs (optional)
5. ✅ Monitor and scale as needed

---

**Your TimeGift app is now running on Fly.io!** 🎉

Visit your app at: `https://timegift.fly.dev` (or your custom domain)

