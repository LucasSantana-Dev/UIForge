// Polyfill Web Fetch API globals before any modules load.
// Node 22 has these built-in but Jest's jsdom environment doesn't expose them at module load time.
// This runs via setupFiles (before module evaluation) so next/server can extend Request.
const nodeGlobals = globalThis;
if (typeof nodeGlobals.Request === 'undefined' && typeof Request !== 'undefined') {
  nodeGlobals.Request = Request;
}
if (typeof nodeGlobals.Response === 'undefined' && typeof Response !== 'undefined') {
  nodeGlobals.Response = Response;
}
if (typeof nodeGlobals.Headers === 'undefined' && typeof Headers !== 'undefined') {
  nodeGlobals.Headers = Headers;
}
if (typeof nodeGlobals.fetch === 'undefined' && typeof fetch !== 'undefined') {
  nodeGlobals.fetch = fetch;
}
