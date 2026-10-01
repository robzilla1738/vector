/** Never follow redirects or send a journey bearer outside literal loopback. */
export function loopbackUrl(input) {
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol) || !['127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password)
    throw new Error('Journey RPC requires a literal loopback URL');
  return url;
}
export function validateDescriptor(descriptor) {
  if (!descriptor || !Number.isInteger(descriptor.port) || descriptor.port < 1 || descriptor.port > 65535 ||
      typeof descriptor.token !== 'string' || !descriptor.token.length)
    throw new Error('Invalid disposable runtime descriptor');
  if (descriptor.url) loopbackUrl(descriptor.url);
  if (descriptor.host && !['127.0.0.1', '::1', '[::1]'].includes(descriptor.host))
    throw new Error('Runtime descriptor host must be loopback');
  return descriptor;
}
export function createRpc(descriptorOrGetter, { timeoutMs } = {}) {
  return async function rpc(method, params = {}, options = {}) {
    if (typeof method !== 'string' || !method) throw new Error('RPC method required');
    const descriptor = validateDescriptor(await (typeof descriptorOrGetter === 'function' ? descriptorOrGetter() : descriptorOrGetter));
    const url = loopbackUrl(descriptor.url ?? `http://127.0.0.1:${descriptor.port}/rpc`);
    const deadline = options.timeoutMs ?? timeoutMs ?? (method === 'pages.open' ? 60_000 : ['pages.execute', 'pages.webmcp'].includes(method) ? 30_000 : 10_000);
    try {
      const response = await fetch(url, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(deadline),
        headers: { 'content-type': 'application/json', authorization: `Bearer ${descriptor.token}` },
        body: JSON.stringify({ method, params }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      if (!body || typeof body !== 'object' || Object.hasOwn(body, 'result') === Object.hasOwn(body, 'error'))
        throw new Error('Invalid HTTP RPC envelope');
      if (body.error) {
        const error = new Error(`${body.error.code}: ${body.error.message}`);
        error.code = body.error.code; error.data = body.error.data; throw error;
      }
      if (!Object.hasOwn(body, 'result')) throw new Error('RPC response has no result');
      return body.result;
    } catch (cause) {
      const error = new Error(`${method}: ${cause.message}`, { cause });
      if (cause.code) error.code = cause.code;
      if (cause.data !== undefined) error.data = cause.data;
      throw error;
    }
  };
}
