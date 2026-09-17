[Exposed=Window]
interface HTMLFormElement : HTMLElement {
  undefined submit();
  undefined reset();
  boolean checkValidity();
  boolean reportValidity();
};

[Exposed=Window]
interface HTMLInputElement : HTMLElement {
  attribute DOMString value;
  attribute DOMString type;
  attribute boolean checked;
  attribute boolean disabled;
  boolean checkValidity();
  undefined select();
};

[Exposed=Window]
interface HTMLButtonElement : HTMLElement {
  attribute boolean disabled;
  attribute DOMString type;
  undefined click();
};
