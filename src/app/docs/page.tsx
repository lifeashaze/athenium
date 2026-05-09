import Link from "next/link";
import { ArrowRight, Rocket, Compass, Code2 } from "lucide-react";
import { docsNav } from "./_nav";

export default function DocsIndexPage() {
  const guides = docsNav.find((s) => s.title === "Guides")?.links ?? [];

  return (
    <article>
      <header className="mb-12 pb-8 border-b border-gray-200">
        <div className="text-xs font-medium uppercase tracking-widest text-rose-600 mb-3">
          Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Athenium docs.
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
          Everything you need to run a classroom on Athenium — from your first
          sign-up to webhook payloads. Pick a path below or jump to a guide on
          the left.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Quickstart",
            description: "Get a working classroom set up in five minutes.",
            href: "/docs/quickstart",
            icon: <Rocket className="h-5 w-5" />,
            accent: "text-rose-600 bg-rose-50",
          },
          {
            title: "Guides",
            description: "Walkthroughs of every Athenium workflow.",
            href: "#guides",
            icon: <Compass className="h-5 w-5" />,
            accent: "text-cyan-600 bg-cyan-50",
          },
          {
            title: "API & webhooks",
            description: "Endpoints, payloads, and signature verification.",
            href: "/docs/api-reference",
            icon: <Code2 className="h-5 w-5" />,
            accent: "text-emerald-600 bg-emerald-50",
          },
        ].map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="group rounded-2xl border border-gray-200 hover:border-gray-300 p-5 transition-colors"
          >
            <div
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.accent}`}
            >
              {c.icon}
            </div>
            <h3 className="mt-4 font-semibold tracking-tight">{c.title}</h3>
            <p className="mt-1.5 text-sm text-gray-600">{c.description}</p>
            <div className="mt-4 inline-flex items-center text-xs font-medium text-gray-700">
              Open
              <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <h2
        id="guides"
        className="scroll-mt-24 mt-16 text-2xl font-semibold tracking-tight text-gray-900"
      >
        All guides
      </h2>
      <p className="mt-2 text-gray-600">
        Hands-on walkthroughs for the most common workflows.
      </p>

      <ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
        {guides.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="group flex items-center justify-between py-4 hover:bg-gray-50 -mx-3 px-3 rounded-md transition-colors"
            >
              <div className="min-w-0">
                <div className="font-medium text-gray-900">{g.title}</div>
                {g.description && (
                  <div className="text-sm text-gray-600 truncate">
                    {g.description}
                  </div>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
