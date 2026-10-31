---
name: pptx
description: Use this skill whenever a PowerPoint .pptx file must be read, created, inspected, or edited, including slides, notes, images, tables, charts, layouts, and package metadata.
icon: "/builtin-skills/v1/pptx.jpg"
license: Proprietary. LICENSE.txt has complete terms
---

# PowerPoint decks (.pptx)

**This needs a shell.** If you have no Bash tool in this chat, you can't do this work here. Say so, and tell the user that connecting Claude Code or Codex in Settings › Models gives the chat a shell and file tools, then offer what you can do from the browser instead.

A .pptx is a ZIP of OOXML parts. Use the bundled MarkItDown for a fast read of the content in order, `python-pptx` for structure and changes, and Python's `zipfile` plus an XML parser for package parts and metadata.

## Ground rules

- `read_file` won't read .pptx content; it points you here.
- Run Python inline in the Bash call with a quoted heredoc. Only write a `.py` file if the user wants a script.
- Don't install anything. `markitdown[pptx]` and `python-pptx` are already there.
- Edit the existing deck and change only what the task needs. Never rebuild a deck from extracted Markdown.
- Write the result to a new file unless the user asked you to overwrite the original.
- Unzip with `zipfile`, not a shell `unzip`, so it works on macOS and Windows alike.

## Which tool for what

| Job | How |
| --- | --- |
| Read or analyze | MarkItDown, then a `Presentation(path)` inventory |
| Edit, or build from a template | Reuse the template's layouts and placeholders |
| Build from nothing | `Presentation()` with a deliberate visual system |
| Package-level feature | Inspect the OOXML and edit as little as possible |
| Check the result | MarkItDown, reopen, compare structure, test the ZIP |

## Reading

`python -m markitdown input.pptx` gives the text and notes in order. Don't stop there. Use `python-pptx` to take stock: slide count and order, slide size, layout names, shape types and counts per slide, which slides have notes, core properties, and the ZIP entry list.

Go deeper (geometry, placeholder indices, groups, runs, tables, charts, pictures, notes, relationships, masters, other parts) only where the task or that inventory points.

An empty MarkItDown result proves nothing about images, charts, comments, embedded objects or layout; check those directly.

## Editing

1. List what's in the deck: its layouts, placeholders, media, notes and any unusual parts.
2. Note which layout and placeholder conventions each target slide uses.
3. Make the smallest `python-pptx` change that does the job.
4. Use raw OOXML only for the part that needs it, keeping every other entry and relationship.
5. Save to a new file and run the same content and structure checks again.

While editing:

- fill the template's layouts and placeholders rather than drawing new text boxes;
- when formatting varies inside a paragraph, change only the run you mean to;
- don't replace a whole text frame if its paragraph or run formatting must survive;
- leave chart data, media, notes, comments and embedded objects in place unless removing them is the job;
- match the geometry, type, colors and spacing of the slides around it;
- check what's actually supported before reordering slides or touching animations, transitions, comments or embedded objects.

## Building a new deck

Use `Presentation()` and set the slide size if the target format is known. Before adding content, settle the audience, the purpose, the one message and the order of slides. One main point per slide; detail goes in the notes or an appendix.

Build with `slide_layouts`, the shape factories, text frames, `ChartData`, tables, pictures and notes slides. Measure in `Inches` and `Pt`, not EMUs. Use native charts when people will want to edit them, images when exact appearance matters more. Keep image aspect ratios unless cropping was asked for.

## Design

Don't fall back on slide after slide of title and bullets. Pick a look that suits the subject and hold it across the deck.

**Decide up front:**

- A palette drawn from the content, not stock blue. One color carries most of the weight (roughly 60–70%), one or two support it, and one sharp accent is used sparingly.
- Whether sections alternate dark and light or the whole deck shares one background.
- One repeated motif: rounded image frames, numbered badges, a distinctive edge, something like that.
- If the user gave you a template, its theme and conventions win.

**Starting palettes** (adapt to the subject):

| Name | Main | Support | Accent |
| --- | --- | --- | --- |
| Midnight Executive | `1E2761` | `CADCFC` | `FFFFFF` |
| Forest & Moss | `2C5F2D` | `97BC62` | `F5F5F5` |
| Coral Energy | `F96167` | `F9E795` | `2F3C7E` |
| Warm Terracotta | `B85042` | `E7E8D1` | `A7BEAE` |
| Charcoal Minimal | `36454F` | `F2F2F2` | `212121` |
| Berry & Cream | `6D2E46` | `A26769` | `ECE2D0` |

**Each slide:** add a visual when it says something (an image, chart, diagram, icon, timeline, comparison, or a big number). Good layouts include two columns, side-by-side comparison, process flow, a 2×2 card grid, an image bleeding off one side, and one big number. Vary them across the deck but keep alignment and spacing consistent.

**Type:** use fonts the target machine has, with a clear hierarchy: titles 36–44 pt bold, section headers 20–24 pt bold, body 14–18 pt, captions and sources 10–12 pt. Go bigger for sparse decks or big rooms. Left-align body text; center only titles and short callouts.

**Spacing:** at least 0.5 in from the slide edges, about 0.3–0.5 in between blocks, the same gap everywhere, related things aligned, text-frame insets accounted for, and real whitespace.

**Avoid:**

- the same title-and-bullets layout over and over, or walls of text;
- centered paragraphs, or titles barely bigger than body text;
- random colors, uneven gaps, low-contrast text or shapes;
- tiny source lines, skinny text boxes, lots of wrapping;
- charts that decorate instead of inform;
- leftover template prompts or placeholder text;
- styling a few slides and leaving the rest plain.

## Checking your work

Go looking for problems; don't just confirm it ran.

- **Content:** run MarkItDown on the output and look for missing, duplicated, stale or out-of-order content. Search for placeholders such as `lorem`, `ipsum`, `xxxx` and template instructions. Make sure notes and sources are on the right slides.
- **Structure:** reopen with `Presentation` and compare counts of slides, layouts, shapes, media, charts, notes, comments, embedded objects, relationships and core properties. Every shape should be inside the slide, and the intended layouts and placeholder indices should be intact. Run `ZipFile(path).testzip()`.
- **Visual:** structure can't catch overflow, low contrast, overlaps, bad crops or a weak hierarchy, and the bundled tools can't render slides to images. Say visual QA wasn't possible.

Then loop: list every problem you found (the first pass is rarely the last), fix those slides, and check them again, since one fix can cause another problem.

## Bundled

- `markitdown[pptx]`, `python-pptx`

Only when you're unsure about an API or what it supports, check the [python-pptx docs](https://python-pptx.readthedocs.io/en/latest/) or the [MarkItDown 0.1.5 docs](https://github.com/microsoft/markitdown/tree/v0.1.5).
