/** Branded id helpers shared across runtime, drivers, and UI. */

/**
 * Page backends identify native Aux views and CDP-controlled Chromium pages.
 */
export type Backend = "aux" | "chrome";
export const BACKENDS = ["aux", "chrome"] as const;

/** Engine generational refs (`r12` or `r12.3`). */
export const ELEMENT_REF = /^r\d+(?:\.\d+)?$/;

/** True when `value` is an engine observation ref. */
export const isElementRef = (value: string): boolean => ELEMENT_REF.test(value);

export interface TargetRef {
  backend: Backend;
  /** Driver-native target identity (CDP target id or native page id). */
  targetId: string;
}

let counter = 0;
const prefix = (p: string) =>
  `${p}_${Date.now().toString(36)}_${(counter++).toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const newPageId = () => prefix("p");
export const newRunId = () => prefix("run");
export const newStepId = () => prefix("st");
export const newSetId = () => prefix("set");
export const newMemberId = () => prefix("m");
export const newResultId = () => prefix("res");
export const newObservationId = () => prefix("obs");
export const newProgramId = () => prefix("prog");
export const newArtifactId = () => prefix("art");
export const newSessionId = () => prefix("ses");
export const newEventId = () => prefix("ev");
