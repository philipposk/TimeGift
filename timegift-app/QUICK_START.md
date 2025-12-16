# 🚀 Quick Start - Run TimeGift Locally

## ⚠️ Important: Firebase Setup Required

The app has been migrated to Firebase and **requires Firebase credentials** to run. The `.env.local` file currently has Supabase credentials which won't work.

## What You Need

1. **Firebase Project** (free at https://console.firebase.google.com/)
2. **Firebase credentials** in `.env.local`

## Quick Setup Steps

### 1. Create Firebase Project
- Go to https://console.firebase.google.com/
- Click "Add project"
- Name it "TimeGift"
- Enable Google Analytics (optional)

### 2. Enable Authentication
- Go to **Authentication** → **Get started**
- Enable **Email/Password** sign-in
- Enable **Google** sign-in (optional)

### 3. Create Firestore Database
- Go to **Firestore Database** → **Create database**
- Start in **production mode**
- Choose location

### 4. Get Firebase Config
- Go to **Project Settings** (gear icon)
- Scroll to "Your apps"
- Click web icon (`</>`)
- Register app: "TimeGift Web"
- Copy the config values

### 5. Update .env.local

Replace the Supabase values with Firebase values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 6. Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste the rules from `FIREBASE_MIGRATION.md`

### 7. Run the App

```bash
cd timegift-app
npm install  # If not already done
npm run dev -- -p 3001
```

Visit: **http://localhost:3001**

---

## What the App Does

**TimeGift** lets you gift your personal time to others:

1. **Create a Time Gift:**
   - Choose recipient (email, phone, or friend)
   - Set time amount (e.g., "2 hours", "1 day")
   - Write a heartfelt message
   - Upload photo card (optional)
   - Set expiry date (optional)

2. **Recipient Receives:**
   - Gets notification (email/SMS/WhatsApp)
   - Sees gift in dashboard
   - Can accept and schedule

3. **Spend Time Together:**
   - Both get reminders
   - Mark as completed after

### Key Features:
- ✅ Friend system
- ✅ Privacy controls
- ✅ Time decay (unredeemed gifts lose value over time)
- ✅ Random gift exchange
- ✅ Admin panel
- ✅ Beautiful UI with dark/light mode

See `APP_WALKTHROUGH.md` for complete details!

---

## Current Status

✅ Code migrated to Firebase  
✅ All features implemented  
⚠️ **Needs Firebase setup to run**

Once Firebase is configured, the app will work perfectly!
