import { Header } from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
    <div className="absolute inset-0 bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]">
      <Header />
          <div className="h-[50vh] px-5 flex flex-col gap-4 justify-center items-center">
            <h1 className="text-2xl md:text-4xl font-bold text-center ">
              The Most Comprehensive <br /> Student Academic Management System
            </h1>
            <p className="md:max-w-[50vw] text-md md:text-xl font-extralight text-center">Need more than just a simple tool? Athenium provides a complete solution for managing coursework, streamlining submissions, and elevating your educational experience.</p>
          
            <div className="flex gap-3 items-center">
            <Link
            href="/sign-up"
            className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-gray-800 focus:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:bg-gray-200">
            Get Started
          </Link>

          <Link href='/about'
          className="underline">
          Learn More
          </Link>


            </div>

          </div>
        </div>
      </div>
    </>
  );

}
