import { supabase } from './supabase';
import type { Business, InsertBusiness, User } from './database.types';

// ============================================
// BUSINESS FUNCTIONS
// ============================================

// Get a business by owner's user ID (returns null if none exists)
export async function getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data as Business | null;
}

// Create a new business
export async function createBusiness(business: InsertBusiness): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .insert(business)
    .select()
    .single();

  if (error) throw error;
  return data as Business;
}

// ============================================
// USER HELPER
// ============================================

// Get user from database by their Clerk ID
export async function getUserByClerkId(clerkId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) throw error;
  return data as User;
}
