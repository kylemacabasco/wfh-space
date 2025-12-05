import { syncCurrentUser } from '@/lib/user-sync';

/**
 * Server component that syncs the current Clerk user to Supabase
 * Add this to your layout to auto-sync users on page load
 */
export async function UserSync() {
  await syncCurrentUser();
  return null;
}

