import { atom } from 'nanostores';
import type { User } from '@supabase/supabase-js';
import { supabaseClient } from '~/lib/services/supabaseAuth';
import { updateProfile } from '~/lib/stores/profile';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('AuthStore');

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
};

export const authStore = atom<AuthState>(initialState);

function syncToProfileStore(profile: UserProfile | null, user: User | null) {
  if (!profile && !user) {
    return;
  }

  updateProfile({
    username: profile?.username || user?.user_metadata?.full_name || user?.user_metadata?.user_name || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar_url || user?.user_metadata?.avatar_url || '',
  });
}

export async function initAuth() {
  if (!supabaseClient) {
    logger.info('Supabase client not available, skipping auth init');
    authStore.set({ ...authStore.get(), isLoading: false });
    return;
  }

  logger.info('Initializing auth...');

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session?.user) {
    logger.info('Existing session found for', session.user.email);
    const profile = await fetchProfile(session.user.id);
    authStore.set({
      user: session.user,
      profile,
      isLoading: false,
      isAuthenticated: true,
    });
    syncToProfileStore(profile, session.user);
  } else {
    logger.info('No existing session');
    authStore.set({ ...initialState, isLoading: false });
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    logger.info('Auth state changed:', event);

    if (event === 'SIGNED_IN' && session?.user) {
      logger.info('User signed in:', session.user.email);
      const profile = await fetchProfile(session.user.id);
      authStore.set({
        user: session.user,
        profile,
        isLoading: false,
        isAuthenticated: true,
      });
      syncToProfileStore(profile, session.user);
    } else if (event === 'SIGNED_OUT') {
      logger.info('User signed out');
      authStore.set({ ...initialState, isLoading: false });
      updateProfile({ username: '', bio: '', avatar: '' });
    }
  });
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabaseClient) {
    return null;
  }

  const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    logger.warn('Failed to fetch profile:', error.message);
    return null;
  }

  return data as UserProfile;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabaseClient) {
    throw new Error('Supabase not configured');
  }

  logger.info('Signing in with email:', email);

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    logger.error('Sign in failed:', error.message);
    throw error;
  }

  logger.info('Sign in successful');

  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabaseClient) {
    throw new Error('Supabase not configured');
  }

  logger.info('Signing up with email:', email);

  const { data, error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    logger.error('Sign up failed:', error.message);
    throw error;
  }

  logger.info('Sign up successful');

  return data;
}

export async function signInWithOAuth(provider: 'github' | 'google') {
  if (!supabaseClient) {
    throw new Error('Supabase not configured');
  }

  logger.info('Signing in with OAuth provider:', provider);

  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });

  if (error) {
    logger.error('OAuth sign in failed:', error.message);
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!supabaseClient) {
    return;
  }

  logger.info('Signing out...');
  await supabaseClient.auth.signOut();
}

export async function updateUserProfile(updates: { username?: string; bio?: string }) {
  const state = authStore.get();

  if (!supabaseClient || !state.user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', state.user.id)
    .select()
    .single();

  if (error) {
    logger.error('Failed to update profile:', error.message);
    throw error;
  }

  logger.info('Profile updated successfully');

  const updatedProfile = data as UserProfile;
  authStore.set({ ...authStore.get(), profile: updatedProfile });
  syncToProfileStore(updatedProfile, state.user);

  return updatedProfile;
}

export async function uploadAvatar(file: File): Promise<string> {
  const state = authStore.get();

  if (!supabaseClient || !state.user) {
    throw new Error('Not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${state.user.id}/avatar.${fileExt}`;

  const { error: uploadError } = await supabaseClient.storage.from('avatars').upload(filePath, file, { upsert: true });

  if (uploadError) {
    logger.error('Avatar upload failed:', uploadError.message);
    throw uploadError;
  }

  logger.info('Avatar uploaded successfully');

  const {
    data: { publicUrl },
  } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);

  // Add cache-buster to avoid stale avatars
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabaseClient
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', state.user.id);

  if (updateError) {
    throw updateError;
  }

  const profile = { ...state.profile!, avatar_url: avatarUrl };
  authStore.set({ ...authStore.get(), profile });
  syncToProfileStore(profile, state.user);

  return avatarUrl;
}
