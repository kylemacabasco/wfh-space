import { currentUser } from '@clerk/nextjs/server';
import { supabase } from './supabase';
import type { User, InsertUser } from './database.types';

/**
 * Syncs the current Clerk user to Supabase
 * Creates the user if they don't exist, updates if they do
 */
export async function syncCurrentUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }
  
  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null;
  const avatar_url = clerkUser.imageUrl || null;

  // Upsert: insert or update if email exists (prevents duplicates)
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id: clerkUser.id,
        email,
        name,
        avatar_url,
      } as InsertUser,
      { onConflict: 'email' }
    )
    .select('*')
    .single();

  if (error) {
    console.error('Error syncing user:', error);
    return null;
  }

  return data as User | null;
}

/**
 * Get the current user's Supabase record (without syncing)
 */
export async function getCurrentDbUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkUser.id)
    .single();
  
  return data as User | null;
}
