import { DocPage, Callout } from "../_components/DocPage";

export default function QuickstartPage() {
  return (
    <DocPage
      eyebrow="Get started"
      title="Quickstart"
      description="From sign-up to a fully-loaded classroom in about five minutes. This guide walks a professor through the canonical setup; students follow a much shorter version covered at the end."
      href="/docs/quickstart"
    >
      <h2>Before you start</h2>
      <p>
        You need a verifiable email address and the year and division you teach
        (Athenium uses these to auto-enroll the right students). If your
        institution has already provisioned admin accounts, sign in with the
        credentials you were given — your role will be set for you.
      </p>

      <h2>1. Create your account</h2>
      <p>
        Head to the home page and click <strong>Get started</strong>. Sign-ups
        run on Clerk, so you can use email, Google, or any provider your admin
        has enabled. The first time you sign in, Athenium creates a
        corresponding user record automatically — no separate account setup.
      </p>

      <Callout type="note" title="Default role">
        Every new account starts as a <code>STUDENT</code>. If you&apos;re a
        professor or admin, ask your institution&apos;s admin to update your
        role from the admin panel before continuing.
      </Callout>

      <h2>2. Complete onboarding</h2>
      <p>
        On first sign-in you&apos;ll be asked for the details Athenium needs to
        slot you into the right classrooms:
      </p>
      <ul>
        <li>
          <strong>Students:</strong> SRN, PRN, roll number, year, and division.
        </li>
        <li>
          <strong>Professors:</strong> office hours and any default
          year/division you teach.
        </li>
      </ul>
      <p>
        These fields populate your profile and drive the auto-enrollment that
        happens when a professor creates a classroom.
      </p>

      <h2>3. Create your first classroom</h2>
      <p>
        From the dashboard, click <strong>New classroom</strong> and fill in:
      </p>
      <ul>
        <li>
          <strong>Course name</strong> — e.g. <em>Computer Networks</em>.
        </li>
        <li>
          <strong>Course code</strong> — your institution&apos;s shortcode (e.g.{" "}
          <code>CSE3104</code>).
        </li>
        <li>
          <strong>Year &amp; division</strong> — Athenium will invite every
          student matching these.
        </li>
      </ul>
      <p>
        Athenium generates a unique six-character invite code (uppercase letters
        and digits) that students can also use to join manually if they
        weren&apos;t auto-enrolled.
      </p>

      <h2>4. Drop in resources</h2>
      <p>
        Open the classroom and switch to the <strong>Resources</strong> tab.
        Drag a PDF, DOCX, or slide deck onto the upload area; Athenium pushes it
        to S3 and indexes it for AI document chat. Tag each upload with a unit
        — students see resources grouped by unit by default.
      </p>

      <h2>5. Post your first assignment</h2>
      <p>
        Switch to <strong>Assignments</strong>, click <strong>New</strong>, and
        either type the requirements yourself or hit{" "}
        <strong>Generate with AI</strong> to have Gemini draft them from a short
        prompt. Set a deadline and max marks, then publish.
      </p>
      <p>
        Submissions land in S3, attached to the student&apos;s record, ready
        for grading.
      </p>

      <Callout type="tip" title="Faster than typing">
        For most assignments, the AI-generated requirements need only a couple
        of edits before they&apos;re ready. See{" "}
        <a href="/docs/guides/ai-assignments">Generating assignments with AI</a>{" "}
        for prompt patterns that work well.
      </Callout>

      <h2>For students</h2>
      <p>
        If your professor has set up a classroom for your year and division,
        you&apos;ll see it on your dashboard the next time you log in. Otherwise,
        click <strong>Join</strong>, paste the six-character code, and
        you&apos;re in.
      </p>

      <h2>What&apos;s next?</h2>
      <ul>
        <li>
          <a href="/docs/guides/inviting-students">Inviting students</a> — how
          year/division and codes interact.
        </li>
        <li>
          <a href="/docs/guides/document-chat">Document chat &amp; embeddings</a>{" "}
          — make every PDF interactive.
        </li>
        <li>
          <a href="/docs/guides/grading-workflow">Grading workflow</a> — close
          the loop after submissions arrive.
        </li>
      </ul>
    </DocPage>
  );
}
