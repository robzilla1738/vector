/* Aux-owned source, composer pass 10: the composer's head (assets/session-composer-Dc0LRfZA.js,
 * from the icons to the input form): the composer's icons, the separator, tool-activity summaries
 * (Searched, Read from, Ran actions) and step grouping, prompt history on ArrowUp, the open-tab
 * mention list, the editor (an external one when a page provides it), the + menu for files, folders
 * and photos, the incognito toggle, Send and Stop, dictation, and the input form and its frame.
 * Names the chunk uses elsewhere keep their chunk names: a JSX runtime, g React, Da/Zl/Jl/tu/nu/ru/
 * su/au/Mr/ou/iu icons, $n Separator, lu groupSteps, Kn isBareStep, hu activitySummary, pu tabTargets,
 * fu ComposerEditor, jr useTabMentions, Cu AddMenu, wu SendButton, xn DictationContext, Su
 * DictationProvider, Pu HideWhileDictating, ku DictationConfirm, Mu TrailingAction, Iu InputProvider,
 * Au InputFrame; auxDictation keeps its Aux name.
 * Chunk names used: Y cn, yi separator, Ye/aa tool definitions, El/Rl/Nl editor extensions, me
 * useSession, ge useApp, Ce useTRPC, At attachments, xt the input form, Tt the editor, Js the native
 * bridge, J Button, Ae/Pe/Ie tooltip parts, ja Kbd, st message key, Ht message text. */
var a = Go(),
  Da = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        d: 'M19 17C19 15.8954 18.1046 15 17 15C15.9472 15 15.0836 15.8144 15.0059 16.8467C15.0021 16.8971 15 16.9483 15 17C15 18.1046 15.8954 19 17 19C18.1046 19 19 18.1046 19 17ZM15.3984 3C17.389 3.00017 19.0768 4.46415 19.3584 6.43457L19.8672 10H21C21.5523 10 22 10.4477 22 11C22 11.5523 21.5523 12 21 12H3C2.44772 12 2 11.5523 2 11C2 10.4477 2.44772 10 3 10H4.13281L4.64258 6.43457C4.92407 4.46407 6.61111 3.00016 8.60156 3H15.3984ZM8.60156 5C7.60653 5.00016 6.76296 5.73179 6.62207 6.7168L6.15332 10H17.8467L17.3779 6.7168C17.237 5.73176 16.3935 5.00017 15.3984 5H8.60156ZM5 17C5 18.1046 5.89542 19 7 19C8.10458 19 9 18.1046 9 17C9 16.9483 8.99794 16.8972 8.99414 16.8467C8.91644 15.8143 8.0529 15 7 15C5.89542 15 5 15.8954 5 17ZM21 17C21 19.2092 19.2092 21 17 21C14.8827 21 13.1503 19.3551 13.0098 17.2734C12.3878 16.9092 11.611 16.9096 10.9893 17.2744C10.8482 19.3556 9.11686 21 7 21C4.79088 21 3 19.2092 3 17C3 14.7908 4.79088 13 7 13C8.58264 13 9.94897 13.9194 10.5977 15.2529C11.4995 14.9159 12.4984 14.9156 13.4004 15.252C14.0491 13.9184 15.4174 13 17 13C19.2092 13 21 14.7908 21 17Z',
        fill: 'currentColor',
      }),
    }),
  Zl = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M9.29295 5.29295C9.68348 4.90243 10.3165 4.90243 10.707 5.29295C11.0974 5.68349 11.0975 6.31654 10.707 6.70702L6.41405 11H20C20.5522 11.0001 21 11.4477 21 12C20.9999 12.5522 20.5522 12.9999 20 13H6.41405L10.707 17.293C11.0974 17.6835 11.0975 18.3165 10.707 18.707C10.3165 19.0975 9.68349 19.0974 9.29295 18.707L3.29295 12.707C2.90243 12.3165 2.90243 11.6835 3.29295 11.293L9.29295 5.29295Z',
        fill: 'currentColor',
      }),
    }),
  Jl = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        d: 'M21 9C21 9.55228 20.5523 10 20 10C19.4477 10 19 9.55228 19 9V6.41406L13 12.4141V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V12.4141L5 6.41406V9C5 9.55228 4.55228 10 4 10C3.44772 10 3 9.55228 3 9V4C3 3.44772 3.44772 3 4 3H9C9.55228 3 10 3.44772 10 4C10 4.55228 9.55228 5 9 5H6.41406L12 10.5859L17.5859 5H15C14.4477 5 14 4.55228 14 4C14 3.44772 14.4477 3 15 3H20C20.5523 3 21 3.44772 21 4V9Z',
        fill: 'currentColor',
      }),
    }),
  SendIcon = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        d: 'M10.9997 17.8337V8.58073L6.87368 12.7067C6.48316 13.0972 5.85015 13.0972 5.45962 12.7067C5.06926 12.3162 5.06915 11.6831 5.45962 11.2926L11.2926 5.45964C11.6831 5.06917 12.3162 5.06927 12.7067 5.45964L18.5407 11.2926C18.9311 11.6831 18.9309 12.3162 18.5407 12.7067C18.1502 13.0972 17.5171 13.0972 17.1266 12.7067L12.9997 8.57975V17.8337C12.9995 18.3858 12.5518 18.8337 11.9997 18.8337C11.4476 18.8335 10.9998 18.3857 10.9997 17.8337Z',
        fill: 'currentColor',
      }),
    }),
  tu = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M6.55731 1.36448C7.00179 1.02585 7.5493 1.00462 8.00653 1.176L8.00555 1.17698C10.1437 1.96447 12.0114 3.84347 12.7087 6.11253C14.6882 4.77541 17.0089 3.98286 19.7048 3.92014V3.9221C20.2453 3.90549 20.7922 4.05957 21.2175 4.43479C21.6553 4.82132 21.8796 5.36788 21.8796 5.95237V17.8078C21.8795 18.3527 21.6927 18.8737 21.28 19.259C20.8863 19.6263 20.3874 19.7781 19.9245 19.8137C19.9171 19.8143 19.9094 19.8143 19.902 19.8147C16.956 19.9746 14.6153 20.7019 12.4431 21.7766C12.4332 21.7815 12.4227 21.7848 12.4128 21.7893C12.398 21.796 12.3829 21.8019 12.3679 21.8078C12.3497 21.8151 12.3315 21.8213 12.3132 21.8274L12.3015 21.8332H12.2995C12.2934 21.8351 12.2871 21.8363 12.2809 21.8381C12.2579 21.8449 12.2348 21.8506 12.2116 21.8557C12.2044 21.8573 12.1973 21.8592 12.1901 21.8606C12.1761 21.8633 12.1621 21.8653 12.1481 21.8674C12.1452 21.8679 12.1423 21.8689 12.1393 21.8694C12.1348 21.87 12.1302 21.8698 12.1257 21.8703C12.1098 21.8724 12.0938 21.8739 12.0778 21.8752C12.0651 21.8762 12.0525 21.8777 12.0397 21.8782C12.0205 21.8789 12.0014 21.8785 11.9821 21.8782C11.9671 21.8779 11.9522 21.8772 11.9372 21.8762C11.9242 21.8754 11.9112 21.8746 11.8981 21.8733C11.8769 21.8711 11.8557 21.869 11.8347 21.8655C11.8324 21.8651 11.8301 21.8649 11.8278 21.8645C11.8157 21.8624 11.8038 21.8592 11.7917 21.8567C11.7792 21.854 11.7669 21.851 11.7546 21.8479C11.7366 21.8433 11.7187 21.8388 11.7009 21.8332C11.685 21.8283 11.6696 21.8224 11.654 21.8166C11.638 21.8107 11.622 21.8049 11.6061 21.7981C11.5929 21.7924 11.5801 21.7858 11.5671 21.7795C11.5562 21.7743 11.5446 21.7705 11.5339 21.7649C9.36692 20.6244 6.88605 19.8401 4.07977 19.8401C3.57931 19.8401 3.06145 19.686 2.66766 19.2922C2.2739 18.8985 2.11985 18.3806 2.11981 17.8801V6.3596C2.11992 5.64829 2.47038 4.90738 3.21552 4.5969L3.22821 4.59104C4.21484 4.19639 5.07764 4.07925 5.95966 4.13401V2.64085C5.95966 2.19 6.1278 1.69193 6.55731 1.36448ZM19.7507 5.92014C17.0686 5.9826 14.8537 6.88003 12.9997 8.38596V19.3293C14.9931 18.5095 17.179 17.9614 19.7761 17.8186C19.821 17.8149 19.8549 17.8071 19.8796 17.801V5.95237C19.8796 5.94354 19.8772 5.93594 19.8766 5.92991C19.8557 5.924 19.8196 5.91716 19.7634 5.91917L19.7507 5.92014ZM5.95966 6.1428C5.32575 6.08876 4.76804 6.15574 4.11981 6.39475V17.8401C5.39587 17.8431 6.60846 17.9905 7.75751 18.2453C7.37185 18.0142 6.97015 17.8046 6.55145 17.6174C6.19156 17.4565 5.95984 17.0985 5.95966 16.7043V6.1428ZM7.95966 16.0744C9.0807 16.6419 10.0944 17.3527 10.9997 18.2043V7.9387C10.9646 6.0705 9.66986 4.24341 7.95966 3.34104V16.0744Z',
        fill: 'currentColor',
      }),
    }),
  nu = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        d: 'M17.5 3C19.1569 3 20.5 4.34315 20.5 6C20.5 7.30574 19.6645 8.413 18.5 8.8252V9C18.5 11.2092 16.7092 13 14.5 13H9.5C8.39542 13 7.5 13.8954 7.5 15V15.1738C8.66468 15.5859 9.5 16.6941 9.5 18C9.5 19.6569 8.15685 21 6.5 21C4.84315 21 3.5 19.6569 3.5 18C3.5 16.6941 4.33532 15.5859 5.5 15.1738V8.8252C4.33548 8.413 3.5 7.30574 3.5 6C3.5 4.34315 4.84315 3 6.5 3C8.15685 3 9.5 4.34315 9.5 6C9.5 7.30574 8.66452 8.413 7.5 8.8252V11.5361C8.08845 11.1956 8.77125 11 9.5 11H14.5C15.6046 11 16.5 10.1046 16.5 9V8.8252C15.3355 8.413 14.5 7.30574 14.5 6C14.5 4.34315 15.8431 3 17.5 3ZM6.5 17C5.94772 17 5.5 17.4477 5.5 18C5.5 18.5523 5.94772 19 6.5 19C7.05228 19 7.5 18.5523 7.5 18C7.5 17.4477 7.05228 17 6.5 17ZM6.5 5C5.94772 5 5.5 5.44772 5.5 6C5.5 6.55228 5.94772 7 6.5 7C7.05228 7 7.5 6.55228 7.5 6C7.5 5.44772 7.05228 5 6.5 5ZM17.5 5C16.9477 5 16.5 5.44772 16.5 6C16.5 6.55228 16.9477 7 17.5 7C18.0523 7 18.5 6.55228 18.5 6C18.5 5.44772 18.0523 5 17.5 5Z',
        fill: 'currentColor',
      }),
    }),
  ru = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsxs)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: [
        (0, a.jsx)('path', {
          d: 'M6.5 5C4.01472 5 2 7.01472 2 9.5C2 11.9853 4.01472 14 6.5 14C7.12094 14 7.7125 13.8742 8.25061 13.6468C8.14336 13.8428 8.02685 14.0278 7.90233 14.2038C7.11656 15.3147 5.95463 16.1617 4.4453 17.1679C3.98577 17.4743 3.8616 18.0952 4.16795 18.5547C4.4743 19.0142 5.09517 19.1384 5.5547 18.8321C7.04537 17.8383 8.50844 16.8103 9.53517 15.3587C10.5905 13.8667 11.1296 12.0164 10.9999 9.47254C10.9851 6.99989 8.97612 5 6.5 5Z',
          fill: 'currentColor',
        }),
        (0, a.jsx)('path', {
          d: 'M17.5 5C15.0147 5 13 7.01472 13 9.5C13 11.9853 15.0147 14 17.5 14C18.1209 14 18.7125 13.8742 19.2506 13.6468C19.1434 13.8428 19.0268 14.0278 18.9023 14.2038C18.1166 15.3147 16.9546 16.1617 15.4453 17.1679C14.9858 17.4743 14.8616 18.0952 15.1679 18.5547C15.4743 19.0142 16.0952 19.1384 16.5547 18.8321C18.0454 17.8383 19.5084 16.8103 20.5352 15.3587C21.5905 13.8667 22.1296 12.0164 21.9999 9.47254C21.9851 6.99989 19.9761 5 17.5 5Z',
          fill: 'currentColor',
        }),
      ],
    }),
  su = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        d: 'M9.17157 9.17146C9.5621 8.78094 9.5621 8.14777 9.17157 7.75725C8.78105 7.36672 8.14788 7.36672 7.75736 7.75725L9.17157 9.17146ZM7.75736 16.2425C8.14788 16.6331 8.78105 16.6331 9.17157 16.2425C9.5621 15.852 9.5621 15.2188 9.17157 14.8283L7.75736 16.2425ZM14.8284 14.8283C14.4379 15.2188 14.4379 15.852 14.8284 16.2425C15.219 16.6331 15.8521 16.6331 16.2426 16.2425L14.8284 14.8283ZM16.2426 7.75725C15.8521 7.36672 15.219 7.36672 14.8284 7.75725C14.4379 8.14777 14.4379 8.78094 14.8284 9.17146L16.2426 7.75725ZM8 11.9999C8 10.895 8.44662 9.89641 9.17157 9.17146L7.75736 7.75725C6.67267 8.84194 6 10.3433 6 11.9999H8ZM9.17157 14.8283C8.44662 14.1034 8 13.1047 8 11.9999H6C6 13.6565 6.67267 15.1578 7.75736 16.2425L9.17157 14.8283ZM16 11.9999C16 13.1047 15.5534 14.1034 14.8284 14.8283L16.2426 16.2425C17.3273 15.1578 18 13.6565 18 11.9999H16ZM14.8284 9.17146C15.5534 9.89641 16 10.895 16 11.9999H18C18 10.3433 17.3273 8.84194 16.2426 7.75725L14.8284 9.17146ZM12 11.9999V13.9999C13.1046 13.9999 14 13.1045 14 11.9999H12ZM12 11.9999H10C10 13.1045 10.8954 13.9999 12 13.9999V11.9999ZM12 11.9999V9.99988C10.8954 9.99988 10 10.8953 10 11.9999H12ZM12 11.9999H14C14 10.8953 13.1046 9.99988 12 9.99988V11.9999Z',
        fill: 'currentColor',
      }),
    }),
  au = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        d: 'M4.79962 12V10.2002C4.79962 9.70314 5.20296 9.2998 5.70001 9.2998C6.19707 9.2998 6.6004 9.70314 6.6004 10.2002V12C6.6004 14.9823 9.01757 17.4003 11.9998 17.4004C14.9822 17.4004 17.4002 14.9823 17.4002 12V10.2002C17.4002 9.70327 17.8027 9.30002 18.2996 9.2998C18.7967 9.2998 19.2 9.70314 19.2 10.2002V12C19.2 15.6715 16.4516 18.6985 12.9002 19.1416V20.0996H15.6004C16.0973 20.0998 16.4998 20.5031 16.4998 21C16.4998 21.4969 16.0973 21.9002 15.6004 21.9004H8.40021C7.90315 21.9004 7.49982 21.4971 7.49982 21C7.49982 20.5029 7.90315 20.0996 8.40021 20.0996H11.1004V19.1416C7.5487 18.6987 4.79962 15.6717 4.79962 12ZM15.6004 12C15.6004 13.9883 13.9881 15.5996 11.9998 15.5996C10.0116 15.5995 8.40021 13.9882 8.40021 12V5.7002C8.40021 3.71205 10.0116 2.09971 11.9998 2.09961C13.9881 2.09961 15.6004 3.71198 15.6004 5.7002V12Z',
        fill: 'currentColor',
      }),
    }),
  Mr = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M9.99999 12.9999C10.5522 13 11 13.4477 11 13.9999V19.9999C10.9999 20.5521 10.5522 20.9998 9.99999 20.9999C9.44773 20.9999 9.00003 20.5522 8.99999 19.9999V16.414L4.45702 20.957C4.06653 21.3474 3.43349 21.3474 3.04295 20.957C2.65243 20.5664 2.65243 19.9334 3.04295 19.5429L7.58592 14.9999H3.99999C3.44773 14.9999 3.00003 14.5522 2.99999 13.9999C2.99999 13.4476 3.4477 12.9999 3.99999 12.9999H9.99999ZM19.543 3.04289C19.9335 2.65237 20.5665 2.65237 20.957 3.04289C21.3474 3.43343 21.3475 4.06648 20.957 4.45696L16.414 8.99992H20C20.5522 9 21 9.44769 21 9.99992C20.9999 10.5521 20.5522 10.9999 20 10.9999H14C13.4478 10.9999 13.0001 10.5521 13 9.99992V3.99992C13 3.44764 13.4477 2.99992 14 2.99992C14.5522 3 15 3.44769 15 3.99992V7.58586L19.543 3.04289Z',
        fill: 'currentColor',
      }),
    }),
  ou = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        d: 'M13.5625 19.8477C14.1042 19.7405 14.6301 20.093 14.7373 20.6348C14.8444 21.1765 14.4919 21.7024 13.9502 21.8096C13.3186 21.9345 12.6665 22 12 22C11.3335 22 10.6814 21.9345 10.0498 21.8096C9.50806 21.7024 9.15558 21.1765 9.2627 20.6348C9.36987 20.093 9.89575 19.7405 10.4375 19.8477C10.942 19.9475 11.4644 20 12 20C12.5356 20 13.058 19.9475 13.5625 19.8477ZM3.95996 16.1699C4.41888 15.8628 5.03945 15.9854 5.34668 16.4443C5.93103 17.3172 6.68282 18.069 7.55566 18.6533C8.01455 18.9605 8.13724 19.5811 7.83008 20.04C7.5229 20.4989 6.90226 20.6224 6.44336 20.3154C5.35327 19.5856 4.41436 18.6467 3.68457 17.5566C3.3776 17.0977 3.50114 16.4771 3.95996 16.1699ZM18.6533 16.4443C18.9605 15.9855 19.5811 15.8628 20.04 16.1699C20.4989 16.4771 20.6224 17.0977 20.3154 17.5566C19.5856 18.6467 18.6467 19.5856 17.5566 20.3154C17.0977 20.6224 16.4771 20.4989 16.1699 20.04C15.8628 19.5811 15.9855 18.9605 16.4443 18.6533C17.3172 18.069 18.069 17.3172 18.6533 16.4443ZM2 12C2 11.3335 2.06551 10.6814 2.19043 10.0498C2.2976 9.50806 2.82349 9.15558 3.36523 9.2627C3.90698 9.36987 4.25945 9.89576 4.15234 10.4375C4.05254 10.942 4 11.4644 4 12C4 12.5356 4.05254 13.058 4.15234 13.5625C4.25945 14.1042 3.90698 14.6301 3.36523 14.7373C2.82349 14.8444 2.2976 14.4919 2.19043 13.9502C2.06551 13.3186 2 12.6665 2 12ZM20 12C20 11.3139 19.8942 10.7349 19.7178 10.248C19.5296 9.72883 19.7982 9.155 20.3174 8.9668C20.8364 8.77886 21.4094 9.04745 21.5977 9.56641C21.8614 10.2939 22 11.1063 22 12C22 12.6665 21.9345 13.3186 21.8096 13.9502C21.7024 14.4919 21.1765 14.8444 20.6348 14.7373C20.093 14.6301 19.7405 14.1042 19.8477 13.5625C19.9475 13.058 20 12.5356 20 12ZM9.03613 7.52148C9.45067 7.15655 10.0823 7.19679 10.4473 7.61133C10.8121 8.02587 10.7719 8.65756 10.3574 9.02246C9.90425 9.42148 9.60023 9.86046 9.44824 10.3164C9.27348 10.8402 8.70744 11.1229 8.18359 10.9482C7.65984 10.7735 7.37714 10.2074 7.55176 9.68359C7.83676 8.82879 8.37296 8.10536 9.03613 7.52148ZM6.44336 3.68457C6.90226 3.3776 7.5229 3.50114 7.83008 3.95996C8.13724 4.41888 8.01455 5.03945 7.55566 5.34668C6.68282 5.93103 5.93103 6.68282 5.34668 7.55566C5.03945 8.01455 4.41888 8.13724 3.95996 7.83008C3.50114 7.5229 3.3776 6.90226 3.68457 6.44336C4.41436 5.35328 5.35328 4.41436 6.44336 3.68457ZM13.3994 5.61133C14.9592 5.37078 16.6396 5.482 18.1104 6.06641C18.6232 6.27044 18.8736 6.85122 18.6699 7.36426C18.466 7.87751 17.8843 8.12875 17.3711 7.9248C16.2908 7.49563 14.9807 7.391 13.7041 7.58789C13.1583 7.67207 12.6477 7.29772 12.5635 6.75195C12.4793 6.20612 12.8536 5.69551 13.3994 5.61133ZM12 2C12.5523 2 13 2.44772 13 3C13 3.55228 12.5523 4 12 4C11.4644 4 10.942 4.05254 10.4375 4.15234C9.89576 4.25945 9.36987 3.90698 9.2627 3.36523C9.15558 2.82349 9.50806 2.2976 10.0498 2.19043C10.6814 2.06551 11.3335 2 12 2Z',
        fill: 'currentColor',
      }),
    }),
  iu = ({size = 24, ariaHidden = true, ...n}) =>
    (0, a.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...n,
      children: (0, a.jsx)('path', {
        d: 'M18 4C20.2092 4 22 5.79088 22 8V16C22 18.2092 20.2092 20 18 20H6C3.79088 20 2 18.2092 2 16V8C2 5.79087 3.79087 4 6 4H18ZM6 6C4.89543 6 4 6.89543 4 8V16C4 17.1046 4.89542 18 6 18H10V6H6ZM12 18H18C19.1046 18 20 17.1046 20 16V8C20 6.89542 19.1046 6 18 6H12V18ZM7 14C7.69037 14 8.25 14.5597 8.25 15.25C8.25 15.9403 7.69037 16.5 7 16.5C6.30963 16.5 5.75 15.9403 5.75 15.25C5.75 14.5597 6.30963 14 7 14ZM7 10.75C7.69037 10.75 8.25 11.3097 8.25 12C8.25 12.6903 7.69037 13.25 7 13.25C6.30963 13.25 5.75 12.6903 5.75 12C5.75 11.3097 6.30963 10.75 7 10.75ZM7 7.5C7.69036 7.5 8.25 8.05964 8.25 8.75C8.25 9.44036 7.69036 10 7 10C6.30964 10 5.75 9.44036 5.75 8.75C5.75 8.05964 6.30964 7.5 7 7.5Z',
        fill: 'currentColor',
      }),
    });
function $n({className, orientation = 'horizontal', ...n}) {
  return (0, a.jsx)(yi, {
    'data-slot': 'separator',
    orientation,
    className: Y(
      'bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
      className,
    ),
    ...n,
  });
}
var STEP_GROUP_LIMIT = 200; /** Consecutive steps the predicate accepts become one group (up to the limit); the rest stay single. */
function lu(e, t) {
  const n = [];
  for (const r of e) {
    const s = n.at(-1);
    t(r)
      ? s?.type === 'group' && s.steps.length < STEP_GROUP_LIMIT
        ? s.steps.push(r)
        : n.push({type: 'group', steps: [r]})
      : n.push({type: 'step', step: r});
  }
  return n.map(r => (r.type === 'group' && r.steps.length === 1 ? {type: 'step', step: r.steps[0]} : r));
} /** A tool-activity label: the first three kinds of work, then how many more. */
function toolActivityLabel(e) {
  const t = [...e].sort((o, i) => o.priority - i.priority || o.stepIndex - i.stepIndex),
    n = o => o.map(({label}, c) => (c === 0 ? label : label.charAt(0).toLowerCase() + label.slice(1))).join(', '),
    r = t.slice(0, 3),
    s = t.length - r.length;
  return {
    text: (n(r) || 'Tool activity') + (s ? ` +${s} more` : ''),
    fullText: n(t) || 'Tool activity',
    stepIndex: t[0]?.stepIndex ?? 0,
  };
}
function summaryKind(e) {
  const {summaryKind = 'tool'} = Ye(e.call.name);
  return typeof summaryKind == 'function' ? summaryKind(e) : summaryKind;
}
function Kn(e) {
  const {hide, standalone} = Ye(e.call.name);
  return hide?.(e) || (typeof standalone == 'function' ? standalone(e) : standalone)
    ? false
    : aa(e.result).length === 0;
} /** activitySummary: what a run’s finished steps did, counted (Searched 3 sites, Read from a file). */
function hu(e) {
  const t = new Map(),
    n = (r, s) => (r === 1 ? `a ${s}` : `${r} ${s}s`);
  for (const [r, s] of e.entries()) {
    if (!s.result || s.result.isError) continue;
    const o = summaryKind(s),
      i = String(s.args.path ?? s.args.file_path ?? '').replaceAll('\\', '/');
    let c = o,
      l = '',
      u = 4,
      h = s.call.id,
      d = '';
    if (o === 'skill') ((h = i || s.call.id), (d = Hi(s.call, s.result).name), (u = 2));
    else if (s.call.name === 'repl') {
      const {target, action} = Ui(s.args);
      ((c = `repl:${target}:${action}`),
        (u = ['send', 'create', 'update'].includes(action) ? 1 : target === 'code' ? 5 : 3),
        (l =
          target === 'code'
            ? 'Ran actions'
            : `${{search: 'Searched', read: 'Read from', create: 'Created content in', update: 'Updated content in', send: 'Sent via', browse: 'Browsed', other: 'Worked with'}[action]} ${target}`));
    } else if (s.call.name === 'history_search' || s.call.name === 'history_read') {
      const {action} = sa({call: s.call, result: s.result, isStreaming: false});
      ((c = `${s.call.name}:${action}`),
        (l = `${action} ${s.call.name === 'history_read' ? 'activity evidence' : 'history'}`),
        (u = o === 'read' ? 4 : 3));
    } else if (o === 'edit' || o === 'read') ((h = i || s.call.id), (u = o === 'edit' ? 1 : 4));
    else if (o === 'search') {
      ((c = s.call.name), c === 'webfetch' && (h = String(s.args.url ?? s.call.id)));
      const f = s.call.name === 'memory_search' && s.details?.skipped === 'indexing';
      (f && (c += ':skipped'),
        (l =
          s.call.name === 'memory_search'
            ? f
              ? 'Skipped memory search'
              : 'Searched memory'
            : s.call.name === 'browsing_history_search'
              ? 'Searched browsing history'
              : s.call.name === 'webfetch'
                ? 'Read web pages'
                : 'Searched the web'),
        (u = 3));
    } else ((l = o === 'browser' ? 'Browsed the web' : o === 'mcp' ? 'Used MCP tools' : 'Used tools'), (u = 5));
    let m = t.get(c);
    (m ||
      ((m = {part: {label: l, priority: u, stepIndex: r}, identities: new Set(), added: 0, removed: 0}), t.set(c, m)),
      m.identities.add(h));
    const p = m.identities.size;
    if (c === 'skill') m.part.label = p === 1 ? `Used ${d} skill` : `Used ${p} skills`;
    else if (c === 'read' || c === 'edit') {
      const f = Ye(s.call.name).diffStats?.(s);
      ((m.added += f?.addedLines ?? 0),
        (m.removed += f?.removedLines ?? 0),
        (m.part.label =
          `${c === 'read' ? 'Read' : 'Edited'} ${n(p, 'file')}` +
          (m.added || m.removed ? ` +${m.added} -${m.removed}` : '')));
    } else
      c === 'webfetch'
        ? (m.part.label = `Read ${n(p, 'web page')}`)
        : c === 'mcp'
          ? (m.part.label = p === 1 ? 'Used an MCP tool' : 'Used MCP tools')
          : c === 'tool'
            ? (m.part.label = p === 1 ? 'Used a tool' : 'Used tools')
            : c === 'command' && (m.part.label = p === 1 ? 'Ran a command' : 'Ran commands');
  }
  return toolActivityLabel([...t.values()].map(({part}) => part));
}
var /** Prompt history: ArrowUp at the start recalls earlier prompts, ArrowDown walks back. */
  promptHistory = ({getPrompts, setPrompt}) => {
    let n = -1,
      r = false;
    return El.create({
      name: 'prompt-history',
      onUpdate() {
        r || (n = -1);
      },
      addKeyboardShortcuts() {
        const s = o => {
          const {editor} = this;
          if (editor.isEmpty) n = -1;
          else if (n < 0) return false;
          if (!editor.view.endOfTextblock(o === 1 ? 'up' : 'down')) return false;
          const c = getPrompts(),
            l = n + o;
          return l < -1 || l >= c.length
            ? false
            : ((n = l), (r = true), setPrompt(c[c.length - 1 - l]), (r = false), true);
        };
        return {ArrowUp: () => s(1), ArrowDown: () => s(-1)};
      },
    });
  };
function pu(e, t) {
  return {
    activeTabTargetId: t,
    tabs: e.flatMap(n => {
      if (!n.targetId || !n.url) return [];
      if (n.url === ':' || n.url === 'about:blank') return [];
      const r = (typeof n.data.title == 'string' ? n.data.title.trim() : '') || n.url;
      return r
        ? [
            {
              createdAt: n.createdAt,
              iconUrl: n.data.iconUrl,
              latestScreenshotPath: n.data.latestScreenshotPath,
              latestScreenshotVersion: String(n.updatedAt ?? ''),
              ownership: n.ownership,
              sessionTabId: n.id,
              targetId: n.targetId,
              title: r,
              url: n.url,
              viewport: n.data.viewport,
            },
          ]
        : [];
    }),
  };
}
var g = Ns(qo(), 1) /** ComposerEditor: the page’s own editor when it provides one, or the composer’s editor. */,
  fu = e =>
    e.externalEditor
      ? (0, a.jsx)(ExternalEditorInput, {...e, externalEditor: e.externalEditor})
      : (0, a.jsx)(EditorInput, {...e}),
  ExternalEditorInput = ({
    externalEditor: {editor, controller, runtime},
    externalEditorActive = true,
    disableDrop,
    mentionMenu,
    onControllerChange,
    onSubmitStart,
  }) => {
    const {skillMention, sessionBrowserState} = jr(),
      {
        canSend,
        handleDirectories,
        handleFiles,
        handlePasteText,
        handleRichInputChange,
        registerInputController,
        runRichInputCommand,
        submitForm,
      } = ia(),
      C = (0, g.useEffectEvent)(() => handleRichInputChange(controller.getSnapshot())),
      S = (0, g.useEffectEvent)(y => {
        (registerInputController(y), onControllerChange?.(y));
      });
    return (
      (0, g.useLayoutEffect)(() => {
        (S(controller), C());
        const y = () => C();
        return (
          editor.on('update', y),
          () => {
            (editor.off('update', y), S(null));
          }
        );
      }, [controller, editor]),
      (0, g.useLayoutEffect)(() => {
        if (!externalEditorActive) return;
        const y = {...runtime.submit};
        return (
          Object.assign(runtime.submit, {enabled: true, canSubmit: canSend, onSubmit: submitForm, onSubmitStart}),
          () => {
            Object.assign(runtime.submit, y);
          }
        );
      }, [canSend, externalEditorActive, onSubmitStart, runtime, submitForm]),
      (0, g.useLayoutEffect)(() => {
        if (!externalEditorActive) return;
        const y = {...runtime.file},
          k = runtime.callbacks.onCommand;
        return (
          Object.assign(runtime.file, {
            disableDrop: !!disableDrop,
            onPasteDirectories: handleDirectories,
            onPasteFiles: handleFiles,
            onPasteText: handlePasteText,
          }),
          (runtime.callbacks.onCommand = runRichInputCommand),
          () => {
            (Object.assign(runtime.file, y), (runtime.callbacks.onCommand = k));
          }
        );
      }, [
        disableDrop,
        externalEditorActive,
        handleDirectories,
        handleFiles,
        handlePasteText,
        runRichInputCommand,
        runtime,
      ]),
      (0, g.useLayoutEffect)(() => {
        const y = {...runtime.mention};
        return (
          Object.assign(runtime.mention, {
            includeSkills: externalEditorActive,
            includeTabs: externalEditorActive,
            skills: skillMention.skills,
            skillsLoaded: skillMention.isLoaded,
            tabMentionState: sessionBrowserState,
          }),
          () => {
            Object.assign(runtime.mention, {
              includeSkills: y.includeSkills,
              includeTabs: y.includeTabs,
              skills: y.skills,
              skillsLoaded: y.skillsLoaded,
              tabMentionState: y.tabMentionState,
            });
          }
        );
      }, [externalEditorActive, runtime, sessionBrowserState, skillMention.isLoaded, skillMention.skills]),
      (0, g.useLayoutEffect)(() => {
        if (!externalEditorActive || !skillMention.isLoaded) return;
        let y = 0;
        const k = () => {
          (cancelAnimationFrame(y), (y = requestAnimationFrame(() => Tl(editor, runtime))));
        };
        (k(), editor.on('update', k));
        const M = editor.view.dom;
        return (
          M.addEventListener('compositionend', k),
          () => {
            (cancelAnimationFrame(y), editor.off('update', k), M.removeEventListener('compositionend', k));
          }
        );
      }, [editor, externalEditorActive, runtime, skillMention.isLoaded, skillMention.skills]),
      (0, g.useLayoutEffect)(
        () => (externalEditorActive ? nc(editor, runtime, mentionMenu) : void 0),
        [editor, externalEditorActive, runtime, mentionMenu],
      ),
      null
    );
  },
  EditorInput = ({
    disableDrop,
    editorClassName,
    editorOnKeyDown,
    extensions,
    mentionMenu,
    onControllerChange,
    onSubmitStart,
    placeholder,
  }) => {
    const {currentSession} = me(),
      u =
        ca(currentSession.suspension) === 'ask-user-question'
          ? currentSession.suspension?.kind === 'ask-user-question' &&
            currentSession.suspension.request.questions.length === 1 &&
            currentSession.suspension.request.questions[0]?.options.length === 0
            ? 'Write your answer'
            : 'Or write your answer to this question'
          : void 0,
      {skillMention, sessionBrowserState} = jr(),
      {
        canSend,
        disabled,
        handleDirectories,
        handleFiles,
        handlePasteText,
        handleRichInputChange,
        initialRichInputSnapshot,
        registerInputController,
        runRichInputCommand,
        submitForm,
      } = ia(),
      [M] = (0, g.useState)(() =>
        initialRichInputSnapshot.plainText &&
        skillMention.isLoaded &&
        initialRichInputSnapshot.mentions.length === 0 &&
        initialRichInputSnapshot.attachments.length === 0
          ? Ra(initialRichInputSnapshot.plainText, skillMention.skills)
          : initialRichInputSnapshot,
      ),
      w = Nt(),
      I = (0, g.useRef)(null),
      [R] = (0, g.useState)(() => [
        ...(extensions ?? []),
        promptHistory({
          getPrompts: () => sentPrompts(w.getState()),
          setPrompt: N => I.current?.setText(N?.text ?? '', {tabs: N?.tabs}),
        }),
      ]),
      j = N => {
        ((I.current = N), registerInputController(N), onControllerChange?.(N));
      };
    return (0, a.jsxs)(He, {
      disabled,
      initialSnapshot: M,
      onChange: handleRichInputChange,
      onCommand: runRichInputCommand,
      onControllerChange: j,
      children: [
        (0, a.jsx)(He.SkillMentions, {value: skillMention}),
        (0, a.jsx)(He.TabMentions, {value: sessionBrowserState}),
        (0, a.jsx)(He.FilePaste, {
          disableDrop,
          onPasteDirectories: handleDirectories,
          onPasteFiles: handleFiles,
          onPasteText: handlePasteText,
        }),
        (0, a.jsx)(He.Keymap, {onKeyDown: editorOnKeyDown}),
        (0, a.jsx)(He.SubmitOnEnter, {canSubmit: canSend, onSubmit: submitForm, onSubmitStart}),
        (0, a.jsx)(He.Editor, {
          className: editorClassName,
          extensions: R,
          mentionMenu,
          placeholder: useAuxAgentPlaceholder(u ?? placeholder),
        }),
      ],
    });
  } /** The prompts sent in a session, newest last, with their tab mentions. */,
  sentPrompts = ({turns, messageOrder, messagesByKey}) => {
    const r = new Map();
    let s = [];
    for (const o of [
      ...turns.flatMap(i => [...i.input, ...i.steeringMessages]),
      ...messageOrder.map(i => messagesByKey[i]),
    ]) {
      const i = s;
      ((s = o?.role === 'user-message-metadata' ? o.attachments : []),
        o?.role === 'steering'
          ? r.set(st(o, 0), {
              text: Ht({role: 'user', content: o.content, timestamp: o.timestamp}),
              tabs: tabMentionsOf(o.attachments),
              timestamp: o.timestamp,
            })
          : o?.role === 'user' &&
            !o.metadata?.steeringMessageId &&
            !o.metadata?.contextRecall &&
            r.set(st(o, 0), {text: Ht(o), tabs: tabMentionsOf(i), timestamp: o.timestamp}));
    }
    return [...r.values()]
      .sort((o, i) => o.timestamp - i.timestamp)
      .filter((o, i, c) => o.text && o.text !== c[i - 1]?.text);
  },
  tabMentionsOf = e => e.flatMap(t => (t.type === 'tab' ? [{...t, icon: t.faviconUrl, source: 'session-tabs'}] : [])),
  NO_TABS = [] /** useTabMentions: the open tabs a prompt can mention, and the session’s tabs. */,
  jr = ({enabled = true, includeTabs = true} = {}) => {
    const {currentSession} = me(),
      {accountId} = ge(),
      s = Ce(),
      o = yl({resetKey: currentSession.id}) && enabled,
      i = wc({projectId: currentSession.projectId, enabled: o}),
      {data} = Fe(
        s.sessions.tabs.list.queryOptions(
          {sessionId: currentSession.id, accountId},
          {enabled: o && includeTabs && !!currentSession.id},
        ),
      ),
      l = data ?? NO_TABS,
      u = (0, g.useMemo)(
        () => ({...pu(l, currentSession.activeTabTargetId), accountId}),
        [accountId, currentSession.activeTabTargetId, l],
      );
    return (0, g.useMemo)(() => ({sessionBrowserState: u, skillMention: i}), [u, i]);
  } /** AddMenu: the + menu for photos and files, a folder, and the composer’s options. */,
  Cu = ({className, children, mode, onModeChange}) => {
    const {fileInputRef, disabled, handleDirectories, handleFileChange} = At(),
      l = async () => {
        try {
          const u = await Js({method: 'Aux.pickDirectory', params: {prompt: 'Attach a folder to this chat'}});
          if (u.status === 'cancelled') return;
          if (u.status === 'unavailable' || !u.path) {
            de.error('Folder picker is not available on this device.');
            return;
          }
          handleDirectories([u.path]);
        } catch (u) {
          (de.error('There was an error opening the folder picker.'), console.error(u));
        }
      };
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsx)('input', {
          accept: Hl,
          className: 'hidden',
          disabled,
          multiple: true,
          onChange: handleFileChange,
          ref: fileInputRef,
          tabIndex: -1,
          type: 'file',
        }),
        (0, a.jsxs)(It, {
          children: [
            (0, a.jsx)(Vt, {
              render: (0, a.jsx)(J, {
                'aria-label': 'Composer options',
                className: Y('text-muted-foreground', className),
                'data-testid': 'attachments-button',
                size: 'icon-sm',
                variant: 'secondary',
                shape: 'pill',
                disabled,
              }),
              children: (0, a.jsx)(nl, {className: 'size-4'}),
            }),
            (0, a.jsxs)(gt, {
              align: 'start',
              size: 'sm',
              children: [
                (0, a.jsxs)(ft, {children: [children, mode && (0, a.jsx)(IncognitoToggle, {mode, onModeChange})]}),
                (0, a.jsx)(_t, {}),
                (0, a.jsxs)(ft, {
                  children: [
                    (0, a.jsxs)(We, {
                      onClick: () => fileInputRef.current?.click(),
                      children: [
                        (0, a.jsx)(Li, {className: 'text-muted-foreground'}),
                        (0, a.jsx)('span', {children: 'Upload photos, videos & files'}),
                      ],
                    }),
                    (0, a.jsxs)(We, {
                      onClick: l,
                      children: [
                        (0, a.jsx)(or, {className: 'text-muted-foreground'}),
                        (0, a.jsx)('span', {children: 'Attach folder'}),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  } /** The incognito toggle in the + menu. */,
  IncognitoToggle = ({mode, onModeChange}) => {
    const {isStreaming} = xt(),
      r = o => onModeChange?.(o ? 'incognito' : 'default'),
      s = (o, i) => {
        o && i.reason === 'trigger-focus' && i.cancel();
      };
    return (0, a.jsxs)(Ae, {
      onOpenChange: s,
      children: [
        (0, a.jsxs)(Pe, {
          render: (0, a.jsx)(Us, {
            checked: mode === 'incognito',
            onCheckedChange: r,
            disabled: isStreaming || !onModeChange,
          }),
          children: [
            (0, a.jsx)(Da, {className: 'text-muted-foreground'}),
            (0, a.jsx)('span', {className: 'grow', children: 'Incognito mode'}),
          ],
        }),
        (0, a.jsx)(Ie, {
          side: 'right',
          className: 'w-60 text-pretty',
          children: (0, a.jsxs)('div', {
            className: 'space-y-0.5',
            children: [
              (0, a.jsx)('p', {
                children: 'If you enable incognito mode, your browsing history and memory will not be used.',
              }),
              (0, a.jsx)('p', {
                className: 'text-muted-foreground',
                children: 'Task session will be expired after 30 days.',
              }),
            ],
          }),
        }),
      ],
    });
  } /** SendButton: Send, or Stop while the agent works. */,
  wu = ({className}) => {
    const {disabled, isStreaming, canSend, uploadQueue, stop, responseSubmitLabel} = xt(),
      c = disabled || uploadQueue.length > 0 || !canSend,
      l = () => {
        stop();
      };
    return isStreaming && !canSend
      ? (0, a.jsxs)(Ae, {
          children: [
            (0, a.jsx)(Ie, {children: 'Stop'}),
            (0, a.jsx)(Pe, {
              render: (0, a.jsx)(J, {
                'aria-label': 'Stop',
                className: Y('transition-none', className),
                size: 'icon-sm',
                shape: 'pill',
                'data-testid': 'stop-button',
                type: 'button',
                onClick: l,
              }),
              children: (0, a.jsx)(Ei, {className: 'text-primary-foreground'}),
            }),
          ],
        })
      : (0, a.jsxs)(Ae, {
          disabled: c,
          children: [
            (0, a.jsxs)(Ie, {children: [responseSubmitLabel ?? 'Send', (0, a.jsx)(ja, {children: '⏎'})]}),
            (0, a.jsx)(Pe, {
              render: (0, a.jsx)(J, {
                'aria-label': responseSubmitLabel ?? 'Send',
                className: Y('transition-none', className),
                'data-testid': 'send-button',
                disabled: c,
                size: responseSubmitLabel ? 'sm' : 'icon-sm',
                shape: 'pill',
                type: 'submit',
              }),
              children: responseSubmitLabel ?? (0, a.jsx)(SendIcon, {className: 'size-4.5'}),
            }),
          ],
        });
  },
  xn = (0, g.createContext)(null),
  auxDictation = insert => {
    const api = typeof chrome < 'u' ? chrome.auxBrowserPreferences : void 0,
      [status, setStatus] = (0, g.useState)('idle'),
      [listening, setListening] = (0, g.useState)(false),
      [error, setError] = (0, g.useState)(null),
      phase = (0, g.useRef)('idle'),
      inserter = (0, g.useRef)(insert);
    inserter.current = insert;
    const move = next => {
        ((phase.current = next), setStatus(next), setListening(false));
      },
      start = (0, g.useCallback)(async () => {
        if (phase.current !== 'idle') return;
        (setError(null), move('recording'));
        try {
          (await api.startDictation(), phase.current === 'recording' && setListening(true));
        } catch (e) {
          phase.current === 'recording' && (move('idle'), setError(e?.message || "Dictation couldn't start."));
        }
      }, [api]),
      finish = (0, g.useCallback)(
        async keep => {
          if (phase.current !== 'recording') return;
          move(keep ? 'transcribing' : 'idle');
          try {
            const text = (await api.stopDictation()).trim();
            keep && (text ? inserter.current(text) : setError('Nothing was heard. Try again.'));
          } catch (e) {
            keep && setError(e?.message || 'Dictation failed.');
          } finally {
            keep && move('idle');
          }
        },
        [api],
      );
    (0, g.useEffect)(
      () => () => {
        phase.current === 'recording' && api.stopDictation().catch(() => {});
      },
      [api],
    );
    return {
      supported: typeof api?.startDictation == 'function',
      status,
      stream: listening || null,
      error,
      start,
      cancel: () => finish(false),
      confirm: () => finish(true),
      warmMic: () => {},
    };
  } /** DictationProvider: dictation into the editor, through the browser’s speech service. */,
  Su = ({children}) => {
    const {text, insertText} = Tt(),
      [r, s] = (0, g.useState)(null);
    (0, g.useEffect)(() => s(null), [text]);
    const o = auxDictation(insertText);
    return (
      (0, g.useEffect)(() => {
        o.error && de.error(o.error);
      }, [o.error]),
      (0, a.jsx)(xn, {
        value: o.supported ? {...o, hasLiveText: r} : null,
        children: (0, a.jsx)('div', {
          className: 'contents',
          onInputCapture: i => {
            const c = i.target;
            c instanceof HTMLElement && c.isContentEditable && s((c.textContent?.length ?? 0) > 0);
          },
          children,
        }),
      })
    );
  },
  Pu = ({children}) => {
    const t = (0, g.useContext)(xn);
    return t && t.status !== 'idle' ? null : children;
  },
  ku = ({children, primary = false}) => {
    const n = (0, g.useContext)(xn),
      {disabled} = xt(),
      s = () => {
        n?.confirm();
      },
      o = () => {
        n?.start();
      };
    return n && n.status !== 'idle'
      ? (0, a.jsx)(jc, {status: n.status, stream: n.stream, onCancel: n.cancel, onConfirm: s})
      : (0, a.jsxs)('div', {
          className: 'flex items-center gap-1',
          children: [
            n &&
              (0, a.jsxs)(Ae, {
                children: [
                  (0, a.jsx)(Ie, {children: 'Dictate'}),
                  (0, a.jsx)(Pe, {
                    render: (0, a.jsx)(J, {
                      'aria-label': 'Dictate',
                      className: Y('transition-none', !primary && 'text-muted-foreground'),
                      disabled,
                      size: 'icon-sm',
                      shape: 'pill',
                      type: 'button',
                      variant: primary ? 'default' : 'ghost',
                      onPointerDown: n.warmMic,
                      onClick: o,
                    }),
                    children: (0, a.jsx)(au, {className: 'size-4'}),
                  }),
                ],
              }),
            children,
          ],
        });
  },
  Mu = () => {
    const e = (0, g.useContext)(xn),
      {isStreaming} = xt(),
      {text} = Tt(),
      {attachments, uploadQueue} = At(),
      o = (e?.hasLiveText ?? text.length > 0) || attachments.some(i => i.type !== 'tab') || uploadQueue.length > 0;
    return (0, a.jsx)(ku, {primary: !o && !isStreaming, children: (o || isStreaming) && (0, a.jsx)(wu, {})});
  },
  InputForm = ({className, ...t}) =>
    (0, a.jsx)('form', {
      className,
      ...t,
    }) /** InputProvider: the composer’s draft, attachments, sending and dictation. */,
  Iu = ({
    autoFocus,
    children,
    sessionId,
    draftScopeKey,
    sendMessage: s,
    prepareOutgoingMessage,
    runCommand,
    stop,
    confirmSubmit,
    onSubmitWhileResponding,
    appendSubmittedMessageWhileResponding,
    isSidepanel,
    draftPersistence,
  }) => {
    const {status, sendMessage, interrupt, setMessages} = ot(),
      {mode} = _l(),
      C = draftPersistence?.scopeKey ?? sessionId ?? draftScopeKey,
      S = !!isSidepanel && (sessionId === void 0 || mode === 'keep-session'),
      y = (0, g.useMemo)(() => {
        if (!(!draftPersistence && !C)) return {...draftPersistence, scopeKey: C};
      }, [draftPersistence, C]);
    return (0, a.jsx)(Wi, {
      autoFocus,
      status,
      sendMessage: s ?? sendMessage,
      prepareOutgoingMessage,
      runCommand,
      setMessages,
      stop: stop ?? interrupt,
      confirmSubmit,
      onSubmitWhileResponding,
      appendSubmittedMessageWhileResponding,
      isSidepanel: S,
      draftPersistence: y,
      children,
    });
  },
  Au = ({className, children}) => {
    const {submitForm} = xt();
    return (0, a.jsx)('div', {
      className: Y('relative z-10 mb-0.5 flex w-full shrink-0 flex-col gap-4', className),
      'data-chat-input-form': '',
      children: (0, a.jsx)(InputForm, {
        onSubmit: r => {
          (r.preventDefault(), submitForm());
        },
        children,
      }),
    });
  }
