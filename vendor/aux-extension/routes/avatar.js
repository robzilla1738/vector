/* Aux-owned source: the Avatar parts (assets/avatar-iEt_J7Lk.js, after the base Avatar primitives): the root,
 * an image that reports its load state, and a fallback that stays until the image loads.
 * Names the rest of the chunk uses keep their chunk names: k Avatar, N AvatarImage, q AvatarFallback.
 * Chunk names used: t React, f JSX runtime, E/L the primitives, g cn, y useMergedRefs. */
/** The image's load state. */ ImageStatusContext = t.createContext(void 0);
/** Avatar. */
function k({className, size = 'default', ...props}) {
  const status = t.useState('idle');
  return (0, f.jsx)(ImageStatusContext, {
    value: status,
    children: (0, f.jsx)(E, {
      'data-slot': 'avatar',
      'data-size': size,
      className: g(
        'group/avatar [container-type:inline-size] relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6',
        className,
      ),
      ...props,
    }),
  });
}
var /** AvatarImage. */
  N = ({className, src, ref, onError, onLoad, onLoadingStatusChange, ...props}) => {
    const setStatus = t.useContext(ImageStatusContext)?.[1],
      imageRef = t.useRef(null),
      mergedRef = y(imageRef, ref),
      handleLoad = event => {
        ((event.currentTarget.hidden = false),
          setStatus?.('loaded'),
          onLoad?.(event),
          onLoadingStatusChange?.('loaded'));
      },
      handleError = event => {
        ((event.currentTarget.hidden = true), setStatus?.('error'), onError?.(event), onLoadingStatusChange?.('error'));
      };
    return (
      t.useLayoutEffect(() => {
        if (!src) {
          setStatus?.('idle');
          return;
        }
        const event = imageRef.current;
        return (
          event?.complete ? setStatus?.(event.naturalWidth > 0 ? 'loaded' : 'error') : setStatus?.('loading'),
          () => setStatus?.('idle')
        );
      }, [setStatus, src]),
      src
        ? (0, f.jsx)('img', {
            'data-slot': 'avatar-image',
            className: g(
              'pointer-events-none absolute inset-1/2 z-1 aspect-square size-full -translate-1/2 object-cover select-none',
              className,
            ),
            src,
            onLoad: handleLoad,
            onError: handleError,
            ...props,
            ref: mergedRef,
          })
        : null
    );
  };
/** AvatarFallback. */
function q({className, ...props}) {
  return t.useContext(ImageStatusContext)?.[0] === 'loaded'
    ? null
    : (0, f.jsx)(L, {
        'data-slot': 'avatar-fallback',
        className: g(
          'bg-muted text-muted-foreground flex size-full items-center justify-center text-[clamp(0.625rem,44cqi,2rem)] leading-none',
          className,
        ),
        ...props,
      });
}
