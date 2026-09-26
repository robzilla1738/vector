import type { WorkbookSnapshot } from "@aux/contracts";
import { answerTableCsv } from "./answer-table";

export function workbookColumnLabel(column:number):string {
  let result="";
  for(let value=column;value>0;value=Math.floor((value-1)/26))result=String.fromCharCode(65+(value-1)%26)+result;
  return result;
}
/** Export every saved populated row/column, with coordinates so sparse data stays unambiguous. */
export function workbookSheetCsv(sheet:WorkbookSnapshot["sheets"][number]):string {
  const columns=[...new Set(sheet.rows.flatMap(row=>row.cells.map(cell=>cell.column)))].sort((a,b)=>a-b);
  if((sheet.rows.length+1)*(columns.length+1)>1_000_000)throw new Error("This sheet is too wide to export as a table. Save the full snapshot instead; it preserves all saved cells.");
  const rows=[["Row",...columns.map(workbookColumnLabel)],...sheet.rows.map(row=>{
    const values=new Map(row.cells.map(cell=>[cell.column,cell.value]));
    return [String(row.number),...columns.map(column=>values.get(column)??"")];
  })];
  return answerTableCsv(rows);
}
