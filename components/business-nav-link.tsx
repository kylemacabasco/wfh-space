'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { getBusinessByOwnerId, getUserByClerkId } from '@/lib/business';

export function BusinessNavLink() {
  const { user, isLoaded } = useUser();
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkBusiness() {
      if (!user) return;
      
      try {
        const dbUser = await getUserByClerkId(user.id);
        const business = await getBusinessByOwnerId(dbUser.id);
        setHasBusiness(!!business);
      } catch {
        setHasBusiness(false);
      }
    }

    if (isLoaded && user) {
      checkBusiness();
    }
  }, [isLoaded, user]);

  // Don't render until we know
  if (!isLoaded || hasBusiness === null) {
    return null;
  }

  return (
    <Link 
      href="/business/dashboard" 
      className="text-sm font-medium px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all"
    >
      {hasBusiness ? 'My Business' : 'List Your Space'}
    </Link>
  );
}

