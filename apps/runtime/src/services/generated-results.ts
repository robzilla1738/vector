import { createHash } from "node:crypto";
import { basename, extname } from "node:path";
import { AuxError, type GeneratedResult, type GeneratedResultSummary, type GeneratedResultSpec } from "@aux/contracts";
import type { ArtifactStore } from "./artifacts.js";
import type { Repo } from "../store/repo.js";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MEDIA = { csv: "text/csv", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", chart: "image/png" } as const;
const EXT = {csv:".csv",xlsx:".xlsx",docx:".docx",pptx:".pptx",chart:".png"} as const;
const printable = (value: string | number | boolean | null): string => value === null ? "" : String(value);
const csvCell = (value: string | number | boolean | null): string => {
  let cell = printable(value);
  // Spreadsheet applications interpret these leading characters as formulas.
  if (typeof value === "string" && /^[\s\uFEFF]*[=+\-@]/u.test(cell)) cell = `'${cell}`;
  return /[",\r\n]/u.test(cell) ? `"${cell.replaceAll('"','""')}"` : cell;
};
function filename(name: string, kind: GeneratedResultSpec["kind"]): string {
  const leaf = basename(name).replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^\.+/,"").slice(0,100);
  if (!leaf || leaf === "." || leaf === "..") throw new AuxError("invalid_params","Choose a valid result filename.");
  const expected = EXT[kind];
  return extname(leaf).toLowerCase() === expected ? leaf : `${leaf.replace(/\.[^.]+$/,"")}${expected}`;
}
function preview(spec: GeneratedResultSpec): GeneratedResult["preview"] {
  switch(spec.kind) {
    case "csv": return {title:spec.table.name,lines:spec.table.rows.slice(0,20).map(row=>row.map(printable).join(" · ").slice(0,500))};
    case "xlsx": return {title:`${spec.sheets.length} sheet${spec.sheets.length===1?"":"s"}`,lines:spec.sheets.slice(0,12).map(sheet=>`${sheet.name} · ${sheet.rows.length} rows`)};
    case "docx": return {title:spec.title,lines:[...spec.paragraphs.slice(0,18).map(line=>line.slice(0,500)),...spec.tables.slice(0,4).map(table=>`${table.name} · ${table.rows.length} rows`)]};
    case "pptx": return {title:`${spec.slides.length} slide${spec.slides.length===1?"":"s"}`,lines:spec.slides.slice(0,20).map((slide,index)=>`${index+1}. ${slide.title}`)};
    case "chart": return {title:spec.title,lines:[`${spec.mark} chart · ${spec.data.length} points`,`${spec.x} → ${spec.y}`]};
  }
}
async function render(spec: GeneratedResultSpec): Promise<Buffer> {
  if (spec.kind === "csv") return Buffer.from(`\uFEFF${spec.table.rows.map(row=>row.map(csvCell).join(",")).join("\r\n")}\r\n`,"utf8");
  if (spec.kind === "xlsx") {
    const ExcelJS=(await import("exceljs")).default;
    const book = new ExcelJS.Workbook();book.creator="Aux";book.created=new Date(0);book.modified=new Date(0);
    const names=new Set<string>();
    for (const source of spec.sheets) {
      const name=source.name.slice(0,31).replace(/[\\/*?:]/g,"_").replaceAll("[","_").replaceAll("]","_")||"Sheet";
      if(names.has(name.toLowerCase()))throw new AuxError("invalid_params","Workbook sheet names must be unique.");
      names.add(name.toLowerCase());
      const sheet=book.addWorksheet(name);
      for(const row of source.rows) sheet.addRow(row.map(value=>value===null?null:value));
      sheet.getRow(1).font={bold:true};sheet.views=[{state:"frozen",ySplit:1}];
      sheet.columns.forEach(column=>{column.width=18;});
    }
    return Buffer.from(await book.xlsx.writeBuffer());
  }
  if (spec.kind === "docx") {
    const {Document,HeadingLevel,Packer,Paragraph,Table,TableCell,TableRow,TextRun}=await import("docx");
    const children:(InstanceType<typeof Paragraph>|InstanceType<typeof Table>)[]=[new Paragraph({text:spec.title,heading:HeadingLevel.TITLE}),...spec.paragraphs.map(text=>new Paragraph({children:[new TextRun(text)]}))];
    for(const table of spec.tables) {
      children.push(new Paragraph({text:table.name,heading:HeadingLevel.HEADING_2}));
      children.push(new Table({rows:table.rows.map(row=>new TableRow({children:row.map(value=>new TableCell({children:[new Paragraph(printable(value))]}))}))}));
    }
    return Buffer.from(await Packer.toBuffer(new Document({sections:[{children}]})));
  }
  if (spec.kind === "pptx") {
    const pptxgen=(await import("pptxgenjs")).default;
    // PptxGenJS 4 declares a namespace default in NodeNext, while its ESM default is a constructor.
    // @ts-expect-error Upstream declaration does not model the NodeNext default export.
    const deck=new pptxgen();deck.author="Aux";deck.subject="Generated result";deck.title=spec.slides[0]?.title??"Presentation";deck.layout="LAYOUT_WIDE";
    for (const source of spec.slides) {
      const slide=deck.addSlide();slide.background={color:"F6F8FC"};
      slide.addText(source.title,{x:0.8,y:0.6,w:11.7,h:0.9,fontSize:30,bold:true,color:"26395A",breakLine:false});
      source.bullets.forEach((bullet,index)=>slide.addText(bullet,{x:1.05,y:1.75+index*0.43,w:11.2,h:0.36,fontSize:18,color:"30435F",bullet:{indent:18},breakLine:false}));
      if(source.notes)slide.addNotes(source.notes);
    }
    return Buffer.from(await deck.write({outputType:"nodebuffer"}) as Buffer);
  }
  const points=spec.data.map(item=>({...item}));
  const xNumeric=points.every(item=>typeof item[spec.x]==="number");
  const yNumeric=points.every(item=>typeof item[spec.y]==="number");
  if (!yNumeric) throw new AuxError("invalid_params","Chart y values must all be numbers.");
  if(points.some(item=>item[spec.x]===undefined))throw new AuxError("invalid_params","Every chart point needs an x value.");
  const chart={
    $schema:"https://vega.github.io/schema/vega-lite/v6.json",width:760,height:420,background:"#ffffff",title:spec.title,
    data:{values:points},mark:{type:spec.mark,color:"#4E6CAC"},
    encoding:{x:{field:spec.x,type:xNumeric?"quantitative":"nominal"},y:{field:spec.y,type:"quantitative"}},
    config:{view:{stroke:null}},
  } as import("vega-lite").TopLevelSpec;
  const [vegaLite,vega,{Resvg}]=await Promise.all([import("vega-lite"),import("vega"),import("@resvg/resvg-js")]);
  const compiled=vegaLite.compile(chart).spec;
  const svg=await new vega.View(vega.parse(compiled),{renderer:"none"}).toSVG();
  return Buffer.from(new Resvg(svg,{fitTo:{mode:"original"}}).render().asPng());
}

/** Generated files are immutable artifacts; all metadata is derived from their saved bytes and version row. */
export class GeneratedResults {
  constructor(private repo:Repo,private artifacts:Pick<ArtifactStore,"save"|"read">) {}
  async generate({chatId,sourceArtifactId,filename:proposed,spec,runId:requestedRunId,canCommit}:{chatId:string;sourceArtifactId?:string;filename:string;spec:GeneratedResultSpec;runId?:string;canCommit?:()=>boolean}):Promise<GeneratedResult> {
    const conversation=this.repo.getConversation(chatId);
    if(!conversation)throw new AuxError("not_found","This conversation is unavailable.");
    if(conversation.archived)throw new AuxError("conflict","Restore this conversation before creating a result.");
    const source=sourceArtifactId?this.get(sourceArtifactId):undefined;
    if(source&&source.chatId!==chatId)throw new AuxError("not_found","The source result is unavailable in this conversation.");
    if(source&&source.kind!==spec.kind)throw new AuxError("invalid_params","A revised result must keep its file type.");
    const runId=requestedRunId??conversation.latestRun.runId;
    const run=this.repo.getRun(runId);
    if(!run||run.config?.contextMemoryRevoked||(run.config?.chatId??run.runId)!==chatId)throw new AuxError("not_found","The source turn is unavailable.");
    const rootArtifactId=source?.rootArtifactId;
    const latest=rootArtifactId?this.repo.db.prepare("SELECT max(revision) AS revision FROM result_versions WHERE root_artifact_id=?").get(rootArtifactId) as {revision:number|null}:undefined;
    const revision=(latest?.revision??0)+1;
    if(revision>20)throw new AuxError("conflict","This result has reached its 20-version limit. Start a new result to continue.");
    const buffer=await render(spec);
    if(buffer.length===0||buffer.length>MAX_FILE_BYTES)throw new AuxError("invalid_params","The generated file exceeds the 20 MB limit.");
    if(canCommit&&!canCommit())throw new AuxError("conflict","The turn changed before the generated file could be saved.");
    const name=filename(proposed,spec.kind),sha256=createHash("sha256").update(buffer).digest("hex"),summary=preview(spec);
    const artifact=this.artifacts.save({runId,label:name,mediaType:MEDIA[spec.kind],buffer},saved=>{
      const root=rootArtifactId??saved.artifactId;
      this.repo.db.prepare(`INSERT INTO result_versions(artifact_id,root_artifact_id,parent_artifact_id,chat_id,revision,created_at) VALUES(?,?,?,?,?,?)`).run(saved.artifactId,root,sourceArtifactId??saved.artifactId,chatId,revision,saved.createdAt);
      this.repo.setSetting(`generatedResult:${saved.artifactId}`,{kind:spec.kind,filename:name,sha256,preview:summary,sourceRunId:runId,spec});
    });
    const selected=new Set(this.repo.getSetting<string[]>(`conversationArtifacts:${chatId}`)??[]);
    if(sourceArtifactId)selected.delete(sourceArtifactId);
    selected.add(artifact.artifactId);
    this.repo.setSetting(`conversationArtifacts:${chatId}`,[...selected].slice(-20));
    return this.get(artifact.artifactId);
  }
  get(artifactId:string):GeneratedResult {
    const artifact=this.repo.getArtifact(artifactId);
    const row=this.repo.db.prepare(`SELECT root_artifact_id AS rootArtifactId,parent_artifact_id AS parentArtifactId,chat_id AS chatId,revision FROM result_versions WHERE artifact_id=?`).get(artifactId) as {rootArtifactId:string;parentArtifactId:string;chatId:string;revision:number}|undefined;
    const meta=this.repo.getSetting<{kind:GeneratedResultSpec["kind"];filename:string;sha256:string;preview:GeneratedResult["preview"];sourceRunId:string;spec:GeneratedResultSpec}>(`generatedResult:${artifactId}`);
    if(!artifact||artifact.status!=="complete"||!artifact.runId||!row||!meta||artifact.mediaType!==MEDIA[meta.kind]||artifact.size>MAX_FILE_BYTES)throw new AuxError("not_found","This generated result is unavailable.");
    const run=this.repo.getRun(artifact.runId);
    if(!run||run.config?.contextMemoryRevoked||(run.config?.chatId??run.runId)!==row.chatId)throw new AuxError("not_found","This generated result is unavailable.");
    return {artifactId,chatId:row.chatId,filename:meta.filename,mediaType:artifact.mediaType,byteLength:artifact.size,createdAt:artifact.createdAt,sha256:meta.sha256,kind:meta.kind,revision:row.revision,rootArtifactId:row.rootArtifactId,parentArtifactId:row.parentArtifactId,sourceRunId:meta.sourceRunId,preview:meta.preview,spec:meta.spec};
  }
  versions(artifactId:string):GeneratedResultSummary[] {
    const current=this.get(artifactId);
    const rows=this.repo.db.prepare("SELECT artifact_id AS artifactId FROM result_versions WHERE root_artifact_id=? ORDER BY revision").all(current.rootArtifactId) as {artifactId:string}[];
    return rows.flatMap(row=>{try{const {spec: _spec,...summary}=this.get(row.artifactId);return [summary];}catch{return [];}});
  }
}
