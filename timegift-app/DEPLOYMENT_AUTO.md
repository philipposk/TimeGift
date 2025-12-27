# Automatic Deployment Guide

## 🚀 Auto-Deploy Workflow

After every code change, the following workflow is automatically executed:

### Step 1: Commit & Push to GitHub
```bash
cd "/Users/phktistakis/Devoloper Projects/TimeGift"
git add -A
git commit -m "Descriptive commit message"
git push origin HEAD:main
```

### Step 2: Deploy to timegift.6x7.gr

**Option A: Vercel Auto-Deploy (Recommended)**
- If Vercel is connected to GitHub repo, it auto-deploys on push to `main`
- Check deployment status: https://vercel.com/dashboard
- Site URL: https://timegift.6x7.gr

**Option B: Manual Vercel CLI**
```bash
cd timegift-app
vercel --prod
```

**Option C: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Find "TimeGift" project
3. Click "Redeploy" → "Production"

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] Changes are committed to GitHub
- [ ] Push to main branch successful
- [ ] Vercel deployment triggered (check dashboard)
- [ ] Site is live at https://timegift.6x7.gr
- [ ] No build errors in Vercel logs
- [ ] Environment variables are set correctly

---

## 🔧 Vercel Configuration

**Project Settings:**
- Framework: Next.js
- Root Directory: `timegift-app`
- Build Command: `npm run build`
- Output Directory: `.next`

**Environment Variables (Required):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_APP_URL` = `https://timegift.6x7.gr`
- `OPENAI_API_KEY` (optional, for AI features)
- `GROQ_API_KEY` (optional, for AI features)

**Custom Domain:**
- Domain: `timegift.6x7.gr`
- DNS: CNAME to `cname.vercel-dns.com` (or A records)

---

## 📝 Notes

- **Auto-Deploy**: If Vercel is connected to GitHub, every push to `main` triggers a deployment
- **Manual Deploy**: Use `vercel --prod` if auto-deploy is disabled
- **Preview Deploys**: Pull requests get preview deployments automatically
- **Build Time**: ~2-3 minutes for full deployment
- **Zero Downtime**: Vercel uses blue-green deployment

---

## 🆘 Troubleshooting

**Deployment Fails:**
1. Check Vercel build logs for errors
2. Verify all environment variables are set
3. Ensure `npm run build` works locally
4. Check GitHub connection in Vercel dashboard

**Site Not Updating:**
1. Clear browser cache
2. Check Vercel deployment status
3. Verify DNS records are correct
4. Wait 2-3 minutes for DNS propagation

**Build Errors:**
1. Test build locally: `npm run build`
2. Check for TypeScript errors
3. Verify all dependencies are in `package.json`
4. Check Node.js version (should be 18+)










