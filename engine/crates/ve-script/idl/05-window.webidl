[Exposed=Window]
interface Window : EventTarget {
  readonly attribute Document document;
  readonly attribute Location location;
  readonly attribute History history;
  readonly attribute Storage localStorage;
  readonly attribute Storage sessionStorage;
  readonly attribute CustomElementRegistry customElements;
  readonly attribute unrestricted double innerWidth;
  readonly attribute unrestricted double innerHeight;
  CSSStyleDeclaration getComputedStyle(Element elt, optional DOMString? pseudoElt);
  Response fetch(any input, optional any init);
};
