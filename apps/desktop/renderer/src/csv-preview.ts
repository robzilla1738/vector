import { readCsvRows } from "@vector/contracts";

/** Bound only the rendered preview; copy and export retain the source. */
export function csvPreview(source: string): {rows:string[][]; rowCount:number; columnCount:number} {
  const rows:string[][]=[];
  const dimensions=readCsvRows(source,row=>{if(rows.length<201)rows.push(row.slice(0,40));});
  return {rows,...dimensions};
}
