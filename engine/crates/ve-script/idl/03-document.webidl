[Exposed=Window]
interface Document : Node {
  readonly attribute Element? documentElement;
  readonly attribute Element? head;
  readonly attribute Element? body;
  attribute DOMString title;
  readonly attribute DOMString URL;
  readonly attribute DOMString documentURI;
  readonly attribute DOMString characterSet;
  readonly attribute DOMString compatMode;
  attribute DOMString cookie;
  Element createElement(DOMString localName);
  Element createElementNS(DOMString? namespace, DOMString qualifiedName);
  Text createTextNode(DOMString data);
  Comment createComment(DOMString data);
  DocumentFragment createDocumentFragment();
  Element? getElementById(DOMString elementId);
  Element? querySelector(DOMString selectors);
  sequence<Element> querySelectorAll(DOMString selectors);
};
