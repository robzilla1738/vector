---
name: docx
description: Use this skill whenever a Word .docx file must be read, created, inspected, or edited, including its tables, images, headers, footers, comments, tracked changes, and package metadata.
icon: "/builtin-skills/v1/docx.jpg"
license: Proprietary. LICENSE.txt has complete terms
---

# Word documents (.docx)

**This needs a shell.** If you have no Bash tool in this chat, you can't do this work here. Say so, and tell the user that connecting Claude Code or Codex in Settings › Models gives the chat a shell and file tools, then offer what you can do from the browser instead.

A .docx is a ZIP of OOXML parts. Work on it with the bundled `python-docx`, and drop to Python's `zipfile` plus an XML parser for anything the library doesn't model (package parts, metadata, revisions).

## Ground rules

- `read_file` won't read .docx content; it points you here.
- Run Python inline in the Bash call with a quoted heredoc. Only write a `.py` file if the user wants a script.
- Don't install anything. `python-docx` is already there.
- Edit the existing file in place in memory and change only what the task needs. Never rebuild a document from its extracted text.
- Write the result to a new file unless the user asked you to overwrite the original.
- Unzip with `zipfile`, not a shell `unzip`, so it works on macOS and Windows alike.

## Which tool for what

| Job | How |
| --- | --- |
| Read or analyze | `Document(path)`, plus a look at the ZIP/XML parts that matter |
| Create | `Document()` with page size, styles and sections set on purpose |
| Edit | Open the source and touch only the objects involved |
| Comments | `document.comments`, `document.add_comment()` |
| Tracked changes, other package-level features | Inspect the OOXML and edit as little as possible |
| Check the result | Reopen, compare the structure, run `ZipFile.testzip()` |

## Reading

First take stock: counts of paragraphs, tables, sections, headers, footers and inline shapes; the core properties; the list of ZIP entries; and whether the package is intact. Then dig only into what the task touches: runs, styles, hyperlinks, numbering, image relationships, comments, footnotes and endnotes, custom properties, embedded objects, custom XML.

`document.paragraphs` doesn't include everything. Text in tables, headers, footers, text boxes and revision wrappers has to be reached by walking those containers or reading the XML.

You can't render pages here. The bundled libraries don't draw .docx, so say page images are unavailable, and don't claim anything about how it looks, paginates or clips based on structure alone.

## Creating

- Start from `Document()`. Use `docx.shared` for units (`Inches`, `Cm`, `Mm`, never raw EMUs), `docx.enum` for enums, and styles for formatting. Import only what you use.
- **Page:** when layout matters, set width, height, orientation and margins yourself. For landscape, set the orientation and swap width and height together. US Letter is 8.5 × 11 in; A4 is 210 × 297 mm. Usable width is the page width less both side margins.
- **Styles:** set up Normal and the built-in headings instead of formatting run by run. Use the template's exact style names, keep heading levels meaningful (navigation and TOC depend on them), and match existing styles when editing.
- **Lists:** use real numbering or the `List Bullet` / `List Number` styles. Never type bullets or numbers by hand. Check `word/numbering.xml` when continuation, restarts or multilevel lists matter.
- **Tables:** size the table and columns from the usable width and apply cell widths consistently. Give cells readable padding and match existing borders, shading, alignment and row settings. Every cell holds at least one paragraph; format it as needed. Don't use tables as divider lines.
- **Images:** use `document.add_picture()` or `run.add_picture()` for inline pictures, with deliberate dimensions and the aspect ratio kept unless cropping was asked for. Existing images live in the relationships and `word/media/`. Anchored (floating) pictures, wrapping beyond inline, and some alt-text details can require OOXML; check what the library supports first.
- **Page breaks:** `document.add_page_break()`, a run break, or the paragraph's page-break setting. Never stacks of empty paragraphs. Use a section break when what follows needs different geometry, columns, headers or footers.
- **Hyperlinks:** read them through the paragraph hyperlink objects and relationships. When adding or changing one, keep relationship ids intact and tell external links apart from internal bookmarks.
- **Footnotes and endnotes:** look at `word/footnotes.xml`, `word/endnotes.xml`, their relationships, content types and references. Change them only when you understand every linked part and id.
- **Tab stops:** align text and dot leaders with paragraph tab stops, never runs of spaces, and check the positions against the content width and indents.
- **Columns:** they're section properties (`w:cols` in `sectPr`) and may need a targeted XML edit. Keep count, widths, spacing, separators and section-break behavior.
- **Table of contents:** only when asked. Use Heading 1/2/3 and insert a TOC field. Word has to update the field after opening, so never fake it with typed page numbers.
- **Headers and footers:** use the section objects, check `is_linked_to_previous` before editing, and check first-page and odd/even settings. Page numbers are fields; they may need OOXML and a later update in Word.

## Editing

1. **Inspect.** Inventory the content, styles, sections, relationships, media, comments, revisions and whatever else the task involves. Find out whether `python-docx` has a public API for the feature before reaching for XML.
2. **Change.** Use the object model where you can. Use raw OOXML only for the part that needs it, and keep every other ZIP entry as it was.
3. **Save and check.** Save to a new file, reopen it, rerun the same inventory, reparse every XML part you changed, and confirm the relationships and content types it relies on.

**Replacing text:** if the target sits in one run, replace it there. If it spans runs, map the visible characters back to their runs and change only those. Setting `paragraph.text` rebuilds the paragraph and throws away run formatting, fields, hyperlinks and bookmarks. The same goes for paragraphs in cells, headers and footers.

**Usual mistakes:**

- rebuilding from extracted text instead of editing the source;
- looking only at body paragraphs, so text in tables, headers or tracked changes is missed;
- replacing a whole paragraph or text frame and losing the formatting inside it;
- editing a linked header or footer without checking the other sections;
- adding an OOXML element but not its relationship or content type;
- treating a structural check as proof of the visual layout.

## Raw OOXML

When the object model can't do it:

- change only the part you must, and carry over every other ZIP entry;
- don't disturb namespaces, relationship ids, content types or the order of elements, and keep `xml:space="preserve"` wherever leading or trailing spaces matter;
- use valid ids and keep references consistent across every related part;
- reparse each changed part before zipping.

Check the library docs before the WordprocessingML schema; go to the schema only for what the docs don't cover.

**Tracked changes.** Inventory `w:ins`, `w:del`, `w:moveFrom`, `w:moveTo` and the property-change elements (`w:rPrChange`, `w:pPrChange` and the rest). Keep change ids, authors, dates and the original formatting. Paragraphs inside revision wrappers aren't in `Document.paragraphs`, so a full review means reading the XML. Inside deletions, use the deletion text elements.

To **accept** changes: unwrap `w:ins` and `w:moveTo` and keep what's inside; remove `w:del` and `w:moveFrom` along with their content; remove the `*PrChange` children but keep the current paragraph, run, table and section properties. Revisions on paragraph marks and on tables need their own handling; not every change wraps runs. Leave unrelated bookmarks, comments, relationships and formatting alone, then check the resulting text and confirm the revision elements you targeted are gone.

**Comments.** `document.comments` gives id, author, initials, timestamp and body, and `document.add_comment()` adds ordinary comments. To tie comments to text ranges or read replies and resolved state, look at `w:commentRangeStart`, `w:commentRangeEnd` and `w:commentReference`, at `word/comments*.xml` and `word/people.xml`, and at their relationships and content types. Range markers stay paragraph-level siblings of runs. Keep comment ids and references consistent across all the comment parts.

**Images.** Look at `word/media/`, the drawing elements, image relationships and content types. When swapping an image, keep its relationship and geometry unless the task changes the layout. A raw image insert needs every one of those links, so use the picture API for ordinary inline images.

## Checking your work

Reopen with `Document`, rerun the checks that matter for the task, and run `ZipFile(path).testzip()`. Check what matters against the source: paragraphs, tables, sections, media, comments, headers and footers, relationships, core properties, special parts. Confirm the requested change happened, the replaced content is gone, and nothing unrelated went missing.

Structure doesn't prove rendering or field results. Say which of these you couldn't verify: visual layout, pagination, field updates, macros, package-level behavior.

## Bundled

- `python-docx`

Only when you're unsure about an API or what it supports, check the [python-docx docs](https://python-docx.readthedocs.io/en/latest/).
