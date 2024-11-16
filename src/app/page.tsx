"use client";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Calendar, BarChart2, BookOpen, Zap, Shield, Clock, Globe,ChevronRight } from "lucide-react";
import Image from 'next/image';
import placeholder from '../components/img/placeholder.png';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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

          
          <main className="container mx-auto px-4 py-16">

            {/* Hero Section */}

            <motion.section
            className="container mx-auto px-4 py-16"
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            variants={fadeInFromTop}
            >

            <section className="text-center mb-20">
              <h1 className="text-primary text-4xl md:text-6xl font-semibold mb-3">
              Transform learning 
              </h1>
              <h1 className="text-4xl md:text-6xl font-semibold mb-10">
              Elevate teaching
              </h1>
              <p className="text-base text-[#696969] md:text-base  mb-8 max-w-xl mx-auto">
                athenium is the all-in-one platform that empowers students and educators to streamline coursework, enhance collaboration, and achieve academic excellence.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild className="font-semibold py-1">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                
                  <Link href='/about' className=" ml-4 text-sm text-black rounded-md font-semibold flex items-center">
                  Documentation <ChevronRight size={12} strokeWidth={3} className="mt-1" />
                  </Link>
                
              </div>
            </section>
            </motion.section>

            {/* Dashboard Flex Section */}

            <motion.section
                className="flex justify-center items-center"
                initial="hidden"
                animate={isMounted ? "visible" : "hidden"}
                variants={fadeInFromBottom}
                >

      
            <section className="flex justify-center items-center ">
            <Image
                src={placeholder}
                alt="Placeholder"
                className="max-w-full max-h-full object-contain"
                priority 
            />

            </section>
            </motion.section>

            {/* How It Works Section */}
            <section className="mb-24">
              <h2 className="text-3xl font-bold text-center mb-12">How Athenium Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">1. Join or Create a Classroom</h3>
                  <p>Easily set up virtual classrooms or join existing ones with a simple invite code.</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">2. Access Course Materials</h3>
                  <p>Find all your course resources, assignments, and discussions in one centralized location.</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">3. Submit and Track Progress</h3>
                  <p>Complete assignments, track your progress, and receive instant feedback from educators.</p>
                </div>
              </div>
            </section>

             {/* Key Features Section */}
             <section className="mb-24">
              <h2 className="text-3xl font-bold text-center mb-12">Powerful Features to Elevate Your Education</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<Users className="h-8 w-8 text-blue-500" />}
                  title="Intuitive Classroom Management"
                  description="Create and manage virtual classrooms with ease. Organize students, assignments, and resources effortlessly."
                />
                <FeatureCard
                  icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                  title="Comprehensive Assignment Tracking"
                  description="Create, submit, and grade assignments seamlessly. Monitor deadlines and submission statuses in real-time."
                />
                <FeatureCard
                  icon={<Calendar className="h-8 w-8 text-purple-500" />}
                  title="Smart Attendance System"
                  description="Take attendance digitally and generate insightful reports to track student participation over time."
                />
                <FeatureCard
                  icon={<BarChart2 className="h-8 w-8 text-orange-500" />}
                  title="In-depth Analytics"
                  description="Gain valuable insights into classroom performance and engagement with detailed analytics and visualizations."
                />
                <FeatureCard
                  icon={<BookOpen className="h-8 w-8 text-red-500" />}
                  title="Centralized Resource Hub"
                  description="Share and access course materials, lecture notes, and additional resources within each classroom environment."
                />
                <FeatureCard
                  icon={<Zap className="h-8 w-8 text-yellow-500" />}
                  title="Real-time Collaboration"
                  description="Foster teamwork and communication with built-in collaboration tools for group projects and discussions."
                />
              </div>
            </section>


            {/* CTA Section */}
            <section className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Academic Experience?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join Athenium today and discover a new way to manage your academic life. Streamline your coursework, collaborate with peers, and achieve your educational goals.
              </p>
              <Button asChild size="lg">
                <Link href="/sign-up">Sign Up Now</Link>
              </Button>
            </section>
          </main>

          {/* Footer */}
          <footer className="bg-gray-100 py-8">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2024 Athenium. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}



// "use client";
// import { Header } from "@/components/Header";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { motion } from 'framer-motion';
// import { useState, useEffect } from 'react';

// // Fade in animation variants
// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
// };

// // Remove the images array and replace with single image
// const heroImage = {
//   url: "/images/athena2.jpg",
//   alt: "Statue of Athena"
// };

// // Update the button hover animation to be more subtle
// const buttonHover = {
//   initial: { 
//     scale: 1,
//     boxShadow: "0px 0px 0px rgba(0,0,0,0)",
//   },
//   hover: { 
//     scale: 1.01, // Reduced scale effect
//     boxShadow: "0px 2px 12px rgba(0,0,0,0.08)", // Softer shadow
//     transition: { 
//       duration: 0.2, // Faster transition
//       ease: "easeOut" 
//     }
//   }
// };

// export default function Home() {
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   return (
//     <div className="h-screen overflow-hidden bg-[#FAFAFA]">
//       {/* <Header /> */}
      
//       <main className="grid grid-cols-1 md:grid-cols-2 h-screen">
//         {/* Content Section */}
//         <motion.div 
//           className="flex flex-col justify-center px-8 md:px-16 bg-white"
//           initial="hidden"
//           animate={isMounted ? "visible" : "hidden"}
//           variants={fadeIn}
//         >
//           <div className="bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-sm">
//             <h1 className="font-serif text-7xl md:text-8xl mb-6 text-gray-900 tracking-tight">
//               athenium
//             </h1>
//             <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light tracking-wide">
//               elevating academic excellence through intelligent management.
//             </p>
            
//             {/* Updated feature list */}
//             <div className="space-y-2 mb-8">
//               <p className="text-gray-500 text-sm font-light leading-relaxed">
//                 • streamlined classroom management and assignment tracking
//               </p>
//               <p className="text-gray-500 text-sm font-light leading-relaxed">
//                 • integrated code execution environment for programming courses
//               </p>
//               <p className="text-gray-500 text-sm font-light leading-relaxed">
//                 • real-time collaboration tools and resource sharing
//               </p>
//               <p className="text-gray-500 text-sm font-light leading-relaxed">
//                 • personalized dashboards with study tools and analytics
//               </p>
//             </div>

//             <div className="space-y-4 mb-8">
//               <Button 
//                 asChild 
//                 className="w-full md:w-auto px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 transition-all duration-300 ease-out"
//               >
//                 <motion.div
//                   variants={buttonHover}
//                   initial="initial"
//                   whileHover="hover"
//                   whileTap={{ scale: 0.75 }} // More subtle tap effect
//                 >
//                   <Link href="/sign-up" className="w-full block text-center">
//                     begin your journey
//                   </Link>
//                 </motion.div>
//               </Button>
//             </div>
//           </div>
//         </motion.div>

//         {/* Image Section - Added back 'hidden' class */}
//         <motion.div 
//           className="relative hidden md:flex h-screen" // Added back 'hidden md:flex'
//           initial="hidden"
//           animate={isMounted ? "visible" : "hidden"}
//           variants={fadeIn}
//         >
//           <img 
//             src={heroImage.url}
//             alt={heroImage.alt}
//             className="absolute inset-0 object-cover w-full h-full brightness-95 filter contrast-105"
//           />
//           <div className="absolute inset-0 bg-black/10" />
//         </motion.div>
//       </main>
//     </div>
//   );
// }
