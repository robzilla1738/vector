import type { Layout } from "./workspace";

export function boundPin(layout: Pick<Layout, "pins">, pageId: string) {
  for (const [spaceId, pins] of Object.entries(layout.pins)) {
    const pin = pins.find(item => item.pageId === pageId);
    if (pin) return { pin, spaceId };
  }
  return undefined;
}

