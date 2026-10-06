import { createElement, lazy, Suspense } from "react";
import type { FeatureMount } from "../registry";
import { littleCommands } from "./actions";
const Setting = lazy(() =>
  import("./ExternalLinksSetting").then((module) => ({ default: module.ExternalLinksSetting })),
);
function ExternalLinks() {
  return createElement(Suspense, { fallback: null }, createElement(Setting));
}
export const mount: FeatureMount = {
  feature: "littleWindow",
  commands: littleCommands,
  settingsSections: [{ category: "general", component: ExternalLinks }],
};
