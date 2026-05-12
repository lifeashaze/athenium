"use client";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  LineChart,
  Rocket,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Webhook,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* ambient grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 [background-image:linear-gradient(to_right,rgb(0_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0/0.04)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[40rem] w-[80rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-purple-500/30 via-fuchsia-500/20 to-pink-500/30 blur-3xl"
      />

      <Header />

      <main className="flex flex-col gap-32 md:gap-40 pb-32 pt-32 md:pt-40">
        <Hero />
        <BentoFeatures />
        <RolesShowcase />
        <DocsSection />
        <ClosingCTA />
      </main>
    </div>
  );
}

/* ----------------------------- Hero ----------------------------- */

function Hero() {
  return (
    <section className="container px-4">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-gray-900 dark:text-gray-100"
          >
            Teach more.
            <br />
            Manage less.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed"
          >
            Athenium is the academic operating system for the AI era — classrooms,
            assignments, attendance, and an AI tutor that actually reads your syllabus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 h-12 px-6 text-base"
              asChild
            >
              <Link href="/sign-up" className="flex items-center">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base"
              asChild
            >
              <Link href="#features" className="flex items-center">
                See how it works
              </Link>
            </Button>
          </motion.div>

        </div>

        {/* CSS-only product mock */}
        <div className="lg:col-span-5">
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* glow */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-purple-500/30 via-fuchsia-500/20 to-pink-500/30 blur-2xl"
      />

      {/* main card: AI chat panel */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-950/80 backdrop-blur shadow-2xl shadow-purple-500/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          </div>
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            CN_Unit3.pdf
          </div>
          <div className="text-[11px] text-gray-400">●</div>
        </div>

        <div className="p-4 space-y-3">
          <ChatBubble role="user">
            Explain the difference between TCP and UDP in 3 lines.
          </ChatBubble>
          <ChatBubble role="ai">
            <span className="font-medium">TCP</span> is connection-oriented and
            reliable — handshake, ordering, retransmits.{" "}
            <span className="font-medium">UDP</span> is connectionless and
            best-effort — no setup, smaller headers, faster.{" "}
            <span className="text-gray-500 dark:text-gray-400">
              📚 Source: Page 12, Transport Layer.
            </span>
          </ChatBubble>

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2">
            <div className="text-sm text-gray-400 flex-1">
              Ask about your notes…
            </div>
            <button
              type="button"
              className="h-7 w-7 rounded-md bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute -right-4 -top-6 hidden sm:flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-2.5 shadow-xl"
      >
        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-xs">
          <div className="font-semibold">Assignment graded</div>
          <div className="text-gray-500 dark:text-gray-400">DBMS · 23/25</div>
        </div>
      </motion.div>

      {/* floating attendance card */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.9 }}
        className="absolute -left-6 -bottom-6 hidden sm:flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-2.5 shadow-xl"
      >
        <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="text-xs">
          <div className="font-semibold">Attendance · 92%</div>
          <div className="text-gray-500 dark:text-gray-400">This semester</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChatBubble({
  role,
  children,
}: {
  role: "user" | "ai";
  children: React.ReactNode;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3.5 py-2 text-sm">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-3.5 py-2 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

/* -------------------------- Bento Features -------------------------- */

function BentoFeatures() {
  return (
    <section id="features" className="container px-4 scroll-mt-24">
      <SectionHeader
        eyebrow="Features"
        title="One platform. Everything academic."
        subtitle="Stop juggling forms, drives, and spreadsheets. Athenium ties classroom workflows together."
      />

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
        {/* AI document chat — large */}
        <BentoCard className="md:col-span-4 md:row-span-2 min-h-[320px]">
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-600 dark:text-cyan-400">
            <Brain className="h-4 w-4" />
            AI document chat
          </div>
          <h3 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
            Turn every PDF into a tutor.
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
            Upload course material once. Students ask questions and get cited,
            section-by-section answers powered by Gemini.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {["Notes", "Slides", "Past papers"].map((t) => (
              <div
                key={t}
                className="rounded-lg border border-dashed border-gray-300 dark:border-white/10 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                {t}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 text-sm">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
              Q
            </div>
            <div className="font-medium">
              What&apos;s the time complexity of quicksort worst-case?
            </div>
            <div className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
              A
            </div>
            <div className="mt-1 text-gray-700 dark:text-gray-300">
              <span className="font-mono bg-gray-200 dark:bg-white/10 rounded px-1">
                O(n²)
              </span>{" "}
              — when the pivot consistently splits the array unevenly.
            </div>
          </div>
        </BentoCard>

        {/* Attendance */}
        <BentoCard className="md:col-span-2 min-h-[180px]">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Users className="h-4 w-4" />
            Attendance
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            One-tap roll call.
          </h3>
          <div className="mt-4 space-y-1.5">
            {[
              { name: "Aarav", present: true },
              { name: "Diya", present: true },
              { name: "Kiran", present: false },
              { name: "Riya", present: true },
            ].map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {s.name}
                </span>
                <span
                  className={
                    s.present
                      ? "h-4 w-4 rounded-full bg-emerald-500"
                      : "h-4 w-4 rounded-full bg-gray-200 dark:bg-white/10"
                  }
                />
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Analytics */}
        <BentoCard className="md:col-span-2 min-h-[180px]">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <LineChart className="h-4 w-4" />
            Analytics
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            Trends, not guesses.
          </h3>
          <div className="mt-4 flex items-end gap-1.5 h-20">
            {[40, 55, 48, 62, 71, 68, 82].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-500"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            +14% this term
          </div>
        </BentoCard>

        {/* Assignments — wide */}
        <BentoCard className="md:col-span-3 min-h-[200px]">
          <div className="flex items-center gap-2 text-xs font-medium text-pink-600 dark:text-pink-400">
            <FileText className="h-4 w-4" />
            Assignments
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            From brief to grade in one place.
          </h3>
          <div className="mt-4 space-y-2">
            {[
              { title: "OS Lab — Process scheduling", due: "Due Fri", tone: "warn" },
              { title: "DBMS — Normalization", due: "Submitted", tone: "ok" },
              { title: "ML — KNN classifier", due: "Graded · 24/25", tone: "done" },
            ].map((a) => (
              <div
                key={a.title}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm"
              >
                <span>{a.title}</span>
                <span
                  className={
                    a.tone === "warn"
                      ? "text-amber-600 dark:text-amber-400 text-xs"
                      : a.tone === "ok"
                      ? "text-blue-600 dark:text-blue-400 text-xs"
                      : "text-emerald-600 dark:text-emerald-400 text-xs"
                  }
                >
                  {a.due}
                </span>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Onboarding */}
        <BentoCard className="md:col-span-3 min-h-[200px]">
          <div className="flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400">
            <Sparkles className="h-4 w-4" />
            Onboarding
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            Students auto-enroll. You stop herding.
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Year + division based invites mean rosters fill themselves on day one.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 rounded-lg border border-dashed border-gray-300 dark:border-white/10 px-3 py-3 text-center text-sm font-mono tracking-widest">
              ATH-7K42X9
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
            <div className="flex -space-x-2">
              {[
                "from-purple-500 to-pink-500",
                "from-blue-500 to-cyan-500",
                "from-emerald-500 to-teal-500",
              ].map((g, i) => (
                <div
                  key={i}
                  className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-white dark:ring-gray-950`}
                />
              ))}
              <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-white/10 ring-2 ring-white dark:ring-gray-950 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                +38
              </div>
            </div>
          </div>
        </BentoCard>
      </div>
    </section>
  );
}

function BentoCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className={`group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-6 hover:border-gray-300 dark:hover:border-white/20 transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------- Roles Showcase -------------------------- */

function RolesShowcase() {
  const roles = [
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: "For students",
      tagline: "Show up. Submit. Learn faster.",
      points: [
        "Auto-enroll into the right classroom",
        "AI tutor for every uploaded resource",
        "Track grades and attendance at a glance",
      ],
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "For professors",
      tagline: "Less admin. More teaching.",
      points: [
        "Generate assignment requirements with AI",
        "Bulk-grade submissions in one view",
        "Notify a whole division in one click",
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      title: "For admins",
      tagline: "See the whole institution.",
      points: [
        "Manage users and roles centrally",
        "Track engagement across departments",
        "Export attendance and grade reports",
      ],
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section id="roles" className="container px-4 scroll-mt-24">
      <SectionHeader
        eyebrow="Roles"
        title="Built for everyone in the room."
        subtitle="Three workflows, one source of truth — Athenium adapts to who's signing in."
      />

      <div className="grid md:grid-cols-3 gap-5">
        {roles.map((role, idx) => (
          <motion.div
            key={role.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-7 overflow-hidden"
          >
            <div
              aria-hidden
              className={`absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${role.gradient} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`}
            />
            <div className="relative">
              <div
                className={`inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${role.gradient} text-white shadow-md`}
              >
                {role.icon}
              </div>
              <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-medium">
                {role.title}
              </div>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                {role.tagline}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {role.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 mt-0.5 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Docs ------------------------------ */

function DocsSection() {
  const popular = [
    { title: "Inviting students", time: "2 min read", icon: <Users className="h-4 w-4" />, href: "/docs/guides/inviting-students" },
    { title: "Generating assignments with AI", time: "4 min read", icon: <Sparkles className="h-4 w-4" />, href: "/docs/guides/ai-assignments" },
    { title: "Grading workflow", time: "3 min read", icon: <FileText className="h-4 w-4" />, href: "/docs/guides/grading-workflow" },
    { title: "Document chat & embeddings", time: "5 min read", icon: <Brain className="h-4 w-4" />, href: "/docs/guides/document-chat" },
    { title: "Attendance tracking", time: "2 min read", icon: <Calendar className="h-4 w-4" />, href: "/docs/guides/attendance" },
  ];

  const categories = [
    {
      title: "Getting started",
      description: "Account setup, first classroom, and inviting your first cohort.",
      icon: <Rocket className="h-5 w-5" />,
      accent: "text-rose-600",
      bg: "bg-rose-50",
      href: "/docs/quickstart",
    },
    {
      title: "Guides",
      description: "Step-by-step walkthroughs for every Athenium workflow.",
      icon: <BookOpen className="h-5 w-5" />,
      accent: "text-cyan-600",
      bg: "bg-cyan-50",
      href: "/docs#guides",
    },
    {
      title: "API reference",
      description: "REST endpoints, authentication, and webhook payloads.",
      icon: <Code2 className="h-5 w-5" />,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/docs/api-reference",
    },
    {
      title: "Webhooks",
      description: "Listen for events like submissions, grades, and enrollment.",
      icon: <Webhook className="h-5 w-5" />,
      accent: "text-orange-600",
      bg: "bg-orange-50",
      href: "/docs/webhooks",
    },
  ];

  return (
    <section id="docs" className="container px-4 scroll-mt-24">
      <SectionHeader
        eyebrow="Docs"
        title="Read the manual."
        subtitle="Guides, references, and quickstarts to get you up and running with Athenium."
      />

      {/* Featured: Quickstart + Popular guides */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Quickstart — featured */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-3 relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-7"
        >
          <div
            aria-hidden
            className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 opacity-15 blur-3xl"
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
              <Rocket className="h-3.5 w-3.5" />
              Quickstart
            </div>
            <h3 className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight">
              From sign-up to your first class — in five minutes.
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              The fastest path to a fully-loaded classroom: enroll, invite, upload, and assign.
            </p>

            <ol className="mt-6 space-y-3">
              {[
                { n: "01", text: "Create your account and complete onboarding" },
                { n: "02", text: "Spin up a classroom with year & division" },
                { n: "03", text: "Share the invite code — students auto-enroll" },
                { n: "04", text: "Drop in resources, post your first assignment" },
              ].map((step) => (
                <li key={step.n} className="flex items-start gap-3 text-sm">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 font-mono text-[11px] font-medium text-gray-700 dark:text-gray-300">
                    {step.n}
                  </span>
                  <span className="pt-1 text-gray-700 dark:text-gray-300">
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>

            <Link
              href="/docs/quickstart"
              className="mt-7 inline-flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 group"
            >
              Start the quickstart
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Popular guides */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-7 flex flex-col"
        >
          <div className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Popular guides
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            What people read most.
          </h3>
          <ul className="mt-5 -mx-2 flex-1 space-y-1">
            {popular.map((g) => (
              <li key={g.title}>
                <Link
                  href={g.href}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                    {g.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {g.title}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {g.time}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Doc categories */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
          >
            <Link
              href={cat.href}
              className="group block h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-5 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${cat.bg} ${cat.accent}`}
              >
                {cat.icon}
              </div>
              <h4 className="mt-4 font-semibold tracking-tight">{cat.title}</h4>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
                {cat.description}
              </p>
              <div className="mt-4 inline-flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                Browse
                <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ CTA ------------------------------ */

function ClosingCTA() {
  return (
    <section className="container px-4">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-950 dark:bg-black p-10 md:p-16 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-purple-500/40 via-fuchsia-500/30 to-pink-500/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.15)_1px,transparent_0)] [background-size:24px_24px] opacity-40"
        />

        <div className="relative max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-widest text-white/60">
            Get started
          </div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Your classroom, ten minutes from now.
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Sign up free. Invite your students. Let Athenium handle the rest.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 h-12 px-6 text-base"
              asChild
            >
              <Link href="/sign-up" className="flex items-center">
                Create free account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="#docs" className="flex items-center">
                Read the docs
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Section Header --------------------------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-2xl mb-12 md:mb-14">
      <div className="text-xs font-medium uppercase tracking-widest text-rose-600 dark:text-rose-400">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
        {subtitle}
      </p>
    </div>
  );
}
