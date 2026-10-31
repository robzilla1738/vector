---
name: pdf
description: Use this skill to read, render, merge, split, rotate, or fill PDFs.
icon: "/builtin-skills/v1/pdf.jpg"
---

# PDF

PDF work goes through `aux.pdf` in the REPL. `await` every call before you use what it returns or the files it writes.

```js
await aux.pdf.renderPages({
  filePath: './input.pdf',
  outputDir: './tmp/pdf',
  pages: [1, 3],
  maxDimension: 1600,
});
await aux.pdf.extractText({ filePath: './input.pdf', pages: [1, 3] });
await aux.pdf.merge({
  files: [{ filePath: './a.pdf', pages: [1, 3] }, { filePath: './b.pdf' }],
  outputPath: './artifacts/merged.pdf',
});
await aux.pdf.split({ filePath: './input.pdf', outputDir: './artifacts/pages', pages: [1, 3] });
await aux.pdf.rotate({ filePath: './input.pdf', outputPath: './artifacts/rotated.pdf', pages: [1], degrees: 90 });
await aux.pdf.getFormFields({ filePath: './input.pdf' });
await aux.pdf.fillFormFields({
  filePath: './input.pdf',
  outputPath: './artifacts/filled.pdf',
  fields: [
    { field_id: 'name', value: 'Ada' },
    { field_id: 'age', value: 42 },
    { field_id: 'subscribe', value: true },
    { field_id: 'plan', value: 'premium' },
    { field_id: 'notes', value: null },
  ],
});
```

Page numbers start at 1. Leave out `pages` to mean every page.

| Call | What it does |
| --- | --- |
| `renderPages({ filePath, outputDir, pages?, maxDimension? })` | Writes a PNG per page and returns each one's page, path, width and height. `maxDimension` is 256–4096 px, 1600 by default. |
| `extractText({ filePath, pages? })` | Returns the text embedded in each page. No OCR. |
| `merge({ files: [{ filePath, pages? }], outputPath })` | Joins the files in the order given; a file without `pages` contributes all of them. |
| `split({ filePath, outputDir, pages? })` | Writes one PDF per chosen page (or per page). |
| `rotate({ filePath, outputPath, degrees, pages? })` | Turns pages relative to how they sit now. `degrees` is `-270`, `-180`, `-90`, `90`, `180` or `270`. |
| `getFormFields({ filePath })` | Lists each field's `field_id`, `type`, `options` and `export_value`, which is what you need to fill it. |
| `fillFormFields({ filePath, outputPath, fields })` | Every entry needs `field_id` and `value`. Values are strings, numbers, booleans or `null`. Use a listed option for choice fields, a boolean for checkboxes, and the export-value string for radio buttons. XFA forms aren't supported. |
