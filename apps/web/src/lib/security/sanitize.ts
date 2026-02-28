const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /<script[^>]*>[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_RE = /\bon\w+\s*=\s*["'][^"']*["']/gi;

export function sanitizeText(input: string): string {
  return input
    .replace(SCRIPT_RE, '')
    .replace(EVENT_HANDLER_RE, '')
    .replace(HTML_TAG_RE, '')
    .trim();
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(SCRIPT_RE, '')
    .replace(EVENT_HANDLER_RE, '')
    .trim();
}

export function escapeForAttribute(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
