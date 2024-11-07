'use client'
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <header>
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold">
            athenium
          </Link>
        </div>
        <div className='space-x-7'>
        <Link href="" className="text-2xl">
            about
          </Link>
          <Link href="" className="text-2xl">
            changelog
          </Link>
          <Link href="" className="text-2xl">
            docs
          </Link>
        </div>
        <div className='space-x-3'>
        <SignedOut>
          <button
            onClick={handleSignIn}
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800 focus:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:bg-gray-200"
          >
            Sign In
          </button>
          <button 
            onClick={handleSignUp}
            className='bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800 focus:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:bg-gray-200'
           >
            Get Started
           </button>
        </SignedOut>
        </div>

        <SignedIn> 
          <div className='flex gap-5'>
          <Link href="/dashboard"
            className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800 focus:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:bg-gray-200"
          >
            Dashboard
          </Link>
          <UserButton />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}