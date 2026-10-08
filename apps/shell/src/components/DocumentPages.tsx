import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { DocumentChunk, DocumentMetadata, DocumentLocator } from "@aux/contracts/document-intake";
import { documentLocatorKey } from "@aux/contracts/document-intake";
import { errorMessage } from "../error-message";
import { smallButtonProps } from "../ui/button-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { DocumentSnapshotControl } from "./DocumentSnapshotControls";
import { DocumentExtractionNote } from "./DocumentContent";
import { guardCommandCompletion } from "../command-completion";

type DocumentPage = { document: DocumentMetadata; chunk: DocumentChunk; nextCursor?: string };
type PageState = {
  owner: object;
  page: DocumentPage;
  cursors: (string | undefined)[];
  position: number;
  busy: boolean;
  error: string;
};

export function locatorLabel(locator: DocumentLocator): string {
  if (locator.kind === "text") return `Line ${locator.line}`;
  if (locator.kind === "pdf") return `Page ${locator.page} · block ${locator.block}`;
  const part = locator.part
    .replace(/^word\//, "")
    .replace(/\.xml$/, "")
    .replace(/(\d+)$/, " $1");
  const story = part === "document" ? "Body" : part.charAt(0).toUpperCase() + part.slice(1);
  return (
    `${story} · paragraph ${locator.paragraph}` +
    (locator.table ? ` · table ${locator.table}, row ${locator.row}, column ${locator.column}` : "")
  );
}

/** Read additional sections on demand; Previous replays its immutable cursor. */
export function DocumentPages({
  initial,
  read,
  current,
  onBusy,
}: {
  initial: DocumentPage;
  read(cursor?: string): Promise<DocumentPage>;
  current(): boolean;
  onBusy?(busy: boolean): void;
}) {
  const owner = useMemo(() => ({ initial, current }), [initial, current]);
  const committed = useRef<typeof owner | null>(owner);
  useLayoutEffect(() => {
    committed.current = owner;
    return () => {
      if (committed.current === owner) committed.current = null;
    };
  }, [owner]);
  const [state, setState] = useState<PageState | null>(null);
  const pending = useRef<{ owner: object } | null>(null);
  const view: PageState =
    state?.owner === owner
      ? state
      : {
          owner,
          page: initial,
          cursors: [undefined],
          position: 0,
          busy: false,
          error: "",
        };
  const available = () => committed.current === owner && owner.current();
  const section = useMemo(() => ({ owner, page: view.page }), [owner, view.page]);
  const displayed = useRef<typeof section | null>(section);
  const [copied, setCopied] = useState<typeof section | null>(null);
  useLayoutEffect(() => {
    displayed.current = section;
    return () => {
      if (displayed.current === section) displayed.current = null;
    };
  }, [section]);
  const sectionCurrent = () => available() && displayed.current === section;
  function copySection() {
    return guardCommandCompletion(
      navigator.clipboard
        .writeText(section.page.chunk.segments.map(({ text }) => text).join("\n\n"))
        .then((ack) => {
          if (sectionCurrent()) setCopied(section);
          return ack;
        }),
      sectionCurrent,
    );
  }
  async function navigate(position: number) {
    if (!available() || view.busy || pending.current?.owner === owner) return;
    const cursor = position > view.position ? view.page.nextCursor : view.cursors[position];
    if (position < 0 || (position > view.position && !cursor)) return;
    const token = { owner };
    pending.current = token;
    setState({ ...view, busy: true, error: "" });
    onBusy?.(true);
    try {
      const page = await read(cursor);
      if (!available() || pending.current !== token) return;
      if (
        page.document.snapshotId !== initial.document.snapshotId ||
        page.document.sourceSha256 !== initial.document.sourceSha256 ||
        page.chunk.index !== position
      )
        throw new Error("This document changed. Reopen its original snapshot.");
      const cursors = view.cursors.slice(0, position + 1);
      cursors[position] = cursor;
      setState({ owner, page, cursors, position, busy: false, error: "" });
    } catch (reason) {
      if (available() && pending.current === token)
        setState({ ...view, busy: false, error: errorMessage(reason) });
    } finally {
      if (available() && pending.current === token) {
        pending.current = null;
        onBusy?.(false);
      }
    }
  }
  return (
    <div className="document-pages">
      <DocumentExtractionNote document={initial.document} />
      <div {...staticRowProps}>
        <DocumentSnapshotControl
          command="previous-document-section"
          current={available}
          invoke={() => navigate(view.position - 1)}
          {...smallButtonProps}
          disabled={view.busy || view.position === 0}
        >
          Previous section
        </DocumentSnapshotControl>
        <span {...staticHintProps}>
          Section {view.position + 1}
          {view.page.nextCursor ? "" : " · last section"}
        </span>
        <DocumentSnapshotControl
          command="next-document-section"
          current={available}
          invoke={() => navigate(view.position + 1)}
          {...smallButtonProps}
          disabled={view.busy || !view.page.nextCursor}
        >
          Next section
        </DocumentSnapshotControl>
        <DocumentSnapshotControl
          command="copy-document-section"
          current={sectionCurrent}
          invoke={copySection}
          {...smallButtonProps}
          disabled={view.busy || !view.page.chunk.segments.length}
        >
          Copy section
        </DocumentSnapshotControl>
        {copied === section && <output {...staticHintProps}>Section copied.</output>}
      </div>
      {view.busy && <output {...staticHintProps}>Loading section…</output>}
      {view.error && <p role="alert">{view.error}</p>}
      <div role="region" aria-label="Document text section">
        {view.page.chunk.segments.length ? (
          view.page.chunk.segments.map(({ locator, text }) => (
            <section key={documentLocatorKey(locator)}>
              <span {...staticHintProps}>
                {locatorLabel(locator)}
                {locator.offset ? " · continued" : ""}
              </span>
              <pre
                className="evidence-text"
                role="group"
                tabIndex={0}
                aria-label={`Text at ${locatorLabel(locator)}`}
              >
                {text}
              </pre>
            </section>
          ))
        ) : (
          <p {...staticHintProps}>Empty document</p>
        )}
      </div>
    </div>
  );
}
