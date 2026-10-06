import { memoryContentSensitivityReason } from "@aux/contracts/memory-sensitivity";
import { AuxError, type PageTarget } from "@aux/contracts";
import type { Services } from "../api/methods/context.js";

export interface PageDerivativeCache {
  object<T>(input: {
    signature: string;
    text: string;
    capturedTexts?: readonly string[];
    parse: (value: unknown) => T;
    cacheable?: (value: T) => boolean;
    compute: () => Promise<T>;
  }): Promise<T>;
}

const sensitive = (text: string) =>
  !!memoryContentSensitivityReason(text) ||
  /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\bBearer\s+[A-Za-z0-9._~-]{12,}|\bsk-(?:ant-)?[A-Za-z0-9_-]{16,}|\b(?:password|api[-_ ]?key|access[-_ ]?token|secret)\s*[:=]\s*\S{4,})/iu.test(
    text,
  );

/** Runtime-owned page/Space provenance, never caller-supplied permission to persist text. */
export function pageDerivativeCache(
  s: Services,
  pageIds: readonly string[],
): PageDerivativeCache | undefined {
  const store = s.contentMemory;
  if (!store || !pageIds.length) return undefined;
  let pages: PageTarget[];
  try {
    pages = pageIds.map((id) => ({ ...s.pages.get(id) }));
  } catch {
    return undefined;
  }
  const workspaceId = pages[0]?.workspaceId;
  if (!workspaceId || pages.some((page) => page.workspaceId !== workspaceId)) return undefined;
  const connection = s.settings.modelCacheGeneration();
  const identity = (page: PageTarget) =>
    JSON.stringify([
      page.pageId,
      page.workspaceId,
      page.windowKind,
      page.url,
      page.title,
      page.documentEpoch,
      page.sessionId,
      page.controllerEpoch,
      page.controller,
      page.backend,
      page.ownedByRuntime,
    ]);
  const identities = pages.map(identity);
  const eligible = (text: string) => {
    if (sensitive(text) || connection !== s.settings.modelCacheGeneration()) return false;
    try {
      const spaces =
        s.repo.getSetting<Array<{ workspaceId: string; archived?: boolean }>>("browserSpaces") ?? [];
      if (spaces.some((space) => space.workspaceId === workspaceId && space.archived)) return false;
      return pages.every((original, index) => {
        const page = s.pages.get(original.pageId);
        if (
          page.windowKind !== "normal" ||
          page.backend !== "aux" ||
          page.ownedByRuntime ||
          page.viewStatus === "detached" ||
          page.viewStatus === "crashed" ||
          page.controller === "agent" ||
          page.controller === "external" ||
          identity(page) !== identities[index]
        )
          return false;
        store.assertCaptureEligible({ workspaceId, url: page.url, title: page.title, privateMode: false });
        return true;
      });
    } catch {
      return false;
    }
  };
  return {
    object: async (input) => {
      const stillSame = () =>
        pages.every((page, index) => {
          try {
            return identity(s.pages.get(page.pageId)) === identities[index];
          } catch {
            return false;
          }
        });
      let admitted = eligible(input.text);
      if (admitted) {
        if (!s.native?.captureReadablePage) admitted = false;
        else {
          try {
            const captured = await Promise.all(
              pages.map((page) => s.native!.captureReadablePage!(page.pageId, workspaceId, page.url)),
            );
            admitted =
              eligible(input.text) &&
              captured.every(
                (body, index) =>
                  body.url === pages[index]!.url &&
                  body.title === pages[index]!.title &&
                  !sensitive(body.text),
              );
            if (input.capturedTexts) {
              const readable = captured.map((body) => body.text.replace(/\s+/gu, " ")).join("\n");
              admitted &&= input.capturedTexts.every((text) => readable.includes(text.replace(/\s+/gu, " ")));
            }
          } catch {
            admitted = false;
          }
        }
      }
      const result = await store.cachedDerivative({
        workspaceId,
        signature: JSON.stringify({ version: 1, connection, identities, request: input.signature }),
        eligible: () => admitted && eligible(input.text),
        parse: input.parse,
        cacheable: (value) => !sensitive(JSON.stringify(value)) && input.cacheable?.(value) !== false,
        compute: input.compute,
      });
      if (!stillSame() || connection !== s.settings.modelCacheGeneration())
        throw new AuxError(
          "conflict",
          "The source page or provider connection changed. Try the suggestion again.",
        );
      return result;
    },
  };
}
