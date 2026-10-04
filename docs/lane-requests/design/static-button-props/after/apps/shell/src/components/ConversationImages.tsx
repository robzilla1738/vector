import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { hostOf } from "../workspace";
import { ConversationImageAction, ConversationImageChoice } from "./ConversationImageControl";
import { ImagePreview } from "./ImageSnapshot";
import { createPortal } from "react-dom";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ConversationImage, PageContextRef, PageTarget } from "@aux/contracts";
import { call, errToast, useStore } from "../store";
import { bridge } from "../bridge";
import { shellIconClose } from "./icons";

type Rect = { x: number; y: number; width: number; height: number };
type Capture = { dataUrl: string; sourceUrl?: string; sourcePage?: PageContextRef; title: string; filename?: string };
type OperationOwner = { active: boolean; chatId: string | null | undefined; locked: boolean; release: (() => void) | null; windowId: string; privateMode: boolean; kind: typeof bridge.windowKind };

type Bounds = { left: number; top: number; width: number; height: number };

function stageBounds(): Bounds | null {
  const stage = document.getElementById("stage");
  if (!stage) return null;
  const { left, top, width, height } = stage.getBoundingClientRect();
  return width > 0 && height > 0 ? { left, top, width, height } : null;
}

async function imageSize(dataUrl: string) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return { width: image.naturalWidth, height: image.naturalHeight };
}

async function cropImage(dataUrl: string, region: Rect | null) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  if (image.naturalWidth * image.naturalHeight > 64_000_000) throw new Error("Choose an image up to 64 million pixels.");
  const rect = region ?? { x: 0, y: 0, width: 1, height: 1 };
  const width = image.naturalWidth * rect.width, height = image.naturalHeight * rect.height;
  if (width < 8 || height < 8) throw new Error("Select a larger region, or use the whole image.");
  const canvas = document.createElement("canvas");
  let scale = Math.min(1, 2048 / Math.max(width, height));
  for (let attempt = 0; attempt < 5; attempt++) {
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image editing is unavailable. Try again.");
    ctx.drawImage(image, rect.x * image.naturalWidth, rect.y * image.naturalHeight, width, height, 0, 0, canvas.width, canvas.height);
    const output = canvas.toDataURL("image/png");
    if (output.length < 4_190_000) return output;
    scale *= 0.7;
  }
  throw new Error("This capture is too large. Choose a smaller region.");
}

/** Frozen page references stay separate from the agent's live browser view. */
export function ConversationImages({ chatId, page, images, disabled, ensureChatId, onChange, onBusy, onDocument, incomingFile, onFileConsumed, showAttachedImages = true, toolsTarget, detachedTools = false }: {
  showAttachedImages?: boolean; toolsTarget?: HTMLElement | null; detachedTools?: boolean;
  chatId: string | null | undefined; page?: PageTarget; images: ConversationImage[]; disabled: boolean;
  incomingFile?: File | null; onFileConsumed?(file: File): void;
  ensureChatId(): string; onChange(chatId: string, images: ConversationImage[]): void; onBusy(busy: boolean): void; onDocument(): void;
}) {
  const imageScope = useId();
  const committedImages = useRef(images);
  useLayoutEffect(() => { committedImages.current = images; }, [images]);
  const [capture, setCapture] = useState<Capture | null>(null);
  const [region, setRegion] = useState<Rect | null>(null);
  const [preview, setPreview] = useState<{ image: ConversationImage; dataUrl: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [lasso, setLasso] = useState<{ bounds: Bounds; width: number; height: number } | null>(null);
  const overlay = useStore(s => s.overlay);
  const review = useRef<HTMLDivElement>(null);
  const captureCanvas = useRef<HTMLDivElement>(null);
  const lassoTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { review.current?.scrollIntoView({ block: "nearest" }); }, [capture, preview]);
  const windowId = bridge.windowId, privateMode = bridge.privateMode, kind = bridge.windowKind;
  const request = useRef(0);
  const operationOwner = useRef<OperationOwner>({ active: true, chatId, locked: false, release: null, windowId, privateMode, kind });
  const start = useRef<{ x: number; y: number } | null>(null);
  const currentChat = useRef(chatId);
  currentChat.current = chatId;
  useLayoutEffect(() => {
    const previous = operationOwner.current;
    if (previous.chatId !== chatId || previous.windowId !== windowId || previous.privateMode !== privateMode || previous.kind !== kind) {
      previous.active = false;
      const release = previous.release; previous.release = null; release?.();
      operationOwner.current = { active: true, chatId, locked: false, release: null, windowId, privateMode, kind };
      setBusy(false);
    }
    setCapture(null); setRegion(null); setPreview(null); setError(""); setLasso(null);
    if (useStore.getState().overlay === "capture") useStore.getState().setOverlay(null);
    ++request.current;
  }, [chatId, windowId, privateMode, kind]);
  useLayoutEffect(() => () => {
    const owner = operationOwner.current;
    owner.active = false; const release = owner.release; owner.release = null; release?.();
    ++request.current;
    if (useStore.getState().overlay === "capture") useStore.getState().setOverlay(null);
  }, []);
  useEffect(() => { if (lasso && overlay !== "capture") { setLasso(null); setCapture(null); setRegion(null); } }, [lasso, overlay]);
  useEffect(() => {
    if (!lasso || overlay !== "capture") return;
    const app = document.querySelector<HTMLElement>(".app");
    const previouslyInert = app?.inert ?? false;
    if (app) app.inert = true;
    const frame = requestAnimationFrame(() => captureCanvas.current?.focus());
    return () => { cancelAnimationFrame(frame); if (app) app.inert = previouslyInert; };
  }, [!!lasso, overlay]);
  useEffect(() => {
    if (!lasso) return;
    const update = () => { const bounds = stageBounds(); if (bounds) setLasso(current => current && { ...current, bounds }); };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [!!lasso]);
  const operationCurrent = (owner: OperationOwner) => owner.active && operationOwner.current === owner && owner.windowId === bridge.windowId && owner.privateMode === bridge.privateMode && owner.kind === bridge.windowKind;
  const perform = async (action: (version: number, owner: OperationOwner) => Promise<void>) => {
    const owner = operationOwner.current;
    if (!operationCurrent(owner) || owner.locked) return;
    owner.locked = true; owner.release = () => onBusy(false);
    setBusy(true); onBusy(true); setError("");
    const version = ++request.current;
    try { await action(version, owner); }
    catch (reason) { if (operationCurrent(owner) && request.current === version) setError(errorMessage(reason)); }
    finally {
      owner.locked = false; const release = owner.release; owner.release = null; release?.();
      if (operationCurrent(owner)) setBusy(false);
    }
  };
  useEffect(() => {
    if (!incomingFile) return;
    const file = incomingFile;
    void perform(async (version, owner) => {
      try {
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Paste or drop a PNG, JPEG or WebP image.");
        if (!file.size || file.size > 16 * 1024 * 1024) throw new Error("Choose an image up to 16 MB.");
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("This image could not be read. Try pasting it again."));
          reader.onabort = () => reject(new Error("Image reading was cancelled."));
          reader.readAsDataURL(file);
        });
        const normalized = await cropImage(dataUrl, null);
        if (version !== request.current || !operationCurrent(owner)) return;
        setPreview(null); setRegion(null);
        const filename = `${(file.name || "Pasted image").replace(/\.[^.]+$/, "").slice(0, 180)}.png`;
        setCapture({dataUrl:normalized, filename, title:filename});
      } finally { onFileConsumed?.(file); }
    });
  }, [incomingFile]);
  const chooseImage = () => perform(async (version, owner) => {
    const picked = await bridge.pickEvidenceImage();
    if (!picked || version !== request.current || !operationCurrent(owner)) return;
    setPreview(null); setRegion(null);
    setCapture({ dataUrl: picked.dataUrl, title: picked.filename, filename: picked.filename });
  });
  const pageCurrent = () => {
    if (!page) return false;
    const matches = useStore.getState().pages.filter(item => item.pageId === page.pageId);
    const original = matches.length === 1 ? matches[0] : undefined;
    return !!original && original.url === page.url && original.documentEpoch === page.documentEpoch && original.targetId === page.targetId && original.sessionId === page.sessionId && original.windowId === page.windowId;
  };
  const takeCapture = (onPage = false) => perform(async (version, owner) => {
    if (!page || !pageCurrent()) throw new Error("The page changed during capture. Capture it again.");
    const bounds = onPage ? stageBounds() : null;
    if (onPage && !bounds) throw new Error("The page is not visible. Show the page and try again.");
    const result = await call("pages.capture", { pageId: page.pageId, format: "dataUrl", fullPage: false, expectedDocumentEpoch: page.documentEpoch }) as { dataUrl: string };
    if (version !== request.current || !operationCurrent(owner)) return;
    const current = useStore.getState().pages.find(item => item.pageId === page.pageId);
    if (!current || !pageCurrent()) throw new Error("The page changed during capture. Capture it again.");
    if (onPage) {
      const state = useStore.getState();
      if (state.mode !== "focus" || state.activePageId !== page.pageId || state.splitPageId) throw new Error("The visible page changed. Show it and try again.");
      const size = await imageSize(result.dataUrl);
      if (version !== request.current || !operationCurrent(owner)) return;
      const visible = useStore.getState();
      const visiblePage = visible.pages.find(item => item.pageId === page.pageId);
      if (visible.mode !== "focus" || visible.activePageId !== page.pageId || visible.splitPageId
        || !visiblePage || !pageCurrent())
        throw new Error("The visible page changed. Show it and try again.");
      setLasso({ bounds: stageBounds() ?? bounds!, ...size });
      visible.setOverlay("capture");
    }
    setPreview(null); setRegion(null); setCapture({ dataUrl: result.dataUrl, sourceUrl: page.url, sourcePage: { pageId: page.pageId, url: page.url, documentEpoch: page.documentEpoch, sessionId: page.sessionId, selectedAt: Date.now() }, title: page.title || "Page" });
  });
  const restoreCaptureFocus = () => { const owner = operationOwner.current, original = lassoTrigger.current; requestAnimationFrame(() => { if (operationCurrent(owner) && original?.isConnected && lassoTrigger.current === original) original.focus(); }); };
  const saveCapture = () => perform(async (version, owner) => {
    if (!capture) return;
    const dataUrl = await cropImage(capture.dataUrl, region);
    if (version !== request.current || !operationCurrent(owner)) return;
    const target = ensureChatId();
    if (!operationCurrent(owner)) return;
    // Creating a conversation changes the prop before the save finishes.
    owner.chatId = target;
    currentChat.current = target;
    const result = await call("conversations.images.add", { chatId: target, filename: capture.filename ? (region ? `${capture.filename.replace(/\.png$/i, "")} region.png` : capture.filename) : `${capture.title.slice(0, 100)}${region ? " region" : " capture"}.png`, dataUrl, sourceUrl: capture.sourceUrl, sourcePage: capture.sourcePage }).catch(error => { if (operationCurrent(owner) && request.current !== version && currentChat.current === target) errToast(error); throw error; });
    if (operationCurrent(owner) && currentChat.current === target) { onChange(target, result.images); setCapture(null); setRegion(null); setLasso(null); if (useStore.getState().overlay === "capture") { useStore.getState().setOverlay(null); restoreCaptureFocus(); } }
  });
  const cancelCapture = () => { setCapture(null); setRegion(null); setLasso(null); if (useStore.getState().overlay === "capture") { useStore.getState().setOverlay(null); restoreCaptureFocus(); } };
  const originalImage = (imageId: string) => { const matches = committedImages.current.filter(item => item.imageId === imageId); return matches.length === 1 ? matches[0] : undefined; };
  const imageMatches = (original: ConversationImage | undefined, snapshot = JSON.stringify(original)) => !!original && JSON.stringify(originalImage(original.imageId)) === snapshot;
  const change = (imageId: string, included?: boolean) => perform(async (version, owner) => {
    const original = originalImage(imageId), snapshot = JSON.stringify(original);
    if (!chatId || !original) throw new Error("Choose the current conversation image.");
    const result = await call(included === undefined ? "conversations.images.remove" : "conversations.images.toggle", { chatId, imageId, ...(included === undefined ? {} : { included }) });
    if (version === request.current && operationCurrent(owner) && imageMatches(original, snapshot)) { onChange(chatId, result.images); setPreview(null); }
  });
  const inspect = (imageId: string) => perform(async (version, owner) => {
    const original = originalImage(imageId), snapshot = JSON.stringify(original);
    if (!chatId || !original) throw new Error("Choose the current conversation image.");
    const result = await call("conversations.images.read", { chatId: chatId as string, imageId });
    if (version === request.current && operationCurrent(owner) && imageMatches(original, snapshot)) { setPreview(result); setCapture(null); }
  });
  const canCapture = page && /^https?:\/\//.test(page.url) && !["crashed", "detached"].includes(page.viewStatus ?? "");
  const onPage = canCapture && useStore.getState().mode === "focus" && useStore.getState().activePageId === page.pageId && !useStore.getState().splitPageId && page.backend !== "chrome";
  const captureDisabledReason = disabled ? "Capture is unavailable while this conversation cannot accept attachments."
    : images.length >= 4 ? "Four images attached. Remove one to add another."
    : !page ? "Choose an open web page in Browser context to capture it."
    : !/^https?:\/\//.test(page.url) ? "Page capture is available on http(s) pages, not local or special pages."
    : ["crashed", "detached"].includes(page.viewStatus ?? "") ? "This tab is crashed or detached. Capture is unavailable until it is restored."
    : undefined;
  const selection = capture && <div ref={captureCanvas} className="capture-canvas" tabIndex={0} role="group" aria-label="Image selection. Arrow keys select and move a region; Shift and arrows resize." onKeyDown={event => {
    if (event.key === "Escape") { if (lasso) cancelCapture(); else setRegion(null); event.preventDefault(); return; }
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const next = { ...(region ?? { x: .25, y: .25, width: .5, height: .5 }) };
    const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -.02 : .02;
    if (event.shiftKey) { if (event.key === "ArrowLeft" || event.key === "ArrowRight") next.width = Math.max(.02, Math.min(1 - next.x, next.width + delta)); else next.height = Math.max(.02, Math.min(1 - next.y, next.height + delta)); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") next.x = Math.max(0, Math.min(1 - next.width, next.x + delta));
    else next.y = Math.max(0, Math.min(1 - next.height, next.y + delta));
    setRegion(next);
  }} onPointerDown={event => {
    if (busy || event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    start.current = { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
    event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.focus(); setRegion(null);
  }} onPointerMove={event => {
    if (!start.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    setRegion({ x: Math.min(x, start.current.x), y: Math.min(y, start.current.y), width: Math.abs(x - start.current.x), height: Math.abs(y - start.current.y) });
  }} onPointerUp={() => { start.current = null; }} onPointerCancel={() => { start.current = null; }}>
    <img src={capture.dataUrl} alt="Capture to review before attaching" draggable={false}/>
    {region && <span className="capture-region" style={{ left: `${region.x * 100}%`, top: `${region.y * 100}%`, width: `${region.width * 100}%`, height: `${region.height * 100}%` }}/>}</div>;
  const current = () => operationCurrent(operationOwner.current) && operationOwner.current.chatId === chatId && currentChat.current === chatId;
  const imageCurrent = (item: ConversationImage) => current() && imageMatches(item);
  const captureCurrent = () => current() && !!capture && !operationOwner.current.locked;
  const captureActions = <div className="capture-actions"><ConversationImageAction command="cancel-conversation-image" {...smallGhostButtonProps} disabled={busy} current={captureCurrent} invoke={cancelCapture}>Cancel</ConversationImageAction>{region && <ConversationImageAction command="use-whole-conversation-image" {...smallGhostButtonProps} disabled={busy} current={captureCurrent} invoke={() => setRegion(null)}>Use whole image</ConversationImageAction>}<ConversationImageAction command="attach-conversation-image" {...smallButtonProps} disabled={disabled || busy} current={captureCurrent} invoke={saveCapture}>Attach {region ? "region" : "image"}</ConversationImageAction></div>;
  const triggers = <div className="capture-triggers"><ConversationImageAction command="attach-conversation-document" {...smallButtonProps} disabled={disabled || busy} current={current} invoke={onDocument}>Document</ConversationImageAction><ConversationImageAction command="choose-conversation-image" {...smallButtonProps} disabled={disabled || busy || images.length >= 4} current={current} invoke={chooseImage}>Image</ConversationImageAction><ConversationImageAction command="capture-conversation-page" {...smallButtonProps} disabled={disabled || busy || !canCapture || images.length >= 4} title={captureDisabledReason} current={() => current() && !!canCapture && pageCurrent()} invoke={() => takeCapture()}>Capture</ConversationImageAction><ConversationImageAction command="select-conversation-image-region" originalRef={lassoTrigger} {...smallButtonProps} disabled={disabled || busy || !onPage || images.length >= 4} title={onPage ? "Select directly on the visible page" : "Show this page by itself to select an area"} current={() => current() && !!onPage && pageCurrent() && useStore.getState().mode === "focus" && useStore.getState().activePageId === page?.pageId && !useStore.getState().splitPageId} invoke={() => takeCapture(true)}>Select area</ConversationImageAction></div>;
  const showRest = (showAttachedImages && images.length > 0) || !!error || busy || !!capture || !!preview;
  return <><section className="conversation-captures" aria-label="Image references">
    {detachedTools ? toolsTarget && createPortal(triggers, toolsTarget) : triggers}
    {showRest && <div className="conversation-capture-rest">
    {images.length >= 4 && <p className="hint">Four images attached. Remove one to add another.</p>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {busy && <output className="hint" data-block>Preparing image…</output>}
    {showAttachedImages && images.map(item => <div className="conversation-document" key={item.imageId}><label htmlFor={`${imageScope}-${item.imageId}`}><ConversationImageChoice id={`${imageScope}-${item.imageId}`} checked={item.included} disabled={disabled || busy} current={() => imageCurrent(item)} invoke={included => change(item.imageId, included)}/><span><b>{item.filename}</b><small>{item.width} × {item.height} · {Math.ceil(item.byteLength / 1024)} KB</small></span></label><ConversationImageAction command="preview-conversation-image" {...smallGhostButtonProps} disabled={busy} current={() => imageCurrent(item)} invoke={() => inspect(item.imageId)}>Preview</ConversationImageAction><ConversationImageAction command="remove-conversation-image" className="icon-btn xs" aria-label={`Remove ${item.filename}`} disabled={disabled || busy} current={() => imageCurrent(item)} invoke={() => change(item.imageId)}>{shellIconClose}</ConversationImageAction></div>)}
    {capture && !lasso && <div className="capture-editor" ref={review}>
      <p className="hint">{capture.title} · {capture.sourceUrl ? hostOf(capture.sourceUrl) : "Local image"}</p>
      <p className="hint">Drag to select a region. Editable fields are hidden in page captures. Keyboard: arrows move it; Shift + arrows resize it. Escape clears the selection.</p>
      {selection}
      {captureActions}
    </div>}
    {preview && <div ref={review}><ImagePreview snapshot={preview} current={current} onClose={() => setPreview(null)} closeControl={<ConversationImageAction command="cancel-conversation-image" className="icon-btn xs" aria-label="Close image preview" current={current} invoke={() => setPreview(null)}>{shellIconClose}</ConversationImageAction>} /></div>}
    </div>}
  </section>{capture && lasso && overlay === "capture" && createPortal(<div className="page-lasso" role="dialog" aria-modal="true" aria-label="Select an area of the captured page">
    <div className="page-lasso-image" style={{ left: lasso.bounds.left + (lasso.bounds.width - Math.min(lasso.bounds.width / lasso.width, lasso.bounds.height / lasso.height) * lasso.width) / 2, top: lasso.bounds.top + (lasso.bounds.height - Math.min(lasso.bounds.width / lasso.width, lasso.bounds.height / lasso.height) * lasso.height) / 2, width: Math.min(lasso.bounds.width / lasso.width, lasso.bounds.height / lasso.height) * lasso.width, height: Math.min(lasso.bounds.width / lasso.width, lasso.bounds.height / lasso.height) * lasso.height }}>{selection}</div>
    <div className="page-lasso-bar"><span>{capture.title} · Drag to select · Editable fields hidden</span>{captureActions}</div>
  </div>, document.body)}</>;
}
