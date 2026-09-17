[Exposed=Window]
interface MediaQueryList : EventTarget {
  readonly attribute DOMString media;
  readonly attribute boolean matches;
  undefined addListener(any callback);
  undefined removeListener(any callback);
};
