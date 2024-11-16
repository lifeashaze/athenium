"use client";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Fade in animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

// Remove the images array and replace with single image
const heroImage = {
  url: "/images/athena2.jpg",
  alt: "Statue of Athena"
};

// Update the button hover animation to be more subtle
const buttonHover = {
  initial: { 
    scale: 1,
    boxShadow: "0px 0px 0px rgba(0,0,0,0)",
  },
  hover: { 
    scale: 1.01, // Reduced scale effect
    boxShadow: "0px 2px 12px rgba(0,0,0,0.08)", // Softer shadow
    transition: { 
      duration: 0.2, // Faster transition
      ease: "easeOut" 
    }
  }
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAFA]">
      {/* <Header /> */}
      
      <main className="grid grid-cols-1 md:grid-cols-2 h-screen">
        {/* Content Section */}
        <motion.div 
          className="flex flex-col justify-center px-8 md:px-16 bg-white"
          initial="hidden"
          animate={isMounted ? "visible" : "hidden"}
          variants={fadeIn}
        >
          <div className="bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-sm">
            <h1 className="font-serif text-7xl md:text-8xl mb-6 text-gray-900 tracking-tight">
              athenium
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light tracking-wide">
              elevating academic excellence through intelligent management.
            </p>
            
            {/* Updated feature list */}
            <div className="space-y-2 mb-8">
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                • streamlined classroom management and assignment tracking
              </p>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                • integrated code execution environment for programming courses
              </p>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                • real-time collaboration tools and resource sharing
              </p>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                • personalized dashboards with study tools and analytics
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <Button 
                asChild 
                className="w-full md:w-auto px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 transition-all duration-300 ease-out"
              >
                <motion.div
                  variants={buttonHover}
                  initial="initial"
                  whileHover="hover"
                  whileTap={{ scale: 0.75 }} // More subtle tap effect
                >
                  <Link href="/sign-up" className="w-full block text-center">
                    begin your journey
                  </Link>
                </motion.div>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Image Section - Added back 'hidden' class */}
        <motion.div 
          className="relative hidden md:flex h-screen" // Added back 'hidden md:flex'
          initial="hidden"
          animate={isMounted ? "visible" : "hidden"}
          variants={fadeIn}
        >
          <img 
            src={heroImage.url}
            alt={heroImage.alt}
            className="absolute inset-0 object-cover w-full h-full brightness-95 filter contrast-105"
          />
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>
      </main>
    </div>
  );
}
