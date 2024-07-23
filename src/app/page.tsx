import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
    <div className="absolute inset-0 bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]">
      <Header />
          <div className="h-[50vh] flex flex-col gap-4 justify-center items-center">
            <h1 className="text-4xl font-bold text-center ">
              The Most Comprehensive <br /> Student Academic Management System
            </h1>
            <p className="max-w-[50vw] text-center">Streamline your coursework and effortlessly manage assignment submissions with Athenium</p>
          </div>
        </div>
      </div>
    </>
  );

}
