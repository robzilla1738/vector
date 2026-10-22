import { app } from './app';

// Next retains the original URL for rewrites. Route params identify the matched
// API path; normalize it before passing the request to Hono's fixed base path.
export async function serveApi(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  const url = new URL(request.url);
  url.pathname = '/api/v1/' + path.map(encodeURIComponent).join('/');
  const headers = new Headers(request.headers);
  // Vercel evaluates standard conditional headers against the response, which
  // can turn a successful CAS write into 304. Adapt only the cloud transport;
  // Hono still validates the original standard CAS semantics.
  for (const name of ['If-Match', 'If-None-Match']) {
    const value = headers.get('X-Aux-' + name);
    if (value === null) continue;
    if (!['PUT', 'DELETE'].includes(request.method) || headers.has(name)) {
      return Response.json({ error: 'Ambiguous conditional request.' }, { status: 400 });
    }
    headers.set(name, value);
    headers.delete('X-Aux-' + name);
  }
  return app.fetch(new Request(url, new Request(request, { headers })));
}
