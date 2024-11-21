"use client";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Calendar, BarChart2, BookOpen, Zap, Shield, Clock, Globe,ChevronRight } from "lucide-react";
import Image from 'next/image';
import placeholder from '/public/Dashboard.png';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bento } from "@/components/Bento";
import { BorderBeam } from "@/components/ui/border-beam";
import { MarqueeComp } from "@/components/Marquee";
import Particles from "@/components/ui/particles";




const fadeInFromTop = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut'  } },
};

const fadeInFromBottom = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8,ease: 'easeOut'  } },
};


 

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <div >
        
        <div >
          <motion.header
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            variants={fadeInFromTop}
            >
          <Header />
          </motion.header>

          <div className="relative w-full min-h-screen">
          <Particles className="absolute inset-0 z-0 w-full h-full" quantity={800} color="#696969"  size={1} staticity={100}/>
          <main className="container mx-auto px-4 py-30 relative ">
            
            {/* Hero Section */}

            <motion.section
            className="container mx-auto px-4 py-16"
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            variants={fadeInFromTop}
            >

                <section className="relative text-center mb-20 px-4">
                  <h1 className="text-[#9966CC] font-semibold mb-3 text-4xl sm:text-2xl md:text-5xl">
                    Transform learning
                  </h1>
                  <h1 className="font-semibold mb-6 text-4xl sm:text-2xl md:text-5xl">
                    Elevate teaching
                  </h1>
                  <p className="text-base text-[#696969] mb-8 max-w-md sm:text-sm md:text-lg mx-auto">
                    athenium is the all-in-one platform that empowers students and educators to streamline coursework, enhance collaboration, and achieve academic excellence.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button asChild className="font-semibold py-2 px-4 text-white bg-[#9966CC] hover:bg-[#B48DDB] rounded-md">
                      <Link href="/sign-up">Get Started</Link>
                    </Button>
                    <Link
                      href="/about"
                      className="text-sm text-black dark:text-white rounded-md font-semibold flex items-center"
                    >
                      Documentation
                      <ChevronRight size={12} strokeWidth={3} className="ml-1 mt-[2px]" />
                    </Link>
                  </div>
                </section>

            </motion.section>

            {/* Dashboard Flex Section */}

            <motion.section
                className="flex justify-center items-center mx-auto"
                initial="hidden"
                animate={isMounted ? "visible" : "hidden"}
                variants={fadeInFromBottom}
                >

      
            <section className="flex justify-center items-center  ">
            <div className="relative">
              <BorderBeam
              size={300}
              borderWidth={2}
              />
            <Image
                src={placeholder}
                alt="Placeholder"
                className="max-w-full max-h-full object-contain mx-auto rounded-lg"
                priority 
            />
            </div>

            </section>
            </motion.section>

            {/* How It Works Section */}
            <section className="mb-40 mt-32">
              <h2 className="text-3xl font-bold text-center mb-12">How <span className="text-[#9966CC]">athenium</span> Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users color="#9966CC" className="h-8 w-8  " />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">1. Join or Create a Classroom</h3>
                  <p>Easily set up virtual classrooms or join existing ones with a simple invite code.</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BookOpen color="#9966CC" className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">2. Access Course Materials</h3>
                  <p>Find all your course resources, assignments, and discussions in one centralized location.</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle color="#9966CC" className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">3. Submit and Track Progress</h3>
                  <p>Complete assignments, track your progress, and receive instant feedback from educators.</p>
                </div>
              </div>
            </section>

            {/* {Bento Section} */}

            <section className="mb-32">

            <Bento />
            <h2 className="ml-3">
            <span className="font-bold">Innovative and Exciting,</span><span className="text-[#696969] "> suite of features at your disposal.</span>
            </h2>

            </section>

            {/* {Marquee Section} */}
            

            <section className="">
              <h1 className="text-4xl font-bold text-center mb-10">
              Beyond Boundaries
              </h1>
              <p className="text-sm text-[#696969] text-center md:text-sm mb-8 max-w-lg mx-auto ">
              <span className="text-[#9966CC] font-semibold">athenium</span> is redefining education by unlocking personalized learning, empowering educators, and creating engaging academic journeys. Transforming classrooms, inspiring students, and driving success one click at a time
              </p>
              <MarqueeComp/>
            </section>

             


            {/* CTA Section */}
            <section className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Academic Experience?</h2>
              <p className="text-lg text-[#696969]  mb-8 max-w-2xl mx-auto">
                Join athenium today and discover a new way to manage your academic life. Streamline your coursework, collaborate with peers, and achieve your educational goals.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild className="font-semibold py-1 text-black bg-[#9966CC]">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                
                  <Link href='/about' className=" ml-4 text-sm text-black dark:text-white rounded-md font-semibold flex items-center">
                  Documentation <ChevronRight size={12} strokeWidth={3} className="mt-1" />
                  </Link>
                
              </div>
            </section>
          </main>
          </div>

          {/* Footer */}
          <footer className="bg-gray-100 py-8 dark:text-white dark:bg-black">
            <div className="container mx-auto px-4 text-center">
              <p> 2024 athenium. Developed by Group 32 .</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}



