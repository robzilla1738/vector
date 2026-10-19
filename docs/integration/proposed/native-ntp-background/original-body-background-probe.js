
(() => {
  const body = document.body;
  if (!body) {
    return false;
  }
  const color = getComputedStyle(body).backgroundColor;
  if (typeof color !== 'string' || color.trim().length === 0) {
    return false;
  }

  const normalized = color.trim().toLowerCase();
  if (normalized === 'transparent' || normalized === 'rgba(0, 0, 0, 0)') {
    return false;
  }

  const parseAlpha = (value) => {
    if (!value) {
      return 1;
    }
    const trimmed = value.trim();
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isFinite(parsed)) {
      return 1;
    }
    return trimmed.endsWith('%') ? parsed / 100 : parsed;
  };
  const rgbaMatch =
      normalized.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)$/);
  const slashAlphaMatch =
      normalized.match(/^(?:rgb|rgba|color)\([^/]+\/\s*([^)]+)\)$/);
  const alpha = parseAlpha(
      (rgbaMatch && rgbaMatch[1]) ||
      (slashAlphaMatch && slashAlphaMatch[1]));
  return alpha >= 0.5;
})()
