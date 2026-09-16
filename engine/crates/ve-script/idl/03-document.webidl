[Exposed=Window]
interface HTMLCollection {
  readonly attribute unsigned long length;
  Element? item(unsigned long index);
  Element? namedItem(DOMString name);
};

[Exposed=Window]
interface DOMImplementation {
  Document createHTMLDocument(optional DOMString title);
  boolean hasFeature(optional DOMString feature, optional DOMString version);
};

[Exposed=Window]
interface Document : Node {
  readonly attribute Element? documentElement;
  readonly attribute Element? head;
  attribute Element? body;
  attribute DOMString title;
  readonly attribute DOMString URL;
  readonly attribute DOMString documentURI;
  readonly attribute DOMString characterSet;
  readonly attribute DOMString compatMode;
  attribute DOMString cookie;
  readonly attribute HTMLCollection forms;
  readonly attribute HTMLCollection images;
  readonly attribute HTMLCollection links;
  readonly attribute HTMLCollection scripts;
  readonly attribute DOMImplementation implementation;
  Element createElement(DOMString localName);
  Element createElementNS(DOMString? namespace, DOMString qualifiedName);
  Text createTextNode(DOMString data);
  Comment createComment(DOMString data);
  DocumentFragment createDocumentFragment();
  Element? getElementById(DOMString elementId);
  Element? querySelector(DOMString selectors);
  sequence<Element> querySelectorAll(DOMString selectors);
  HTMLCollection getElementsByTagName(DOMString qualifiedName);
  HTMLCollection getElementsByClassName(DOMString classNames);
};
