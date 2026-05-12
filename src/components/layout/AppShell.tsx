"use client";

import { usePathname } from "next/navigation";
import { SidebarDemo } from "@/components/Sidebar";

const PUBLIC_ROUTES = ["/", "/about"];
const PUBLIC_ROUTE_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/docs",
];

function isPublicRoute(pathname: string) {
  return (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <SidebarDemo />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
