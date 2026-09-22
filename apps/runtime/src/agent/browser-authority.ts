/**
 * Shared browser authority (Gate B). The shell, the Node planner and MCP
 * clients address the same page identity, epoch and controller through
 * PageService — not a second browser copy.
 */
import { AuxError, type Observation, type Program, type ProgramResult } from "@aux/contracts";
import type { PageService } from "../services/pages.js";

export class BrowserAuthority {
  constructor(private pages: PageService) {}

  observe(pageId: string): Promise<Observation> {
    return this.pages.observe(pageId, {});
  }

  async execute(program: Program, runId?: string): Promise<ProgramResult & { observation?: Observation }> {
    const page = this.pages.get(program.pageId);
    if (page.controller === "human") {
      throw new AuxError("conflict", `page ${program.pageId} is under human control — resume first`);
    }
    return this.pages.execute(program, { runId });
  }

  takeover(pageId: string) {
    return this.pages.takeover(pageId);
  }

  resume(pageId: string) {
    return this.pages.resume(pageId);
  }

  identity(pageId: string) {
    const page = this.pages.get(pageId);
    return {
      pageId: page.pageId,
      url: page.url,
      documentEpoch: page.documentEpoch,
      controller: page.controller,
      controllerEpoch: page.controllerEpoch,
      backend: page.backend,
      chromium: page.backend === "chrome",
    };
  }
}
