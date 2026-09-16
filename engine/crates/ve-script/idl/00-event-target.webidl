[Exposed=Window]
interface EventTarget {
  undefined addEventListener(DOMString type, any callback, optional any options);
  undefined removeEventListener(DOMString type, any callback, optional any options);
  boolean dispatchEvent(any event);
};
