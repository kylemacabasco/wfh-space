'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllBusinesses } from '@/lib/business';
import type { Business } from '@/lib/database.types';

export default function SpacesPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const data = await getAllBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Workspace
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Browse curated coffee shops, cafes, and workspaces where you can reserve a dedicated spot and work where you work best.
          </p>

          {/* Loading state */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="text-5xl mb-2 opacity-30">☕</div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && businesses.length === 0 && (
            <div className="py-20">
              <div className="text-6xl mb-6">🏠</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No spaces available yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We&apos;re just getting started! Check back soon for new workspaces in your area.
              </p>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          )}

          {/* Business listings */}
          {!loading && businesses.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Card
                  key={business.id}
                  onClick={() => setSelectedSpace(business.id)}
                  className={`cursor-pointer transition-all hover:shadow-xl ${
                    selectedSpace === business.id ? 'border-primary ring-4 ring-primary/20' : 'hover:border-primary/50'
                  }`}
                >
                  <CardHeader>
                    <div className="text-5xl mb-2">☕</div>
                    <CardTitle className="text-2xl">{business.name}</CardTitle>
                    <CardDescription className="text-base">
                      📍 {business.city}{business.state && `, ${business.state}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {business.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    {business.amenities && business.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {business.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {selectedSpace === business.id && (
                      <Button className="w-full">
                        Reserve This Spot
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA for non-signed in users */}
          {!isSignedIn && !loading && businesses.length > 0 && (
            <div className="mt-20 bg-primary text-white rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to reserve your spot?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Sign in to book a dedicated workspace at any of these locations.
              </p>
              <Link href="/sign-in">
                <Button size="lg" variant="secondary" className="px-12 py-6 text-xl shadow-lg">
                  Sign In to Book
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
