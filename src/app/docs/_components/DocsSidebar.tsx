"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "../_nav";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Docs navigation" className="text-sm">
      <ul className="space-y-8">
        {docsNav.map((section) => (
          <li key={section.title}>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.links.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-md px-2.5 py-1.5 transition-colors ${
                        active
                          ? "bg-gray-900 text-white font-medium"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {link.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
