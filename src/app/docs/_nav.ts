export type DocLink = {
  title: string;
  href: string;
  description?: string;
};

export type DocSection = {
  title: string;
  links: DocLink[];
};

export const docsNav: DocSection[] = [
  {
    title: "Get started",
    links: [
      {
        title: "Introduction",
        href: "/docs",
        description: "What Athenium is and how the docs are organized.",
      },
      {
        title: "Quickstart",
        href: "/docs/quickstart",
        description: "From sign-up to your first class — in five minutes.",
      },
    ],
  },
  {
    title: "Guides",
    links: [
      {
        title: "Inviting students",
        href: "/docs/guides/inviting-students",
        description: "Auto-enrollment by year and division, plus invite codes.",
      },
      {
        title: "Generating assignments with AI",
        href: "/docs/guides/ai-assignments",
        description: "Let Gemini draft assignment requirements.",
      },
      {
        title: "Grading workflow",
        href: "/docs/guides/grading-workflow",
        description: "From submission to grade in three clicks.",
      },
      {
        title: "Document chat & embeddings",
        href: "/docs/guides/document-chat",
        description: "Turn any uploaded resource into an AI tutor.",
      },
      {
        title: "Attendance tracking",
        href: "/docs/guides/attendance",
        description: "Mark a class in seconds with one-tap roll call.",
      },
    ],
  },
  {
    title: "Reference",
    links: [
      {
        title: "API reference",
        href: "/docs/api-reference",
        description: "REST endpoints, authentication, and payloads.",
      },
      {
        title: "Webhooks",
        href: "/docs/webhooks",
        description: "Clerk user events and how Athenium consumes them.",
      },
    ],
  },
];

export function findAdjacent(href: string): {
  prev?: DocLink;
  next?: DocLink;
} {
  const flat = docsNav.flatMap((s) => s.links);
  const idx = flat.findIndex((l) => l.href === href);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}
