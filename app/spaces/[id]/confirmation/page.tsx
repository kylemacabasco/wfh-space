'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getReservationById, getBusinessById, getDesksByBusinessId } from '@/lib/business';
import type { Reservation, Business, Desk } from '@/lib/database.types';
import { CheckCircle, Calendar, Clock } from 'lucide-react';

// Format hour for display (24h to 12h)
function formatTime(time: string): string {
  const [hours] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:00 ${period}`;
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const businessId = params.id as string;
  const reservationId = searchParams.get('reservation');

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [desk, setDesk] = useState<Desk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!reservationId || !businessId) {
        setError('Invalid reservation');
        setLoading(false);
        return;
      }

      try {
        const [reservationData, businessData, desksData] = await Promise.all([
          getReservationById(reservationId),
          getBusinessById(businessId),
          getDesksByBusinessId(businessId),
        ]);

        if (!reservationData) {
          setError('Reservation not found');
          setLoading(false);
          return;
        }

        setReservation(reservationData);
        setBusiness(businessData);
        
        const deskData = desksData.find(d => d.id === reservationData.desk_id);
        setDesk(deskData || null);
      } catch (err) {
        console.error('Failed to fetch reservation:', err);
        setError('Failed to load reservation details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [reservationId, businessId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !reservation || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Something went wrong'}</h2>
            <Link href="/spaces">
              <Button>Browse Spaces</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reservation Confirmed!
          </h1>
          <p className="text-gray-600">
            Your spot has been reserved. We&apos;ll see you there!
          </p>
        </div>

        {/* Reservation Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="text-3xl">☕</div>
              <div>
                <CardTitle>{business.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  {business.city}{business.state && `, ${business.state}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(reservation.reservation_date)}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">
                    {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                    <span className="text-gray-500 ml-2">
                      ({reservation.duration_hours} {reservation.duration_hours === 1 ? 'hour' : 'hours'})
                    </span>
                  </p>
                </div>
              </div>

              {/* Desk */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🪑</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Spot</p>
                  <p className="font-medium text-gray-900">
                    {desk?.name || 'Reserved Desk'}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-primary">${reservation.total_price}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Number */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-gray-500 mb-1">Confirmation Number</p>
          <p className="font-mono text-lg font-medium text-gray-900">
            {reservation.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/spaces" className="flex-1">
            <Button variant="outline" className="w-full">
              Browse More Spaces
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

