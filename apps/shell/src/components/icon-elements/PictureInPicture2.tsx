import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { icon } from "./render";

export const PictureInPicture2 = (props: Props) => (<svg {...baseSvgProps} {...props}><rect x="3.75" y="4.75" width="16.5" height="14.5" rx="2" {...roundJoinedStrokeProps}/><rect x="12.25" y="11.25" width="6" height="5.5" rx="0.75" fill="currentColor"/></svg>);

export const shellIconPip = /* @__PURE__ */ icon(PictureInPicture2, "sm");
