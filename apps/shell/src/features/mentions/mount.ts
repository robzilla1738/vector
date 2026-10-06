import type { FeatureMount } from "../registry";
import { createElement, lazy, Suspense } from "react";
const MentionComposer = lazy(() =>
  import("../../mentions/MentionComposer").then((module) => ({ default: module.MentionComposer })),
);
import { mentionController } from "../../mentions/controller";
export const mount: FeatureMount = {
  feature: "tabMentions",
  composerPlugins: [
    (props) => createElement(Suspense, { fallback: null }, createElement(MentionComposer, props)),
  ],
  commands: {
    "mention-insert": (_state, { payload }) => {
      if (!payload || !("composerId" in payload) || !("candidateId" in payload))
        throw new Error("Choose a source in the composer.");
      return mentionController(payload.composerId).insert(payload.candidateId);
    },
    "mention-remove": (_state, { payload }) => {
      if (!payload || !("composerId" in payload) || !("tokenStart" in payload))
        throw new Error("Choose a source token to remove.");
      return mentionController(payload.composerId).remove(payload.tokenStart);
    },
  },
};
