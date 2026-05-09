import { DocPage, Callout } from "../../_components/DocPage";

export default function InvitingStudentsPage() {
  return (
    <DocPage
      eyebrow="Guides"
      title="Inviting students"
      description="Athenium fills your roster two ways: automatic invitations based on year and division, and a fallback six-character code for everyone else."
      href="/docs/guides/inviting-students"
    >
      <h2>How invite codes work</h2>
      <p>
        Every classroom gets a unique invite code at creation time — six
        characters, uppercase letters and digits only (e.g.{" "}
        <code>ATH-7K42X9</code>). The code is permanent for the life of the
        classroom and acts as the fallback for any student who didn&apos;t get
        auto-enrolled.
      </p>
      <p>
        Codes appear at the top of the classroom page next to the share button.
        Click the code to copy it; click <strong>Share link</strong> to copy a
        full join URL instead.
      </p>

      <h2>Auto-enrollment by year and division</h2>
      <p>
        When you create a classroom, Athenium reads the year and division you
        picked and creates a pending invitation for every student whose profile
        matches. The next time those students log in, the classroom appears as
        an invitation card on their dashboard — they accept with one click.
      </p>
      <p>
        This is why student onboarding asks for year and division up front:
        without those fields the matcher has nothing to bind against.
      </p>

      <Callout type="note" title="Mid-semester transfers">
        If a student changes year or division after onboarding, ask them to
        update their profile first. Auto-invites are evaluated when classrooms
        are created and when student profiles change — older classrooms
        won&apos;t appear retroactively without a manual code.
      </Callout>

      <h2>Sharing the link</h2>
      <p>
        For students who fall outside your auto-invite criteria — exchange
        students, audit listeners, late joiners — share the join link instead:
      </p>
      <pre>
        <code>{`https://your-athenium.app/join/ATH-7K42X9`}</code>
      </pre>
      <p>
        Anyone with the link can join, so treat the code like a password for
        small or sensitive classrooms.
      </p>

      <h2>Removing a student</h2>
      <p>
        Open the classroom, switch to <strong>Members</strong>, and click the
        menu next to a student&apos;s row. <strong>Remove</strong> deletes the
        membership but keeps their submissions and attendance — useful when
        someone drops the course but you still need their record for grading.
      </p>

      <h2>Bulk invitations</h2>
      <p>
        Need to send invites to a list that doesn&apos;t map cleanly to year and
        division? Email the list to your institution admin; they can bulk-add
        users from the admin panel and the next classroom you create will
        auto-enroll them.
      </p>

      <h2>Common pitfalls</h2>
      <ul>
        <li>
          <strong>Wrong division string.</strong> &ldquo;A&rdquo; and
          &ldquo;a&rdquo; are different values. Standardize the values your
          institution uses.
        </li>
        <li>
          <strong>Year format drift.</strong> Use either &ldquo;2&rdquo; or
          &ldquo;Second Year&rdquo; — pick one and stick with it.
        </li>
        <li>
          <strong>Stale invitation cards.</strong> If a student dismisses an
          invite by accident, share the code as a fallback.
        </li>
      </ul>
    </DocPage>
  );
}
