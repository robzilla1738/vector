import { expect, it } from "vitest";
import { csvPreview } from "./csv-preview";

it("preserves quoted commas, escaped quotes, line breaks, empty cells and BOM",()=>{
  expect(csvPreview('\uFEFFName,Notes,Empty\r\n"A, B","line 1\nline ""2""",\r\n')).toEqual({rows:[["Name","Notes","Empty"],["A, B",'line 1\nline "2"',""]],rowCount:2,columnCount:3});
  expect(csvPreview('""').rows).toEqual([[""]]);
  expect(csvPreview('a,').rows).toEqual([["a",""]]);
  expect(csvPreview('').rows).toEqual([]);
});
it("bounds rendered cells without hiding the original dimensions and rejects malformed quotes",()=>{
  const value=Array.from({length:250},()=>Array.from({length:50},(_,i)=>String(i)).join(',')).join('\n');
  expect(csvPreview(value)).toMatchObject({rowCount:250,columnCount:50});
  expect(csvPreview(value).rows).toHaveLength(201);
  expect(csvPreview(value).rows[0]).toHaveLength(40);
  expect(()=>csvPreview('"unfinished')).toThrow();
  expect(()=>csvPreview('"closed"extra')).toThrow();
});
