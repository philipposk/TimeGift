'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase';

const supabase = getSupabaseBrowserClient();

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

export async function signIn(emailOrUsername: string, password: string): Promise<AuthUser> {
  let email = emailOrUsername;

  if (!emailOrUsername.includes('@')) {
    const { data: row } = await supabase
      .from('users')
      .select('email')
      .eq('username', emailOrUsername)
      .limit(1)
      .single();

    if (row?.email) {
      email = row.email;
    } else {
      throw new Error('User not found');
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Sign in failed');

  const profile = await getUserProfile(data.user.id);
  if (!profile) throw new Error('User profile not found');
  return profile;
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  displayName?: string
): Promise<AuthUser> {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Sign up failed');

  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    username,
    display_name: displayName || username,
    privacy_level: 'friends',
  });

  if (profileError) throw profileError;

  const profile = await getUserProfile(authData.user.id);
  if (!profile) throw new Error('Failed to create user profile');
  return profile;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signInWithFacebook(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getUserProfile(user.id);
}

async function getUserProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    username: data.username,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    isAdmin: data.is_admin,
  };
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
