import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { UserSync } from '@/components/user-sync'
import Link from 'next/link'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "wfh",
  description: "Reserve dedicated spots at your favorite cafes and work where you work best.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserSync />
        <header className="flex justify-between items-center p-4 gap-4 h-16">
          <Link href="/" className="font-bold text-xl text-gray-900">
            ☕ WFH Space
          </Link>
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link 
                href="/business/dashboard" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                My Space
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
    </ClerkProvider>
  );
}
