---
name: xlsx
description: Use this skill whenever an .xlsx or .xlsm workbook must be read, created, inspected, or edited, including formulas, formatting, charts, images, comments, validation, links, macros, and workbook metadata.
icon: "https://app.getaux.co/builtin-skills/v1/xlsx.svg"
license: Proprietary. LICENSE.txt has complete terms
---

# Excel workbooks (.xlsx, .xlsm)

A workbook is a ZIP of OOXML parts. Use the bundled pandas for analyzing tables, `openpyxl` for workbook structure and edits, and Python's `zipfile` plus an XML parser for package parts and metadata.

## Ground rules

- `read_file` won't read .xlsx or .xlsm content; it points you here.
- Run Python inline in the Bash call with a quoted heredoc. Only write a `.py` file if the user wants a script.
- Don't install anything. pandas and `openpyxl` are already there.
- pandas is for analysis or for a brand-new, data-only workbook. `openpyxl` is for targeted changes to a workbook that already exists.
- Write the result to a new file unless the user asked you to overwrite the original.
- Unzip with `zipfile`, not a shell `unzip`, so it works on macOS and Windows alike.

## Which tool for what

| Job | Use |
| --- | --- |
| Filter, join, group, summarize, clean | pandas |
| Formulas, styles, tables, charts, validation, comments | `openpyxl` |
| Saving a workbook that already has formatting | `openpyxl` |
| Last calculated values of formulas | a separate `data_only=True` read-only copy (may be stale) |
| Macros, package metadata | an inventory of the ZIP and XML |
| Big, data-only workbook | pandas, or `read_only=True` |

Never round-trip an existing workbook through `DataFrame.to_excel()`. Everything that isn't a plain table gets lost.

## Loading rules

- Inspect and edit with `data_only=False` so formulas stay formulas.
- Never save a workbook opened with `data_only=True`. It holds cached results, not formulas.
- For .xlsm, open with `keep_vba=True` and save as `.xlsm`. That keeps the VBA parts; it doesn't read, change or run the macros.
- Use `keep_links=True` when cached data for links to other workbooks has to survive.
- `read_only=True` is only for streaming values. Inspect metadata in normal mode.

## Take stock first

Record the workbook's properties, how it calculates, its defined names and the order of its sheets; which sheets are visible, hidden or very hidden; how big each sheet is; plus what's in the ZIP and whether it's intact. After that, open up only what the task calls for (particular cells, formulas, styles, comments, links, tables, drawings, validation, protection, print setup, relationships or other parts) and anything strange the first pass turned up.

`max_row` and `max_column` can count styled cells that look empty. Hidden sheets, rows and columns can hold inputs that formulas depend on.

## Every workbook

- **One font.** Use a single professional font unless the user or the template uses another, and give titles, headers, labels, inputs and notes distinct, consistent levels. Don't style cells one by one.
- **No broken formulas.** Don't ship formulas with known `#REF!`, `#DIV/0!`, `#VALUE!`, `#N/A` or `#NAME?` errors. Read the formula text, references and ranges, and think through edge cases. `openpyxl` doesn't calculate, so don't say results are error-free unless a real spreadsheet engine recalculated the file.
- **The template wins.** Match the existing formats, styles, formulas, table conventions, merged ranges, column widths, row heights, hidden state, conditional formatting, validation, protection and print settings. They override everything below.

## Formulas, not pasted results

If a total, ratio, growth rate or average should update when inputs change, write it as a formula (`=SUM(B2:B9)`, `=(C4-C2)/C2`, `=AVERAGE(D2:D19)`). Don't compute it in Python and store the number: that breaks the link to the inputs and hides where it came from. Store a computed value only when the user wants a static file or the value can't be expressed reliably as a formula.

## Financial models

When the workbook has no convention of its own:

- **Font colors:** blue `0000FF` for typed inputs and scenario values; black `000000` for formulas; green `008000` for references to other sheets in the same file; red `FF0000` for links to other workbooks. Yellow fill `FFFF00` marks assumptions that need attention. Don't force these onto non-model workbooks or templates that use another scheme.
- **Number formats:** store years as text when separators would mislead. Put units in the header (`Revenue ($mm)`). Currency with thousands separators. Show zero as `-`, percentages included where it fits. Percentages default to `0.0%`, multiples to `0.0x`. Negatives in parentheses, not with a minus sign.
- **Assumptions in their own cells.** Growth, margins and multiples go in dedicated cells that formulas reference: `=B5*(1+$B$6)`, not `1.05` buried in the formula. Totals, ratios, growth, differences and projections are formulas, never Python-computed constants.
- Before filling a formula across the model, check denominators, range ends, sheet names, absolute vs. relative references, circular references, and that every projection period lines up.
- **Source the hardcodes.** Note material typed-in numbers in a cell comment or a cell beside them: source, date, the document and page or reference, and the URL if there is one.

## Reading data

- **pandas:** `read_excel()`, with `sheet_name=None` for every sheet. Set `dtype`, `usecols`, converters and date handling whenever guessing could damage ids, leading zeros, dates or nulls. Do the filtering, grouping, joins and statistics here. For an existing workbook, write the results back with `openpyxl`, not by exporting the dataframe over it.
- **openpyxl:** open normally (`data_only=False`) to inspect sheets, cell details, tables, drawings, names and relationships. If you need the last calculated values, open a second read-only copy with `data_only=True`. Those are whatever was last saved, possibly stale, and that copy is never saved.

## Workflow

1. Inventory the workbook and package before you change anything.
2. pandas for analysis, `openpyxl` for changing the workbook.
3. Make the smallest change that does the job, in the workbook's own style.
4. Save to a new file with the right extension (.xlsx or .xlsm).
5. Reopen with `data_only=False` and confirm the formulas, styles and metadata survived.
6. Run `ZipFile(output).testzip()` and diff the key package parts against the original.

**New workbook:** `Workbook()`. Name sheets clearly, give each table a single header row and freeze it, add filters, set sensible column widths, use one font, and set number formats explicitly. Use `openpyxl`'s own APIs for any tables, validation, conditional formats, charts, comments, links and defined names you need; keep their names unique and their ranges matching the data.

**Existing workbook:** `load_workbook()` with the right flags, pick sheets by name, and change only the cells or objects you mean to, matching the styles and formulas around them. In complex workbooks avoid inserting or deleting rows and columns unless you must: dependent objects (charts, tables, names, pivots, validation, external references) may not move the way Excel would move them.

## Recalculation

`openpyxl` saves formulas but never evaluates them. Calc-on-open flags can ask Excel or another engine to recalculate later; they don't give you verified values now. State plainly that computed values, formula errors, and pivot or external-link refreshes are unverified until a real engine has recalculated the file. Don't paste in Python-computed constants just to have values.

## Checking formulas

- Try two or three representative formulas before filling a whole range.
- Watch Excel's 1-based rows and columns and off-by-one range ends.
- Make sure every sheet, name and cell a formula refers to exists.
- Search the formula text for error tokens such as `#REF!`.
- Check formulas stay consistent across rows and periods.

**Common traps:** nulls and NaN, or types pandas guessed wrong; ids or years turned into numbers; division by zero and bad quoting of sheet names; `$` anchoring the wrong way round; several cells with the same label when you only used the first; formulas running into far-right columns or hidden sheets; accidental circular references.

Start with a small sample, look at how it's built and what it depends on, then fill the range. Think through zero, negative, blank and very large inputs where they apply, but don't call that testing, because nothing was evaluated. Reopen the output and make sure the formulas are still formula strings.

## Library notes

- `openpyxl` indices start at 1.
- Use the streaming modes for size only when their missing features don't matter for the task.
- Keep the file type intact for .xlsm and templates.
- Check package-level parts before and after saving.
- Read the docs before leaning on private attributes, or on an API when you don't know whether it preserves what's already there.
- In pandas, set types for ids and other columns that guessing could break, and read only the sheets and columns you need from large files. Treat pandas output as a new workbook unless nothing in the original needs keeping.

## Checking your work

Reopen with `data_only=False` and confirm every requested value, formula, style, number format, comment, link and name. Compare the relevant sheets, tables, images, charts, validation, external links, defined names, relationships and VBA parts. Make sure the extension matches the package type and no OOXML part went missing.

Structure doesn't verify rendering, calculated results, pivot or link refreshes, macros, or every Excel feature. Say which of those remain unverified.

Only when you're unsure about an API or what it supports, check the [openpyxl 3.1 docs](https://openpyxl.readthedocs.io/en/3.1/) or the [pandas 2.2.3 Excel I/O docs](https://pandas.pydata.org/pandas-docs/version/2.2.3/user_guide/io.html#excel-files).
