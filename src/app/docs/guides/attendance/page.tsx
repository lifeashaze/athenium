import { DocPage, Callout } from "../../_components/DocPage";

export default function AttendancePage() {
  return (
    <DocPage
      eyebrow="Guides"
      title="Attendance tracking"
      description="One-tap roll call, batch updates, and a per-student history view. This guide covers everything attendance-related, including the analytics that show up downstream."
      href="/docs/guides/attendance"
    >
      <h2>Marking a class</h2>
      <p>
        Open the classroom and switch to <strong>Attendance</strong>. The page
        shows today&apos;s roll call by default — every student in the class as
        a row, with a tap target for present/absent.
      </p>
      <p>
        Tap a row to toggle present (filled) or absent (outlined). The change
        is persisted instantly via{" "}
        <code>POST /api/classrooms/[id]/attendance</code> — you don&apos;t need
        to click save.
      </p>

      <Callout type="tip" title="Mass-mark first, edit second">
        Click <strong>Mark all present</strong>, then tap individual rows to
        mark absentees. For most classes this is the fastest workflow — fewer
        than ten taps for a class of 40.
      </Callout>

      <h2>Marking a different date</h2>
      <p>
        Need to backfill from a class you forgot to mark? Use the date picker
        at the top of the page. Attendance is uniquely keyed by{" "}
        <code>(userId, classroomId, date)</code>, so you can re-edit any past
        date without creating duplicate rows.
      </p>

      <h2>Batch attendance</h2>
      <p>
        For institutions that take attendance via a paper sheet or external
        system, the batch endpoint accepts a list of records:
      </p>
      <pre>
        <code>{`POST /api/classrooms/:id/attendance/batch
{
  "date": "2025-09-12",
  "records": [
    { "userId": "user_abc", "isPresent": true },
    { "userId": "user_def", "isPresent": false }
  ]
}`}</code>
      </pre>
      <p>
        Records are upserted, so the endpoint is safe to retry.
      </p>

      <h2>Per-student history</h2>
      <p>
        Click any student&apos;s name from the roll call to open their
        attendance history. The view shows every recorded date, the cumulative
        attendance percentage, and a sparkline of the trailing four weeks —
        useful for flagging patterns before they become problems.
      </p>

      <h2>Analytics and exports</h2>
      <p>
        The classroom <strong>Analytics</strong> tab includes:
      </p>
      <ul>
        <li>Class-wide attendance rate per week.</li>
        <li>Distribution of student attendance percentages.</li>
        <li>A list of students below the institutional threshold (75% by default).</li>
      </ul>
      <p>
        Each chart can be exported as a CSV for institutional reporting.
      </p>

      <h2>Things to know</h2>
      <ul>
        <li>
          <strong>No retroactive deletion.</strong> Marking someone absent that
          you previously marked present updates the row in place — there&apos;s
          no audit log.
        </li>
        <li>
          <strong>Removed students keep their history.</strong> Removing a
          student from the classroom doesn&apos;t delete their attendance.
        </li>
        <li>
          <strong>Notifications are off by default.</strong> Toggle{" "}
          <strong>Notify on absence</strong> in classroom settings if you want
          students to get an email when they&apos;re marked absent.
        </li>
      </ul>
    </DocPage>
  );
}
