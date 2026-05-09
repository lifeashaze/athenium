import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { findAdjacent } from "../_nav";

export function DocPage({
  eyebrow,
  title,
  description,
  href,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  href: string;
  children: React.ReactNode;
}) {
  const { prev, next } = findAdjacent(href);

  return (
    <article>
      <header className="mb-10 pb-8 border-b border-gray-200">
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-widest text-rose-600 mb-3">
            {eyebrow}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
          {description}
        </p>
      </header>

      <div className="prose prose-gray max-w-none prose-headings:scroll-mt-24 prose-h2:text-2xl prose-h2:font-semibold prose-h2:tracking-tight prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-gray-700 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:text-sm">
        {children}
      </div>

      {(prev || next) && (
        <nav
          aria-label="Pagination"
          className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-2 gap-4"
        >
          {prev ? (
            <Link
              href={prev.href}
              className="group rounded-xl border border-gray-200 hover:border-gray-300 p-4 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 group-hover:text-gray-700">
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="mt-1 block text-sm font-semibold text-gray-900">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group rounded-xl border border-gray-200 hover:border-gray-300 p-4 text-right transition-colors"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-500 group-hover:text-gray-700">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1 block text-sm font-semibold text-gray-900">
                {next.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      )}
    </article>
  );
}

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: "note" | "tip" | "warning";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    note: "border-gray-200 bg-gray-50",
    tip: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
  } as const;
  const labels = {
    note: "Note",
    tip: "Tip",
    warning: "Heads up",
  } as const;

  return (
    <div
      className={`not-prose my-6 rounded-xl border ${styles[type]} p-4 text-sm`}
    >
      <div className="font-semibold text-gray-900">{title ?? labels[type]}</div>
      <div className="mt-1 text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}
