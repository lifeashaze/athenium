'use client'
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ChevronDown,Play,Menu  } from "lucide-react"
import { useState } from 'react';

export function Header() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <header className="relative overflow-visible">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold mb-2">
            athenium
          </Link>
        </div>
        
        <div className='flex space-x-3 items-center'>
          <SignedOut>
            <button
              onClick={handleSignIn}
              className="bg-[#D9D9D9] text-black px-3 py-2 rounded-md text-xs font-semibold transition-colors hover:bg-gray-200 flex items-center h-[26px]"
            >
              Sign In
            </button>
            <button 
              onClick={handleSignUp}
              className="bg-[#9966CC] text-white px-5 py-2 rounded-md text-xs font-semibold transition-colors hover:bg-[#B48DDB] flex items-center h-[26px]"
            >
              Get Started <Play fill='white' color="white" size={6} className="ml-1"/>
            </button>
          </SignedOut>

          <SignedIn>
            <div className='flex gap-3'>
              <Link href="/dashboard"
                className="bg-[#9966CC] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#B48DDB]"
              >
                Dashboard
              </Link>
              <div className='hidden md:flex'>
                <UserButton />
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}