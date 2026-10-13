export default async function handler(req, res) {
  const incomingHeaders = {};
  for (const [k, v] of Object.entries(req.headers)) {
    incomingHeaders[k] = v;
  }

  let capturedUrl = '';
  let capturedHeaders = {};

  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    capturedUrl = url.toString();
    if (init?.headers) {
      const h = new Headers(init.headers);
      h.forEach((v, k) => { capturedHeaders[k] = v; });
    }
    return new Response(null, { status: 204 });
  };

  try {
    const mod = await import('@vercel/firewall');
    await mod.checkRateLimit('test-id', { headers: req.headers });
  } catch (e) {
    capturedUrl = 'ERROR: ' + e.message;
  } finally {
    globalThis.fetch = origFetch;
  }

  res.json({ incomingHeaders, capturedUrl, capturedHeaders });
}
