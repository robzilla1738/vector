/**
 * Two independent reasons a hidden tab stays laid out: an agent stage lease
 * (one per page; programs on a page are serialized) and conversation previews
 * (a count, because captures overlap). `releaseStage` and `endPreview` return
 * true only when that call removed the last reason, so the caller may hide
 * the page. Hiding while either reason remains stalls pointer actions.
 */
export function createOffscreenHolds() {
  const stage = new Set<string>();
  const preview = new Map<string, number>();

  const holds = (pageId: string) => stage.has(pageId) || preview.has(pageId);

  const acquireStage = (pageId: string) => {
    stage.add(pageId);
  };

  const releaseStage = (pageId: string) => {
    if (!stage.delete(pageId)) return false;
    return !holds(pageId);
  };

  const beginPreview = (pageId: string) => {
    preview.set(pageId, (preview.get(pageId) ?? 0) + 1);
  };

  const endPreview = (pageId: string) => {
    const count = preview.get(pageId) ?? 0;
    if (count < 1) return false;
    if (count === 1) preview.delete(pageId);
    else preview.set(pageId, count - 1);
    return !holds(pageId);
  };

  const forget = (pageId: string) => {
    stage.delete(pageId);
    preview.delete(pageId);
  };

  return { holds, acquireStage, releaseStage, beginPreview, endPreview, forget };
}
