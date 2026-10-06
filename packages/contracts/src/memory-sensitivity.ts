/** Conservative metadata gate applied before any page text is captured for memory. */
export function memorySensitivityReason(rawUrl: string, title = ""): string | undefined {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "unrecognized page address";
  }
  if (url.protocol !== "https:" || url.username || url.password) return "non-secure or credentialed page";
  const host = url.hostname.toLocaleLowerCase();
  let path: string;
  try {
    path = decodeURIComponent(url.pathname).toLocaleLowerCase();
  } catch {
    return "unrecognized page address";
  }
  const heading = title.toLocaleLowerCase();
  if (
    /(?:^|[.-])(bank|banking|creditunion|health|healthcare|hospital|medical|clinic|patient|insurance)(?:[.-]|$)/u.test(
      host,
    ) ||
    /\b(?:bank|banking|medical|patient|health|hospital|clinic|insurance)\b/u.test(heading)
  )
    return "banking or health page";
  if (
    /(?:^|\/)(?:log[ -]?in|sign[ -]?in|auth|oauth|account|billing|checkout|payment|patient|medical|health|statements?)(?:\/|$|[._-])/u.test(
      path,
    ) ||
    /\b(?:log[ -]?in|sign[ -]?in|password|verification code)\b/u.test(heading)
  )
    return "login or account page";
  return undefined;
}

/** High-confidence signals in readable text, checked locally before persistence or prompt reuse. */
export function memoryContentSensitivityReason(text: string): string | undefined {
  const sample = text.slice(0, 65_536).toLocaleLowerCase();
  if (
    /\b(?:account|available|current) balance\b|\brouting number\b|\b(?:credit|debit) card number\b|\btransaction history\b|\b(?:bank|credit card) statement\b|\btax return\b/u.test(
      sample,
    )
  )
    return "financial account content";
  if (
    /\bmedical record\b|\bpatient (?:name|id|portal)\b|\blab (?:result|report)s?\b|\bprescription (?:detail|history|refill)s?\b|\bdiagnosis (?:code|history)\b/u.test(
      sample,
    )
  )
    return "health record content";
  if (
    /\b(?:enter|type|reset|change) (?:your |the )?password\b|\b(?:one.time|verification|security) code\b|\b(?:social security|passport) number\b/u.test(
      sample,
    )
  )
    return "credential or identity content";
  return undefined;
}
