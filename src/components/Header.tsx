'use client'
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ChevronDown,Play,Menu  } from "lucide-react"
import { useState } from 'react';
import { Hamburger } from  './LandingSidebar'

export function Header() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); 
  };

  return (
    <header className="relative overflow-visible">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden md:flex text-2xl font-bold mb-2">
            athenium
          </Link>
        </div>
        <div className="hidden md:flex flex-grow justify-center">
        <div className='text-xs text-[#696969] font-semibold flex justify-between space-x-7 '>
        <Link href="" >
            about
          </Link>
          <Link href="" >
            changelog
          </Link>
          <Link href="" className="flex items-center">
          
            docs <ChevronDown className="h-3 w-3 ml-0.5 mt-0.5" />
          
          </Link>
        </div>
        </div>
        <div className='hidden md:flex space-x-3 flex items-center'>
        <SignedOut>
          <button
            onClick={handleSignIn}
            className="bg-[#D9D9D9] text-black px-3 py-2 rounded-md text-xs font-semibold transition-colors hover:bg-gray-200 flex items-center h-[26px]  "
          >
            Sign In
          </button>
          <button 
            onClick={handleSignUp}
            className="bg-[#9966CC] text-black px-5 py-2 rounded-md text-xs font-semibold transition-colors hover:bg-[#B48DDB] flex items-center h-[26px] "
           >
            Get Started <Play fill='#6A0DAD' color="#6A0DAD" size={6} className="ml-1"/>
           </button>
        </SignedOut>
        </div>

        <SignedIn> 
          <div className='flex gap-3'>
          <Link href="/dashboard"
            className="hidden md:flex bg-[#9966CC] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#B48DDB] focus:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:bg-gray-200"
          >
            Dashboard
          </Link>
          <div className='hidden md:flex'>
          <UserButton />
          </div>
          
          </div>
        </SignedIn>
        <div className="md:hidden flex items-center">
      
      </div>

      </div>
      <div className='md:hidden '>
      <div
        className="absolute  z-[9999]   "
      
      >
        <Hamburger/>
     </div>

     <div className=' absolute text-2xl top-3 right-4 font-bold mb-2 '>
      athenium
     </div>
     </div>

      {/* <div
    className={`absolute top-16 right-0 w-[150px] bg-white shadow-lg p-4 flex flex-col space-y-3 z-[9999] md:hidden overflow-visible ${
      isMenuOpen ? "block" : "hidden"
    }`}
     >
    
    <SignedOut>
      <button
        onClick={handleSignIn}
        className="bg-[#D9D9D9] text-black px-3 py-2 rounded-md text-xs font-semibold transition-colors hover:bg-gray-200 flex items-center"
      >
        Sign In
      </button>
      <button
        onClick={handleSignUp}
        className="bg-[#9966CC] text-black px-5 py-2 rounded-md text-xs font-semibold transition-colors hover:bg-primary-hover flex items-center"
      >
        Get Started
      </button>
    </SignedOut>
    <SignedIn >
    <div className='flex space-x-2'>
      <UserButton />
      
      <Link
        href="/dashboard"
        className=" text-black px-2 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-800"
      >
        Dashboard
      </Link>
      </div>
      
      
    </SignedIn>
    <Link href="">about</Link>
    <Link href="">changelog</Link>
    <Link href="">
      docs 
    </Link>
  </div> */}

     
      


      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black to-transparent"></div>
    </header>
  );
}