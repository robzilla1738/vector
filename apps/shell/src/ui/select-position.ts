type Position = { left: number; top: number };

function selectedPosition(select: HTMLSelectElement, selected: HTMLOptionElement): Position | undefined {
  const view = select.ownerDocument.defaultView!;
  const options = [...select.options];
  if (select.querySelector("optgroup, hr") || !options.length) return;
  const picker = view.getComputedStyle(select, "::picker(select)");
  const width = Number.parseFloat(picker.width);
  const height = Number.parseFloat(picker.height);
  const topInset = Number.parseFloat(picker.paddingTop) + Number.parseFloat(picker.borderTopWidth);
  const bottomInset = Number.parseFloat(picker.paddingBottom) + Number.parseFloat(picker.borderBottomWidth);
  if (![width, height, topInset, bottomInset].every(Number.isFinite) || width <= 0 || height <= 0) return;
  const rows = options.map((option) => option.getBoundingClientRect());
  const first = rows[0]!;
  const contentHeight = rows.at(-1)!.bottom - first.top + topInset + bottomInset;
  const viewport = view.visualViewport;
  const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
  const topEdge = (viewport?.offsetTop ?? 0) + 8;
  const rightEdge = leftEdge + (viewport?.width ?? view.innerWidth) - 16;
  const bottomEdge = topEdge + (viewport?.height ?? view.innerHeight) - 16;
  // Scrolling or partly laid-out lists keep Chromium's placement and scrolling.
  if (
    rows.some((row) => row.width <= 0 || row.height <= 0) ||
    Math.abs(contentHeight - height) > 2 ||
    height > bottomEdge - topEdge ||
    width > rightEdge - leftEdge
  )
    return;
  const trigger = select.getBoundingClientRect();
  const row = selected.getBoundingClientRect();
  return {
    left: Math.max(leftEdge, Math.min(trigger.left - 4, rightEdge - width)),
    top: Math.max(
      topEdge,
      Math.min(
        (trigger.top + trigger.bottom - row.top - row.bottom) / 2 + first.top - topInset,
        bottomEdge - height,
      ),
    ),
  };
}

function applyPosition(select: HTMLSelectElement, position: Position) {
  const attribute = "data-ui-select-positioned";
  const previousAttribute = select.getAttribute(attribute);
  const properties = (
    [
      ["--ui-select-picker-left", `${position.left}px`],
      ["--ui-select-picker-top", `${position.top}px`],
    ] as const
  ).map(([name, value]) => ({
    name,
    value,
    previous: select.style.getPropertyValue(name),
    priority: select.style.getPropertyPriority(name),
  }));
  for (const { name, value } of properties) select.style.setProperty(name, value);
  select.setAttribute(attribute, "");
  return () => {
    // Restore only the values this opening still owns.
    for (const { name, value, previous, priority } of properties) {
      if (select.style.getPropertyValue(name) !== value) continue;
      if (previous) select.style.setProperty(name, previous, priority);
      else select.style.removeProperty(name);
    }
    if (select.getAttribute(attribute) === "") {
      if (previousAttribute === null) select.removeAttribute(attribute);
      else select.setAttribute(attribute, previousAttribute);
    }
  };
}

/** Position a small native picker once per opening; never own input, selection or focus. */
export function alignNativeSelect(select: HTMLSelectElement) {
  const view = select.ownerDocument.defaultView!;
  let live = true;
  let blocked = false;
  let frame: number | undefined;
  let opening: { selected: HTMLOptionElement; value: string; restore(): void } | undefined;
  const isOpen = () => select.matches(":open");
  const retire = () => {
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    frame = undefined;
    opening?.restore();
    opening = undefined;
  };
  const invalidate = () => {
    retire();
    blocked = isOpen();
  };
  const sync = () => {
    if (!live) return;
    if (!isOpen()) {
      retire();
      blocked = false;
    } else if (
      !select.isConnected ||
      select.disabled ||
      select.multiple ||
      select.hasAttribute("size") ||
      !select.getClientRects().length ||
      (opening && (select.value !== opening.value || select.selectedOptions[0] !== opening.selected))
    )
      invalidate();
  };
  const afterNativeInput = () => {
    sync();
    if (!opening || frame !== undefined) return;
    const original = opening;
    const requested = view.requestAnimationFrame(() => {
      if (!live || opening !== original || frame !== requested) return;
      frame = undefined;
      sync();
    });
    frame = requested;
  };
  const onFocus = (event: FocusEvent) => {
    sync();
    if (blocked || opening || !isOpen() || !(event.target instanceof HTMLOptionElement)) return;
    const selected = select.selectedOptions[0];
    if (!selected) return;
    observer.takeRecords();
    const position = selectedPosition(select, selected);
    opening = {
      selected,
      value: select.value,
      restore: position ? applyPosition(select, position) : () => {},
    };
  };
  const onReset = (event: Event) => {
    if (event.target === select.form) invalidate();
  };
  const observer = new MutationObserver((records) => {
    if (
      opening &&
      records.some(
        (record) => !(record.target instanceof Element && record.target.closest("selectedcontent")),
      )
    )
      invalidate();
  });
  observer.observe(select, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["disabled", "hidden", "multiple", "size", "value", "selected", "label"],
  });
  const events = ["input", "change", "keydown", "pointerdown", "click", "focusout"] as const;
  select.addEventListener("focusin", onFocus);
  for (const event of events) select.addEventListener(event, afterNativeInput, true);
  select.ownerDocument.addEventListener("reset", onReset, true);
  view.addEventListener("resize", invalidate);
  view.addEventListener("scroll", invalidate, true);
  view.addEventListener("blur", invalidate);
  view.visualViewport?.addEventListener("resize", invalidate);
  view.visualViewport?.addEventListener("scroll", invalidate);
  return {
    sync,
    dispose() {
      live = false;
      retire();
      observer.disconnect();
      select.removeEventListener("focusin", onFocus);
      for (const event of events) select.removeEventListener(event, afterNativeInput, true);
      select.ownerDocument.removeEventListener("reset", onReset, true);
      view.removeEventListener("resize", invalidate);
      view.removeEventListener("scroll", invalidate, true);
      view.removeEventListener("blur", invalidate);
      view.visualViewport?.removeEventListener("resize", invalidate);
      view.visualViewport?.removeEventListener("scroll", invalidate);
    },
  };
}
