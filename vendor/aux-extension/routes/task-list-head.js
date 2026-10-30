/* Aux-owned source, the shared task list helpers, first pass (assets/utils-DCBm67_n.js, from the icons to
 * the tab style): the icons of the task menus and rows, capitalizing a word, the zoom indicator drawn on
 * extension pages, and the browser's tab style. The bundled TanStack Virtual after it stays supplied.
 * Names the rest of the chunk uses keep their chunk names: o the JSX runtime, I React, Mt ReactDOM; the icons
 * at (read), ct (unread), ht (clock), ds, dt (folder), ut (pencil), ft (pin), us, mt (trash-style remove),
 * gt (unpin); pt capitalize; fs the zoom indicator's setup; wt/It/yt/ms the tab style (query key, cache,
 * query, whether tabs are horizontal).
 * Chunk names used: re interop, xe/Se the React and ReactDOM modules, we the JSX module, Qe useQuery.
 * Aux change: the indicator's corner is 12px, the popover step. */
var o = we(),
  at = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M11.9993 4C15.8029 3.99997 19.5064 6.10742 22.0666 10.1143C22.8002 11.2626 22.8002 12.7375 22.0666 13.8857C19.5064 17.8926 15.8029 20 11.9993 20C8.19593 19.9996 4.49285 17.8924 1.93285 13.8857C1.19948 12.7375 1.19945 11.2624 1.93285 10.1143C4.49285 6.10758 8.19593 4.00043 11.9993 4ZM11.9993 6C8.98641 6.00042 5.87211 7.66162 3.61742 11.1904C3.30349 11.6821 3.30349 12.3179 3.61742 12.8096C5.87211 16.3384 8.9864 17.9996 11.9993 18C15.0123 18 18.1262 16.3383 20.3811 12.8096C20.6953 12.3178 20.6953 11.6822 20.3811 11.1904C18.1262 7.66159 15.0123 5.99998 11.9993 6ZM12.0002 8C14.2093 8.00016 16.0002 9.79092 16.0002 12C16.0002 14.2091 14.2093 15.9998 12.0002 16C9.79119 15.9998 8.00024 14.2091 8.00024 12C8.00024 9.79092 9.79119 8.00016 12.0002 8ZM12.0002 10C10.8958 10.0002 10.0002 10.8955 10.0002 12C10.0002 13.1045 10.8958 13.9998 12.0002 14C13.1047 13.9998 14.0002 13.1045 14.0002 12C14.0002 10.8955 13.1047 10.0002 12.0002 10Z',
        fill: 'currentColor',
      }),
    }),
  ct = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M2.29296 2.29283C2.6835 1.90243 3.31653 1.90235 3.70702 2.29283L21.707 20.2928C22.0972 20.6833 22.0973 21.3165 21.707 21.7069C21.3166 22.0973 20.6835 22.0971 20.293 21.7069L17.2002 18.6141C11.986 21.5219 5.71682 19.8099 1.93163 13.8846C1.19841 12.7367 1.19694 11.2661 1.93065 10.117L2.12694 9.81626C3.00672 8.50093 4.01189 7.39949 5.10741 6.52134L2.29296 3.70689C1.90244 3.31636 1.90244 2.68336 2.29296 2.29283ZM6.53515 7.94908C5.47514 8.76345 4.48102 9.83907 3.6162 11.1932C3.30229 11.6848 3.30262 12.315 3.61718 12.8075C6.78352 17.7642 11.6515 19.0828 15.7178 17.1317L14.0303 15.4442C13.4344 15.796 12.7399 15.9998 12 15.9999C9.79096 15.9999 8.00016 14.2089 7.99999 11.9999C7.99999 11.2597 8.20276 10.5646 8.55468 9.96861L6.53515 7.94908ZM10.6064 4.09458C14.8677 3.51182 19.1916 5.61118 22.0693 10.117C22.8022 11.2652 22.8026 12.7344 22.0693 13.8827C21.7567 14.3722 21.4269 14.8337 21.082 15.2665C20.738 15.6982 20.1086 15.7694 19.6767 15.4256C19.245 15.0815 19.1737 14.4522 19.5176 14.0204C19.8178 13.6437 20.1075 13.239 20.3838 12.8065C20.6978 12.3147 20.697 11.6853 20.3828 11.1932C17.8523 7.23105 14.2406 5.61629 10.8779 6.07603C10.3309 6.15083 9.82604 5.76845 9.75097 5.22154C9.67622 4.67448 10.0594 4.16953 10.6064 4.09458ZM10.0683 11.4823C10.0244 11.6471 9.99999 11.8204 9.99999 11.9999C10.0002 13.1043 10.8955 13.9999 12 13.9999C12.1792 13.9998 12.352 13.9744 12.5166 13.9305L10.0683 11.4823Z',
        fill: 'currentColor',
      }),
    }),
  ht = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M12.0673 2C11.4414 2 10.934 2.50447 10.934 3.12676V9.88732C10.934 10.1985 10.6803 10.4507 10.3674 10.4507C10.0545 10.4507 9.80077 10.1985 9.80077 9.88732V4.25352C9.80077 3.63123 9.2934 3.12676 8.66753 3.12676C8.04165 3.12676 7.53428 3.63123 7.53428 4.25352V11.1464C7.53428 11.3763 7.39386 11.5831 7.17946 11.669C6.96506 11.7549 6.71966 11.7027 6.55938 11.5371L5.21282 10.1458C4.43664 9.34385 3.10627 9.49382 2.53035 10.4482L2.5 10.4985L5.29405 17.2834C6.46887 20.1363 9.26174 22 12.3623 22C16.5805 22 20 18.6 20 14.406V6.50704C20 5.88475 19.4926 5.38028 18.8668 5.38028C18.2409 5.38028 17.7335 5.88475 17.7335 6.50704V11.0141C17.7335 11.3252 17.4798 11.5775 17.1669 11.5775C16.8539 11.5775 16.6003 11.3252 16.6003 11.0141V4.25352C16.6003 3.63123 16.0929 3.12676 15.467 3.12676C14.8411 3.12676 14.3338 3.63123 14.3338 4.25352V10.4507C14.3338 10.7619 14.0801 11.0141 13.7671 11.0141C13.4542 11.0141 13.2005 10.7619 13.2005 10.4507V3.12676C13.2005 2.50447 12.6931 2 12.0673 2Z',
        fill: 'currentColor',
      }),
    }),
  ds = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        d: 'M11 3C15.4183 3 19 6.58173 19 11C19 12.8486 18.3703 14.5487 17.3174 15.9033L20.707 19.293C21.0973 19.6835 21.0974 20.3166 20.707 20.707C20.3166 21.0975 19.6835 21.0974 19.293 20.707L15.9033 17.3174C14.5487 18.3703 12.8486 19 11 19C6.58173 19 3 15.4183 3 11C3 6.58173 6.58173 3 11 3ZM11 5C7.68629 5 5 7.68629 5 11C5 14.3137 7.68629 17 11 17C14.3137 17 17 14.3137 17 11C17 7.68629 14.3137 5 11 5Z',
        fill: 'currentColor',
      }),
    }),
  dt = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        d: 'M18.293 13.293C18.6835 12.9024 19.3165 12.9024 19.707 13.293L22.707 16.293C23.0975 16.6835 23.0975 17.3165 22.707 17.707L19.707 20.707C19.3165 21.0975 18.6835 21.0975 18.293 20.707C17.9025 20.3165 17.9025 19.6835 18.293 19.293L19.5859 18H14C13.4477 18 13 17.5523 13 17C13 16.4477 13.4477 16 14 16H19.5859L18.293 14.707C17.9025 14.3165 17.9025 13.6835 18.293 13.293ZM8.39453 3C9.73191 3.00003 10.9808 3.66847 11.7227 4.78125L11.9414 5.10938C12.3123 5.66573 12.9368 5.99996 13.6055 6H18C20.2092 6 22 7.79088 22 10C22 10.5523 21.5523 11 21 11C20.4477 11 20 10.5523 20 10C20 8.89542 19.1046 8 18 8H13.6055C12.2681 7.99996 11.0192 7.33152 10.2773 6.21875L10.0586 5.89062C9.68767 5.33425 9.06321 5.00003 8.39453 5H6C4.89543 5 4 5.89543 4 7V16C4 17.1046 4.89542 18 6 18H10.5C11.0523 18 11.5 18.4477 11.5 19C11.5 19.5523 11.0523 20 10.5 20H6C3.79088 20 2 18.2092 2 16V7C2 4.79087 3.79087 3 6 3H8.39453Z',
        fill: 'currentColor',
      }),
    }),
  ut = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M14.543 3.54299C16.176 1.91015 18.824 1.91015 20.457 3.54299C22.0901 5.17608 22.0899 7.82387 20.457 9.45705L8.5 21.4151C8.12508 21.7898 7.61632 22 7.08594 22H3C2.44772 22 2 21.5523 2 21V16.9151C2.00004 16.3847 2.21081 15.8751 2.58594 15.5L14.543 3.54299ZM4 16.9151V20H7.08594L16.5859 10.5L13.5 7.41409L4 16.9151ZM19.043 4.95705C18.191 4.10526 16.809 4.10526 15.957 4.95705L14.9141 6.00002L18 9.08596L19.043 8.04299C19.8948 7.19085 19.895 5.80909 19.043 4.95705Z',
        fill: 'currentColor',
      }),
    }),
  ft = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        d: 'M12.208 4.0754C13.4784 1.71655 16.664 1.24923 18.5586 3.14376L20.8564 5.44161C22.7509 7.33632 22.2828 10.5219 19.9238 11.7922L18.3936 12.6164C17.8029 12.9346 17.4105 13.5274 17.3496 14.1955L17.0762 17.2111C16.7691 20.5885 12.6617 22.076 10.2637 19.6779L8 17.4133L4.70703 20.7072C4.31655 21.0975 3.68344 21.0975 3.29297 20.7072C2.90251 20.3168 2.90263 19.6837 3.29297 19.2932L6.58593 15.9992L4.32226 13.7356C1.9244 11.3376 3.41086 7.2312 6.78808 6.92403L9.80371 6.64962C10.4719 6.58887 11.0655 6.1974 11.3838 5.60665L12.208 4.0754ZM17.1436 4.55782C16.1962 3.61094 14.6039 3.84445 13.9687 5.02364L13.1445 6.55489C12.5081 7.73635 11.3218 8.52021 9.98535 8.6418L6.96972 8.91622C5.28105 9.06973 4.53746 11.1225 5.73633 12.3215L11.6777 18.2639C12.8767 19.4629 14.9304 18.7191 15.084 17.0305L15.3584 14.0148C15.48 12.6782 16.2636 11.4911 17.4453 10.8547L18.9756 10.0305C20.1551 9.3953 20.3887 7.80298 19.4414 6.85567L17.1436 4.55782Z',
        fill: 'currentColor',
      }),
    }),
  us = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M9.78522 3.18531C10.2789 2.44479 11.11 2 12 2C12.89 2 13.7211 2.44479 14.2148 3.18531L14.5924 3.75182C14.925 4.25061 15.5315 4.49147 16.1157 4.35667L16.4882 4.2707C17.3962 4.06117 18.348 4.33416 19.0069 4.99307C19.6658 5.65197 19.9388 6.60383 19.7293 7.5118L19.6433 7.88434C19.5085 8.46846 19.7494 9.07503 20.2482 9.40755L20.8147 9.78522C21.5552 10.2789 22 11.11 22 12C22 12.89 21.5552 13.7211 20.8147 14.2148L20.2482 14.5924C19.7494 14.925 19.5085 15.5315 19.6433 16.1157L19.7293 16.4882C19.9388 17.3962 19.6658 18.348 19.0069 19.0069C18.348 19.6658 17.3962 19.9388 16.4882 19.7293L16.1157 19.6433C15.5315 19.5085 14.925 19.7494 14.5924 20.2482L14.2148 20.8147C13.7211 21.5552 12.89 22 12 22C11.11 22 10.2789 21.5552 9.78522 20.8147L9.40755 20.2482C9.07503 19.7494 8.46846 19.5085 7.88434 19.6433L7.5118 19.7293C6.60383 19.9388 5.65197 19.6658 4.99307 19.0069C4.33416 18.348 4.06117 17.3962 4.2707 16.4882L4.35667 16.1157C4.49147 15.5315 4.25061 14.925 3.75182 14.5924L3.18531 14.2148C2.44479 13.7211 2 12.89 2 12C2 11.11 2.4448 10.2789 3.18531 9.78522L3.75182 9.40755C4.25061 9.07503 4.49147 8.46846 4.35667 7.88434L4.2707 7.5118C4.06117 6.60383 4.33416 5.65197 4.99307 4.99307C5.65197 4.33416 6.60383 4.06117 7.5118 4.2707L7.88434 4.35667C8.46846 4.49147 9.07503 4.25061 9.40755 3.75182L9.78522 3.18531ZM8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12Z',
        fill: 'currentColor',
      }),
    }),
  mt = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        d: 'M12 1.5C14.2393 1.50016 16.133 2.97167 16.7705 5H20.5C21.0523 5 21.5 5.44772 21.5 6C21.5 6.55228 21.0523 7 20.5 7H19.9688L19.1904 18.2754C19.0457 20.3725 17.3022 21.9998 15.2002 22H8.7998C6.69772 21.9998 4.95429 20.3725 4.80957 18.2754L4.03125 7H3.5C2.94772 7 2.5 6.55228 2.5 6C2.5 5.44772 2.94772 5 3.5 5H7.23047C7.86793 2.97178 9.76078 1.50016 12 1.5ZM6.80469 18.1377C6.87703 19.1862 7.74886 19.9998 8.7998 20H15.2002C16.2511 19.9998 17.1229 19.1862 17.1953 18.1377L17.9629 7H6.03711L6.80469 18.1377ZM10 10C10.5523 10 11 10.4477 11 11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V16C15 16.5523 14.5523 17 14 17C13.4477 17 13 16.5523 13 16V11C13 10.4477 13.4477 10 14 10ZM12 3.5C10.8906 3.50013 9.9222 4.10391 9.40332 5H14.5967C14.0776 4.10394 13.1093 3.50013 12 3.5Z',
        fill: 'currentColor',
      }),
    }),
  gt = ({size = 24, ariaHidden = true, ...n}) =>
    (0, o.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, o.jsx)('path', {
        d: 'M2.29298 2.29317C2.68351 1.90265 3.31652 1.90265 3.70704 2.29317L21.707 20.2932C22.0974 20.6837 22.0975 21.3168 21.707 21.7072C21.3166 22.0975 20.6835 22.0975 20.293 21.7072L16.8399 18.2541C15.8815 20.8679 12.3977 21.812 10.2637 19.6779L8.00001 17.4143L4.70704 20.7072C4.31657 21.0975 3.68346 21.0975 3.29298 20.7072C2.90252 20.3168 2.90265 19.6837 3.29298 19.2932L6.58595 15.9992L4.32228 13.7356C2.18856 11.6017 3.13112 8.11716 5.74415 7.1584L2.29298 3.70723C1.90252 3.31677 1.90265 2.68371 2.29298 2.29317ZM6.96974 8.91622C5.28106 9.06974 4.53747 11.1225 5.73634 12.3215L11.6777 18.2639C12.8768 19.4629 14.9305 18.7192 15.084 17.0305L15.1279 16.5422L7.45704 8.8713L6.96974 8.91622ZM12.208 4.0754C13.4785 1.71655 16.6641 1.24923 18.5586 3.14376L20.8565 5.44161C22.7509 7.33632 22.2828 10.522 19.9238 11.7922L18.3936 12.6164C17.9073 12.8781 17.3009 12.6954 17.0391 12.2092C16.7775 11.723 16.9591 11.1165 17.4453 10.8547L18.9756 10.0305C20.1551 9.39531 20.3887 7.80298 19.4414 6.85567L17.1436 4.55782C16.1963 3.61094 14.6039 3.84445 13.9688 5.02364L13.1445 6.55489C12.8826 7.04086 12.2762 7.22291 11.7901 6.96114C11.3039 6.69935 11.1222 6.09286 11.3838 5.60665L12.208 4.0754Z',
        fill: 'currentColor',
      }),
    }); /** A word with its first letter capitalized. */
function pt(word) {
  return word.substring(0, 1).toUpperCase() + word.substring(1);
} /** The message the browser sends when a page's zoom changes. */
function isZoomIndicatorMessage(message) {
  return (
    typeof message == 'object' &&
    message !== null &&
    'type' in message &&
    message.type === 'current-zoom-indicator:show' &&
    'zoomFactor' in message &&
    typeof message.zoomFactor == 'number'
  );
}
var ZOOM_INDICATOR_MS = 5e3,
  ZOOM_INSET = 16,
  ZOOM_INDICATOR_SCALE = 0.8,
  ZOOM_CHANGE_EPSILON = 0.01,
  zoomRoot = null,
  zoomIndicator = null,
  zoomHideTimer,
  zoomListening = false; /** Shows the indicator on zoom messages, and on an extension page on its own tab's zoom changes. */
function fs() {
  if (zoomListening) return;
  zoomListening = true;
  const isExtensionPage = window.location.protocol === 'chrome-extension:';
  (chrome.runtime.onMessage.addListener((message, sender, respond) => {
    isZoomIndicatorMessage(message) && (showZoom(message.zoomFactor), respond({ok: true}));
  }),
    isExtensionPage &&
      chrome.tabs?.getCurrent &&
      chrome.tabs.onZoomChange &&
      chrome.tabs.onZoomChange.addListener(zoom => {
        (async () =>
          Math.abs(zoom.newZoomFactor - zoom.oldZoomFactor) < ZOOM_CHANGE_EPSILON ||
          ((await chrome.tabs.getCurrent().catch(() => {}))?.id === zoom.tabId && showZoom(zoom.newZoomFactor)))();
      }));
} /** Draws the zoom level, sized against the page's zoom, and hides it after a few seconds. */
function showZoom(zoomFactor) {
  const indicator = zoomIndicatorElement(),
    zoom = zoomFactor > 0 ? zoomFactor : 1;
  (zoomRoot && ((zoomRoot.style.top = `${ZOOM_INSET / zoom}px`), (zoomRoot.style.right = `${ZOOM_INSET / zoom}px`)),
    indicator.style.setProperty('--aux-zoom-indicator-scale', `${ZOOM_INDICATOR_SCALE / zoom}`),
    (indicator.textContent = `${Math.round(zoomFactor * 100)}%`),
    (indicator.dataset.visible = 'true'),
    window.clearTimeout(zoomHideTimer),
    (zoomHideTimer = window.setTimeout(() => {
      indicator.dataset.visible = 'false';
    }, ZOOM_INDICATOR_MS)));
} /** The indicator element, built once in a shadow root on the page. */
function zoomIndicatorElement() {
  if (zoomIndicator?.isConnected) return zoomIndicator;
  ((zoomRoot = document.createElement('div')),
    (zoomRoot.id = 'aux-current-zoom-indicator-root'),
    (zoomRoot.style.position = 'fixed'),
    (zoomRoot.style.top = `${ZOOM_INSET}px`),
    (zoomRoot.style.right = `${ZOOM_INSET}px`),
    (zoomRoot.style.zIndex = '2147483647'),
    (zoomRoot.style.pointerEvents = 'none'));
  const shadow = zoomRoot.attachShadow({mode: 'open'});
  return (
    (shadow.innerHTML = `
    <style>
      :host {
        all: initial;
      }

      #indicator {
        align-items: center;
        background: var(--popover, rgba(24, 24, 27, 0.9));
        border: 1px solid var(--border, rgba(255, 255, 255, 0.16));
        border-radius: 12px;
        box-shadow:
          0 18px 44px rgba(0, 0, 0, 0.22),
          inset 0 1px 0 rgba(255, 255, 255, 0.16);
        box-sizing: border-box;
        color: var(--popover-foreground, white);
        display: inline-flex;
        font: 650 16px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        justify-content: center;
        min-width: 74px;
        opacity: 0;
        padding: 12px 16px;
        transform: scale(var(--aux-zoom-indicator-scale, 1));
        transform-origin: top right;
        transition: opacity 140ms ease;
        user-select: none;
        white-space: nowrap;
      }

      #indicator[data-visible='true'] {
        opacity: 1;
      }
    </style>
    <div id="indicator" aria-live="polite" data-visible="false" role="status"></div>
  `),
    (zoomIndicator = shadow.getElementById('indicator')),
    (document.body ?? document.documentElement).append(zoomRoot),
    zoomIndicator
  );
}
var wt = ['browserPreferences', 'tabStyle'],
  TAB_STYLE_CACHE_KEY = 'aux.browserTabStyle.v2',
  browserPreferences = () => (typeof chrome > 'u' ? void 0 : chrome.auxBrowserPreferences),
  It = tabStyle => {
    try {
      localStorage.setItem(TAB_STYLE_CACHE_KEY, tabStyle);
    } catch {}
  },
  yt = () => {
    const hasPreferences = !!browserPreferences();
    return Qe({
      queryKey: wt,
      queryFn: async () => {
        const tabStyle = await browserPreferences()?.getTabStyle();
        return (tabStyle && It(tabStyle), tabStyle);
      },
      enabled: hasPreferences,
    });
  },
  ms = () => {
    const hasPreferences = !!browserPreferences(),
      {data: tabStyle} = yt();
    return !hasPreferences || tabStyle === 'horizontal';
  },
  I = re(xe(), 1),
  Mt = re(Se(), 1);
