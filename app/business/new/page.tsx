'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createBusiness, getUserByClerkId } from '@/lib/business';
import { X, Plus, ArrowRight } from 'lucide-react';

const SUGGESTED_AMENITIES = [
  'Wi-Fi',
  'Power Outlets',
  'Coffee',
  'Tea',
  'Snacks',
  'Quiet Zone',
  'Phone Booths',
  'Meeting Rooms',
  'Outdoor Seating',
  'Dog Friendly',
  'Parking',
  'Air Conditioning',
];

export default function NewBusinessPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    amenities: [] as string[],
  });

  const [customAmenity, setCustomAmenity] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()],
      }));
      setCustomAmenity('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get the user's database ID from their Clerk ID
      const dbUser = await getUserByClerkId(user.id);
      
      await createBusiness({
        owner_id: dbUser.id,
        name: formData.name,
        description: formData.description || null,
        address: formData.address,
        city: formData.city,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        amenities: formData.amenities,
      });

      router.push('/');
    } catch (err) {
      console.error('Error creating business:', err);
      setError('Failed to create business. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">🔐</div>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>Please sign in to list your space.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">☕</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">List Your Space</h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Turn your coffee shop or workspace into a destination for remote workers. 
            Fill out the details below to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Business Info Card */}
          <Card className="mb-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">🏢</div>
              <CardTitle className="text-xl">Business Details</CardTitle>
              <CardDescription>Tell us about your space</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., The Roastery Coffee House"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your space, the vibe, what makes it great for working..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="resize-none"
                />
              </div>

            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="mb-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">📍</div>
              <CardTitle className="text-xl">Location</CardTitle>
              <CardDescription>Where can people find you?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="San Francisco"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="CA"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    placeholder="94102"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities Card */}
          <Card className="mb-8 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">✨</div>
              <CardTitle className="text-xl">Amenities</CardTitle>
              <CardDescription>What do you offer?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_AMENITIES.map(amenity => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? 'default' : 'secondary'}
                    className={`cursor-pointer text-sm py-1.5 px-3 transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'bg-primary hover:bg-primary/90'
                        : 'hover:bg-gray-200'
                    }`}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>

              {/* Custom amenities */}
              {formData.amenities.filter(a => !SUGGESTED_AMENITIES.includes(a)).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {formData.amenities
                    .filter(a => !SUGGESTED_AMENITIES.includes(a))
                    .map(amenity => (
                      <Badge
                        key={amenity}
                        className="bg-primary hover:bg-primary/90 cursor-pointer text-sm py-1.5 px-3"
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {amenity}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom amenity..."
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAmenity();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addCustomAmenity}
                  disabled={!customAmenity.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !formData.name || !formData.address || !formData.city}
            className="w-full py-6 text-lg"
          >
            {isSubmitting ? (
              'Creating...'
            ) : (
              <>
                Submit Your Space
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            We&apos;ll review your submission and get back to you soon.
          </p>
        </form>
      </div>
    </div>
  );
}
