[Exposed=Window]
interface Element : Node {
  readonly attribute DOMString tagName;
  readonly attribute DOMString localName;
  readonly attribute DOMString namespaceURI;
  attribute DOMString id;
  attribute DOMString className;
  attribute DOMString innerHTML;
  attribute DOMString outerHTML;
  DOMString? getAttribute(DOMString qualifiedName);
  undefined setAttribute(DOMString qualifiedName, DOMString value);
  undefined removeAttribute(DOMString qualifiedName);
  boolean hasAttribute(DOMString qualifiedName);
  Element? querySelector(DOMString selectors);
  sequence<Element> querySelectorAll(DOMString selectors);
  boolean matches(DOMString selectors);
  Element? closest(DOMString selectors);
  readonly attribute Element? firstElementChild;
  readonly attribute Element? lastElementChild;
  readonly attribute Element? nextElementSibling;
  readonly attribute Element? previousElementSibling;
  readonly attribute unsigned long childElementCount;
  ShadowRoot attachShadow(any init);
  readonly attribute ShadowRoot? shadowRoot;
  undefined remove();
  undefined insertAdjacentHTML(DOMString position, DOMString html);
  DOMRect getBoundingClientRect();
};
