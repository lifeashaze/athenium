"use client";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden relative bg-white dark:bg-black">
      <Header />

      <main className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial="hidden"
          animate={isMounted ? "visible" : "hidden"}
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-black dark:text-white">
            Transform Learning
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            The all-in-one platform for modern education.
          </p>

          <Button 
            asChild 
            className="font-semibold px-8 py-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}



