import {createRoot} from "react-dom/client";
import {TaskSchema,TaskReceiptSchema} from "@aux/contracts";
import {TaskResources} from "./components/TaskResources";
import {bridge} from "./bridge";
import "@fontsource-variable/geist";
import "./tokens.css";
import "./styles.css";

const task=TaskSchema.parse({taskId:"saved",workspaceId:"original",revision:1,title:"Task"+"T".repeat(196),objective:"Original complete objective",criteria:[{criterionId:"one",description:"Original",verification:"manual"}],resources:[{resourceId:"resource",kind:"file",locator:"/original/reference-only/document.txt",label:"Resource"+"R".repeat(192)}],state:"open",createdAt:1,updatedAt:1});
const receipt=TaskReceiptSchema.parse({taskId:"saved",taskRevision:1,objective:task.objective,generatedAt:1,status:"needs_review",criteria:[],unresolvedActions:[],runs:[],modelCalls:0,knownCostUsd:0,costComplete:true});
bridge.invoke=(async(method:string)=>{if(method==="tasks.get")return {task,revisions:[task],runs:[],children:[]};if(method==="tasks.receipt")return receipt;throw new Error("Unexpected source fixture method");}) as typeof bridge.invoke;
createRoot(document.getElementById("root")!).render(<main className="task-content" style={{width:360,maxWidth:"100%",margin:"24px auto"}}><TaskResources task={task} activePageId={null} attached={false} update={async()=>false}/></main>);
