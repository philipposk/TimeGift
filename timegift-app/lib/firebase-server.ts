// Server-side Firebase helpers for API routes
// Note: Firebase Admin SDK would be better for server-side, but for simplicity
// we'll use the client SDK with proper security rules

import { auth, db } from './firebase';
import { getAuth } from 'firebase/auth';
import { getDoc, doc, query, where, getDocs, collection } from 'firebase/firestore';

// Get current user from request headers (token)
// This is a simplified version - in production, you'd verify the token properly
export async function getServerUser(request: Request) {
  try {
    // In a real implementation, you'd extract the Firebase ID token from headers
    // and verify it using Firebase Admin SDK
    // For now, this is a placeholder that will need proper implementation
    
    // The client should send the Firebase ID token in the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    
    // TODO: Verify token using Firebase Admin SDK
    // For now, we'll need to handle auth on the client side and pass user ID
    
    return null;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

// Helper to get user by ID
export async function getUserById(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Helper to find user by email
export async function getUserByEmail(email: string) {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Helper to find user by phone
export async function getUserByPhone(phone: string) {
  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting user by phone:', error);
    return null;
  }
}
