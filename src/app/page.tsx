"use client";
import { Header } from "@/components/Header";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Users, Brain, Shield, Bell, LineChart, Check } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="flex flex-col gap-24 pb-24">
        {/* Hero Section */}
        <section className="container pt-32 md:pt-40 px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold tracking-tight"
            >
              The Modern Learning Platform for the{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                AI Era
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg text-gray-600 dark:text-gray-400"
            >
              Streamline education with AI-powered insights, seamless collaboration, and comprehensive classroom management.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/sign-up" className="flex items-center">
                  Get started for free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/docs">View documentation</Link>
              </Button>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 rounded-lg border bg-gray-50 dark:bg-gray-900 overflow-hidden"
          >
            <Image
              src="/Dashboard.png"
              alt="Athenium Dashboard"
              width={2880}
              height={1620}
              className="w-full"
            />
          </motion.div>
        </section>

        {/* Key Features Grid */}
        <section className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for modern education</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A comprehensive platform that combines AI-powered tools with seamless classroom management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-6 w-6 text-purple-600" />,
                title: "AI-Powered Learning",
                description: "Chat with study materials, get personalized insights, and receive AI-generated assignment requirements"
              },
              {
                icon: <Users className="h-6 w-6 text-blue-600" />,
                title: "Smart Attendance",
                description: "Effortlessly track attendance with real-time updates and automated notifications"
              },
              {
                icon: <BookOpen className="h-6 w-6 text-pink-600" />,
                title: "Resource Management",
                description: "Organize study materials by units, enable document chat, and allow bulk downloads"
              },
              {
                icon: <Shield className="h-6 w-6 text-green-600" />,
                title: "Assignment Tracking",
                description: "Create, submit, and grade assignments with automated deadline management"
              },
              {
                icon: <LineChart className="h-6 w-6 text-yellow-600" />,
                title: "Performance Analytics",
                description: "Visual insights into grades, attendance trends, and academic progress"
              },
              {
                icon: <Bell className="h-6 w-6 text-indigo-600" />,
                title: "Smart Notifications",
                description: "Stay updated with email notifications for assignments, grades, and attendance"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Platform Overview */}
        <section className="container px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold">Streamlined classroom management</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Automated Onboarding</h3>
                    <p className="text-gray-600 dark:text-gray-400">Quick student registration with essential information collection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Classroom Creation</h3>
                    <p className="text-gray-600 dark:text-gray-400">Create and manage multiple classrooms with invite codes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Resource Organization</h3>
                    <p className="text-gray-600 dark:text-gray-400">Unit-wise organization with S3-powered storage</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border overflow-hidden"
            >
              <Image
                src="/Dashboard.png"
                alt="Platform Overview"
                width={1200}
                height={800}
                className="w-full"
              />
            </motion.div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="container px-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-16 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your classroom?
            </h2>
            <p className="text-lg mb-8 text-white/80">
              Experience the future of education management
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up" className="flex items-center">
                Get started for free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}



