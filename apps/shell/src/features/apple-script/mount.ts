import type { FeatureMount } from "../registry";
import { bridge } from "../../bridge";
import { lazy, Suspense, createElement } from "react";
const Preference = lazy(() =>
  import("./preference").then((module) => ({ default: module.AppleScriptPreference })),
);
const AppleScriptPreference = () => createElement(Suspense, { fallback: null }, createElement(Preference));
export const mount: FeatureMount = {
  feature: "appleScript",
  commands: {
    "set-javascript-apple-events": (_state, { payload }) => {
      if (!payload || !("enabled" in payload)) throw new Error("Choose the Apple Events JavaScript setting.");
      return bridge.javascriptAppleEvents(payload.enabled);
    },
  },
  settingsSections: [{ category: "Advanced", component: AppleScriptPreference }],
};
