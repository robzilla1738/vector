import type { Props } from "./svg-props";
import { joinedStrokeProps } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const Shield = (props: Props) => (svg(props, svgPath("M12 3.25C14.2 4.9 16.6 5.75 19.25 5.75V11.75C19.25 16.5 16.6 19.6 12 20.75C7.4 19.6 4.75 16.5 4.75 11.75V5.75C7.4 5.75 9.8 4.9 12 3.25Z", joinedStrokeProps)));

export const shellIconShield = /* @__PURE__ */ icon(Shield, "sm");
