/** Returns only a boolean from a page frame; field contents never cross to Aux. */
export const unsavedWorkScript = `(() => {
  if (document.designMode === "on" || document.querySelector('[contenteditable="true"], [contenteditable=""]')) return true;
  for (const field of document.querySelectorAll('input, textarea, select')) {
    if (field instanceof HTMLTextAreaElement) {
      if (field.value !== field.defaultValue) return true;
    } else if (field instanceof HTMLSelectElement) {
      const options = Array.from(field.options);
      const defaults = options.filter(option => option.defaultSelected);
      if (defaults.length ? options.some(option => option.selected !== option.defaultSelected)
        : field.multiple ? options.some(option => option.selected)
        : field.selectedIndex > 0) return true;
    } else if (field instanceof HTMLInputElement) {
      if (field.type === 'file') { if (field.files?.length) return true; }
      else if (field.type === 'checkbox' || field.type === 'radio') { if (field.checked !== field.defaultChecked) return true; }
      else if (!['hidden', 'button', 'submit', 'reset', 'image'].includes(field.type) && field.value !== field.defaultValue) return true;
    }
  }
  return false;
})()`;
