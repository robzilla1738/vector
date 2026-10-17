import type { FeatureMount } from "../registry";
import {
  splitAdd,
  splitClose,
  splitFlip,
  splitFocus,
  splitSwap,
  splitSeparate,
  splitResize,
} from "./split-actions";
import { restoreNativeSplits } from "./split-restoration";
import { SplitDropZones, SplitPicker } from "../../components/SplitDropZones";
import { SplitControls } from "../../components/SplitControls";
import { openCommandSurface } from "../../command-surface-state";

export const mount: FeatureMount = {
  feature: "splitView",
  privateWindows: true,
  boot: restoreNativeSplits,
  sidebarItems: [SplitControls],
  overlays: [SplitDropZones, SplitPicker],
  commands: {
    "split-add": (_state, invocation) =>
      invocation.payload && "pageId" in invocation.payload
        ? splitAdd(
            invocation.payload.pageId,
            "edge" in invocation.payload &&
              (invocation.payload.edge === "left" ||
                invocation.payload.edge === "right" ||
                invocation.payload.edge === "top" ||
                invocation.payload.edge === "bottom")
              ? invocation.payload.edge
              : "right",
          )
        : openCommandSurface({ mode: "command", provider: "split" }),
    "split-side-by-side": () =>
      openCommandSurface({ mode: "command", provider: "split", splitEdge: "right" }),
    "split-stacked": () => openCommandSurface({ mode: "command", provider: "split", splitEdge: "bottom" }),
    "split-separate": (state, invocation) => {
      const id =
        invocation.payload && "pageId" in invocation.payload ? invocation.payload.pageId : state.activePageId;
      return id && splitSeparate(id);
    },
    "split-resize": (_state, invocation) => {
      const value = invocation.payload;
      if (value && "divider" in value)
        return splitResize(value.pageId, value.divider, value.ratio, value.persist);
    },
    "split-close": (state, invocation) => {
      const id =
        invocation.payload && "pageId" in invocation.payload ? invocation.payload.pageId : state.activePageId;
      return id && splitClose(id);
    },
    "split-next": (state) => state.activePageId && splitFocus(state.activePageId, 1),
    "split-previous": (state) => state.activePageId && splitFocus(state.activePageId, -1),
    "split-swap": (state, invocation) => {
      const id =
        invocation.payload && "pageId" in invocation.payload ? invocation.payload.pageId : state.activePageId;
      return id && splitSwap(id);
    },
    "split-flip": (state, invocation) => {
      const id =
        invocation.payload && "pageId" in invocation.payload ? invocation.payload.pageId : state.activePageId;
      return id && splitFlip(id);
    },
  },
};
