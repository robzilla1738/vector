let opener: HTMLElement | null = null;

export function rememberSiteControlsOpener(el: EventTarget | null) {
  opener = el instanceof HTMLElement ? el : null;
}

export function restoreSiteControlsOpener() {
  const current = opener?.isConnected ? opener : null;
  const fallback = [...document.querySelectorAll<HTMLButtonElement>('[aria-label="Site controls"]')].find(button => button.offsetParent !== null);
  (current ?? fallback)?.focus();
}
