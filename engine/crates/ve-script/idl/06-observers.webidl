[Exposed=Window]
interface MutationObserver {
  undefined observe(Node target, optional any options);
  undefined disconnect();
  sequence<any> takeRecords();
};

[Exposed=Window]
interface IntersectionObserver {
  undefined observe(Element target);
  undefined unobserve(Element target);
  undefined disconnect();
};

[Exposed=Window]
interface ResizeObserver {
  undefined observe(Element target);
  undefined unobserve(Element target);
  undefined disconnect();
};

[Exposed=Window]
interface ShadowRoot : Node {
  readonly attribute DOMString mode;
  readonly attribute Element host;
  attribute DOMString innerHTML;
  Element? getElementById(DOMString elementId);
  Element? querySelector(DOMString selectors);
  sequence<Element> querySelectorAll(DOMString selectors);
};
