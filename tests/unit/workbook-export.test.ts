import {expect,it} from "vitest";
import {exportWorkbook} from "../../apps/desktop/main/workbook-export.js";
import {extractWorkbook} from "../../apps/desktop/main/workbook-extract.js";
it("exports a real workbook preserving sparse cells, hidden sheets and literal formula-like text",async()=>{
  const snapshot={format:"aux.workbook.v1",sheets:[
    {name:"Summary",hidden:false,rows:[{number:7,cells:[{column:2,value:"=SUM(A1:A2)"},{column:28,value:"Quoted, value"}]}]},
    {name:"Details",hidden:true,rows:[{number:3,cells:[{column:1,value:"Saved value"}]}]},
  ]};
  const bytes=await exportWorkbook(JSON.stringify(snapshot));
  expect(bytes.subarray(0,2).toString()).toBe("PK");
  expect(JSON.parse(await extractWorkbook(bytes))).toEqual(snapshot);
});
it("rejects values outside Excel limits rather than truncating them",async()=>{
  const snapshot={format:"aux.workbook.v1",sheets:[{name:"Sheet",hidden:false,rows:[{number:1048577,cells:[{column:1,value:"Keep me"}]}]}]};
  await expect(exportWorkbook(JSON.stringify(snapshot))).rejects.toThrow(/row limit/);
});
it("exports CSV beyond preview bounds without coercing formulas, identifiers, or multiline text",async()=>{
  const rows=Array.from({length:205},(_,index)=>Array.from({length:42},(_,column)=>index===204&&column===41?'"last, cell"':`"${index===1&&column===0?'line 1\nline ""2""':column===0?'00123':column===1?'=SUM(A1:A2)':`${index}:${column}`}"`).join(','));
  const bytes=await exportWorkbook(rows.join('\r\n'),"csv");
  const workbook=JSON.parse(await extractWorkbook(bytes));
  const sheet=workbook.sheets[0];
  expect(sheet.rows).toHaveLength(205);
  expect(sheet.rows[204].cells[41]).toEqual({column:42,value:"last, cell"});
  expect(sheet.rows[0].cells[0].value).toBe("00123");
  expect(sheet.rows[0].cells[1].value).toBe("=SUM(A1:A2)");
  expect(sheet.rows[1].cells[0].value).toBe('line 1\nline "2"');
  await expect(exportWorkbook('"unfinished',"csv")).rejects.toThrow(/not closed/);
});
