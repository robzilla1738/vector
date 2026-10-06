import type { Props } from "./svg-props";
import { roundStrokeProps, joinedStrokeProps } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const Unplug = (props: Props) =>
  svg(
    props,
    svgPath(
      "M19.25 14.25V8.25C19.25 7.14543 18.3546 6.25 17.25 6.25H6.75C5.64543 6.25 4.75 7.14543 4.75 8.25V14.25C4.75 16.4591 6.54086 18.25 8.75 18.25H15.25C17.4591 18.25 19.25 16.4591 19.25 14.25Z",
      joinedStrokeProps,
    ),
    svgPath("M12 18.25V21.25", roundStrokeProps),
    svgPath("M15.25 6.25V2.75", roundStrokeProps),
    svgPath("M8.75 6.25V2.75", roundStrokeProps),
  );

export const shellIconUnplug = /* @__PURE__ */ icon(Unplug, "sm");
