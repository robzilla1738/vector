import { createElement, lazy, Suspense } from "react";
import type { FeatureMount } from "../registry";
import { claimTab, showTabWindow } from "./actions";
const Placeholder = lazy(() => import("../../components/MovedTabPlaceholder").then(module => ({ default: module.MovedTabPlaceholder })));
function MovedCard() { return createElement(Suspense, { fallback: null }, createElement(Placeholder)); }
export const mount: FeatureMount = {
  feature: "windowSync",
  overlays: [MovedCard],
  commands: { "claim-tab": claimTab, "show-tab-window": showTabWindow },
};
