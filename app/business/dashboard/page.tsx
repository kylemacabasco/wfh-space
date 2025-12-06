'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AvailabilityCalendar, formatDateKey } from '@/components/availability-calendar';
import {
  getBusinessByOwnerId,
  getDesksByBusinessId,
  getHoursForDate,
  getAvailableDates,
  setHoursForDate,
  clearHoursForDate,
  getUserByClerkId,
  createDesk,
  updateDesk,
  deleteDesk,
} from '@/lib/business';
import type { Business, Desk, DateAvailability } from '@/lib/database.types';
import { Plus, Trash2, Edit2, Save, X, Clock, Calendar } from 'lucide-react';

// Helper to format time for display
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export default function BusinessDashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [business, setBusiness] = useState<Business | null>(null);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  
  // Hours for selected date
  const [selectedDateHours, setSelectedDateHours] = useState<DateAvailability | null>(null);
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  const [hoursForm, setHoursForm] = useState({ open_time: '09:00', close_time: '17:00' });
  const [isSavingHours, setIsSavingHours] = useState(false);

  // Desk form state
  const [showDeskForm, setShowDeskForm] = useState(false);
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [deskForm, setDeskForm] = useState({
    name: '',
    description: '',
    hourly_rate: '',
  });

  // Load available dates for the current month view
  const loadAvailableDates = useCallback(async (businessId: string, year: number, month: number) => {
    const startDate = formatDateKey(new Date(year, month, 1));
    const endDate = formatDateKey(new Date(year, month + 1, 0));
    
    try {
      const dates = await getAvailableDates(businessId, startDate, endDate);
      setAvailableDates(new Set(dates));
    } catch (err) {
      console.error('Error loading available dates:', err);
    }
  }, []);

  // Load hours for selected date
  const loadHoursForDate = useCallback(async (businessId: string, date: Date) => {
    setIsLoadingHours(true);
    try {
      const dateStr = formatDateKey(date);
      const hours = await getHoursForDate(businessId, dateStr);
      setSelectedDateHours(hours);
      
      // Pre-fill form with existing hours or defaults
      if (hours) {
        setHoursForm({
          open_time: hours.open_time.slice(0, 5), // Convert HH:MM:SS to HH:MM
          close_time: hours.close_time.slice(0, 5),
        });
      } else {
        setHoursForm({ open_time: '09:00', close_time: '17:00' });
      }
    } catch (err) {
      console.error('Error loading hours:', err);
      setSelectedDateHours(null);
    } finally {
      setIsLoadingHours(false);
    }
  }, []);

  const loadDashboardData = useCallback(async (clerkId: string) => {
    try {
      const dbUser = await getUserByClerkId(clerkId);
      const businessData = await getBusinessByOwnerId(dbUser.id);

      if (!businessData) {
        router.push('/business/new');
        return;
      }

      setBusiness(businessData);

      try {
        const desksData = await getDesksByBusinessId(businessData.id);
        setDesks(desksData || []);
        await loadAvailableDates(businessData.id, currentMonth.year, currentMonth.month);
      } catch (tableErr: unknown) {
        const tableError = tableErr as { code?: string };
        if (tableError.code === '42P01') {
          setError('Please run migrations in Supabase SQL Editor');
        } else {
          console.error('Error loading data:', tableErr);
        }
      }
    } catch (err: unknown) {
      console.error('Error loading dashboard:', err);
      const error = err as { message?: string };
      setError(error.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [router, currentMonth, loadAvailableDates]);

  useEffect(() => {
    if (isLoaded && user) {
      loadDashboardData(user.id);
    } else if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, loadDashboardData, router]);

  // Reload available dates when month changes
  useEffect(() => {
    if (business) {
      loadAvailableDates(business.id, currentMonth.year, currentMonth.month);
    }
  }, [business, currentMonth, loadAvailableDates]);

  // Load hours when date is selected
  useEffect(() => {
    if (business && selectedDate) {
      loadHoursForDate(business.id, selectedDate);
    }
  }, [business, selectedDate, loadHoursForDate]);

  // Calendar handlers
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      if (direction === 'prev') {
        if (prev.month === 0) {
          return { year: prev.year - 1, month: 11 };
        }
        return { ...prev, month: prev.month - 1 };
      } else {
        if (prev.month === 11) {
          return { year: prev.year + 1, month: 0 };
        }
        return { ...prev, month: prev.month + 1 };
      }
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSaveHours = async () => {
    if (!business || !selectedDate) return;

    if (hoursForm.open_time >= hoursForm.close_time) {
      setError('Close time must be after open time');
      return;
    }

    setIsSavingHours(true);
    setError(null);

    try {
      const dateStr = formatDateKey(selectedDate);
      const saved = await setHoursForDate(
        business.id,
        dateStr,
        hoursForm.open_time,
        hoursForm.close_time
      );
      
      setSelectedDateHours(saved);
      setAvailableDates(prev => new Set([...prev, dateStr]));
      setSuccess('Hours saved!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving hours:', err);
      setError('Failed to save hours');
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleClearHours = async () => {
    if (!business || !selectedDate) return;

    try {
      const dateStr = formatDateKey(selectedDate);
      await clearHoursForDate(business.id, dateStr);
      
      setSelectedDateHours(null);
      setHoursForm({ open_time: '09:00', close_time: '17:00' });
      setAvailableDates(prev => {
        const next = new Set(prev);
        next.delete(dateStr);
        return next;
      });
      
      setSuccess('Hours cleared!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error clearing hours:', err);
      setError('Failed to clear hours');
    }
  };

  // Desk handlers
  const resetDeskForm = () => {
    setDeskForm({ name: '', description: '', hourly_rate: '' });
    setEditingDesk(null);
    setShowDeskForm(false);
  };

  const handleEditDesk = (desk: Desk) => {
    setEditingDesk(desk);
    setDeskForm({
      name: desk.name,
      description: desk.description || '',
      hourly_rate: desk.hourly_rate.toString(),
    });
    setShowDeskForm(true);
  };

  const handleSaveDesk = async () => {
    if (!business) return;
    setError(null);

    try {
      const deskData = {
        name: deskForm.name,
        description: deskForm.description || null,
        hourly_rate: parseFloat(deskForm.hourly_rate),
      };

      if (editingDesk) {
        const updated = await updateDesk(editingDesk.id, deskData);
        setDesks(prev => prev.map(d => (d.id === updated.id ? updated : d)));
        setSuccess('Desk updated!');
      } else {
        const created = await createDesk({ ...deskData, business_id: business.id });
        setDesks(prev => [...prev, created]);
        setSuccess('Desk added!');
      }

      setTimeout(() => setSuccess(null), 3000);
      resetDeskForm();
    } catch (err) {
      console.error('Error saving desk:', err);
      setError('Failed to save desk.');
    }
  };

  const handleDeleteDesk = async (deskId: string) => {
    if (!confirm('Are you sure you want to delete this desk?')) return;

    try {
      await deleteDesk(deskId);
      setDesks(prev => prev.filter(d => d.id !== deskId));
      setSuccess('Desk deleted!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting desk:', err);
      setError('Failed to delete desk.');
    }
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading dashboard…</div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">☕</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm text-gray-500">
                {business.city}{business.state ? `, ${business.state}` : ''}
              </p>
            </div>
          </div>
          {business.amenities && business.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {business.amenities.slice(0, 3).map((amenity, i) => (
                <Badge key={i} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                  {amenity}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
            {error}
            <button className="ml-2 underline" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {/* Calendar Section */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AvailabilityCalendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              availableDates={availableDates}
              onMonthChange={handleMonthChange}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Right Column: Hours + Desks */}
          <div className="space-y-4">
            {/* Hours Panel */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🕐</div>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedDate 
                        ? selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'Select a Date'
                      }
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedDate ? 'Set open & close times' : 'Click a date on the calendar'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <div className="text-center py-4 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Select a date to set hours</p>
                  </div>
                ) : isLoadingHours ? (
                  <div className="text-center py-4 text-gray-400 animate-pulse text-sm">
                    Loading…
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Current hours display */}
                    {selectedDateHours && (
                      <div className="p-2.5 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium">
                            Open {formatTime(selectedDateHours.open_time)} – {formatTime(selectedDateHours.close_time)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Hours form */}
                    <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-gray-600 text-xs mb-1 block">Open</Label>
                          <Input
                            type="time"
                            value={hoursForm.open_time}
                            onChange={e => setHoursForm(prev => ({ ...prev, open_time: e.target.value }))}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-600 text-xs mb-1 block">Close</Label>
                          <Input
                            type="time"
                            value={hoursForm.close_time}
                            onChange={e => setHoursForm(prev => ({ ...prev, close_time: e.target.value }))}
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveHours}
                          disabled={isSavingHours}
                          className="flex-1 h-9"
                          size="sm"
                        >
                          <Save className="w-3.5 h-3.5 mr-1.5" />
                          {isSavingHours ? 'Saving…' : 'Save Hours'}
                        </Button>
                        {selectedDateHours && (
                          <Button
                            onClick={handleClearHours}
                            variant="outline"
                            size="sm"
                            className="h-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Desks Panel */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🪑</div>
                    <div>
                      <CardTitle className="text-lg">Your Desks</CardTitle>
                      <CardDescription className="text-xs">Bookable workspaces</CardDescription>
                    </div>
                  </div>
                  {!showDeskForm && (
                    <Button size="sm" onClick={() => setShowDeskForm(true)} className="h-8">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Desk Form */}
                {showDeskForm && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {editingDesk ? 'Edit Desk' : 'New Desk'}
                      </h4>
                      <Button variant="ghost" size="icon-sm" onClick={resetDeskForm}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-gray-600 text-xs mb-1 block">Name *</Label>
                        <Input
                          placeholder="e.g., Desk 1"
                          value={deskForm.name}
                          onChange={e => setDeskForm(prev => ({ ...prev, name: e.target.value }))}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-600 text-xs mb-1 block">Hourly Rate ($) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="e.g., 15.00"
                          value={deskForm.hourly_rate}
                          onChange={e => setDeskForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-600 text-xs mb-1 block">Description</Label>
                        <Input
                          placeholder="Optional description…"
                          value={deskForm.description}
                          onChange={e => setDeskForm(prev => ({ ...prev, description: e.target.value }))}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveDesk} disabled={!deskForm.name || !deskForm.hourly_rate} size="sm" className="w-full h-9">
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {editingDesk ? 'Update' : 'Add Desk'}
                    </Button>
                  </div>
                )}

                {/* Desk List */}
                {desks.length === 0 && !showDeskForm ? (
                  <div className="text-center py-4 text-gray-400">
                    <div className="text-3xl mb-2">🪑</div>
                    <p className="text-xs">No desks yet. Add workspaces that users can book.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {desks.map(desk => (
                      <div
                        key={desk.id}
                        className="p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 text-sm truncate">{desk.name}</h4>
                              <span className="text-primary text-xs font-medium">${desk.hourly_rate}/hr</span>
                            </div>
                            {desk.description && (
                              <p className="text-gray-500 text-xs mt-0.5 truncate">{desk.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleEditDesk(desk)}
                              className="h-7 w-7"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteDesk(desk.id)}
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
