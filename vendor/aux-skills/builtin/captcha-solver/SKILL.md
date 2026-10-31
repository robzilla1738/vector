---
name: captcha-solver
description: Read this skill when a page has a CAPTCHA that needs solving (reCAPTCHA, Turnstile, hCaptcha, or image CAPTCHA).
icon: "/builtin-skills/v1/captcha-resolver.jpg"
autoInject:
  keywords: ["captcha", "recaptcha", "turnstile", "hcaptcha", "i'm not a robot", "verify you are human", "challenge"]
---

# CAPTCHAs

The `captcha` global in the REPL has three methods: `click`, `drag` and `readText`. `click` and `drag` hand back a fresh snapshot tree so you can check whether it worked.

## Checkbox challenges

```js
// Find the widget's box.
const s = await snapshot(page);
const bounds = await page.evaluate(`(() => {
  const el = document.querySelector('iframe');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
})()`);

// Click it, then read the returned snapshot for a check mark or "verified".
const tree = await captcha.click(page, bounds);
```

## Slider and puzzle challenges

```js
// Drag the handle to where it needs to land; the result is the snapshot after the drag.
const tree = await captcha.drag(page, { x: 150, y: 300 }, { x: 450, y: 300 });

// More steps make a smoother, more precise drag.
const tree = await captcha.drag(page, from, to, { steps: 40 });
```

## Text and number challenges

```js
// Read the characters in the CAPTCHA image.
const text = await captcha.readText(page, { x: 100, y: 200, width: 200, height: 60 });
// -> "xK7m2"

// No bounds? Read the whole page.
const text = await captcha.readText(page);

// Type the answer.
await page.locator('input').fill(text);
```

## Reference

- `captcha.click(page?, bounds): Promise<string>` clicks at the left-middle of the box, waits 3 s, and returns the snapshot tree.
- `captcha.drag(page?, from, to, opts?): Promise<string>` drags between two viewport points. `opts.steps` sets how smooth it is (20 by default). Returns the snapshot tree.
- `captcha.readText(page?, bounds?): Promise<string | null>` screenshots the page (clipped to `bounds` if given), reads it with a vision model, and returns the text.

## Notes

- These widgets usually live in iframes. Viewport coordinates with `page.mouse.click(x, y)` still reach them.
- `annotatedScreenshot()` shows you the challenge's current state when you need to look.
- Image-grid challenges: take an `annotatedScreenshot()`, work out the right cells by looking, then click each one.
