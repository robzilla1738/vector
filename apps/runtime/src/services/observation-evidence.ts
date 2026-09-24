import type { Observation } from "@aux/contracts";

/** Historical source evidence keeps page prose and identity, never interactive control values or selectors. */
export function observationEvidence(observation: Observation): Observation {
  return {
    ...observation,
    changesSince: undefined,
    delta: undefined,
    content: {
      ...observation.content,
      elements: [],
      formFields: [],
      links: [],
      tables: [],
      dialogs: [],
      frames: [],
      console: [],
    },
  };
}
