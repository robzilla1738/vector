import { useState } from "react";
import { MemoryPasteImport } from "../components/MemoryPasteImport";
import { useStore } from "../store";
import { SpaceMemory } from "../settings/sections/SpaceMemory";

export function PastedMemorySetup() {
  const [reviewSpace, setReviewSpace] = useState<string | null>(null);
  const spaces = useStore((state) => state.layout.spaces);
  const space = spaces.find((item) => item.workspaceId === reviewSpace);
  return (
    <>
      <MemoryPasteImport onReview={setReviewSpace} />
      {reviewSpace && space && (
        <section aria-label={`Memory review for ${space.name}`}>
          <h3>Memory review for {space.name}</h3>
          <SpaceMemory key={reviewSpace} workspaceId={reviewSpace} includePasteImport={false} />
        </section>
      )}
    </>
  );
}
