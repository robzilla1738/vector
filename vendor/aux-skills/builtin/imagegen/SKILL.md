---
name: Image Generation
description: Generate a new image or edit an existing image from a text prompt. Use for illustrations, photos, textures, mockups, visual variants, and reference-image transformations that should produce a bitmap artifact.
icon: "https://app.getaux.co/builtin-skills/v1/image-generation.jpg"
autoInject:
  keywords: ["generate an image", "create an image", "make an image", "edit this image", "image generation", "imagegen"]
---

# Image generation

Call `imagegen.generate({ prompt, inputImages? })` in the REPL. Go straight to generating unless the task needs a reference image you don't have.

For reference images, pass paths to task files, data URLs, or `{ data, mimeType }` objects. You get back full-resolution artifact paths and the image data. Show every image you get back so the user can see it.

```js
const generated1 = await imagegen.generate({ prompt: 'A red circle on a plain white background' });
for (const image1 of generated1.images) display(image1.data);
console.log(generated1.images.map((image1) => image1.path));
```

To edit an image, pass it in and describe the whole result you want, not just the change:

```js
const edited1 = await imagegen.generate({
  prompt: 'Keep the composition and replace the daytime sky with a starry night sky',
  inputImages: ['/absolute/session/attachments/source.png'],
});
for (const image2 of edited1.images) display(image2.data);
console.log(edited1.images.map((image2) => image2.path));
```

- Don't pass provider-specific options for size, quality or billing.
- If it fails, report the error briefly and exactly. Retry only if the error itself says a retry may work.
- A refusal or policy error is final. Don't work around it by compositing the image by hand.
- Only point the user at Settings > AI when the error is about provider setup.
