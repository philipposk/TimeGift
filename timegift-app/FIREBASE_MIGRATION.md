# Firebase Migration Guide

This app has been migrated from Supabase to Firebase. Here's what you need to do:

## 1. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "TimeGift" (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Enable **Email/Password** sign-in method
3. Enable **Google** sign-in provider
4. Enable **Facebook** sign-in provider (optional)
5. Add authorized domains:
   - `localhost` (for development)
   - `timegift.6x7.gr` (for production)
   - `your-vercel-app.vercel.app` (if using Vercel)

## 3. Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Start in **production mode** (we'll set up security rules)
3. Choose a location (closest to your users)
4. Click **Enable**

## 4. Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read public profiles or their own
      allow read: if isAuthenticated() && (
        resource.data.privacy_level == 'public' ||
        userId == request.auth.uid ||
        exists(/databases/$(database)/documents/friendships/$(userId + '_' + request.auth.uid)) ||
        exists(/databases/$(database)/documents/friendships/$(request.auth.uid + '_' + userId))
      );
      
      // Users can create/update their own profile
      allow create, update: if isAuthenticated() && userId == request.auth.uid;
    }
    
    // Gifts collection
    match /gifts/{giftId} {
      // Users can read their sent or received gifts
      allow read: if isAuthenticated() && (
        resource.data.sender_id == request.auth.uid ||
        resource.data.recipient_id == request.auth.uid
      );
      
      // Users can create gifts
      allow create: if isAuthenticated() && request.resource.data.sender_id == request.auth.uid;
      
      // Senders and recipients can update gifts
      allow update: if isAuthenticated() && (
        resource.data.sender_id == request.auth.uid ||
        resource.data.recipient_id == request.auth.uid
      );
    }
    
    // Friendships collection
    match /friendships/{friendshipId} {
      allow read: if isAuthenticated() && (
        resource.data.user_id == request.auth.uid ||
        resource.data.friend_id == request.auth.uid
      );
      
      allow create: if isAuthenticated() && request.resource.data.user_id == request.auth.uid;
      allow update: if isAuthenticated() && (
        resource.data.user_id == request.auth.uid ||
        resource.data.friend_id == request.auth.uid
      );
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, update: if isAuthenticated() && resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated();
    }
    
    // Admin settings collection
    match /admin_settings/{settingId} {
      allow read: if true; // Public read
      allow write: if isAdmin();
    }
    
    // Random exchange queue
    match /random_exchange_queue/{queueId} {
      allow read, write: if isAuthenticated() && resource.data.user_id == request.auth.uid;
    }
  }
}
```

## 5. Enable Storage (for photo cards)

1. Go to **Storage** → **Get started**
2. Start in production mode
3. Use the same security rules pattern as Firestore
4. Set up rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gifts/{giftId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the web icon (`</>`)
4. Register app with nickname "TimeGift Web"
5. Copy the config values

## 7. Set Environment Variables

Create `.env.local` file with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=https://timegift.6x7.gr
```

## 8. Create Indexes

Firestore requires indexes for complex queries. Go to **Firestore** → **Indexes** and create:

- Collection: `gifts`
  - Fields: `sender_id` (Ascending), `status` (Ascending)
  - Fields: `recipient_id` (Ascending), `status` (Ascending)
  - Fields: `status` (Ascending), `created_at` (Descending)

- Collection: `friendships`
  - Fields: `user_id` (Ascending), `status` (Ascending)
  - Fields: `friend_id` (Ascending), `status` (Ascending)

- Collection: `notifications`
  - Fields: `user_id` (Ascending), `is_read` (Ascending), `created_at` (Descending)

## 9. Migrate Data (if needed)

If you have existing Supabase data, you'll need to export it and import it to Firestore. Use the Firebase Admin SDK or a migration script.

## 10. Test Locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and test:
- Sign up
- Sign in
- Create a gift
- View dashboard

## Notes

- Firebase has a generous free tier (Spark plan)
- Firestore charges per read/write operation (very affordable for small apps)
- Storage has 5GB free storage
- Authentication is free for unlimited users

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Check browser console for client-side errors
3. Check Vercel logs for server-side errors
4. Review Firestore security rules
