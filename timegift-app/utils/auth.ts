// Re-export Supabase auth functions (client-side only)
export {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  signInWithFacebook,
  getCurrentUser,
  getSession,
  type AuthUser,
} from './auth-supabase';
