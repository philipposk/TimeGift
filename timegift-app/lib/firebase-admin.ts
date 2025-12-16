// Firebase Admin SDK for server-side operations
// This is used in API routes for secure server-side operations

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
const adminAuth: Auth = getAuth(app);
const adminDb: Firestore = getFirestore(app);

// Initialize Firebase Admin
if (getApps().length === 0) {
  // For server-side, we can use service account or application default credentials
  // For Vercel, we'll use environment variables
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // Fallback: use default credentials (works on Vercel with env vars)
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
      } else {
        app = getApps()[0];
      }

export { adminAuth, adminDb };

// Verify Firebase ID token from request
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

// Get user from request (extracts token from Authorization header)
export async function getServerUser(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}
