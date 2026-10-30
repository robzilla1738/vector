---
name: visual-browse
description: Read this when you need a coordinate fallback for visible browser UI that snapshots, refs, or locators cannot target reliably.
icon: "https://app.getaux.co/builtin-skills/v1/visual-browsing.jpg"
---

# Visual browsing

The `cua` global in the REPL lets you act on the page by screen coordinates. It's a fallback for visible browser UI that `snapshot(page)`, refs and locators can't hit reliably. Use it only for as long as the task really depends on what's drawn on screen.

## Use it for

- **Apps drawn on a canvas:** slide, document and image editors, maps, games, charts, whiteboards, simulations.
- **Custom visual controls:** drag handles, sliders, drawing areas, crop boxes, map pins, timelines.
- **Refs that don't work:** a visible control whose ref is stale, missing, covered, or keeps hitting the wrong thing.
- **Checking by eye:** when the DOM doesn't tell you enough and the next step depends on what's actually shown.

## Don't use it for

- reading ordinary page text;
- just navigating;
- plain buttons, links, inputs, menus or forms that have working refs;
- guessing coordinates over and over without looking at what happened.

When `snapshot(page)`, refs and locators can do the job, use them.

## How to work

- `cua` works on whichever `page` is active right now. Open or switch to the right tab first.
- If you don't already know the coordinates, run `display(await cua.getVisibleScreenshot())` before acting.
- After any action that changes the page, check the result before doing the next thing: `snapshot(page)` when the DOM or refs matter, `display(await cua.getVisibleScreenshot())` when the visuals do.
- As soon as the visual part is done (the CAPTCHA is solved, the canvas edit is made, the stubborn dropdown is submitted), go back to `snapshot(page)`, refs and locators.
- Coordinates are for pixel-level work. Wherever a control has a ref or locator, use that.

## When it isn't working

- A popup, modal or cookie banner in the way? Deal with it first.
- An action had no visible effect? Take a fresh screenshot before trying again.
- The same coordinate approach failed 2–3 times? Change tactics instead of repeating it.
- In layered canvas editors, use the larger sidebar and toolbar controls rather than precise clicks on stacked objects.

## API

```ts
interface CUAAPI {
  /** Click a point in the viewport. */
  click(options: {
    x: number;
    y: number;
    button?: 'left' | 'middle' | 'right'; // left if omitted
    keypress?: string[]; // modifier keys held while clicking
  }): Promise<void>;

  /** Double-click a point in the viewport. */
  doubleClick(options: {
    x: number;
    y: number;
    keypress?: string[]; // modifier keys held while double-clicking
  }): Promise<void>;

  /** Drag along a path of viewport points. */
  drag(options: {
    path: Array<{ x: number; y: number }>;
    keys?: string[]; // modifier keys held while dragging
  }): Promise<void>;

  /** The visible part of the page as a base64 PNG. */
  getVisibleScreenshot(): Promise<string>;

  /** Press a key combination on the focused element. */
  keypress(options: {
    keys: string[];
  }): Promise<void>;

  /** Move the mouse to a point. */
  move(options: {
    keys?: string[]; // modifier keys held while moving
    x: number;
    y: number;
  }): Promise<void>;

  /** Scroll by a delta, starting from a viewport point. */
  scroll(options: {
    keypress?: string[]; // modifier keys held while scrolling
    scrollX: number;
    scrollY: number;
    x: number;
    y: number;
  }): Promise<void>;

  /** Type text into whatever has focus. */
  type(options: { text: string }): Promise<void>;
}
```

**Modifier keys** for `keypress` and `keys`: `Alt`, `Control`, `ControlOrMeta`, `Meta`, `Shift`. `ControlOrMeta` is `Meta` on macOS and `Control` elsewhere. `Cmd`, `Command`, `Ctrl` and `Option` work as aliases.

## Examples

```js
display(await cua.getVisibleScreenshot());
```

```js
await cua.click({ x: 420, y: 315 });
console.log((await snapshot(page)).tree);
```

```js
await cua.drag({
  path: [
    { x: 240, y: 540 },
    { x: 320, y: 540 },
    { x: 410, y: 540 },
  ],
});
```
