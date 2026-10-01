import type { FeatureMount } from "../registry";
import { toggleMinimalUi } from "./layout";
export const mount: FeatureMount = {
  feature: "minimalUi",
  privateWindows: true,
  commands: { "minimal-ui": toggleMinimalUi },
  shortcuts: ["minimal-ui"],
};
