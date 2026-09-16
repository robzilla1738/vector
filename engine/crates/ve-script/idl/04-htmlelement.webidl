[Exposed=Window]
interface HTMLElement : Element {
  attribute DOMString innerText;
  attribute DOMString hidden;
  undefined click();
  undefined focus();
  undefined blur();
  readonly attribute long offsetWidth;
  readonly attribute long offsetHeight;
  readonly attribute long offsetTop;
  readonly attribute long offsetLeft;
  readonly attribute long clientWidth;
  readonly attribute long clientHeight;
  attribute unrestricted double scrollTop;
  attribute unrestricted double scrollLeft;
  readonly attribute long scrollWidth;
  readonly attribute long scrollHeight;
  attribute DOMString style;
};
