import { supabase } from './supabase';
import type { 
  Business, 
  InsertBusiness, 
  User,
  Desk,
  InsertDesk,
  UpdateDesk,
  DateAvailability,
} from './database.types';

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
// DESK FUNCTIONS
// ============================================

// Get all desks for a business
export async function getDesksByBusinessId(businessId: string): Promise<Desk[]> {
  const { data, error } = await supabase
    .from('desks')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Desk[];
}

// Create a new desk
export async function createDesk(desk: InsertDesk): Promise<Desk> {
  const { data, error } = await supabase
    .from('desks')
    .insert(desk)
    .select()
    .single();

  if (error) throw error;
  return data as Desk;
}

// Update a desk
export async function updateDesk(id: string, updates: UpdateDesk): Promise<Desk> {
  const { data, error } = await supabase
    .from('desks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Desk;
}

// Delete a desk
export async function deleteDesk(id: string): Promise<void> {
  const { error } = await supabase
    .from('desks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// DATE AVAILABILITY FUNCTIONS
// One entry per day: open_time and close_time
// ============================================

// Get hours for a specific date (returns null if not set)
export async function getHoursForDate(
  businessId: string,
  date: string
): Promise<DateAvailability | null> {
  const { data, error } = await supabase
    .from('date_availability')
    .select('*')
    .eq('business_id', businessId)
    .eq('available_date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data as DateAvailability | null;
}

// Set hours for a specific date (upsert - creates or updates)
export async function setHoursForDate(
  businessId: string,
  date: string,
  openTime: string,
  closeTime: string
): Promise<DateAvailability> {
  const { data, error } = await supabase
    .from('date_availability')
    .upsert(
      {
        business_id: businessId,
        available_date: date,
        open_time: openTime,
        close_time: closeTime,
      },
      { onConflict: 'business_id,available_date' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as DateAvailability;
}

// Clear hours for a specific date
export async function clearHoursForDate(
  businessId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from('date_availability')
    .delete()
    .eq('business_id', businessId)
    .eq('available_date', date);

  if (error) throw error;
}

// Get all dates that have hours set (for calendar dots)
export async function getAvailableDates(
  businessId: string,
  startDate: string,
  endDate: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('date_availability')
    .select('available_date')
    .eq('business_id', businessId)
    .gte('available_date', startDate)
    .lte('available_date', endDate);

  if (error) throw error;
  
  return (data as { available_date: string }[]).map(d => d.available_date);
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
