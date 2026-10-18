import type { Run } from "@aux/contracts";
import type { ModelMessage } from "./types.js";

export function originalTask(run: Run): ModelMessage {
  return {
    role: "user",
    content: [
      `Task: ${run.goal}`,
      run.config?.instructions ? `Instructions (human-authored): ${run.config.instructions}` : "",
      run.config?.context ? `Context: ${run.config.context}` : "",
      run.pageIds.length ? `Pages in scope: ${run.pageIds.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}
