import { clipboard, dialog, Menu, type WebContents, type MenuItemConstructorOptions } from "electron";
import { mediaActionScript, type MediaAction } from "./media-action.js";
import type { PageQuickAction } from "@aux/contracts";

function canOpenTab(value: string) {
  try { return ["http:","https:","file:"].includes(new URL(value).protocol); }
  catch { return false; }
}

/** Native right-click menu for page views — links, images, editing, nav, inspect. */
export function showPageMenu(wc: WebContents, p: Electron.ContextMenuParams, hooks: {
  openAsTab(url:string, referrer?:Electron.Referrer):void;
  onAudio():void;
  onPageAction?(action:Omit<PageQuickAction,"pageId">):void;
  /** Fill the clicked frame's form with saved personal info. */
  autofill?(frame:Electron.WebFrameMain):void;
  /** Vault credentials matching this page, resolved before menu build. */
  credentials?:{items:{itemId:string;label:string;username?:string}[];fill(itemId:string):void};
  /** Explicit translation through the configured model provider. */
  translatePage?():void;
  translateSelection?(text:string,x:number,y:number):void;
}) {
  if(wc.isDestroyed())return;
  const t: MenuItemConstructorOptions[] = [];
  if (hooks.onPageAction && !p.isEditable) {
    const selected = p.selectionText.trim();
    const source = { url: p.frameURL || wc.getURL(), title: wc.getTitle(), selection: selected.slice(0, 12000), truncated: selected.length > 12000 };
    t.push({ label: selected ? "Ask Aux about selection…" : "Summarize page with Aux…", click: () => hooks.onPageAction?.({ ...source, action: selected ? "ask" : "summarize" }) });
    if (selected) t.push(
      { label: "Explain selection with Aux…", click: () => hooks.onPageAction?.({ ...source, action: "explain" }) },
      { label: "Summarize selection with Aux…", click: () => hooks.onPageAction?.({ ...source, action: "summarize" }) },
      { label: "Remember selection…", click: () => hooks.onPageAction?.({ ...source, action: "remember" }) },
    );
    t.push({ type: "separator" });
  }
  const selectedText = p.selectionText.trim();
  if (hooks.translateSelection && selectedText && !p.isEditable) {
    t.push({ label: "Translate selection…", click: () => hooks.translateSelection?.(selectedText.slice(0, 12000), p.x, p.y) });
  }
  if (hooks.translatePage && /^https?:/.test(wc.getURL()) && !p.isEditable) {
    t.push({ label: "Translate page…", click: () => hooks.translatePage?.() });
    t.push({ type: "separator" });
  }
  if(wc.isCurrentlyAudible()||wc.isAudioMuted())t.push({label:wc.isAudioMuted()?'Unmute tab':'Mute tab',click:()=>{wc.setAudioMuted(!wc.isAudioMuted());hooks.onAudio();}},{type:'separator'});

  if (p.misspelledWord) {
    for (const s of p.dictionarySuggestions.slice(0, 5)) {
      t.push({ label: s, click: () => wc.replaceMisspelling(s) });
    }
    if (p.dictionarySuggestions.length === 0) t.push({ label: "No suggestions", enabled: false });
    t.push({ label: "Learn Spelling", click: () => wc.session.addWordToSpellCheckerDictionary(p.misspelledWord) });
    t.push({ type: "separator" });
  }

  if (p.linkURL) {
    t.push(
      { label: "Open Link in New Tab", enabled:canOpenTab(p.linkURL), click: () => hooks.openAsTab(p.linkURL, { url: p.frameURL || wc.getURL(), policy: "strict-origin-when-cross-origin" }) },
      { label: "Copy Link", click: () => clipboard.writeText(p.linkURL) },
      { type: "separator" },
    );
  }

  if (p.mediaType === "image" && p.srcURL) {
    t.push(
      { label: "Open Image in New Tab", enabled:canOpenTab(p.srcURL), click: () => hooks.openAsTab(p.srcURL) },
      { label: "Copy Image", click: () => wc.copyImageAt(p.x, p.y) },
      { label: "Save Image…", click: () => wc.downloadURL(p.srcURL) },
      { type: "separator" },
    );
  }

  if (p.mediaType === "video" || p.mediaType === "audio") {
    const mediaType = p.mediaType;
    const invoke = (action: MediaAction) => async () => {
      try {
        if (wc.isDestroyed() || !p.frame || p.frame.url !== (p.frameURL || p.pageURL)) throw new Error("This page changed. Open the media menu again.");
        await p.frame.executeJavaScript(mediaActionScript(mediaType, p.srcURL, action), true);
      } catch (error) {
        if (!wc.isDestroyed()) void dialog.showMessageBox({type: "info", title: "Media unavailable", message: "Aux couldn’t change playback.", detail: error instanceof Error ? error.message : String(error), buttons: ["OK"]});
      }
    };
    t.push({label: p.mediaFlags.isPaused ? "Play" : "Pause", enabled: !p.mediaFlags.inError, click: invoke(p.mediaFlags.isPaused ? "play" : "pause")});
    if (p.mediaFlags.hasAudio) t.push({label: p.mediaFlags.isMuted ? "Unmute media" : "Mute media", click: invoke(p.mediaFlags.isMuted ? "unmute" : "mute")});
    if (p.mediaFlags.canLoop) t.push({label: "Loop", type: "checkbox", checked: p.mediaFlags.isLooping, click: invoke(p.mediaFlags.isLooping ? "unloop" : "loop")});
    if (p.mediaFlags.canToggleControls) t.push({label: "Show controls", type: "checkbox", checked: p.mediaFlags.isControlsVisible, click: invoke(p.mediaFlags.isControlsVisible ? "hide-controls" : "controls")});
    if (mediaType === "video" && (p.mediaFlags.canShowPictureInPicture || p.mediaFlags.isShowingPictureInPicture)) t.push({label: p.mediaFlags.isShowingPictureInPicture ? "Exit Picture-in-Picture" : "Picture-in-Picture", click: invoke(p.mediaFlags.isShowingPictureInPicture ? "exit-picture-in-picture" : "picture-in-picture")});
    if (p.srcURL) {
      const label=p.mediaType === "video" ? "Video" : "Audio";
      t.push(
        {label:`Copy ${label} Address`,click:()=>clipboard.writeText(p.srcURL)},
        {label:`Open ${label} in New Tab`,enabled:canOpenTab(p.srcURL),click:()=>hooks.openAsTab(p.srcURL)},
        {label:`Save ${label}…`,enabled:p.mediaFlags.canSave,click:()=>wc.downloadURL(p.srcURL)},
        {type:"separator"},
      );
    } else t.push({type: "separator"});
  }

  if (p.isEditable) {
    t.push(
      { label: "Undo", enabled:p.editFlags.canUndo, click:()=>wc.undo() }, { label: "Redo", enabled:p.editFlags.canRedo, click:()=>wc.redo() }, { type: "separator" },
      { label: "Cut", enabled: p.editFlags.canCut, click:()=>wc.cut() },
      { label: "Copy", enabled: p.editFlags.canCopy, click:()=>wc.copy() },
      { label: "Paste", enabled: p.editFlags.canPaste, click:()=>wc.paste() },
      { label: "Paste and Match Style", enabled:p.editFlags.canPaste, click:()=>wc.pasteAndMatchStyle() },
      { label: "Select All", enabled: p.editFlags.canSelectAll, click:()=>wc.selectAll() },
      { type: "separator" },
    );
    if (hooks.autofill) t.push({ label: "Fill personal info", click: () => hooks.autofill?.(p.frame ?? wc.mainFrame) });
    if (hooks.credentials?.items.length) {
      const items = hooks.credentials.items;
      t.push({
        label: "Fill sign-in",
        submenu: items.slice(0, 6).map(item => ({
          label: item.username ? `${item.label} — ${item.username}` : item.label,
          click: () => hooks.credentials?.fill(item.itemId),
        })),
      });
    }
    if (hooks.autofill || hooks.credentials?.items.length) t.push({ type: "separator" });
  } else if (p.selectionText) {
    t.push({ label: "Copy", click:()=>wc.copy() }, { type: "separator" });
  }

  if (!p.isEditable && !p.selectionText && !p.linkURL && p.mediaType === "none") {
    t.push(
      { label: "Back", enabled: wc.navigationHistory.canGoBack(), click: () => wc.goBack() },
      { label: "Forward", enabled: wc.navigationHistory.canGoForward(), click: () => wc.goForward() },
      { label: "Reload", click: () => wc.reload() },
      { type: "separator" },
    );
  }

  t.push({
    label: "Inspect Element",
    click: () => {
      wc.inspectElement(p.x, p.y);
      if (!wc.isDevToolsOpened()) wc.openDevTools({ mode: "detach" });
    },
  });
  Menu.buildFromTemplate(t).popup();
}
