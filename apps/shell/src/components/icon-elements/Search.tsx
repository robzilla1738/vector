import type { Props } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const Search = (props: Props) => (svg(props, svgPath("M20.25 20.25L16.1265 16.1265M16.1265 16.1265C17.4385 14.8145 18.25 13.002 18.25 11C18.25 6.99594 15.0041 3.75 11 3.75C6.99594 3.75 3.75 6.99594 3.75 11C3.75 15.0041 6.99594 18.25 11 18.25C13.002 18.25 14.8145 17.4385 16.1265 16.1265Z")));

export const shellIconSearch = /* @__PURE__ */ icon(Search);
export const shellIconSearchLg = /* @__PURE__ */ icon(Search, "lg");
