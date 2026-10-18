import { useCallback, type ComponentProps } from "react";
import { Select } from "../ui";

/** Chromium owns selectedcontent; React continues to own the select's value and options. */
export function ConnectionSelect({ controlRef, ...props }: ComponentProps<typeof Select>) {
  const attach = useCallback(
    (node: HTMLSelectElement | null) => {
      if (node && !node.querySelector(":scope > button")) {
        const button = document.createElement("button");
        button.type = "button";
        button.append(document.createElement("selectedcontent"));
        node.prepend(button);
      }
      controlRef?.(node);
    },
    [controlRef],
  );
  return <Select {...props} controlRef={attach} />;
}
