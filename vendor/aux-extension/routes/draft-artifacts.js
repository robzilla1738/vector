/* Aux-owned source, draft artifacts, second pass (assets/draft-artifacts-registry-CZ58X0Cu.js, from the carousel
 * context to the end of the module): the image carousel, images from sessions with their zoom into the page,
 * and what a chat draws for a draft fenced as JSON: calendar events, email, iMessage, LinkedIn, Slack and X
 * previews, each made to look like the app it is for, and the registry that picks one for a code fence.
 * Names the rest of the chunk and its importers use keep their chunk names: Cr the bubble tail (a), Mt draft data
 * (c), We a session image (d), De the cached image (f), hs is a draft language (i), xs the image set (l), Pt the
 * draft languages (n), xt a file's thumbnail (o), bs the registry (r), gs drafts in Markdown as text (s), Rr the draft
 * (t), ps a Markdown image (u).
 * Chunk names used: r JSX runtime, N React, k cn, Qe useEmblaCarousel, Nt Button, Jt/Xt arrows, tn the API base,
 * nn authenticated fetch, Qt/Yt/He/jt/en/vt/Kt the session file URLs and their checks, Ae motion, dn AnimatePresence, fn
 * Portal, an a JSON parser's module, mn Markdown parse, Ge dayjs, oe/ae/ce avatar parts, on/gn/hn/bn/cn/xn/rn/sn/yt/Me the
 * calendar, Gmail, Slack, X and LinkedIn marks and icons, ln/un copy button parts, wt a file icon, bt useApp, pn the
 * session context. */
var /** The carousel's context. */ CarouselContext = N.createContext(null); /** The carousel around a part. */
function useCarousel() {
  const carousel = N.use(CarouselContext);
  if (!carousel) throw new Error('useCarousel must be used within a <Carousel />');
  return carousel;
} /** A carousel on Embla: arrow keys, and whether it can scroll either way. */
function Carousel({orientation = 'horizontal', opts, setApi, plugins, className, children, ...props}) {
  const [carouselRef, api] = Qe({...opts, axis: orientation === 'horizontal' ? 'x' : 'y'}, plugins),
    [canScrollPrev, setCanScrollPrev] = N.useState(false),
    [canScrollNext, setCanScrollNext] = N.useState(false),
    updateScroll = N.useRef(() => {});
  updateScroll.current = embla => {
    embla && (setCanScrollPrev(embla.canScrollPrev()), setCanScrollNext(embla.canScrollNext()));
  };
  const scrollPrev = N.useCallback(() => {
      api?.scrollPrev();
    }, [api]),
    scrollNext = N.useCallback(() => {
      api?.scrollNext();
    }, [api]),
    handleKeyDown = N.useCallback(
      event => {
        (orientation === 'horizontal' && event.key === 'ArrowLeft' && (event.preventDefault(), scrollPrev()),
          orientation === 'horizontal' && event.key === 'ArrowRight' && (event.preventDefault(), scrollNext()));
      },
      [orientation, scrollNext, scrollPrev],
    );
  return (
    N.useEffect(() => {
      !api || !setApi || setApi(api);
    }, [api, setApi]),
    N.useEffect(() => {
      if (!api) return;
      const update = embla => {
        updateScroll.current(embla);
      };
      return (
        update(api),
        api.on('reInit', update),
        api.on('select', update),
        () => {
          (api.off('reInit', update), api.off('select', update));
        }
      );
    }, [api]),
    (0, r.jsx)(CarouselContext.Provider, {
      value: {
        api,
        canScrollNext,
        canScrollPrev,
        carouselRef,
        opts,
        orientation,
        plugins,
        scrollNext,
        scrollPrev,
        setApi,
      },
      children: (0, r.jsx)('span', {
        'aria-roledescription': 'carousel',
        className: k('relative block w-full', className),
        'data-slot': 'carousel',
        onKeyDownCapture: handleKeyDown,
        role: 'region',
        ...props,
        children,
      }),
    })
  );
} /** Its track. */
function CarouselContent({className, ...props}) {
  const {carouselRef, orientation} = useCarousel();
  return (0, r.jsx)('span', {
    className: 'block overflow-hidden',
    'data-slot': 'carousel-content',
    ref: carouselRef,
    children: (0, r.jsx)('span', {
      className: k('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className),
      ...props,
    }),
  });
} /** A slide. */
function CarouselItem({className, ...props}) {
  const {orientation} = useCarousel();
  return (0, r.jsx)('span', {
    'aria-roledescription': 'slide',
    className: k('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-4' : 'pt-4', className),
    'data-slot': 'carousel-item',
    role: 'group',
    ...props,
  });
} /** The previous button. */
function CarouselPrevious({className, variant = 'outline', size = 'icon-sm', shape = 'pill', ...props}) {
  const {canScrollPrev, orientation, scrollPrev} = useCarousel();
  return (0, r.jsxs)(Nt, {
    className: k(
      'absolute touch-manipulation rounded-full',
      orientation === 'horizontal'
        ? 'top-1/2 -left-12 -translate-y-1/2'
        : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
      className,
    ),
    'data-slot': 'carousel-previous',
    disabled: !canScrollPrev,
    onClick: scrollPrev,
    shape,
    size,
    variant,
    ...props,
    children: [(0, r.jsx)(Jt, {}), (0, r.jsx)('span', {className: 'sr-only', children: 'Previous slide'})],
  });
} /** The next button. */
function CarouselNext({className, variant = 'outline', size = 'icon-sm', shape = 'pill', ...props}) {
  const {canScrollNext, orientation, scrollNext} = useCarousel();
  return (0, r.jsxs)(Nt, {
    className: k(
      'absolute touch-manipulation rounded-full',
      orientation === 'horizontal'
        ? 'top-1/2 -right-12 -translate-y-1/2'
        : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
      className,
    ),
    'data-slot': 'carousel-next',
    disabled: !canScrollNext,
    onClick: scrollNext,
    shape,
    size,
    variant,
    ...props,
    children: [(0, r.jsx)(Xt, {}), (0, r.jsx)('span', {className: 'sr-only', children: 'Next slide'})],
  });
} /** Is it a file the daemon serves, fetched with the session's credentials? */
function isSessionFileUrl(url) {
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === new URL(tn).origin;
  } catch {
    return false;
  }
}
var CACHED_IMAGE_LIMIT = 48,
  CACHED_BYTES_LIMIT = 33554432 /** Fetched images by URL, in use or in the order last used. */,
  imageCache = new Map(); /** Drops a use of an image, and the oldest unused images past the limits. */
function releaseImage(entry) {
  if (!entry || --entry.users > 0 || imageCache.get(entry.src) !== entry) return;
  (imageCache.delete(entry.src), entry.url && imageCache.set(entry.src, entry));
  const unused = [...imageCache.values()].filter(candidate => candidate.users === 0);
  let bytes = unused.reduce((candidate, total) => candidate + total.size, 0),
    count = unused.length;
  for (const candidate of unused) {
    if (bytes <= CACHED_BYTES_LIMIT && count <= CACHED_IMAGE_LIMIT) break;
    (imageCache.delete(candidate.src), URL.revokeObjectURL(candidate.url), (bytes -= candidate.size), count--);
  }
} /** Fetches an image once for all its users. */
function retainImage(src) {
  const cached = imageCache.get(src);
  if (cached) return (cached.users++, imageCache.delete(src), imageCache.set(src, cached), cached);
  const entry = {src, size: 0, users: 1};
  return (
    imageCache.set(src, entry),
    (entry.promise = nn(src)
      .then(async response => {
        if (!response.ok || imageCache.get(src) !== entry) return;
        const blob = await response.blob();
        imageCache.get(src) === entry && ((entry.url = URL.createObjectURL(blob)), (entry.size = blob.size));
      })
      .catch(response => {
        (response instanceof DOMException && response.name === 'AbortError') || console.error(response);
      })),
    entry
  );
} /** The URL to draw an image from: an object URL for a session file, else the URL itself. */
function De(src, options = {}) {
  const [entry, setEntry] = (0, N.useState)(),
    held = (0, N.useRef)(void 0),
    retainPrevious = options.retainPrevious ?? false,
    onError = (0, N.useEffectEvent)(() => options.onError?.()),
    isSessionFile = !!src && isSessionFileUrl(src);
  return (
    (0, N.useEffect)(() => {
      if (
        ((!retainPrevious || (src && !isSessionFileUrl(src))) &&
          held.current?.src !== src &&
          (releaseImage(held.current), (held.current = void 0), setEntry(void 0)),
        !src || !isSessionFileUrl(src) || held.current?.src === src)
      )
        return;
      let cancelled = false,
        pending = true;
      const next = retainImage(src);
      return (
        Promise.resolve(next.promise).then(() => {
          if (!cancelled) {
            if (((pending = false), !next.url)) {
              (releaseImage(next), onError());
              return;
            }
            (releaseImage(held.current), (held.current = next), setEntry(next));
          }
        }),
        () => {
          ((cancelled = true), pending && releaseImage(next));
        }
      );
    }, [retainPrevious, src]),
    (0, N.useEffect)(
      () => () => {
        (releaseImage(held.current), (held.current = void 0));
      },
      [],
    ),
    isSessionFile
      ? entry?.src === src || retainPrevious
        ? entry?.url
        : void 0
      : (src ?? (retainPrevious ? entry?.url : void 0))
  );
}
var PREVIEW_SIZE = {previewMaxBytes: 1048576, previewMaxHeight: 1200, previewMaxWidth: 1200} /** A Markdown image. */,
  ps = ({node, sessionId, src, title, ...props}) => {
    if (typeof src != 'string' || src.length === 0) return null;
    const url = previewUrl(src, sessionId);
    return (0, r.jsx)(We, {caption: typeof title == 'string' ? title : void 0, src: url, title, ...props});
  };
function previewUrl(src, sessionId) {
  return Qt(src, sessionId, PREVIEW_SIZE) ?? src;
}
function withPreviewUrls(images, sessionId) {
  return images.map(image => ({...image, src: previewUrl(image.src, sessionId)}));
}
var /** One image, or a carousel of them. */
  xs = ({
    images,
    className,
    imageClassName,
    sessionId,
    itemClassName = 'basis-[85%] sm:basis-[min(26rem,calc(50%-0.375rem))] xl:basis-[min(21rem,calc(33.333%-0.5rem))]',
  }) => {
    if (images.length === 0) return null;
    const previews = withPreviewUrls(images, sessionId);
    if (images.length === 1) {
      const image = previews[0];
      return (0, r.jsx)(We, {
        alt: image.alt,
        caption: image.caption,
        className: k('aspect-square w-full max-w-[min(28rem,100%)] object-cover', imageClassName),
        src: image.src,
      });
    }
    return (0, r.jsxs)(Carousel, {
      'aria-label': 'Generated images',
      className: k('relative w-full max-w-full', className),
      opts: {align: 'start'},
      children: [
        (0, r.jsx)(CarouselContent, {
          'aria-label': 'Generated images',
          className: 'scrollbar-none pr-8 pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          children: previews.map((image, index) =>
            (0, r.jsx)(
              CarouselItem,
              {
                className: itemClassName,
                children: (0, r.jsx)(We, {
                  alt: image.alt,
                  className: k('my-0 aspect-square w-full max-w-none object-cover', imageClassName),
                  caption: image.caption,
                  src: image.src,
                }),
              },
              `${image.src}-${index}`,
            ),
          ),
        }),
        (0, r.jsx)(CarouselPrevious, {
          className: 'left-2 z-10 backdrop-blur-md',
          shape: 'pill',
          size: 'icon-sm',
          variant: 'outline',
        }),
        (0, r.jsx)(CarouselNext, {
          className: 'right-2 z-10 backdrop-blur-md',
          shape: 'pill',
          size: 'icon-sm',
          variant: 'outline',
        }),
      ],
    });
  } /** A session image. */,
  We = ({src, ...props}) => {
    const previewSrc = De(src);
    return previewSrc ? (0, r.jsx)(ZoomableImage, {...props, fullSrc: Yt(src), previewSrc}) : null;
  } /** An image that zooms into the page, and back to its place if that is still in view. */,
  ZoomableImage = ({alt = 'Image', caption, className, fullSrc, onClick, onKeyDown, previewSrc, ...props}) => {
    const [phase, setPhase] = (0, N.useState)('closed'),
      [geometry, setGeometry] = (0, N.useState)(null),
      [loadedSrc, setLoadedSrc] = (0, N.useState)(null),
      [hidden, setHidden] = (0, N.useState)(false),
      imageRef = (0, N.useRef)(null),
      fit = className?.includes('object-cover') ? 'object-cover' : 'object-contain',
      opening = phase === 'opening',
      expanded = phase === 'opening' || phase === 'open',
      closingMorph = phase === 'closing-morph',
      closingFade = phase === 'closing-fade',
      zoomed = phase !== 'closed',
      shownSrc = De(zoomed ? fullSrc : void 0) ?? previewSrc,
      ready = shownSrc === previewSrc || loadedSrc === shownSrc,
      frame = geometry
        ? expanded
          ? {
              height: geometry.targetHeight,
              left: geometry.targetLeft,
              top: geometry.targetTop,
              width: geometry.targetWidth,
            }
          : closingMorph
            ? {
                height: geometry.sourceHeight,
                left: geometry.sourceLeft,
                top: geometry.sourceTop,
                width: geometry.sourceWidth,
              }
            : {
                height: geometry.targetHeight,
                left: geometry.targetLeft,
                top: geometry.targetTop,
                width: geometry.targetWidth,
              }
        : null,
      shownFit = (phase === 'open' && ready) || closingFade ? 'object-contain' : fit,
      frameSrc = phase === 'open' && ready ? shownSrc : previewSrc;
    ((0, N.useEffect)(() => {
      !opening || !imageRef.current || setGeometry(zoomGeometry(imageRef.current));
    }, [opening]),
      (0, N.useEffect)(() => {
        if (!opening || !geometry) return;
        const frame = window.requestAnimationFrame(() => {
          setHidden(true);
        });
        return () => {
          window.cancelAnimationFrame(frame);
        };
      }, [geometry, opening]),
      (0, N.useEffect)(() => {
        if (!zoomed || ready || shownSrc === previewSrc) return;
        let cancelled = false;
        const image = new Image(),
          finish = () => {
            cancelled || setLoadedSrc(shownSrc);
          };
        if (((image.decoding = 'async'), (image.src = shownSrc), image.complete)) {
          finish();
          return;
        }
        return (
          image.addEventListener('load', finish, {once: true}),
          image.addEventListener('error', finish, {once: true}),
          () => {
            ((cancelled = true), image.removeEventListener('load', finish), image.removeEventListener('error', finish));
          }
        );
      }, [shownSrc, ready, zoomed, previewSrc]),
      (0, N.useEffect)(() => {
        if (!zoomed) return;
        const closeOnEscape = event => {
            event.key === 'Escape' && close();
          },
          scroller = scrollParent(imageRef.current) ?? window,
          closeOnScroll = () => {
            close();
          },
          closeOnGesture = () => {
            close();
          };
        return (
          document.addEventListener('keydown', closeOnEscape),
          document.addEventListener('touchmove', closeOnGesture, {passive: true}),
          document.addEventListener('wheel', closeOnGesture, {passive: true}),
          scroller.addEventListener('scroll', closeOnScroll, {passive: true}),
          () => {
            (document.removeEventListener('keydown', closeOnEscape),
              document.removeEventListener('touchmove', closeOnGesture),
              document.removeEventListener('wheel', closeOnGesture),
              scroller.removeEventListener('scroll', closeOnScroll));
          }
        );
      }, [zoomed]));
    const open = () => {
        if (!imageRef.current) return;
        const next = zoomGeometry(imageRef.current);
        (setHidden(false), setGeometry(next), setPhase('opening'));
      },
      close = () => {
        phase === 'closed' ||
          phase === 'closing-morph' ||
          phase === 'closing-fade' ||
          (setHidden(false), setPhase(closingKind(imageRef.current)));
      },
      handleClick = event => {
        if ((onClick?.(event), !event.defaultPrevented)) {
          if ((event.preventDefault(), event.stopPropagation(), zoomed)) {
            close();
            return;
          }
          open();
        }
      },
      handleKeyDown = event => {
        if ((onKeyDown?.(event), !(event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')))) {
          if ((event.preventDefault(), event.stopPropagation(), zoomed)) {
            close();
            return;
          }
          open();
        }
      };
    return (0, r.jsxs)(r.Fragment, {
      children: [
        (0, r.jsx)('img', {
          alt,
          'aria-expanded': zoomed,
          'aria-label': zoomed ? 'Collapse image' : 'Expand image',
          className: k(
            'ring-border-surface my-2 max-h-96 w-auto max-w-full cursor-zoom-in rounded-xl object-contain shadow-sm',
            hidden && 'opacity-0',
            className,
          ),
          decoding: 'auto',
          loading: 'lazy',
          onClick: handleClick,
          onKeyDown: handleKeyDown,
          ref: imageRef,
          role: 'button',
          src: previewSrc,
          tabIndex: 0,
          ...props,
        }),
        (0, r.jsx)(dn, {
          children: geometry
            ? (0, r.jsx)(fn, {
                children: (0, r.jsxs)(r.Fragment, {
                  children: [
                    (0, r.jsx)(Ae.div, {
                      animate: {opacity: expanded ? 1 : 0},
                      className: 'bg-background/50 fixed inset-0 cursor-zoom-out select-none',
                      initial: {opacity: 0},
                      onClick: close,
                      style: {pointerEvents: expanded ? 'auto' : 'none', zIndex: expanded ? 1e3 : 4},
                      transition: {duration: 0.1, ease: 'easeOut'},
                    }),
                    (0, r.jsxs)(Ae.div, {
                      animate: {
                        opacity: closingFade ? 0 : 1,
                        height: frame?.height ?? geometry.targetHeight,
                        left: frame?.left ?? geometry.targetLeft,
                        top: frame?.top ?? geometry.targetTop,
                        width: frame?.width ?? geometry.targetWidth,
                      },
                      className: 'fixed flex cursor-zoom-out flex-col items-center gap-3 select-none',
                      initial: {
                        height: geometry.sourceHeight,
                        left: geometry.sourceLeft,
                        opacity: 1,
                        top: geometry.sourceTop,
                        width: geometry.sourceWidth,
                      },
                      onAnimationComplete: () => {
                        if (phase === 'opening') {
                          setPhase('open');
                          return;
                        }
                        (phase === 'closing-morph' || phase === 'closing-fade') &&
                          (setGeometry(null), setPhase('closed'), setHidden(false));
                      },
                      onClick: close,
                      style: {
                        pointerEvents: expanded ? 'auto' : 'none',
                        zIndex: expanded ? 1001 : 5,
                        transformOrigin: 'center center',
                      },
                      transition: {damping: 28, stiffness: 340, type: 'spring'},
                      children: [
                        (0, r.jsx)(Ae.img, {
                          alt,
                          animate: {
                            filter: closingMorph ? 'blur(10px)' : 'blur(0px)',
                            opacity: closingMorph ? 0 : 1,
                            scale: closingMorph ? 0.94 : 1,
                          },
                          className: k('bg-background h-full w-full shadow-2xl', shownFit),
                          decoding: 'auto',
                          draggable: false,
                          src: frameSrc,
                          transition: {duration: 0.12, ease: 'easeOut'},
                        }),
                        caption
                          ? (0, r.jsx)(Ae.p, {
                              animate: {
                                opacity: phase === 'open' && ready ? 1 : 0,
                                y: phase === 'open' && ready ? 0 : -8,
                              },
                              className: 'text-muted-foreground max-w-[min(90vw,40rem)] text-center text-sm',
                              exit: {opacity: 0, y: -8},
                              initial: {opacity: 0, y: -8},
                              transition: {duration: 0.07, ease: 'easeOut'},
                              children: caption,
                            })
                          : null,
                      ],
                    }),
                  ],
                }),
              })
            : null,
        }),
      ],
    });
  }; /** Where the image is and where it zooms to. */
function zoomGeometry(image) {
  const rect = image.getBoundingClientRect(),
    width = window.innerWidth,
    height = window.innerHeight,
    maxWidth = width * 0.9,
    maxHeight = height * 0.85,
    naturalWidth = image.naturalWidth || rect.width,
    naturalHeight = image.naturalHeight || rect.height,
    scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1),
    targetWidth = naturalWidth * scale,
    targetHeight = naturalHeight * scale;
  return {
    sourceHeight: rect.height,
    sourceLeft: rect.left,
    sourceTop: rect.top,
    sourceWidth: rect.width,
    targetHeight,
    targetLeft: (width - targetWidth) / 2,
    targetTop: (height - targetHeight) / 2,
    targetWidth,
  };
} /** Whether closing can morph back to the image. */
function closingKind(image) {
  if (!image?.isConnected) return 'closing-fade';
  const rect = image.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return 'closing-fade';
  const bounds = visibleBounds(image);
  return rect.top >= bounds.top &&
    rect.left >= bounds.left &&
    rect.right <= bounds.right &&
    rect.bottom <= bounds.bottom
    ? 'closing-morph'
    : 'closing-fade';
} /** The top of the composer below the image. */
function composerTop(image) {
  const forms = Array.from(document.querySelectorAll('[data-chat-input-form]'));
  if (forms.length === 0) return window.innerHeight;
  if (!image) return forms[0]?.getBoundingClientRect().top ?? window.innerHeight;
  const rect = image.getBoundingClientRect();
  let nearest,
    gap = Number.POSITIVE_INFINITY;
  for (const form of forms) {
    const formRect = form.getBoundingClientRect();
    if (formRect.bottom < rect.top) continue;
    const distance = Math.abs(formRect.top - rect.bottom);
    distance < gap && ((gap = distance), (nearest = formRect));
  }
  return nearest?.top ?? window.innerHeight;
} /** The part of the window the image can be in. */
function visibleBounds(image) {
  const parent = scrollParent(image)?.getBoundingClientRect();
  return {
    bottom: Math.min(window.innerHeight, composerTop(image), parent?.bottom ?? Number.POSITIVE_INFINITY),
    left: Math.max(0, parent?.left ?? 0),
    right: Math.min(window.innerWidth, parent?.right ?? Number.POSITIVE_INFINITY),
    top: Math.max(0, parent?.top ?? 0),
  };
} /** The element that scrolls the image. */
function scrollParent(element) {
  let parent = element?.parentElement ?? null;
  for (; parent;) {
    const overflow = window.getComputedStyle(parent).overflowY;
    if (
      (overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay') &&
      parent.scrollHeight > parent.clientHeight
    )
      return parent;
    parent = parent.parentElement;
  }
  return null;
}
var jsonParser = an(),
  DRAFT_FENCE =
    /^(?:calendar(?:-event)?-draft|gmail-draft|imessage-draft|linkedin(?:-message|-post)?-draft|slack(?:-message)?-draft|(?:tweet|x-(?:post|tweet))-draft)$/,
  MESSAGE_DRAFT = /^(?:imessage|linkedin(?:-message)?|slack(?:-message)?)-draft$/,
  CLOSED_FENCE = /\n[ \t>]*(?:`{3,}|~{3,})[ \t]*$/,
  isRecord = value => typeof value == 'object' && value !== null && !Array.isArray(value),
  text = value => (typeof value == 'string' ? value : ''),
  strings = value =>
    Array.isArray(value)
      ? value.filter(item => typeof item == 'string')
      : [] /** The draft's fields, wrapped in `data` or not. */,
  Mt = value =>
    typeof value.type == 'string' && isRecord(value.data) ? value.data : value /** An email draft as text. */,
  emailText = draft =>
    [
      `To: ${draft.to.join(', ')}`,
      draft.cc?.length ? `Cc: ${draft.cc.join(', ')}` : null,
      draft.bcc?.length ? `Bcc: ${draft.bcc.join(', ')}` : null,
      `Subject: ${draft.subject}`,
      '',
      draft.body,
    ].filter(line => line !== null).join(`
`) /** A draft as text. */,
  draftText = (language, data) => {
    const body = text(data.body),
      draft = text(data.draft) || body;
    if (language === 'gmail-draft')
      return emailText({
        bcc: strings(data.bcc),
        body,
        cc: strings(data.cc),
        subject: text(data.subject),
        to: strings(data.to),
      });
    if (language.startsWith('calendar')) {
      const attendees = (Array.isArray(data.attendees) ? data.attendees.filter(isRecord) : [])
        .map(attendee => {
          const name = text(attendee.name),
            email = text(attendee.email);
          return name && email ? `${name} <${email}>` : name || email;
        })
        .filter(Boolean);
      return [
        [data.title, data.time, data.location].map(text).filter(Boolean).join(`
`),
        attendees.length > 0 ? `Attendees: ${attendees.join(', ')}` : '',
        text(data.reminder) ? `Reminder: ${data.reminder}` : '',
        text(data.description),
        draft,
      ].filter(Boolean).join(`

`);
    }
    return MESSAGE_DRAFT.test(language) ? draft : body;
  } /** Markdown with its finished draft fences as text, for copying a reply. */,
  gs = markdown => {
    let output = '',
      cursor = 0;
    const visit = node => {
      if (node.type !== 'code') {
        'children' in node && node.children.forEach(visit);
        return;
      }
      const start = node.position?.start.offset,
        end = node.position?.end.offset;
      if (
        !node.lang ||
        !DRAFT_FENCE.test(node.lang) ||
        start === void 0 ||
        end === void 0 ||
        !CLOSED_FENCE.test(markdown.slice(start, end))
      )
        return;
      let json;
      try {
        json = JSON.parse(node.value);
      } catch {
        return;
      }
      const draft = isRecord(json) ? draftText(node.lang, Mt(json)) : '';
      if (!draft.trim()) return;
      const prefix = markdown
        .slice(
          markdown.lastIndexOf(
            `
`,
            start - 1,
          ) + 1,
          start,
        )
        .replace(/(?:[-+*]|\d+[.)])(?=[ \t])/g, marker => ' '.repeat(marker.length));
      ((output +=
        markdown.slice(cursor, start) +
        draft.replace(
          /\n/g,
          `
${prefix}`,
        )),
        (cursor = end));
    };
    return (visit(mn(markdown)), output + markdown.slice(cursor));
  } /** A calendar event. */,
  CalendarDraft = ({event, className}) =>
    (0, r.jsxs)('div', {
      className: k(
        'bg-surface-primary text-surface-primary-foreground flex flex-col overflow-hidden wrap-break-word',
        className,
      ),
      children: [
        (0, r.jsxs)('div', {
          className: 'flex gap-4 px-5 pt-5 pb-6',
          children: [
            (0, r.jsx)('div', {className: 'mt-1.5 size-4 shrink-0 rounded-sm', style: {backgroundColor: event.color}}),
            (0, r.jsxs)('div', {
              className: 'min-w-0 flex-1',
              children: [
                (0, r.jsx)('h2', {className: 'font-display text-xl font-medium', children: event.title}),
                (0, r.jsx)('div', {className: 'text-sm', children: event.time}),
              ],
            }),
            (0, r.jsx)('span', {className: 'text-muted-foreground mt-1.5 shrink-0 text-xs', children: 'Draft'}),
          ],
        }),
        (0, r.jsxs)('div', {
          className: 'flex flex-col gap-5 px-5 pb-5 text-sm leading-5',
          children: [
            event.location &&
              (0, r.jsx)(CalendarRow, {
                icon: (0, r.jsx)(bn, {className: 'size-5'}),
                children: (0, r.jsx)('div', {children: event.location}),
              }),
            (0, r.jsxs)(CalendarRow, {
              icon: (0, r.jsx)(on, {className: 'size-5'}),
              children: [
                (0, r.jsxs)('div', {
                  className: 'text-muted-foreground text-xs leading-5 font-medium',
                  children: [event.attendees.length, ' ', event.attendees.length === 1 ? 'attendee' : 'attendees'],
                }),
                (0, r.jsx)('div', {
                  className: 'mt-2 flex flex-col gap-2',
                  children: event.attendees.map((attendee, index) =>
                    (0, r.jsxs)(
                      'div',
                      {
                        className: 'flex min-w-0 items-center gap-2',
                        children: [
                          (0, r.jsxs)(ce, {
                            className: 'size-8',
                            children: [
                              (0, r.jsx)(ae, {src: attendee.avatarUrl}),
                              (0, r.jsx)(oe, {
                                className: 'text-xs font-medium',
                                children: attendee.name
                                  .split(/\s+/)
                                  .map(word => word[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase(),
                              }),
                            ],
                          }),
                          (0, r.jsxs)('div', {
                            className: 'min-w-0',
                            children: [
                              (0, r.jsxs)('div', {
                                className: 'truncate',
                                children: [attendee.name, index === 0 && ' (Organizer)'],
                              }),
                              (0, r.jsx)('div', {
                                className: 'text-muted-foreground truncate text-xs',
                                children: attendee.email,
                              }),
                            ],
                          }),
                        ],
                      },
                      `${attendee.email}-${index}`,
                    ),
                  ),
                }),
              ],
            }),
            event.description &&
              (0, r.jsx)(CalendarRow, {
                icon: (0, r.jsx)(gn, {className: 'size-5'}),
                children: (0, r.jsx)('div', {className: 'whitespace-pre-wrap', children: event.description}),
              }),
            event.reminder &&
              (0, r.jsx)(CalendarRow, {
                icon: (0, r.jsx)(cn, {className: 'size-5'}),
                children: (0, r.jsx)('div', {children: event.reminder}),
              }),
            event.draft &&
              (0, r.jsxs)(CalendarRow, {
                icon: (0, r.jsx)(hn, {className: 'size-5'}),
                children: [
                  (0, r.jsx)('div', {
                    className: 'text-muted-foreground mb-1 text-xs leading-5 font-medium',
                    children: 'Invite note',
                  }),
                  (0, r.jsx)('div', {className: 'whitespace-pre-wrap', children: event.draft}),
                ],
              }),
          ],
        }),
      ],
    }); /** A row in it. */
function CalendarRow({icon, children}) {
  return (0, r.jsxs)('div', {
    className: 'grid grid-cols-[1.5rem_minmax(0,1fr)] gap-4',
    children: [
      (0, r.jsx)('div', {className: 'text-muted-foreground flex justify-center', children: icon}),
      (0, r.jsx)('div', {className: 'min-w-0', children}),
    ],
  });
}
var /** Copy the draft. */
  CopyDraft = ({value, className}) =>
    (0, r.jsx)(un, {
      type: 'button',
      variant: 'ghost',
      size: 'icon-xs',
      className: k('-mr-1', className),
      value,
      'aria-label': 'Copy draft',
      children: (0, r.jsx)(ln, {}),
    }) /** A Gmail message. */,
  EmailDraft = ({draft, className, compact = false}) =>
    (0, r.jsxs)('div', {
      className: k(
        'bg-surface-primary text-surface-primary-foreground flex flex-col overflow-hidden',
        className,
        'ring-border-surface-strong border-0 ring-[0.5px]',
        !compact && 'my-6 shadow-xl',
      ),
      children: [
        (0, r.jsxs)('div', {
          className:
            'bg-muted/80 dark:text-surface-primary-foreground flex h-8 shrink-0 items-center justify-between px-3 text-sm font-medium text-[#041e49]',
          children: [
            (0, r.jsxs)('div', {
              className: 'flex min-w-0 items-center gap-2',
              children: [
                (0, r.jsx)(xn, {className: 'size-5'}),
                (0, r.jsx)('span', {className: 'truncate', children: 'New Message'}),
              ],
            }),
            (0, r.jsxs)('div', {
              className: 'flex items-center gap-1',
              children: [
                (0, r.jsx)('span', {className: 'text-muted-foreground text-xs', children: 'Draft'}),
                (0, r.jsx)(CopyDraft, {value: emailText(draft)}),
              ],
            }),
          ],
        }),
        (0, r.jsxs)('div', {
          className: 'flex shrink-0 flex-col',
          children: [
            (0, r.jsx)(EmailRecipients, {label: 'To', values: draft.to}),
            draft.cc?.length ? (0, r.jsx)(EmailRecipients, {label: 'Cc', values: draft.cc}) : null,
            draft.bcc?.length ? (0, r.jsx)(EmailRecipients, {label: 'Bcc', values: draft.bcc}) : null,
            (0, r.jsxs)('div', {
              className: 'border-border flex min-h-9 items-baseline gap-2 border-b px-4 py-2 text-sm leading-5',
              children: [
                (0, r.jsx)('span', {className: 'text-muted-foreground shrink-0', children: 'Subject'}),
                (0, r.jsx)('span', {className: 'min-w-0 font-medium wrap-break-word', children: draft.subject}),
              ],
            }),
          ],
        }),
        (0, r.jsx)('div', {
          className:
            'font-system min-h-0 flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-[19.5px] wrap-break-word whitespace-pre-wrap',
          children: draft.body,
        }),
      ],
    }) /** To, Cc or Bcc. */,
  EmailRecipients = ({label, values}) =>
    (0, r.jsxs)('div', {
      className: 'border-border flex items-start gap-2 border-b px-4 py-2 text-sm leading-5',
      children: [
        (0, r.jsx)('span', {className: 'text-muted-foreground w-11 shrink-0', children: label}),
        (0, r.jsx)('div', {
          className: 'flex min-w-0 flex-1 flex-wrap gap-1.5',
          children: values.map(value =>
            (0, r.jsx)(
              'span',
              {
                className: 'bg-muted max-w-full rounded-[10px] px-2 py-0.5 text-xs font-medium wrap-break-word',
                children: value,
              },
              `${label}-${value}`,
            ),
          ),
        }),
      ],
    }) /** A file's thumbnail, or its icon; it can be dragged out once downloaded. */,
  xt = props => {
    const {accountId} = bt(),
      {className, path} = props,
      sessionId = 'sessionId' in props ? props.sessionId : void 0,
      previewUrl = 'previewUrl' in props ? props.previewUrl : void 0,
      preferThumbnail = 'preferThumbnail' in props && props.preferThumbnail,
      sources = previewUrl
        ? [previewUrl]
        : !sessionId || !vt(path)
          ? []
          : preferThumbnail
            ? [He(sessionId, path, 'thumbnail', accountId), He(sessionId, path, 'icon', accountId)]
            : [He(sessionId, path, 'icon', accountId)],
      [attempt, setAttempt] = (0, N.useState)(0),
      source = sources[attempt],
      tryNext = (0, N.useCallback)(() => setAttempt(event => event + 1), []),
      image = De(source, {onError: tryNext}),
      downloadUrl = sessionId ? jt(sessionId, path, {accountId}) : void 0,
      [requestedUrl, setRequestedUrl] = (0, N.useState)(),
      download = De(requestedUrl === downloadUrl ? downloadUrl : void 0);
    (0, N.useEffect)(() => setAttempt(0), [path, previewUrl, sessionId, preferThumbnail, accountId]);
    const handleDragStart = event => {
      if (!download) {
        event.preventDefault();
        return;
      }
      ((event.dataTransfer.effectAllowed = 'copy'),
        event.dataTransfer.setData('DownloadURL', `application/octet-stream:${Kt(path)}:${download}`),
        event.dataTransfer.setData('text/uri-list', download));
    };
    return source
      ? (0, r.jsx)(
          'img',
          {
            alt: '',
            className: k('object-contain', className),
            draggable: !!download,
            onPointerEnter: () => setRequestedUrl(downloadUrl),
            onPointerDown: () => setRequestedUrl(downloadUrl),
            src: image,
            onDragStart: sessionId ? handleDragStart : void 0,
            onError: tryNext,
          },
          source,
        )
      : (0, r.jsx)('span', {
          className: k('inline-flex items-center justify-center', className),
          draggable: !!download,
          onPointerEnter: () => setRequestedUrl(downloadUrl),
          onPointerDown: () => setRequestedUrl(downloadUrl),
          onDragStart: sessionId ? handleDragStart : void 0,
          children: (0, r.jsx)(wt, {className: 'text-muted-foreground size-2/3', filename: path}),
        });
  } /** An iMessage thread. */,
  IMessageDraft = ({data: {to, draft, messages, attachments}, sessionId, className}) => {
    const turns = messages.reduce((list, message) => {
      const last = list.at(-1);
      return (
        last?.sender === message.sender
          ? last.messages.push(message)
          : list.push({sender: message.sender, messages: [message]}),
        list
      );
    }, []);
    return (0, r.jsxs)('div', {
      className: k(
        'text-foreground flex flex-col overflow-hidden',
        'font-system subpixel-antialiased',
        '[--imessage-blue:#0a7cff] [--imessage-gray-foreground:#000] [--imessage-gray:#e9e9eb] [--imessage-surface:#fff]',
        'dark:[--imessage-blue:#0b84ff] dark:[--imessage-gray-foreground:#fff] dark:[--imessage-gray:#3b3b3d] dark:[--imessage-surface:#1c1c1e]',
        className,
        'bg-(--imessage-surface)',
      ),
      children: [
        (0, r.jsx)(IMessageHeader, {draft, to}),
        turns.length > 0 &&
          (0, r.jsx)('div', {
            className: 'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 py-2.5',
            children: turns.map(({messages: bubbles, sender}, turn) =>
              (0, r.jsx)(
                'div',
                {
                  className: k('flex flex-col gap-1', sender === 'me' ? 'items-end' : 'items-start pl-[5px]'),
                  children: bubbles.map((bubble, index) =>
                    (0, r.jsx)(
                      IMessageBubble,
                      {sender: bubble.sender, isLast: index === bubbles.length - 1, message: bubble.message},
                      `imsg-${turn}-${index}`,
                    ),
                  ),
                },
                `imsg-turn-${turn}`,
              ),
            ),
          }),
        (0, r.jsxs)('div', {
          className: k('border-border flex shrink-0 flex-col gap-2 px-3 py-2', turns.length > 0 && 'border-t'),
          children: [
            attachments &&
              attachments.length > 0 &&
              (0, r.jsx)('div', {
                className: 'flex flex-wrap gap-2',
                children: attachments.map((attachment, index) =>
                  (0, r.jsx)(IMessageAttachment, {attachment, sessionId}, `${attachment.path}-${index}`),
                ),
              }),
            (0, r.jsx)('div', {
              className: k(
                'bg-muted/40 ring-border max-h-24 min-w-0 overflow-y-auto rounded-[18px] px-3 py-[7px]',
                'text-[13px] leading-[1.35] break-words whitespace-pre-wrap ring-[0.5px]',
                !draft && 'text-muted-foreground',
              ),
              children: draft || 'iMessage',
            }),
          ],
        }),
      ],
    });
  },
  IMAGE_FILE = /\.(png|jpe?g|gif|webp|heic|heif|bmp|svg|tiff?)$/i /** An attachment. */,
  IMessageAttachment = ({attachment, sessionId}) => {
    const path = (sessionId && en(attachment.path, sessionId)) || attachment.path,
      name = attachment.name || path.split('/').pop() || path,
      isImage = !!sessionId && IMAGE_FILE.test(name);
    return (0, r.jsxs)('div', {
      className: 'flex w-20 flex-col gap-1',
      children: [
        (0, r.jsx)('div', {
          className:
            'bg-muted/40 ring-border flex size-20 items-center justify-center overflow-hidden rounded-[14px] ring-[0.5px]',
          children: (0, r.jsx)(IMessageAttachmentImage, {
            className: isImage ? 'size-20 object-cover' : 'size-12',
            path,
            sessionId,
            preferThumbnail: isImage,
          }),
        }),
        (0, r.jsx)('p', {
          className: 'text-muted-foreground truncate text-[10px] leading-tight',
          title: name,
          children: name,
        }),
      ],
    });
  },
  IMessageAttachmentImage = ({className, path, sessionId, preferThumbnail}) => {
    const {accountId} = bt();
    return sessionId
      ? preferThumbnail && !vt(path)
        ? (0, r.jsx)(xt, {
            className,
            path,
            previewUrl: jt(sessionId, path, {accountId, previewMaxWidth: 160}),
            sessionId,
          })
        : (0, r.jsx)(xt, {className, path, preferThumbnail, sessionId})
      : (0, r.jsx)(wt, {className: k('text-muted-foreground', className), filename: path});
  } /** The header. */,
  IMessageHeader = ({draft, to}) => {
    const initials = to
      .split(/[\s@]+/)
      .filter(part => /^[a-z]/i.test(part))
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (0, r.jsxs)('div', {
      className: 'border-border/60 relative flex shrink-0 flex-col items-center gap-1 border-b px-3 py-2',
      children: [
        draft && (0, r.jsx)(CopyDraft, {value: draft, className: 'absolute top-1.5 right-1.5 mr-0'}),
        (0, r.jsx)('div', {
          className:
            'bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-full text-[11px] font-medium',
          children: initials || (0, r.jsx)(rn, {className: 'size-5'}),
        }),
        (0, r.jsx)('span', {
          className: 'max-w-full truncate text-[11px] leading-none font-medium',
          children: to || 'New Message',
        }),
      ],
    });
  } /** A bubble. */,
  IMessageBubble = ({sender, message, isLast}) => {
    const mine = sender === 'me';
    return (0, r.jsxs)('div', {
      className: k('relative max-w-[90%]', isLast && 'pb-[5px]'),
      children: [
        (0, r.jsx)('div', {
          className: k(
            'relative rounded-[16px] px-3 py-[7px] text-[13px] leading-[1.3] break-words whitespace-pre-wrap',
            mine ? 'bg-(--imessage-blue) text-white' : 'bg-(--imessage-gray) text-(--imessage-gray-foreground)',
          ),
          children: message,
        }),
        isLast && (0, r.jsx)(Cr, {sender}),
      ],
    });
  } /** A bubble's tail. */,
  Cr = ({sender, className}) =>
    (0, r.jsx)('svg', {
      'aria-hidden': true,
      className: k(
        'absolute bottom-0 h-[13px] w-[23px]',
        sender === 'me' ? 'right-0 text-(--imessage-blue)' : 'left-0 text-(--imessage-gray)',
        className,
      ),
      viewBox: '0 0 23 14',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      children:
        sender === 'me'
          ? (0, r.jsx)('path', {
              d: 'M3.43421 5.14434C7.82909 8.90499 9.9418 11.1179 15.0215 12.8363C15.519 13.0046 15.8873 12.3694 15.5337 11.981C13.5858 9.84089 13.1577 8.14549 14.8766 6.39152C15.2387 6.02202 15.0528 5.33892 14.5384 5.28381L3.86084 4.13979C3.30692 4.08044 3.01094 4.78215 3.43421 5.14434Z',
              fill: 'currentColor',
            })
          : (0, r.jsx)('path', {
              d: 'M19.0753 5.14434C14.6804 8.90499 12.5677 11.1179 7.488 12.8363C6.9905 13.0046 6.6222 12.3694 6.97573 11.981C8.92369 9.84089 9.35181 8.14549 7.63285 6.39152C7.27074 6.02202 7.45672 5.33892 7.97112 5.28381L18.6486 4.13979C19.2026 4.08044 19.4985 4.78215 19.0753 5.14434Z',
              fill: 'currentColor',
            }),
    }) /** A LinkedIn message. */,
  LinkedInMessageDraft = ({data: {to, profiles, messages, draft}, className}) => {
    const rows = messages.map(row => ({
      ...row,
      timestamp: (0, Ge.default)(row.timestamp).isValid() ? (0, Ge.default)(row.timestamp).fromNow() : null,
      avatarUrl: profiles.find(profile => profile.name === row.name)?.avatarUrl,
    }));
    return (0, r.jsxs)('div', {
      className: k('bg-surface-primary text-surface-primary-foreground flex flex-col', className),
      children: [
        (0, r.jsxs)('div', {
          className: 'border-border flex h-10 shrink-0 items-center justify-between border-b px-3',
          children: [
            (0, r.jsxs)('div', {
              className: 'flex min-w-0 items-center gap-2',
              children: [
                (0, r.jsx)(Me, {className: 'size-4 shrink-0 text-[#0A66C2] dark:text-[#71b7fb]'}),
                (0, r.jsx)('span', {className: 'truncate text-sm font-semibold', children: to || 'Message draft'}),
              ],
            }),
            draft && (0, r.jsx)(CopyDraft, {value: draft}),
          ],
        }),
        rows.length > 0 &&
          (0, r.jsx)('ul', {
            className: 'flex min-h-0 grow flex-col gap-2 overflow-y-auto py-2',
            children: rows.map(({name: row, avatarUrl: profile, message, timestamp}, index) =>
              (0, r.jsxs)(
                'li',
                {
                  className: 'text-surface-primary-foreground flex gap-3 px-2 text-sm',
                  children: [
                    (0, r.jsxs)(ce, {
                      children: [(0, r.jsx)(ae, {src: profile}), (0, r.jsx)(oe, {children: row.slice(0, 2)})],
                    }),
                    (0, r.jsxs)('div', {
                      className: 'flex min-w-0 grow flex-col gap-0.5',
                      children: [
                        (0, r.jsxs)('div', {
                          className: 'flex min-w-0 items-center gap-1.5',
                          children: [
                            (0, r.jsx)('span', {
                              'data-type': 'name',
                              className: 'truncate font-semibold',
                              children: row,
                            }),
                            (0, r.jsx)(Me, {className: 'size-4.5 shrink-0 text-[#0A66C2] dark:text-[#71b7fb]'}),
                            timestamp &&
                              (0, r.jsx)('span', {
                                'data-type': 'timestamp',
                                className: 'text-muted-foreground shrink-0 text-xs font-medium',
                                children: timestamp,
                              }),
                          ],
                        }),
                        (0, r.jsx)('span', {className: 'break-words whitespace-pre-wrap', children: message}),
                      ],
                    }),
                  ],
                },
                `lmsg-${index}`,
              ),
            ),
          }),
        draft &&
          (0, r.jsx)('div', {
            className: k('px-2 py-1.5', rows.length > 0 && 'border-t'),
            children: (0, r.jsx)('div', {
              className: 'bg-background rounded-md border px-2.5 py-1.5 text-sm break-words whitespace-pre-wrap',
              children: draft,
            }),
          }),
      ],
    });
  } /** A LinkedIn post. */,
  LinkedInPost = ({post, className}) =>
    (0, r.jsxs)('article', {
      className: k('bg-surface-primary text-surface-primary-foreground flex flex-col overflow-hidden', className),
      children: [
        (0, r.jsxs)('div', {
          className: 'flex gap-2.5 px-3 pt-3',
          children: [
            (0, r.jsxs)(ce, {
              className: 'size-12',
              children: [
                (0, r.jsx)(ae, {src: post.avatarUrl}),
                (0, r.jsx)(oe, {children: post.authorName.slice(0, 2)}),
              ],
            }),
            (0, r.jsxs)('div', {
              className: 'min-w-0 flex-1',
              children: [
                (0, r.jsxs)('div', {
                  className: 'flex items-center gap-1.5',
                  children: [
                    (0, r.jsx)('span', {className: 'truncate text-sm font-semibold', children: post.authorName}),
                    (0, r.jsx)(Me, {className: 'size-4 shrink-0 text-[#0A66C2] dark:text-[#71b7fb]'}),
                  ],
                }),
                (0, r.jsx)('div', {className: 'text-muted-foreground truncate text-xs', children: post.headline}),
                post.timestamp &&
                  (0, r.jsx)('div', {className: 'text-muted-foreground text-xs', children: post.timestamp}),
              ],
            }),
          ],
        }),
        (0, r.jsx)('p', {
          className: 'px-3 py-3 text-sm leading-5 wrap-break-word whitespace-pre-wrap',
          children: post.body,
        }),
        post.stats &&
          (0, r.jsxs)('div', {
            className:
              'border-border text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-xs',
            children: [
              (0, r.jsxs)('span', {children: [post.stats.reactions, ' reactions']}),
              (0, r.jsxs)('span', {children: [post.stats.comments, ' comments']}),
            ],
          }),
      ],
    }) /** A LinkedIn post draft. */,
  LinkedInPostDraft = ({profile, body, className}) =>
    (0, r.jsxs)('div', {
      className: k('bg-surface-primary text-surface-primary-foreground flex flex-col overflow-hidden', className),
      children: [
        (0, r.jsxs)('div', {
          className: 'border-border flex h-10 items-center justify-between border-b px-3',
          children: [
            (0, r.jsxs)('div', {
              className: 'flex min-w-0 items-center gap-2',
              children: [
                (0, r.jsx)(Me, {className: 'size-4 shrink-0 text-[#0A66C2] dark:text-[#71b7fb]'}),
                (0, r.jsx)('span', {className: 'truncate text-sm font-semibold', children: 'Start a post'}),
              ],
            }),
            (0, r.jsxs)('div', {
              className: 'flex items-center gap-1',
              children: [
                (0, r.jsx)('span', {className: 'text-muted-foreground text-xs', children: 'Draft'}),
                (0, r.jsx)(CopyDraft, {value: body}),
              ],
            }),
          ],
        }),
        (0, r.jsxs)('div', {
          className: 'flex gap-2.5 px-3 py-3',
          children: [
            (0, r.jsxs)(ce, {
              className: 'size-14',
              children: [
                (0, r.jsx)(ae, {src: profile.avatarUrl}),
                (0, r.jsx)(oe, {children: profile.authorName.slice(0, 2)}),
              ],
            }),
            (0, r.jsxs)('div', {
              className: 'min-w-0 flex-1',
              children: [
                (0, r.jsx)('div', {className: 'text-sm font-semibold', children: profile.authorName}),
                (0, r.jsx)('div', {className: 'text-muted-foreground truncate text-xs', children: profile.headline}),
                (0, r.jsx)('p', {
                  className: 'mt-3 text-xl leading-7 wrap-break-word whitespace-pre-wrap',
                  children: body,
                }),
              ],
            }),
          ],
        }),
      ],
    }) /** A Slack message. */,
  SlackDraft = ({data: {channel, workspace, profiles, messages, draft}, className}) => {
    const rows = messages.map(row => {
      const time = (0, Ge.default)(row.timestamp);
      return {
        ...row,
        timestamp: time.isValid() ? time.format('h:mm A') : null,
        avatarUrl: profiles.find(profile => profile.name === row.name)?.avatarUrl,
      };
    });
    return (0, r.jsxs)('div', {
      className: k('bg-surface-primary text-surface-primary-foreground flex flex-col overflow-hidden', className),
      children: [
        (0, r.jsxs)('div', {
          className: 'border-border flex h-10 items-center justify-between border-b px-3',
          children: [
            (0, r.jsxs)('div', {
              className: 'flex min-w-0 items-center gap-2',
              children: [
                (0, r.jsx)(sn, {className: 'dark:text-surface-primary-foreground size-4 shrink-0 text-[#611f69]'}),
                (0, r.jsxs)('span', {className: 'truncate text-sm font-semibold', children: ['#', channel]}),
              ],
            }),
            (0, r.jsxs)('div', {
              className: 'flex min-w-0 items-center gap-1',
              children: [
                (0, r.jsx)('span', {className: 'text-muted-foreground truncate text-xs', children: workspace}),
                draft && (0, r.jsx)(CopyDraft, {value: draft}),
              ],
            }),
          ],
        }),
        rows.length > 0 &&
          (0, r.jsx)('ul', {
            className: 'flex min-h-0 grow flex-col overflow-y-auto py-2',
            children: rows.map(({name, avatarUrl, message, timestamp}, index) =>
              (0, r.jsxs)(
                'li',
                {
                  className: 'hover:bg-muted/50 flex gap-3 px-3 py-1 text-sm',
                  children: [
                    (0, r.jsxs)(ce, {
                      className: 'size-9 rounded-md',
                      children: [
                        (0, r.jsx)(ae, {src: avatarUrl}),
                        (0, r.jsx)(oe, {children: name.slice(0, 2).toUpperCase()}),
                      ],
                    }),
                    (0, r.jsxs)('div', {
                      className: 'flex min-w-0 grow flex-col gap-0.5',
                      children: [
                        (0, r.jsxs)('div', {
                          className: 'flex min-w-0 items-baseline gap-1.5',
                          children: [
                            (0, r.jsx)('span', {className: 'truncate font-semibold', children: name}),
                            timestamp &&
                              (0, r.jsx)('span', {
                                className: 'text-muted-foreground shrink-0 text-xs',
                                children: timestamp,
                              }),
                          ],
                        }),
                        (0, r.jsx)('span', {className: 'break-words whitespace-pre-wrap', children: message}),
                      ],
                    }),
                  ],
                },
                `slack-message-${name}-${index}`,
              ),
            ),
          }),
        draft &&
          (0, r.jsx)('div', {
            className: k('p-2', rows.length > 0 && 'border-t'),
            children: (0, r.jsx)('div', {
              className:
                'bg-background rounded-lg border px-3 py-2 text-[15px] leading-[22px] break-words whitespace-pre-wrap',
              children: draft,
            }),
          }),
      ],
    });
  } /** An X post. */,
  Tweet = ({tweet, className}) =>
    (0, r.jsxs)('article', {
      className: k(
        'bg-surface-primary text-surface-primary-foreground flex gap-3 overflow-hidden px-4 py-3',
        className,
      ),
      children: [
        (0, r.jsxs)(ce, {
          className: 'size-10',
          children: [(0, r.jsx)(ae, {src: tweet.avatarUrl}), (0, r.jsx)(oe, {children: tweet.authorName.slice(0, 2)})],
        }),
        (0, r.jsxs)('div', {
          className: 'min-w-0 flex-1',
          children: [
            (0, r.jsxs)('div', {
              className: 'flex min-w-0 items-center gap-1 text-sm',
              children: [
                (0, r.jsx)('span', {className: 'truncate font-semibold', children: tweet.authorName}),
                tweet.handle &&
                  (0, r.jsxs)('span', {className: 'text-muted-foreground truncate', children: ['@', tweet.handle]}),
                tweet.timestamp &&
                  (0, r.jsxs)('span', {className: 'text-muted-foreground shrink-0', children: ['· ', tweet.timestamp]}),
                (0, r.jsx)(yt, {className: 'ml-auto size-4 shrink-0'}),
              ],
            }),
            (0, r.jsx)('p', {
              className: 'mt-1 text-[15px] leading-5 wrap-break-word whitespace-pre-wrap',
              children: tweet.body,
            }),
            tweet.stats &&
              (0, r.jsxs)('div', {
                className: 'text-muted-foreground mt-3 grid grid-cols-4 text-xs',
                children: [
                  (0, r.jsxs)('span', {children: [tweet.stats.replies, ' replies']}),
                  (0, r.jsxs)('span', {children: [tweet.stats.reposts, ' reposts']}),
                  (0, r.jsxs)('span', {children: [tweet.stats.likes, ' likes']}),
                  (0, r.jsxs)('span', {children: [tweet.stats.views, ' views']}),
                ],
              }),
          ],
        }),
      ],
    }),
  URL_TEXT =
    /(?:https?:\/\/|(?<![\w@.-])(?:[\w-]+\.)+(?:com|org|net|io|ai|co|dev|app)\b)[^\s'"]*?(?=[.,:;!?)\]]*(?:[\s'"]|$))/gi,
  EMOJI = new RegExp('(?![©®]$)(?:\\p{Extended_Pictographic}|\\p{Regional_Indicator}|\\u20E3)', 'u'),
  NARROW_CHARACTER = /^[\t\n\r\u0020-\u10FF\u2000-\u200D\u2010-\u201F\u2032-\u2037]$/,
  graphemes = new Intl.Segmenter() /** A post's length as X counts it. */,
  tweetLength = text => {
    const normalized = text.normalize('NFC');
    let length = (normalized.match(URL_TEXT)?.length ?? 0) * 23;
    for (const {segment} of graphemes.segment(normalized.replace(URL_TEXT, '')))
      if (EMOJI.test(segment)) length += 2;
      else for (const character of segment) length += NARROW_CHARACTER.test(character) ? 1 : 2;
    return length;
  } /** An X post draft. */,
  TweetDraft = ({profile, body, className}) => {
    const length = tweetLength(body);
    return (0, r.jsxs)('div', {
      className: k('bg-surface-primary text-surface-primary-foreground flex flex-col overflow-hidden', className),
      children: [
        (0, r.jsxs)('div', {
          className: 'border-border flex h-10 items-center justify-between border-b px-3',
          children: [
            (0, r.jsxs)('div', {
              className: 'flex min-w-0 items-center gap-2',
              children: [
                (0, r.jsx)(yt, {className: 'size-4 shrink-0'}),
                (0, r.jsx)('span', {className: 'truncate text-sm font-semibold', children: 'Post draft'}),
              ],
            }),
            (0, r.jsxs)('div', {
              className: 'flex items-center gap-1',
              children: [
                (0, r.jsxs)('span', {
                  className: k(
                    'text-xs',
                    length > 280 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground',
                  ),
                  children: [length, '/280'],
                }),
                (0, r.jsx)(CopyDraft, {value: body}),
              ],
            }),
          ],
        }),
        (0, r.jsxs)('div', {
          className: 'flex gap-3 px-4 py-3',
          children: [
            (0, r.jsxs)(ce, {
              className: 'size-10',
              children: [
                (0, r.jsx)(ae, {src: profile.avatarUrl}),
                (0, r.jsx)(oe, {children: profile.authorName.slice(0, 2)}),
              ],
            }),
            (0, r.jsxs)('div', {
              className: 'min-w-0 flex-1',
              children: [
                (0, r.jsxs)('div', {
                  className: 'flex min-w-0 items-center gap-1 text-sm',
                  children: [
                    (0, r.jsx)('span', {className: 'truncate font-semibold', children: profile.authorName}),
                    profile.handle &&
                      (0, r.jsxs)('span', {
                        className: 'text-muted-foreground truncate',
                        children: ['@', profile.handle],
                      }),
                  ],
                }),
                (0, r.jsx)('p', {
                  className: 'mt-2 text-xl leading-6 wrap-break-word whitespace-pre-wrap',
                  children: body,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  DRAFT_CLASS = 'my-2 w-full max-w-[32rem] rounded-lg border',
  HANGUL = new RegExp('\\p{Script=Hangul}', 'u'),
  Pt = [
    'calendar-draft',
    'calendar-event-draft',
    'gmail-draft',
    'imessage-draft',
    'linkedin-draft',
    'linkedin-message-draft',
    'linkedin-post',
    'linkedin-post-draft',
    'slack-draft',
    'slack-message-draft',
    'tweet',
    'tweet-draft',
    'x-post',
    'x-post-draft',
    'x-tweet',
    'x-tweet-draft',
  ],
  hs = language => Pt.includes(language) /** The preview for a language; Korean text keeps words whole. */,
  Rr = ({className = DRAFT_CLASS, compact = false, data, language, sessionId}) => {
    const session = pn(),
      hangulMessage =
        MESSAGE_DRAFT.test(language) && records(data.messages).some(message => HANGUL.test(string(message.message))),
      classes = k((HANGUL.test(draftText(language, data)) || hangulMessage) && 'break-keep', className);
    switch (language) {
      case 'gmail-draft':
        return (0, r.jsx)(EmailDraft, {className: classes, compact, draft: emailData(data)});
      case 'imessage-draft':
        return (0, r.jsx)(IMessageDraft, {
          className: classes,
          data: iMessageData(data),
          sessionId: sessionId ?? session?.currentSession.id,
        });
      case 'linkedin-draft':
      case 'linkedin-message-draft':
        return (0, r.jsx)(LinkedInMessageDraft, {className: classes, data: linkedInMessageData(data)});
      case 'slack-draft':
      case 'slack-message-draft':
        return (0, r.jsx)(SlackDraft, {className: classes, data: slackData(data)});
      case 'calendar-event-draft':
      case 'calendar-draft':
        return (0, r.jsx)(CalendarDraft, {className: classes, event: calendarData(data)});
      case 'x-tweet':
      case 'x-post':
      case 'tweet':
        return (0, r.jsx)(Tweet, {className: classes, tweet: tweetData(data)});
      case 'x-tweet-draft':
      case 'x-post-draft':
      case 'tweet-draft':
        return (0, r.jsx)(TweetDraft, {body: string(data.body), className: classes, profile: tweetProfile(data)});
      case 'linkedin-post':
        return (0, r.jsx)(LinkedInPost, {className: classes, post: linkedInPostData(data)});
      case 'linkedin-post-draft':
        return (0, r.jsx)(LinkedInPostDraft, {
          body: string(data.body),
          className: classes,
          profile: linkedInProfile(data),
        });
      default:
        return null;
    }
  } /** A code fence as a draft. */,
  CodeFenceDraft = ({code, language}) => {
    const data = (0, N.useMemo)(() => parseDraft(code), [code]);
    return data ? (0, r.jsx)(Rr, {data, language}) : null;
  } /** A fence's JSON, which may still be streaming. */,
  parseDraft = code => {
    if (code.trim().length === 0) return {};
    try {
      const parsed = (0, jsonParser.parseJSON)(code);
      return isObject(parsed) ? Mt(parsed) : null;
    } catch {
      return null;
    }
  },
  bs = [{language: Pt, component: CodeFenceDraft}] /** Each kind of draft's fields, whatever the agent left out. */,
  emailData = data => ({
    bcc: stringList(data.bcc),
    body: string(data.body),
    cc: stringList(data.cc),
    subject: string(data.subject),
    to: stringList(data.to),
  }),
  attachmentData = value => {
    if (typeof value == 'string') return value ? {path: value} : void 0;
    if (!isObject(value)) return;
    const path = string(value.path) || string(value.attachmentPath);
    return path ? {name: optionalString(value.name), path} : void 0;
  },
  attachmentList = data =>
    (Array.isArray(data) ? data : data != null && data !== '' ? [data] : []).flatMap(item => {
      const attachment = attachmentData(item);
      return attachment ? [attachment] : [];
    }),
  iMessageData = data => ({
    attachments: attachmentList(data.attachments ?? data.attachment ?? data.attachmentPaths ?? data.attachmentPath),
    draft: string(data.draft) || string(data.body),
    messages: records(data.messages).map(item => ({
      message: string(item.message),
      sender: item.sender === 'me' ? 'me' : 'them',
    })),
    to: string(data.to) || stringList(data.to).join(', '),
  }),
  linkedInMessageData = data => ({
    to: string(data.to) || stringList(data.to).join(', '),
    draft: string(data.draft) || string(data.body),
    messages: records(data.messages).map(item => ({
      message: string(item.message),
      name: string(item.name),
      timestamp: string(item.timestamp),
    })),
    profiles: profileList(data.profiles),
  }),
  slackData = data => ({
    channel: string(data.channel, 'channel'),
    draft: string(data.draft) || string(data.body),
    messages: records(data.messages).map(item => ({
      message: string(item.message),
      name: string(item.name),
      timestamp: string(item.timestamp),
    })),
    profiles: profileList(data.profiles),
    workspace: string(data.workspace, 'Slack'),
  }),
  calendarData = data => ({
    attendees: records(data.attendees).map(item => ({
      avatarUrl: optionalString(item.avatarUrl),
      email: string(item.email),
      name: string(item.name),
    })),
    availability: optionalString(data.availability),
    calendarName: string(data.calendarName, 'Calendar'),
    color: string(data.color, '#0b57d0'),
    description: string(data.description),
    draft: string(data.draft) || string(data.body),
    location: optionalString(data.location),
    reminder: optionalString(data.reminder),
    source: optionalString(data.source),
    time: string(data.time),
    title: string(data.title),
    visibility: optionalString(data.visibility),
  }),
  tweetData = data => ({
    authorName: string(data.authorName),
    avatarUrl: string(data.avatarUrl),
    body: string(data.body),
    handle: string(data.handle),
    stats: tweetStats(data.stats),
    timestamp: optionalString(data.timestamp),
  }),
  tweetProfile = data => {
    const profile = isObject(data.profile) ? data.profile : data;
    return {
      authorName: string(profile.authorName),
      avatarUrl: string(profile.avatarUrl),
      handle: string(profile.handle),
    };
  },
  linkedInPostData = data => ({
    authorName: string(data.authorName),
    avatarUrl: string(data.avatarUrl),
    body: string(data.body),
    headline: string(data.headline),
    stats: linkedInStats(data.stats),
    timestamp: optionalString(data.timestamp),
  }),
  linkedInProfile = data => {
    const profile = isObject(data.profile) ? data.profile : data;
    return {
      authorName: string(profile.authorName),
      avatarUrl: string(profile.avatarUrl),
      headline: string(profile.headline),
    };
  },
  profileList = data => records(data).map(item => ({avatarUrl: string(item.avatarUrl), name: string(item.name)})),
  tweetStats = data => {
    if (isObject(data))
      return {
        likes: string(data.likes),
        replies: string(data.replies),
        reposts: string(data.reposts),
        views: string(data.views),
      };
  },
  linkedInStats = data => {
    if (isObject(data)) return {comments: string(data.comments), reactions: string(data.reactions)};
  },
  records = value => (Array.isArray(value) ? value.filter(isObject) : []),
  stringList = value => (Array.isArray(value) ? value.filter(item => typeof item == 'string') : []),
  optionalString = value => (typeof value == 'string' && value.length > 0 ? value : void 0),
  string = (value, fallback = '') => (typeof value == 'string' ? value : fallback),
  isObject = value => typeof value == 'object' && value !== null && !Array.isArray(value);
