import { AuxError } from "@aux/contracts";

async function h_night_shift(): Promise<never> {
  throw new AuxError("feature_unavailable", "Night shift is not implemented.");
}

export const nightShiftMethods = {
  "nightShift.propose": h_night_shift,
  "nightShift.queue": h_night_shift,
  "nightShift.list": h_night_shift,
  "nightShift.review": h_night_shift,
};
