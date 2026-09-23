import ExcelJS from "exceljs";
import { WorkbookSnapshotSchema, readCsvRows, workbookSourceHyperlink } from "@aux/contracts";

/** Build a new values-only workbook. Never evaluate formulas or restore external links. */
export async function exportWorkbook(content:string,format:"snapshot"|"csv"="snapshot"):Promise<Buffer> {
  if(Buffer.byteLength(content,"utf8")>1024*1024)throw new Error("Choose a workbook snapshot up to 1 MB.");
  if(format==="csv"){
    const workbook=new ExcelJS.Workbook();
    workbook.creator="Aux";
    const sheet=workbook.addWorksheet("Results");
    readCsvRows(content,(row,number)=>{
      if(number>1048576||row.length>16384)throw new Error("This CSV exceeds Excel’s row or column limit. Export the original CSV instead.");
      row.forEach((value,index)=>{
        if(value.length>32767)throw new Error("A cell exceeds Excel’s text limit. Export the original CSV instead.");
        const href = workbookSourceHyperlink(value);
        sheet.getCell(number,index+1).value = href ? { text: value, hyperlink: href } : value;
      });
    });
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
  const snapshot=WorkbookSnapshotSchema.parse(JSON.parse(content));
  if(!snapshot.sheets.length || snapshot.sheets.length>100 || snapshot.sheets.every(sheet=>sheet.hidden))throw new Error("A workbook needs a visible sheet and supports up to 100 sheets.");
  const workbook=new ExcelJS.Workbook();
  workbook.creator="Aux";
  for(const saved of snapshot.sheets){
    const sheet=workbook.addWorksheet(saved.name,{state:saved.hidden?"hidden":"visible"});
    for(const row of saved.rows){
      if(row.number>1048576)throw new Error("A saved row exceeds Excel’s row limit.");
      for(const cell of row.cells){
        if(cell.value.length>32767)throw new Error("A saved cell exceeds Excel’s text limit. Save the full snapshot instead.");
        const href = cell.hyperlink ? workbookSourceHyperlink(cell.hyperlink) : undefined;
        sheet.getCell(row.number,cell.column).value = href ? { text: cell.value, hyperlink: href } : cell.value;
      }
    }
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
