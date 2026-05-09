import { DocPage, Callout } from "../../_components/DocPage";

export default function GradingWorkflowPage() {
  return (
    <DocPage
      eyebrow="Guides"
      title="Grading workflow"
      description="From submission to grade in three clicks. This guide covers where submissions live, how to score them, and how Athenium handles bulk grading."
      href="/docs/guides/grading-workflow"
    >
      <h2>Where submissions land</h2>
      <p>
        When a student submits, the file is uploaded directly to S3 via a
        presigned URL. Athenium records a <code>Submission</code> row keyed on{" "}
        <code>(userId, assignmentId)</code> — so a student can replace their
        submission until the deadline, but only one record persists per
        assignment.
      </p>
      <p>
        Submissions are listed under the assignment, sorted by submitted-at,
        with a status indicator: <strong>On time</strong>, <strong>Late</strong>
        , or <strong>Pending</strong>.
      </p>

      <h2>Reviewing a submission</h2>
      <p>
        Click any row to open the review pane. Athenium streams the file inline
        — PDFs render in the built-in viewer, DOCX is converted to HTML for
        preview, and other formats fall back to a download link. Use the
        sidebar to scroll between students without leaving the pane.
      </p>

      <h2>Entering a grade</h2>
      <p>
        Type a number from <code>0</code> to the assignment&apos;s max marks
        and press <kbd>Enter</kbd>. The grade is saved instantly via the{" "}
        <code>PATCH /api/submissions/[id]/marks</code> endpoint and the student
        gets a notification.
      </p>

      <Callout type="tip" title="Keyboard-driven grading">
        After saving, press <kbd>J</kbd> to move to the next student and{" "}
        <kbd>K</kbd> to go back. You can grade an entire class without touching
        the mouse.
      </Callout>

      <h2>Bulk grading</h2>
      <p>
        For lab exercises with consistent solutions, bulk grading is faster:
      </p>
      <ol>
        <li>Open the assignment and switch to the Grades tab.</li>
        <li>
          Select multiple submissions (Shift-click a range, or use the header
          checkbox to select all).
        </li>
        <li>
          Type a single mark in the bulk action bar and click{" "}
          <strong>Apply</strong>.
        </li>
      </ol>
      <p>
        Bulk-graded submissions still notify each student individually so the
        feedback loop stays personal.
      </p>

      <h2>Late submissions</h2>
      <p>
        Athenium doesn&apos;t auto-deduct marks for late submissions — that
        policy lives with you. The platform just labels them so you can decide.
        If you want a hard cut-off, untick <strong>Allow late submissions</strong>{" "}
        on the assignment editor before publishing.
      </p>

      <h2>Returning grades</h2>
      <p>
        When you&apos;re done, click <strong>Release</strong>. Until released,
        students see only the &ldquo;Submitted&rdquo; state — they don&apos;t
        see partially-graded results from a half-finished session.
      </p>

      <Callout type="warning" title="Releasing is irreversible">
        Once released, students can see their grade. You can still edit the
        mark afterwards, but be deliberate about timing — releasing then
        revising can erode trust.
      </Callout>

      <h2>Analytics</h2>
      <p>
        After grades are released, the assignment page shows a small chart of
        the score distribution and the class average. You can also compare
        across assignments from the <strong>Analytics</strong> tab to spot
        topics where the cohort struggled.
      </p>
    </DocPage>
  );
}
