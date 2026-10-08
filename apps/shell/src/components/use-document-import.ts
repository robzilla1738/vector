import { useLayoutEffect, useRef, useState } from "react";
import type { ConversationAttachment } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";
import { errorMessage } from "../error-message";
import { SelectedDocuments, isFileLocalDocumentError } from "../document-selection";

type Progress = {
  owner: Batch;
  index: number;
  count: number;
  attached: number;
  errors: string[];
  busy: boolean;
};
type Batch = {
  active: boolean;
  cancelled: boolean;
  chatId: string | null | undefined;
  origin: string | null | undefined;
  adopted: boolean;
  spaceId: string;
  windowId: string;
  privateMode: boolean;
  privateTask: boolean;
  kind: typeof bridge.windowKind;
  documents?: SelectedDocuments;
};
type Options = {
  privateTask: boolean;
  chatId: string | null | undefined;
  disabled: boolean;
  busy: boolean;
  ensureChatId(): string;
  onBusy(busy: boolean): void;
  onChange(attachments: ConversationAttachment[]): void;
};

function sameOwner(batch: Batch, options: Options) {
  return (
    useStore.getState().layout.activeSpaceId === batch.spaceId &&
    bridge.windowId === batch.windowId &&
    bridge.privateMode === batch.privateMode &&
    options.privateTask === batch.privateTask &&
    bridge.windowKind === batch.kind &&
    (options.chatId === batch.chatId || (!batch.adopted && options.chatId === batch.origin))
  );
}

/** A batch is bound to one committed chat/window incarnation, including its own new-chat allocation. */
export function useDocumentImport(options: Options) {
  const latest = useRef(options);
  const operation = useRef<Batch | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const current = (batch: Batch) =>
    batch.active &&
    operation.current === batch &&
    !latest.current.disabled &&
    useStore.getState().connected &&
    sameOwner(batch, latest.current);
  function finish(batch: Batch) {
    batch.active = false;
    void batch.documents?.release();
    if (operation.current !== batch) return;
    operation.current = null;
    latest.current.onBusy(false);
    setProgress((value) => value && { ...value, busy: false });
  }
  useLayoutEffect(() => {
    latest.current = options;
    const batch = operation.current;
    if (!batch) return;
    if (options.chatId === batch.chatId) batch.adopted = true;
    if (!current(batch)) {
      finish(batch);
      setProgress(null);
    }
  }, [options]);
  useLayoutEffect(
    () => () => {
      const batch = operation.current;
      if (batch) finish(batch);
    },
    [],
  );

  async function start() {
    if (options.disabled || options.busy || operation.current) return;
    const batch: Batch = {
      active: true,
      cancelled: false,
      chatId: options.chatId,
      origin: options.chatId,
      adopted: true,
      spaceId: useStore.getState().layout.activeSpaceId,
      windowId: bridge.windowId,
      privateMode: bridge.privateMode,
      privateTask: options.privateTask,
      kind: bridge.windowKind,
    };
    operation.current = batch;
    options.onBusy(true);
    setProgress({ owner: batch, index: 0, count: 0, attached: 0, errors: [], busy: true });
    try {
      const picked = await bridge.pickEvidenceDocuments();
      if (!picked) {
        if (current(batch)) setProgress(null);
        return;
      }
      batch.documents = new SelectedDocuments(picked);
      if (!current(batch) || batch.cancelled) {
        if (current(batch)) setProgress(null);
        return;
      }
      batch.adopted = !!batch.chatId;
      batch.chatId = options.ensureChatId();
      let attached = 0,
        processed = 0;
      const errors: string[] = [];
      for (let index = 0; index < picked.count && current(batch) && !batch.cancelled; index++) {
        setProgress({
          owner: batch,
          index: index + 1,
          count: picked.count,
          attached,
          errors: [...errors],
          busy: true,
        });
        processed = index + 1;
        let filename = `File ${index + 1}`;
        try {
          const file = await batch.documents.read(index);
          if (!current(batch) || batch.cancelled) break;
          filename = file.filename;
          const result = await call("conversations.attachments.add", { chatId: batch.chatId, ...file });
          if (!current(batch)) break;
          attached++;
          latest.current.onChange(result.attachments);
        } catch (reason) {
          if (!current(batch) || batch.cancelled) break;
          errors.push(`${filename}: ${errorMessage(reason)}`);
          setProgress({
            owner: batch,
            index: index + 1,
            count: picked.count,
            attached,
            errors: [...errors],
            busy: true,
          });
          if (!isFileLocalDocumentError(reason)) break;
        }
      }
      if (current(batch))
        setProgress({ owner: batch, index: processed, count: picked.count, attached, errors, busy: false });
    } catch (reason) {
      if (current(batch)) {
        setProgress(null);
        errToast(reason);
      }
    } finally {
      await batch.documents?.release();
      if (operation.current === batch) finish(batch);
    }
  }
  return {
    progress: progress && sameOwner(progress.owner, options) ? progress : null,
    start,
    current: () => {
      const batch = operation.current;
      return batch ? current(batch) : !!progress && sameOwner(progress.owner, latest.current);
    },
    cancel: () => {
      const batch = operation.current;
      if (batch) {
        batch.cancelled = true;
        void batch.documents?.release();
      } else setProgress(null);
    },
  };
}
