const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_RE = /\bon\w+=\s*["'][^"']*["']/gi;
const HTML_TAG_RE = /<[^>]*>/g;

export function sanitizeText(input: string): string {
  let result = input;
  for (let i = 0; i < 10; i++) {
    const next = result
      .replace(SCRIPT_RE, '')
      .replace(EVENT_HANDLER_RE, '')
      .replace(HTML_TAG_RE, '');
    if (next === result) break;
    result = next;
  }
  return result.trim();
}

export function sanitizeHtml(input: string): string {
  let result = input;
  for (let i = 0; i < 10; i++) {
    const next = result.replace(SCRIPT_RE, '').replace(EVENT_HANDLER_RE, '');
    if (next === result) break;
    result = next;
  }
  return result.trim();
}

export function escapeForAttribute(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
