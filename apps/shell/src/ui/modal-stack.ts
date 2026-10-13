export const ownedDialogs = new Set<HTMLDialogElement>();

/** Current owned modal; undefined means none, null means an unowned native modal is present. */
export const topModal = () => {
  // Fallback DOMs can expose dialog.open without implementing the native top layer.
  const nativeModalState =
    typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("selector(:modal)");
  if (
    nativeModalState &&
    [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")].some((item) => !ownedDialogs.has(item))
  )
    return null;
  return [...ownedDialogs].findLast((item) => item.open && item.isConnected);
};
