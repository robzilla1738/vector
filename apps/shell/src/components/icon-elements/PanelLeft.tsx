import type { Props } from "./svg-props";
import { strokeProps } from "./svg-props";
import { icon, svgPath } from "./render";

export const PanelLeft = (props: Props) => (<svg width="1em" height="1em" aria-hidden="true" {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">{svgPath("M2.75 6.75C2.75 5.64543 3.64543 4.75 4.75 4.75H19.25C20.3546 4.75 21.25 5.64543 21.25 6.75V17.25C21.25 18.3546 20.3546 19.25 19.25 19.25H4.75C3.64543 19.25 2.75 18.3546 2.75 17.25V6.75Z", strokeProps)}{svgPath("M8.25 5V12V19", strokeProps)}</svg>);

export const shellIconSidebar = /* @__PURE__ */ icon(PanelLeft);
export const shellIconSidebarClose = /* @__PURE__ */ icon(PanelLeft);
export const shellIconSidebarOpen = /* @__PURE__ */ icon(PanelLeft);
export const shellIconSidebarSm = /* @__PURE__ */ icon(PanelLeft, "sm");
export const shellIconSidebarCloseSm = /* @__PURE__ */ icon(PanelLeft, "sm");
