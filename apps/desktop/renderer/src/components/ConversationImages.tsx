import { hostOf } from "../workspace";
import { ImagePreview } from "./ImageSnapshot";
import { useEffect, useRef, useState } from "react";
import type { ConversationImage, PageTarget } from "@aux/contracts";
import { call, errToast, useStore } from "../store";
import { bridge } from "../bridge";
import { I } from "./icons";

type Rect = { x: number; y: number; width: number; height: number };
type Capture = { dataUrl: string; sourceUrl?: string; title: string; filename?: string };

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
export function ConversationImages({ chatId, page, images, disabled, ensureChatId, onChange, onBusy, incomingFile, onFileConsumed }: {
  chatId: string | null | undefined; page?: PageTarget; images: ConversationImage[]; disabled: boolean;
  incomingFile?: File | null; onFileConsumed?(file: File): void;
  ensureChatId(): string; onChange(chatId: string, images: ConversationImage[]): void; onBusy(busy: boolean): void;
}) {
  const [capture, setCapture] = useState<Capture | null>(null);
  const [region, setRegion] = useState<Rect | null>(null);
  const [preview, setPreview] = useState<{ image: ConversationImage; dataUrl: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const review = useRef<HTMLDivElement>(null);
  useEffect(() => { review.current?.scrollIntoView({ block: "nearest" }); }, [capture, preview]);
  const request = useRef(0);
  const locked = useRef(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const currentChat = useRef(chatId);
  currentChat.current = chatId;
  useEffect(() => { setCapture(null); setRegion(null); setPreview(null); setError(""); ++request.current; }, [chatId]);
  useEffect(() => () => { ++request.current; }, []);
  const perform = async (action: (version: number) => Promise<void>) => {
    if (locked.current) return;
    locked.current = true; setBusy(true); onBusy(true); setError("");
    const version = ++request.current;
    try { await action(version); }
    catch (reason) { if (request.current === version) setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { locked.current = false; setBusy(false); onBusy(false); }
  };
  useEffect(() => {
    if (!incomingFile) return;
    const file = incomingFile;
    void perform(async version => {
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
        if (version !== request.current) return;
        setPreview(null); setRegion(null);
        const filename = `${(file.name || "Pasted image").replace(/\.[^.]+$/, "").slice(0, 180)}.png`;
        setCapture({dataUrl:normalized, filename, title:filename});
      } finally { onFileConsumed?.(file); }
    });
  }, [incomingFile]);
  const chooseImage = () => perform(async version => {
    const picked = await bridge.pickEvidenceImage();
    if (!picked || version !== request.current) return;
    setPreview(null); setRegion(null);
    setCapture({ dataUrl: picked.dataUrl, title: picked.filename, filename: picked.filename });
  });
  const takeCapture = () => perform(async version => {
    if (!page) return;
    const result = await call("pages.capture", { pageId: page.pageId, format: "dataUrl", fullPage: false, expectedDocumentEpoch: page.documentEpoch }) as { dataUrl: string };
    if (version !== request.current) return;
    const current = useStore.getState().pages.find(item => item.pageId === page.pageId);
    if (!current || current.url !== page.url || current.documentEpoch !== page.documentEpoch) throw new Error("The page changed during capture. Capture it again.");
    setPreview(null); setRegion(null); setCapture({ dataUrl: result.dataUrl, sourceUrl: page.url, title: page.title || "Page" });
  });
  const saveCapture = () => perform(async version => {
    if (!capture) return;
    const dataUrl = await cropImage(capture.dataUrl, region);
    if (version !== request.current) return;
    const target = ensureChatId();
    // Creating a conversation changes the prop before the save finishes.
    currentChat.current = target;
    const result = await call("conversations.images.add", { chatId: target, filename: capture.filename ? (region ? `${capture.filename.replace(/\.png$/i, "")} region.png` : capture.filename) : `${capture.title.slice(0, 100)}${region ? " region" : " capture"}.png`, dataUrl, sourceUrl: capture.sourceUrl }).catch(error => { if (request.current !== version && currentChat.current === target) errToast(error); throw error; });
    if (currentChat.current === target) { onChange(target, result.images); setCapture(null); setRegion(null); }
  });
  const change = (imageId: string, included?: boolean) => perform(async version => {
    if (!chatId) return;
    const result = await call(included === undefined ? "conversations.images.remove" : "conversations.images.toggle", { chatId, imageId, ...(included === undefined ? {} : { included }) });
    if (version === request.current) { onChange(chatId, result.images); setPreview(null); }
  });
  const inspect = (imageId: string) => perform(async version => {
    const result = await call("conversations.images.read", { chatId: chatId as string, imageId });
    if (version === request.current) { setPreview(result); setCapture(null); }
  });
  const canCapture = page && /^https?:\/\//.test(page.url) && !["crashed", "detached"].includes(page.viewStatus ?? "");
  const captureDisabledReason = disabled ? "Capture is unavailable while this conversation cannot accept attachments."
    : images.length >= 4 ? "Four images attached. Remove one to add another."
    : !page ? "Choose an open web page in Browser context to capture it."
    : !/^https?:\/\//.test(page.url) ? "Page capture is available on http(s) pages, not local or special pages."
    : ["crashed", "detached"].includes(page.viewStatus ?? "") ? "This tab is crashed or detached. Capture is unavailable until it is restored."
    : undefined;
  const showRest = images.length > 0 || !!error || busy || !!capture || !!preview;
  return <section className="conversation-captures" aria-label="Image references">
    <div className="capture-triggers"><button className="btn sm" disabled={disabled || busy || images.length >= 4} onClick={() => void chooseImage()}>Image</button><button className="btn sm" disabled={disabled || busy || !canCapture || images.length >= 4} title={captureDisabledReason} onClick={() => void takeCapture()}>Capture</button></div>
    {showRest && <div className="conversation-capture-rest">
    {images.length >= 4 && <p className="hint">Four images attached. Remove one to add another.</p>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {busy && <p className="hint" role="status">Preparing image…</p>}
    {images.map(item => <div className="conversation-document" key={item.imageId}><label><input type="checkbox" checked={item.included} disabled={disabled || busy} onChange={event => void change(item.imageId, event.target.checked)}/><span><b>{item.filename}</b><small>{item.width} × {item.height} · {Math.ceil(item.byteLength / 1024)} KB</small></span></label><button className="btn sm ghost" disabled={busy} onClick={() => void inspect(item.imageId)}>Preview</button><button className="icon-btn xs" aria-label={`Remove ${item.filename}`} disabled={disabled || busy} onClick={() => void change(item.imageId)}>{I.close}</button></div>)}
    {capture && <div className="capture-editor" ref={review}>
      <p className="hint">{capture.title} · {capture.sourceUrl ? hostOf(capture.sourceUrl) : "Local image"}</p>
      <p className="hint">Drag to select a region. Keyboard: arrows move it; Shift + arrows resize it. Escape clears the selection.</p>
      <div className="capture-canvas" tabIndex={0} role="group" aria-label="Image selection. Arrow keys select and move a region; Shift and arrows resize." onKeyDown={event => {
        if (event.key === "Escape") { setRegion(null); event.preventDefault(); return; }
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
        <img src={capture.dataUrl} alt="Image to review before attaching" draggable={false}/>
        {region && <span className="capture-region" style={{ left: `${region.x * 100}%`, top: `${region.y * 100}%`, width: `${region.width * 100}%`, height: `${region.height * 100}%` }}/>}
      </div>
      <div className="capture-actions"><button className="btn sm ghost" disabled={busy} onClick={() => setCapture(null)}>Cancel</button>{region && <button className="btn sm ghost" disabled={busy} onClick={() => setRegion(null)}>Use whole image</button>}<button className="btn sm" disabled={disabled || busy} onClick={() => void saveCapture()}>Attach {region ? "region" : "image"}</button></div>
    </div>}
    {preview && <div ref={review}><ImagePreview snapshot={preview} onClose={() => setPreview(null)} /></div>}
    </div>}
  </section>;
}
