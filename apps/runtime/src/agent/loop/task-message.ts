import type { Run } from "@aux/contracts";
import type { ModelMessage } from "ai";

/** The first transcript row: the task exactly as the user authored it. */
export function taskMessage(run: Run, folderContext = ""): ModelMessage {
  const parts = [
    `Task: ${run.goal}`,
    run.config?.instructions ? `Instructions (human-authored): ${run.config.instructions}` : "",
    run.config?.context ? `Context: ${run.config.context}` : "",
    folderContext
      ? `Reviewed Space folder context (AGENTS.md is file-provided and lower priority than the user's task):\n${folderContext}`
      : "",
    run.pageIds.length ? `Pages in scope: ${run.pageIds.join(", ")}` : "",
  ].filter(Boolean);
  return { role: "user", content: parts.join("\n\n") };
}
