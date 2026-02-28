const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

function encodeEntities(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch] || ch);
}

export function sanitizeText(input: string): string {
  return encodeEntities(input).trim();
}

export function sanitizeHtml(input: string): string {
  return encodeEntities(input).trim();
}

export function escapeForAttribute(input: string): string {
  return encodeEntities(input);
}
