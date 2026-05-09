import { DocPage, Callout } from "../_components/DocPage";

export default function APIReferencePage() {
  return (
    <DocPage
      eyebrow="Reference"
      title="API reference"
      description="Athenium exposes a REST-style API under /api. Every endpoint runs as a Next.js Route Handler, authenticated against the current Clerk session. This page covers the conventions; endpoint-specific shapes live with the routes themselves."
      href="/docs/api-reference"
    >
      <h2>Authentication</h2>
      <p>
        Every protected route resolves the caller via{" "}
        <code>getAuth(req)</code> from <code>@clerk/nextjs/server</code>. The
        returned <code>userId</code> is also the primary key of the matching{" "}
        <code>User</code> row in Postgres — Athenium uses the Clerk identifier
        as its own, populated by the user-created webhook (see{" "}
        <a href="/docs/webhooks">Webhooks</a>).
      </p>
      <p>
        From a logged-in browser session, no extra work is needed — the Clerk
        cookie is forwarded automatically. From outside the browser, use a
        Clerk-issued JWT in the <code>Authorization</code> header.
      </p>
      <pre>
        <code>{`Authorization: Bearer <clerk-jwt>`}</code>
      </pre>

      <Callout type="note" title="No service tokens (yet)">
        There&apos;s no service-to-service token type. For now, machine
        callers should provision a dedicated user and use that account&apos;s
        Clerk JWT.
      </Callout>

      <h2>Endpoint groups</h2>
      <p>
        Routes are grouped by resource. The most common are:
      </p>
      <ul>
        <li>
          <code>/api/classrooms</code> — list, create, update, delete
          classrooms; nested resources for assignments, resources, members,
          attendance, and submissions.
        </li>
        <li>
          <code>/api/assignments</code> — assignment-level operations not tied
          to a single classroom listing.
        </li>
        <li>
          <code>/api/submissions/[id]/marks</code> — patch a submission&apos;s
          score.
        </li>
        <li>
          <code>/api/notifications</code> — list, mark-read, and read-all.
        </li>
        <li>
          <code>/api/user</code> — current user&apos;s profile.
        </li>
        <li>
          <code>/api/extract-content</code> — server-side text extraction for
          uploaded resources.
        </li>
      </ul>

      <h2>Conventions</h2>
      <ul>
        <li>
          <strong>JSON in, JSON out.</strong> All routes consume and produce{" "}
          <code>application/json</code>.
        </li>
        <li>
          <strong>Status codes.</strong> <code>200</code> on success,{" "}
          <code>201</code> on resource creation, <code>401</code> when
          unauthenticated, <code>403</code> when the caller lacks the role,{" "}
          <code>404</code> for missing resources, and <code>400</code> for
          malformed input.
        </li>
        <li>
          <strong>cuid identifiers.</strong> Every resource ID is a{" "}
          <code>cuid</code> string. Don&apos;t assume integer IDs.
        </li>
      </ul>

      <h2>Example: list classrooms</h2>
      <pre>
        <code>{`GET /api/classrooms
Authorization: Bearer <clerk-jwt>

200 OK
{
  "classrooms": [
    {
      "id": "ckl1abcd...",
      "name": "Computer Networks",
      "code": "ATH7K42",
      "year": "3",
      "division": "A",
      "courseCode": "CSE3104",
      "courseName": "Computer Networks",
      "pendingAssignments": 2
    }
  ]
}`}</code>
      </pre>

      <h2>Example: create a classroom</h2>
      <pre>
        <code>{`POST /api/classrooms/create
Authorization: Bearer <clerk-jwt>
Content-Type: application/json

{
  "year": "3",
  "division": "A",
  "courseCode": "CSE3104",
  "courseName": "Computer Networks"
}

201 Created
{
  "classroom": { "id": "ckl1...", "code": "ATH7K42", "inviteLink": "..." }
}`}</code>
      </pre>

      <h2>Example: grade a submission</h2>
      <pre>
        <code>{`PATCH /api/submissions/ckl9.../marks
Authorization: Bearer <clerk-jwt>
Content-Type: application/json

{ "marks": 23 }

200 OK
{ "submission": { "id": "ckl9...", "marks": 23 } }`}</code>
      </pre>

      <h2>Errors</h2>
      <p>
        Errors are JSON objects with a single <code>error</code> field
        containing a human-readable message. The status code is the contract;
        the message is for humans:
      </p>
      <pre>
        <code>{`401 Unauthorized
{ "error": "Unauthorized" }`}</code>
      </pre>

      <h2>Rate limits</h2>
      <p>
        There are no hard rate limits today — the platform is hosted on Vercel
        with their default protections. Bulk callers should still batch
        requests where possible (the attendance batch endpoint exists for this
        reason).
      </p>
    </DocPage>
  );
}
