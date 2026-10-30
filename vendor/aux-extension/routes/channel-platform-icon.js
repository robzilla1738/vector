/* Aux-owned source: a live preview of a browser tab and a channel's platform icon
 * (assets/channel-platform-icon-Cjhdli_M.js, the module body). The player runs in a frame; it streams only
 * while its frame is on screen and the window is active, and says when it has painted.
 * Names the rest of the chunk uses keep their chunk names: se the preview, ne the icon (exported).
 * Chunk names used: M/N React, V JSX runtime, p cn, B window activity, O/D Discord and Slack marks,
 * C Telegram, z/U/W tooltip, h/A/H/x zod, $ search params, k the extension ID. */
var React = M(N(), 1),
  jsxRuntime = V();
/** A box of a fixed ratio. */
function AspectRatio({ratio, className, ...props}) {
  return (0, jsxRuntime.jsx)('div', {
    'data-slot': 'aspect-ratio',
    style: {'--ratio': ratio},
    className: p('relative aspect-(--ratio)', className),
    ...props,
  });
}
var /** What the preview shares with its player page. */
  TAB_PREVIEW = {
    extensionId: k,
    playerDocumentPath: 'tab-preview-player.html',
    readyMessageType: 'aux.tab-preview.ready',
    renderStateMessageType: 'aux.tab-preview.render-state',
    streamPort: 'aux.tab-preview.stream',
    visibilityMessageType: 'aux.tab-preview.visibility',
  },
  /** A size the player reports. */
  previewSizeSchema = A({
    width: x().int().positive(),
    height: x().int().positive(),
  }),
  /** What the player is opened with. */
  previewParamsSchema = A({
    parentOrigin: h().min(1),
    targetId: h().min(1),
    title: h().default('Browser tab preview'),
    analyzeTopTone: H().default(false),
  }),
  /** The size previews are drawn for. */
  PREVIEW_SIZE = {width: 1440, height: 900},
  PREVIEW_RATIO = PREVIEW_SIZE.width / PREVIEW_SIZE.height,
  /** The preview. */
  se = ({className, targetId, title = 'Browser preview', enabled = true, onTopToneChange}) => {
    const [container, setContainer] = (0, React.useState)(null),
      [painted, setPainted] = (0, React.useState)(false),
      frameRef = (0, React.useRef)(null),
      onScreen = useOnScreen(container),
      windowActive = B(),
      live = enabled && onScreen && windowActive,
      parentOrigin = window.location.origin,
      analyzeTopTone = onTopToneChange !== void 0,
      src = (0, React.useMemo)(
        () => previewUrl({parentOrigin, targetId, title: 'Browser tab preview', analyzeTopTone}),
        [parentOrigin, targetId, analyzeTopTone],
      ),
      origin = (0, React.useMemo)(() => new URL(src).origin, [src]),
      sendVisibility = (0, React.useEffectEvent)(() => {
        frameRef.current?.contentWindow?.postMessage({type: TAB_PREVIEW.visibilityMessageType, live}, '*');
      }),
      reportTone = (0, React.useEffectEvent)(tone => {
        onTopToneChange?.(tone);
      }),
      handleLoad = () => {
        sendVisibility();
      };
    return (
      (0, React.useEffect)(() => {
        sendVisibility();
      }, [origin, live]),
      (0, React.useEffect)(() => {
        (setPainted(false), reportTone(null));
      }, [src]),
      (0, React.useEffect)(() => {
        const handleMessage = event => {
          if (!(event.source !== frameRef.current?.contentWindow || event.origin !== origin)) {
            if (event.data?.type === TAB_PREVIEW.readyMessageType) {
              sendVisibility();
              return;
            }
            if (event.data?.type === TAB_PREVIEW.renderStateMessageType) {
              setPainted(event.data.visible === true);
              const topTone = event.data.topTone;
              reportTone(topTone === 'light' || topTone === 'dark' ? topTone : null);
            }
          }
        };
        return (
          window.addEventListener('message', handleMessage),
          () => {
            window.removeEventListener('message', handleMessage);
          }
        );
      }, [origin]),
      (0, jsxRuntime.jsx)(AspectRatio, {
        ratio: PREVIEW_RATIO,
        children: (0, jsxRuntime.jsx)('div', {
          ref: setContainer,
          className: p('bg-secondary relative size-full', className),
          children: (0, jsxRuntime.jsx)(
            'iframe',
            {
              ref: frameRef,
              className: p(
                'absolute inset-0 size-full border-0 bg-transparent transition-opacity duration-150',
                painted ? 'opacity-100' : 'opacity-0',
              ),
              src,
              title: `${title} live preview`,
              allow: 'autoplay; camera; microphone; display-capture',
              onLoad: handleLoad,
            },
            src,
          ),
        }),
      })
    );
  };
/** Whether an element is at least a tenth on screen. */
function useOnScreen(element) {
  const [visible, setVisible] = (0, React.useState)(false),
    update = (0, React.useEffectEvent)(value => {
      setVisible(value);
    });
  return (
    (0, React.useEffect)(() => {
      if (!element) {
        update(false);
        return;
      }
      if (!window.IntersectionObserver) {
        update(true);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          update(!!(entry?.isIntersecting && entry.intersectionRatio >= 0.1));
        },
        {threshold: 0.1},
      );
      return (
        observer.observe(element),
        () => {
          observer.disconnect();
        }
      );
    }, [element]),
    visible
  );
}
/** The player page's URL. */
function previewUrl(params) {
  const query = $(params);
  return `${typeof chrome < 'u' && typeof chrome.runtime?.getURL == 'function' ? chrome.runtime.getURL(TAB_PREVIEW.playerDocumentPath) : `chrome-extension://${TAB_PREVIEW.extensionId}/${TAB_PREVIEW.playerDocumentPath}`}?data=${query}`;
}
var /** The platforms and their marks. */
  PLATFORMS = {
    slack: {label: 'Slack', icon: D},
    telegram: {label: 'Telegram', icon: C},
    discord: {label: 'Discord', icon: O},
  },
  /** A channel's platform, with its name in a tooltip. */
  ne = ({platform, channelName, className, showTooltip = true}) => {
    const config = platform && platform in PLATFORMS ? PLATFORMS[platform] : void 0;
    if (!config) return null;
    const Icon = config.icon,
      label = [config.label, channelName].filter(Boolean).join(' · '),
      icon = (0, jsxRuntime.jsx)('span', {
        'aria-hidden': !showTooltip,
        className: p('text-muted-foreground relative z-10 flex', className),
        children: (0, jsxRuntime.jsx)(Icon, {className: 'size-[14px]'}),
      });
    return showTooltip
      ? (0, jsxRuntime.jsxs)(W, {
          children: [
            (0, jsxRuntime.jsx)(z, {'aria-label': label, children: icon}),
            (0, jsxRuntime.jsx)(U, {children: label}),
          ],
        })
      : icon;
  };
