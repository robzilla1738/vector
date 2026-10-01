import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { icon } from "./render";

export const RotateCw = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M18.5 7.00891C16.6791 4.95438 14.7962 3.75 11.979 3.75C7.42266 3.75 3.729 7.44365 3.729 12C3.729 16.5563 7.42266 20.25 11.979 20.25C15.5711 20.25 18.627 17.9543 19.7596 14.75" {...roundJoinedStrokeProps}/><path d="M19.25 4V8H15.25" {...roundJoinedStrokeProps}/></svg>);

export const shellIconReload = /* @__PURE__ */ icon(RotateCw);
export const shellIconReloadSm = /* @__PURE__ */ icon(RotateCw, "sm");
