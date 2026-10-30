/* Aux-owned source: the channel chat view (assets/conversation-D9Q3VEsl.js). Its exports keep their
 * chunk names: $s Conversation, Ts Composer, Ms TaskCard, Me the chat context, Ss the Main channel,
 * Es the pending-request link, As and _s placeholders. Everything between the chunk's imports and
 * its export is here; nothing bundled is third-party.
 *
 * Imports used here (the import statement above stays as supplied):
 *   browser-color-scheme: Ze JSX runtime, Se interop, Be React, Ve react-dom, I cn
 *   schemas (zod): z object, j string, F enum, re array, gt discriminatedUnion, oe literal, vt boolean, we number
 *   strip-markdown: de account token, We host URL, Z cloud origin, Ge Badge, Ke paperclip icon, H useReducedMotion,
 *     Qe RelativeTime, Le Input, Xe/Ye/et Popover root/trigger/content, K Skeleton, Je plain-text preview
 *   tooltip: xt Tooltip, pt TooltipTrigger, ft TooltipContent; button A Button; kbd be Kbd; dist B toast
 *   react-Da396Co4 V motion; AnimatePresence wt; link ce Link; translate-status qe useTheme
 *   error-tracking Fe spinner, He copy icon; tag-icon tt/st channel icons and colours
 *   tool-definition-registry it toolFor, nt toolInput, ge renderToolPart; draft-artifacts Y bubble tail, lt image grid
 *   markdown ue Markdown, ut remark plugins; message mt message renderer; file-attachments jt accept list,
 *   Ct readAttachment; voice-dictation ct useDictation, dt dictation controls; file-icon ot; arrow-up rt;
 *   arrow-corner-down-left at; cross-small ve
 * Aux changes: the unread line uses the brand colour token instead of a fixed blue, and the task
 * cards' bg-card now paints (the utility was never compiled; see styles/utilities.css). */
var jsxRuntime = Ze(),
  ArrowDownIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M12 21C11.6022 21 11.2207 20.842 10.9394 20.5607L5.43934 15.0607C4.85355 14.4749 4.85355 13.5251 5.43934 12.9393C6.02512 12.3536 6.97487 12.3536 7.56066 12.9393L10.5 15.8787V4.5C10.5 3.67157 11.1716 3 12 3C12.8284 3 13.5 3.67157 13.5 4.5V15.8787L16.4393 12.9393C17.0251 12.3536 17.9749 12.3536 18.5607 12.9393C19.1464 13.5251 19.1464 14.4749 18.5607 15.0607L13.0607 20.5607C12.7794 20.842 12.3978 21 12 21Z',
        fill: 'currentColor',
      }),
    }),
  CheckIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M17.6585 7.24744C18.0741 7.61112 18.1163 8.24288 17.7526 8.65852L10.7526 16.6585C10.5703 16.8668 10.3099 16.9902 10.0333 16.9995C9.75666 17.0087 9.4886 16.9028 9.29289 16.7071L6.29289 13.7071C5.90237 13.3166 5.90237 12.6834 6.29289 12.2929C6.68342 11.9024 7.31658 11.9024 7.70711 12.2929L9.95129 14.5371L16.2474 7.34151C16.6111 6.92587 17.2429 6.88375 17.6585 7.24744Z',
        fill: 'currentColor',
      }),
    }),
  ChevronRightIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M8.29289 3.29289C8.68342 2.90237 9.31658 2.90237 9.70711 3.29289L15.5858 9.17156C17.1479 10.7337 17.1479 13.2663 15.5858 14.8284L9.70711 20.7071C9.31658 21.0976 8.68342 21.0976 8.29289 20.7071C7.90237 20.3166 7.90237 19.6834 8.29289 19.2929L14.1716 13.4142C14.9526 12.6331 14.9526 11.3668 14.1716 10.5858L8.29289 4.70711C7.90237 4.31658 7.90237 3.68342 8.29289 3.29289Z',
        fill: 'currentColor',
      }),
    }),
  CompletedIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12ZM14.2256 8.86719C14.5752 8.4399 15.2054 8.3763 15.6328 8.72559C16.0601 9.07518 16.1237 9.70538 15.7744 10.1328L11.2744 15.6328C11.0955 15.8515 10.832 15.985 10.5498 15.999C10.2676 16.0131 9.99274 15.9068 9.79297 15.707L7.79297 13.707C7.40244 13.3165 7.40244 12.6835 7.79297 12.293C8.18349 11.9024 8.81651 11.9024 9.20703 12.293L10.4248 13.5107L14.2256 8.86719ZM22 12C22 17.5229 17.5229 22 12 22C6.47716 22 2 17.5229 2 12C2 6.47716 6.47716 2 12 2C17.5229 2 22 6.47716 22 12Z',
        fill: 'currentColor',
      }),
    }),
  StartingIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M13.3418 19.8877C13.8864 19.7958 14.4023 20.1634 14.4941 20.708C14.5859 21.2525 14.2193 21.7684 13.6748 21.8604C13.1296 21.9523 12.5699 22 12 22C11.4301 22 10.8704 21.9523 10.3252 21.8604C9.78072 21.7684 9.41409 21.2525 9.50586 20.708C9.59775 20.1634 10.1136 19.7958 10.6582 19.8877C11.0939 19.9612 11.542 20 12 20C12.458 20 12.9061 19.9612 13.3418 19.8877ZM4.08008 16.3936C4.53023 16.0736 5.15464 16.1788 5.47461 16.6289C5.9959 17.3623 6.63773 18.0041 7.37109 18.5254C7.82125 18.8454 7.92642 19.4698 7.60645 19.9199C7.28647 20.3701 6.66206 20.4752 6.21191 20.1553C5.29646 19.5045 4.49552 18.7035 3.84473 17.7881C3.52476 17.3379 3.62995 16.7135 4.08008 16.3936ZM18.5254 16.6289C18.8454 16.1788 19.4698 16.0736 19.9199 16.3936C20.3701 16.7135 20.4762 17.3379 20.1562 17.7881C19.5053 18.7039 18.7039 19.5053 17.7881 20.1562C17.3379 20.4762 16.7135 20.3701 16.3936 19.9199C16.0736 19.4698 16.1788 18.8454 16.6289 18.5254C17.3623 18.0041 18.0041 17.3623 18.5254 16.6289ZM2 12C2 11.4301 2.04766 10.8704 2.13965 10.3252C2.23158 9.78073 2.74751 9.41409 3.29199 9.50586C3.83658 9.59775 4.20419 10.1136 4.1123 10.6582C4.0388 11.0939 4 11.542 4 12C4 12.458 4.0388 12.9061 4.1123 13.3418C4.20419 13.8864 3.83658 14.4023 3.29199 14.4941C2.74751 14.5859 2.23157 14.2193 2.13965 13.6748C2.04766 13.1296 2 12.5699 2 12ZM20 12C20 11.542 19.9612 11.0939 19.8877 10.6582C19.7958 10.1136 20.1634 9.59775 20.708 9.50586C21.2525 9.41409 21.7684 9.78073 21.8604 10.3252C21.9523 10.8704 22 11.4301 22 12C22 12.5699 21.9523 13.1296 21.8604 13.6748C21.7684 14.2193 21.2525 14.5859 20.708 14.4941C20.1634 14.4023 19.7958 13.8864 19.8877 13.3418C19.9612 12.9061 20 12.458 20 12ZM6.21191 3.84473C6.66206 3.52476 7.28647 3.62995 7.60645 4.08008C7.92642 4.53023 7.82125 5.15464 7.37109 5.47461C6.63773 5.9959 5.9959 6.63773 5.47461 7.37109C5.15464 7.82125 4.53023 7.92642 4.08008 7.60645C3.62995 7.28647 3.52476 6.66206 3.84473 6.21191C4.49551 5.29646 5.29646 4.49551 6.21191 3.84473ZM16.3936 4.08008C16.7135 3.62995 17.3379 3.52476 17.7881 3.84473C18.7035 4.49552 19.5045 5.29646 20.1553 6.21191C20.4752 6.66206 20.3701 7.28647 19.9199 7.60645C19.4698 7.92642 18.8454 7.82125 18.5254 7.37109C18.0041 6.63773 17.3623 5.9959 16.6289 5.47461C16.1788 5.15464 16.0736 4.53023 16.3936 4.08008ZM12 2C12.5699 2 13.1296 2.04766 13.6748 2.13965C14.2193 2.23157 14.5859 2.7475 14.4941 3.29199C14.4023 3.83658 13.8864 4.20419 13.3418 4.1123C12.9061 4.0388 12.458 4 12 4C11.542 4 11.0939 4.0388 10.6582 4.1123C10.1136 4.20419 9.59775 3.83658 9.50586 3.29199C9.41409 2.74751 9.78073 2.23158 10.3252 2.13965C10.8704 2.04766 11.4301 2 12 2Z',
        fill: 'currentColor',
      }),
    }),
  FailedIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12ZM14.293 8.29297C14.6835 7.90244 15.3165 7.90244 15.707 8.29297C16.0976 8.68349 16.0976 9.31651 15.707 9.70703L13.4141 12L15.707 14.293C16.0976 14.6835 16.0976 15.3165 15.707 15.707C15.3165 16.0976 14.6835 16.0976 14.293 15.707L12 13.4141L9.70703 15.707C9.31651 16.0976 8.68349 16.0976 8.29297 15.707C7.90244 15.3165 7.90244 14.6835 8.29297 14.293L10.5859 12L8.29297 9.70703C7.90244 9.31651 7.90244 8.68349 8.29297 8.29297C8.68349 7.90244 9.31651 7.90244 9.70703 8.29297L12 10.5859L14.293 8.29297ZM22 12C22 17.5229 17.5229 22 12 22C6.47716 22 2 17.5229 2 12C2 6.47716 6.47716 2 12 2C17.5229 2 22 6.47716 22 12Z',
        fill: 'currentColor',
      }),
    }),
  CloseIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M7.18934 7.18934C7.77513 6.60355 8.72487 6.60355 9.31066 7.18934L12 9.87868L14.6893 7.18934C15.2751 6.60355 16.2249 6.60355 16.8107 7.18934C17.3964 7.77513 17.3964 8.72487 16.8107 9.31066L14.1213 12L16.8107 14.6893C17.3964 15.2751 17.3964 16.2249 16.8107 16.8107C16.2249 17.3964 15.2751 17.3964 14.6893 16.8107L12 14.1213L9.31066 16.8107C8.72487 17.3964 7.77513 17.3964 7.18934 16.8107C6.60355 16.2249 6.60355 15.2751 7.18934 14.6893L9.87868 12L7.18934 9.31066C6.60355 8.72487 6.60355 7.77513 7.18934 7.18934Z',
        fill: 'currentColor',
      }),
    }),
  ReactionIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M12 2C12.5523 2 13 2.44772 13 3C13 3.55228 12.5523 4 12 4C11.6989 4 11.4021 4.01659 11.1104 4.04883C7.11146 4.49088 4 7.88285 4 12C4 16.4183 7.58172 20 12 20C16.1172 20 19.5091 16.8886 19.9512 12.8896C19.9834 12.598 20 12.3011 20 12C20 11.4477 20.4477 11 21 11C21.5523 11 22 11.4477 22 12C22 12.3747 21.9798 12.7455 21.9395 13.1104C21.3864 18.1112 17.1479 22 12 22C6.47716 22 2 17.5229 2 12C2 6.8522 5.88885 2.61357 10.8896 2.06055C11.2544 2.02022 11.6252 2 12 2ZM15.4521 13.7871C15.6433 13.7525 15.839 13.7924 15.998 13.8994C16.1571 14.0066 16.268 14.1739 16.3076 14.3643C16.3473 14.5547 16.3117 14.7522 16.2158 14.9189C16.1309 15.0628 16.0405 15.2001 15.9404 15.335C15.0506 16.5568 13.5165 17.288 12.002 17.2754C10.4873 17.2853 8.95708 16.5539 8.06543 15.3359C7.96516 15.2014 7.87435 15.0644 7.78906 14.9209C7.6928 14.7545 7.65626 14.5567 7.69531 14.3662C7.73434 14.1758 7.84513 14.0092 8.00391 13.9014C8.16271 13.7937 8.35841 13.7529 8.5498 13.7871C8.74131 13.8212 8.9121 13.9279 9.03125 14.0791C9.1055 14.1707 9.18187 14.2558 9.2627 14.3389C9.98307 15.0825 10.988 15.4753 12.0039 15.4746C13.0197 15.4767 14.0237 15.0851 14.7412 14.3408C14.8217 14.2578 14.8979 14.1727 14.9717 14.0811C15.0904 13.9296 15.2607 13.8218 15.4521 13.7871ZM9.25 8C10.0784 8 10.75 8.79582 10.75 9.90039C10.7498 11.0048 10.0783 11.75 9.25 11.75C8.42167 11.75 7.75016 11.0048 7.75 9.90039C7.75 8.79582 8.42157 8 9.25 8ZM14.75 8C15.5784 8 16.25 8.79582 16.25 9.90039C16.2498 11.0048 15.5783 11.75 14.75 11.75C13.9217 11.75 13.2502 11.0048 13.25 9.90039C13.25 8.79582 13.9216 8 14.75 8ZM19 1C19.5523 1 20 1.44772 20 2V4H22C22.5523 4 23 4.44772 23 5C23 5.55228 22.5523 6 22 6H20V8C20 8.55228 19.5523 9 19 9C18.4477 9 18 8.55228 18 8V6H16C15.4477 6 15 5.55228 15 5C15 4.44772 15.4477 4 16 4H18V2C18 1.44772 18.4477 1 19 1Z',
        fill: 'currentColor',
      }),
    }),
  MicIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M11.001 21V19.9463C7.44776 19.5757 5.30031 17.2753 4.17674 15.5439C3.87636 15.0807 4.00849 14.4617 4.47167 14.1611C4.93491 13.8607 5.5539 13.9929 5.85448 14.4561C6.89411 16.0579 8.80126 17.9999 12.001 18C15.2009 18 17.1088 16.058 18.1484 14.4561C18.4491 13.9928 19.068 13.8606 19.5312 14.1611C19.9944 14.4617 20.1264 15.0807 19.8262 15.5439C18.7025 17.2754 16.5545 19.5759 13.001 19.9463V21C13.001 21.5523 12.5532 22 12.001 22C11.4488 21.9998 11.001 21.5522 11.001 21ZM15.001 7C15.001 5.34315 13.6578 4 12.001 4C10.3442 4.00018 9.00096 5.34326 9.00096 7V11C9.00096 12.6567 10.3443 13.9998 12.001 14C13.6578 14 15.001 12.6568 15.001 11V7ZM17.001 11C17.001 13.7614 14.7623 16 12.001 16C9.23967 15.9998 7.00096 13.7613 7.00096 11V7C7.00096 4.23868 9.23968 2.00018 12.001 2C14.7623 2 17.001 4.23857 17.001 7V11Z',
        fill: 'currentColor',
      }),
    }),
  AttentionIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M7 3C8.65685 3 10 4.34315 10 6V18C10 19.6569 8.65685 21 7 21C5.34315 21 4 19.6569 4 18V6C4 4.34315 5.34315 3 7 3ZM17 3C18.6569 3 20 4.34315 20 6V18C20 19.6569 18.6569 21 17 21C15.3431 21 14 19.6569 14 18V6C14 4.34315 15.3431 3 17 3ZM7 5C6.44771 5 6 5.44771 6 6V18C6 18.5523 6.44771 19 7 19C7.55229 19 8 18.5523 8 18V6C8 5.44771 7.55229 5 7 5ZM17 5C16.4477 5 16 5.44771 16 6V18C16 18.5523 16.4477 19 17 19C17.5523 19 18 18.5523 18 18V6C18 5.44771 17.5523 5 17 5Z',
        fill: 'currentColor',
      }),
    }),
  React = Se(Be(), 1),
  channelSchema = z({
    id: j().min(1).max(128),
    name: j().trim().min(1).max(100),
    icon: F(tt),
    color: F(st),
    instructions: j().max(2e4).default(''),
    isMain: vt().optional(),
  }),
  Ss = {id: 'main', name: 'Main', icon: 'annotation', color: 'mono', instructions: ''},
  channelEnvironmentSchema = gt('type', [z({type: oe('cloud')}), z({type: oe('device'), hostId: j().min(1).max(128)})]),
  channelAttachmentSchema = z({
    id: j().uuid(),
    type: oe('file'),
    name: j().min(1).max(255),
    mimeType: j().min(1).max(255),
    path: j()
      .max(1024)
      .refine(
        path =>
          path.startsWith('./attachments/channel/') &&
          !!parseChannelAttachmentPath(path) &&
          !path.split('/').includes('..'),
        'Invalid channel attachment path.',
      )
      .optional(),
    data: j().max(14e6).optional(),
  }); /** A channel attachment path: ./attachments/channel/<channel>/<message>/<attachment>/<name>. */
function parseChannelAttachmentPath(path) {
  const match = /(?:^|\/)attachments\/channel\/([a-f0-9-]{36})\/([a-f0-9-]{36})\/([a-f0-9-]{36})\/([^/]+)$/.exec(path);
  return !match || /[\\\x00]/.test(match[4]) || ['.', '..'].includes(match[4])
    ? null
    : {channelId: match[1], messageId: match[2], attachmentId: match[3], suffix: match.slice(1).join('/')};
}
var outgoingMessageSchema = z({
  id: j().uuid(),
  text: j().trim().max(1e5),
  attachments: re(
    channelAttachmentSchema.omit({path: true}).extend({
      data: j()
        .max(14e6)
        .refine(value => value.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$(?![\s\S])/.test(value), 'Invalid base64.'),
    }),
  )
    .max(8)
    .optional(),
  replyTo: j().max(256).optional(),
})
  .refine(message => !!message.text || !!message.attachments?.length, 'Add a message or attachment.')
  .refine(
    message =>
      new Set(message.attachments?.map(attachment => attachment.id)).size === (message.attachments?.length ?? 0),
    'Attachment IDs must be unique.',
  )
  .refine(
    message =>
      (message.attachments?.reduce((total, attachment) => total + attachment.data.length, 0) ?? 0) <=
      Math.ceil(20971520 / 3) * 4 + 32,
    'Use up to 20 MB total.',
  ); /** An aux:task/<task>/files/<tmp|artifacts|output|workspace>/… link, or null. */
function parseTaskFileUrl(url) {
  const match = /^aux:task\/([^/]+)\/files\/(.+)$/.exec(url);
  if (!match) return null;
  let path;
  try {
    path = decodeURIComponent(match[2]);
  } catch {
    return null;
  }
  return !/^(tmp|artifacts|output|workspace)\//.test(path) || path.split('/').includes('..') || /[\\\x00]/.test(path)
    ? null
    : {taskId: match[1], path};
}
var mediaUrlSchema = j()
    .min(1)
    .max(4e3)
    .refine(url => {
      if (parseTaskFileUrl(url)) return true;
      try {
        return new URL(url).protocol === 'https:';
      } catch {
        return false;
      }
    }, 'Use an HTTPS URL or aux:task/TASK_ID/files/tmp-or-artifacts-path.'),
  assistantMessageSchema = z({
    type: F(['text', 'attachment', 'widget']),
    content: j().trim().min(1).max(1e5).optional(),
    images: re(z({url: mediaUrlSchema, alt: j().max(1e3).optional()}))
      .min(1)
      .max(8)
      .optional(),
    url: mediaUrlSchema.optional(),
    alt: j().max(1e3).optional(),
    mediaType: F(['image', 'video', 'audio', 'file']).optional(),
    widget: z({
      prompt: j().trim().min(1).max(2e3),
      helpText: j().max(4e3).optional(),
      vaultUnlock: z({sessionId: j().min(1), toolCallId: j().min(1)}).optional(),
      options: re(
        z({
          label: j().trim().min(1).max(200),
          value: j().trim().min(1).max(2e3).optional(),
          description: j().max(1e3).optional(),
        }),
      )
        .min(1)
        .max(6),
    }).optional(),
    kind: F(['progress', 'final', 'question']).default('final'),
    replyTo: j().max(256).optional(),
  }).superRefine((message, context) => {
    const field = message.type === 'text' ? 'content' : message.type === 'attachment' ? 'url' : 'widget';
    message[field] ||
      context.addIssue({code: 'custom', path: [field], message: `${field} is required for ${message.type}.`});
    for (const key of ['content', 'images', 'url', 'alt', 'mediaType', 'widget']) {
      const allowed =
        message.type === 'text'
          ? ['content', 'images']
          : message.type === 'attachment'
            ? ['url', 'alt', 'mediaType']
            : ['widget'];
      message[key] !== void 0 &&
        !allowed.includes(key) &&
        context.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is not supported for ${message.type}. Send it in a separate message.`,
        });
    }
  }),
  Me = (0, React.createContext)({
    accountId: 0,
    tasks: [],
  }); /** An image, video, audio clip or file from a message. Task and channel files are fetched with the account token. */
function Attachment({url, alt, mediaType = 'image'}) {
  const {accountId, tasks} = (0, React.useContext)(Me),
    taskFile = parseTaskFileUrl(url),
    channelFile = parseChannelAttachmentPath(url),
    task = tasks.find(candidate => candidate.id === taskFile?.taskId),
    taskHost = task
      ? We(
          task.environment.type === 'cloud'
            ? {kind: 'cloud', rootSessionId: task.id}
            : {kind: 'remote', hostId: task.environment.hostId},
          Z,
        )
      : null,
    fetchUrl = channelFile
      ? `${Z}/channel-chat/channels/${channelFile.channelId}/messages/${channelFile.messageId}/attachments/${channelFile.attachmentId}`
      : taskHost && taskFile
        ? `${taskHost}/sessions/${encodeURIComponent(taskFile.taskId)}/files/content?${new URLSearchParams({path: taskFile.path})}`
        : null,
    [loaded, setLoaded] = (0, React.useState)(),
    [failedUrl, setFailedUrl] = (0, React.useState)();
  (0, React.useEffect)(() => {
    if (!fetchUrl) return;
    const controller = new AbortController();
    let objectUrl;
    return (
      (async () => {
        const response = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: {authorization: `Bearer ${await de(accountId)}`},
        });
        if (!response.ok) throw new Error('Attachment unavailable');
        const blob = await response.blob();
        controller.signal.aborted ||
          ((objectUrl = URL.createObjectURL(blob)), setLoaded({source: url, url: objectUrl}));
      })().catch(() => {
        controller.signal.aborted || setFailedUrl(url);
      }),
      () => {
        (controller.abort(), objectUrl && URL.revokeObjectURL(objectUrl));
      }
    );
  }, [accountId, fetchUrl, url]);
  const src = taskFile || channelFile ? (loaded?.source === url ? loaded.url : void 0) : url;
  return failedUrl === url || (taskFile && !task)
    ? (0, jsxRuntime.jsx)('p', {
        role: 'status',
        className: 'text-muted-foreground text-xs',
        children: 'Attachment unavailable',
      })
    : src
      ? mediaType === 'image'
        ? (0, jsxRuntime.jsx)(lt, {
            images: [{src, alt}],
            imageClassName: 'aspect-auto max-h-96 rounded-lg object-contain',
          })
        : mediaType === 'video'
          ? (0, jsxRuntime.jsx)('video', {
              controls: true,
              src,
              'aria-label': alt || 'Video attachment',
              className: 'max-h-96 max-w-full rounded-lg',
            })
          : mediaType === 'audio'
            ? (0, jsxRuntime.jsx)('audio', {
                controls: true,
                src,
                'aria-label': alt || 'Audio attachment',
                className: 'max-w-full',
              })
            : (0, jsxRuntime.jsx)('a', {
                href: src,
                download: channelFile || url.startsWith('data:') ? alt : taskFile?.path.split('/').at(-1),
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'underline',
                children: alt || 'Open attachment',
              })
      : (0, jsxRuntime.jsx)('p', {
          role: 'status',
          className: 'text-muted-foreground text-xs',
          children: 'Loading attachment…',
        });
}
var TASK_STATUS = {
  pending: {label: 'Starting', icon: StartingIcon},
  running: {label: 'Working', icon: Fe},
  suspended: {label: 'Needs attention', icon: AttentionIcon},
  idle: {label: 'Completed', icon: CompletedIcon},
  errored: {label: 'Failed', icon: FailedIcon},
  dispatch_failed: {label: 'Could not start', icon: FailedIcon},
  interrupted: {label: 'Interrupted', icon: AttentionIcon},
  aborted: {label: 'Stopped', icon: FailedIcon},
};
function taskStatus(status) {
  return TASK_STATUS[status] ?? {label: 'Unknown status', icon: StartingIcon};
}
function TaskStatusIcon({status}) {
  const {icon: Icon} = taskStatus(status);
  return (0, jsxRuntime.jsx)(Icon, {
    'aria-hidden': true,
    className: I(
      'size-4 shrink-0 motion-reduce:animate-none',
      status === 'running' ? 'text-brand-content' : 'text-muted-foreground',
      ['errored', 'dispatch_failed'].includes(status) && 'text-destructive',
    ),
  });
} /** A task card: status, title, live tool calls while running, the preview, where it runs and its model. */
function TaskSummary({task}) {
  const preview = task.preview,
    status = preview?.status ?? task.status,
    unread =
      status === 'idle' && preview && (!preview.readAt || Date.parse(preview.readAt) < Date.parse(preview.updatedAt));
  return (0, jsxRuntime.jsxs)('span', {
    className: 'flex min-w-0 flex-col gap-3 text-left',
    children: [
      (0, jsxRuntime.jsxs)('span', {
        className: 'flex min-w-0 items-start gap-2',
        children: [
          (0, jsxRuntime.jsx)('span', {className: 'pt-0.5', children: (0, jsxRuntime.jsx)(TaskStatusIcon, {status})}),
          (0, jsxRuntime.jsxs)('span', {
            className: 'min-w-0 flex-1',
            children: [
              (0, jsxRuntime.jsx)('span', {
                className: 'text-foreground line-clamp-2 text-sm leading-5 font-medium wrap-anywhere',
                children: preview?.title ?? task.title,
              }),
              (0, jsxRuntime.jsxs)('span', {
                className: 'text-muted-foreground mt-1 flex items-center gap-1.5 text-xs select-none',
                children: [
                  taskStatus(status).label,
                  unread &&
                    (0, jsxRuntime.jsxs)('span', {
                      className: 'text-brand-content flex items-center gap-1',
                      'aria-label': 'Unread task result',
                      children: [(0, jsxRuntime.jsx)('span', {className: 'bg-brand size-1.5 rounded-full'}), 'Unread'],
                    }),
                ],
              }),
            ],
          }),
        ],
      }),
      status === 'running' &&
        preview?.toolCalls.map(toolCall => {
          const tool = it(toolCall.name),
            input = nt(toolCall, void 0, {isStreaming: true, sessionId: task.id});
          return tool.hide?.(input)
            ? null
            : (0, jsxRuntime.jsxs)(
                'span',
                {
                  className: 'text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs',
                  'data-task-tool': toolCall.name,
                  children: [
                    (0, jsxRuntime.jsx)('span', {
                      className: 'flex size-3.5 shrink-0 items-center justify-center [&_svg]:size-3.5',
                      children: ge(tool.icon, input),
                    }),
                    (0, jsxRuntime.jsx)('span', {
                      className: 'min-w-0 truncate [&_*]:truncate',
                      children: ge(tool.title, input),
                    }),
                  ],
                },
                toolCall.id,
              );
        }),
      preview?.previewText &&
        (0, jsxRuntime.jsx)('span', {
          className: 'text-muted-foreground line-clamp-3 text-xs leading-5 wrap-anywhere',
          children: Je(preview.previewText),
        }),
      (0, jsxRuntime.jsxs)('span', {
        className: 'flex min-w-0 items-center gap-1.5',
        children: [
          (0, jsxRuntime.jsx)(Ge, {
            variant: 'secondary',
            size: 'sm',
            className: 'select-none',
            children: task.environment.type === 'cloud' ? 'Cloud' : 'Device',
          }),
          task.model &&
            (0, jsxRuntime.jsx)('span', {
              title: task.model.modelId,
              className: 'text-muted-foreground min-w-0 truncate text-xs',
              children: task.model.modelId,
            }),
        ],
      }),
      task.last_error &&
        (0, jsxRuntime.jsx)('span', {
          className: 'text-destructive line-clamp-2 text-xs wrap-anywhere',
          children: task.last_error,
        }),
      task.updated_at &&
        (0, jsxRuntime.jsxs)('span', {
          className: 'text-muted-foreground text-xs select-none',
          children: ['Updated ', (0, jsxRuntime.jsx)(Qe, {datetime: task.updated_at})],
        }),
    ],
  });
} /** Marks a task’s result as read (best effort; keepalive so it survives navigation). */
async function markTaskRead(accountId, taskId) {
  try {
    const token = await de(accountId),
      response = await fetch(`${Z}/channel-chat/tasks/${encodeURIComponent(taskId)}/read`, {
        method: 'POST',
        headers: {authorization: `Bearer ${token}`},
        keepalive: true,
      });
    if (!response.ok) throw new Error(`Task read cursor failed (${response.status})`);
  } catch (error) {
    console.error('[channel] mark task read', error);
  }
}
function taskRoute(accountId, task) {
  return {
    to: '/u/$userId/tasks/$sessionId',
    params: {userId: String(accountId), sessionId: task.id},
    search: {host: task.environment.type === 'cloud' ? `cloud:${task.id}` : `remote:${task.environment.hostId}`},
  };
} /** TaskCard: a task summary that opens the task. */
function Ms({accountId, task, canOpen = true}) {
  return canOpen
    ? (0, jsxRuntime.jsx)(ce, {
        ...taskRoute(accountId, task),
        onClick: () => {
          markTaskRead(accountId, task.id);
        },
        'aria-label': `Open task: ${task.title}`,
        className:
          'border-border bg-card hover:bg-accent focus-visible:ring-ring block min-w-0 rounded-xl border p-3 shadow-xs transition-colors outline-none focus-visible:ring-2',
        children: (0, jsxRuntime.jsx)(TaskSummary, {task}),
      })
    : (0, jsxRuntime.jsx)('div', {
        className: 'border-border bg-card block min-w-0 rounded-xl border p-3 shadow-xs',
        children: (0, jsxRuntime.jsx)(TaskSummary, {task}),
      });
}
function taskIdFromLink(url) {
  return /^(?:aux:task\/|#aux-task\/)([A-Za-z0-9][A-Za-z0-9._-]*)$/.exec(url ?? '')?.[1];
} /** Remark plugin: aux:task links become #aux-task/<id> and task file links #aux-task-file/<path>. */
function remarkTaskLinks() {
  return tree => {
    const visit = node => {
      if (node.type === 'link' || node.type === 'definition') {
        const taskId = taskIdFromLink(node.url);
        taskId
          ? (node.url = `#aux-task/${taskId}`)
          : parseTaskFileUrl(node.url) && (node.url = `#aux-task-file/${node.url.slice('aux:task/'.length)}`);
      }
      'children' in node && node.children.forEach(visit);
    };
    visit(tree);
  };
}
var REMARK_PLUGINS = [
  ...Object.values(ut),
  remarkTaskLinks,
]; /** Links in messages: task links get a chip with a status tooltip, task files an attachment. */
function MessageLink({href, children, passive = false, ...props}) {
  const {accountId, tasks, canOpen = true} = (0, React.useContext)(Me),
    url = href?.startsWith('#aux-task-file/') ? `aux:task/${href.slice('#aux-task-file/'.length)}` : href,
    taskFile = parseTaskFileUrl(url ?? '');
  if (taskFile)
    return passive || !canOpen
      ? (0, jsxRuntime.jsx)('span', {className: 'underline', children})
      : (0, jsxRuntime.jsx)(Attachment, {
          url,
          alt: typeof children == 'string' ? children : taskFile.path.split('/').at(-1),
          mediaType: 'file',
        });
  const taskId = taskIdFromLink(href);
  if (!taskId)
    return passive
      ? (0, jsxRuntime.jsx)('span', {className: 'underline', children})
      : (0, jsxRuntime.jsx)('a', {...props, href, children});
  const task = tasks.find(candidate => candidate.id === taskId);
  return task
    ? passive || !canOpen
      ? (0, jsxRuntime.jsx)('span', {className: 'font-medium', children: task.title})
      : (0, jsxRuntime.jsxs)(xt, {
          disableHoverablePopup: false,
          children: [
            (0, jsxRuntime.jsxs)(pt, {
              tabIndex: 0,
              render: (0, jsxRuntime.jsx)(ce, {
                ...taskRoute(accountId, task),
                onClick: () => {
                  markTaskRead(accountId, task.id);
                },
              }),
              'aria-label': `Open task: ${task.title}`,
              className:
                'focus-visible:ring-ring mx-0.5 inline-flex max-w-full items-center gap-0.75 rounded-md bg-current/10 px-1 py-0.25 align-middle text-[13px] leading-4.5 font-normal text-inherit! no-underline! transition-colors outline-none hover:bg-current/15 focus-visible:ring-2 [&>svg]:size-3.5',
              children: [
                (0, jsxRuntime.jsx)(TaskStatusIcon, {status: task.preview?.status ?? task.status}),
                (0, jsxRuntime.jsx)('span', {className: 'max-w-64 truncate', children: task.title}),
              ],
            }),
            (0, jsxRuntime.jsx)(ft, {
              side: 'bottom',
              align: 'start',
              sideOffset: 8,
              className:
                'bg-popover text-popover-foreground block w-72 max-w-[calc(100vw-2rem)] rounded-xl p-3 font-normal shadow-lg',
              children: (0, jsxRuntime.jsx)(TaskSummary, {task}),
            }),
          ],
        })
    : (0, jsxRuntime.jsx)('span', {
        className: 'text-muted-foreground',
        title: 'This task is unavailable in this channel',
        children: 'Task unavailable',
      });
}
var MESSAGE_COMPONENTS = {a: ({node, ...props}) => (0, jsxRuntime.jsx)(MessageLink, {...props})},
  InlineBlock = ({children}) => (0, jsxRuntime.jsxs)('span', {children: [children, ' ']}),
  PREVIEW_COMPONENTS = {
    p: InlineBlock,
    li: InlineBlock,
    ul: 'span',
    ol: 'span',
    blockquote: InlineBlock,
    h1: InlineBlock,
    h2: InlineBlock,
    h3: InlineBlock,
    h4: InlineBlock,
    h5: InlineBlock,
    h6: InlineBlock,
    pre: 'span',
    code: ({children}) => (0, jsxRuntime.jsx)('code', {className: 'font-mono', children}),
    a: ({children, href}) => (0, jsxRuntime.jsx)(MessageLink, {href, passive: true, children}),
    img: ({alt}) => (0, jsxRuntime.jsx)('span', {children: alt}),
    table: 'span',
    thead: 'span',
    tbody: 'span',
    tr: InlineBlock,
    th: InlineBlock,
    td: InlineBlock,
    input: () => null,
  }; /** A message as one or three plain lines (reply previews, quoted messages). */
function MessagePreview({children, compact = false}) {
  return (0, jsxRuntime.jsx)(ue, {
    mode: 'static',
    controls: false,
    components: PREVIEW_COMPONENTS,
    remarkPlugins: REMARK_PLUGINS,
    className: I('h-auto space-y-0 [&_*]:whitespace-normal', compact ? 'line-clamp-1' : 'line-clamp-3'),
    children,
  });
}
function messageText(message) {
  return typeof message.content == 'string'
    ? message.content
    : message.content.filter(part => part.type === 'text').map(part => part.text).join(`
`);
} /** Composer: draft kept per draftKey, up to 8 attachments (10 MB each, 20 MB in all), dictation, reply context. */
function Ts({draftKey, replyTo, reply = false, onCancelReply, onSubmit, onTyping, onActivate}) {
  const [draft, setDraftState] = (0, React.useState)(() => {
      try {
        return draftKey ? (localStorage.getItem(draftKey) ?? '') : '';
      } catch {
        return '';
      }
    }),
    [attachments, setAttachments] = (0, React.useState)([]),
    [reading, setReading] = (0, React.useState)(false),
    fileInput = (0, React.useRef)(null),
    setDraft = value => {
      if ((setDraftState(value), !!draftKey))
        try {
          value ? localStorage.setItem(draftKey, value) : localStorage.removeItem(draftKey);
        } catch {}
    },
    dictation = ct(spoken => {
      (setDraft(draft ? `${draft} ${spoken}` : spoken), textarea.current?.focus());
    });
  (0, React.useEffect)(() => {
    dictation.error && B.error(dictation.error);
  }, [dictation.error]);
  const lastTypingAt = (0, React.useRef)(0),
    [sending, setSending] = (0, React.useState)(false),
    textarea = (0, React.useRef)(null),
    {resolvedTheme} = qe(),
    reducedMotion = H(),
    replyMessage = replyTo?.message,
    replyId = replyTo?.id;
  return (
    (0, React.useEffect)(() => {
      replyId && textarea.current?.focus();
    }, [replyId]),
    (0, jsxRuntime.jsx)('div', {
      style: {borderRadius: 24},
      className: 'bg-glass border-glass w-full border shadow-xl backdrop-blur-xl',
      children: (0, jsxRuntime.jsxs)('form', {
        'aria-label': replyTo || reply ? 'Reply to message' : 'Ask Aux',
        className: 'w-full p-2',
        onPointerDown: onActivate,
        onFocus: onActivate,
        onSubmit: async event => {
          if (
            (event.preventDefault(),
            (!draft.trim() && !attachments.length) || sending || reading || dictation.status !== 'idle')
          )
            return;
          const text = draft,
            sentAttachments = attachments,
            rect = !reducedMotion && !attachments.length ? textarea.current?.getBoundingClientRect() : void 0,
            sendOrigin = rect && {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
            restoreDraft = () => {
              try {
                if (draftKey && localStorage.getItem(draftKey)) return;
              } catch {}
              setDraft(text);
            };
          (setSending(true), setDraft(''), setAttachments([]), onTyping?.(false));
          try {
            (await onSubmit(text.trim(), sentAttachments, sendOrigin)) === false &&
              (restoreDraft(), setAttachments(sentAttachments));
          } catch (error) {
            (restoreDraft(),
              setAttachments(sentAttachments),
              B.error(error instanceof Error ? error.message : 'Could not send message'));
          } finally {
            setSending(false);
          }
        },
        children: [
          (0, jsxRuntime.jsx)(wt, {
            initial: false,
            children:
              replyTo &&
              (0, jsxRuntime.jsx)(
                V.div,
                {
                  initial: {height: 0, opacity: 0},
                  animate: {height: 'auto', opacity: 1},
                  exit: {height: 0, opacity: 0},
                  transition: {duration: reducedMotion ? 0 : 0.18, ease: 'easeInOut'},
                  className: 'overflow-hidden',
                  children: (0, jsxRuntime.jsxs)('div', {
                    className: 'bg-foreground/5 mb-1 flex items-center gap-3 rounded-2xl py-2.5 pr-2 pl-4',
                    children: [
                      (0, jsxRuntime.jsxs)('div', {
                        className: 'min-w-0 flex-1 text-sm',
                        children: [
                          (0, jsxRuntime.jsxs)('p', {
                            className: 'text-muted-foreground font-medium select-none',
                            children: [
                              'Replying to ',
                              replyTo?.authorLabel ?? (replyMessage?.role === 'user' ? 'you' : 'Aux'),
                            ],
                          }),
                          (0, jsxRuntime.jsx)(MessagePreview, {
                            compact: true,
                            children: replyMessage ? messageText(replyMessage) : '',
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)(A, {
                        type: 'button',
                        variant: 'ghost',
                        size: 'icon-sm',
                        className: 'shrink-0 rounded-full',
                        'aria-label': 'Cancel reply',
                        onClick: () => {
                          (onCancelReply?.(), textarea.current?.focus());
                        },
                        children: (0, jsxRuntime.jsx)(ve, {className: 'size-5'}),
                      }),
                    ],
                  }),
                },
                'reply-context',
              ),
          }),
          !!attachments.length &&
            (0, jsxRuntime.jsx)('ul', {
              'aria-label': 'Attachments',
              className: 'mb-2 flex flex-wrap gap-2 px-2',
              children: attachments.map(attachment =>
                (0, jsxRuntime.jsxs)(
                  'li',
                  {
                    className: 'bg-foreground/5 flex max-w-full items-center gap-2 rounded-xl p-2 text-xs',
                    children: [
                      attachment.mimeType.startsWith('image/')
                        ? (0, jsxRuntime.jsx)('img', {
                            src: `data:${attachment.mimeType};base64,${attachment.data}`,
                            alt: attachment.name,
                            className: 'size-10 rounded object-cover',
                          })
                        : (0, jsxRuntime.jsx)(ot, {filename: attachment.name, className: 'size-5'}),
                      (0, jsxRuntime.jsx)('span', {className: 'max-w-48 truncate', children: attachment.name}),
                      (0, jsxRuntime.jsx)(A, {
                        type: 'button',
                        variant: 'ghost',
                        size: 'icon-xs',
                        disabled: sending,
                        'aria-label': `Remove ${attachment.name}`,
                        onClick: () => setAttachments(current => current.filter(other => other.id !== attachment.id)),
                        children: (0, jsxRuntime.jsx)(ve, {className: 'size-4'}),
                      }),
                    ],
                  },
                  attachment.id,
                ),
              ),
            }),
          (0, jsxRuntime.jsx)('input', {
            ref: fileInput,
            type: 'file',
            multiple: true,
            accept: jt,
            className: 'hidden',
            'aria-label': 'Choose attachments',
            onChange: async event => {
              const files = Array.from(event.target.files ?? []);
              if (((event.target.value = ''), files.length + attachments.length > 8)) {
                B.error('Attach up to 8 files per message.');
                return;
              }
              if (files.some(file => file.size > 10485760)) {
                B.error('Each attachment must be 10 MB or smaller.');
                return;
              }
              if (
                files.reduce((sum, file) => sum + file.size, 0) +
                  attachments.reduce(
                    (sum, attachment) => sum + Math.ceil(((attachment.data?.length ?? 0) * 3) / 4),
                    0,
                  ) >
                20971520
              ) {
                B.error('Attachments must total 20 MB or less.');
                return;
              }
              setReading(true);
              try {
                const read = await Promise.all(files.map(Ct));
                setAttachments(current => [...current, ...read.filter(attachment => attachment?.type === 'file')]);
              } finally {
                setReading(false);
              }
            },
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex items-center gap-2 px-1',
            children: [
              (0, jsxRuntime.jsx)(A, {
                type: 'button',
                variant: 'ghost',
                size: 'icon',
                disabled: sending || reading,
                onClick: () => fileInput.current?.click(),
                'aria-label': reading ? 'Reading attachments' : 'Add attachment',
                className: 'rounded-full',
                children: (0, jsxRuntime.jsx)(Ke, {className: 'size-5'}),
              }),
              (0, jsxRuntime.jsx)('textarea', {
                ref: textarea,
                disabled: sending,
                rows: 1,
                value: draft,
                onBlur: () => onTyping?.(false),
                onChange: event => {
                  (setDraft(event.target.value),
                    (!event.target.value || Date.now() - lastTypingAt.current > 1e3) &&
                      ((lastTypingAt.current = Date.now()), onTyping?.(!!event.target.value)));
                },
                onKeyDown: event => {
                  event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    (event.preventDefault(), event.currentTarget.form?.requestSubmit());
                },
                'aria-label': replyTo || reply ? 'Reply to message' : 'Ask Aux',
                placeholder: replyTo || reply ? 'Reply to message…' : 'Ask Aux',
                className:
                  'placeholder:text-muted-foreground [field-sizing:content] max-h-40 min-h-8 min-w-0 flex-1 resize-none bg-transparent py-1 text-base outline-none',
              }),
              dictation.status !== 'idle'
                ? (0, jsxRuntime.jsx)(dt, {
                    status: dictation.status,
                    stream: dictation.stream,
                    onCancel: dictation.cancel,
                    onConfirm: () => {
                      dictation.confirm();
                    },
                  })
                : (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                    children: [
                      dictation.supported &&
                        (0, jsxRuntime.jsx)(A, {
                          type: 'button',
                          variant: 'ghost',
                          size: 'icon',
                          disabled: sending,
                          onClick: () => {
                            dictation.start();
                          },
                          'aria-label': 'Voice input',
                          className: 'rounded-full',
                          children: (0, jsxRuntime.jsx)(MicIcon, {className: 'size-5'}),
                        }),
                      (draft.trim() || attachments.length > 0) &&
                        (0, jsxRuntime.jsx)(A, {
                          type: 'submit',
                          disabled: sending || reading,
                          size: 'icon',
                          className: 'rounded-full',
                          'aria-label': 'Send message',
                          children: (0, jsxRuntime.jsx)(rt, {className: 'size-5'}),
                        }),
                    ],
                  }),
            ],
          }),
        ],
      }),
    })
  );
}
var ReactDOM = Se(Ve(), 1);
function As({children}) {
  return (0, jsxRuntime.jsx)(jsxRuntime.Fragment, {children});
}
function _s() {
  return null;
}
function VaultUnlockNotice({prompt}) {
  return (0, jsxRuntime.jsxs)('p', {
    className: 'text-muted-foreground text-sm',
    children: [prompt, ' The built-in password manager is excluded from Aux. Use your existing browser extension.'],
  });
}
function Es(request) {
  return request.suspended
    ? (0, jsxRuntime.jsx)(ce, {
        to: '/u/$userId/tasks/$sessionId',
        params: {userId: String(request.accountId), sessionId: request.sessionId},
        search: {host: `cloud:${request.sessionId}`},
        children: 'Review pending request in cloud chat',
      })
    : null;
}
var EMOJI_GROUPS = [
  {
    name: 'Frequently used',
    items: [
      '👍|thumbs up like 좋아요',
      '❤️|heart love 사랑',
      '😂|laugh joy 웃음',
      '🎉|party celebrate 축하',
      '👀|eyes looking 확인',
      '🙏|thanks please 감사',
    ],
  },
  {
    name: 'Smileys & emotion',
    items: [
      '😀|grin happy 행복',
      '😊|smile happy 미소',
      '🥰|love hearts 사랑',
      '😍|heart eyes 사랑',
      '🤩|star struck 감탄',
      '😎|cool sunglasses 멋짐',
      '🤔|thinking 생각',
      '🫡|salute 알겠습니다',
      '🤗|hug 포옹',
      '🤭|giggle 웃음',
      '😅|sweat smile 땀',
      '🤣|rofl laugh 웃음',
      '🥹|touched 감동',
      '😭|cry 슬픔',
      '😢|sad 슬픔',
      '😮|surprised 놀람',
      '😴|sleep 잠',
      '🤯|mind blown 충격',
      '😬|grimace 난감',
      '😱|scream 비명',
      '😤|frustrated 화남',
      '😡|angry 화남',
      '🤦|facepalm 당황',
      '🤷|shrug 몰라',
    ],
  },
  {
    name: 'Gestures & people',
    items: [
      '👎|thumbs down 싫어요',
      '👏|clap 박수',
      '🙌|raised hands 만세',
      '🤝|handshake 악수',
      '💪|muscle strong 힘',
      '👌|okay 좋아',
      '✌️|peace 승리',
      '👋|wave 안녕',
      '🤞|crossed fingers 행운',
      '🫶|heart hands 사랑',
      '✍️|writing 메모',
      '🙋|hand raised 질문',
    ],
  },
  {
    name: 'Objects & symbols',
    items: [
      '🔥|fire hot 불',
      '✨|sparkles 반짝',
      '⭐|star 별',
      '💯|hundred perfect 완벽',
      '✅|check done 완료',
      '❌|cross no 취소',
      '🚀|rocket launch 로켓',
      '💡|idea bulb 아이디어',
      '🎯|target goal 목표',
      '🏆|trophy winner 우승',
      '☕|coffee 커피',
      '🍕|pizza 피자',
      '🍻|beer cheers 건배',
      '🎂|birthday cake 생일',
      '🌈|rainbow 무지개',
      '🌸|flower 꽃',
      '🐶|dog 강아지',
      '🐱|cat 고양이',
      '💚|green heart 초록',
      '💙|blue heart 파랑',
      '💜|purple heart 보라',
      '💔|broken heart 실연',
      '📌|pin 고정',
      '⏳|waiting hourglass 대기',
    ],
  },
]; /** Reaction picker: frequent emoji on hover, all groups with search when clicked. */
function ReactionPicker({selected, onSelect}) {
  const [open, setOpen] = (0, React.useState)(false),
    [expanded, setExpanded] = (0, React.useState)(false),
    [query, setQuery] = (0, React.useState)(''),
    needle = query.trim().toLowerCase(),
    groups = (expanded ? EMOJI_GROUPS : EMOJI_GROUPS.slice(0, 1))
      .map(group => ({...group, items: group.items.filter(item => item.toLowerCase().includes(needle))}))
      .filter(group => group.items.length > 0);
  return (0, jsxRuntime.jsxs)(Xe, {
    open,
    onOpenChange: nextOpen => {
      (setOpen(nextOpen), nextOpen || (setExpanded(false), setQuery('')));
    },
    children: [
      (0, jsxRuntime.jsx)(Ye, {
        openOnHover: !expanded,
        render: (0, jsxRuntime.jsx)(A, {variant: 'ghost', size: 'icon-xs', 'aria-label': 'Add reaction'}),
        onClick: () => setExpanded(true),
        children: (0, jsxRuntime.jsx)(ReactionIcon, {className: 'size-3.5'}),
      }),
      (0, jsxRuntime.jsxs)(et, {
        side: 'top',
        align: 'start',
        className: I('bg-popover text-popover-foreground p-2', expanded && 'w-80 max-w-[calc(100vw-2rem)]'),
        children: [
          expanded &&
            (0, jsxRuntime.jsxs)('div', {
              className: 'space-y-2 px-1 pt-1 pb-3',
              children: [
                (0, jsxRuntime.jsx)('p', {className: 'text-sm font-semibold', children: 'Choose a reaction'}),
                (0, jsxRuntime.jsx)(Le, {
                  autoFocus: true,
                  'aria-label': 'Search emoji',
                  placeholder: 'Search emoji…',
                  value: query,
                  onChange: event => setQuery(event.target.value),
                }),
              ],
            }),
          (0, jsxRuntime.jsxs)('div', {
            className: I(expanded && 'max-h-72 overflow-y-auto overscroll-contain'),
            children: [
              groups.map(group =>
                (0, jsxRuntime.jsxs)(
                  'section',
                  {
                    'aria-label': group.name,
                    children: [
                      expanded &&
                        (0, jsxRuntime.jsx)('p', {
                          className: 'text-muted-foreground bg-popover sticky top-0 px-1 py-2 text-xs font-medium',
                          children: group.name,
                        }),
                      (0, jsxRuntime.jsx)('div', {
                        className: I('grid gap-0.5', expanded ? 'grid-cols-8' : 'grid-cols-6'),
                        children: group.items.map(item => {
                          const [emoji, name] = item.split('|');
                          return (0, jsxRuntime.jsx)(
                            'button',
                            {
                              type: 'button',
                              'aria-label': name,
                              title: name,
                              'aria-pressed': selected.includes(emoji),
                              className: I(
                                'hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg text-xl outline-none focus-visible:ring-2',
                                selected.includes(emoji) && 'bg-brand/10 ring-brand/40 ring-1',
                              ),
                              onClick: () => {
                                (onSelect(emoji), setOpen(false), setExpanded(false), setQuery(''));
                              },
                              children: emoji,
                            },
                            emoji,
                          );
                        }),
                      }),
                    ],
                  },
                  group.name,
                ),
              ),
              groups.length === 0 &&
                (0, jsxRuntime.jsx)('p', {
                  className: 'text-muted-foreground py-8 text-center text-sm',
                  children: 'No emoji found',
                }),
            ],
          }),
        ],
      }),
    ],
  });
}
var REVEAL_TIMING = {
  animation: 'wordReveal',
  sep: 'word',
  duration: 350,
  stagger: 60,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  maxBacklogMs: 4e3,
}; /** Streaming text that reveals new words as they arrive (not under reduced motion). */
function StreamingText({isStreaming, children, renderer = ue, timing, ...props}) {
  const reducedMotion = H(),
    resolvedTiming = (0, React.useMemo)(() => ({...REVEAL_TIMING, ...timing}), [timing]),
    animate = isStreaming && !reducedMotion,
    [shown, setShown] = (0, React.useState)({text: children, isStreaming, reveal: false});
  return (
    (shown.text !== children || shown.isStreaming !== isStreaming) &&
      setShown({
        text: children,
        isStreaming,
        reveal:
          isStreaming &&
          shown.isStreaming &&
          typeof children == 'string' &&
          typeof shown.text == 'string' &&
          children.length > shown.text.length &&
          children.startsWith(shown.text),
      }),
    (0, jsxRuntime.jsx)('div', {
      'data-streaming-text': true,
      'data-reveal': animate && shown.reveal,
      style: {'--streaming-max-delay': `${resolvedTiming.maxBacklogMs}ms`},
      children: (0, jsxRuntime.jsx)(renderer, {
        ...props,
        mode: 'streaming',
        animated: animate ? resolvedTiming : false,
        isAnimating: isStreaming,
        children,
      }),
    })
  );
} /** Up to four distinct https links in a message, outside code, without credentials. */
function extractLinks(text) {
  const withoutCode = text.replace(/```[\s\S]*?(?:```|$)|`[^`\n]*`/g, ''),
    links = new Set();
  for (const match of withoutCode.matchAll(/https?:\/\/[^\s<>"`]+/g)) {
    let candidate = match[0].replace(/[.,!?;:'\]}]+$/, '');
    for (; candidate.endsWith(')') && (candidate.match(/\)/g)?.length ?? 0) > (candidate.match(/\(/g)?.length ?? 0);)
      candidate = candidate.slice(0, -1);
    try {
      const url = new URL(candidate);
      !url.username && !url.password && links.add(url.href);
    } catch {}
  }
  return [...links].slice(0, 4);
} /** Average colour of a thumbnail’s mid-tone pixels, with a readable text colour. */
function averageColor(pixels) {
  let red = 0,
    green = 0,
    blue = 0,
    counted = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const r = pixels[index],
      g = pixels[index + 1],
      b = pixels[index + 2],
      lightness = (r + g + b) / 3;
    pixels[index + 3] < 200 || lightness < 24 || lightness > 240 || ((red += r), (green += g), (blue += b), counted++);
  }
  if (!counted) return;
  const rgb = [red, green, blue].map(channel => Math.round(channel / counted)),
    luminance = rgb
      .map(channel => {
        const linear = channel / 255;
        return linear <= 0.04045 ? linear / 12.92 : ((linear + 0.055) / 1.055) ** 2.4;
      })
      .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  return {background: `rgb(${rgb.join(', ')})`, foreground: luminance > 0.179 ? '#171717' : '#ffffff'};
}
var linkPreviewResponseSchema = z({title: j(), image: j().optional()}),
  cachedLinkPreviewSchema = z({
    title: j(),
    thumbnail: j().optional(),
    aspectRatio: we().optional(),
    background: j().optional(),
    foreground: j().optional(),
    expires: we(),
  }),
  LINK_PREVIEW_CACHE = 'aux-chat-link-previews-v2',
  LINK_PREVIEW_LIMIT = 64,
  linkPreviews = new Map(),
  pendingLinkPreviews = new Map();
async function openLinkPreviewCache() {
  try {
    return await caches.open(LINK_PREVIEW_CACHE);
  } catch {
    return;
  }
} /** A link preview: memory, then the Cache API, then the preview service (a small thumbnail tinted from the image). */
async function fetchLinkPreview(url) {
  const target = new URL(url);
  target.hash = '';
  const endpoint = `${Z}/assets/link-preview?${new URLSearchParams({url: target.href})}`,
    cached = linkPreviews.get(endpoint);
  if (cached && cached.expires > Date.now()) return cached;
  const pending = pendingLinkPreviews.get(endpoint);
  if (pending) return pending;
  const request = (async () => {
    const cache = await openLinkPreviewCache();
    try {
      const stored = await cache?.match(endpoint),
        parsed = stored && cachedLinkPreviewSchema.safeParse(await stored.json());
      if (parsed?.success && parsed.data.expires > Date.now()) {
        for (linkPreviews.set(endpoint, parsed.data); linkPreviews.size > LINK_PREVIEW_LIMIT;)
          linkPreviews.delete(linkPreviews.keys().next().value);
        return parsed.data;
      }
    } catch {}
    let preview = {title: target.hostname.replace(/^www\./, ''), expires: Date.now() + 6e4};
    try {
      const response = await fetch(endpoint, {credentials: 'omit', signal: AbortSignal.timeout(12e3)});
      if (!response.ok) throw new Error('Preview unavailable');
      const page = linkPreviewResponseSchema.parse(await response.json());
      if (((preview = {title: decodeHtml(page.title) || preview.title, expires: Date.now() + 864e5}), page.image))
        try {
          const imageResponse = await fetch(
            `${Z}/assets/link-preview/image?${new URLSearchParams({url: page.image})}`,
            {credentials: 'omit', signal: AbortSignal.timeout(12e3)},
          );
          if (!imageResponse.ok) throw new Error('Thumbnail unavailable');
          const bitmap = await createImageBitmap(await imageResponse.blob(), {resizeWidth: 600});
          try {
            const thumbnail = document.createElement('canvas'),
              scale = Math.min(1, 1200 / bitmap.height);
            ((thumbnail.width = Math.max(1, Math.round(bitmap.width * scale))),
              (thumbnail.height = Math.max(1, Math.round(bitmap.height * scale))),
              thumbnail.getContext('2d').drawImage(bitmap, 0, 0, thumbnail.width, thumbnail.height));
            const sample = document.createElement('canvas');
            sample.width = sample.height = 32;
            const sampleContext = sample.getContext('2d');
            sampleContext.drawImage(thumbnail, 0, 0, 32, 32);
            const colors = averageColor(sampleContext.getImageData(0, 0, 32, 32).data);
            preview = {
              ...preview,
              thumbnail: thumbnail.toDataURL('image/webp', 0.85),
              aspectRatio: Math.max(0.75, Math.min(1.91, thumbnail.width / thumbnail.height)),
              ...colors,
            };
          } finally {
            bitmap.close();
          }
        } catch {
          preview.expires = Date.now() + 6e4;
        }
    } catch {}
    for (linkPreviews.delete(endpoint), linkPreviews.set(endpoint, preview); linkPreviews.size > LINK_PREVIEW_LIMIT;)
      linkPreviews.delete(linkPreviews.keys().next().value);
    try {
      await cache?.put(endpoint, Response.json(preview));
      const keys = (await cache?.keys()) ?? [];
      await Promise.all(keys.slice(0, Math.max(0, keys.length - LINK_PREVIEW_LIMIT)).map(key => cache.delete(key)));
    } catch {}
    return preview;
  })();
  pendingLinkPreviews.set(endpoint, request);
  try {
    return await request;
  } finally {
    pendingLinkPreviews.delete(endpoint);
  }
}
function decodeHtml(html) {
  const textarea = document.createElement('textarea');
  return ((textarea.innerHTML = html), textarea.value);
} /** A link preview card under a message. */
function LinkPreview({url, sender = 'assistant', tail = true, className}) {
  const [loaded, setLoaded] = (0, React.useState)(),
    preview = loaded?.url === url ? loaded.preview : void 0,
    previewable = URL.canParse(url) && /^https?:\/\//i.test(url) && !new URL(url).username && !new URL(url).password;
  if (
    ((0, React.useEffect)(() => {
      if (!previewable) return;
      let active = true;
      return (
        fetchLinkPreview(url).then(result => {
          active && setLoaded({url, preview: result});
        }),
        () => {
          active = false;
        }
      );
    }, [url, previewable]),
    !previewable)
  )
    return null;
  const host = new URL(url).hostname.replace(/^www\./, ''),
    background = preview?.background ?? 'var(--secondary)',
    foreground = preview?.foreground ?? 'var(--secondary-foreground)';
  return (0, jsxRuntime.jsxs)('div', {
    className: I('relative w-52 max-w-full', tail && 'pb-[5px]', className),
    style: {color: background},
    'data-link-preview': url,
    children: [
      (0, jsxRuntime.jsxs)('a', {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': preview?.title ? `${preview.title} — ${host}` : `Open ${host}`,
        'aria-busy': !preview,
        className:
          'no-squircle focus-visible:ring-ring relative block overflow-hidden rounded-[16px] text-[13px] leading-[1.3] outline-none focus-visible:ring-2',
        style: {backgroundColor: background, color: foreground},
        children: [
          preview?.thumbnail
            ? (0, jsxRuntime.jsx)('div', {
                style: {aspectRatio: preview.aspectRatio ?? 0.8},
                children: (0, jsxRuntime.jsx)('img', {
                  src: preview.thumbnail,
                  alt: '',
                  className: 'size-full object-cover',
                  width: 208,
                  height: 260,
                }),
              })
            : preview
              ? null
              : (0, jsxRuntime.jsx)('div', {
                  className: 'flex aspect-[4/3] items-center justify-center px-3 text-xs',
                  children: 'Loading preview…',
                }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex items-center gap-2 px-3 py-2.5',
            children: [
              (0, jsxRuntime.jsxs)('div', {
                className: 'min-w-0 flex-1',
                children: [
                  preview?.title &&
                    preview.title !== host &&
                    (0, jsxRuntime.jsx)('p', {className: 'line-clamp-3 font-semibold', children: preview.title}),
                  (0, jsxRuntime.jsx)('p', {
                    className: I('truncate text-xs', preview?.title !== host && 'mt-1'),
                    children: host,
                  }),
                ],
              }),
              !preview?.thumbnail && (0, jsxRuntime.jsx)(ChevronRightIcon, {className: 'size-4 shrink-0'}),
            ],
          }),
        ],
      }),
      tail && (0, jsxRuntime.jsx)(Y, {sender: sender === 'user' ? 'me' : 'them', className: 'text-inherit'}),
    ],
  });
}
var SKIP_ANSWER =
  'Skip this question.'; /** A question from Aux: pick an option (or press its letter), type an answer, or dismiss it. */
function QuestionWidget({widget, answer, onAnswer}) {
  const promptId = (0, React.useId)(),
    [customAnswer, setCustomAnswer] = (0, React.useState)(''),
    [sending, setSending] = (0, React.useState)(false),
    inFlight = (0, React.useRef)(false),
    [failed, setFailed] = (0, React.useState)(false),
    send = async value => {
      if (!(!onAnswer || !value.trim() || inFlight.current || answer)) {
        ((inFlight.current = true), setSending(true), setFailed(false));
        try {
          setFailed(!(await onAnswer(value.trim())));
        } catch {
          setFailed(true);
        } finally {
          ((inFlight.current = false), setSending(false));
        }
      }
    },
    answeredIndex = widget.options.findIndex(option => (option.value ?? option.label) === answer);
  return answer
    ? (0, jsxRuntime.jsxs)('div', {
        role: 'group',
        'aria-labelledby': promptId,
        className: 'w-80 max-w-full space-y-3 py-1',
        children: [
          (0, jsxRuntime.jsx)('p', {id: promptId, className: 'font-medium', children: widget.prompt}),
          answer === SKIP_ANSWER
            ? (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground text-xs select-none', children: 'Dismissed'})
            : (0, jsxRuntime.jsxs)('div', {
                className: 'flex items-center gap-3',
                children: [
                  answeredIndex >= 0 && (0, jsxRuntime.jsx)(be, {children: String.fromCharCode(65 + answeredIndex)}),
                  (0, jsxRuntime.jsx)('span', {
                    className: 'min-w-0 flex-1',
                    children: answeredIndex >= 0 ? widget.options[answeredIndex].label : answer,
                  }),
                  (0, jsxRuntime.jsx)(CheckIcon, {className: 'size-4 shrink-0', 'aria-label': 'Selected'}),
                ],
              }),
        ],
      })
    : (0, jsxRuntime.jsxs)('form', {
        'aria-labelledby': promptId,
        className: 'w-80 max-w-full space-y-3 py-1',
        onSubmit: event => {
          (event.preventDefault(), send(customAnswer));
        },
        onKeyDown: event => {
          if (
            event.target instanceof HTMLInputElement ||
            event.metaKey ||
            event.ctrlKey ||
            event.altKey ||
            event.shiftKey ||
            event.key.length !== 1
          )
            return;
          const option = widget.options[event.key.toUpperCase().charCodeAt(0) - 65];
          option && (event.preventDefault(), send(option.value ?? option.label));
        },
        children: [
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex items-start gap-2',
            children: [
              (0, jsxRuntime.jsxs)('div', {
                className: 'min-w-0 flex-1 space-y-1',
                children: [
                  (0, jsxRuntime.jsx)('p', {id: promptId, className: 'font-medium', children: widget.prompt}),
                  widget.helpText &&
                    (0, jsxRuntime.jsx)('p', {className: 'text-muted-foreground text-xs', children: widget.helpText}),
                ],
              }),
              (0, jsxRuntime.jsx)(A, {
                type: 'button',
                variant: 'ghost',
                size: 'icon-xs',
                'aria-label': 'Dismiss question',
                disabled: sending || failed || !onAnswer,
                onClick: () => {
                  send(SKIP_ANSWER);
                },
                children: (0, jsxRuntime.jsx)(CloseIcon, {className: 'size-3.5'}),
              }),
            ],
          }),
          (0, jsxRuntime.jsx)('div', {
            className: 'space-y-1',
            children: widget.options.map((option, index) =>
              (0, jsxRuntime.jsxs)(
                A,
                {
                  type: 'button',
                  variant: 'ghost',
                  disabled: sending || failed || !onAnswer,
                  className: 'h-auto w-full justify-start gap-3 rounded-lg px-2 py-2 text-left whitespace-normal',
                  onClick: () => {
                    send(option.value ?? option.label);
                  },
                  children: [
                    (0, jsxRuntime.jsx)(be, {className: 'shrink-0', children: String.fromCharCode(65 + index)}),
                    (0, jsxRuntime.jsxs)('span', {
                      className: 'min-w-0 flex-1 space-y-0.5',
                      children: [
                        (0, jsxRuntime.jsx)('span', {className: 'block text-sm', children: option.label}),
                        option.description &&
                          (0, jsxRuntime.jsx)('span', {
                            className: 'text-muted-foreground block text-xs font-normal',
                            children: option.description,
                          }),
                      ],
                    }),
                  ],
                },
                index,
              ),
            ),
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'flex items-center gap-2',
            children: [
              (0, jsxRuntime.jsx)(Le, {
                'aria-label': 'Custom answer',
                placeholder: 'Type your own answer',
                value: customAnswer,
                disabled: sending || failed || !onAnswer,
                onChange: event => setCustomAnswer(event.target.value),
                className: 'h-8 text-sm',
              }),
              customAnswer.trim() &&
                (0, jsxRuntime.jsx)(A, {
                  type: 'submit',
                  variant: 'secondary',
                  size: 'sm',
                  disabled: sending || failed || !onAnswer,
                  children: 'Send',
                }),
            ],
          }),
          sending &&
            (0, jsxRuntime.jsx)('p', {
              role: 'status',
              className: 'text-muted-foreground text-xs select-none',
              children: 'Sending…',
            }),
          failed &&
            (0, jsxRuntime.jsx)('p', {
              role: 'alert',
              className: 'text-destructive text-xs',
              children: 'Could not send your answer. Retry the message below.',
            }),
        ],
      });
}
function TypingDots() {
  const reducedMotion = H();
  return (0, jsxRuntime.jsx)('span', {
    className: 'inline-flex h-5 items-center gap-1',
    'aria-hidden': true,
    children: [0, 1, 2].map(index =>
      (0, jsxRuntime.jsx)(
        V.span,
        {
          className: 'size-1.5 rounded-full bg-current',
          animate: reducedMotion ? void 0 : {opacity: [0.35, 1, 0.35]},
          transition: {duration: 1.2, repeat: 1 / 0, delay: index * 0.15},
        },
        index,
      ),
    ),
  });
} /** A message bubble, with its tail when it ends a group. */
function Bubble({children, self = false, tail = true, highlighted = false, focusable = false}) {
  return (0, jsxRuntime.jsxs)('div', {
    className: I('relative', tail && 'pb-[5px]'),
    children: [
      (0, jsxRuntime.jsx)('div', {
        tabIndex: focusable ? 0 : void 0,
        className: I(
          'focus-visible:ring-ring no-squircle relative max-w-full rounded-[16px] px-3 py-[7px] text-[13px] leading-[1.3] wrap-anywhere outline-none focus-visible:ring-2',
          self ? 'bg-foreground text-background' : 'text-foreground bg-(--chat-incoming)',
          highlighted && 'ring-brand ring-2',
        ),
        children,
      }),
      tail &&
        (0, jsxRuntime.jsx)(Y, {
          sender: self ? 'me' : 'them',
          className: self ? 'text-foreground' : 'text-(--chat-incoming)',
        }),
    ],
  });
}
function OwnMessageText({text}) {
  return text.includes('aux:task/')
    ? (0, jsxRuntime.jsx)(ue, {
        mode: 'static',
        components: MESSAGE_COMPONENTS,
        remarkPlugins: REMARK_PLUGINS,
        children: text,
      })
    : (0, jsxRuntime.jsx)('p', {className: 'whitespace-pre-wrap', children: text});
} /** One message: quoted parent, bubble, attachments, link previews, actions, receipts; own messages fly in from the composer. */
function Message({
  entry,
  quoted,
  grouped,
  groupedNext,
  showReceipt,
  highlighted,
  onReact,
  onReply,
  onJump,
  onRetry,
  onAnswer,
  widgetAnswer,
  prefix = 'chat',
}) {
  const own = entry.isOwn ?? entry.message.role === 'user',
    reducedMotion = H(),
    text = messageText(entry.message),
    presentation = entry.presentation,
    links = entry.isStreaming || (presentation && presentation.type !== 'text') ? [] : extractLinks(text),
    linkOnly =
      !entry.attachments?.length && links.length === 1 && (text.trim() === links[0] || `${text.trim()}/` === links[0]),
    bubble = (0, React.useRef)(null),
    sendOrigin = (0, React.useRef)(own && entry.delivery === 'sending' && !links.length ? entry.sendOrigin : void 0),
    [flight, setFlight] = (0, React.useState)();
  return (
    (0, React.useLayoutEffect)(() => {
      if (!sendOrigin.current || reducedMotion) return;
      const frame = requestAnimationFrame(() => {
        if (!bubble.current || !sendOrigin.current) return;
        const {x, y, width, height} = bubble.current.getBoundingClientRect();
        (setFlight({from: sendOrigin.current, to: {x, y, width, height}}), (sendOrigin.current = void 0));
      });
      return () => cancelAnimationFrame(frame);
    }, [reducedMotion]),
    (0, jsxRuntime.jsxs)(V.article, {
      id: `${prefix}-${entry.id}`,
      'data-chat-message': entry.id,
      'data-delivery': entry.delivery,
      'aria-label': `${own ? 'You' : (entry.authorLabel ?? 'Aux')}: ${text}`,
      initial: own || !entry.isStreaming || reducedMotion ? false : {opacity: 0},
      animate: {opacity: 1},
      transition: {duration: own || reducedMotion ? 0 : 0.15, ease: 'easeOut'},
      className: I(
        'font-system flex scroll-m-8 subpixel-antialiased [--chat-incoming:color-mix(in_srgb,var(--foreground)_10%,var(--chat-surface))] [--chat-outline:color-mix(in_srgb,var(--foreground)_25%,var(--chat-surface))]',
        prefix === 'replies' ? '[--chat-surface:var(--popover)]' : '[--chat-surface:var(--background)]',
        own ? 'justify-end' : 'justify-start',
        grouped ? 'pt-1' : 'pt-5',
      ),
      children: [
        (0, jsxRuntime.jsxs)('div', {
          className: I(
            'group/message relative flex min-w-0 flex-col gap-1',
            quoted ? 'w-full' : 'max-w-[calc(100%-5rem)] sm:max-w-[min(88%,calc(100%-5rem))]',
            own ? 'items-end' : 'items-start',
          ),
          children: [
            quoted &&
              (0, jsxRuntime.jsxs)('div', {
                className: I(
                  'relative mb-2 max-w-[80%]',
                  (quoted.isOwn ?? quoted.message.role === 'user') ? 'self-end' : 'self-start',
                ),
                children: [
                  (0, jsxRuntime.jsxs)('button', {
                    type: 'button',
                    onClick: () => onJump(quoted.id),
                    className:
                      'text-muted-foreground hover:text-foreground focus-visible:ring-ring relative isolate block pb-[5px] text-left text-[11px] leading-[1.3] wrap-anywhere outline-none focus-visible:ring-2',
                    'aria-label': 'Go to original message',
                    children: [
                      (0, jsxRuntime.jsxs)('span', {
                        'aria-hidden': true,
                        className:
                          'pointer-events-none absolute inset-0 -z-10 [filter:drop-shadow(1px_0_0_var(--chat-outline))_drop-shadow(-1px_0_0_var(--chat-outline))_drop-shadow(0_1px_0_var(--chat-outline))_drop-shadow(0_-1px_0_var(--chat-outline))]',
                        children: [
                          (0, jsxRuntime.jsx)('span', {
                            className: 'no-squircle absolute inset-0 bottom-[5px] rounded-[16px] bg-(--chat-surface)',
                          }),
                          (0, jsxRuntime.jsx)(Y, {
                            sender: (quoted.isOwn ?? quoted.message.role === 'user') ? 'me' : 'them',
                            className: 'text-(--chat-surface)',
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)('div', {
                        className: 'relative px-2.5 py-1.5',
                        children: (0, jsxRuntime.jsx)(MessagePreview, {children: messageText(quoted.message)}),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)('svg', {
                    'aria-hidden': true,
                    viewBox: '0 0 48 40',
                    fill: 'none',
                    className: I(
                      'text-border pointer-events-none absolute top-full h-10 w-12',
                      (quoted.isOwn ?? quoted.message.role === 'user') ? 'right-3 -scale-x-100' : 'left-3',
                    ),
                    children: (0, jsxRuntime.jsx)('path', {
                      d: 'M 2 6 C 2 30 12 36 28 36 H 44',
                      stroke: 'currentColor',
                      strokeWidth: 3,
                      strokeLinecap: 'round',
                    }),
                  }),
                ],
              }),
            (0, jsxRuntime.jsxs)('div', {
              ref: bubble,
              style: {visibility: flight || (!reducedMotion && sendOrigin.current) ? 'hidden' : void 0},
              className: I(
                'relative',
                quoted ? 'max-w-[calc(100%-5rem)] sm:max-w-[min(88%,calc(100%-5rem))]' : 'max-w-full',
                quoted && quoted.message.role === entry.message.role && (own ? 'mr-10' : 'ml-10'),
              ),
              children: [
                entry.authorLabel &&
                  (0, jsxRuntime.jsx)('div', {
                    className: 'text-muted-foreground mb-1 text-xs select-none',
                    children: entry.authorLabel,
                  }),
                entry.reaction &&
                  (0, jsxRuntime.jsxs)(
                    V.button,
                    {
                      type: 'button',
                      initial: {scale: reducedMotion ? 1 : 0.5},
                      animate: {scale: 1},
                      'aria-label': `Remove ${entry.reaction} reaction`,
                      'aria-pressed': true,
                      onClick: () => onReact(entry.reaction),
                      className: I(
                        'bg-popover absolute -top-6 z-10 flex size-7 items-center justify-center rounded-full text-base shadow-sm ring-2 ring-(--chat-surface) select-none',
                        own ? '-left-3' : '-right-3',
                      ),
                      children: [
                        entry.reaction,
                        (0, jsxRuntime.jsx)('span', {
                          'aria-hidden': true,
                          className: I('bg-popover absolute -bottom-1 size-2 rounded-full', own ? 'left-0' : 'right-0'),
                        }),
                        (0, jsxRuntime.jsx)('span', {
                          'aria-hidden': true,
                          className: I(
                            'bg-popover absolute -bottom-2.5 size-1 rounded-full',
                            own ? '-left-1' : '-right-1',
                          ),
                        }),
                      ],
                    },
                    entry.reaction,
                  ),
                !linkOnly &&
                  !entry.isInterrupted &&
                  (0, jsxRuntime.jsx)(Bubble, {
                    self: own,
                    tail: !groupedNext && !links.length,
                    highlighted,
                    focusable: true,
                    children: (0, jsxRuntime.jsxs)(
                      V.div,
                      {
                        initial: reducedMotion || own || !entry.isStreaming ? false : {opacity: 0},
                        animate: {opacity: 1},
                        transition: {duration: reducedMotion ? 0 : 0.15, ease: 'easeOut'},
                        children: [
                          presentation?.widget?.vaultUnlock
                            ? (0, jsxRuntime.jsx)(VaultUnlockNotice, {
                                toolCallId: presentation.widget.vaultUnlock.toolCallId,
                                prompt: presentation.widget.prompt,
                              })
                            : presentation?.type === 'widget' && presentation.widget
                              ? (0, jsxRuntime.jsx)(QuestionWidget, {
                                  widget: presentation.widget,
                                  answer: widgetAnswer,
                                  onAnswer,
                                })
                              : presentation?.type === 'attachment'
                                ? (0, jsxRuntime.jsx)(Attachment, {
                                    url: presentation.url,
                                    alt: presentation.alt,
                                    mediaType: presentation.mediaType ?? 'file',
                                  })
                                : entry.isStreaming && !text
                                  ? (0, jsxRuntime.jsx)('span', {
                                      role: 'status',
                                      'aria-label': 'Aux is typing',
                                      children: (0, jsxRuntime.jsx)(TypingDots, {}),
                                    })
                                  : own
                                    ? (0, jsxRuntime.jsx)(OwnMessageText, {text})
                                    : (0, jsxRuntime.jsx)(StreamingText, {
                                        renderer: mt,
                                        components: MESSAGE_COMPONENTS,
                                        remarkPlugins: REMARK_PLUGINS,
                                        isStreaming: !!entry.isStreaming,
                                        className:
                                          'space-y-1.5 [&_a]:text-inherit [&_a]:underline [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_li]:list-outside! [&_li]:py-0 [&_li]:pl-1 [&_li_p]:m-0 [&_ol]:list-outside [&_ol]:pl-5 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_ul]:list-outside [&_ul]:pl-5',
                                        timing: {duration: 140, stagger: 15, maxBacklogMs: 120},
                                        children: text,
                                      }),
                          !!entry.attachments?.length &&
                            (0, jsxRuntime.jsx)('div', {
                              className: 'mt-2 grid gap-2',
                              'aria-label': 'Message attachments',
                              children: entry.attachments.map(attachment =>
                                (0, jsxRuntime.jsx)(
                                  Attachment,
                                  {
                                    url: attachment.data
                                      ? `data:${attachment.mimeType};base64,${attachment.data}`
                                      : (attachment.path ?? ''),
                                    alt: attachment.name,
                                    mediaType: attachment.mimeType.startsWith('image/') ? 'image' : 'file',
                                  },
                                  attachment.id,
                                ),
                              ),
                            }),
                          presentation?.images &&
                            (0, jsxRuntime.jsx)('div', {
                              className: 'mt-2 grid gap-2',
                              children: presentation.images.map((image, index) =>
                                (0, jsxRuntime.jsx)(Attachment, {url: image.url, alt: image.alt}, index),
                              ),
                            }),
                        ],
                      },
                      entry.isStreaming && !text ? 'typing' : 'content',
                    ),
                  }),
                entry.isInterrupted &&
                  (0, jsxRuntime.jsxs)('div', {
                    role: 'status',
                    className: 'text-muted-foreground flex items-center gap-1 text-xs',
                    children: [
                      (0, jsxRuntime.jsx)('span', {children: "Couldn't finish this reply."}),
                      (0, jsxRuntime.jsx)(A, {variant: 'ghost', size: 'xs', onClick: onRetry, children: 'Try again'}),
                    ],
                  }),
                links.length > 0 &&
                  (0, jsxRuntime.jsx)('div', {
                    className: I('flex flex-col gap-1', !linkOnly && 'mt-1', own ? 'items-end' : 'items-start'),
                    children: links.map((link, index) =>
                      (0, jsxRuntime.jsx)(
                        LinkPreview,
                        {
                          url: link,
                          sender: own ? 'user' : 'assistant',
                          tail: !groupedNext && index === links.length - 1,
                        },
                        link,
                      ),
                    ),
                  }),
                !entry.isStreaming &&
                  entry.delivery !== 'sending' &&
                  (0, jsxRuntime.jsxs)('div', {
                    className: I(
                      'text-muted-foreground absolute top-1/2 flex -translate-y-1/2 items-center opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100 has-[[data-popup-open]]:opacity-100 [@media(hover:none)]:opacity-100',
                      own ? 'right-full mr-1 flex-row-reverse' : 'left-full ml-1',
                    ),
                    'aria-label': 'Message actions',
                    children: [
                      !own &&
                        text &&
                        (0, jsxRuntime.jsx)(A, {
                          variant: 'ghost',
                          size: 'icon-xs',
                          className: 'rounded-full',
                          'aria-label': 'Copy message',
                          title: 'Copy message',
                          onClick: async () => {
                            try {
                              (await navigator.clipboard.writeText(text), B.success('Message copied'));
                            } catch {
                              B.error('Could not copy message');
                            }
                          },
                          children: (0, jsxRuntime.jsx)(He, {className: 'size-4'}),
                        }),
                      (0, jsxRuntime.jsx)(ReactionPicker, {
                        selected: entry.reaction ? [entry.reaction] : [],
                        onSelect: onReact,
                      }),
                      (0, jsxRuntime.jsx)(A, {
                        variant: 'ghost',
                        size: 'icon-xs',
                        className: 'rounded-full',
                        'aria-label': 'Reply',
                        title: 'Reply to message',
                        onClick: onReply,
                        children: (0, jsxRuntime.jsx)(at, {className: 'size-4'}),
                      }),
                    ],
                  }),
              ],
            }),
            entry.delivery === 'failed'
              ? (0, jsxRuntime.jsx)('button', {
                  type: 'button',
                  onClick: onRetry,
                  className: 'text-destructive rounded px-3 py-1 text-xs select-none hover:underline',
                  children: 'Not Delivered · Retry',
                })
              : own && showReceipt && entry.delivery !== 'sending'
                ? (0, jsxRuntime.jsx)(V.div, {
                    role: 'status',
                    initial: {opacity: reducedMotion ? 1 : 0},
                    animate: {opacity: 1},
                    transition: {duration: reducedMotion ? 0 : 0.16},
                    className: 'text-muted-foreground flex min-h-4 items-center gap-1 px-4 text-xs select-none',
                    children:
                      entry.delivery === 'read'
                        ? entry.readAt
                          ? `Read ${new Date(entry.readAt).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}`
                          : 'Read'
                        : 'Delivered',
                  })
                : null,
          ],
        }),
        flight &&
          (0, ReactDOM.createPortal)(
            (0, jsxRuntime.jsxs)(V.div, {
              'aria-hidden': true,
              className: 'font-system pointer-events-none fixed z-[100] pb-[5px] will-change-transform',
              style: {left: flight.to.x, top: flight.to.y, width: flight.to.width, height: flight.to.height},
              initial: {
                x: flight.from.x + flight.from.width / 2 - (flight.to.x + flight.to.width / 2),
                y: flight.from.y + flight.from.height / 2 - (flight.to.y + flight.to.height / 2),
                scale: 0.94,
              },
              animate: {x: 0, y: 0, scale: 1},
              transition: {type: 'spring', visualDuration: 0.15, bounce: 0.06},
              onAnimationComplete: () => setFlight(void 0),
              children: [
                (0, jsxRuntime.jsx)('div', {
                  className:
                    'bg-foreground text-background no-squircle h-[calc(100%-5px)] overflow-hidden rounded-[16px] px-3 py-[7px] text-[13px] leading-[1.3] wrap-anywhere',
                  children: (0, jsxRuntime.jsx)(OwnMessageText, {text}),
                }),
                (0, jsxRuntime.jsx)(Y, {sender: 'me', className: 'text-foreground'}),
              ],
            }),
            document.body,
          ),
      ],
    })
  );
} /** The conversation: grouped messages, day breaks, the unread line, thread counts, read tracking and scroll pinning. */
function $s({
  messages,
  allMessages,
  typing,
  loading = false,
  highlighted,
  firstUnreadId,
  onRead,
  onReadingChange,
  onReact,
  onReply,
  onJump,
  onRetry,
  onAnswer,
  prefix = 'chat',
  history,
}) {
  const scroller = (0, React.useRef)(null),
    pinnedToBottom = (0, React.useRef)(true),
    lastScrollTop = (0, React.useRef)(0),
    [atBottom, setAtBottom] = (0, React.useState)(true),
    reducedMotion = H(),
    lastOwnId = messages.findLast(entry => entry.isOwn ?? entry.message.role === 'user')?.id,
    previousOwnId = (0, React.useRef)(lastOwnId),
    lastScrollHeight = (0, React.useRef)(0),
    firstId = (0, React.useRef)(messages[0]?.id);
  ((0, React.useLayoutEffect)(() => {
    const reportReading = () =>
      onReadingChange?.(atBottom && document.visibilityState === 'visible' && document.hasFocus());
    return (
      reportReading(),
      window.addEventListener('focus', reportReading),
      window.addEventListener('blur', reportReading),
      document.addEventListener('visibilitychange', reportReading),
      () => {
        (window.removeEventListener('focus', reportReading),
          window.removeEventListener('blur', reportReading),
          document.removeEventListener('visibilitychange', reportReading));
      }
    );
  }, [atBottom, onReadingChange]),
    (0, React.useLayoutEffect)(() => {
      const list = scroller.current,
        content = list?.firstElementChild;
      if (!list || !content) return;
      const observer = new ResizeObserver(() => {
        (pinnedToBottom.current && (list.scrollTop = list.scrollHeight),
          (lastScrollHeight.current = list.scrollHeight));
      });
      return (observer.observe(content), () => observer.disconnect());
    }, []));
  const contentKey = messages.map(entry => `${entry.id}:${String(entry.message.content)}:${entry.delivery}`).join('|');
  return (
    (0, React.useLayoutEffect)(() => {
      const list = scroller.current,
        sentNow =
          lastOwnId !== previousOwnId.current && messages.find(entry => entry.id === lastOwnId)?.delivery === 'sending',
        olderLoaded = firstId.current !== messages[0]?.id && messages.some(entry => entry.id === firstId.current);
      (list &&
        olderLoaded &&
        !pinnedToBottom.current &&
        (list.scrollTop += list.scrollHeight - lastScrollHeight.current),
        list &&
          (pinnedToBottom.current || sentNow) &&
          ((list.scrollTop = list.scrollHeight), (pinnedToBottom.current = true), setAtBottom(true)),
        (previousOwnId.current = lastOwnId),
        (firstId.current = messages[0]?.id),
        list && (lastScrollHeight.current = list.scrollHeight));
    }, [contentKey, typing, lastOwnId]),
    (0, React.useLayoutEffect)(() => {
      const list = scroller.current;
      if (!list || !onRead) return;
      let timer;
      const reportVisible = () => {
        (clearTimeout(timer),
          (timer = setTimeout(() => {
            if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
            const bounds = list.getBoundingClientRect(),
              lastVisible = [...list.querySelectorAll('[data-channel-entry]')].findLast(row => {
                const rowBounds = row.getBoundingClientRect();
                return rowBounds.top < bounds.bottom && rowBounds.bottom > bounds.top;
              });
            lastVisible?.dataset.channelEntry && onRead(lastVisible.dataset.channelEntry);
          }, 250)));
      };
      return (
        list.addEventListener('scroll', reportVisible),
        window.addEventListener('focus', reportVisible),
        document.addEventListener('visibilitychange', reportVisible),
        document.addEventListener('focusin', reportVisible),
        document.addEventListener('pointerdown', reportVisible),
        reportVisible(),
        () => {
          (clearTimeout(timer),
            list.removeEventListener('scroll', reportVisible),
            window.removeEventListener('focus', reportVisible),
            document.removeEventListener('visibilitychange', reportVisible),
            document.removeEventListener('focusin', reportVisible),
            document.removeEventListener('pointerdown', reportVisible));
        }
      );
    }, [contentKey, onRead]),
    (0, jsxRuntime.jsxs)('div', {
      className: 'relative flex min-h-0 flex-1 flex-col',
      children: [
        (0, jsxRuntime.jsx)('div', {
          ref: scroller,
          role: 'log',
          'aria-label': prefix === 'chat' ? 'Conversation' : 'Reply conversation',
          'aria-live': 'polite',
          'aria-relevant': 'additions',
          'aria-busy': loading,
          className: 'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain',
          onScroll: event => {
            const list = event.currentTarget,
              nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 48;
            (nearBottom
              ? (pinnedToBottom.current = true)
              : list.scrollTop < lastScrollTop.current - 1 && (pinnedToBottom.current = false),
              (lastScrollTop.current = list.scrollTop),
              setAtBottom(nearBottom || pinnedToBottom.current));
          },
          children: (0, jsxRuntime.jsxs)('div', {
            className: 'mx-auto flex min-h-full w-full max-w-3xl flex-col justify-end px-4 pb-4',
            children: [
              history && (0, jsxRuntime.jsx)('div', {className: 'flex justify-center py-2', children: history}),
              loading && messages.length === 0
                ? (0, jsxRuntime.jsx)('div', {
                    role: 'status',
                    'aria-label': 'Loading messages',
                    className: 'flex flex-col gap-7 py-6',
                    children: [false, true, false].map((own, index) =>
                      (0, jsxRuntime.jsxs)(
                        'div',
                        {
                          className: `flex w-3/4 max-w-md flex-col gap-3 ${own ? 'self-end' : ''}`,
                          children: [
                            (0, jsxRuntime.jsx)(K, {className: 'h-3 w-20 motion-reduce:animate-none'}),
                            (0, jsxRuntime.jsxs)('div', {
                              className: 'border-border/50 flex flex-col gap-2.5 rounded-2xl border p-4',
                              children: [
                                (0, jsxRuntime.jsx)(K, {className: 'h-3 w-full motion-reduce:animate-none'}),
                                (0, jsxRuntime.jsx)(K, {className: 'h-3 w-4/5 motion-reduce:animate-none'}),
                                !own && (0, jsxRuntime.jsx)(K, {className: 'h-3 w-3/5 motion-reduce:animate-none'}),
                              ],
                            }),
                          ],
                        },
                        index,
                      ),
                    ),
                  })
                : messages.length === 0
                  ? (0, jsxRuntime.jsxs)('div', {
                      className:
                        'text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 py-16 text-sm select-none',
                      children: [
                        (0, jsxRuntime.jsx)('p', {
                          className: 'text-foreground font-medium',
                          children: 'A little space to talk.',
                        }),
                        (0, jsxRuntime.jsx)('p', {children: 'Send a message to get started.'}),
                      ],
                    })
                  : messages.map((entry, index) => {
                      const answer = allMessages.find(
                          candidate =>
                            candidate.replyTo === entry.id &&
                            candidate.message.role === 'user' &&
                            candidate.delivery !== 'failed' &&
                            candidate.delivery !== 'sending',
                        ),
                        previous = messages[index - 1],
                        next = messages[index + 1],
                        timeBreak = !previous || entry.message.timestamp - previous.message.timestamp > 3e5,
                        grouped =
                          !!previous &&
                          entry.id !== firstUnreadId &&
                          !timeBreak &&
                          previous.message.role === entry.message.role &&
                          previous.authorLabel === entry.authorLabel &&
                          previous.isOwn === entry.isOwn &&
                          (prefix === 'replies' || !entry.replyTo),
                        groupedNext =
                          !!next &&
                          next.id !== firstUnreadId &&
                          (prefix === 'replies' || !next.replyTo) &&
                          next.message.role === entry.message.role &&
                          next.authorLabel === entry.authorLabel &&
                          next.isOwn === entry.isOwn &&
                          next.message.timestamp - entry.message.timestamp <= 3e5;
                      let runStart = index;
                      for (; runStart > 0;) {
                        const current = messages[runStart],
                          before = messages[runStart - 1];
                        if (
                          (prefix === 'chat' && current.replyTo) ||
                          current.message.role !== before.message.role ||
                          current.authorLabel !== before.authorLabel ||
                          current.isOwn !== before.isOwn ||
                          current.message.timestamp - before.message.timestamp > 3e5
                        )
                          break;
                        runStart--;
                      }
                      const threads =
                        prefix === 'chat' && !groupedNext
                          ? messages
                              .slice(runStart, index + 1)
                              .map(root => ({
                                root,
                                count: allMessages.filter(reply => reply.replyRootId === root.id).length,
                              }))
                              .filter(thread => thread.count > 0)
                          : [];
                      return (0, jsxRuntime.jsxs)(
                        V.div,
                        {
                          'data-channel-entry': entry.id === 'orchestrator-typing' ? void 0 : entry.id,
                          layout: reducedMotion ? false : 'position',
                          transition: {layout: {duration: 0.2, ease: 'easeOut'}},
                          children: [
                            timeBreak &&
                              (0, jsxRuntime.jsx)('div', {
                                className: 'text-muted-foreground py-5 text-center text-xs select-none',
                                children: (0, jsxRuntime.jsx)('time', {
                                  dateTime: new Date(entry.message.timestamp).toISOString(),
                                  children: new Date(entry.message.timestamp).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  }),
                                }),
                              }),
                            entry.id === firstUnreadId &&
                              (0, jsxRuntime.jsxs)('div', {
                                role: 'separator',
                                'aria-label': 'New messages',
                                className:
                                  'flex items-center gap-3 py-4 text-[10px] font-semibold tracking-wider text-brand-content select-none',
                                children: [
                                  (0, jsxRuntime.jsx)('span', {className: 'h-px flex-1 bg-current opacity-35'}),
                                  'NEW',
                                  (0, jsxRuntime.jsx)('span', {className: 'h-px flex-1 bg-current opacity-35'}),
                                ],
                              }),
                            (0, jsxRuntime.jsx)(Message, {
                              entry,
                              widgetAnswer: answer ? messageText(answer.message) : void 0,
                              onAnswer: onAnswer ? answerText => onAnswer(entry.id, answerText) : void 0,
                              quoted:
                                prefix === 'chat'
                                  ? allMessages.find(candidate => candidate.id === entry.replyTo)
                                  : void 0,
                              grouped,
                              groupedNext,
                              showReceipt: entry.id === lastOwnId,
                              highlighted: highlighted === entry.id,
                              onReact: emoji => onReact(entry.id, emoji),
                              onReply: () => onReply(entry),
                              onJump,
                              onRetry: () => onRetry(entry.id),
                              prefix,
                            }),
                            threads.length > 0 &&
                              (0, jsxRuntime.jsx)('div', {
                                className: `flex flex-col pt-0.5 ${entry.message.role === 'user' ? 'items-end' : 'items-start'}`,
                                children: threads.map(({root, count}) =>
                                  (0, jsxRuntime.jsxs)(
                                    'button',
                                    {
                                      type: 'button',
                                      onClick: () => onReply(root),
                                      className:
                                        'text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded px-3 py-0.5 text-xs outline-none select-none focus-visible:ring-2',
                                      children: [count, ' ', count === 1 ? 'Reply' : 'Replies'],
                                    },
                                    root.id,
                                  ),
                                ),
                              }),
                          ],
                        },
                        entry.id,
                      );
                    }),
            ],
          }),
        }),
        !atBottom &&
          (0, jsxRuntime.jsx)(A, {
            variant: 'secondary',
            size: 'icon',
            className: 'absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full shadow-md',
            'aria-label': 'Scroll to bottom',
            onClick: () => {
              ((pinnedToBottom.current = true),
                scroller.current?.scrollTo({
                  top: scroller.current.scrollHeight,
                  behavior: reducedMotion ? 'instant' : 'smooth',
                }));
            },
            children: (0, jsxRuntime.jsx)(ArrowDownIcon, {className: 'size-4'}),
          }),
      ],
    })
  );
}
