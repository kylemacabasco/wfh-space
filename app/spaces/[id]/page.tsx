'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvailabilityCalendar, formatDateKey } from '@/components/availability-calendar';
import { getBusinessById, getDesksByBusinessId, getAvailableDates, getHoursForDate, createReservation, getUserByClerkId, isDeskAvailable, getReservationsForDeskOnDate } from '@/lib/business';
import type { Business, Desk, DateAvailability } from '@/lib/database.types';
import { ChevronLeft, Clock, Calendar, Minus, Plus, Loader2 } from 'lucide-react';

// Generate start time options (all hours from open to close-1)
function generateStartTimes(openTime: string, closeTime: string): number[] {
  const [openHour] = openTime.split(':').map(Number);
  const [closeHour] = closeTime.split(':').map(Number);
  
  const times: number[] = [];
  for (let hour = openHour; hour < closeHour; hour++) {
    times.push(hour);
  }
  return times;
}

// Format hour for display (24h to 12h)
function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHours = hour % 12 || 12;
  return `${displayHours}:00 ${period}`;
}

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isLoaded, isSignedIn, user } = useUser();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calendar state
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  
  // Selected date availability
  const [dateHours, setDateHours] = useState<DateAvailability | null>(null);
  const [loadingHours, setLoadingHours] = useState(false);
  
  // Time selection state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(1); // hours
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  
  // Booked hours state (to hide already reserved time slots)
  const [bookedHours, setBookedHours] = useState<Set<number>>(new Set());
  const [loadingBookedHours, setLoadingBookedHours] = useState(false);
  
  // Booking state
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch business and desks
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      try {
        const businessData = await getBusinessById(id);
        
        if (!businessData) {
          setError('Space not found');
          setLoading(false);
          return;
        }
        
        setBusiness(businessData);
        
        const desksData = await getDesksByBusinessId(id);
        setDesks(desksData);
      } catch (err) {
        console.error('Failed to fetch space:', err);
        setError('Failed to load space details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Fetch availability when month changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!id) return;
      
      try {
        const startDate = new Date(currentMonth.year, currentMonth.month, 1);
        const endDate = new Date(currentMonth.year, currentMonth.month + 1, 0);
        
        const dates = await getAvailableDates(
          id,
          formatDateKey(startDate),
          formatDateKey(endDate)
        );
        setAvailableDates(new Set(dates));
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      }
    }

    fetchAvailability();
  }, [id, currentMonth]);

  // Fetch hours when date is selected
  useEffect(() => {
    async function fetchHours() {
      if (!id || !selectedDate) {
        setDateHours(null);
        return;
      }
      
      setLoadingHours(true);
      setStartTime(null);
      setDuration(1);
      setSelectedDesk(null);
      
      try {
        const hours = await getHoursForDate(id, formatDateKey(selectedDate));
        setDateHours(hours);
      } catch (error) {
        console.error('Failed to fetch hours:', error);
        setDateHours(null);
      } finally {
        setLoadingHours(false);
      }
    }

    fetchHours();
  }, [id, selectedDate]);

  // Fetch booked hours when desk and date change
  useEffect(() => {
    async function fetchBookedHours() {
      if (!selectedDesk || !selectedDate) {
        setBookedHours(new Set());
        return;
      }

      setLoadingBookedHours(true);
      try {
        const reservations = await getReservationsForDeskOnDate(
          selectedDesk.id,
          formatDateKey(selectedDate)
        );
        
        // Convert reservations to a set of booked hours
        const booked = new Set<number>();
        reservations.forEach(res => {
          const startHour = parseInt(res.start_time.split(':')[0]);
          const endHour = parseInt(res.end_time.split(':')[0]);
          for (let hour = startHour; hour < endHour; hour++) {
            booked.add(hour);
          }
        });
        setBookedHours(booked);
      } catch (error) {
        console.error('Failed to fetch booked hours:', error);
        setBookedHours(new Set());
      } finally {
        setLoadingBookedHours(false);
      }
    }

    fetchBookedHours();
  }, [selectedDesk, selectedDate]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = direction === 'next' ? prev.month + 1 : prev.month - 1;
      if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      } else if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: newMonth };
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Calculate max duration based on start time, closing time, and next booked slot
  const getMaxDuration = (): number => {
    if (!dateHours || startTime === null) return 1;
    const [closeHour] = dateHours.close_time.split(':').map(Number);
    
    // Find the next booked hour after start time
    let maxByBooking = closeHour - startTime;
    for (let hour = startTime + 1; hour < closeHour; hour++) {
      if (bookedHours.has(hour)) {
        maxByBooking = hour - startTime;
        break;
      }
    }
    
    return maxByBooking;
  };

  const handleDurationChange = (change: number) => {
    const maxDuration = getMaxDuration();
    const newDuration = duration + change;
    if (newDuration >= 1 && newDuration <= maxDuration) {
      setDuration(newDuration);
    }
  };

  const allStartTimes = dateHours ? generateStartTimes(dateHours.open_time, dateHours.close_time) : [];
  // Filter out booked hours from available start times
  const startTimes = allStartTimes.filter(hour => !bookedHours.has(hour));
  const endTime = startTime !== null ? startTime + duration : null;
  const totalPrice = selectedDesk ? selectedDesk.hourly_rate * duration : 0;

  // Handle booking submission
  const handleBooking = async () => {
    if (!user || !business || !selectedDate || startTime === null || !selectedDesk || endTime === null) {
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Get the database user ID from Clerk ID
      const dbUser = await getUserByClerkId(user.id);
      
      // Prevent business owners from booking their own spots
      if (dbUser.id === business.owner_id) {
        setBookingError("You can't book a spot at your own business.");
        return;
      }
      
      // Format times as HH:MM:SS
      const startTimeStr = `${startTime.toString().padStart(2, '0')}:00:00`;
      const endTimeStr = `${endTime.toString().padStart(2, '0')}:00:00`;
      const dateStr = formatDateKey(selectedDate);
      
      // Check if the desk is still available (prevent double-booking)
      const available = await isDeskAvailable(selectedDesk.id, dateStr, startTimeStr, endTimeStr);
      if (!available) {
        setBookingError('This spot is no longer available for the selected time. Please choose a different time or spot.');
        return;
      }
      
      // Create the reservation
      const reservation = await createReservation({
        user_id: dbUser.id,
        business_id: business.id,
        desk_id: selectedDesk.id,
        reservation_date: dateStr,
        start_time: startTimeStr,
        end_time: endTimeStr,
        duration_hours: duration,
        total_price: totalPrice,
        status: 'confirmed',
      });

      // Redirect to confirmation page
      router.push(`/spaces/${id}/confirmation?reservation=${reservation.id}`);
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingError('Failed to complete booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Space not found'}</h2>
            <p className="text-gray-600 mb-8">We couldn&apos;t find the workspace you&apos;re looking for.</p>
            <Link href="/spaces">
              <Button>Browse All Spaces</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/spaces" 
              className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-3xl">☕</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {business.name}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  {business.city}{business.state && `, ${business.state}`}
                </p>
              </div>
            </div>
          </div>
          {business.amenities && business.amenities.length > 0 && (
            <div className="hidden md:flex flex-wrap gap-1.5">
              {business.amenities.slice(0, 4).map((amenity, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Top Row: Calendar + Available Spots (2 columns) */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Calendar */}
          <AvailabilityCalendar
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            availableDates={availableDates}
            onMonthChange={handleMonthChange}
            onDateSelect={handleDateSelect}
            description="Select a date to see available spots"
          />

          {/* Available Spots Panel */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🪑</div>
                <div>
                  <CardTitle className="text-lg">Available Spots</CardTitle>
                  <CardDescription className="text-xs">
                    {!selectedDate || !dateHours ? 'Select an available date first' : 'Choose your workspace'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedDate && (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a date to see available spots</p>
                </div>
              )}

              {selectedDate && loadingHours && (
                <div className="text-center py-8 text-gray-400 animate-pulse text-sm">
                  Loading…
                </div>
              )}

              {selectedDate && !loadingHours && !dateHours && (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Not available on this date</p>
                </div>
              )}

              {selectedDate && !loadingHours && dateHours && desks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-3">🪑</div>
                  <p className="text-sm">No spots available</p>
                </div>
              )}

              {selectedDate && !loadingHours && dateHours && desks.length > 0 && (
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {desks.map((desk) => (
                    <div
                      key={desk.id}
                      onClick={() => {
                        // Reset time if switching desks (booked hours may differ)
                        if (selectedDesk?.id !== desk.id) {
                          setStartTime(null);
                          setDuration(1);
                        }
                        setSelectedDesk(desk);
                      }}
                      className={`
                        p-4 bg-white rounded-lg border transition-all hover:shadow-md cursor-pointer
                        ${selectedDesk?.id === desk.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{desk.name}</h4>
                        <span className="text-primary font-semibold">${desk.hourly_rate}/hr</span>
                      </div>
                      {desk.description && (
                        <p className="text-gray-500 text-sm mt-1">{desk.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Time Selection + Booking Summary */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🕐</div>
              <div>
                <CardTitle className="text-lg">
                  {selectedDate && selectedDesk
                    ? `${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${selectedDesk.name}`
                    : 'Select Time'
                  }
                </CardTitle>
                <CardDescription className="text-xs">
                  {!selectedDate 
                    ? 'Select a date first' 
                    : !selectedDesk 
                      ? 'Select a spot first'
                      : 'Choose your time slot'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(!selectedDate || !selectedDesk) && (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {!selectedDate ? 'Select a date to continue' : 'Select a spot to see available times'}
                </p>
              </div>
            )}

            {selectedDate && selectedDesk && loadingBookedHours && (
              <div className="text-center py-8 text-gray-400 animate-pulse text-sm">
                Loading available times…
              </div>
            )}

            {selectedDate && selectedDesk && !loadingBookedHours && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Time Slots */}
                <div className="flex-1">
                  {startTimes.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No times available for this spot</p>
                      <p className="text-xs mt-1">Try selecting a different spot</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                        {startTimes.map((hour) => (
                          <Button
                            key={hour}
                            variant={startTime === hour ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setStartTime(hour);
                              setDuration(1);
                            }}
                            className="text-xs"
                          >
                            {formatHour(hour)}
                          </Button>
                        ))}
                      </div>

                      {startTime !== null && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Duration</span>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => handleDurationChange(-1)}
                                disabled={duration <= 1}
                                className="h-8 w-8"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-base font-semibold w-20 text-center">
                                {duration} {duration === 1 ? 'hour' : 'hours'}
                              </span>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => handleDurationChange(1)}
                                disabled={duration >= getMaxDuration()}
                                className="h-8 w-8"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Booking Summary - Right Side */}
                {startTime !== null && (
                  <div className="lg:w-72 flex-shrink-0 lg:border-l lg:pl-6">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100 mb-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {formatHour(startTime)} – {formatHour(endTime!)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Spot</span>
                        <span className="font-medium text-gray-900">{selectedDesk.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Rate</span>
                        <span className="font-medium text-gray-900">${selectedDesk.hourly_rate}/hr × {duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-lg py-3 border-t border-gray-200 mb-4">
                      <span className="text-gray-900 font-semibold">Total</span>
                      <span className="text-primary font-bold">${totalPrice}</span>
                    </div>
                    
                    {bookingError && (
                      <p className="text-red-500 text-sm mb-3">{bookingError}</p>
                    )}
                    
                    {isSignedIn ? (
                      <Button 
                        className="w-full" 
                        onClick={handleBooking}
                        disabled={isBooking}
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Booking…
                          </>
                        ) : (
                          'Confirm Reservation'
                        )}
                      </Button>
                    ) : (
                      <Link href="/sign-in" className="block">
                        <Button className="w-full">
                          Sign In to Reserve
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
