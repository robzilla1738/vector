---
name: visualize
description: Read before answering with a visual (chart, table, diagram, timeline, comparison, image collage, mockup) rendered inline in the chat.
icon: "https://app.getaux.co/builtin-skills/v1/visualize.jpg"
---

# Inline visuals

Put one self-contained HTML page in a `visual` code block and Aux renders it inside your reply, in a sandboxed frame as tall as the page. Reach for it when a picture explains better than words. Plain answers stay in Markdown.

Aim for this level of finish: two headline figures above a bar chart drawn by hand.

```visual
<!doctype html>
<html>
<head>
  <title>Weekly signups</title>
  <style>
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .k { color: var(--muted-foreground); font-size: 12px; }
    .v { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
    .up { font-size: 12px; color: var(--success); }
    .bars { display: flex; gap: 10px; align-items: flex-end; height: 150px; border-bottom: 1px solid var(--border); }
    .b { flex: 1; position: relative; border-radius: 6px 6px 2px 2px; background: color-mix(in oklab, var(--chart-1) 35%, transparent); }
    .b.now { background: var(--chart-1); }
    .b i { position: absolute; top: -18px; left: 0; right: 0; text-align: center; font-style: normal; font-size: 11px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
    .ticks { display: flex; gap: 10px; margin-top: 6px; font-size: 11px; color: var(--muted-foreground); }
    .ticks div { flex: 1; text-align: center; }
  </style>
</head>
<body>
  <div class="kpis">
    <div><div class="k">Signups this week</div><div class="v">1,940</div><div class="up">+12% vs last week</div></div>
    <div><div class="k">Busiest day</div><div class="v">Thu</div><div class="k">412</div></div>
  </div>
  <div class="bars">
    <div class="b" style="height:58%"><i>240</i></div>
    <div class="b" style="height:71%"><i>293</i></div>
    <div class="b" style="height:80%"><i>331</i></div>
    <div class="b now" style="height:100%"><i>412</i></div>
    <div class="b" style="height:74%"><i>305</i></div>
  </div>
  <div class="ticks"><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div></div>
</body>
</html>
```

## Rules

- A full HTML document; keep styles and scripts inline. Libraries from a public `https:` CDN (Chart.js, D3, Mermaid and the like) load fine, but use inline SVG or plain HTML when that's enough.
- Give it a `<title>` naming the visual; the user sees it when they expand the frame.
- Write your reply around the block. The user can see the page, so don't announce it ("here's a chart") or repeat its numbers. Add only what the visual doesn't already say.
- Nothing in the page can see Aux, the user's session or their cookies, and `fetch` reaches only public endpoints that allow CORS. Bake in the data you already gathered.
- `http(s)` links open in a new browser tab.
- Keep the page to about 100 KB or less, and keep secrets and passwords out of it.
- Visuals only render in Aux's own chat. In a Slack, Telegram or other channel conversation the block won't show up, so send a screenshot of your preview.

## Design

It should look like a finished part of Aux, not a generated web page. Hold back.

- **Type does the hierarchy.** One big number or heading per idea (20–28 px, weight 600, `letter-spacing: -0.02em`); small muted labels (11–12 px, `--muted-foreground`). `font-variant-numeric: tabular-nums` on every figure.
- **Spacing** on a 4/8 px grid, generous and even, everything aligned to one left edge.
- **Color means something.** Neutral by default; one accent (`--chart-1`) for the thing in focus; `color-mix(in oklab, var(--chart-1) 35%, transparent)` for context; other `--chart-*` colors only for genuinely separate series; `--success` and `--destructive` only for good and bad changes.
- **Few boxes.** Use whitespace and thin `--border` lines rather than containers. If you need cards: `--surface-primary` fill, `border-radius: var(--radius)`, no shadow.
- **Put labels on the data itself** (numbers on the bars, series names where the lines end) rather than in a legend. Gridlines and axes should be pale or absent.
- **Interactive where it helps someone explore:** exact values on hover, a crosshair for line charts, a segmented control for switching metric or time range, diagram nodes that light up their connections and open a details panel when clicked. One short entrance animation (a line drawing itself, numbers counting up, 600–900 ms ease-out). No endless loops, apart from a gentle animated flow on the diagram edges in use.
- **Diagrams** are inline SVG. Nodes are rounded rectangles holding a title and a quieter subtitle, joined by curved (cubic-bezier) edges. No ASCII art and no Mermaid. Dim what isn't selected instead of hiding it.
- **Write the takeaway onto the chart** (say, a pale dashed line marked "before the fix", or a dot on the day traffic jumped) and your reply can stay brief.
- **Round ticks** (0, 500 ms, 1 s) and short date labels. Redraw SVG charts from a `ResizeObserver` so they stay sharp at any width.
- **Never:** gradients, drop shadows, emoji, decorative icons, centered body text, ALL-CAPS headings, default blue links, heavy borders, or a banner title that repeats your reply.
- **Draw it yourself in HTML, CSS and SVG** when you can, because that picks up the theme precisely. With a chart library, restyle it: `--font-sans` at 11 px, ticks in `--muted-foreground`, grid in `--border` or none, no outline around the chart, little or no legend. Default library styling clashes with Aux.
- **Canvas charts** don't follow CSS variables on their own. Redraw on `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', …)`, which tracks Aux's theme.

## Layout

- The frame has no border, sits on the chat background, and is as wide as the reply column: about 320 px in a narrow side panel, up to about 760 px. Let the width flow, with no side padding and nothing wrapped around it (no card, border or header): the page is part of your reply.
- Give charts a fixed height in pixels; don't tie height to width.
- Adapt to the container's width (`grid-template-columns: repeat(auto-fit, minmax(…))`, `flex-wrap`, SVG redrawn from `ResizeObserver`), not `@media` queries. The preview check below narrows the page, not the window, so it can't exercise media queries.
- Let the content decide the height. Never use `100vh` or `height: 100%` on html or body: the frame resizes to the page, so a height based on the viewport feeds back and grows without end.
- Leave the background transparent. Don't set one on html or body.

## Theme

Aux injects its current theme as CSS custom properties on `:root`, and they switch live between light and dark. Style only with these, never with fixed light or dark colors:

`--foreground`, `--muted-foreground` (secondary text), `--muted` (subtle fill), `--background`, `--surface-primary`, `--surface-secondary` (card fills), `--border`, `--input`, `--ring`, `--primary`, `--primary-foreground` (solid buttons), `--secondary`, `--secondary-foreground`, `--accent`, `--accent-foreground`, `--popover`, `--popover-foreground`, `--brand` (accent color), `--destructive`, `--success`, `--chart-1` … `--chart-6` (series colors), `--radius`, `--font-sans`, `--font-mono`.

The base stylesheet sets the html text color, 14 px `--font-sans` text and `body { margin: 0 }`, and hides the page scrollbar. Your CSS can override any of it. In scripts, read a color with `getComputedStyle(document.documentElement).getPropertyValue('--chart-1')`.

## Images

To show a screenshot or generated image, reference the file in this session by absolute path, in a quoted attribute or a CSS `url()`: `<img src="/abs/path/to/session/tmp/shot.png">`. Aux inlines it when rendering. Anything outside this session's folder, or any `file://` URL, stays blank.

## Check it before you reply

Unless it's just a simple table, open it in a throwaway tab first: screenshot it at chat-column width and at side-panel width, check for script errors, and fix problems before you answer. You can't open `file://` tabs, so load the HTML into `about:blank`:

```js
const probe = `<script>window.__errors=[];addEventListener('error',e=>__errors.push(e.message));addEventListener('unhandledrejection',e=>__errors.push(String(e.reason)));</script>`;
const preview = await openTab('about:blank');
await preview.evaluate((page) => { document.open(); document.write(page); document.close(); }, html.replace('<head>', `<head>${previewTheme}${probe}`));
await sleep(1000); // give CDN scripts and entrance animations time
for (const width of [728, 380]) {
  await preview.evaluate((w) => { document.documentElement.style.width = w + 'px'; dispatchEvent(new Event('resize')); }, width);
  display(await preview.screenshot({ clip: { x: 0, y: 0, width, height: 900 } }));
}
console.log(await preview.evaluate(() => window.__errors));
await closeTab(preview);
```

Session images show as broken boxes in this preview. That's expected: Aux only inlines them in the real chat.

Outside Aux's frame there are no theme variables, so add this dark stand-in theme (`previewTheme`) for the preview only. Never leave it in the final block:

```html
<style>:root{color-scheme:dark;--background:#171717;--foreground:#fafafa;--muted:rgba(250,250,250,.15);--muted-foreground:rgba(250,250,250,.55);--surface-primary:rgba(250,250,250,.08);--surface-secondary:rgba(250,250,250,.06);--border:rgba(250,250,250,.1);--primary:rgba(250,250,250,.85);--primary-foreground:#171717;--brand:#38bdf8;--destructive:#f87171;--success:#34d399;--chart-1:#38bdf8;--chart-2:#2dd4bf;--chart-3:#fbbf24;--chart-4:#c084fc;--chart-5:#fb7185;--chart-6:#a3e635;--radius:.625rem;--font-sans:system-ui,sans-serif;--font-mono:Menlo,monospace}html{background:var(--background);color:var(--foreground);font:14px/1.5 var(--font-sans)}body{margin:0}</style>
```
