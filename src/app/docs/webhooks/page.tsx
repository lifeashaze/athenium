import { DocPage, Callout } from "../_components/DocPage";

export default function WebhooksPage() {
  return (
    <DocPage
      eyebrow="Reference"
      title="Webhooks"
      description="Athenium consumes Clerk webhooks to mirror identity events into its own database. This page documents the events Athenium listens for, how signatures are verified, and what to configure in the Clerk dashboard."
      href="/docs/webhooks"
    >
      <h2>Why webhooks matter here</h2>
      <p>
        Athenium uses Clerk for authentication, but stores every domain object
        (classrooms, submissions, attendance) in its own Postgres database. To
        keep the two in sync, Athenium needs to know when a user is created in
        Clerk so it can create a matching row in <code>User</code> — using the
        Clerk ID as the primary key.
      </p>

      <Callout type="warning" title="The Clerk ID is the User ID">
        Athenium&apos;s <code>User.id</code> column is set to the Clerk user
        identifier. Anything that bypasses this webhook (manual database
        inserts, rolled-your-own auth flow) will break the invariant and cause
        404s on every authenticated route.
      </Callout>

      <h2>Endpoint</h2>
      <p>
        The handler lives at{" "}
        <code>POST /api/webhooks/clerk</code>. It is unauthenticated by
        design — middleware lets <code>/api/webhooks/(.*)</code> through — but
        every payload is signature-verified before being processed.
      </p>

      <h2>Signature verification</h2>
      <p>
        Athenium uses <code>svix</code> to verify the webhook signature against
        the secret you set in <code>CLERK_WEBHOOK_SECRET</code>:
      </p>
      <pre>
        <code>{`const wh = new Webhook(WEBHOOK_SECRET);
const evt = wh.verify(body, {
  "svix-id": svix_id,
  "svix-timestamp": svix_timestamp,
  "svix-signature": svix_signature,
}) as WebhookEvent;`}</code>
      </pre>
      <p>
        If verification fails, the handler returns <code>400</code> and does
        not touch the database.
      </p>

      <h2>Events handled</h2>
      <h3>
        <code>user.created</code>
      </h3>
      <p>
        Inserts a row in <code>User</code> with:
      </p>
      <ul>
        <li>
          <code>id</code> — the Clerk user ID, used as the Athenium primary
          key.
        </li>
        <li>
          <code>email</code> — the primary email from{" "}
          <code>email_addresses[0]</code>.
        </li>
        <li>
          <code>firstName</code>, <code>lastName</code>.
        </li>
        <li>
          <code>role</code> — defaults to <code>STUDENT</code>; admins promote
          professors and admins from the admin panel afterwards.
        </li>
      </ul>

      <h3>
        <code>user.updated</code>
      </h3>
      <p>
        Mirrors profile changes (email, name) back into the database. Role
        changes are <em>not</em> driven from Clerk — they live in
        Athenium&apos;s admin panel.
      </p>

      <h3>
        <code>user.deleted</code>
      </h3>
      <p>
        Currently a no-op. Deleting a Clerk user does not cascade to Athenium
        records, because submissions and grades may still need to be retained
        for institutional reasons. Soft-deletion is on the roadmap.
      </p>

      <h2>Configuring in Clerk</h2>
      <ol>
        <li>
          In the Clerk dashboard, open <strong>Webhooks → Add endpoint</strong>.
        </li>
        <li>
          Set the URL to{" "}
          <code>{`https://your-athenium.app/api/webhooks/clerk`}</code>.
        </li>
        <li>
          Subscribe to <code>user.created</code>, <code>user.updated</code>,
          and <code>user.deleted</code>.
        </li>
        <li>
          Copy the signing secret into your environment as{" "}
          <code>CLERK_WEBHOOK_SECRET</code> and redeploy.
        </li>
      </ol>

      <h2>Local development</h2>
      <p>
        Clerk can&apos;t reach <code>localhost</code> directly. Use{" "}
        <code>ngrok http 3000</code> (or the tunnel of your choice) and point
        the dashboard at the public URL. Remember to swap it back to your prod
        URL before going live.
      </p>

      <h2>Outbound webhooks</h2>
      <p>
        Athenium does not yet emit its own outbound webhooks for events like
        new submissions or attendance changes. If you need that for an LMS or
        SIS integration, watch the changelog or ping the team — it&apos;s on the
        list.
      </p>
    </DocPage>
  );
}
