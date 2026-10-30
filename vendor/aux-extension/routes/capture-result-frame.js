/* Aux-owned source, the capture result, pass 1 (assets/capture-result-nUfmrYC9.js, from the file name
 * to the preview's frame): the screenshot's file name, a data URL as a Blob, the route, and the
 * preview's frame. The preview itself (F) stays supplied around it: its Copy and Download carry
 * vendor/provided/aux-productivity-capture.mjs's error toasts and native save dialog.
 * Names the rest of the chunk uses keep their chunk names: $ screenshotFileName, f dataUrlToBlob,
 * a JSX runtime, se the route, q the frame, F the preview.
 * Chunk names used: T JSX runtime, h the route, j useFramedMessaging, Y the send-message provider,
 * N TooltipProvider, i React. */
/** aux-capture-YYYYMMDD-HHMMSS.png, in local time. */
function $(date = new Date()) {
  const pad = value => String(value).padStart(2, '0');
  return `aux-capture-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.png`;
}
/** A data URL as a Blob. */
function f(dataUrl) {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) throw new Error('Invalid data URL');
  const meta = dataUrl.slice(0, comma),
    data = dataUrl.slice(comma + 1),
    mimeType = /^data:([^;,]+)/u.exec(meta)?.[1] ?? 'application/octet-stream';
  if (!meta.includes(';base64')) return new Blob([decodeURIComponent(data)], {type: mimeType});
  const binary = atob(data),
    bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], {type: mimeType});
}
var a = T();
/** The capture result route: tells the page it is ready, and draws the preview. */
function se() {
  const search = h.useSearch(),
    sendMessage = (0, i.useCallback)(
      message => {
        window.parent.postMessage({...message, frameId: search.frameId}, '*');
      },
      [search.frameId],
    );
  return (
    (0, i.useEffect)(() => {
      sendMessage({type: 'CAPTURE_RESULT_READY'});
    }, [sendMessage]),
    (0, a.jsx)(Y, {value: sendMessage, children: (0, a.jsx)(N, {delay: 500, children: (0, a.jsx)(F, {})})})
  );
}
/** The frame the preview draws in, sized for its shadow. */
function q({children}) {
  const search = h.useSearch(),
    {ref} = j(search.frameId, 'CAPTURE_RESULT_READY');
  return (0, a.jsx)('div', {className: 'w-fit overflow-visible p-4 pr-5 pb-7', ref, children});
}
