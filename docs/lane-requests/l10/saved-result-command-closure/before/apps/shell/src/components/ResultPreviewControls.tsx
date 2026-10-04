import { useId, type ButtonHTMLAttributes } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { executeCommand } from "../commands";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { errToast } from "../store";
type ResultCommand = "close-generated-result-preview" | "toggle-generated-result-source" | "export-generated-result" | "select-generated-result-version" | "save-generated-result-version";
export function ResultPreviewControl({command,current,invoke,report=true,...props}:Omit<ButtonHTMLAttributes<HTMLButtonElement>,"onClick"> & {command:ResultCommand;current():boolean;invoke():unknown;report?:boolean}) {
  const scope=useId();
  const [ref]=usePreferenceCommand<HTMLButtonElement>(command,scope,()=>current()?invoke():guardCommandCompletion(Promise.reject(new Error("Choose the original result preview.")),current));
  const run=(event:{nativeEvent:Event})=>{const completion=executeCommand(command,{payload:{scopeId:scope},nativeInputEvent:event.nativeEvent});void completion.catch(reason=>reportCommandCompletionFailure(completion,reason,error=>{if(report&&current())errToast(error);}));};
  return <button {...props} ref={ref} data-command-id={command} onClick={run}/>;
}
