import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Check if Firebase is available
const isFirebaseAvailable = () => {
  return auth !== null && db !== null;
};

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

// Convert Firebase user to our AuthUser format
async function getUserProfile(userId: string): Promise<AuthUser | null> {
  if (!isFirebaseAvailable()) {
    return null;
  }
  try {
    const userDoc = await getDoc(doc(db!, 'users', userId));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      id: userId,
      email: data.email,
      username: data.username,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      isAdmin: data.is_admin || false,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function signIn(email: string, password: string) {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured. Please set up Firebase to use authentication.');
  }
  const userCredential = await signInWithEmailAndPassword(auth!, email, password);
  return { user: userCredential.user };
}

export async function signUp(email: string, password: string, username: string) {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured. Please set up Firebase to create an account.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  await setDoc(doc(db!, 'users', user.uid), {
    id: user.uid,
    email,
    username,
    display_name: username,
    privacy_level: 'friends',
    accept_stranger_gifts: false,
    opt_in_random_exchange: false,
    total_hours_gifted: 0,
    total_hours_received: 0,
    is_admin: false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return { user };
}

export async function signOut() {
  if (!isFirebaseAvailable()) {
    return;
  }
  await firebaseSignOut(auth!);
}

export async function signInWithGoogle() {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured. Please set up Firebase to use Google sign-in.');
  }
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth!, provider);
  
  // Create profile if doesn't exist
  const userDoc = await getDoc(doc(db!, 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db!, 'users', userCredential.user.uid), {
      id: userCredential.user.uid,
      email: userCredential.user.email,
      username: userCredential.user.email?.split('@')[0] || 'user',
      display_name: userCredential.user.displayName || userCredential.user.email?.split('@')[0],
      avatar_url: userCredential.user.photoURL,
      privacy_level: 'friends',
      accept_stranger_gifts: false,
      opt_in_random_exchange: false,
      total_hours_gifted: 0,
      total_hours_received: 0,
      is_admin: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  return { url: window.location.href };
}

export async function signInWithFacebook() {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured. Please set up Firebase to use Facebook sign-in.');
  }
  const provider = new FacebookAuthProvider();
  const userCredential = await signInWithPopup(auth!, provider);
  
  // Create profile if doesn't exist
  const userDoc = await getDoc(doc(db!, 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db!, 'users', userCredential.user.uid), {
      id: userCredential.user.uid,
      email: userCredential.user.email,
      username: userCredential.user.email?.split('@')[0] || 'user',
      display_name: userCredential.user.displayName || userCredential.user.email?.split('@')[0],
      avatar_url: userCredential.user.photoURL,
      privacy_level: 'friends',
      accept_stranger_gifts: false,
      opt_in_random_exchange: false,
      total_hours_gifted: 0,
      total_hours_received: 0,
      is_admin: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  return { url: window.location.href };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isFirebaseAvailable()) {
    return null;
  }
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      unsubscribe();
      if (!firebaseUser) {
        resolve(null);
        return;
      }
      const profile = await getUserProfile(firebaseUser.uid);
      resolve(profile);
    });
  });
}

export async function getSession() {
  if (!isFirebaseAvailable()) {
    return null;
  }
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      unsubscribe();
      resolve(user ? { user } : null);
    });
  });
}
