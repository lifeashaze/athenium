# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server.
- `npm run build` — runs `prisma generate` then `next build`. Always use this (not `next build` directly), or the Prisma client may be stale.
- `npm run start` — run the production build.
- `npm run lint` — `next lint`. Note: `next.config.js` sets `eslint.ignoreDuringBuilds: true`, so lint errors do not block builds — run lint manually.
- `npx prisma migrate dev --name <name>` — create + apply a new migration locally.
- `npx prisma migrate deploy` — apply migrations in CI/prod.
- `npx prisma studio` — inspect the DB.
- `postinstall` runs `prisma generate` automatically.

There is **no test framework configured** in this project — do not invent test commands. If a change needs verification, run the dev server and exercise it manually.

## Environment

Required env vars (see `.env.example`): `DATABASE_URL`, `DIRECT_URL` (Neon Postgres pooled + direct URLs for Prisma), Clerk (`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_WEBHOOK_SECRET`, sign-in/up redirect URLs), AWS S3 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`), `NEXT_PUBLIC_GOOGLE_AI_API_KEY` (Gemini, exposed to client by design — used by `src/lib/utils/gemini.ts` for in-browser document chat), `RESEND_API_KEY`.

## Architecture

Athenium is a Next.js 14 **App Router** LMS. Routes live under `src/app`; UI under `src/components` (with shadcn primitives in `src/components/ui`); shared code under `src/lib`. The `@/*` path alias maps to `./src/*`.

### Auth & user identity (important invariant)

- Authentication is **Clerk**. `src/middleware.ts` runs `clerkMiddleware` and protects everything except: `/`, `/about`, `/sign-in(.*)`, `/sign-up(.*)`, and `/api/webhooks/(.*)`. Anything else requires an authenticated session.
- **The Prisma `User.id` is the Clerk user id.** `src/app/api/webhooks/clerk/route.ts` handles the `user.created` event and inserts a row with `id: clerkUserId`. API handlers therefore use `getAuth(req).userId` directly as the Prisma `User.id` — do **not** look up users by Clerk ID via a separate column. If you add new auth-touching endpoints, follow the same pattern. Adding a user-creation flow that bypasses the webhook will break this invariant.

### Data model (`prisma/schema.prisma`)

Core entities and relations:
- `User` (role enum: `STUDENT | PROFESSOR | ADMIN`) ↔ `Classroom` via `Membership` (composite PK `[userId, classroomId]`).
- `Classroom` is the central aggregate; it owns `Assignment`, `Resource`, `Attendance`, and `Note` records, all keyed by `classroomId`.
- `Submission` is unique on `[userId, assignmentId]` (one submission per student per assignment).
- `Attendance` is unique on `[userId, classroomId, date]`.
- `Notification` is many-to-many with users via the `UserNotifications` relation; `relatedId` is a soft pointer to the originating entity.

When extending the model, prefer cuid IDs (the schema standardized on cuid in migration `20241108182957_standardize_ids_to_cuid`) and respect the role-based access checks performed in API handlers.

### API layer

REST-style route handlers under `src/app/api/**/route.ts`. The dominant pattern is `/api/classrooms/[id]/<sub-resource>` — e.g. assignments, resources, submissions, members, attendance, notify. Cross-cutting endpoints: `/api/user`, `/api/activities`, `/api/notifications`, `/api/extract-content` (server-side document text extraction for AI chat), and `/api/webhooks/clerk`.

Handlers consistently: pull `userId` via `getAuth(req)`, query/mutate through the singleton `prisma` client from `@/lib/db`, return `NextResponse.json(...)`. The Prisma client is cached on `globalThis` in dev to survive HMR — keep that pattern when touching `src/lib/db.ts`.

### Frontend data flow

- **TanStack Query** is the source of truth for server state. `src/app/providers.tsx` wraps the app with a `QueryClientProvider` (15s staleTime, 10min gcTime). Wrap new data hooks the same way; place reusable hooks in `src/lib/hooks/` (see `useClassrooms.ts` for the canonical query+mutations+toast pattern using axios against the `/api/...` routes).
- **Layout**: `src/app/layout.tsx` decides whether to render the sidebar based on `pathname` — public pages (`/`, `/about`, `/sign-in*`, `/sign-up*`, `/verify-email*`) render bare; everything else renders inside `SidebarDemo` + main content.
- **UI**: shadcn (configured in `components.json`, base color slate, RSC enabled) on top of Radix. Tailwind is configured in `tailwind.config.ts`. Use `cn()` from `@/lib/utils` for class merging.

### Files, AI, and email integrations

- **S3** (`@aws-sdk/client-s3` + `s3-request-presigner`) backs both assignment submissions and `Resource` uploads. Generate presigned URLs server-side in the relevant route handlers; client uploads directly.
- **Gemini** is used in two places: server-side via `@google/generative-ai` (assignment requirement generation) and client-side via `@langchain/google-genai` in `src/lib/utils/gemini.ts` (document chat — streams tokens, expects extracted text passed in as `context`, truncated to 15k chars). Document text extraction for chat goes through `/api/extract-content` (`pdf-parse`, `mammoth`, `office-text-extractor`).
- **Email**: `resend` for outbound notifications.
- **Collab editor**: TipTap with Yjs + `y-websocket` for collaborative notes; the websocket server is external — do not assume it is started by `npm run dev`.

### Quirks worth knowing

- **Two Next configs exist**: `next.config.js` (CommonJS, includes `eslint.ignoreDuringBuilds`) and `next.config.mjs` (ESM, includes `images.domains: ['images.unsplash.com']`). Next will load one of them — when changing config, edit both or consolidate, otherwise changes may silently not apply.
- `tsconfig.json` explicitly includes `src/app/api/classrooms/create.js` — there is/was a `.js` file in an otherwise-TS tree; if you see stale JS alongside TS, prefer the TS version.
- Webpack fallbacks for `fs`, `stream`, `path` are set to `false` on the client (in both next configs) — needed for `pdf-parse`/`pdfjs-dist` to bundle. Don't remove them.
- Client-side Gemini uses `NEXT_PUBLIC_GOOGLE_AI_API_KEY` — the key is intentionally public-bundled. Server-only Gemini calls should use a non-`NEXT_PUBLIC_` key if you add one; do not migrate server code to read the public var.
