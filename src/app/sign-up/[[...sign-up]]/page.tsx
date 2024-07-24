import { SignUp } from "@clerk/nextjs";

export default function Page() {
  
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
    <div className="absolute inset-0 bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]">
    <div className="flex items-center justify-center h-screen">
    <SignUp />
  </div>
  </div>
  </div>
  )
}