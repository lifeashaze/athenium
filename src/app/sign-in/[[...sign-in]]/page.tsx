import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex place-content-center justify-center h-full items-center object-center">
      <SignIn />
    </div>
  )


}