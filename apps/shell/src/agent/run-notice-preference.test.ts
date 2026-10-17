// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  readTaskNoticeKinds,
  writeTaskNoticeKinds,
  writeInAppNoticePreference,
  readInAppNoticePreference,
  readTaskSound,
  readSelectedTaskSound,
  writeTaskSound,
} from "./run-notice-preference";

afterEach(() => localStorage.clear());

it("keeps the existing notices toggle and category choices in agreement", () => {
  writeTaskNoticeKinds({ attention: true, completion: false, routine: false });
  expect(readInAppNoticePreference()).toBe("all");
  expect(readTaskNoticeKinds()).toEqual({ attention: true, completion: false, routine: false });
  writeInAppNoticePreference("off");
  expect(readTaskNoticeKinds()).toEqual({ attention: false, completion: false, routine: false });
  writeInAppNoticePreference("all");
  expect(readTaskNoticeKinds()).toEqual({ attention: true, completion: false, routine: false });
  writeTaskNoticeKinds({ attention: false, completion: false, routine: false });
  expect(readInAppNoticePreference()).toBe("off");
  writeTaskNoticeKinds({ attention: false, completion: true, routine: true });
  expect(readInAppNoticePreference()).toBe("all");
});

it("remembers the selected tone while sound is disabled and handles malformed storage", () => {
  writeTaskSound("bright");
  writeTaskSound("off");
  expect(readTaskSound()).toBe("off");
  expect(readSelectedTaskSound()).toBe("bright");
  writeTaskSound(readSelectedTaskSound());
  expect(readTaskSound()).toBe("bright");
  localStorage.setItem("aux.task-completion-sound", "invalid");
  expect(readTaskSound()).toBe("off");
});

it("supports routine-only delivery and preserves previously disabled completions", () => {
  localStorage.setItem("aux.task-notice-kinds", JSON.stringify({ attention: true, completion: false }));
  expect(readTaskNoticeKinds().routine).toBe(false);
  writeTaskNoticeKinds({ attention: false, completion: false, routine: true });
  expect(readInAppNoticePreference()).toBe("all");
  expect(readTaskNoticeKinds()).toEqual({ attention: false, completion: false, routine: true });
});
