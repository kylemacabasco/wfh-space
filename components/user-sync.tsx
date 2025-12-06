import { syncCurrentUser } from '@/lib/user-sync';

/**
 * Server component that syncs the current Clerk user to Supabase
 * Runs on page load when user is authenticated
 */
export async function UserSync() {
  try {
    await syncCurrentUser();
  } catch (error) {
    console.error('Failed to sync user:', error);
  }
  return null;
}
