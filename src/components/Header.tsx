'use client'
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Play } from "lucide-react"

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
        <Link href="/" className="text-2xl font-bold text-black dark:text-white">
          athenium
        </Link>
        
        <div className='flex space-x-3 items-center'>
          <SignedOut>
            <button
              onClick={handleSignIn}
              className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-3 py-2 rounded-md text-xs font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center h-[26px]"
            >
              Sign In
            </button>
            <button 
              onClick={handleSignUp}
              className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-md text-xs font-semibold transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 flex items-center h-[26px]"
            >
              Get Started <Play size={6} className="ml-1"/>
            </button>
          </SignedOut>

          <SignedIn>
            <div className='flex gap-3'>
              <Link href="/dashboard"
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800 dark:hover:bg-gray-200"
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