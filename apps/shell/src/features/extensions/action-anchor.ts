/** Chromium expects screen DIP coordinates, matching the WebUI's CSS pixels. */
export function extensionActionAnchor(button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  return { x: window.screenX + rect.x, y: window.screenY + rect.y, width: rect.width, height: rect.height };
}
