import { useMemo, useRef, useState } from "react";
import { WorkbookSnapshotSchema } from "@aux/contracts/workbook-snapshot";

import { workbookColumnLabel, workbookSheetCsv } from "../workbook-sheet";
import { bridge } from "../bridge";
import { toast } from "../store";

export function WorkbookPreview({ content }: { content: string }) {
  const [selected, setSelected] = useState(0);
  const [source, setSource] = useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const pending=useRef(false);
  const snapshot = useMemo(() => {
    try { return WorkbookSnapshotSchema.parse(JSON.parse(content)); } catch { return null; }
  }, [content]);
  const sheet = snapshot?.sheets[selected] ?? snapshot?.sheets[0];
  const columns = useMemo(() => [...new Set(sheet?.rows.flatMap(row => row.cells.map(cell => cell.column)) ?? [])].sort((a, b) => a - b), [sheet]);
  if (!snapshot || !sheet) return <pre tabIndex={0}>{content}</pre>;
  const visibleColumns = columns.slice(0, 20);
  const exportSheet=async(kind:"copy"|"csv"|"snapshot"|"xlsx")=>{
    if(pending.current)return;
    pending.current=true;setBusy(true);setError("");
    try {
      const name=sheet.name.replace(/[\\/:*?"<>|\x00-\x1f]/g,"-").slice(0,100)||"sheet";
      if(kind==="xlsx"){if(await bridge.saveWorkbook(content))toast("Workbook values exported");}
      else if(kind==="copy"){await navigator.clipboard.writeText(workbookSheetCsv(sheet));toast("Sheet copied as CSV");}
      else if(await bridge.saveFile(kind==="snapshot"?"workbook-snapshot.json":`${name}.csv`,kind==="snapshot"?content:workbookSheetCsv(sheet)))toast(kind==="snapshot"?"Workbook snapshot saved":"Sheet exported");
    } catch(reason){setError(reason instanceof Error?reason.message:String(reason));}
    finally{pending.current=false;setBusy(false);}
  };
  return <div className="workbook-preview">
    <div className="workbook-sheets" role="group" aria-label="Workbook sheets">
      {snapshot.sheets.map((item, index) => <button key={index} className="btn sm ghost" aria-pressed={index === selected} disabled={busy} onClick={() => {setSelected(index);setError("");}}>{item.name}{item.hidden ? " · hidden" : ""}</button>)}
    </div>
    <div className="workbook-preview-tools"><span className="hint">{sheet.rows.length.toLocaleString()} populated rows · {columns.length.toLocaleString()} populated columns{sheet.rows.length > 100 || columns.length > 20 ? " · Showing up to 100 rows and 20 columns" : ""}</span></div>
    <div className="workbook-export-actions">
      <button className="btn sm" disabled={busy} onClick={()=>void exportSheet("xlsx")}>{busy ? "Exporting…" : "Export Excel…"}</button>
      <details className="workbook-more"><summary>More options</summary><div>
        <button className="btn sm ghost" disabled={busy||!sheet.rows.length} onClick={()=>void exportSheet("copy")}>Copy sheet as CSV</button>
        <button className="btn sm ghost" disabled={busy||!sheet.rows.length} onClick={()=>void exportSheet("csv")}>Export sheet as CSV…</button>
        <button className="btn sm ghost" disabled={busy} onClick={()=>void exportSheet("snapshot")}>Save full snapshot…</button>
        <button className="btn sm ghost" aria-pressed={source} onClick={() => setSource(value => !value)}>{source ? "Show table" : "Show full source"}</button>
      </div></details>
    </div>
    {error&&<p className="field-error" role="alert">{error}</p>}
    <p className="hint">Exports keep saved cell values and coordinates. Formulas stay text. Source hyperlinks are included only when a cell stores a safe http(s) address.</p>
    {source ? <pre role="group" tabIndex={0} aria-label="Workbook snapshot source">{content}</pre> : sheet.rows.length ? <div role="group" className="structured-result-table workbook-table" tabIndex={0} aria-label={`${sheet.name} cell values`}><table><thead><tr><th scope="col" aria-label="Row number" />{visibleColumns.map(column => <th scope="col" key={column}>{workbookColumnLabel(column)}</th>)}</tr></thead><tbody>{sheet.rows.slice(0, 100).map(row => {
      const values = new Map(row.cells.map(cell => [cell.column, cell]));
      return <tr key={row.number}><th scope="row">{row.number}</th>{visibleColumns.map(column => { const cell = values.get(column); return <td key={column} title={cell?.hyperlink}>{cell?.value ?? ""}</td>; })}</tr>;
    })}</tbody></table></div> : <p className="hint">This sheet has no cell values.</p>}
  </div>;
}
