'use client'
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#roles', label: 'Roles' },
  { href: '#docs', label: 'Docs' },
];

function Logo() {
  return (
    <Link
      href="/"
      className="text-lg font-semibold tracking-tight text-gray-900 hover:text-gray-700 transition-colors"
    >
      athenium
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const headerClasses = `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
    scrolled
      ? 'border-b border-gray-200/60 bg-white/75 backdrop-blur-md'
      : 'border-b border-transparent bg-white/40 backdrop-blur-sm'
  }`

  return (
    <header className={headerClasses}>
      <div className="container relative flex h-16 items-center justify-between px-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center text-sm text-gray-600 hover:text-gray-900 px-3 h-9 rounded-full hover:bg-gray-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 h-9 rounded-full pl-4 pr-3 transition-colors"
            >
              Get started
              <ChevronRight className="ml-0.5 h-4 w-4" />
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center text-sm text-gray-600 hover:text-gray-900 px-3 h-9 rounded-full hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <div className="ml-1.5">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
