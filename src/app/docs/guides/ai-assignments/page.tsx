import { DocPage, Callout } from "../../_components/DocPage";

export default function AIAssignmentsPage() {
  return (
    <DocPage
      eyebrow="Guides"
      title="Generating assignments with AI"
      description="Skip the blank page. Athenium uses Google's Gemini model to draft assignment requirements from a short prompt — leaving you to review, tweak, and publish."
      href="/docs/guides/ai-assignments"
    >
      <h2>When to reach for AI generation</h2>
      <p>
        AI generation is best for routine assignments where you know the topic
        and the depth, but don&apos;t want to type out every bullet point.
        Capstone projects, research papers, and anything novel still benefit
        from being written by hand.
      </p>

      <h2>Writing a useful prompt</h2>
      <p>
        On the assignment editor, click <strong>Generate with AI</strong>. The
        modal asks for three things:
      </p>
      <ul>
        <li>
          <strong>Topic</strong> — the subject of the assignment, e.g.
          &ldquo;Database normalization through 3NF&rdquo;.
        </li>
        <li>
          <strong>Format</strong> — written report, lab exercise, problem set,
          presentation, or a custom value.
        </li>
        <li>
          <strong>Depth</strong> — short answer, standard, or in-depth. This
          mostly controls how many bullets the model produces.
        </li>
      </ul>
      <p>
        The model returns a markdown bullet list. Athenium parses lines that
        start with <code>- </code> and stores each as a separate requirement —
        so the editor renders them as a checklist students can tick off.
      </p>

      <Callout type="tip" title="Steer with the topic field">
        The topic prompt is short but high-leverage. Adding a few words like
        &ldquo;include at least one diagram&rdquo; or &ldquo;cite course
        material&rdquo; routes through to the model and shows up in the
        generated bullets.
      </Callout>

      <h2>Reviewing the output</h2>
      <p>
        The first response is rarely perfect. Common adjustments:
      </p>
      <ul>
        <li>
          <strong>Tighten verbs.</strong> Models love &ldquo;explore&rdquo; and
          &ldquo;discuss&rdquo; — replace them with verbs that imply a concrete
          deliverable (build, calculate, prove, compare).
        </li>
        <li>
          <strong>Cap bullets at five.</strong> If the model returned eight,
          delete the weakest three. Long lists drag down completion rates.
        </li>
        <li>
          <strong>Add a citation requirement.</strong> If you want sources,
          state it explicitly — the model won&apos;t infer.
        </li>
      </ul>

      <h2>Setting deadline and marks</h2>
      <p>
        Below the requirements, set a deadline and a max marks value (default{" "}
        <code>25</code>). Athenium uses the deadline to drive notifications and
        to label submissions as on-time or late.
      </p>

      <h2>Publishing</h2>
      <p>
        Click <strong>Publish</strong>. Every member of the classroom gets a
        notification, plus an email if your admin has enabled Resend. Students
        see the assignment with a countdown to the deadline.
      </p>

      <Callout type="warning" title="Editing after publish">
        You can edit requirements after publishing, but students who&apos;ve
        already started won&apos;t see your changes highlighted. For
        non-trivial scope changes, post an announcement and consider extending
        the deadline.
      </Callout>

      <h2>Behind the scenes</h2>
      <p>
        Generation runs server-side through the Gemini API. Athenium sends the
        topic, format, and depth wrapped in a system prompt that constrains the
        output to a markdown bullet list. The response is parsed (lines
        starting with <code>- </code>) and persisted to the assignment&apos;s{" "}
        <code>requirements</code> field as a string array.
      </p>
    </DocPage>
  );
}
