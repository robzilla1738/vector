---
name: google-sheets
description: Read this skill when you need to read or write Google Sheets. Works without opening a browser tab for reads.
icon: "/builtin-skills/v1/google-sheets.jpg"
autoInject:
  keywords: ["google sheets", "spreadsheet"]
  url:
    - docs.google.com/spreadsheets/**
---

# Google Sheets

The `googleSheets` global in the REPL reads spreadsheets over HTTP with the browser's cookies (no tab) and writes to them by opening a Sheets tab for you.

**The cookie reads can be incomplete.** `readSheet`, `readAllSheets` and `readSheetRich` read the first HTML chunks Google sends, which can leave out later rows. `size` describes those chunks, not the whole sheet. Before you call data missing or corrupt, or suggest a fix, check the values in the live sheet or a full export. `readSheetRich` reads the same source, so it doesn't count as a second opinion.

**The user may be signed in to several Google accounts.** Before building any `/u/{uid}/` URL, run `console.log(await googleAccounts.list())` to find the right uid.

## At a glance

```js
// Spreadsheet metadata, no tab
const info = await googleSheets.getSpreadsheetInfo('https://docs.google.com/spreadsheets/d/.../edit#gid=0');
console.log(info);
// -> { docTitle: string, sheets: [{ name, gid, gridId, size: { rows, cols } }] }

// One sheet, no tab
const data = await googleSheets.readSheet('https://docs.google.com/spreadsheets/d/.../edit#gid=0');
console.log(data.cells.slice(0, 20));

// Every sheet, no tab
const allSheets = await googleSheets.readAllSheets(url);

// Write values (opens a tab, pastes from the clipboard)
await googleSheets.connect(url);
await googleSheets.writeMatrix('A1', [['Hello', 'World'], [1, 2]]);
await googleSheets.dispose();

// Move around, add notes and comments (opens a tab)
await googleSheets.connect(url);
await googleSheets.navigateToCell('B5');
await googleSheets.setNote('A1', 'Remember to update');
await googleSheets.addComment('A1', 'Needs review');
await googleSheets.dispose();
```

## Reading (no tab)

- `getSpreadsheetInfo(url): Promise<SpreadsheetInfo>` lists every sheet with its name, gid and size.
- `readSheet(url, gid?): Promise<SheetData>` reads one sheet's cells: values, formulas, formatting, notes, links, images, merges and dropdowns.
- `readAllSheets(url): Promise<SheetData[]>` reads every sheet, fetching each one separately.

## In a tab

Call `connect(url)` first and `dispose()` when you're done.

| Method | What it does |
| --- | --- |
| `connect(url): Promise<void>` | Opens the spreadsheet in a tab and waits for the editor. |
| `dispose(): Promise<void>` | Closes that tab. |
| `writeMatrix(range, data): Promise<void>` | Pastes a 2D array starting at an A1 address such as `'A1'`. |
| `writeTsv(range, tsv): Promise<void>` | Pastes a TSV string. |
| `writeHtml(range, html): Promise<void>` | Pastes HTML and keeps its rich formatting. |
| `navigateToCell(cell): Promise<void>` | Moves the active cell to an A1 address. |
| `switchSheet(gid): Promise<void>` | Switches to another sheet by gid. |
| `setNote(cell, text): Promise<void>` | Sets a cell note; an empty string clears it. |
| `addComment(cell, text): Promise<void>` | Starts a comment thread on a cell. |
| `readSelection(): Promise<SelectionData>` | Reads the current selection by capturing a copy. |
| `readSheetRich(gid?): Promise<ExtractedCell[]>` | Reads cells with full formatting from the open tab. |

## Types

```ts
interface SpreadsheetInfo {
  docTitle: string;
  sheets: SheetInfo[];
}

interface SheetInfo {
  name: string;
  gid: string;
  gridId: string;
  size: { rows: number; cols: number };
}

interface SheetData extends SheetInfo {
  cells: ExtractedCell[];
}

interface ExtractedCell {
  cell: string;        // A1 address, like "B3"
  row: number;         // starts at 1
  col: number;         // starts at 0
  colLetter: string;
  value?: string | number | boolean;
  valueType: 'string' | 'number' | 'boolean' | 'formula' | 'image' | 'empty';
  formula?: string;    // like "=SUM(A1:A10)"
  note?: string;
  hyperlink?: string;
  imageKey?: string;
  isMerged?: true;
  mergedSize?: number;
  format?: CellFormat;
  conditionalFormats?: ConditionalFormatRule[];
  dropdownOptions?: string[];
}
```

## Shortcuts in an open Sheets tab

| Action | Keys |
| --- | --- |
| Jump to a range | `Cmd+J` |
| Select all | `Cmd+A` |
| Bold, italic, underline | `Cmd+B`, `Cmd+I`, `Cmd+U` |
| Comment | `Cmd+Alt+M` |
| New sheet | `Shift+F11` |
