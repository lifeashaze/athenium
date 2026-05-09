import { DocPage, Callout } from "../../_components/DocPage";

export default function DocumentChatPage() {
  return (
    <DocPage
      eyebrow="Guides"
      title="Document chat & embeddings"
      description="Athenium turns every uploaded resource into something students can interrogate — ask a question, get a cited answer, drill in further. This guide explains what gets indexed, how to ask good questions, and how the underlying pipeline works."
      href="/docs/guides/document-chat"
    >
      <h2>What gets indexed</h2>
      <p>
        Anything a professor uploads to a classroom&apos;s{" "}
        <strong>Resources</strong> tab is eligible for chat — PDFs, DOCX, PPT,
        and Markdown notes. Athenium extracts the text server-side via the{" "}
        <code>/api/extract-content</code> endpoint, which uses{" "}
        <code>pdf-parse</code> for PDFs, <code>mammoth</code> for DOCX, and{" "}
        <code>office-text-extractor</code> for the rest.
      </p>
      <p>
        Extracted text is passed into the chat as context — there are no
        persistent embeddings yet, just per-question retrieval over the active
        document.
      </p>

      <Callout type="note" title="Document size cap">
        Per-message context is currently capped at 15,000 characters of
        extracted text. Long documents are still useful, but you&apos;ll get the
        best results by chatting with one chapter or unit at a time.
      </Callout>

      <h2>Starting a chat</h2>
      <p>
        Open any resource and click <strong>Ask</strong>. The chat panel slides
        in and you can type a question. Responses stream in token-by-token —
        you can start reading before the model is done writing.
      </p>

      <h2>What makes a good question</h2>
      <ul>
        <li>
          <strong>Be specific.</strong> &ldquo;Explain Chapter 3&rdquo; will get
          you a paraphrase of the chapter. &ldquo;Compare TCP vs UDP in three
          lines&rdquo; gets you a useful study aid.
        </li>
        <li>
          <strong>Ask for structure.</strong> &ldquo;List the four steps&rdquo;
          or &ldquo;summarize as a bullet list&rdquo; works well — the system
          prompt encourages markdown formatting.
        </li>
        <li>
          <strong>Cite back.</strong> Every answer ends with a source line
          referencing a page or section. Click through to verify before relying
          on it for an exam.
        </li>
      </ul>

      <h2>Source attribution</h2>
      <p>
        Every response is required to end with a source line:
      </p>
      <pre>
        <code>{`> 📚 Source: [Page 12] Under Transport Layer: "TCP is connection-oriented..."`}</code>
      </pre>
      <p>
        This is enforced by the system prompt and is non-negotiable — if the
        model can&apos;t cite, it will say so rather than fabricate.
      </p>

      <h2>Streaming and the API</h2>
      <p>
        Chat is implemented in <code>src/lib/utils/gemini.ts</code> using the{" "}
        <code>@langchain/google-genai</code> client. The exported{" "}
        <code>generateWithGeminiStream</code> generator yields chunks of text as
        they arrive, which the React UI consumes via async iteration:
      </p>
      <pre>
        <code>{`for await (const chunk of generateWithGeminiStream(question, context)) {
  setAnswer((prev) => prev + chunk);
}`}</code>
      </pre>
      <p>
        Word-boundary buffering happens inside the generator so the rendered
        text reads smoothly rather than character-by-character.
      </p>

      <h2>Privacy and the public key</h2>
      <p>
        Document chat runs entirely on the client using the{" "}
        <code>NEXT_PUBLIC_GOOGLE_AI_API_KEY</code> environment variable. This is
        intentional — the key is meant to be public-bundled. Server-only
        endpoints (like AI assignment generation) use a separate, server-only
        key.
      </p>

      <Callout type="warning" title="Don&apos;t paste secrets">
        Treat the document chat as you would a public LLM. Any text sent in a
        question is forwarded to Google&apos;s API. Don&apos;t paste student PII
        or sealed exam content.
      </Callout>
    </DocPage>
  );
}
